<template>
  <div class="div-container-questions">
    <span class="span-question">{{ question }}</span>
    <div class="button-container">
      <button class="button-primary" @click="actionYes()">Yes</button>
      <button class="button-neutral" @click="actionNo()">No</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionPrompt',
  props: {
    question: {
      type: String,
      required: true,
    },
    actionYes: {
      type: Function,
      required: true,
    },
    actionNo: {
      type: Function,
      required: true,
    },
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
.button-primary {
  width: 100%;
  padding: 10px;
  background-color: #5a5654;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.button-neutral {
  width: 100%;
  padding: 10px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
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
