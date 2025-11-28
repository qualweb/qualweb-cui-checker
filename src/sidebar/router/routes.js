import EvaluationResult from './pages/EvaluationResult';
import RuleContent from './pages/RuleContent';
import Evaluation from './pages/Evaluation';
import Start from './pages/Start.vue';
import Ready from './pages/Ready.vue';
import Detection from './pages/Detection.vue';
import Interaction from './pages/Interaction.vue'
import InteractionSound from './pages/InteractionSound.vue'
import Help from './pages/Help.vue';
import Error from './pages/Error.vue';
import Index from './pages/index.vue';
export default [
  {      
    path: '/',
    component: Index,
},
  {
    path: '/start',
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
    component: EvaluationResult,
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
    component: Evaluation,
  },
    {
    path: '/help',
    name: 'help',
    component: Help,
  },
  {
    path: '/error',
    name: 'error',
    component: Error,
  },
];
