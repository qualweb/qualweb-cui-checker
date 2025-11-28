<template>
  <div class="container">
    <Loading :message="state">
      <template v-slot:buttons>
        <div class="button-container">
          <ButtonStyled :primary="false" @click="cancelEvaluation" label="Cancel Evaluation" />
        </div>
      </template>
    </Loading>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Loading from '../../components/Loading.vue';
import ButtonStyled from '../../components/ButtonStyled.vue';
export default {
  name: 'Evaluation',
  props: ['act', 'wcag', 'cui', 'css'],
  components: { Loading, ButtonStyled },
  computed: {
    ...mapGetters(['getTabId']),
  },
  methods: {
    ...mapActions([
      'reset',
      'setACT',
      'setChatbotACT',
      'setWCAG',
      'setChatbotWCAG',
      'setCUI',
      'setChatbotCUI',
      'setCSS',
      'setSummary',
      'setChatbotSummary',
      'setCurrentRule',
      'setStartingFilter',
      'setEvaluateChatbot',
    ]),
    ...mapGetters(['getEvaluated', 'getFirstRule', 'getResultFilter']),
    async cancelEvaluation() {
      this.cancel = true;
      this.reset();
      this.$router.push('/');
    },
  },
  data() {
    return {
      cancel: false,
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
     await startEvaluation(this.getTabId);
    if (modules.act) {
      this.state = 'Evaluating ACT module';
      if (this.cancel) return;
      const response = await evaluateACT(this.getTabId);
      [actResult, chatbotActResult] = response.data;
      this.setACT(actResult);
      chatbotActResult && this.setChatbotACT(chatbotActResult);
    }
    if (modules.wcag) {
      this.state = 'Evaluating WCAG module';
      if (this.cancel) return;
      const response = await evaluateWCAG(this.getTabId);
      [wcagResult, chatbotWcagResult] = response.data;
      this.setWCAG(wcagResult);
      chatbotWcagResult && this.setChatbotWCAG(chatbotWcagResult);
    }
    if (modules.cui) {
      this.state = 'Evaluating CUI module';
      if (this.cancel) return;
      const response = await evaluateCUI(this.getTabId);
      [cuiResult, chatbotCuiResult] = response.data;
      this.setCUI(cuiResult);
      chatbotCuiResult && this.setChatbotCUI(chatbotCuiResult);
    }
    this.state = 'Ending evaluation';
    if (this.cancel) return;
    const response = await endEvaluation(this.getTabId);
    [summary, chatbotSummary] = response.data;
    this.setSummary(summary);
    chatbotSummary && this.setChatbotSummary(chatbotSummary);
    chatbotSummary && this.setEvaluateChatbot(true);
    this.setStartingFilter(modules);
    this.setCurrentRule(this.getFirstRule());
    if (this.cancel) return;
    this.$router.push('/evaluation');
  },
};
</script>

<style scoped>

.button-container {
  margin-top: 20px;
  width: 50%;
  display: flex;
  justify-content: center;
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
</style>
