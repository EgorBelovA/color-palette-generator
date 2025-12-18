import { createRouter, createWebHistory } from 'vue-router';
import PalettePage from '../views/PalettePage.vue';

const routes = [
  {
    path: '/palette',
    name: 'PalettePage',
    component: PalettePage,
  },
];

const router = createRouter({
  history: createWebHistory('/color-palette-generator'),
  routes,
});
export default router;
