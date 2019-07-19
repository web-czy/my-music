import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// vuex的插件，通过mutation修改state的时候，它会在控制台打印logger
// 就是这条修改记录，之前的state，后来的state
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 调试工具，检测state是否通过mutations修改，如果不是，就会报错
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  // 严格模式，在开发模式下使用，线上使用会产生性能损耗
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
