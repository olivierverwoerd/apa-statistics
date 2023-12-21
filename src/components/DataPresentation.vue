<script setup>
//////////////////////////////////////////// NOTE ////////////////////////////////////////////////
// This could be a lot cleaner
// If this gets some traffic I'll clean this up
// I focused more on accuracy than code optimization
//////////////////////////////////////////// NOTE ////////////////////////////////////////////////

import { computed, ref, onMounted, watch } from 'vue';
import { stateStore } from '@/stores/state';

import { daysToString } from '@/utils/timeToSting';
import jStat from 'jstat';
import * as ss from 'simple-statistics';
import { mean, quantileSeq, pickRandom } from 'mathjs';
import * as d3 from 'd3';

// Initialize the store
const state = stateStore();

// Use computed to bind the variants to the store's values
const variants = computed(() => {
  return state.values;
});

const zLookup = {
  one: {
    90: 1.281551,
    95: 1.644853,
    99: 2.326348,
  },
  two: {
    90: 1.644853,
    95: 1.959964,
    99: 2.575829,
  },
};

function formatOutput(number, addStars = false) {
  let str = number.toString();
  if (addStars) {
    if (number < 0.05) {
      str += '*';
    }
    if (number < 0.01) {
      str += '*';
    }
    if (number < 0.001) {
      str += '*';
    }
  }
  if (state.leadingZero == true) return str;
  if (str.startsWith('0.')) {
    return str.slice(1);
  }
  return str;
}

function cr(users, converted) {
  return converted / users;
}

function se(users, converted) {
  return Math.sqrt((cr(users, converted) * (1 - cr(users, converted))) / users);
}

function sd(users, converted) {
  return Math.sqrt(cr(users, converted) * (1 - cr(users, converted)));
}

function seDiff(users_control, converted_control, users, conversions) {
  return Math.sqrt(Math.pow(se(users_control, converted_control), 2) + Math.pow(se(users, conversions), 2));
}

function power(users_control, converted_control, users, converted) {
  if (state.tail == 'two' && cr(users, converted) < cr(users_control, converted_control)) {
    return (
      (1 -
        jStat.normal.cdf(
          (cr(users, converted) +
            se(users, converted) * zLookup[state.tail][state.significanceLevel] -
            cr(users_control, converted_control)) /
            se(users_control, converted_control),
          0,
          1,
        )) *
      100
    );
  }
  return (
    (1 -
      jStat.normal.cdf(
        (cr(users_control, converted_control) +
          se(users_control, converted_control) * zLookup[state.tail][state.significanceLevel] -
          cr(users, converted)) /
          se(users, converted),
        0,
        1,
      )) *
    100
  );
}

function z(users_control, converted_control, users, converted) {
  return (
    (cr(users, converted) - cr(users_control, converted_control)) /
    seDiff(users_control, converted_control, users, converted)
  );
}

function p(users_control, converted_control, users, converted) {
  let pv = 1 - jStat.normal.cdf(Math.abs(z(users_control, converted_control, users, converted)), 0, 1);
  if (state.tail == 'two') {
    if (pv > 0.5) {
      pv = 2 * (1 - pv);
    } else {
      pv = 2 * pv;
    }
  }
  return pv;
}
function ll(users, converted) {
  return cr(users, converted) - 1.96 * se(users, converted);
}
function ul(users_control, converted_control, users, converted) {
  return cr(users, converted) + 1.96 * se(users, converted);
}

function conclusion(users_control, converted_control, users, converted) {
  let pv = p(users_control, converted_control, users, converted);
  let powerv = power(users_control, converted_control, users, converted);

  if (pv < 1 - state.significanceLevel / 100 && powerv >= 80) {
    if (cr(users, converted) > cr(users_control, converted_control)) {
      return "It's Significantly better";
    } else {
      return "It's Significantly worse";
    }
  } else if (pv > 1 - state.significanceLevel / 100 && powerv < 80) {
    return "There's no difference";
  } else if (pv > 1 - state.significanceLevel / 100 && powerv > 80) {
    return "This isn't a good test";
  }
  if (pv < 1 - state.significanceLevel / 100 && powerv >= 80) {
    if (cr(users, converted) > cr(users_control, converted_control)) {
      return "It's not significantly better and you can't say there's no difference ";
    } else {
      return "It's not significantly worse and you can't say there's no difference ";
    }
  }
}

async function tableToClipboard(elementId) {
  var urlField = document.getElementById(elementId);
  var textToCopy = urlField.innerText;
  await navigator.clipboard.writeText(textToCopy);
}

function conclusionT(p, improvement) {
  if (p < 1 - state.significanceLevel / 100) {
    if (improvement > 1) {
      return "It's Significantly better";
    } else {
      return "It's Significantly worse";
    }
  }
  return "It's not significant";
}

//Chart
const width = 800;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 60 };
let DensitySVG = ref(null);

const generateData = (cr, sd, precision = 0.001, cutoff = 10) => {
  const variance = Math.pow(sd, 2);
  const scale = 1 / Math.sqrt(2.0 * Math.PI * variance);
  const dist = d3
    .range(-cr / cutoff, cr + cutoff, precision)
    .map((x) => [x, scale * Math.exp(-Math.pow(x - cr, 2) / (2 * variance))]);
  return dist;
};

watch(
  () => state.values,
  () => {
    drawGraph();
  },
  { deep: true },
);

watch(
  () => state.testType,
  () => {
    drawGraph();
  },
  { deep: true },
);

const drawGraph = () => {
  const svg = d3.select(DensitySVG.value);
  const values = state.values;

  var datasets = [];

  var lowX = 1;
  var highX = 0;

  if (state.testType == 'z-test') {
    for (let item of state.values) {
      let low = cr(item.users, item.converted) - 4 * se(item.users, item.converted);
      let high = cr(item.users, item.converted) + 4 * se(item.users, item.converted);
      if (low < lowX) {
        lowX = low;
      }
      if (high > highX) {
        highX = high;
      }
    }
  }

  if (state.testType == 't-test' && state.tValues) {
    for (let item of state.tValues) {
      let low = jStat.mean(item) - 4 * jStat.stdev(item);
      let high = jStat.mean(item) + 4 * jStat.stdev(item);
      if (low < lowX) {
        lowX = low;
      }
      if (high > highX) {
        highX = high;
      }
    }
    if (lowX < 0) {
      lowX = 0;
    }
  }

  if (state.testType == 'z-test') {
    datasets = values.map((val) => ({
      ...val,
      data: generateData(cr(val.users, val.converted), se(val.users, val.converted)),
    }));
  }

  if (state.testType == 't-test' && state.tValues && state.values && state.tValues.length == state.values.length) {
    datasets = values.map((val, index) => ({
      ...val,
      data: generateData(jStat.mean(state.tValues[index]), jStat.stdev(state.tValues[index]), state.graphDetail, highX),
    }));
  }
  svg.selectAll('*').remove();

  // ledgend
  const legendG = svg.append('g').attr('transform', `translate(${width}, ${margin.top})`);

  const legendSize = 16;
  const legendSizeX = 175;
  const legendSizeY = 5;
  const legendSpace = 20;

  const x = d3
    .scaleLinear()
    .domain([lowX, highX])
    .range([margin.left, width - margin.right]);
  const yMax = d3.max(datasets, (ds) => d3.max(ds.data, (d) => d[1]));
  const y = d3
    .scaleLinear()
    .domain([0, 1.1 * yMax])
    .range([height - margin.bottom, margin.top]);

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8))
    .append('text')
    .attr('x', width / 2 + 75)
    .attr('y', 35)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text(state.testType == 't-test' ? 'Retention per user ' : 'Conversion rate');

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .append('text')
    .attr('x', -margin.left + 5)
    .attr('y', 5)
    .attr('dy', '1em')
    .attr('text-anchor', 'start')
    .text('Density');

  const line = d3
    .line()
    .defined((d) => !isNaN(d[1]))
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  datasets.forEach(({ data, color, name }, i) => {
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line)
      .append('text')
      .attr('text-anchor', 'start')
      .text(name);

    // Create the legend
    const legend = svg
      .selectAll('.legend')
      .data(datasets)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        return 'translate(0,' + i * legendSpace + ')';
      });

    legend
      .append('rect')
      .attr('x', width - legendSize - legendSizeX)
      .attr('width', legendSize)
      .attr('height', legendSize)
      .style('fill', (d) => d.color);

    legend
      .append('text')
      .attr('x', width - legendSize - legendSizeX + 30)
      .attr('y', legendSize + legendSizeY - 10)
      .attr('style', 'font-size: 14px;')
      .text((d) => d.name);
  });
};

onMounted(() => {
  drawGraph();
});

function interpretCohensD(d) {
  if (d < 0.01) {
    return 'Negligible effect size';
  } else if (d < 0.2) {
    return 'Very small effect size';
  } else if (d < 0.5) {
    return 'Small effect size';
  } else if (d < 0.8) {
    return 'Medium effect size';
  } else if (d < 1.2) {
    return 'Large effect size';
  } else if (d < 2.0) {
    return 'Very large effect size';
  } else {
    return 'Huge effect size';
  }
}

function getRawData(asArray = false) {
  let values = '';
  if (asArray) {
    values += 'values = [';

    for (let item of state.valuesRetention) {
      values += '[' + item + '],\n';
    }
    values += ']';
  } else {
    for (let item of state.valuesRetention) {
      values += item + '\n';
    }
  }

  navigator.clipboard.writeText(values);
}

function startBootstrap() {
  setTimeout(() => {
    state.bootstrapActive = true;
  }, 50);
  setTimeout(() => {
    state.tValues = state.valuesRetention;
    state.bValues = [];
    console.log('Start bootstrap');
    for (var index = 1; index < state.tValues.length; index++) {
      bootstrap(state.tValues[0], state.tValues[index]);
    }

    setTimeout(() => {
      state.bootstrapActive = false;
      drawGraph();
    }, 10);
  }, 300);
}

function bootstrap(control, variation) {
  let nBootstraps = state.bootstrapIterations;
  let bootstrapDiffs = [];

  for (let i = 0; i < nBootstraps; i++) {
    let bootstrapControl = pickRandom(control, control.length);
    let bootstrapX = pickRandom(variation, variation.length);

    let bootstrapDiff = mean(bootstrapControl) - mean(bootstrapX);
    bootstrapDiffs.push(bootstrapDiff);
  }
  // Calculate pooled standard deviation
  let df = control.length + variation.length - 2;
  let sp = Math.sqrt(
    ((control.length - 1) * Math.pow(ss.sampleStandardDeviation(control), 2) +
      (variation.length - 1) * Math.pow(ss.sampleStandardDeviation(variation), 2)) /
      df,
  );

  // Compute Cohen's d
  let d = Math.abs((mean(control) - mean(variation)) / sp);
  let lowerBound = quantileSeq(bootstrapDiffs, 0.025);
  let upperBound = quantileSeq(bootstrapDiffs, 0.975);
  let t_statistic = ss.tTestTwoSample(control, variation);
  let observedDifference = mean(control) - mean(variation);
  let bias = mean(bootstrapDiffs) - observedDifference;
  let standardError = ss.standardDeviation(bootstrapDiffs);

  //calculate the degrees of freedom for the t-test
  let p = jStat.ttest(t_statistic, df, 2);
  state.bValues.push({
    p: p,
    df: df,
    t: t_statistic,
    se: standardError,
    meanDiff: mean(bootstrapDiffs),
    bias: bias,
    ll: lowerBound,
    ul: upperBound,
    d: d,
    bootstrapDiffs: bootstrapDiffs,
  });
}

function changeGraphDetail(up = false) {
  if (up) {
    if (state.graphDetail > 0.00001) {
      state.graphDetail = state.graphDetail / 10;
      drawGraph();
    }
  } else {
    if (state.graphDetail < 0.1) {
      state.graphDetail = state.graphDetail * 10;
      drawGraph();
    }
  }
}

async function svgToClipboard(elementId) {
  var svg = document.getElementById(elementId);
  var serializer = new XMLSerializer();
  var svgStr = serializer.serializeToString(svg);
  await navigator.clipboard.writeText(svgStr);
}

function svgToClipboardAsImage(elementId) {
  var svg = document.getElementById(elementId);
  var serializer = new XMLSerializer();
  var svgStr = serializer.serializeToString(svg);

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(function (blob) {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]);
    });
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
}
</script>

<template>
  <i>Note: All variant results are compared to the control</i>
  <br />
  <div v-if="state.testType == 'z-test'">
    <h3>Your APA formatted table</h3>
    <v-rows>
      <v-col cols="12" md="5" id="z-apa">
        <i>Z-test {{ state.testName.toLowerCase() }} over {{ daysToString(state.duration) }} </i>
        <table>
          <thead>
            <tr>
              <th class="text-left table-upperline">Variant</th>
              <th class="text-left table-upperline"><i>N</i></th>
              <th class="text-left table-upperline"><i>M</i></th>
              <th class="text-left table-upperline"><i>SD</i></th>
              <th class="text-left table-upperline"><i>SE</i></th>
              <th class="text-left table-upperline"><i>Power</i></th>
              <th class="text-left table-upperline"><i>z</i></th>
              <th class="text-left table-upperline"><i>p</i></th>
              <th class="text-left table-upperline" colspan="2">95% CI</th>
            </tr>
            <tr class="table-underline">
              <th class="text-left"></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left table-upperline"><i>LL</i></th>
              <th class="text-left table-upperline"><i>UL</i></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(variant, index) in variants"
              :key="`table-${index}`"
              :class="index == variants.length - 1 ? 'table-underline' : ''"
            >
              <td>{{ variant.name }}</td>
              <td>{{ variant.users }}</td>
              <td>{{ cr(variant.users, variant.converted).toFixed(4) }}</td>
              <td>{{ sd(variant.users, variant.converted).toFixed(4) }}</td>
              <td>{{ se(variant.users, variant.converted).toFixed(4) }}</td>
              <td v-if="index > 0">
                {{
                  power(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(2)
                }}%
              </td>
              <td v-if="index > 0">
                {{ z(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4) }}
              </td>
              <td v-if="index > 0">
                {{
                  formatOutput(
                    p(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(3),
                    true,
                  )
                }}
              </td>
              <td v-if="index > 0">
                {{
                  formatOutput(
                    ll(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4),
                  )
                }}
              </td>
              <td v-if="index > 0">
                {{
                  formatOutput(
                    ul(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4),
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>

        <i style="color: gray"
          >Note: *p &lt .05. **p &lt .01. ***p &lt .001; CI = confidence interval; LL = lower limit; UL = upper limit</i
        >
      </v-col>
    </v-rows>

    <v-btn
      depressed
      variant="outlined"
      :color="'default'"
      size="small"
      :disabled="state.graphDetail > 0.1"
      @click="tableToClipboard('z-apa')"
      append-icon="mdi-content-copy"
      >Copy table to clipboard
      <template v-slot:append>
        <v-icon></v-icon>
      </template>
    </v-btn>
    <p><br /><br /></p>
    <v-divider /><br />
    <h3>All data</h3>
    <br />
    <v-rows>
      <v-col cols="12" md="5" id="z-all">
        <i>Z-test data about {{ state.testName.toLowerCase() }} over {{ daysToString(state.duration) }}</i>
        <table>
          <thead>
            <tr>
              <th class="text-left table-upperline">Variant</th>
              <th class="text-left table-upperline"><i>N</i></th>
              <th class="text-left table-upperline"><i>Mean</i></th>
              <th class="text-left table-upperline"><i>Conversion rate</i></th>
              <th class="text-left table-upperline"><i>Relative uplift</i></th>
              <th class="text-left table-upperline"><i>Standaard Deviation </i></th>
              <th class="text-left table-upperline"><i>Standaard Error</i></th>
              <th class="text-left table-upperline"><i>Std. error of difference</i></th>
              <th class="text-left table-upperline"><i>Observed power</i></th>
              <th class="text-left table-upperline"><i>z score</i></th>
              <th class="text-left table-upperline"><i>p value</i></th>
              <th class="text-left table-upperline" colspan="2">95% CI</th>
              <th class="text-left table-upperline">
                <i>Accept H<sub>0</sub> ?</i>
              </th>
              <th class="text-left table-upperline">
                <i>Accept H<sub>a</sub> ?</i>
              </th>
              <th class="text-left table-upperline">
                <i>Conclusion</i>
              </th>
            </tr>

            <tr class="table-underline">
              <th class="text-left"></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left table-upperline"><i>LL</i></th>
              <th class="text-left table-upperline"><i>UL</i></th>

              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
              <th class="text-left"><i></i></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(variant, index) in variants"
              :key="`table-${index}`"
              :class="index == variants.length - 1 ? 'table-underline' : ''"
            >
              <td>{{ variant.name }}</td>
              <td>{{ variant.users }}</td>

              <td>{{ cr(variant.users, variant.converted).toFixed(4) }}</td>
              <td>{{ (cr(variant.users, variant.converted) * 100).toFixed(2) }}%</td>
              <td
                v-if="index > 0"
                :class="
                  cr(variant.users, variant.converted) / (state.values[0].converted / state.values[0].users) >= 1
                    ? 'g'
                    : 'r'
                "
              >
                {{
                  (
                    (cr(variant.users, variant.converted) / (state.values[0].converted / state.values[0].users)) * 100 -
                    100
                  ).toFixed(2)
                }}%
              </td>
              <td v-else="index > 0">-</td>
              <td>
                {{ sd(variant.users, variant.converted).toFixed(6) }}
              </td>
              <td>
                {{ se(variant.users, variant.converted).toFixed(6) }}
              </td>
              <td v-if="index > 0">
                {{
                  seDiff(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(6)
                }}
              </td>
              <td
                v-if="index > 0"
                :class="
                  power(state.values[0].users, state.values[0].converted, variant.users, variant.converted) < 80
                    ? 'r'
                    : 'g'
                "
              >
                {{
                  power(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(2)
                }}%
              </td>
              <td v-if="index > 0">
                {{ z(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4) }}
              </td>
              <td
                v-if="index > 0"
                :class="
                  p(state.values[0].users, state.values[0].converted, variant.users, variant.converted) >=
                  1 - state.significanceLevel / 100
                    ? 'r'
                    : 'g'
                "
              >
                {{
                  formatOutput(
                    p(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4),
                    true,
                  )
                }}
              </td>
              <td v-if="index > 0">
                {{
                  formatOutput(
                    ll(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4),
                  )
                }}
              </td>
              <td v-if="index > 0">
                {{
                  formatOutput(
                    ul(state.values[0].users, state.values[0].converted, variant.users, variant.converted).toFixed(4),
                  )
                }}
              </td>
              <td
                v-if="index > 0"
                :class="
                  power(state.values[0].users, state.values[0].converted, variant.users, variant.converted) >= 80
                    ? 'r'
                    : 'g'
                "
              >
                {{
                  power(state.values[0].users, state.values[0].converted, variant.users, variant.converted) >= 80
                    ? '✘'
                    : '✔'
                }}
              </td>
              <td
                v-if="index > 0"
                :class="
                  p(state.values[0].users, state.values[0].converted, variant.users, variant.converted) >=
                  1 - state.significanceLevel / 100
                    ? 'r'
                    : 'g'
                "
              >
                {{
                  p(state.values[0].users, state.values[0].converted, variant.users, variant.converted) >=
                  1 - state.significanceLevel / 100
                    ? '✘'
                    : '✔'
                }}
              </td>
              <td
                v-if="index > 0"
                :class="
                  conclusion(state.values[0].users, state.values[0].converted, variant.users, variant.converted) ==
                  'It\'s Significantly better'
                    ? 'g'
                    : conclusion(state.values[0].users, state.values[0].converted, variant.users, variant.converted) ==
                      'There\'s no difference'
                    ? 'o'
                    : 'r'
                "
              >
                {{ conclusion(state.values[0].users, state.values[0].converted, variant.users, variant.converted) }}
              </td>
            </tr>
          </tbody>
        </table>
      </v-col>
    </v-rows>
    <v-btn
      depressed
      variant="outlined"
      :color="'default'"
      size="small"
      :disabled="state.graphDetail > 0.1"
      @click="tableToClipboard('z-all')"
      append-icon="mdi-content-copy"
      >Copy table to clipboard
      <template v-slot:append>
        <v-icon></v-icon>
      </template> </v-btn
    ><br /><br />

    <i>More information can be found in the statistics list at the "Show checklist / common help"</i>
    <br />
    <v-divider />
    <br />
  </div>

  <div v-if="state.testType == 't-test'">
    <v-btn depressed :color="'success'" @click="startBootstrap()" :loading="state.bootstrapActive"
      >Run / refresh Bootstrapped T-Test</v-btn
    >
    <br /><i v-if="state.bootstrapActive"
      >Just WAIT! This Bootstrapping is done by your browser and it may prompt that this tab is not responding.
    </i>
    <br />

    <b
      v-if="state.tValues && state.values && state.tValues[0] && state.tValues.length != state.values.length"
      style="color: rgb(201, 0, 0)"
      >Something is wrong with the data input. Check to make sure all variants have content.
    </b>
    <br />
    <br />
    <br />

    <h3>Your APA formatted table</h3>
    <i
      >Note {{ 0 }} users out of {{ state.amountOfUsersT }} are removed by trimming.<br />We're using the bootstrap
      method for this test because it's likely that the data isn't normally distributed.</i
    >
    <br />

    <v-rows v-if="state.tValues && state.values && state.tValues[0] && state.tValues.length == state.values.length">
      <v-col cols="12" md="5" id="t-data">
        <i
          >Bootstrap for independent samples t-test data about {{ state.testName.toLowerCase() }} over
          {{ daysToString(state.duration) }}</i
        >
        <table>
          <thead>
            <tr class="table-underline">
              <th class="text-left table-upperline">Variant</th>
              <th class="text-left table-upperline"><i>N</i></th>
              <th class="text-left table-upperline"><i>M</i></th>
              <th class="text-left table-upperline"><i>SD</i></th>
              <th class="text-left table-upperline"><i>SE</i></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(variant, index) in variants"
              :key="`table-${index}`"
              :class="index == variants.length - 1 ? 'table-underline' : ''"
            >
              <td>{{ variant.name }}</td>
              <td>{{ state.tValues[index].length }}</td>
              <td>{{ jStat.mean(state.tValues[index]).toFixed(4) }}</td>
              <td>{{ jStat.stdev(state.tValues[index]).toFixed(4) }}</td>
              <td>{{ (jStat.stdev(state.tValues[index]) / Math.sqrt(state.tValues[index].length)).toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </v-col>
      <v-btn
        depressed
        variant="outlined"
        :color="'default'"
        size="small"
        :disabled="state.graphDetail > 0.1"
        @click="tableToClipboard('t-data')"
        append-icon="mdi-content-copy"
        >Copy table to clipboard
        <template v-slot:append>
          <v-icon></v-icon>
        </template> </v-btn
      ><br />
      <br />
      <v-col cols="12" md="5" id="t-bootstrap">
        <i
          >Bootstrap for independent samples t-test data about {{ state.testName.toLowerCase() }} over
          {{ daysToString(state.duration) }}</i
        >
        <table>
          <thead>
            <tr>
              <th class="text-left table-upperline">Variant compared to Control</th>
              <th class="text-left table-upperline"><i>Mean difference</i></th>
              <th class="text-left table-upperline"><i>Bias</i></th>
              <th class="text-left table-upperline"><i>SE</i></th>
              <th class="text-left table-upperline"><i>df</i></th>
              <th class="text-left table-upperline"><i>p</i></th>
              <th class="text-left table-upperline"><i>t</i></th>
              <th class="text-left table-upperline">Cohen's <i>d</i></th>
              <th class="text-left table-upperline" colspan="2">BCa 95% CI</th>
            </tr>
            <tr class="table-underline">
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left table-upperline"><i>LL</i></th>
              <th class="text-left table-upperline"><i>UL</i></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(variant, index) in state.bValues"
              :key="`table-${index}`"
              :class="index == variants.length - 2 ? 'table-underline' : ''"
            >
              <td>{{ state.values[index + 1].name }}</td>
              <td>{{ variant.meanDiff.toFixed(4) }}</td>
              <td>{{ variant.bias.toFixed(4) }}</td>
              <td>{{ variant.se.toFixed(4) }}</td>
              <td>{{ variant.df }}</td>
              <td>{{ formatOutput(variant.p.toFixed(3), true) }}</td>
              <td>{{ variant.t.toFixed(4) }}</td>
              <td>{{ variant.d.toFixed(4) }}</td>
              <td>{{ variant.ll.toFixed(4) }}</td>
              <td>{{ variant.ul.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
        <i style="color: gray"
          >Note: N = {{ 150 }}. *p &lt .05. **p &lt .01. ***p &lt .001; CI = confidence interval; LL = lower limit; UL =
          upper limit.<br />A negative mean difference means that the variant is better than control and a positive mean
          difference means control is better than the variant.<br />Bootstrap results based off
          {{ state.bootstrapIterations.toLocaleString() }} samples.</i
        >
      </v-col>
    </v-rows>

    <v-btn
      depressed
      variant="outlined"
      :color="'default'"
      size="small"
      :disabled="state.graphDetail > 0.1"
      @click="tableToClipboard('t-bootstrap')"
      append-icon="mdi-content-copy"
      >Copy table to clipboard
      <template v-slot:append>
        <v-icon></v-icon>
      </template> </v-btn
    ><br />
    <br />
    <p><br /><br /></p>
    <v-divider /><br />
    <h3>All data</h3>
    <br />
    <v-rows v-if="state.tValues && state.values && state.tValues[0] && state.tValues.length == state.values.length">
      <v-col cols="12" md="5" id="t-all">
        <i>Bootstrap t-test data about {{ state.testName.toLowerCase() }} over {{ daysToString(state.duration) }}</i>
        <table>
          <thead>
            <tr>
              <th class="text-left table-upperline">Variant compared to Control</th>
              <th class="text-left table-upperline"><i>Mean improvement</i></th>
              <th class="text-left table-upperline"><i>Effect size</i></th>
              <th class="text-left table-upperline"><i>p</i></th>
              <th class="text-left table-upperline">
                <i>Accept H<sub>0</sub> ?</i>
              </th>
              <th class="text-left table-upperline">
                <i>Accept H<sub>a</sub> ?</i>
              </th>
              <th class="text-left table-upperline">
                <i>Conclusion</i>
              </th>
            </tr>
            <tr class="table-underline">
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
              <th class="text-left"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(variant, index) in state.bValues"
              :key="`table-${index}`"
              :class="index == variants.length - 2 ? 'table-underline' : ''"
            >
              <td>{{ state.values[index + 1].name }}</td>
              <td>
                {{
                  (
                    ((jStat.mean(state.tValues[index + 1]) - jStat.mean(state.tValues[index])) /
                      jStat.mean(state.tValues[index])) *
                    100
                  ).toFixed(2)
                }}%
              </td>
              <td>{{ interpretCohensD(variant.d) }}</td>
              <td>{{ formatOutput(variant.p.toFixed(3), true) }}</td>
              <td :class="variant.p <= 1 - state.significanceLevel / 100 ? 'r' : 'g'">
                {{ variant.p <= 1 - state.significanceLevel / 100 ? '✘' : '✔' }}
              </td>
              <td :class="variant.p <= 1 - state.significanceLevel / 100 ? 'g' : 'r'">
                {{ variant.p > 1 - state.significanceLevel / 100 ? '✘' : '✔' }}
              </td>
              <td
                :class="
                  conclusionT(
                    variant.p,
                    ((jStat.mean(state.tValues[index + 1]) - jStat.mean(state.tValues[index])) /
                      jStat.mean(state.tValues[index])) *
                      100,
                  ) == 'It\'s Significantly better'
                    ? 'g'
                    : 'r'
                "
              >
                {{
                  conclusionT(
                    variant.p,
                    ((jStat.mean(state.tValues[index + 1]) - jStat.mean(state.tValues[index])) /
                      jStat.mean(state.tValues[index])) *
                      100,
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </v-col>
    </v-rows>
    <v-btn
      depressed
      variant="outlined"
      :color="'default'"
      size="small"
      :disabled="state.graphDetail > 0.1"
      @click="tableToClipboard('t-all')"
      append-icon="mdi-content-copy"
      >Copy table to clipboard
      <template v-slot:append>
        <v-icon></v-icon>
      </template> </v-btn
    ><br />
    <br />

    <i>More information can be found in the statistics list at the "Show checklist / common help"</i>
    <br />
    <v-btn depressed variant="outlined" :color="'default'" size="x-small" @click="getRawData()"
      >Copy raw data to clipboard
    </v-btn>
    <v-btn depressed variant="outlined" :color="'default'" size="x-small" @click="getRawData(true)"
      >Copy raw data as python array to clipboard
    </v-btn>
    <br />
    <v-divider />
    <br />
  </div>
  <h3 v-if="state.testType == 't-test'">Distribution Graph (simplified not bootstrapped)</h3>
  <h3 v-else>Distribution Graph</h3>
  <v-btn depressed variant="outlined" :color="'default'" size="x-small" @click="drawGraph()"
    >Force refresh graph
  </v-btn>
  <v-btn
    depressed
    variant="outlined"
    :color="'default'"
    size="x-small"
    :disabled="state.graphDetail < 0.0001"
    @click="changeGraphDetail(true)"
    >increase detail
  </v-btn>
  <v-btn
    depressed
    variant="outlined"
    :color="'default'"
    size="x-small"
    :disabled="state.graphDetail > 0.1"
    @click="changeGraphDetail()"
    >decrease detail
  </v-btn>
  <br />
  <br />
  <svg :width="width" :height="height" ref="DensitySVG" id="graph"></svg>
  <br />
  <br /><br />
  <v-btn
    depressed
    variant="outlined"
    :color="'default'"
    size="small"
    :disabled="state.graphDetail > 0.1"
    @click="svgToClipboardAsImage('graph')"
    append-icon="mdi-content-copy"
    >Copy table to clipboard as Image
    <template v-slot:append>
      <v-icon></v-icon>
    </template> </v-btn
  ><br />
  <br />

  <v-btn
    depressed
    variant="text"
    :color="'default'"
    size="x-small"
    :disabled="state.graphDetail > 0.1"
    @click="svgToClipboard('graph')"
    append-icon="mdi-content-copy"
    >Copy graph to clipboard as SVG
    <template v-slot:append>
      <v-icon></v-icon>
    </template>
  </v-btn>
  <br />
</template>

<style>
/* Add some basic styling for the table if needed */
/* table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  color: black;
  vertical-align: baseline;
} */

.table-underline th,
.table-underline td {
  border-bottom: 1px solid black;
}

.table-upperline {
  border-top: 1px solid black;
}

.g {
  color: rgb(74, 222, 74) !important;
}

.o {
  color: orange !important;
}

.r {
  color: red !important;
}
th,
td {
  text-align: left;
  padding: 10px 5px 0 10px;
  margin: 0;
  outline: 0;
}

thead i {
  font-style: italic;
  color: black;
}
</style>
