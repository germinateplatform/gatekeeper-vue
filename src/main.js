import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import BootstrapVue from 'bootstrap-vue'
import '@/assets/css/custom.scss'
import mixin from './mixins/mixin.js'
import api from './mixins/api.js'
import { i18n } from './plugins/i18n.js'
import FlagIcon from 'vue-flag-icon'
let axiosDefaults = require('axios/lib/defaults')

Vue.mixin(mixin)
Vue.mixin(api)
Vue.use(FlagIcon)
Vue.use(BootstrapVue)

// Set base URL
var baseUrl = './api/'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

axiosDefaults.baseURL = baseUrl

store.commit('ON_BASE_URL_CHANGED_MUTATION', baseUrl)

Vue.config.productionTip = false

new Vue({
  router: router,
  store: store,
  i18n: i18n,
  render: h => h(App)
}).$mount('#app')
