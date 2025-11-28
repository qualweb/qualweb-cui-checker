<template>
  <div class="bigContainer">
    <div class="top-bar">
      <span class="material-symbols-outlined position-icon-help" :class="{ 'menu-open': isDropdownOpen }" @click="toggleDropdown">
        menu
      </span>
      
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <ul>
          <li @click="onHelpClick">Help</li>
          <li @click="forgetSelectors">Forget Chatbot</li>
        </ul> 
      </div>

      <span @click="onSettingsClick" class="material-symbols-outlined position-icon-settings">
        settings
      </span>
    </div>

    <div class="container">
      <h1 class="title">QUALWEB CUI CHECKER</h1>
      <img class="logo" :src="`/${iconFolder}/logoQWSidepanel.webp`" alt="Qualweb Logo" />
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
          @toggle:check="updateEvaluatedCui('cui', $event)"
          bgColor="#e15500"
          checkColor="#ffffff"
        />
      </div>
      <hr />

      <div class="button-container">
        <ButtonStyled v-if="isCuiChecked" @click="LLMInteraction" label="Start Interaction" />
        <ButtonStyled id="evaluateButton" @click="onEvaluateClick" :disabled="!isEvaluationReady" label="Evaluate Chatbot Accessibility" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Checkbox from '../../components/Checkbox.vue';

import ButtonStyled from '../../components/ButtonStyled.vue';
const store = useStore();
const router = useRouter();

const generateResponsesActive = ref(true);

const actValue = ref(false);
const wcagValue = ref(false);
const cuiValue = ref(false);
const isDropdownOpen = ref(false);

const evaluated = computed(() => store.getters.getEvaluated);

const iconFolder = APP_CONFIG.ICONS_FOLDER ;

const isCuiChecked = computed(()=>{

  return  (evaluated.value && (evaluated.value.cui));
});

const isEvaluationReady = computed(()=>{
  // cui check checked
  const cuiCheckedReady = (evaluated.value && (evaluated.value.cui));
  const interactionComplete = store.getters.getInteractionInitialized;

  const commonCheckReady = (evaluated.value && (evaluated.value.act || evaluated.value.wcag)); 



  
  return (commonCheckReady && cuiCheckedReady && interactionComplete) ||(commonCheckReady && !cuiCheckedReady) || (!commonCheckReady && cuiCheckedReady && interactionComplete);
})



const setEvaluated = async (idValue, value) => {
  await store.dispatch('setEvaluated', {
    module: idValue,
    value: value,
  });
};

const onSettingsClick = () => {
  chrome.runtime.openOptionsPage();
};

const onHelpClick = () => {
  router.push('/help');
};

const onEvaluateClick = () => {
  router.push('/loading');
};

const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    }

const LLMInteraction = () => {
  router.push('/interaction');
};

const LLMSoundInteraction = () => {
  router.push('/interaction-sound');
};

const forgetSelectors = async () => {
  await store.dispatch('forgetChatbotSelectors');
  isDropdownOpen.value = false;
  console.log("going to rest data");
  await resetDataContentScript( store.getters.getTabId);
  store.dispatch('setSelectorsDetected',false)
  router.push('/');
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.dropdown-menu');
  const menuIcon = document.querySelector('.position-icon-help');
  if (dropdown && !dropdown.contains(event.target) && !menuIcon.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const updateEvaluated = async (idValue, event) => {
  await setEvaluated(idValue, event.checked);
};

const updateEvaluatedCui = async (idValue, event) => {
  generateResponsesActive.value = !event.checked;
  await setEvaluated(idValue, event.checked);
};

onMounted(() => {
  if (evaluated.value) {
    actValue.value = evaluated.value.act || false;
    wcagValue.value = evaluated.value.wcag || false;
    cuiValue.value = evaluated.value.cui || false;
  }
  document.addEventListener('click', handleClickOutside)
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
});

</script>
<style scoped>
.logo {
  width: auto;
  height: 200px;
  margin-bottom: 20px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #393939;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  transition: background-color 0.2s ease;
}

.top-bar:hover {
  background-color: #4a4a4a;
}

.position-icon-settings,
.position-icon-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #393939;
  color: #ccc;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  font-size: 22px;
  position: relative;
}

.top-bar:hover .position-icon-settings,
.top-bar:hover .position-icon-help {
  background-color: #4a4a4a;
}

.position-icon-settings:hover,
.position-icon-help:hover {
  background: #5a5a5a !important;
  color: white;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.position-icon-settings:active,
.position-icon-help:active {

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.position-icon-help.menu-open {
  background: #4a4a4a;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: 100%; 
  left: 0;
  z-index: 10; 
  background-color: #303030;
  border: 1px solid #ccc;
  min-width: 8rem;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  border-radius: 4px;

}

.dropdown-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.dropdown-menu li:not(:last-child) {
  border-bottom: 1px solid #ccc;
}

.dropdown-menu li { 
  text-align: center;
  cursor: pointer;
  color: white;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s ease;
}

.dropdown-menu li:hover {
  background-color: #4a4a4a;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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
  padding: 1rem;
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