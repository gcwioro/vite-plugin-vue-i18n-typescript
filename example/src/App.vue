<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">i18n Type Safe Demo</h1>
          <p class="text-sm text-gray-600 mt-1">Vue I18n with TypeScript type safety</p>
        </div>
        <LanguageDropdown/>
      </header>

      <Greeting/>
      <Demo/>
    </div>
  </div>
</template>

<script setup lang="ts">
import Demo from "@/components/Demo.vue";
import Greeting from "@/components/Greeting.vue";
import LanguageDropdown from "@/components/LanguageDropdown.vue";

// get all languages from unplug i18n


// set browser tab title
document.title = "i18n Type Safe Demo";
</script>
