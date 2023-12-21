<template>
  <div style="border: 1px solid transparent; margin: 10px">
    <v-row>
      <v-col style="width: 175px; max-width: unset; flex-grow: unset; flex-basis: unset">
        <v-text-field
          size="1"
          v-model.number="state.duration"
          label="Test duration (days)"
          type="number"
          min="0"
        ></v-text-field>
      </v-col>

      <v-col cols="5">
        <v-text-field v-model="state.testName" label="Test name"></v-text-field>
      </v-col>
    </v-row>
  </div>
  In an A/B test, users are subjected to an experiment with control (original version) and variant (new version)
  groups.<br />
  Conversions are the desired actions users take, allowing comparison of effectiveness between these groups.<br /><br />
  <v-divider />
  <br />
  <v-row v-for="(variant, index) in variants" :key="index" align="center">
    <div style="border: 1px solid transparent; margin: 10px; min-width: 400px; width: min(800px, 90vw)">
      <v-row style="margin: 0">
        <input
          type="color"
          v-model="variant.color"
          label="Color"
          style="width: 32px; height: 58px; border-color: transparent"
        />
        <v-text-field v-model="variant.name" label="Variant Name" required></v-text-field>
        <v-btn
          v-if="index != 0 && variants.length >= 3"
          variant="text"
          @click="removeVariant(index)"
          style="height: 55px"
        >
          <v-icon color="error">mdi-close-circle</v-icon>
        </v-btn>
      </v-row>
      <v-row v-if="state.testType == 'z-test'">
        <v-col cols="6">
          <v-text-field
            v-model.number="variant.users"
            label="Users / Sessions"
            type="number"
            min="0"
            :rules="[
              () => {
                if (index == 0 || variant.users == 0) return;
                if (variant.users < 30) {
                  return 'Because a Z-test implies normal distribution, you NEED at least 30 users to use these results.';
                }
                if (state.values[0].users * 1.25 <= variant.users) {
                  return 'This is more than 25% in user size of the control. Your sample size may not be random, (the results will still work)';
                }
                if (state.values[0].users * 0.75 >= variant.users) {
                  return 'This is less than 25% in user size of the control. Your sample size may not be random, (the results will still work)';
                }
                return true;
              },
            ]"
            :error-messages="errorMessages"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="variant.converted"
            label="Conversions"
            type="number"
            min="0"
            :rules="[() => variant.converted <= variant.users || 'More conversions than users is probably an error']"
            :error-messages="errorMessages"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="state.testType == 't-test'">
        <i v-if="index == 0" style="margin-left: 20px">Insert total users / events after variant comma separated</i>
        <v-col cols="12">
          <v-text-field
            v-model.trim="variant.retention"
            label="Retention"
            hint="For example: 100,52,21,15,10,2"
            :rules="[
              () => {
                let regex = /^[0-9,]+$/;
                if (regex.test(variant.retention)) {
                  return checkRetentionInput(variant.retention);
                } else {
                  return 'The input is incorrect, check if there\'re no other characters than numbers and comma\'s';
                }
              },
            ]"
            :error-messages="errorMessages"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-divider />
    </div>
  </v-row>

  <v-row>
    <v-col cols="12" md="7">
      <v-btn @click="addVariant" color="primary">Add Variant</v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue';
import { stateStore } from '@/stores/state';

// Initialize the store
const state = stateStore();

// Use computed to bind the variants to the store's values
const variants = computed(() => {
  return state.values;
});

// Add a new variant
const addVariant = () => {
  let color = '#000000';
  if (state.values.length <= 10) {
    color = state.colorList[state.values.length];
  }

  const newVariant = {
    name: `Variant ${state.values.length}`,
    users: 0,
    converted: 0,
    color: color,
  };
  state.values.push(newVariant);
};

// Remove an existing variant by index
const removeVariant = (index) => {
  if (state.values.length > 2) {
    state.values.splice(index, 1);
  }
};

function checkRetentionInput(input) {
  let test = '' + input;
  let numbers = test.split(',').map(Number);
  let previous = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > previous) {
      return 'The input is incorrect, a number: ' + numbers[i] + ' is bigger than the previous: ' + previous;
    }
    previous = numbers[i];
  }
  return true;
}
</script>
