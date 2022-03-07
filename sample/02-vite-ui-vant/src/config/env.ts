interface Env {
  readonly appId: string // appId
  readonly env: string // 当前环境名
  readonly apiUrl: string // api域名
  readonly fsUrl: string // 文件服务器域名
}

interface EnvMap {
  HOSTs: string[]
  ENV: Env
}

const TestEnv: Env = {
  env: 'test',
  appId: 'ztpNTjIDp6jzWJIOAjWBq4X1',
  apiUrl: 'https://tuxi-cdc.gw-test.ztosys.com',
  fsUrl: 'https://fs.test.ztosys.com'
}

const envMap: EnvMap[] = [
  // 开发/本地环境
  {
    HOSTs: ['http://localhost:3095'],

    ENV: {
      ...TestEnv,
      env: 'dev'
    }
  }
]

function checkUrl(url: string) {
  return window.location.href.indexOf(url) === 0
}

export const ENV: Env = (envMap.find(it => it.HOSTs.some(h => checkUrl(h))) || envMap[0]).ENV
