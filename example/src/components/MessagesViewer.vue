<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Translation Messages ({{ locale }})</h2>
    <p class="text-sm text-gray-600 mb-4">
      Shows all translation messages using <span
      class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">tm()</span> with JSON formatting
    </p>
    <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <pre class="text-xs text-green-400 font-mono">{{
          JSON.stringify(allMessages, null, 2)
        }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import {computed} from "vue";

const {tm, locale} = useI18nTypeSafe()

// Get all messages for the current locale
const allMessages = computed(() => tm('App'))
</script>
