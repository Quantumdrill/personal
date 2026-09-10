import { createWebHistory, createRouter } from 'vue-router'
const routes = [
]
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
