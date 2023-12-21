<script setup lang="ts">
import { ref } from 'vue';

import { stateStore } from '@/stores/state';

const state = stateStore();

const checkList = ref(state.checklistItems); // Your check list
</script>

<template>
  <v-combobox
    v-model="state.activeChecklist"
    :items="checkList"
    variant="solo"
    style="display: block; width: 560px; flex-grow: 0"
  ></v-combobox>
  <p v-if="state.activeChecklist == 'Statistical help / hints / sources'">
    <b>Hints</b><br />
    You can change to color of the graphs by selecting to color before the name.

    <br /><br />
    <b>Statistics</b><br />
    If data is already being collected, check your data collection settings to make sure everything you want to track is correct.
    Statistics in these tool are calculated using <a href="https://github.com/jstat/jstat">jStat - JavaScript Statistical Library</a><br>
<br/>

<i>Standard Error VS Deviation</i><br/>
    It's almost the same, but SD doesn't take the amount of users in the formula<br/>
    SE = sqrt [ ConversionRatio(1 - ConversionRatio) / n ]<br/>
    SD = sqrt [ ConversionRatio(1 - ConversionRatio) ]<br/>
    <br/>
    <i>Accept hypothesis and Lehr's rule of thumb</i>
  <p>
    You can generally reject H<sub>0</sub> (control vs variant doesn't matter) if p &lt .05 (Type I error / false
    positive)<br />
    and reject H<sub>1</sub> (control vs variant does matter) if Observed power &lt 80% (Type II error / false negative)
  </p>

  <br/>

    <i>Bootstrapping</i><br/>
    Your retention curve will most likely look like <a href="https://www.projectbi.net/blog/retention-curve">this</a><br/>
    So to know how long users truly stay the data is converted to individual users to do a t-test. <br/>
    The data most likely isn't normally distributed (A requirement for the t-test). However, this is allowed when the values are bootstrapped.<br/>
    If your data is normally distributed, this doesn't hurt the results.
    <br/>


    <br /><br />
    <b>APA</b><br />
    To learn more about APA you can look at <a href="https://apastyle.apa.org/">the official guideline</a><br>
    Note it's just a guideline.<br>If you look at the APA published papers there's no 'true' APA table format of what the order of columns is in the table.<br>
    And if you are still confused you can better look at <a href="https://www.scribbr.com/apa-style/6th-edition/archived-format/">the Scribbr pages</a> if you need more help<br>
    Another APA hint is to just use .<a href=" https://support.microsoft.com/en-us/office/apa-mla-chicago-automatically-format-bibliographies-405c207c-7070-42fa-91e7-eaf064b14dbb">Word for formatting the apa citations</a>.

    <br /><br />
    <b>Sources</b><br />
    Tables are formatted like the <a href="https://apastyle.apa.org/style-grammar-guidelines/tables-figures/sample-tables">APA examples</a>
  </p>
  <p v-if="state.activeChecklist == 'Preparation'">
    <b>Check settings</b><br />
    If data is already being collected, check the settings to make sure everything you want to track is correct.
    <v-checkbox
      label="Are the
    users in your target group actually properly filtered (e.g. no employees)?"
      hide-details
    ></v-checkbox>
    <v-checkbox
      label="Is there a place for data collection so as not to obtain
    multiple truths?"
      hide-details
    ></v-checkbox>
    <v-checkbox label="Can you give your target a random variation?" hide-details></v-checkbox>
  </p>

  <p v-if="state.activeChecklist == 'Checklist onboarding' || state.activeChecklist == 'Checklist onboarding for e-learning'">
    <h3 id="step-1-identify-the-onboarding-factors">Step 1: Identify the onboarding factors</h3>
    <p>Identify which of the following onboarding factors are relevant to the specific context of the platform. <br><br>Onboarding factors are:</p>

    <v-checkbox label="Instructions" hide-details></v-checkbox>
    <v-checkbox label="Overlays" hide-details></v-checkbox>
    <v-checkbox label="Social proof*" hide-details></v-checkbox>
    <v-checkbox label="Personalization**" hide-details></v-checkbox>
    <v-checkbox label="Feature promotion" hide-details></v-checkbox>
    <v-checkbox label="Motivation based on money" hide-details></v-checkbox>

    <br>
    <p><strong>Ethical warnings</strong></p>
    <p><em>*Social proof may also create social pressure. This social pressure can have negative consequences such as performance pressure and stress. To counteract these negative effects, it is recommended to use only general data that is not directly or indirectly connected to the user.<br>

    <br>**It is important to ensure that the onboarding is inclusive and accessible, so that no one feels discouraged or excluded. Therefore, in designing personalization, only options that everyone can agree with have been chosen.</em></p>
    <br>
    <p v-if="state.activeChecklist == 'Checklist onboarding for e-learning'">
        <h4 id="e-learning-application">E-learning application:</h4>
        <p>These applications have been tested in the original research from which this tool was developed.</p>
        <ul>
            <li>Instructions: do not have much impact on conversion but contribute to retention.</li>
            <li>Social proof: if the user needs certainty and needs to be convinced that other users also use the platform and trust needs to be increased. If it is offered for free by an employer, social proof does not make much sense.</li>
            <li>Personalization: if the user can configure something, if there are multiple things to ask where the user wants to start or to increase user engagement.</li>
        </ul>
        <br>
        <h4 id="pay-attention-to-the-following-applications">Pay attention to the following applications:</h4>
        <ul>
            <li>Instructions: if the interface contains unique elements that are unfamiliar to the user and are not intuitive.</li>
            <li>Overlays: if a small hint is needed for the user if there are only a few unique elements.</li>
            <li>Social proof: if the user needs certainty and needs to be convinced that other users also use the platform and trust needs to be increased. If it is offered for free by an employer, social proof does not make much sense.</li>
            <li>Personalization: if the user can configure something, if there are multiple things to ask where the user wants to start or to increase user engagement.</li>
            <li>Feature promotion: if there are new features. This can also be used for returning users to indicate the new features.</li>
            <li>Motivation based on money: if it concerns a subscription service or a webshop.</li>
        </ul>
        <br>
    </p>
    <h3 id="step-2-choose-which-onboarding-factors-to-test">Step 2: Choose which onboarding factors to test</h3>
    <p>Choose from the mentioned onboarding factors in step 1 to determine which ones will be tested. Multiple variants can be tested simultaneously with the testing tool.</p>
    <br>
    <h3 id="step-3-develop-onboarding-variants">Step 3: Develop onboarding variants.</h3>
    <p>Determine how the onboarding variants will look and develop them. Use progress bars in the onboarding experience of each variant to show users how far they have progressed. Optionally, use badges or other distinguishing marks to motivate and reward users for completing certain tasks during onboarding.
    Use specific guidelines per factor and pay attention to:</p>
    <ul>
        <li>Instructions: develop instructions that guide the user in exploring the platform. Avoid excessive text in static instructions, as this can make the interface more complex.</li>
        <li>Overlays: use interactive overlays, instruction overlays, or interactive user guides to help users learn by doing. Do not explain standard elements like a share button.</li>
        <li>Social proof: ensure that there is evidence that other users also use or make purchases if it is a webshop. For example, show how many other users have already registered or use the platform.</li>
        <li>Personalization: enable the user to change a goal or settings such as theme and profile photo to make the user feel more at home and create a relevant and personalized onboarding experience.</li>
        <li>Feature promotion: use promotion for new features. This factor can also be used for returning users to indicate the new features.</li>
        <li>Motivation based on money: provide the user with a money-based motivator to come to the platform. For example, offer new users a discount code.</li>
    </ul>
    <p><strong>Take into account the test target audience and ethics</strong></p>
    <ul>
        <li>Ensure that data is tracked anonymously to safeguard privacy</li>
        <li>Ensure that your implementation complies with <a href="https://wcag.nl/kennis/richtlijnen/wcag-2-1-richtlijnen/">the accessibility requirements wcag2.1</a></li>
        <li>Ensure that your target population is truly random and that no one is accidentally excluded</li>
    </ul>
    <br>
    <h3 id="step-4-test">Step 4: Test</h3>
    <p>Implement the onboarding and keep track of the number of users who have had each onboarding and which ones have achieved the intended goal. Make sure to include a control group that does not receive onboarding and that the groups consist of random users.
    Do not stop the test before reaching the minimum number of users or if there is no more time to conduct the A/B test. Do not stop if a result has a significant outcome.</p>
    <br>
    <h3 id="step-5-process-the-data">Step 5: Process the data</h3>
    <p>The A/B test tool below processes the data. This tool will tell you which elements to keep, remove, or which elements have little impact.</p>
    <br>
    <h3 id="step-6-keep-improving">Step 6: Keep improving</h3>
    <p>Onboarding is an ongoing process. Keep testing and optimizing the onboarding as the platform evolves and new features are introduced. Therefore, also create an onboarding for new functionalities to show returning users the new features.</p>
  </p>
</template>
