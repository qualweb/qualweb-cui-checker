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
import { EvaluationError } from '../../../errors/error.handler.sidepanel';
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
    ...mapGetters(['getEvaluated', 'getFirstRule', 'getResultFilter','getSelectors']),
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
      summary,
      chatbotSummary;
      this.state = 'Initializing evaluation';
      try {
       const responseStart = await startEvaluation(this.getTabId, this.getSelectors());
       if(!responseStart || responseStart.status !== 'success') {
         
         throw new Error('Failed to start evaluation');
       }
  
    if (modules.act) {
      this.state = 'Evaluating ACT module';
      if (this.cancel) return;
      const response = await evaluateACT(this.getTabId);
      if(!response || response.status !== 'success') {
        throw new Error('Failed to evaluate ACT module');
      }
      [actResult, chatbotActResult] = response.data;
      this.setACT(actResult);
      chatbotActResult && this.setChatbotACT(chatbotActResult);
    }
    if (modules.wcag) {
      this.state = 'Evaluating WCAG module';
      if (this.cancel) return;
      const response = await evaluateWCAG(this.getTabId);
      if(!response || response.status !== 'success') {
        throw new Error('Failed to evaluate WCAG module');
      }
      [wcagResult, chatbotWcagResult] = response.data;
      this.setWCAG(wcagResult);
      chatbotWcagResult && this.setChatbotWCAG(chatbotWcagResult);
    }
    if (modules.cui) {
      this.state = 'Evaluating CUI module';
      if (this.cancel) return;
      const response = await evaluateCUI(this.getTabId);
      if(!response || response.status !== 'success') {
        throw new Error('Failed to evaluate CUI module');
      }
      [cuiResult, chatbotCuiResult] = response.data;
      this.setCUI(cuiResult);
      chatbotCuiResult && this.setChatbotCUI(chatbotCuiResult);
    }
    this.state = 'Ending evaluation';
    if (this.cancel) return;
    const response = await endEvaluation(this.getTabId);
      if(!response || response.status !== 'success') {
        // TODO Throw Custom Error
        throw new Error('Failed to end evaluation');
      }
   
    [summary, chatbotSummary] = response.data;
    this.setSummary(summary);
    chatbotSummary && this.setChatbotSummary(chatbotSummary);
    chatbotSummary && this.setEvaluateChatbot(true);
    this.setStartingFilter(modules);
    this.setCurrentRule(this.getFirstRule());
    if (this.cancel) return;
    this.$router.push('/evaluation'); } 
    catch (error) {
        console.error('Error during evaluation initialization:', error);
        this.cancel = true;
        this.reset();
        throw new EvaluationError(error.message);
        /*this.$router.push({
            path: '/error',
            query: { error: error.message },
          });
        return;*/
    }
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
