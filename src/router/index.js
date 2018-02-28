import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import RichListIndex from '@/components/RichListIndex'
import RichStats from '@/components/RichStats'
import RichWallets from '@/components/RichWallets'
import EscrowStats from '@/components/EscrowStats'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/rich-index',
      name: 'RichListIndex',
      component: RichListIndex,
      children: [
        {
          path: ':address',
          props: true
        }
      ]
    },
    {
      path: '/rich-stats',
      name: 'RichStats',
      component: RichStats
    },
    {
      path: '/rich-stats/:take/:skip?',
      props: true,
      component: RichWallets
    },
    {
      path: '/escrow-stats',
      name: 'EscrowStats',
      component: EscrowStats
    }
  ]
})
