import {
  Definition,
  AnnotatedType,
  TypeFormatter,
  AnnotatedTypeFormatter as TJSAnnotatedTypeFormatter
} from 'ts-json-schema-generator'
import { tryJsonParse, parseJsDocOptions } from '../../utils'

/**
 * 注解类型格式化
 */
export class AnnotatedTypeFormatter extends TJSAnnotatedTypeFormatter {
  public constructor(protected childTypeFormatter: TypeFormatter) {
    super(childTypeFormatter)
  }

  public getDefinition(type: AnnotatedType): Definition {
    const annotations = type.getAnnotations()

    /** 若没有显示声明标签，则将描述作为标签 */
    if (!annotations.label) {
      annotations.label = annotations.description
      delete annotations.description
    }

    /** 若声明了desc，则使用desc代替description，并删除description */
    if (annotations.desc) {
      annotations.description = annotations.desc
      delete annotations.desc
    }

    // 解析options释文
    if (annotations.options) {
      annotations.options = parseJsDocOptions(annotations.options)
    }

    // 调整$ref引用
    if (annotations.$ref) {
      if (!annotations.$ref.startsWith('#/')) {
        annotations.$ref = `#/definitions/${annotations.$ref}`
      }
    }

    const def: Definition = super.getDefinition(type)

    /** 处理枚举注解 */
    if (Array.isArray(def.enum)) {
    }

    return def
  }
}
