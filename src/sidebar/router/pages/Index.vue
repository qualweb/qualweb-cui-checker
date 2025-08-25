<template>
  <div class="bigContainer">
    <div class="container">
      <span @click="onSettingsClick" class="material-symbols-outlined position-icon">
      settings
      </span>
      <h1 class="title">Chatbot Evaluation</h1>
      
      <div class="button-container">
        <button id="chatButton" @click="interactWithMessages">Send and Receive Messages</button>
        <button id="requestLLMButton" @click="onRequestLLMClick">
          Detect Chatbot
        </button>

        <button @click="startInputVoice">
          Input Voice and Listen for Response
        </button>
        <button @click="LLMInteraction">
          Start LLM Interaction
        </button>
      </div>
      <hr />
      <div class="evaluation-container">
        <Checkbox
          idValue="actRulesCheckbox"
          :label="'ACT Rules'"
          v-model="actValue" 
            @toggle:check="updateEvaluated('act', $event)" 
          bgColor="#e15500"
          checkColor="#ffffff"
        />
        <Checkbox
          idValue="wcagTechniquesCheckbox"
          :label="'WCAG Techniques'"
          v-model="wcagValue"  
          @toggle:check="updateEvaluated('wcag', $event)" 
          bgColor="#e15500"
          checkColor="#ffffff"
        />
        <Checkbox
          idValue="bestPracticesCheckbox"
          :label="'CUI Rules'"
          v-model="cuiValue" 
          @toggle:check="updateEvaluated('cui', $event)" 
          bgColor="#e15500"
          checkColor="#ffffff"
        />
        <button
          id="evaluateButton"
          @click="onEvaluateClick"
          :disabled="isDisabled"
        >
          Evaluate Chatbot
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Checkbox from '../../components/Checkbox.vue';


const store = useStore();
const router = useRouter();

const actValue = ref(false);
const wcagValue = ref(false);
const cuiValue = ref(false);

const evaluated = computed(() => store.getters.getEvaluated);

const isDisabled = computed(() => {
  return !(evaluated.value && (evaluated.value.act || evaluated.value.wcag || evaluated.value.cui));
});

const setEvaluated = async (idValue, value) => {
  
  await store.dispatch('setEvaluated', {
    module: idValue,
    value: value,
  });
};

const onEvaluateClick = () => {
  router.push('/loading');
};

const onSettingsClick = () => {
  chrome.runtime.openOptionsPage();
};

const interactWithMessages = () => {
  typeMessages(messages);
};

const startInputVoice = () => {
  startVoiceInput(messages);
};

const LLMInteraction = () => {
  startLLMInteraction();
};

const onRequestLLMClick = () => {
  router.push('/detecting-chatbot');
};

const updateEvaluated = async (idValue, event) => {

  await setEvaluated(idValue, event.checked);
};

onMounted(() => {
  if (evaluated.value) {
    actValue.value = evaluated.value.act || false;
    wcagValue.value = evaluated.value.wcag || false;
    cuiValue.value = evaluated.value.cui || false;
  }
});
</script>

<style scoped>

.position-icon{
  position: absolute;
  top: 12px;
  right: 20px;
  cursor: pointer;
}

.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24;
}
.bigContainer {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}
.container {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
}

.title {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}
.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 250px;
}
.evaluation-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 250px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #ff6a00;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
hr {
  width: 100%;
  border: none;
  border-top: 1px solid #ffffff;
  margin: 15px 0;
}
label {
  display: flex;
  align-items: center;
  gap: 5px;
}
@media only screen and (max-width: 700px) {
  .container-1 {
    display: flex;
    flex-direction: column;
  }
  .column-2 {
    flex: 2;
  }
  .column-1 {
    flex: 1;
  }
}
</style>
