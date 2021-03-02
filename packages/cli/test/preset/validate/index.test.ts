import { PresetManager } from '../../../src/lib/preset';

describe('preset/PresetManager：preset格式验证 index', () => {
  let presetManager: PresetManager;

  beforeAll(() => {
    presetManager = new PresetManager({});
  });

  it('验证 preset格式，通过', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        contact: {},
      }),
    ).resolves.toBe(true);
  });

  it('验证 preset格式，缺少版本', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          dataPath: '',
          params: {
            missingProperty: 'version',
          },
        },
      ],
    });
  });

  it('验证 preset格式，多余属性', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        exProp: '其他属性',
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          dataPath: '',
          params: {
            additionalProperty: 'exProp',
          },
        },
      ],
    });
  });

  it('验证 preset格式，Extends string', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        extends: 'https://test.com/preset.json',
      }),
    ).resolves.toBe(true);
  });

  it('验证 preset格式，Extends object', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        extends: {},
      }),
    ).resolves.toBe(true);
  });

  it('name, url, email, 应当为字符串', async () => {
    await expect(
      presetManager.validate({
        name: 'tang-test',
        version: '0.1',
        contact: {
          name: 0,
          url: 1,
          email: 2,
        },
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          dataPath: '.contact.name',
          params: {
            type: 'string',
          },
        },
        {
          dataPath: '.contact.url',
          params: {
            type: 'string',
          },
        },
        {
          dataPath: '.contact.email',
          params: {
            type: 'string',
          },
        },
      ],
    });
  });
});
