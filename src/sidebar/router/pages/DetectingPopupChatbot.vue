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
    <button
      id="cancelButton"
      class="button-cancel"
      @click="() => {
        this.$router.go(-1);
      }">Cancel</button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ActionPrompt from "../../components/ActionPrompt.vue";

export default {
  name: "detectingPopupChatbot",
  props: [],
  components: {
    ActionPrompt,
  },
  methods: {
    ...mapActions(["setDetectingChatbot","setSelectors"]),
    cancel() {
      this.$router.go(-1);
    },
    requestCorrectionElementLLM(functionCode) {
      this.state = "Requesting Correction";
      this.setDetectingChatbot(true);
      startCorrectionChatbot().then((result) => {
        if (Object.keys(result).length > 0) {
          this.state = "Chatbot Detected";

          this.setDetectingChatbot(false);
          startVerificationElement(this.workflow[this.currentStep].nameElement);
        } else {
          this.state = "Chatbot Not Detected";
          this.setDetectingChatbot(false);
          setTimeout(() => {
            this.$router.push("/failed-detection");
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
  
        this.setSelectors(this.resultLLM);
        endVerificationElement(this.workflow[this.currentStep].nameElement);
        this.$router.push("/ready");
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
      resultLLM: {},
      workflow: [
        {
          nameElement: "windowSelector",
          question: "Is main window of chatbot selected correctly?",
        },  
        {
          nameElement: "messagesSelector",
          question:
            "Are individual messages on chatbot app selected correctly?",
        },
        {
          nameElement: "inputSelector",
          question: "Is selected input of chatbot correct?",
        },
        {
          nameElement: "microphoneSelector",
          question: "Is microphone window selected correctly?",
        },
      ],
    };
  },
  async mounted() {
    this.setDetectingChatbot(true);
    this.state = "Detecting Chatbot";
    try {
    const detected = await startDetectingChatbot();
    this.state = "Identifying Selectors";
    } catch (error) {
      console.error("Error during detection:", error);
    }
    startIdentifySelectorsChatbot().then((result) => {
      
      if (Object.keys(result).length > 0) {
        this.resultLLM = result.chatbot;
        this.state = "Chatbot Detected";

        this.setDetectingChatbot(false);
        startVerificationElement(this.workflow[this.currentStep].nameElement);
      } else {
        this.state = "Chatbot Not Detected";
        this.setDetectingChatbot(false);
        setTimeout(() => {
          this.$router.push("/failed-detection");
        }, 2000);
      }
    });
  },
};
</script>

<style scoped>
.button-cancel {
  background-color: #75706c;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
}
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
  overflow: hidden;
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
