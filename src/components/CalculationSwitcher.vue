<script setup>
import { stateStore } from '@/stores/state';

const state = stateStore();

const setTestType = (testType) => {
  state.testType = testType;
};

const setTailType = (tail) => {
  state.tail = tail;
};

const setLeadingZero = (leadingZero) => {
  state.leadingZero = leadingZero;
};

const setSignificanceLevel = (significanceLevel) => {
  state.significanceLevel = significanceLevel;
};
const setTFilter = (setTFilter) => {
  state.tFilter = setTFilter;
};
const setBootstrapIterations = (bootstrapIterations) => {
  state.bootstrapIterations = bootstrapIterations;
};
</script>

<template>
  <h2>2. Calculation</h2>
  <div>
    <v-btn depressed :color="state.testType === 'z-test' ? 'primary' : 'default'" @click="setTestType('z-test')"
      >A/B Conversion test (Z-Test)
      <v-tooltip activator="parent" location="bottom">Z-Test is like the T-Test only with aggregated data</v-tooltip>
    </v-btn>

    <v-btn depressed :color="state.testType === 't-test' ? 'primary' : 'default'" @click="setTestType('t-test')"
      >A/B Retention / Event per interval test (Bootstrapped T-Test)
      <v-tooltip activator="parent" location="bottom">Allows to calculate the retentions of the variants</v-tooltip>
    </v-btn>
  </div>
  <br />
  <h2>3. Settings</h2>

  <div v-if="state.testType === 't-test'">
    <v-btn depressed :color="state.tFilter === 0 ? 'primary' : 'default'" @click="setTFilter(0)"
      >Don't trim data
    </v-btn>

    <v-btn depressed :color="state.tFilter === 1 ? 'primary' : 'default'" @click="setTFilter(1)"
      >Trim 1%
      <v-tooltip activator="parent" location="bottom">Removes the top 1% of the users to prevent outliers</v-tooltip>
    </v-btn>

    <v-btn depressed :color="state.tFilter === 5 ? 'primary' : 'default'" @click="setTFilter(5)"
      >Trim 5%
      <v-tooltip activator="parent" location="bottom">Removes the top 5% of the users to prevent outliers</v-tooltip>
    </v-btn>

    <v-btn depressed :color="state.tFilter === 10 ? 'primary' : 'default'" @click="setTFilter(10)"
      >Trim 10%
      <v-tooltip activator="parent" location="bottom">Removes the top 10% of the users to prevent outliers</v-tooltip>
    </v-btn>
  </div>
  <div v-if="state.testType === 't-test'">
    <br />
    <v-btn
      depressed
      :color="state.bootstrapIterations === 1000 ? 'primary' : 'default'"
      @click="setBootstrapIterations(1000)"
      >1000 iterations (fast)
    </v-btn>

    <v-btn
      depressed
      :color="state.bootstrapIterations === 10000 ? 'primary' : 'default'"
      @click="setBootstrapIterations(10000)"
      >10,000 iterations
    </v-btn>
    <v-btn
      depressed
      :color="state.bootstrapIterations === 100000 ? 'primary' : 'default'"
      @click="setBootstrapIterations(100000)"
      >100,000 iterations
    </v-btn>
    <v-btn
      depressed
      :color="state.bootstrapIterations === 1000000 ? 'primary' : 'default'"
      @click="setBootstrapIterations(1000000)"
      >1,000,000 iterations (better)
    </v-btn>
  </div>
  <div v-if="state.testType === 'z-test'">
    <v-btn depressed :color="state.tail === 'two' ? 'primary' : 'default'" @click="setTailType('two')"
      >Two-tailed test (Variations are different)
      <v-tooltip activator="parent" location="bottom"
        >Two-tailed test shows evidence that the control and variation are different</v-tooltip
      >
    </v-btn>

    <v-btn depressed :color="state.tail === 'one' ? 'primary' : 'default'" @click="setTailType('one')"
      >One-tailed test (Variation is better)
      <v-tooltip activator="parent" location="bottom"
        >One-tailed test shows evidence if variation is better than the control.</v-tooltip
      >
    </v-btn>
  </div>
  <br />
  <div>
    <v-btn depressed :color="!state.leadingZero ? 'primary' : 'default'" @click="setLeadingZero(false)"
      >No leading zero (APA)
      <v-tooltip activator="parent" location="bottom"
        >Two-tailed test shows evidence that the control and variation are different</v-tooltip
      >
    </v-btn>

    <v-btn depressed :color="state.leadingZero ? 'primary' : 'default'" @click="setLeadingZero(true)"
      >Leading zero (Andy Field mode)
      <v-tooltip activator="parent" location="bottom"
        >One-tailed test shows evidence if variation is better than the control.</v-tooltip
      >
    </v-btn>
  </div>
  <br />
  <div>
    <v-btn depressed :color="state.significanceLevel == 95 ? 'primary' : 'default'" @click="setSignificanceLevel(95)"
      >95% confidence (p &lt .05)
    </v-btn>
    <v-btn depressed :color="state.significanceLevel == 99 ? 'primary' : 'default'" @click="setSignificanceLevel(99)"
      >99% confidence (p &lt .01)
    </v-btn>
    <v-btn depressed :color="state.significanceLevel == 90 ? 'primary' : 'default'" @click="setSignificanceLevel(90)"
      >90% confidence (p &lt .10)
    </v-btn>
  </div>
</template>

<style lang="scss" scoped>
.v-btn + .v-btn {
  margin-left: 10px;
}

@media screen and (max-width: 800px) {
  .v-btn {
    min-width: 0px;
    padding: 2px;
    font-size: 14px;
  }
}
</style>
