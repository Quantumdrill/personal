import { createWebHistory, createRouter } from 'vue-router'
import oiiaioiiiai from './components/oiiaioiiiai.vue'
const routes = [
  { path: '/oiiaioiiiai', component: oiiaioiiiai },
]
export const router = createRouter({
  history: createWebHistory(),
  routes,
})