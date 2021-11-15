import { createApp } from 'vue'

// import { createRenderer } from '@zpage/zpage'
// import { ZPageElementUI } from '@zpage/ui-element'

import App from './App.vue'

import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// const renderer = createRenderer({
//   ui: ZPageElementUI
// })
