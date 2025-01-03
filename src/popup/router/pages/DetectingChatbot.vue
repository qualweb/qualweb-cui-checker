<template>
  <div class="container">
    <div v-if="getDetectingChatbot">
      <div class="loader"></div>
      <p class="state">{{ state }}</p>
    </div>
    <div v-else>
      <p class="state">{{ state }}</p>
      <ActionPrompt
        :key="currentStep"
        :question="workflow[currentStep].question"
        :actionYes="this.nextQuestion"
        :actionNo="
          () => {
            this.requestCorrectionElementLLM(workflow[currentStep].nameElement);
          }
        "
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ActionPrompt from "../../components/ActionPrompt.vue";

export default {
  name: "detectingChatbot",
  props: [],
  components: {
    ActionPrompt,
  },
  methods: {
    ...mapActions(["setDetectingChatbot"]),
    requestCorrectionElementLLM(functionCode) {
      this.state = "Requesting Correction";
      this.setDetectingChatbot(true);
      startCorrectionChatbot().then((result) => {
        if (Object.keys(result).length > 0) {
          this.state = "Chatbot Detected";
          console.log("Chatbot Detected: ", result);
          this.setDetectingChatbot(false);
          startVerificationElement(this.workflow[this.currentStep].nameElement);
        } else {
          this.state = "Chatbot Not Detected";
          this.setDetectingChatbot(false);
          setTimeout(() => {
            this.$router.push("/");
          }, 2000);
        }
      });
    },
    nextQuestion() {
      if (this.currentStep < this.workflow.length - 1) {
        endVerificationElement(this.workflow[this.currentStep].nameElement);
        setTimeout(() => {
          this.currentStep++;
          startVerificationElement(this.workflow[this.currentStep].nameElement);
        }, 800);
      } else {
        endVerificationElement(this.workflow[this.currentStep].nameElement);
        this.$router.push("/");
      }
    },
  },
  computed: {
    ...mapGetters(["getDetectingChatbot"]),
  },
  data() {
    return {
      state: "Identifying Chatbot",
      currentStep: 0,
      workflow: [
        {
          nameElement: "inputElement",
          question: "Is selected input of chatbot correct?",
        },
        {
          nameElement: "messagesSelector",
          question:
            "Are individual messages on chatbot app selected correctly?",
        },
        {
          nameElement: "historyElement",
          question: "Is conversation window selected correctly?",
        },
        {
          nameElement: "microphoneElement",
          question: "Is microphone window selected correctly?",
        },
        {
          nameElement: "windowElement",
          question: "Is main window of chatbot selected correctly?",
        },
      ],
    };
  },
  async mounted() {
    this.setDetectingChatbot(true);
    console.log("Detecting Chatbot: ", this.getDetectingChatbot);
    startDetectingChatbot().then((result) => {
      if (Object.keys(result).length > 0) {
        this.state = "Chatbot Detected";
        console.log("Chatbot Detected: ", result);
        this.setDetectingChatbot(false);
        startVerificationElement(this.workflow[this.currentStep].nameElement);
      } else {
        this.state = "Chatbot Not Detected";
        this.setDetectingChatbot(false);
        setTimeout(() => {
          this.$router.push("/");
        }, 2000);
      }
    });
  },
};
</script>

<style scoped>
.state {
  text-align: center;
}
.container {
  min-height: 50vh;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
}
.loader {
  border: 16px solid transparent;
  border-top: 16px solid #e15500;
  border-radius: 50%;
  width: 140px;
  height: 140px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
