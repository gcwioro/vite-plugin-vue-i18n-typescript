<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Menu Demo (Array via tm)</h2>
    <p class="text-sm text-gray-600 mb-4">
      Demonstrates using <span
      class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">tm()</span> to access translation
      messages as arrays
    </p>
    <ul class="space-y-2">
      <li
        v-for="(label, idx) in tm('App.menu')"
        :key="idx"
        class="flex items-center gap-2 text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded-md"
      >
        <span
          class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded-full">{{
            idx + 1
          }}</span>
        <span>{{ rt(label) }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";

const {tm, rt} = useI18nTypeSafe()
</script>
