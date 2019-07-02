import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import fastclick from 'fastclick'
import router from 'components/router/index'

import './common/stylus/index.styl'

Vue.config.productionTip = false
// 让document.body下的所有div及其他元素的点击都没有300毫秒的延迟
fastclick.attach(document.body)

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
