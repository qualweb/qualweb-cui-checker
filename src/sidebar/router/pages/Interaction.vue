<template>
  <div class="container">
    <div>
      <div class="loader"></div>
        <h2>Status</h2>
        <p class="state">{{ isCanceled ? "" : rule }}</p>
        <p class="state">{{ isCanceled ? "Canceling..." : state }}</p>
      <div class="button-container">
      <button class="button-neutral" @click="cancelInteraction" :disabled="isCanceled">Cancel</button>  
      <button class="button-primary" @click="skipObjective"  :disabled="isCanceled">Skip Rule</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'Interaction',
  methods: {
    ...mapActions([]),
    ...mapGetters([]),
    skipRule() {
      if (this._port) {
        this._port.postMessage("skip");
      }
    
    },
    cancelInteraction() {
      if (this._port) {
        this._port.postMessage("cancel");
        this.isCanceled = true;  
      }


    },
    skipObjective() {
      if (this._port) {
        this._port.postMessage("skip");

      }


    }
  },
  data() {
    return {
      state: 'Starting evaluation',
      rule: '',
      isCanceled:false
    };
  },
  async mounted() {
    this._port = await startInteraction();
    console.log('Connected to evaluation', this.port);
    // Make bi-directional connection to tab
    startLLMInteraction();
    this._port.onMessage.addListener((msg) => {

      if(msg.status==="complete"){
        this._port.disconnect();
        this.$router.push('/ready');

      } else {
      // {rule,status}
      const { rule, status } = msg;
      this.rule = rule;
      this.state = status;      
      }
    });
    
    
  }
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
.button-neutral {
  width: 100%;
  padding: 10px;
  background-color: #5a5654;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-neutral:hover {
  background-color: #75706e;

}

.button-primary {
  width: 100%;
  padding: 10px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-primary:hover {
  background-color: #ff6a00;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
