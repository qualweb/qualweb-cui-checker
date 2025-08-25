<template>
  <div class="bigContainer">
    <div class="container">
  <span @click="onSettingsClick" class="material-symbols-outlined position-icon-settings">
      settings
      </span>
          <span @click="onCloseClick" class="material-symbols-outlined position-icon-close">
      cancel
      </span>
      <h1 class="title">Evaluation Options</h1>
      
  
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
       <button
      id="cancelButton"
      class="button-cancel"
      @click="onCancelClick">Cancel</button>
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

const onCancelClick = () => {
   router.push('/ready');
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
.position-icon-close{
  position: absolute;
  top: 12px;
  right: 20px;
  cursor: pointer;
}
.position-icon-settings{
  position: absolute;
  top: 12px;
  left: 20px;
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
