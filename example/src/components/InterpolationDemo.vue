<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Interpolation Demo</h2>
    <p class="text-sm text-gray-600 mb-4">
      Demonstrates parameter interpolation with type-safe translation keys
    </p>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <label class="flex flex-col gap-1.5">
        <span class="font-bold text-sm">Name:</span>
        <input
          type="text"
          v-model="userName"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="font-bold text-sm">Age:</span>
        <input
          type="number"
          min="0"
          v-model="userAge"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>
    </div>

    <div class="space-y-3">
      <div class="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
        <p class="text-sm font-medium text-purple-900">
          {{ t('InterpolationDemo.welcome', {name: userName}) }}
        </p>
      </div>

      <div class="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
        <p class="text-sm font-medium text-indigo-900">
          {{ t('InterpolationDemo.profile', {name: userName, age: userAge}) }}
        </p>
      </div>

      <div class="bg-pink-50 border border-pink-200 rounded-lg px-4 py-3">
        <p class="text-sm font-medium text-pink-900">
          {{ t('InterpolationDemo.birthday', {age: userAge + 1}) }}
        </p>
      </div>
    </div>

    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-xs text-gray-600 mb-2 font-semibold">Code examples:</p>
      <ul class="space-y-1 text-xs text-gray-700">
        <li class="font-mono bg-white px-2 py-1 rounded">
          t('InterpolationDemo.welcome', {name: {{ userName }})
        </li>
        <li class="font-mono bg-white px-2 py-1 rounded">
          t('InterpolationDemo.welcome', {name: {{ userName }}, age: {{ userAge }} })
        </li>

        <li class="font-mono bg-white px-2 py-1 rounded">
          t('InterpolationDemo.profile', {age: {{ userAge }} + 1})
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import {ref} from "vue";

const {t} = useI18nTypeSafe()

const userName = ref<string>('John')
const userAge = ref<number>(25)
</script>
