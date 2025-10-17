<template>
  <div class="space-y-6">
    <section class="bg-white grid gap-2 p-4">
      <!--      <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">-->
      <h1 class="text-lg">Pluralization demo</h1>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-1.5 flex-1">
          <span class="font-bold">Count:</span>
          <input
            type="number"
            min="0"
            step="1"
            v-model="amount"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>

        <label class="flex flex-col gap-1.5 flex-1">
          <span class="font-bold">Fruit:</span>
          <select
            v-model="fruit"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="apple">apple</option>
            <option value="banana">banana</option>
          </select>
        </label>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
        <p class="text-sm font-medium text-blue-900">
          {{ t('App.fruits.label', {amount, fruit: fruitName}) }}
        </p>
      </div>

      <ul class="space-y-2 text-sm text-gray-600">
        <li class="flex items-start gap-2">
          <span class="text-gray-400">•</span>
          <span><span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">apple</span> → {{
              t('App.fruits.apple', {amount})
            }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-gray-400">•</span>
          <span><span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">banana</span> → {{
              t('App.fruits.banana', amount, {amount})
            }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-gray-400">•</span>
          <span><span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">tm('App')</span> → {{
              tm('App')
            }}</span>
        </li>
      </ul>
    </section>

    <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Menu (array via tm)</h2>
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

    <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Translation Messages ({{ locale }})</h2>
      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre class="text-xs text-green-400 font-mono">{{
            JSON.stringify(allMessages, null, 2)
          }}</pre>
      </div>
    </section>
  </div>
</template>


<script setup lang="ts">

import type {MessageSchemaGen} from "virtual:unplug-i18n-dts-generation";
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import {computed, ref} from "vue";
import Greeting from "@/components/Greeting.vue";


const {t, tm, rt, locale} = useI18nTypeSafe()

const amount = ref<number>(1)
type FruitType = keyof MessageSchemaGen['App']['fruits']
const fruit = ref<FruitType>('apple')
const fruitName = computed(() => {
  return t(`App.fruits.${fruit.value}`, amount.value, {amount: amount.value})
})

// Get all messages for the current locale
const allMessages = computed(() => tm('App'))

</script>
