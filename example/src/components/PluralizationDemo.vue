<template>
  <section class="section">
    <h2 class="section-title">Pluralization Demo</h2>
    <p class="text-description">
      Demonstrates how vue-i18n handles pluralization with type-safe translation keys
    </p>
    <div class="info-box info-box-amber mb-4">
      <h3 class="info-title-amber">How Pluralization Works:</h3>
      <ul class="info-list info-text-amber">
        <li class="info-list-item">
          <span class="bullet-amber">•</span>
          <span>{{ t('PluralizationDemo.explanation.format') }}</span>
        </li>
        <li class="info-list-item">
          <span class="bullet-amber">•</span>
          <span>{{ t('PluralizationDemo.explanation.parameter') }}</span>
        </li>
      </ul>
    </div>

    <!-- Interactive Counter -->
    <div class="mb-6">
      <label class="flex flex-col gap-2">
        <span class="label-bold">Adjust Count: <span class="text-blue-600">{{ count }}</span></span>
        <input
          type="range"
          min="0"
          max="10"
          v-model="count"
          class="range"
        />
      </label>
    </div>

    <!-- Pluralization Examples Grid -->
    <div class="grid-2 mb-4">
      <!-- Items Example -->
      <div class="card-gray">
        <div class="code-label">t('PluralizationDemo.items', {{ count }}'):</div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.items', count) }}
        </div>
        <div class="text-hint">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- People Example -->
      <div class="card-gray">
        <div class="code-label">t('PluralizationDemo.people', {{ count }})</div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.people', count) }}
        </div>
        <div class="text-hint">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- Messages Example -->
      <div class="card-gray">
        <div class="code-label">t('PluralizationDemo.messages', {{ count }})</div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.messages', count) }}
        </div>
        <div class="text-hint">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>

      <!-- Files Example -->
      <div class="card-gray">
        <div class="code-label">t('PluralizationDemo.files.uploaded', {{ count }})</div>
        <div class="text-sm font-medium text-gray-900">
          {{ t('PluralizationDemo.files.uploaded', count) }}
        </div>
        <div class="text-hint">
          Count: {{ count }} → {{ getPluralForm(count) }}
        </div>
      </div>
    </div>

    <!-- Real-world Examples -->
    <div class="space-y-3">
      <div class="info-box info-box-green">
        <div class="icon-box">
          <svg class="icon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span class="text-sm font-semibold text-green-900">Shopping Cart</span>
        </div>
        <p class="info-text-green">
          {{ t('PluralizationDemo.cart.status', count) }}
        </p>
      </div>

      <div class="info-box info-box-blue">
        <div class="icon-box">
          <svg class="icon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="text-sm font-semibold text-blue-900">Notifications</span>
        </div>
        <p class="info-text-blue">
          {{ t('PluralizationDemo.notifications.unread', count) }}
        </p>
      </div>
    </div>

    <!-- Fruit Example (original) -->
    <div class="mt-6 divider">
      <h3 class="subsection-title">Combined Pluralization + Interpolation</h3>
      <div class="grid-2-even mb-3">
        <label class="form-group flex-1">
          <span class="label-bold">Fruit Count:</span>
          <input
            type="number"
            min="0"
            step="1"
            v-model="amount"
            class="input"
          />
        </label>

        <label class="form-group flex-1">
          <span class="label-bold">Fruit Type:</span>
          <select
            v-model="fruit"
            class="select"
          >
            <option value="apple">apple</option>
            <option value="banana">banana</option>
          </select>
        </label>
      </div>

      <div class="info-box-purple px-4 py-3">
        <p class="info-text-purple">
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
