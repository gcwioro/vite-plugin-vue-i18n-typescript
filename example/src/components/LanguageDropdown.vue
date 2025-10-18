<template>
  <div class="flex items-center gap-3">
    <label for="language-select" class="label">
      {{ t('LanguageDropdown.label') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      class="select"
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
} from "virtual:vue-i18n-types";

const i18n = useI18nApp()
const {t} = useI18nTypeSafe()


const selectedLanguage = ref<SupportedLanguage>('en')

watch(selectedLanguage, locale => {
  if (locale) {
    i18n.locale.value = locale;
  }
}, {immediate: true})


</script>
