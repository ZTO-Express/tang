import { YApiService } from '../src/service';

export const testYapiUrl = 'https://yapi.baidu.com';
export const testYapiToken =
  '842ed98e16b54025921fadf015c80270c4184a6607ce46b81d80972657fb494c';

export function createYapiService() {
  return new YApiService({
    url: testYapiUrl,
    token: testYapiToken,
  });
}
