import * as testUtil from './util';
import { ApiItemTypes } from '../src/service';

import { http } from '@devs-tang/core';

describe('service：YApi服务方法', () => {
  const originHttpRequest = http.request;

  const yapiService = testUtil.createYapiService();

  it('初始化', async () => {
    expect(yapiService.baseUrl).toBe(testUtil.testYapiUrl);
    expect(yapiService.token).toBe(testUtil.testYapiToken);
  });

  it('getLink', async () => {
    expect(yapiService.getLink()).toBe(yapiService.baseUrl);
    expect(yapiService.getLink(undefined)).toBe(yapiService.baseUrl);

    expect(yapiService.getLink(ApiItemTypes.ApiDoc, undefined)).toBe(
      yapiService.baseUrl,
    );
    expect(yapiService.getLink(ApiItemTypes.ApiDoc, { _id: 1 })).toBe(
      `${yapiService.baseUrl}/project/1/interface/api`,
    );

    expect(yapiService.getLink(ApiItemTypes.ApiProject, undefined)).toBe(
      `${yapiService.baseUrl}/project/undefined/interface/api`,
    );
    expect(yapiService.getLink(ApiItemTypes.ApiProject, { _id: 1 })).toBe(
      `${yapiService.baseUrl}/project/1/interface/api`,
    );

    expect(
      yapiService.getLink(ApiItemTypes.ApiCategory, { projectId: 1, _id: 1 }),
    ).toBe(`${yapiService.baseUrl}/project/1/interface/api/cat_1`);

    expect(
      yapiService.getLink(ApiItemTypes.Api, { projectId: 1, _id: 1 }),
    ).toBe(`${yapiService.baseUrl}/project/1/interface/api/1`);
  });

  it('fetchProject', async () => {
    const resp = await yapiService.fetchProject();
    expect(resp.type).toBe('project');
  });

  it('fetchApiList', async () => {
    const resp = await yapiService.fetchApiList();
    expect(Array.isArray(resp)).toBe(true);
    expect(resp.length).toBeGreaterThan(0);
    expect(resp[0].type).toBe('api');
  });

  it('fetchCateories', async () => {
    const categories = await yapiService.fetchCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].type).toBe('category');

    const category = await yapiService.fetchCategory(categories[0]._id);
    expect(category.type).toBe('category');
    expect(category).toEqual(categories[0]);

    const apiList = await yapiService.fetchApiListByCategory(categories[0]._id);
    expect(Array.isArray(apiList)).toBe(true);
    expect(apiList.length).toBeGreaterThan(0);
    expect(apiList[0].type).toBe('api');

    const apiInfo = await yapiService.fetchApi(apiList[0]._id);
    expect(apiInfo._id).toBe(apiList[0]._id);
    expect(apiInfo.type).toBe('api');
    expect(apiInfo.link).toBe(yapiService.getLink(ApiItemTypes.Api, apiInfo));
    expect(apiInfo.reqBodyType).toBe('json');
    expect(apiInfo.reqBody.type).toBe('object');
    expect(apiInfo.resBodyType).toBe('json');
    expect(apiInfo.resBody.type).toBe('object');

    const apiTag = apiInfo.tag;
    const setTag = [`isTest_${new Date().getTime()}`];
    await yapiService.setApiTag(apiInfo._id, setTag);
    const apiInfo2 = await yapiService.fetchApi(apiInfo._id);
    expect(apiInfo2.tag).toEqual(setTag);
    await yapiService.setApiTag(apiInfo._id, apiTag); // 还原
  });

  it('fetchExportData', async () => {
    const resp = await yapiService.fetchExportData();
    expect(Array.isArray(resp)).toBe(true);
    expect(resp.length).toBeGreaterThan(0);
  });

  it('request', async () => {
    http.request = ((): any => undefined) as any;
    await expect(yapiService.request('')).resolves.toBeUndefined();

    http.request = ((): any => 0) as any;
    await expect(yapiService.request('')).resolves.toBe(0);

    http.request = ((): any => {
      return {
        errcode: 0,
      };
    }) as any;
    await expect(yapiService.request('')).resolves.toBeUndefined();

    http.request = ((): any => {
      return {
        errcode: 0,
        data: { isTest: true },
      };
    }) as any;
    await expect(yapiService.request('')).resolves.toEqual({
      isTest: true,
    });

    http.request = ((): any => {
      return {
        errcode: 404,
        errmsg: 'NotFound',
      };
    }) as any;
    await expect(yapiService.request('')).rejects.toThrowError('NotFound');

    http.request = ((): any => {
      return {
        isTest: true,
      };
    }) as any;
    await expect(yapiService.request('')).resolves.toEqual({
      isTest: true,
    });

    const requestOptions: any = { data: { isTest: true } };
    await yapiService.request('', requestOptions);
    expect(requestOptions.body).toBe(JSON.stringify(requestOptions.data));

    http.request = originHttpRequest;
  });
});
