<template>
  <div>
    <span>{{ question }}</span>
    <div>
      <button @click="actionYes()">Yes</button>
      <button @click="actionNo()">No</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActionPrompt",
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
.state {
  text-align: center;
}
</style>
