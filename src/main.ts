import 'reflect-metadata' // Import only once
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import './ioc'

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
