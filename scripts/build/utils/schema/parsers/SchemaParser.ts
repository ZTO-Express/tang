import { resolve } from 'path'

import { ts, Node, Project, TypeNode } from 'ts-morph'

import { CommonTypeNames, DocTagNames } from '../types'

import {
  initialWidgetPropertyType,
  isExtensibleInterface,
  isPromiseFunctionNodeType,
  isWidgetInterface,
  tryJsonParse
} from '../util'
import type {
  DataOptionItem,
  Doc,
  DocRef,
  DocTags,
  SchemaInfo,
  WidgetProperty,
  WidgetPropertyType,
  WidgetSchema
} from '../types'
import type { SourceFile, ProjectOptions, InterfaceDeclaration, TypeElementTypes, JSDoc } from 'ts-morph'

export interface SchemaParserOptions {
  rootDir: string
  projectOptions?: Partial<ProjectOptions>
}

/** 结构上下文 */
export class SchemaParser {
  private _options: SchemaParserOptions

  readonly project: Project

  private _interfaceTypesCache: WeakMap<object, WidgetPropertyType> = new WeakMap()

  /** 构造函数 */
  constructor(options: SchemaParserOptions) {
    const projectOptions = {
      skipAddingFilesFromTsConfig: true,
      ...options.projectOptions,
      compilerOptions: {
        allowJs: true,
        declaration: true,
        emitDeclarationOnly: true,
        noEmitOnError: false,
        skipLibCheck: true,
        esModuleInterop: true,
        downlevelIteration: true,
        ...options.projectOptions?.compilerOptions
      }
    }

    this._options = { ...options, projectOptions }

    this.project = new Project(projectOptions)
  }

  /** 解析指定的原文件 */
  parseWidgetSourceFileAtPath(filePath: string) {
    if (!filePath.startsWith('/')) {
      filePath = resolve(this._options.rootDir, filePath)
    }

    const sourceFile = this.project.addSourceFileAtPath(filePath)

    const schemas = this.parseWidgetInterfaces(sourceFile)

    return schemas
  }

  /** 解析所有的微件接口 */
  parseWidgetInterfaces(sourceFile: SourceFile): WidgetSchema[] {
    const interfaces = sourceFile.getInterfaces()

    const baseName = sourceFile.getBaseNameWithoutExtension()

    const wSchemas: WidgetSchema[] = []

    interfaces.forEach(it => {
      if (isWidgetInterface(it)) {
        const result = this.parseSchema(it) as any
        if (!result) return

        if (!result.name) result.name = baseName

        wSchemas.push(result)
      }
    })

    // 默认微件名称为baseName
    if (wSchemas.length === 1 && !wSchemas[0]?.name) {
      wSchemas[0].name = baseName
    }

    return wSchemas
  }

  /** 解析结构 */
  parseSchema(itf: InterfaceDeclaration): SchemaInfo | undefined {
    const it = this.parseInterfaceType(itf)

    if (!it) return undefined

    const docTags = it.doc?.tags

    const _schema: SchemaInfo = {
      name: docTags?.widgetName || '',
      type: it.typeName,
      description: it.doc?.description,
      properties: it.properties,
      isExtensible: it.isExtensible,
      tags: docTags || {}
    }

    return _schema
  }

  /**
   * 解析参考类型节点
   * @param typeNode 类型节点
   * @param options 额外参数
   *   isInterface: 是否接口
   * @returns
   */
  parseTypeReferenceNode(typeNode: TypeNode, overrides?: Partial<WidgetPropertyType>): WidgetPropertyType | undefined {
    if (!TypeNode.isTypeReferenceNode(typeNode)) return

    const sourceFile = typeNode.getSourceFile()
    const typeNameText = typeNode.getTypeName().getText()

    let _refType: Partial<WidgetPropertyType> = {
      isTypeReference: true,
      typeName: typeNameText
    }

    let _refTypeNode: TypeNode | undefined = undefined

    let typeArguments: TypeNode[] | undefined = undefined

    switch (typeNameText) {
      case CommonTypeNames.RECORD:
        _refType.isRecord = true
        // 获取Record元素值类型
        typeArguments = typeNode.getTypeArguments()
        _refTypeNode = typeArguments ? typeArguments[1] : undefined
        break
      case CommonTypeNames.ARRAY:
        _refType.isArray = true
        // 获取Array元素类型
        typeArguments = typeNode.getTypeArguments()
        _refTypeNode = typeArguments ? typeArguments[0] : undefined
        break
      default:
        _refTypeNode = typeNode
        break
    }

    const _refTypeNameText = _refTypeNode?.getText()
    if (_refTypeNameText) {
      // 获取接口类型
      const ifdType = this.parseInterfaceTypeByName(sourceFile, _refTypeNameText)
      _refType = { ...ifdType, ..._refType }
    }

    _refType = initialWidgetPropertyType({ ..._refType, ...overrides })

    return _refType as WidgetPropertyType
  }

  /** 根据名称解析接口类型 */
  parseInterfaceTypeByName(sourceFile: SourceFile, name: string) {
    if (!sourceFile || !name) return undefined

    const itf = sourceFile.getInterface(name)
    if (!itf) return undefined

    return this.parseInterfaceType(itf)
  }

  /** 解析接口类型 */
  parseInterfaceType(itf: InterfaceDeclaration | undefined): WidgetPropertyType | undefined {
    if (!itf) return undefined

    if (!ts.isInterfaceDeclaration(itf.compilerNode)) return undefined

    let propType = this._interfaceTypesCache.get(itf)
    if (propType) return propType

    propType = initialWidgetPropertyType()
    propType.typeName = itf.getName()
    propType.isInterface = true // 是否接口

    // 当前接口是否可扩展
    propType.isExtensible = isExtensibleInterface(itf)

    // 解析接口属性
    propType.properties = itf.getMembers().map(it => {
      return this.getTypeElementProperty(it)
    })

    // 文档
    propType.doc = this.parseJsDoc(itf.getJsDocs())

    // 加入缓存
    this._interfaceTypesCache.set(itf, propType)

    return propType
  }

  /** 解析 TypeLiteral */
  praseTypeLiteral(typeNode: TypeNode): WidgetPropertyType | undefined {
    if (!TypeNode.isTypeLiteralNode(typeNode)) return

    const propType = initialWidgetPropertyType({ isTypeLiteral: true })

    propType.properties = typeNode.getMembers().map(it => {
      return this.getTypeElementProperty(it)
    })

    return propType
  }

  /** TODO: 解析方法类型 */
  parseFunctionType() {}

  /** TODO: 解析 UnionType */
  praseUnionType() {}

  /**
   * 获取类型元素属性类型
   * @param members
   */
  getTypeElementProperty(typeElement: TypeElementTypes): WidgetProperty {
    const _struct = typeElement.getStructure() as any
    const _doc = this.parseJsDoc(typeElement.getJsDocs())

    // 优先获取文档参考类型
    let _refType = _doc?.tags?.refType

    if (!_refType) _refType = this.getTypeElementPropertyType(typeElement)

    return {
      name: _struct.name,
      type: _struct.type,
      readonly: _struct.isReadonly === true,
      required: _struct.hasQuestionToken === true,
      doc: _doc,
      tags: _doc?.tags || {},
      refs: _doc?.tags.refs || [],
      description: _doc?.description,
      options: _doc?.tags?.options,
      optionsText: _doc?.tags?.optionsText,
      default: _doc?.tags?.default,
      defaultText: _doc?.tags?.defaultText,
      referenceType: _refType,
      isExtensible: _refType?.isExtensible === true,
      isFunction: _refType?.isFunction === true,
      properties: _refType?.properties || []
    }
  }

  /** 获取类型元素参考类型 */
  getTypeElementPropertyType(typeElement: TypeElementTypes | undefined): WidgetPropertyType | undefined {
    if (!typeElement) return undefined

    const _ts = ts

    let typeNode: TypeNode | undefined = undefined

    if (Node.isPropertySignature(typeElement)) {
      typeNode = typeElement.getTypeNode()
    } else if (Node.isMethodSignature(typeElement)) {
    }

    if (!typeNode) return undefined

    const propType = this.getTypeNodePropertyType(typeNode)

    return propType
  }

  /** 获取类型阶段属性类型 */
  getTypeNodePropertyType(node: TypeNode): WidgetPropertyType | undefined {
    let propType: WidgetPropertyType | undefined = undefined

    if (TypeNode.isArrayTypeNode(node)) {
      // Array类型（prop: T[]）
      propType = this.parseTypeReferenceNode(node.getElementTypeNode(), {
        isArray: true
      })
    } else if (TypeNode.isFunctionTypeNode(node)) {
      // Function类型 (prop: (args) => T)
      propType = initialWidgetPropertyType({ isFunction: true })
      propType.isPromiseFunction = isPromiseFunctionNodeType(node)

      // TODO: 后期可以考虑解析参数类型及返回类型
      // const funcParameters = _typeNode.getParameters()
      // const returnTypeNode = _typeNode.getReturnTypeNode()
    } else if (TypeNode.isTypeReferenceNode(node)) {
      propType = this.parseTypeReferenceNode(node)
    } else if (TypeNode.isTypeLiteralNode(node)) {
      // 表达式类型 ({ prop1: T1, prop2: T2 })
      propType = this.praseTypeLiteral(node)
    } else if (TypeNode.isUnionTypeNode(node)) {
      // 分析Union类型, refs:暂不分析
      propType = initialWidgetPropertyType({ isUnionType: true })
    }

    return propType
  }

  /** 解析Js文档 */
  parseJsDoc(jsDoc?: JSDoc | JSDoc[]): Doc | undefined {
    let _jsDoc: JSDoc | undefined

    if (Array.isArray(jsDoc)) {
      _jsDoc = jsDoc[jsDoc.length - 1]
    } else {
      _jsDoc = jsDoc
    }

    if (!_jsDoc) return

    const sourceFile = _jsDoc.getSourceFile()

    const tags: DocTags = {}

    _jsDoc.getTags().forEach(it => {
      const name = (it.getTagName() || '').trim()
      const text = (it.getCommentText() || '').trim()

      this.prarseDocTag(name, text, sourceFile, tags)
    })

    const doc: Doc = {
      description: _jsDoc.getCommentText(),
      tags
    }

    return doc
  }

  /** 解析文档tag */
  prarseDocTag(name: string, text: string, sourceFile: SourceFile, tags: DocTags) {
    if (!name) return

    // 默认值特殊处理
    switch (name) {
      case DocTagNames.WIDGET:
        tags.isWidget = true
        tags.widgetName = text
        break
      case DocTagNames.DEFAULT:
        tags[name] = this.parseJsDocValue(text)
        tags.defaultText = text
        break
      case DocTagNames.OPTIONS:
        tags[name] = this.parseJsDocOptions(text)
        tags.optionsText = text
        break
      case DocTagNames.REF_TYPE:
        tags[name] = this.parseJsDocRefType(sourceFile, text)
        tags.refTypeText = text
        break
      case DocTagNames.REFS:
        tags[name] = this.parseJsDocRefs(text)
        tags.refsText = text
        break
      default:
        tags[name] = text
        break
    }
  }

  /** 解析参考类型 */
  parseJsDocRefType(sourceFile: SourceFile, refTypeName: string): WidgetPropertyType | undefined {
    const refType = this.parseInterfaceTypeByName(sourceFile, refTypeName)
    return refType
  }

  /**
   * 解析多个参考（以|分割）
   * @param refs
   */
  parseJsDocRefs(refs: string) {
    if (!refs) return []

    const _refs = refs.split('|').reduce((col, cur) => {
      col.push(this.parseJsDocRef(cur))
      return col
    }, [] as DocRef[])

    return _refs
  }

  /** 解析参考 */
  parseJsDocRef(ref: string): DocRef {
    return { ref }
  }

  /**
   * 解析多个值（以|分割）
   * @param vals
   * @returns
   */
  parseJsDocOptions(opts: string): DataOptionItem[] {
    opts = (opts || '').trim()

    if (!opts) return []

    if (opts.startsWith('[')) {
      return tryJsonParse(opts)
    } else if (opts.startsWith('{')) {
      const obj = tryJsonParse(opts)
      if (!obj) return []

      const _opts = Object.keys(obj).reduce((col, key) => {
        col.push({ value: key, label: obj[key] })
        return col
      }, [] as DataOptionItem[])

      return _opts
    }

    const _opts = opts.split('|').reduce((col, cur) => {
      const item = this.parseJsDocOption(cur)
      if (item) col.push(item)
      return col
    }, [] as DataOptionItem[])

    return _opts
  }

  /** 解析文档值 */
  parseJsDocOption(opt: string): DataOptionItem | undefined {
    if (!opt) return undefined

    const _item: any = undefined

    if (opt !== undefined && opt !== 'undefined') {
      const parts = opt.split(':')

      const val = this.parseJsDocValue(parts[0])

      if (parts.length === 1) {
        return { value: val, label: parts[0] }
      } else {
        return { value: val, label: parts[1] }
      }
    }

    return _item
  }

  /** 解析文档值 */
  parseJsDocValue(val: string) {
    let _val: any = undefined

    if (val !== undefined && val !== 'undefined') {
      try {
        _val = JSON.parse(val)
      } catch (ex: any) {
        _val = val
      }
    }

    return _val
  }
}
