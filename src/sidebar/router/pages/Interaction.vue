<template>
  <div class="container">
    <div>
      <div class="loader"></div>
      <p class="state">{{ state }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'Loading',
  props: ['act', 'wcag', 'cui', 'css'],
  methods: {
    ...mapActions([]),
    ...mapGetters(['getEvaluated', 'getFirstRule', 'getResultFilter']),
  },
  data() {
    return {
      state: 'Starting evaluation',
    };
  },
  async mounted() {
    let modules = this.getEvaluated();
    let actResult,
      chatbotActResult,
      cuiResult,
      chatbotCuiResult,
      wcagResult,
      chatbotWcagResult,
      cssResult,
      summary,
      chatbotSummary;
    await startEvaluation();
    if (modules.act) {
      this.state = 'Evaluating ACT module';
      [actResult, chatbotActResult] = await evaluateACT();
      this.setACT(actResult);
      chatbotActResult && this.setChatbotACT(chatbotActResult);
    }
    if (modules.wcag) {
      this.state = 'Evaluating WCAG module';
      [wcagResult, chatbotWcagResult] = await evaluateWCAG();
      this.setWCAG(wcagResult);
      chatbotWcagResult && this.setChatbotWCAG(chatbotWcagResult);
    }
    if (modules.cui) {
      this.state = 'Evaluating CUI module';
      [cuiResult, chatbotCuiResult] = await evaluateCUI();
      this.setCUI(cuiResult);
      chatbotCuiResult && this.setChatbotCUI(chatbotCuiResult);
    }
    this.state = 'Ending evaluation';
    [summary, chatbotSummary] = await endingEvaluation();
    this.setSummary(summary);
    chatbotSummary && this.setChatbotSummary(chatbotSummary);
    chatbotSummary && this.setEvaluateChatbot(true);
    this.setStartingFilter(modules);
    this.setCurrentRule(this.getFirstRule());
    this.$router.push('/evaluation');
  },
};
</script>

<style scoped>
.state {
  text-align: center;
}
.container {
  min-height: 50vh;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}
.loader {
  border: 16px solid transparent; /* Light grey */
  border-top: 16px solid #e15500; /* Blue */
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
