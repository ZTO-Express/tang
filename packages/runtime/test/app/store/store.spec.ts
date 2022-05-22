// import { createAppStore } from '../../../src/app/store'

describe('app/store, app store验证', () => {
  /** 验证同时创建的store之间并无关联 */
  it('store对比', async () => {
    // const store1 = createAppStore()
    // const store2 = createAppStore()
    // expect(store1.state !== store2.state)
    // expect(store1.state.app !== store2.state.app)
    // store1.commit('app/setAppInfo', { appId: 'app1' })
    // expect(store1.state.app.appId).toBe('app1')
    // expect(store2.state.app.appId).toBe('')
    // store2.commit('app/setAppInfo', { appId: 'app2' })
    // expect(store2.state.app.appId).toBe('app2')
    // expect(store1.state.app.appId).toBe('app1')
  })
})
