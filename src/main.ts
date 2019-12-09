import 'reflect-metadata' // Import only once
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { container } from 'inversify-props'
import { DummySpectralExtractor } from './services/spectral-extractor/spectral-extractor-impl'
import { SpectralExtractor } from './services/spectral-extractor/spectral-extractor'
import { REGISTRY } from './registry'
import vuetify from './plugins/vuetify'

container.addSingleton<SpectralExtractor>(DummySpectralExtractor, REGISTRY.SpectralExtractor)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
