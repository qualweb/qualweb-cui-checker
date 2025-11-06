<template>
  <div class="bigContainer">
    <div class="container">
      <div>
      <div class="position-icon-menu">

        <span class="material-symbols-outlined position-icon-help rotatable" :class="{ rotated: isDropdownOpen }"  @click="toggleDropdown">
        menu
        </span>
  
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <ul>
          <li @click="onHelpClick">Help</li>
          <li @click="forgetSelectors">Forget Chatbot</li>
        </ul> 
       </div>
    </div>
      <span @click="onSettingsClick" class="material-symbols-outlined position-icon-settings">
        settings
      </span>
      </div>
      <h1 class="title">QUALWEB CUI CHECK</h1>
      <img class="logo" src="/dist/icons/logoQW.png" alt="Qualweb Logo" />
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
        <button @click="LLMInteraction" :disabled="generateResponsesActive">
          Start Interaction
        </button>
          <button @click="LLMSoundInteraction" :disabled="generateResponsesActive">
          Start Sound Interaction
        </button>
        <button id="evaluateButton" @click="onEvaluateClick" :disabled="isDisabled">
          Evaluate Chatbot Accessibility
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Checkbox from '../../components/Checkbox.vue';

const store = useStore();
const router = useRouter();

const generateResponsesActive = ref(true);

const actValue = ref(false);
const wcagValue = ref(false);
const cuiValue = ref(false);
const isDropdownOpen = ref(false);

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
  await resetDataContentScript();
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
.position-icon-settings {
  position: absolute;
  top: 12px;
  right: 20px;
  cursor: pointer;
}
.position-icon-menu {
  position: absolute;
  top: 12px;
  left: 20px;
  cursor: pointer;
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
  overflow: auto;
  margin-top: 1rem;
}


.menu-dropdown {
  position: relative; 
  display: inline-block;
}


.rotatable {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}

.rotatable.rotated {
  transform: rotate(90deg);
}
.dropdown-menu {
  position: absolute;
  top: 100%; 
  left: 0;
  z-index: 10; 
  background-color: #303030;
  border: 1px solid #ccc;
  width: 8rem;
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
  padding: 10px;
}
.dropdown-menu li:hover {
  background-color: #575757;
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
