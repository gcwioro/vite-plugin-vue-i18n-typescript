<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Pluralization Demo</h2>
    <p class="text-sm text-gray-600 mb-4">
      Demonstrates how vue-i18n handles pluralization with type-safe translation keys
    </p>
    <div class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 class="text-sm font-semibold text-amber-900 mb-2">How Pluralization Works:</h3>
      <ul class="text-xs text-amber-800 space-y-1">
        <li class="flex items-start gap-2">
          <span class="text-amber-400">•</span>
          <span>{{ t('PluralizationDemo.explanation.format') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-amber-400">•</span>
          <span>{{ t('PluralizationDemo.explanation.parameter') }}</span>
        </li>
      </ul>
    </div>

    <!-- Interactive Counter -->
    <div class="mb-6">
      <label class="flex flex-col gap-2">
        <span class="font-bold text-sm">Adjust Count: <span class="text-blue-600">{{ count }}</span></span>
        <input
          type="range"
          min="0"
          max="10"
          v-model="count"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </label>
    </div>

    <!-- Pluralization Examples Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <!-- Items Example -->
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div class="text-xs text-gray-500 mb-1 font-mono">t('PluralizationDemo.items', {'{'}n:
          count{'}'})
        </div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.items', {n: count}) }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- People Example -->
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div class="text-xs text-gray-500 mb-1 font-mono">t('PluralizationDemo.people', {'{'}n:
          count{'}'})
        </div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.people', count) }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- Messages Example -->
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div class="text-xs text-gray-500 mb-1 font-mono">t('PluralizationDemo.messages', {'{'}n:
          count{'}'})
        </div>
        <div class="text-sm font-medium text-gray-900">

          {{ t('PluralizationDemo.messages', count) }}


        </div>
        <div class="text-xs text-gray-400 mt-1">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- Files Example -->
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div class="text-xs text-gray-500 mb-1 font-mono">t('PluralizationDemo.files.uploaded',
          {'{'}n: count{'}'})
        </div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.files.uploaded', count) }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>
    </div>

    <!-- Real-world Examples -->
    <div class="space-y-3">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span class="text-sm font-semibold text-green-900">Shopping Cart</span>
        </div>
        <p class="text-sm text-green-800">
          {{ t('PluralizationDemo.cart.status', count) }}
        </p>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="text-sm font-semibold text-blue-900">Notifications</span>
        </div>
        <p class="text-sm text-blue-800">
          {{ t('PluralizationDemo.notifications.unread', count) }}
        </p>
      </div>
    </div>

    <!-- Fruit Example (original) -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">Combined Pluralization +
        Interpolation</h3>
      <div class="grid grid-cols-2 gap-4 mb-3">
        <label class="flex flex-col gap-1.5 flex-1">
          <span class="font-bold text-sm">Fruit Count:</span>
          <input
            type="number"
            min="0"
            step="1"
            v-model="amount"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>

        <label class="flex flex-col gap-1.5 flex-1">
          <span class="font-bold text-sm">Fruit Type:</span>
          <select
            v-model="fruit"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >

            <option value="apple">apple</option>
            <option value="banana">banana</option>
          </select>
        </label>
      </div>

      <div class="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
        <p class="text-sm font-medium text-purple-900">
          {{ t('App.fruits.label', amount, {fruit: fruitName}) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {MessageSchemaGen} from "virtual:unplug-i18n-dts-generation";
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import {computed, ref} from "vue";

const {t} = useI18nTypeSafe()

const count = ref<number>(0)
const amount = ref<number>(1)
type FruitType = keyof MessageSchemaGen['App']['fruits']
const fruit = ref<FruitType>('apple')
const fruitName = computed(() => {
  return t(`App.fruits.${fruit.value}`, amount.value, {amount: amount.value})
})

const getPluralForm = (n: number): string => {
  if (n === 0) return 'zero'
  if (n === 1) return 'one'
  return 'many'
}
</script>
