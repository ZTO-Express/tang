interface Env {
  readonly appId: string // appId
  readonly env: string // 当前环境名
  readonly apiUrl: string // api域名
  readonly fsUrl: string // 文件服务器域名
  readonly ssoUrl: string // sso认证地址
}

interface EnvMap {
  HOSTs: string[]
  ENV: Env
}

const TestEnv: Env = {
  env: 'test',
  appId: 'xxxxx-xxxx',
  apiUrl: 'https://zpage-api.pisaas.com',
  ssoUrl: 'http://sso.pisaas.com',
  fsUrl: 'https://fs.pisaas.com'
}

const envMap: EnvMap[] = [
  // 开发/本地环境
  {
    HOSTs: ['http://localhost:4090'],

    ENV: {
      ...TestEnv,
      apiUrl: 'http://yapi.dev.ztosys.com/mock/2291',
      env: 'dev'
    }
  }
]

function checkUrl(url: string) {
  return window.location.href.indexOf(url) === 0
}

export const ENV: Env = (envMap.find(it => it.HOSTs.some(h => checkUrl(h))) || envMap[0]).ENV
