import Index from "./pages/Index";
import Evaluation from "./pages/Evaluation";
import RuleContent from "./pages/RuleContent";
import DetectingPopupChatbot from "./pages/DetectingPopupChatbot";
import Loading from "./pages/Loading";
import Settings from "./pages/Settings.vue";
import Start from "./pages/Start.vue";
import Ready from "./pages/Ready.vue";
import FailedDetection from "./pages/FailedDetection.vue";
import EvaluationSettings from "./pages/EvaluationSettings.vue";
import DetectingPageChatbot from "./pages/DetectingPageChatbot..vue";

export default [
  {
    path: "/",
    component: Start,
  },
    {
    path: "/ready",
    name: "ready",
    component: Ready,
  },
  {
  path: "/settings",
  name: "settings",
  component: Settings
  },
    {
    path: "/evaluation-settings",
    name: "evaluation-settings",
    component: EvaluationSettings,
  },
  {
    path: "/evaluation",
    name: "evaluation",
    component: Evaluation,
  },
    {
    path: "/detecting-page-chatbot",
    name: "detecting-page-chatbot",
    component: DetectingPageChatbot,
  },
  {
    path: "/detecting-popup-chatbot",
    name: "detecting-popup-chatbot",
    component: DetectingPopupChatbot,
  },
  {
    path: "/failed-detection",
    name: "failed-detection",
    component: FailedDetection,
  },
  {
    path: "/rule-content",
    name: "rule-content",
    component: RuleContent,
  },
  {
    path: "/loading",
    name: "loading",
    component: Loading,
  },
];
