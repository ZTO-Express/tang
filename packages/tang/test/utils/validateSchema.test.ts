import { ValidationError } from 'schema-utils';
import { validateSchema } from '../../src/utils';

describe('utils/validateSchema：validateSchema实用方法', () => {
  const testSchema: any = {
    description: '测试schema',
    type: 'object',
    additionalProperties: false, // 默认false
    required: ['name', 'version'],
    properties: {
      name: {
        description: '名称不能为空',
        type: 'string',
      },
      version: {
        description: '版本不能为空',
        type: 'string',
      },
    },
    definitions: {},
  };

  it('验证 schema', async () => {
    validateSchema(testSchema, {
      name: 'tang-test',
      version: '0.0.1',
    });

    expect(() => {
      validateSchema(testSchema, {
        name: 'tang-test',
      });
    }).toThrowError(ValidationError);

    expect(() => {
      validateSchema(testSchema, {
        name: 'tang-test',
        exProp: 'xxxx',
      });
    }).toThrowError(ValidationError);
  });
});
