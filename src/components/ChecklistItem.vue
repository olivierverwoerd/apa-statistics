<template>
  <v-checkbox v-model="checked" :label="label" color="primary"></v-checkbox>
</template>

<script setup>
import { ref, watch } from 'vue';

import { stateStore } from '@/stores/state';
const state = stateStore();

const checked = ref(false);
const label = ref('Item');

watch(checked, (newVal) => {
  if (newVal) {
    state.checklistItems.push(label.value);
  } else {
    const index = state.checklistItems.indexOf(label.value);
    if (index > -1) {
      state.checklistItems.splice(index, 1);
    }
  }
});
</script>

<style lang="scss" scoped>
.v-checkbox {
  margin: 0;
  padding: 0;
}
</style>
