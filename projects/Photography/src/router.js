import { createRouter, createWebHistory } from 'vue-router'
import BrowsePage from './components/BrowsePage.vue'
import ViewPage from './components/ViewPage.vue'

const router = createRouter({
  history: createWebHistory('/photos/'),
  routes: [
    { path: '/', component: BrowsePage },
    { path: '/set/:id', component: ViewPage },
  ],
})

export default router
