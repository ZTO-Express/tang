const App = {
  data() {
    return {
      message: 'Project 02'
    }
  }
}

const app = Vue.createApp(App)
app.use(ElementPlus)

app.mount('#app')
