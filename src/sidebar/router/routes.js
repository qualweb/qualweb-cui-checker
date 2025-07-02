import Index from "./pages/Index";
import Evaluation from "./pages/Evaluation";
import RuleContent from "./pages/RuleContent";
import DetectingChatbot from "./pages/DetectingChatbot";
import Loading from "./pages/Loading";

export default [
  {
    path: "/",
    component: Index,
  },
  {
    path: "/evaluation",
    name: "evaluation",
    component: Evaluation,
  },
  {
    path: "/detecting-chatbot",
    name: "detecting-chatbot",
    component: DetectingChatbot,
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
