<template>
  <div class="container">
    <h1>Interaction</h1>
    <Loading :message="state">
      <template v-slot:additional-info>
        <p class="state">{{ isCanceled ? '' : rule }}</p>
        <p class="state">{{ isCanceled ? '' : title }}</p>
        <p class="state">{{ isCanceled ? 'Canceling...' : '' }}</p>
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
import Loading from '../../components/Loading.vue';
import ButtonStyled from '../../components/ButtonStyled.vue';
export default {
  name: 'Interaction',
  components: { Loading, ButtonStyled },
  computed: {
    ...mapGetters(['getTabId']),
  },
  methods: {
    ...mapActions(['setInteractionInitialized']),
    cancelInteraction() {
      if (this._port) {
        this._port.postMessage({ action: 'cancel_interaction' });
        this.isCanceled = true;
      }
    },
    skipObjective() {
      if (this._port) {
        this._port.postMessage({ action: 'skip_objective' });
      }
    },
  },
  data() {
    return {
      state: 'Starting interaction.',
      rule: '',
      title: '',
      isCanceled: false,
    };
  },
  async mounted() {
    this.setInteractionInitialized(true);
    this._port = await prepareCommunicationBackground();
    if (!this._port) {
      console.log('Failed to connect to background script');
      this.state = 'Failed to connect.';
      setTimeout(() => {
        this.$router.push({
          path: '/error',
          query: { error: 'Failed to connect to background script' },
        });
      }, 500);
      return;
    }

    // Make bi-directional connection to tab
    const response = await startLLMInteraction(this.getTabId);

    if (response.status === 'error') {
      this.state = 'Failed';
      setTimeout(() => {
        this._port.disconnect();
        this.$router.push('/ready');
      }, 3000);
      return;
    }

    this._port.onMessage.addListener((msg) => {
      if (msg.action === 'end_interaction') {
        this._port.disconnect();
        this.$router.push('/');
      } else if (msg.status === 'error') {
        this.state = 'Error: ' + msg.message;
        this._port.disconnect();
        console.log('Interaction error:', msg.message);
        setTimeout(() => {
          this.$router.push({
            path: '/error',
            query: { error: msg.message },
          });
        }, 500);
      } else {
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
