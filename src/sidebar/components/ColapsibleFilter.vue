<template>
  <div class="filter">
    <button @click="changeState" type="button" class="collapsible">
      Filters
      <i v-if="isOpen" class="material-icons dropdownIcon">arrow_drop_up</i>
      <i v-else class="material-icons dropdownIcon">arrow_drop_down</i>
    </button>

    <transition
      @enter="enter"
      @leave="leave"
    >
      <div v-show="isOpen" class="content">
        <div class="column-outcome border">
          <p>Outcome</p>
          <ul class="module">
            <li>
              <Checkbox
                :idValue="passedIdValue"
                :label="passedLabel"
                :bgColor="passedColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.passed"
              />
            </li>
            <li>
              <Checkbox
                :idValue="failedIdValue"
                :label="failedLabel"
                :bgColor="failedColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.failed"
              />
            </li>
            <li>
              <Checkbox
                :idValue="warningIdValue"
                :label="warningLabel"
                :bgColor="warningColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.warning"
              />
            </li>
            <li>
              <Checkbox
                :idValue="inapplicableIdValue"
                :label="inapplicableLabel"
                :bgColor="bgColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.inapplicable"
              />
            </li>
          </ul>
        </div>

        <div class="column-module border">
          <p>Module</p>
          <ul class="module">
            <li>
              <Checkbox
                :idValue="actIdValue"
                :label="actLabel"
                :bgColor="bgColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.act"
              />
            </li>
            <li>
              <Checkbox
                :idValue="tecniquesIdValue"
                :label="tecniquesLabel"
                :bgColor="bgColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.wcag"
              />
            </li>
            <li>
              <Checkbox
                :idValue="cuiIdValue"
                :label="cuiLabel"
                :bgColor="bgColor"
                :checkColor="checkColor"
                @toggle:check="updateFilter"
                v-model="filter.cui"
              />
            </li>
          </ul>
        </div>

        <div class="column-eval">
          <p>Evaluation Type</p>
          <ul class="evalType">
            <li>
              <Checkbox
                :idValue="chatbotIdValue"
                :label="chatbotLabel"
                :bgColor="bgColor"
                :checkColor="checkColor"
                @toggle:check="updateEvalType"
                v-model="evaluateChatbot"
              />
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import Checkbox from './Checkbox.vue';

const store = useStore();
const isOpen = ref(false);

const actIdValue = 'act';
const actLabel = 'ACT Rules';
const tecniquesIdValue = 'wcag';
const tecniquesLabel = 'WCAG 2.1 Techniques';
const cuiIdValue = 'cui';
const cuiLabel = 'CUI Rules';
const chatbotIdValue = 'chatbot';
const chatbotLabel = 'Chatbot';
const passedIdValue = 'passed';
const passedLabel = 'Passed';
const failedIdValue = 'failed';
const failedLabel = 'Failed';
const warningIdValue = 'warning';
const warningLabel = 'Warning';
const inapplicableIdValue = 'inapplicable';
const inapplicableLabel = 'Inapplicable';
const passedColor = '#46f73f';
const failedColor = '#ff3535';
const warningColor = '#ffd600';
const bgColor = 'white';
const checkColor = 'black';

const filter = computed(() => store.getters.getFilter);
const evaluateChatbot = computed(() => store.getters.getEvaluateChatbot);

const changeState = () => {
  isOpen.value = !isOpen.value;
};

const updateFilter = async (event) => {
  await store.dispatch('setFilter', { key: event.id, value: event.checked });
};

const updateEvalType = async (event) => {
  await store.dispatch('setEvaluateChatbot', event.checked);
};

// Funções de animação de altura dinâmica
const enter = (el) => {
  el.style.height = '0';
  el.style.opacity = '0';
  el.offsetHeight; // trigger reflow
  el.style.transition = 'height 0.4s ease, opacity 0.4s ease';
  el.style.height = (el.scrollHeight+10) + 'px';
  el.style.opacity = '1';
};

const leave = (el) => {
  el.style.height = (el.scrollHeight+10) + 'px';
  el.offsetHeight; // trigger reflow
  el.style.transition = 'height 0.4s ease, opacity 0.4s ease';
  el.style.height = '0';
  el.style.opacity = '0';
};
</script>

<style scoped>
.filter {
  padding: 0.2rem;
}

.collapsible {
  background-color: #383838;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.6rem 1rem;
  width: 100%;
  border: 0.01em solid #888585;
  border-radius: 0.2rem;
  margin: 0.2rem auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
}

.dropdownIcon {
  color: white;
}

.content {
  overflow: hidden;
  margin-bottom: 0.2rem;
  background-color: #383838;
  border-radius: 0.2rem;
  border: 0.01em solid #888585;
  display: flex;
  flex-direction: row;
}

.column-outcome,
.column-module,
.column-eval {
  padding: 0.5rem;
  font-size: 0.8rem;
  flex-grow: 1;
}

.column-outcome { width: 38%; }
.column-module { width: 35%; }
.column-eval { width: 27%; }

.border { border-right: 0.01em solid white; }

p {
  font-size: 1rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  text-align: center;
  margin-top: 0;
}
</style>
