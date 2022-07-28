import { getComponentsFromMap } from '../utils'

import CAppHeaderExtra from './app/CAppHeaderExtra.vue'
import CInfoSection from './section/CInfoSection.vue'

import { CFormItemMultiInput, CFormItemMultiLabel } from './form'

import CVerifyCode from './security/CVerifyCode.vue'
import CMap from './map/CMap.vue'
// import CChart from './chart/CChart.vue'

const components = getComponentsFromMap({
  CAppHeaderExtra,
  CInfoSection,
  CFormItemMultiInput,
  CFormItemMultiLabel,
  CVerifyCode,
  CMap
  // CChart
})

export { components }
