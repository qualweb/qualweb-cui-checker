import Evaluation from './pages/Evaluation';
import RuleContent from './pages/RuleContent';
import Loading from './pages/Loading';
import Start from './pages/Start.vue';
import Ready from './pages/Ready.vue';
import Detection from './pages/Detection.vue';
import Interaction from './pages/Interaction.vue'
import InteractionSound from './pages/InteractionSound.vue'
import Help from './pages/Help.vue';

export default [
  {
    path: '/',
    component: Start,
  },
  {
    path: '/ready',
    name: 'ready',
    component: Ready,
  },
  {
    path: '/evaluation',
    name: 'evaluation',
    component: Evaluation,
  },
    {
    path: '/interaction',
    name: 'interaction',
    component: Interaction,
  },
  {
    path: '/interaction-sound',
    name: 'interaction-sound',
    component: InteractionSound,
  },
  {
    path: '/detecting-chatbot',
    name: 'detecting-chatbot',
    component: Detection,
  },
  {
    path: '/rule-content',
    name: 'rule-content',
    component: RuleContent,
  },
  {
    path: '/loading',
    name: 'loading',
    component: Loading,
  },
    {
    path: '/help',
    name: 'help',
    component: Help,
  },
];
