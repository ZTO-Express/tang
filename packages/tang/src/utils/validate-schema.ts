import * as schemaUtils from 'schema-utils';
import {
  Schema,
  ValidationErrorConfiguration,
} from 'schema-utils/declarations/validate';

/**
 * 验证json对象是否符合schema规范
 * @param schema schema规范
 * @param target 待验证对象
 * @param configuration 验证错误消息配置
 */
export function validateSchema(
  schema: Schema,
  target?: Array<object> | object,
  configuration?: ValidationErrorConfiguration,
) {
  return schemaUtils.validate(schema, target, configuration);
}
