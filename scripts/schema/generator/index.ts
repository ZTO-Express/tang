import { resolve } from 'path'
import { isBoolean } from 'lodash'
import deepmerge from 'deepmerge'
import fse from 'fs-extra'
import {
  Schema,
  createProgram,
  createParser,
  SchemaGenerator,
  createFormatter,
  NodeParser,
  SubNodeParser,
  ExposeNodeParser,
  AnnotatedNodeParser,
  ExtendedAnnotationsReader,
  DEFAULT_CONFIG as TJS_DEFAULT_CONFIG
} from 'ts-json-schema-generator'

import { getSchemaDefinition } from '../utils'
import { SchemaTags } from '../consts'

import { FunctionTypeFormatter, AnnotatedTypeFormatter, EnumTypeFormatter } from './formatters'
import { TypeReferenceNodeParser, ExpressionWithTypeArgumentsNodeParser, EnumNodeParser } from './parsers'

import type { SchemaGenerateOptions } from '../types'

/**
 * 生产json schema
 * @param pkgDir 包目录
 * @param options 生成选项
 * @returns
 */
export async function generateJsonSchema(pkgDir: string, options?: SchemaGenerateOptions) {
  const tsconfigPath = options?.tsconfigPath || resolve(pkgDir, 'tsconfig.json')
  const entryPath = options?.entry || resolve(pkgDir, 'schemas/index.ts')
  const schemaType = options?.type || '*'

  if (!fse.existsSync(entryPath)) {
    throw new Error('未找到入口文件。')
  }

  const config = {
    path: entryPath,
    tsconfig: tsconfigPath,
    skipTypeCheck: true, // 不进行类型检查
    extraTags: [...SchemaTags],
    type: schemaType // 需要解析的类型名称
  }

  // 创建 ts 项目
  const program = createProgram(config)

  // 构建格式化器
  const formatter = createFormatter(config, (fmt, circularReferenceTypeFormatter) => {
    // 添加自定义类型格式化器
    fmt.addTypeFormatter(new FunctionTypeFormatter())
    fmt.addTypeFormatter(new EnumTypeFormatter())
    fmt.addTypeFormatter(new AnnotatedTypeFormatter(circularReferenceTypeFormatter))
  })

  const mergedConfig = { ...TJS_DEFAULT_CONFIG, ...config }

  function withExpose(nodeParser: SubNodeParser): SubNodeParser {
    return new ExposeNodeParser(typeChecker, nodeParser, mergedConfig.expose, mergedConfig.jsDoc)
  }

  function withJsDoc(nodeParser: SubNodeParser): SubNodeParser {
    const extraTags = new Set(mergedConfig.extraTags)
    return new AnnotatedNodeParser(nodeParser, new ExtendedAnnotationsReader(typeChecker, extraTags))
  }

  // 构建解析器
  const typeChecker = program.getTypeChecker()
  const parser = createParser(program, config, prs => {
    prs.addNodeParser(withExpose(withJsDoc(new EnumNodeParser(typeChecker))))
    prs.addNodeParser(new TypeReferenceNodeParser(typeChecker, prs as unknown as NodeParser))
    prs.addNodeParser(new ExpressionWithTypeArgumentsNodeParser(typeChecker, prs as unknown as NodeParser))
  })

  // 构建生成器
  const generator = new SchemaGenerator(program, parser, formatter, config)

  // 创建schema
  const schema = generator.createSchema(config.type)

  /** 合并参考节点 */
  const schemaDefinitions = schema.definitions
  if (schemaDefinitions) {
    Object.entries(schemaDefinitions).forEach(([name, def], index) => {
      // const def = schemaDefinitions[key] as ZPageJsonDefinition
      const jsonDef = def as any

      if (jsonDef) {
        if (!jsonDef.name) jsonDef.name = name
        if (!jsonDef.index) jsonDef.index = index
      }

      // 格式化节点
      normalizeSchemaNode(jsonDef)

      schemaDefinitions[name] = mergeRefNode(schemaDefinitions[name], schema)
    })
  }

  return schema
}

/**
 * 规范化schema节点(主要是属性)
 */
function normalizeSchemaNode(node: any, cache: any[] = []) {
  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.node === node)
  if (hit) return node

  // 将node放入缓存以备后续检查循环引用
  cache.push({ node })

  const { properties, required } = node

  if (properties) {
    Object.entries(properties).forEach(([name, prop], index) => {
      const jsonProp = prop as any

      if (jsonProp) {
        if (!jsonProp.name) jsonProp.name = name
        if (!jsonProp.index) jsonProp.index = index

        if (!isBoolean(jsonProp.required) && Array.isArray(required)) {
          jsonProp.required = required.includes(name)
        }
      }

      if (jsonProp.properties) {
        normalizeSchemaNode(prop)
      }
    })
  }
}

/**
 * 迭代shema数据，检测mergeRef标记，如果有则执行合并操作(只支持对象节点)
 */
function mergeRefNode(node: any, schema: Schema, cache: any[] = []) {
  if (isRefItemToMerge(node)) return mergeRefItem(node, schema, cache)

  if (!isRefNodeToMerge(node)) return node

  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.node === node)
  if (hit) return node

  // 将node放入缓存以备后续检查循环引用
  cache.push({ node })

  const { additionalProperties, properties } = node

  /**
   * 处理附加属性
   */
  if (additionalProperties && isRefItemToMerge(additionalProperties)) {
    node.additionalProperties = mergeRefItem(additionalProperties, schema, cache)
  }

  /**
   * 处理属性值
   */
  if (properties) {
    Object.entries(properties).forEach(([name, prop], index) => {
      let mergedItem: any

      if (isRefNodeToMerge(prop)) {
        mergedItem = mergeRefNode(prop, schema, cache)
      } else if (isRefItemToMerge(prop)) {
        mergedItem = mergeRefItem(prop, schema, cache)
      }

      if (mergedItem) {
        properties[name] = mergedItem
      }
    })
  }

  return node
}

/**
 * 合并itemItem
 * @param item
 * @param schema
 * @param cache
 */
function mergeRefItem(item: any, schema: Schema, cache: any[] = [], force: boolean = false) {
  if (!force && !isRefItemToMerge(item)) return item

  // 如果obj命中，则当前为循环引用
  const hit = cache.find(c => c.node === item)
  if (hit) return item

  // 将node放入缓存以备后续检查循环引用
  cache.push({ item })

  if (!item.$ref) {
    if (item.type === 'array' && item.items.$ref) {
      item.items = mergeRefItem(item.items, schema, cache, true)
    } else {
      // 处理anyOf, items的情形
      ;['anyOf'].forEach(prop => {
        const itemProp = item[prop]
        if (Array.isArray(itemProp)) {
          itemProp.forEach((it, index) => {
            if (!it.$ref) return
            itemProp[index] = mergeRefItem(it, schema, cache, true)
          })
        }
      })
    }

    delete item.mergeRef

    return item
  }

  const refNode = getSchemaDefinition(schema, item.$ref) as any

  // 参考节点不存在则返回
  if (!refNode) {
    delete item.$ref
    delete item.mergeRef
    return item
  }

  if (isRefItemToMerge(refNode)) {
    return mergeRefItem(refNode, schema, cache)
  }

  let refNodeToMerge = refNode

  // 获取参考节点的参考节点
  if (isRefNodeToMerge(refNode)) {
    refNodeToMerge = mergeRefNode(refNode, schema, cache)
  }

  normalizeSchemaNode(refNodeToMerge)

  const _item: any = deepmerge(refNodeToMerge, item)

  _item.$mergedRef = _item.$ref
  delete _item.$ref
  delete _item.mergeRef

  return _item
}

/**
 * 是否是需要合并的节点
 */
function isRefNodeToMerge(node: any) {
  if (!node) return false

  const { additionalProperties, properties } = node

  if (isRefItemToMerge(additionalProperties)) return true

  if (properties && Object.keys(properties).some(key => isRefItemToMerge(properties[key]))) return true

  return false
}

/** 是否合并参考项 */
function isRefItemToMerge(item: any) {
  if (!item || !item.mergeRef) return false
  if (item.$ref) return true

  if (item.type === 'array' && item.items.$ref) return true

  if (['anyOf'].some(prop => Array.isArray(item[prop]) && item[prop].some(it => it.$ref))) return true

  return false
}
