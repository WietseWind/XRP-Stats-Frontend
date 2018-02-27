import Vue from 'vue'
import Router from 'vue-router'
import RichListIndex from '@/components/RichListIndex'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'RichListIndex',
      component: RichListIndex
    }
  ]
})
