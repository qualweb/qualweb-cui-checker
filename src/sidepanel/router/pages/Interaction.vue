<template>
  <div class="container">
    <h1>Interaction</h1>
    <Loading :message="state">
      <template v-slot:additional-info>
        <p class="state">{{ isCanceled || isSkipping ? '' : rule }}</p>
        <p class="state">{{ isCanceled || isSkipping ? '' : title }}</p>
        <p class="state">{{ isCanceled ? 'Canceling...' : '' }}</p>
      </template>
      <template v-slot:buttons>
        <div class="button-container">
          <ButtonStyled @click="skipObjective" :disabled="isCanceled || isSkipping" label="Skip Rule" />
          <ButtonStyled
            :primary="false"
            @click="cancelInteraction"
            :disabled="isCanceled"
            label="Cancel Interaction"
          />
        </div>
      </template>
    </Loading>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Loading from '../../components/Loading.vue';
import ButtonStyled from '../../components/ButtonStyled.vue';
import { STATUS } from '../../../messaging/message-types';
import { ACTION_PORT } from '../../../background/action-type';
import { APIError,  defaultErrorHandler, InteractionListenerFailedError, InteractionPortConnectionError } from '../../../errors/error.handler.sidepanel';

export default {
  name: 'Interaction',
  components: { Loading, ButtonStyled },
  computed: {
    ...mapGetters(['getTabId','getSelectors','isCuiSpeechTestsEnabled']),
  },
  methods: {
    ...mapActions(['setInteractionInitialized','']),
    async cancelInteraction() {
     this.isCanceled = true;

     const result = await cancelInteraction(this.getTabId);
     if(result.status === STATUS.ERROR){
      handleApiErrorSidepanel({
        apiError: new APIError(result.message),
        router: this.$router
      });
     }

     this.isCanceled = false;
     
    },
    async skipObjective() {
      this.state = 'Skipping objective...';
      this.isSkipping = true;
      const result = await skipObjectiveInteraction(this.getTabId);
      console.log('Result after skipping objective:', result);
      this.isSkipping = false;
      if(result && result.status === STATUS.ERROR){
        const disconnect = () => {
          this._port.disconnect();
        };
        defaultErrorHandler({ error: result, callback: disconnect, router: this.$router });
      }
      this.state = 'Objective skipped.';
     
    },
  },
  data() {
    return {
      state: 'Starting interaction.',
      rule: '',
      title: '',
      isCanceled: false,
      isSkipping: false,
    };
  },
  async mounted() {
    this.setInteractionInitialized(true);
    this._port = await prepareCommunicationBackground();
    if (!this._port) {
      this.state = 'Failed to connect.';
      throw new InteractionPortConnectionError();
    }
  const dispatchOnCriticalError = async () => {
                 sendActionShowNotification(this.getTabId,'Selectors will be reset, please detect chatbot again.');
                 await new Promise(resolve => setTimeout(resolve, 2000));
                 sendActionHideNotification(this.getTabId);
                 await this.$store.dispatch('forgetChatbotSelectors');
                 await  this.$store.dispatch('setSelectorsDetected', false);

            };  
  const settings = await getQualWebSettings();
  const isSpeechTestsEnabled = this.isCuiSpeechTestsEnabled;
  const data = { isSpeechTestsEnabled: isSpeechTestsEnabled, settings: settings.options };

  this._port.onMessage.addListener((msg) => {
    if(msg.action === ACTION_PORT.READY){

        this._port.postMessage({ action: ACTION_PORT.START_INTERACTION, data: data });

    }else if (msg.action === ACTION_PORT.START_INTERACTION) {

      startLLMInteraction(this.getTabId, this.getSelectors, isSpeechTestsEnabled).then((response) => {
      console.log('LLM interaction started:', response);

        if (response.status === STATUS.ERROR) {
          this.state = 'Failed';
          const disconnectTimeout = async () => {
              this._port.disconnect();
              await new Promise(resolve => setTimeout(resolve, 500));
              
            };
   
           defaultErrorHandler({ error: response, storeDispatchCallback: dispatchOnCriticalError, callback: disconnectTimeout, router: this.$router });
        
        }
      }).catch(async (error) => {
        console.log('Error on Listener LLM interaction:', error);
        
        this.state = 'Failed';
        this._port.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
        throw new InteractionListenerFailedError();
      });

    } else if (msg.action === ACTION_PORT.END_INTERACTION) {

      this._port.disconnect();
      this.$router.push('/');

    } else if (msg.status === STATUS.ERROR) {

      this.state = 'Error: ' + msg.message;
      
      defaultErrorHandler({ error: msg, storeDispatchCallback: dispatchOnCriticalError, router: this.$router });
      this._port.disconnect();
      return;
    } else {
      const { rule = '', title = '', status = '' } = msg.data || {};
      this.rule = rule;
      this.title = title;
      this.state = status;
    }
  });
  this._port.onDisconnect.addListener(() => {
    console.log('Port disconnected');
    this.$router.push('/');
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
  height: 100%;
  display: flex;

  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}
.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 250px;
}
</style>
