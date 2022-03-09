import { ENV } from '../config/env'
import { httpConfig } from '../config/http'

const { HttpRequest } = ZPage

export default new (class extends HttpRequest {
  constructor() {
    super(ENV.apiUrl, httpConfig)
  }

  async getAppList() {
    return [
      { code: 'zscm_store', name: '中通云链' },
      { code: 'zscm_BD', name: '商业BD' },
      { code: 'zscm_supplier', name: '供应商端' },
      { code: 'zscm_driver', name: '司机端' },
      { code: 'tuxi_admin', name: '运营后台' },
      { code: 'tuxi_live+', name: '兔喜生活+' },
      { code: 'tuxi_kdcs_ios', name: '快递超市-ios' },
      { code: 'tuxi_jointDIST_ios', name: '共配-ios' }
    ]
  }
})()
