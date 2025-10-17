<template>
  <div class="bg-white rounded-lg shadow-sm px-6 py-4 border border-gray-200">
    <h2 class="text-xl font-medium text-gray-900">{{ t('Greeting.greetings') }}</h2>
  </div>
</template>
<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";

const {t} = useI18nTypeSafe()
</script>
