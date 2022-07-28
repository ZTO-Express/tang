import { IAM_URL, IAM_TEST_URL, FS_URL, FS_TEST_URL } from '@zto/zpage-site-base'

import { HOST_APP_DEFAULT_PROD_URL, HOST_APP_PROD_HOSTS } from './consts'

import type { AppEnvMap, AppEnvConfig } from '@zto/zpage'
import type { SiteAppEnv } from '../typings'

export const HOST_APP_HOSTS = {
  DEV: '127.0.0.1:4010',
  TEST: 'docs.zpage.ft.ztosys.com',
  PRE: 'docs.zpage.re.ztosys.com'
}

// 通用环境变量
const CommonEnv = {
  appNs: 'zpage-docs'
}

// 通用测试环境变量
export const TestEnv: AppEnvConfig<SiteAppEnv> = {
  ...CommonEnv,
  iamUrl: IAM_TEST_URL,
  fsUrl: FS_TEST_URL,
  appId: 'ztTTO4riBbTJvMwRgRxkOhh7',
  hostUrl: `http://${HOST_APP_HOSTS.TEST}`,
  apiUrl: 'https://zsite.gw-test.ztosys.com',
  fsAppId: 'DFS1423110276329549825',
  bmapAK: 'FZHQAPmmQrB9YunRv9KM1TBs6sl6lbXZ'
}

// 开发环境变量
export const DevEnv: AppEnvConfig<SiteAppEnv> = {
  ...TestEnv,
  hostUrl: `http://${HOST_APP_HOSTS.DEV}`
}

// 通用生产环境变量
export const ProdEnv: AppEnvConfig<SiteAppEnv> = {
  ...CommonEnv,
  iamUrl: IAM_URL,
  fsUrl: FS_URL,
  appId: 'ztuhE4j1TmlC9lrkth9kkWck',
  hostUrl: HOST_APP_DEFAULT_PROD_URL,
  apiUrl: 'https://zsite.gw.zt-express.com',
  fsAppId: 'ztRw1tpgIaUwyvT3ukoGXItQ',
  bmapAK: 'wNTd8CTuMxXocI36R4BtDUnTDQxLsAkL'
}

// 预发环境变量
export const PreEnv: AppEnvConfig<SiteAppEnv> = {
  ...ProdEnv,
  hostUrl: `http://${HOST_APP_HOSTS.PRE}`,
  extraHeaders: { 'x-dubbo-tag': 'pre' }
}

// 环境变量映射
export const envMap: AppEnvMap<SiteAppEnv> = {
  dev: {
    // 开发/本地环境
    HOSTs: [HOST_APP_HOSTS.DEV],
    ENV: { ...DevEnv }
  },

  test: {
    // 测试环境
    HOSTs: [HOST_APP_HOSTS.TEST],
    ENV: { ...TestEnv }
  },

  pre: {
    // 预发布环境
    HOSTs: [HOST_APP_HOSTS.PRE],
    ENV: { ...PreEnv }
  },

  prod: {
    // 生产环境
    HOSTs: HOST_APP_PROD_HOSTS,
    ENV: { ...ProdEnv }
  }
}
