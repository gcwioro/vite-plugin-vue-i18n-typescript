<template>
  <section class="section">
    <h2 class="section-title">
      Interpolation Demo
    </h2>
    <p class="text-description">
      Demonstrates parameter interpolation with type-safe translation keys
    </p>

    <div class="grid-2-even mb-4">
      <label class="form-group">
        <span class="label-bold">Name:</span>
        <input
          v-model="userName"
          type="text"
          class="input"
        >
      </label>

      <label class="form-group">
        <span class="label-bold">Age:</span>
        <input
          v-model="userAge"
          type="number"
          min="0"
          class="input"
        >
      </label>
    </div>

    <div class="space-y-3">
      <div class="info-box-purple px-4 py-3">
        <p class="info-text-purple">
          {{ t('InterpolationDemo.welcome', {name: userName}) }}
        </p>
      </div>

      <div class="info-box-indigo px-4 py-3">
        <p class="info-text-indigo">
          {{ t('InterpolationDemo.profile', {name: userName, age: userAge}) }}
        </p>
      </div>

      <div class="info-box-pink px-4 py-3">
        <p class="info-text-pink">
          {{ t('InterpolationDemo.birthday', {age: userAge + 1}) }}
        </p>
      </div>
    </div>

    <div class="mt-4 p-3 info-box-gray">
      <p class="text-xs text-gray-600 mb-2 font-semibold">
        Code examples:
      </p>
      <ul class="space-y-1 text-xs text-gray-700">
        <li class="code-example">
          t('InterpolationDemo.welcome', {name: {{ userName }})
        </li>
        <li class="code-example">
          t('InterpolationDemo.welcome', {name: {{ userName }}, age: {{ userAge }} })
        </li>
        <li class="code-example">
          t('InterpolationDemo.profile', {age: {{ userAge }} + 1})
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:vue-i18n-types";
import {ref} from "vue";

const {t} = useI18nTypeSafe()

const userName = ref<string>('John')
const userAge = ref<number>(25)
</script>
