<template>
  <div class="container">
    <h1>Interaction</h1>
    <Loading :message="state">
      <template v-slot:additional-info>
        <p class="state">{{ isCanceled ? '' : rule }}</p>
        <p class="state">{{ isCanceled ? '' : title }}</p>
        <p class="state">{{ isCanceled ? 'Canceling...' : state }}</p>
      </template>
      <template v-slot:buttons>
        <div class="button-container">
          <ButtonStyled @click="skipObjective" :disabled="isCanceled" label="Skip Rule" />
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
import ButtonStyled from '../../components/ButtonStyled.vue';
import Loading from '../../components/Loading.vue';
export default {
  name: 'Interaction',
  components: { Loading, ButtonStyled },
  computed: {
    ...mapGetters(['getTabId']),
  },
  methods: {
    ...mapActions([]),
    cancelInteraction() {
      if (this._port) {
        this._port.postMessage('cancel');
        this.isCanceled = true;
      }
    },
    skipObjective() {
      if (this._port) {
        this._port.postMessage('skip');
      }
    },
  },
  data() {
    return {
      state: 'Starting interaction',
      rule: '',
      title: '',
      isCanceled: false,
    };
  },
  async mounted() {
    this._port = await prepareCommunicationBackground();
    if (!this._port) {
      setTimeout(() => {
        this.$router.push({
          path: '/error',
          query: { error: 'Failed to connect to background script' },
        });
      }, 500);
      return;
    }
    // Make bi-directional connection to tab
    // async request to start sound interaction
    startLLMSoundInteraction(this.getTabId);
    // set up message listener meanwhile
    this._port.onMessage.addListener((msg) => {
      if (msg.action === 'end_interaction') {
        this._port.disconnect();
        this.$router.push('/');
      } else if (msg.status === 'error') {
        this.state = 'Failed';
        this._port.disconnect();
        setTimeout(() => {
          this.$router.push({
            path: '/error',
            query: { error: msg.message },
          });
        }, 500);
      } else {
        // {rule,status}
        const { rule, title, status } = msg;
        this.rule = rule;
        this.title = title;
        this.state = status;
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
