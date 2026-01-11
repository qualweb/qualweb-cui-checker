<template>
    <div>
    <a href="#" @click.prevent="exportFile"> <span class="icon">📄</span>JSON</a>
  </div>

</template>

<script>
import { saveAs } from 'file-saver';
import { mapGetters } from 'vuex';
export default {
  name: 'Export',
  emits: ['buttonClicked'],
  methods: {
    ...mapGetters(['getAllData']),
    exportFile() {
      let data = this.getAllData();
      let stringData = JSON.stringify(data, null, 2);
      let blob = new Blob([stringData], {
        type: 'application/json;charset=utf-8',
      });
      saveAs(blob, 'evaluation.json');
      this.$emit('buttonClicked');
    },
  },
};
</script>

<style scoped>
.dropdown-menu a {
  color: #ccc;
  padding: 10px 15px;
  text-decoration: none;
  display: block;
  font-size: 0.95em;
}

.dropdown-menu a:hover {
  background-color: #575757;
}

.dropdown-menu .icon {
  margin-right: 8px;
}
</style>
