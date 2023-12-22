<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

// this reference line is needed for TS and svg loader. Copy and past where needed
// <reference types="vite-svg-loader" />
import { stateStore } from '@/stores/state';
import CalculationSwitcher from '@/components/CalculationSwitcher.vue';
import ChecklistMenu from '@/components/ChecklistMenu.vue';
import DataPresentation from '@/components/DataPresentation.vue';
import ValueInput from '@/components/ValueInput.vue';
const state = stateStore();

import { ref, computed } from 'vue';

const date = new Date();
const formattedDate = computed(() => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
});
</script>

<template>
  <div class="home">
    <P>
      A user-friendly platform designed to make true A/B statistics a breeze.<br />Specially tailored for academic,
      research, and statistical purposes as it outputs the data in APA format.<br /><br />
      <b>Features:</b><br />
      <i class="g">✔</i>
      A/B (z-test) and Retention test (Bootstap t-test)<br />
      <i class="g">✔</i>
      Unlimited variations<br />
      <i class="g">✔</i>
      Settings for confidence and tails<br />
      <i class="g">✔</i>
      APA output<br />
      <i class="g">✔</i>
      Easy to read data with conclusion<br />
      <i class="g">✔</i>
      SPSS Checked for accuracy<br />
      <i class="g">✔</i>
      Checks for Sample Ratio Mismatch (SRM)<br />
      <i class="g">✔</i>
      Statistical Help<br />
      <i class="g">✔</i>
      100% on device! No data is shared to anyone<br />
      <i class="g">✔</i>
      Free to use without ads<br />
    </P>

    <h2>1. Show checklist / common help</h2>
    <ChecklistMenu />

    <CalculationSwitcher />
    <h2>4. Input</h2>
    <ValueInput />

    <v-col cols="12" class="results">
      <h2>5.Your results</h2>
    </v-col>
    <DataPresentation />

    <h2>6. Cite this page</h2>
    <b>APA</b>
    <p>
      Verwoerd, O. (2023, December 1). <i>APA-generator (Results from data).</i> Apa-statistics. Retrieved
      {{ formattedDate }}, from https://apa-statistics.com
    </p>
    <br />
    <b>Word Citation</b>
    <p>
      Type of Source: Web site<br />
      Author: Olivier Verwoerd<br />
      Name of Web Page: APA-generator (Results from data)<br />
      Name of Web Site: apa-statistics<br />
      Year: 2023<br />
      Month: December<br />
      Day: 21<br />
      Url: https://apa-statistics.com
    </p>
    <br />
    <i>Last update: December 21th, 2023: Initial release</i><br />
  </div>
</template>

<style scoped lang="scss">
h2 {
  padding: 10px 0;
}

.home {
  margin: auto 30px;
  overflow-x: auto;
  width: calc(100vw - 70px);
}

@media screen and (max-width: 800px) {
  .home {
    overflow-x: auto;
    margin: 0px;
    width: 100vw;

    h2 {
      font-size: 30px;
    }
    p {
      font-size: 16px;
    }
  }
}
</style>
