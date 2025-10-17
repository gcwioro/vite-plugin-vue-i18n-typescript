<template>
  <div class="flex items-center gap-3">
    <label for="language-select" class="text-sm font-medium text-gray-700">
      {{ t('LanguageDropdown.label') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option v-for="lang in i18n.availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {
  type SupportedLanguage,
  supportedLanguages,
  useI18nApp,
  useI18nTypeSafe
} from "virtual:unplug-i18n-dts-generation";

const i18n = useI18nApp()
const {t} = useI18nTypeSafe()

const supportedLanguage = supportedLanguages[0];
const selectedLanguage = ref<SupportedLanguage>(supportedLanguage)

watch(selectedLanguage, locale => {
  if (locale) {
    i18n.locale.value = locale;
  }
}, {immediate: true})


</script>
