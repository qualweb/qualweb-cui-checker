import Index from './pages/Index';
import Welcome from './pages/Welcome.vue';
import Settings from './pages/Settings.vue';

export default [
  {
    path: '/',
    component: Index,
  },
  {
    path: '/welcome',
    component: Welcome,
  },
  {
    path: '/settings',
    component: Settings,
  },
];
