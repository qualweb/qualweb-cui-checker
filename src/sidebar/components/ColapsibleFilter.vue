<template>
  <div class="filter">
    <button @click="changeState" type="button" class="collapsible">
      Filters
      <i v-if="isOpen" class="material-icons dropdownIcon">arrow_drop_up</i>
      <i v-else class="material-icons dropdownIcon">arrow_drop_down</i>
    </button>
    <div :class="['content', isOpen ? 'visible' : 'none']">
      <div class="column border">
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
            ></Checkbox>
          </li>
          <li>
            <Checkbox
              :idValue="failedIdValue"
              :label="failedLabel"
              :bgColor="failedColor"
              :checkColor="checkColor"
              @toggle:check="updateFilter"
              v-model="filter.failed"
            ></Checkbox>
          </li>
          <li>
            <Checkbox
              :idValue="warningIdValue"
              :label="warningLabel"
              :bgColor="warningColor"
              :checkColor="checkColor"
              @toggle:check="updateFilter"
              v-model="filter.warning"
            ></Checkbox>
          </li>
          <li>
            <Checkbox
              :idValue="inapplicableIdValue"
              :label="inapplicableLabel"
              :bgColor="bgColor"
              :checkColor="checkColor"
              @toggle:check="updateFilter"
              v-model="filter.inapplicable"
            ></Checkbox>
          </li>
        </ul>
      </div>
      <div class="column border">
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
            ></Checkbox>
          </li>
          <li>
            <Checkbox
              :idValue="tecniquesIdValue"
              :label="tecniquesLabel"
              :bgColor="bgColor"
              :checkColor="checkColor"
              @toggle:check="updateFilter"
              v-model="filter.wcag"
            ></Checkbox>
          </li>
          <li>
            <Checkbox
              :idValue="cuiIdValue"
              :label="cuiLabel"
              :bgColor="bgColor"
              :checkColor="checkColor"
              @toggle:check="updateFilter"
              v-model="filter.cui"
            ></Checkbox>
          </li>
        </ul>
      </div>
      <div class="column">
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
            ></Checkbox>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Checkbox from './Checkbox.vue';

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

const store = useStore();

const filter = computed(() => store.getters.getFilter);

const evaluateChatbot = computed(() => store.getters.getEvaluateChatbot);

const changeState = () => {
  isOpen.value = !isOpen.value;
};

const updateFilter = async (event) => {
  await store.dispatch('setFilter', {
    key: event.id,
    value: event.checked,
  });
};

const updateEvalType = async (event) => {

  await store.dispatch('setEvaluateChatbot', event.checked);
};
</script>

<style scoped>
.dropdownIcon {
  color: white;
}
p {
  font-size: 1.3rem;
  font-family: "Oswald", sans-serif;
  text-transform: uppercase;
  text-align: center;
  margin-top: 0rem;
}
.column {
  width: 33.33%;
  padding: 1rem;
  padding-bottom: 0rem;
}
.border {
  border-right: 0.01em solid white;
}
.filter {
  padding-right: 0.2rem;
  padding-left: 0.2rem;
}
/* Style the button that is used to open and close the collapsible content */
.collapsible {
  background-color: #383838;
  color: white;
  cursor: pointer;
  padding: 0.6rem 1rem;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 1.3rem;
  font-family: "Oswald", sans-serif;
  text-transform: uppercase;
  border: 0.01em solid #888585;
  border-radius: 0.2rem;
  margin-bottom: 0.1rem;
  margin: 0.2rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Style the collapsible content. Note: hidden by default */
.content {
  display: none;
  overflow: hidden;
  margin-bottom: 0.2rem;
  background-color: #383838;
  border-radius: 0.2rem;
  border: 0.01em solid #888585;
  display: flex; /* Added to enable flexbox layout */
  /* flex-wrap: wrap; Allow content to wrap into multiple rows if necessary */
}
.none {
  display: none;
}
.visible {
  display: flex;
  flex-direction: row;
}

.collapsiblePlus:after {
  content: "\02795"; /* Unicode character for "plus" sign (+) */
  float: right;
}

.active:after {
  content: "\2796"; /* Unicode character for "minus" sign (-) */
  float: right;
}
</style>
