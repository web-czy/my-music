import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '../recommend/recommend'
import Singer from '../singer/singer'
import Rank from '../rank/rank'
import Search from '../search/search'
import SingerDetail from 'components/singer-detail/singer-detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      name: 'recommend',
      path: '/recommend',
      component: Recommend
    },
    {
      name: 'singer',
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      name: 'rank',
      path: '/rank',
      component: Rank
    },
    {
      name: 'search',
      path: '/search',
      component: Search
    }
  ]
})
