<template>
  <div class="div-container-questions">
    <span class="span-question">{{ prompt.question }}</span>
    <div class="button-container">

        <ButtonStyled  @click="prompt.actionPrimary" :label="prompt.titlePrimary"/>
        <ButtonStyled :primary=false @click="prompt.actionNeutral" :label="prompt.titleNeutral"/>

    </div>
  </div>
</template>

<script>
import ButtonStyled from './ButtonStyled.vue';


export default {
  name: 'ActionPrompt',
  components: { ButtonStyled },
  props: {
    prompt: {
    question: {
      type: String,
      required: true,
    },
    titlePrimary: {
      type: String,
      required: true  },
    actionPrimary: {
      type: Function,
      required: true,
    },
    titleNeutral: {
      type: String,
      required: false,
      default: 'Cancel',
    },
    actionNeutral: {
      type: Function,
      required: false,
    }},
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style scoped>
.div-container-questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px;
}
.span-question {
  font-size: 1.5rem;
  margin: 20px;
  text-align: center;
}
.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 250px;
}

.button-primary:hover {
  background-color: #ff6a00;
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
  background-color: #888481;
}
.div-btn-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px;
}
.btn-action {
  cursor: pointer;

  padding: 10px;
  margin: 10px;
}
</style>
