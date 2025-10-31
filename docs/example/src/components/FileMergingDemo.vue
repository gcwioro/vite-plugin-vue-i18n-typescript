<template>
  <section class="section">
    <h2 class="section-title">
      File Merging Demo
    </h2>
    <p class="text-description">
      Demonstrates how the plugin merges translation keys from multiple JSON files
    </p>

    <div class="info-box info-box-blue mb-4">
      <h3 class="info-title-blue">
        How it works:
      </h3>
      <ul class="info-list text-xs text-blue-800">
        <li class="info-list-item">
          <span class="bullet-blue">•</span>
          <span>Translation keys from <span class="file-path-blue">locales/en.json</span> are merged with keys from <span
            class="file-path-blue"
          >components/FileMergingDemo.en.json</span></span>
        </li>
        <li class="info-list-item">
          <span class="bullet-blue">•</span>
          <span>Component-specific files complement (not override) the main locale files</span>
        </li>
        <li class="info-list-item">
          <span class="bullet-blue">•</span>
          <span>All keys are available with full type safety across the application</span>
        </li>
      </ul>

    </div>

    <div class="space-y-3">
      <div class="card">
        <h3 class="subsection-title-sm">
          From <span class="file-path">locales/en.json</span>
        </h3>
        <div class="space-y-2">
          <div class="card-content">
            <span class="text-gray-500 text-xs">App.fruits.label:</span>
            <p class="text-gray-900">
              {{ t('PluralizationDemo.fruits.label', {amount: 5, fruit: 'apples'}) }}
            </p>
          </div>
          <div class="card-content">
            <span class="text-gray-500 text-xs">Greeting.message:</span>
            <p class="text-gray-900">
              {{ t('Greeting.message') }}
            </p>
          </div>
        </div>
      </div>

      <div class="card info-box-green">
        <h3 class="text-sm font-semibold text-green-900 mb-3">
          From <span class="file-path-green">components/FileMergingDemo.en.json</span>
        </h3>
        <div class="space-y-2">
          <div class="card-white-border">
            <span class="text-green-600 text-xs">FileMergingDemo.title:</span>
            <p class="text-gray-900">
              {{ t('FileMergingDemo.title') }}
            </p>
          </div>
          <div class="card-white-border">
            <span class="text-green-600 text-xs">FileMergingDemo.description:</span>
            <p class="text-gray-900">
              {{ t('FileMergingDemo.description') }}
            </p>
          </div>
          <div class="card-white-border">
            <span class="text-green-600 text-xs">FileMergingDemo.feature.typeCheck:</span>
            <p class="text-gray-900">
              {{ t('FileMergingDemo.feature.typeCheck') }}
            </p>
          </div>
          <div class="card-white-border">
            <span class="text-green-600 text-xs">FileMergingDemo.feature.autoMerge:</span>
            <p class="text-gray-900">
              {{ t('FileMergingDemo.feature.autoMerge') }}
            </p>
          </div>
        </div>
      </div>

      <div class="card info-box-purple">
        <h3 class="text-sm font-semibold text-purple-900 mb-3">
          Merged Result - All keys accessible with autocomplete
        </h3>
        <div class="space-y-2">
          <div class="card-white">
            <div class="text-gray-900 flex items-center gap-2">
              <svg
                class="icon-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t('FileMergingDemo.merged.success', {count: allKeysCount}) }}</span>
            </div>
          </div>
          <div class="card-white">
            <p class="text-gray-900">
              {{ t('FileMergingDemo.merged.typeSafety') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="code mt-4">
      <p class="text-xs text-gray-400 mb-2 font-semibold">
        File structure:
      </p>
      <pre class="text-xs text-green-400 font-mono">example/src/
├── locales/
│   ├── en.json              ← Main translations
│   └── de.json              ← Main translations
└── components/
    └── FileMergingDemo.en.json  ← Component-specific (merged)
    └── FileMergingDemo.de.json  ← Component-specific (merged)</pre>
    </div>
  </section>

</template>

<script setup lang="ts">

import {computed} from "vue";
import {useI18nTypeSafe} from "virtual:vue-i18n-types";


const {t, tm} = useI18nTypeSafe()

// Count all available translation keys to show merging worked
const allKeysCount = computed(() => {
  const messages = tm('');
  return Object.keys(messages).length;
})
</script>
