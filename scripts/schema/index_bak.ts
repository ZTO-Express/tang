import path, { resolve } from 'path'
import * as vueCompiler from '@vue/compiler-sfc'
import fse from 'fs-extra'
import glob from 'fast-glob'
import { bold } from 'chalk'
import {
  ts,
  Project,
  SourceFile,
  ProjectOptions,
  InterfaceDeclaration,
  JSDoc,
  SyntaxKind,
  TypeNode,
  Type,
  TypeElementTypes
} from 'ts-morph'

import { green, red, yellow } from '../build/utils/log'
import { excludeFiles } from '../build/utils/pkg'
import { typingsRoot } from '../build/utils/paths'
import { readBuildConfig } from '../build/utils/config'
import {
  CommonTypeNames,
  Doc,
  DocRef,
  DocTagNames,
  DocTags,
  SchemaInfo,
  WidgetProperty,
  WidgetPropertyType,
  WidgetSchema
} from './types'
import _ from 'lodash'

import { WidgetSchemaParser } from './parsers/SchemaParser'

/** 生产Schema文件 */
export async function generateSchemas(pkgDir: string, options: Partial<ProjectOptions>) {
  const projectOptions = await readBuildConfig(pkgDir, 'tsconfig')

  const widgetSchemaParser = new WidgetSchemaParser(projectOptions)

  const project = new Project(projectOptions)

  const sourceFile = project.addSourceFileAtPath(resolve(pkgDir, 'src/widgets/crud/WCrud.ts'))

  const result = parseWidgetInterfaces(sourceFile)

  console.log('end')

  // const filePaths = excludeFiles(
  //   await glob(['src/**/*.{js,ts,vue}'], {
  //     cwd: pkgDir,
  //     absolute: true,
  //     onlyFiles: true
  //   })
  // )

  // const typingPaths = await glob(['**/*.d.ts'], {
  //   cwd: typingsRoot,
  //   absolute: true,
  //   onlyFiles: true
  // })

  // const sourceFiles: SourceFile[] = []

  // await Promise.all([
  //   ...filePaths.map(async file => {
  //     if (file.endsWith('.vue')) {
  //       const content = await fse.readFile(file, 'utf-8')
  //       const sfc = vueCompiler.parse(content)
  //       const { script, scriptSetup } = sfc.descriptor
  //       if (script || scriptSetup) {
  //         let content = ''
  //         let isTS = false
  //         if (script && script.content) {
  //           content += script.content
  //           if (script.lang === 'ts') isTS = true
  //         }
  //         if (scriptSetup) {
  //           const compiled = vueCompiler.compileScript(sfc.descriptor, {
  //             id: 'xxx'
  //           })
  //           content += compiled.content
  //           if (scriptSetup.lang === 'ts') isTS = true
  //         }
  //         const sourceFile = project.createSourceFile(
  //           path.relative(process.cwd(), file) + (isTS ? '.ts' : '.js'),
  //           content
  //         )
  //         sourceFiles.push(sourceFile)
  //       }
  //     } else {
  //       const sourceFile = project.addSourceFileAtPath(file)
  //       sourceFiles.push(sourceFile)
  //     }
  //   }),

  //   ...typingPaths.map(async file => {
  //     const sourceFile = project.addSourceFileAtPath(file)
  //     sourceFiles.push(sourceFile)
  //   })
  // ])

  // const diagnostics = project.getPreEmitDiagnostics()
  // console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))

  // await project.emit({
  //   emitOnlyDtsFiles: true
  // })

  // const tasks = sourceFiles.map(async sourceFile => {
  //   const relativePath = path.relative(pkgDir, sourceFile.getFilePath())
  //   yellow(`Generating definition for file: ${bold(relativePath)}`)

  //   const emitOutput = sourceFile.getEmitOutput()
  //   const emitFiles = emitOutput.getOutputFiles()
  //   if (emitFiles.length === 0) {
  //     red(`Emit no file: ${bold(relativePath)}`)
  //     return
  //   }

  //   const _tasks = emitFiles.map(async outputFile => {
  //     const filepath = outputFile.getFilePath()
  //     await fse.mkdir(path.dirname(filepath), {
  //       recursive: true
  //     })

  //     await fse.writeFile(filepath, outputFile.getText(), 'utf8')

  //     green(`Definition for file: ${bold(relativePath)} generated`)
  //   })

  //   await Promise.all(_tasks)
  // })

  // await Promise.all(tasks)
}

/** 解析结构接口 */
export function parseWidgetInterfaces(sourceFile: SourceFile): WidgetSchema[] {
  const interfaces = sourceFile.getInterfaces()

  const baseName = sourceFile.getBaseNameWithoutExtension()

  const wSchemas: WidgetSchema[] = []

  interfaces.forEach(it => {
    if (isWidgetInterface(it)) {
      const result = parseSchemaInfo(it) as any
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

/** 判断是否Widget接口 */
export function isWidgetInterface(it: InterfaceDeclaration) {
  // 微件接口必须对外导出
  if (!it.isExported) return false

  const jsDoc = parseJsDoc(it.getJsDocs()[0])
  return jsDoc?.tags?.isWidget === true
}

/** 判断是否可扩展类型节点类型 */
export function isExtensibleInterface(it: InterfaceDeclaration) {
  const isExtensible = it.getHeritageClauses().some(it => {
    return it.getTypeNodes().some(_it => _it.getText() === CommonTypeNames.EXTENSIBLE)
  })

  return isExtensible
}

/** 判断是否可扩展类型节点类型 */
export function isPromiseFunctionNodeType(typeNode: ts.Node) {
  return (typeNode as any)?.type?.typeName?.getText() === CommonTypeNames.PROMISE
}

/** 解析结构接口 */
export function parseSchemaInfo(itf: InterfaceDeclaration): SchemaInfo | undefined {
  const it = parseInterfaceType(itf)

  if (!it) return undefined

  const docTags = it.doc?.tags

  const _schema: SchemaInfo = {
    name: docTags?.widgetName || '',
    type: it.typeName,
    extensible: it.isExtensible,
    description: it.doc?.description,
    properties: it.properties,
    tags: docTags || {}
  }

  return _schema
}

/** 获取全新初始化属性类型 */
export function initialWidgetPropertyType(initialData?: Partial<WidgetPropertyType>): WidgetPropertyType {
  return {
    typeName: '',
    isTypeReference: true,
    isArray: false,
    isRecord: false,
    isInterface: false,
    isLiteralExpression: false,
    isFunction: false,
    isUnionType: false,
    isPromiseFunction: false,

    isExtensible: false,
    properties: [],

    ...initialData
  }
}

/** 解析接口类型 */
export function parseInterfaceType(itf: InterfaceDeclaration): WidgetPropertyType | undefined {
  if (!ts.isInterfaceDeclaration(itf.compilerNode)) return undefined

  const propType = initialWidgetPropertyType()

  propType.typeName = itf.getName()

  // 是否接口
  propType.isInterface = true

  // 当前接口是否可扩展
  propType.isExtensible = isExtensibleInterface(itf)

  // 解析接口属性

  const members = itf.getMembers()

  // 解析接口成员
  propType.properties = members.map(it => {
    const _it = it as any

    const _struct = it.getStructure() as any
    const _doc = parseJsDoc(it.getJsDocs()[0])

    const _refType: WidgetPropertyType | undefined = getReferenceTypePropertyType(it)

    if (_refType) {
      _refType.doc = _doc
    }

    if (ts.isMethodSignature(it.compilerNode)) {
      _struct.name = _it.getName()
      _struct.type = _it.getText()
    }

    return {
      name: _struct.name,
      type: _struct.type,
      description: _doc?.description,
      readonly: _struct.isReadonly === true,
      required: _struct.hasQuestionToken === true,
      doc: _doc,
      tags: _doc?.tags || {},
      refs: _doc?.tags.refs || [],
      optionalValues: _doc?.tags?.optionalValues,
      defaultValue: _doc?.tags?.defaultValue,
      referenceType: _refType,
      extensible: _refType?.isExtensible === true,
      properties: _refType?.properties || []
    }
  })

  // 文档
  propType.doc = parseJsDoc(itf.getJsDocs()[0])

  return propType
}

/** 获取属性参考类型 */
export function getReferenceTypePropertyType(it: TypeElementTypes | undefined): WidgetPropertyType | undefined {
  if (!it) return undefined

  const _ts = ts
  const _it = it as any

  const _type = it.getType()
  const _typeNode = _it?.getTypeNode && _it.getTypeNode()

  let _refType: WidgetPropertyType | undefined = undefined

  if (_ts.isMethodSignature(it.compilerNode)) {
    // 方法签名

    _refType = initialWidgetPropertyType({ isFunction: true })
    _refType.typeName = it.getText()
    _refType.isPromiseFunction = isPromiseFunctionNodeType(it.compilerNode)

    // TODO: 后期可以考虑解析参数类型及返回类型
    // const funcParameters = it.getParameters()
    // const returnTypeNode = it.getReturnTypeNode()
  } else if (_typeNode) {
    const _typeCompilerNode = _typeNode.compilerNode

    if (_ts.isTypeReferenceNode(_typeCompilerNode)) {
      // 参考类型
      if (_type.isInterface()) {
        debugger
      } else {
        _refType = parseTypeReferenceNode(_typeCompilerNode)
      }
    } else if (_ts.isArrayTypeNode(_typeCompilerNode)) {
      // Array类型（prop: T[]）
      _refType = initialWidgetPropertyType({ isArray: true })
      _refType.properties = parseTypeNodeProperties(_typeNode.elementType)
    } else if (_ts.isFunctionTypeNode(_typeCompilerNode)) {
      // Function类型 (prop: (args) => T)
      _refType = initialWidgetPropertyType({ isFunction: true })
      _refType.isPromiseFunction = isPromiseFunctionNodeType(_typeCompilerNode)

      // TODO: 后期可以考虑解析参数类型及返回类型
      // const funcParameters = _typeNode.getParameters()
      // const returnTypeNode = _typeNode.getReturnTypeNode()
    } else if (_ts.isLiteralExpression(_typeCompilerNode)) {
      // 文本表达式 ({ prop1: T1, prop2: T2 })
      _refType = initialWidgetPropertyType({ isTypeLiteral: true })
      _refType.properties = parseTypeNodeProperties(_typeCompilerNode)
    } else if (_ts.isUnionTypeNode(_typeCompilerNode)) {
      // 分析Union类型, refs:暂不分析
      _refType = initialWidgetPropertyType({ isUnionType: true })
    }
  }

  return _refType
}

/**
 * 解析参考类型节点
 * @param typeNode 类型节点
 * @param options 额外参数
 *   isInterface: 是否接口
 * @returns
 */
export function parseTypeReferenceNode(typeNode: ts.Node): WidgetPropertyType | undefined {
  if (!ts.isTypeReferenceNode(typeNode)) return

  const typeNameText = typeNode.typeName.getText()

  const _refType: WidgetPropertyType = initialWidgetPropertyType({
    isTypeReference: true,
    typeName: typeNameText
  })

  let _refTypeNode: ts.Node | undefined = undefined

  switch (typeNameText) {
    case CommonTypeNames.RECORD:
      _refType.isRecord = true
      _refType.isExtensible = true // Record可扩展
      // 获取Record元素值类型
      _refTypeNode = typeNode.typeArguments ? typeNode.typeArguments[1] : undefined
      break
    case CommonTypeNames.ARRAY:
      _refType.isArray = true
      // 获取Array元素类型
      _refTypeNode = typeNode.typeArguments ? typeNode.typeArguments[0] : undefined
      break
  }

  if (_refTypeNode) {
    _refType.properties = parseTypeNodeProperties(_refTypeNode)
  }

  return _refType
}

/** 解析参考类型节点 */
export function parseTypeNodeProperties(typeNode?: ts.Node): WidgetProperty[] {
  if (!typeNode) return []

  debugger

  return []
}

/** 解析Literal类型属性 */
export function parseLiteralProperties() {}

/** 解析jsDoc注释 */
export function parseJsDoc(jsDoc?: JSDoc): null | Doc {
  if (!jsDoc) return null

  const tags: DocTags = {}

  jsDoc.getTags().forEach(it => {
    const name = (it.getTagName() || '').trim()
    const text = (it.getCommentText() || '').trim()

    if (!name) return

    // 默认值特殊处理
    switch (name) {
      case DocTagNames.WIDGET:
        tags.isWidget = true
        tags.widgetName = text
        break
      case DocTagNames.DEFAULT:
        tags[name] = parseJsDocValue(text)
        tags.defaultText = text
        break
      case DocTagNames.VALUES:
        tags[name] = parseJsDocValues(text)
        tags.valuesText = text
        break
      case DocTagNames.REF_TYPE:
        tags[name] = parseJsDocRefType(text, jsDoc)
        tags.refTypeText = text
        break
      case DocTagNames.REFS:
        tags[name] = parseJsDocRefs(text)
        tags.refsText = text
        break
      default:
        tags[name] = text
        break
    }
  })

  const doc: Doc = {
    description: jsDoc.getCommentText(),
    comment: jsDoc.getComment(),
    tags
  }

  return doc
}

/** 解析参考类型 */
export function parseJsDocRefType(refTypeName: string, jsDoc: JSDoc): WidgetPropertyType | undefined {
  const it = jsDoc.getSourceFile().getInterface(refTypeName)

  if (!it) return undefined

  const refType = parseInterfaceType(it)

  return refType
}

/**
 * 解析多个参考（以|分割）
 * @param refs
 */
export function parseJsDocRefs(refs: string) {
  if (!refs) return []

  const _refs = refs.split('|').reduce((col, cur) => {
    col.push(parseJsDocRef(cur))
    return col
  }, [] as DocRef[])

  return _refs
}

/** 解析参考 */
export function parseJsDocRef(ref: string): DocRef {
  return { ref }
}

/**
 * 解析多个值（以|分割）
 * @param vals
 * @returns
 */
export function parseJsDocValues(vals: string) {
  if (!vals) return []

  const _vals = vals.split('|').reduce((col, cur) => {
    col.push(parseJsDocValue(cur))
    return col
  }, [] as any[])

  return _vals
}

/** 解析文档值 */
export function parseJsDocValue(val: string) {
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
