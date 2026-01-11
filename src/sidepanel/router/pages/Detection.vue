<template>
  <div class="container" v-if="getDetectingChatbot">
    <Loading :message="state">
      <template v-slot:buttons>
        <div class="button-container">
          <ButtonStyled :primary="false" @click="cancelDetection" label="Cancel Detection" />
        </div>
      </template>
    </Loading>
  </div>

  <div class="container" v-else>
    <Loading v-if="!currentAction"></Loading>
    <component v-if="!isUserManualSelecting" :is="currentAction" :prompt="currentPrompt" />
    <div class="container" v-if="isUserManualSelecting">
      <h1>Please click on microphone button</h1>
      <div class="button-container">
        <ButtonStyled :primary="false" @click="cancelManualSelection" label="Cancel Selection" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ActionPrompt from '../../components/ActionPrompt.vue';
import Loading from '../../components/Loading.vue';
import ButtonStyled from '../../components/ButtonStyled.vue';
import { STATUS } from '../../../messaging/message-types';
import { defaultErrorHandler, handleErrorSidepanel } from '../../../errors/error.handler.sidepanel';

export default {
  name: 'detectingPageChatbot',
  components: { ActionPrompt, Loading, ButtonStyled },
  computed: {
    ...mapGetters(['getDetectingChatbot', 'getTabId']),
  },
  data() {
    return {
      state: 'Identifying Chatbot',
      currentStep: 0,
      counter: 0,
      isUserManualSelecting: false,
      currentAction: null,
      currentPrompt: null,
      resultSelectors: {},
      workflow: [
        {
          nameElement: 'windowSelector',
          question: 'Is main window of chatbot selected correctly?',
          titlePrimary: 'Yes',
          titleNeutral: 'No',
          actionPrimary: async () => {
            await this.nextQuestion();
            this.counter++;
          },
          actionNeutral: () => {
            this.requestCorrectionElementLLM('windowSelector');
          },
          counter: 0,
        },
        {
          nameElement: 'messagesSelector',
          question: 'Are individual messages on chatbot app selected correctly?',
          titlePrimary: 'Yes',
          titleNeutral: 'No',
          actionPrimary: async () => {
            await this.nextQuestion();
            this.counter = 0;
          },
          actionNeutral: () => {
            this.requestCorrectionElementLLM('messagesSelector');
          },
        },
        {
          nameElement: 'inputSelector',
          question: 'Is selected input of chatbot correct?',
          titlePrimary: 'Yes',
          titleNeutral: 'No',
          actionPrimary: async () => {
            await this.nextQuestion();
            this.counter = 0;
          },
          actionNeutral: () => {
            this.requestCorrectionElementLLM('inputSelector');
          },
        },
        {
          nameElement: 'microphoneSelector',
          question: 'Is microphone button selected correctly?',
          titlePrimary: 'Yes',
          titleNeutral: 'No',
          actionPrimary: async () => {
            await this.nextQuestion();
            this.counter = 0;
          },
          actionNeutral: async () => {
            if (this.counter == 1) {
              this.addQuestionMicrophonePresent();
              await this.nextQuestion();
            } else {
              this.counter++;
              this.requestCorrectionElementLLM('microphoneSelector');
            }
          },
        },
      ],
    };
  },
  methods: {
    ...mapActions(['setDetectingChatbot', 'setSelectors', 'setSelectorsDetected']),
    removeQuestionMicrophone() {
      this.workflow = this.workflow.filter((step) => step.nameElement !== 'microphoneSelector');
    },
    addQuestionIsMicrophoneCorrect() {
      console.log('Adding microphone question');
      this.workflow.push({
        nameElement: 'microphoneSelector',
        question: 'Is microphone button selected correctly?',
        titlePrimary: 'Yes',
        titleNeutral: 'No',
        actionPrimary: async () => {
          await this.nextQuestion();
        },
        actionNeutral: async () => {
          this.addQuestionMicrophonePresent();
          await this.nextQuestion();
        },
      });
    },
    addQuestionMicrophonePresent() {
      this.workflow.push({
        nameElement: null,
        question: 'Does the chatbot have a microphone button that you can select?',
        titlePrimary: 'Manually select',
        titleNeutral: 'Not present',
        actionPrimary: () => {
          this.askClickMic();
        },
        actionNeutral: () => {
          this.resultSelectors.microphoneSelector = '';
          this.finishNoMic();
        },
      });
    },
    async cancelManualSelection() {
      const result = await cancelManualSelectMic(this.resultSelectors, this.getTabId);
      if (!result || result.status === STATUS.ERROR) {
        defaultErrorHandler({ error: result, router: this.$router });
        return;
      }
      this.isUserManualSelecting = false;
    },
    cancelDetection() {
      cancelDetectionRequest(this.getTabId);
      this.$router.go(-1);
    },
    // avança a etapa
    async nextQuestion() {
      this.currentAction = null;
      // fluxo normal
      if (this.currentStep < this.workflow.length - 1) {
        // end verification old step
        if (this.workflow[this.currentStep].nameElement != null) {
          try {
            await endVerificationElement(
              this.resultSelectors,
              this.workflow[this.currentStep].nameElement,
              this.getTabId,
            );
          } catch (error) {
            console.log(
              'Error ending verification for element:',
              this.workflow[this.currentStep].nameElement,
              error,
            );
            this.$router.push('/');
            return;
          }
        }
        this.currentStep++;
        if (this.workflow[this.currentStep].nameElement != null) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const result = await startVerificationElement(
            this.resultSelectors,
            this.workflow[this.currentStep].nameElement,
            this.getTabId,
          );

          if (result.status === STATUS.ERROR) {
            this.$router.push('/');
            return;
          }
        }

        this.updatePrompt();
        this.currentAction = 'ActionPrompt';
      } else {
        if (this.workflow[this.currentStep].nameElement != null) {
          const result = await endVerificationElement(
            this.resultSelectors,
            this.workflow[this.currentStep].nameElement,
            this.getTabId,
          );
          if (!result || result.status === STATUS.ERROR) {
            defaultErrorHandler({ error: result, router: this.$router });
            return;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Finishing workflow');
        this.finishWorkflow();
      }
    },
    // Atualiza o prompt principal com base na etapa atual
    updatePrompt() {
      const step = this.workflow[this.currentStep];
      this.currentPrompt = {
        question: step.question,
        actionPrimary: step.actionPrimary,
        titlePrimary: step.titlePrimary,
        titleNeutral: step.titleNeutral,
        actionNeutral: step.actionNeutral,
      };
    },
    async reloadQuestion() {
      this.currentAction = null;

      await new Promise((resolve) => setTimeout(resolve, 200));

      this.currentAction = 'ActionPrompt';
    },

    finishWorkflow() {
      console.log('Setting selectors and finishing detection, selectors:', this.resultSelectors);
      this.setSelectors(this.resultSelectors);
      this.setSelectorsDetected(true);
      this.$router.push('/');
    },

    async askClickMic() {
      this.isUserManualSelecting = true;
      const result = await manualSelectMic(this.resultSelectors, this.getTabId);
      if (!result || result.status === STATUS.ERROR) {
        defaultErrorHandler({ error: result, router: this.$router });
        return;
      }
      this.isUserManualSelecting = false;
      console.log('Result', result);
      if (result.status == 'success') {
        this.resultSelectors = result.data;

        this.addQuestionIsMicrophoneCorrect();

        await this.nextQuestion();
      } else {
        await this.reloadQuestion();
      }
    },

    // Terminar se não há microfone
    finishNoMic() {
      this.state = 'No microphone detected.';
      this.finishWorkflow();
    },

    requestCorrectionElementLLM(nameElement) {
      this.state = 'Requesting Correction';
      this.setDetectingChatbot(true);
      startCorrectionChatbot(this.resultSelectors, nameElement, this.getTabId)
        .then(async (result) => {
          console.log('Correction result for', nameElement, result);
          this.resultSelectors[nameElement] = result.data;
          this.setDetectingChatbot(false);
          const response = await startVerificationElement(
            this.resultSelectors,
            this.workflow[this.currentStep].nameElement,
            this.getTabId,
          );
          if (!response || response.status === STATUS.ERROR) {
            this.state = 'Error during verification of corrected element';
            new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
              defaultErrorHandler({ error: response, router: this.$router });
            });
          }
        })
        .catch(async (error) => {
          this.state = 'Error during correction';
          await new Promise((resolve) => setTimeout(resolve, 1000));
          this.setDetectingChatbot(false);
          handleErrorSidepanel({ error: error, router: this.$router });
        });
    },
  },
  async mounted() {
    this.setDetectingChatbot(true);

    this.state = 'Detecting Chatbot';

    console.log('Starting chatbot detection from Detection.vue');
    try {
      const procedureResult = await startPageChatbotProcedure(this.getTabId);
      console.log('Chatbot detection result:', procedureResult);
      if (!procedureResult || procedureResult.status === STATUS.ERROR) {
        await defaultErrorHandler({ error: procedureResult, router: this.$router });
        return;
      }
      if (procedureResult.code === '"CANCELLED_DETECTION"') {
        this.$router.go(-1);
        return;
      }
      console.log('Detected selectors:', procedureResult);
      this.resultSelectors = procedureResult.data.selectors;

      this.state = 'Chatbot Detected';
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.setDetectingChatbot(false);
      this.state = 'Verifying Chatbot Elements';
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const verificationRequest = await startVerificationElement(
        this.resultSelectors,
        this.workflow[this.currentStep].nameElement,
        this.getTabId,
      );
      if (!verificationRequest || verificationRequest.status === STATUS.ERROR) {
        this.state = 'Error during verification';
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await defaultErrorHandler({ error: verificationRequest, router: this.$router });
        return;
      }

      this.currentAction = 'ActionPrompt';
      if (!this.resultSelectors.microphoneSelector) {
        this.removeQuestionMicrophone();
        this.addQuestionMicrophonePresent();
      }
      this.updatePrompt();
    } catch (error) {
      this.state = 'Error during chatbot detection';
      const errorArgs = { error: error, router: this.$router };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Handling error in Detection.vue:', error);
      handleErrorSidepanel(errorArgs);
    }
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
  overflow: hidden;
}
.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: auto;
  gap: 10px;
}
</style>
