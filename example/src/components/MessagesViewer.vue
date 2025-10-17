<template>
  <section class="">
    <h2 class="text-lg">Translation Messages ({{ locale }})</h2>
    <div class="grid gap-4">
      <div class="label">
        Shows all translation messages using <b>tm('App')</b>
      </div>

      <pre class="code">{{
          JSON.stringify(allMessages, null, 2)
        }}</pre>
    </div>
    <p class="label">
      Shows all translation messages using <b>import {useI18nTypeSafe,messages} from
      "virtual:unplug-i18n-dts-generation";</b>
    </p>
    <pre class=" code">

        {{ JSON.stringify(messages, null, 4) }}
      </pre>


  </section>
</template>
<!--<style type="text/tailwindcss">-->
<!--@theme {-->
<!--  &#45;&#45;color-red: #0f0;-->
<!--}-->
<!--</style>-->
<script setup lang="ts">
import {useI18nTypeSafe, messages} from "virtual:unplug-i18n-dts-generation";
import {computed} from "vue";

const {tm, locale} = useI18nTypeSafe()

// Get all messages for the current locale
const allMessages = computed(() => tm('App'))
</script>

<style lang="css" type="text/tailwindcss">


</style>
