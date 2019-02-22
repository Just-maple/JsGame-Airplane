import Vue from 'vue'
import Router from 'vue-router'
import playgrond from '@/components/playgrond'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'playgrond',
      component: playgrond
    }
  ]
})
