<template>
  <div class="div-container-questions">
    <span class="span-question">{{ question }}</span>
    <div class="div-btn-actions">
      <button class="btn-action" @click="actionYes()">Yes</button>
      <button class="btn-action" @click="actionNo()">No</button>
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
