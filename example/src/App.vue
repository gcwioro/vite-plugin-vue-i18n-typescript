<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            i18n Type Safe Demo
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            Vue I18n with TypeScript type safety
          </p>
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
<style>
@import "tailwindcss";

section {
  @apply bg-white rounded-lg px-6 py-5 border border-gray-200 shadow-gray-400 shadow-lg ;
}

div {
  @apply rounded-sm ;
}

h1 {
  @apply text-xl font-bold text-gray-900 ;
}

h2 {
  @apply text-lg font-semibold text-gray-800 mt-4 mb-2 ;
}

.border {
  @apply border border-gray-300 border-1;
}

.icon-box {
  @apply text-sm;
}

.code {

  @apply m-2 bg-gray-900 overflow-x-auto p-2 text-xs text-green-400 font-mono font-mono overflow-auto max-h-128 rounded-lg;
}

pre, .code-inline {
  @applay font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded;
}

.label {
  @apply mt-2 text-sm text-gray-600 mb-4;
}

p > b, div > b {
  @apply font-mono text-xs bg-gray-400/30 px-1.5 py-0.5 rounded
}

.sub-section {
  @apply mt-4 mb-8 p-2 pb-4  border-gray-300;
}

p {
  @apply text-gray-700 mb-2;
}

/* Base typography */
.text-lg {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.text-description {
  @apply text-sm text-gray-600 mb-4;
}

/* Layout containers */
.section {
  @apply bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200;
}

.sub-section {
  @apply space-y-3;
}

.grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.grid-2-even {
  @apply grid grid-cols-2 gap-4;
}

/* Headers */
.section-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.subsection-title {
  @apply text-sm font-semibold text-gray-700 mb-2;
}

.subsection-title-sm {
  @apply text-sm font-semibold text-gray-700 mb-3;
}

/* Labels and text */
.label {
  @apply text-sm font-medium text-gray-700;
}

.label-bold {
  @apply font-bold text-sm;
}

.code-label {
  @apply text-xs text-gray-500 mb-1 font-mono;
}

.text-hint {
  @apply text-xs text-gray-400 mt-1;
}

/* Code blocks */
.code {
  @apply bg-gray-900 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto;
}

.code-example {
  @apply font-mono bg-white px-2 py-1 rounded text-xs text-gray-700;
}

.code-inline {
  @apply font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded;
}

/* Form inputs */
.input {
  @apply px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.select {
  @apply px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.range {
  @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500;
}

/* Form groups */
.form-group {
  @apply flex flex-col gap-1.5;
}

/* Info boxes */
.info-box {
  @apply p-4 rounded-lg border;
}

.info-box-blue {
  @apply bg-blue-50 border-blue-200;
}

.info-box-amber {
  @apply bg-amber-50 border-amber-200;
}

.info-box-green {
  @apply bg-green-50 border-green-200;
}

.info-box-purple {
  @apply bg-purple-50 border-purple-200;
}

.info-box-yellow {
  @apply bg-yellow-50 border-yellow-200;
}

.info-box-red {
  @apply bg-red-50 border-red-200;
}

.info-box-indigo {
  @apply bg-indigo-50 border-indigo-200;
}

.info-box-pink {
  @apply bg-pink-50 border-pink-200;
}

.info-box-gray {
  @apply bg-gray-50 border-gray-200;
}

/* Info box titles */
.info-title-blue {
  @apply text-sm font-semibold text-blue-900 mb-2;
}

.info-title-amber {
  @apply text-sm font-semibold text-amber-900 mb-2;
}

.info-title-green {
  @apply text-sm font-semibold text-green-900 mb-2;
}

.info-title-purple {
  @apply text-sm font-semibold text-purple-900 mb-2;
}

/* Info box text */
.info-text-blue {
  @apply text-sm text-blue-800;
}

.info-text-amber {
  @apply text-xs text-amber-800;
}

.info-text-green {
  @apply text-sm text-green-800;
}

.info-text-purple {
  @apply text-sm font-medium text-purple-900;
}

.info-text-indigo {
  @apply text-sm font-medium text-indigo-900;
}

.info-text-pink {
  @apply text-sm font-medium text-pink-900;
}

/* List styles */
.info-list {
  @apply space-y-1;
}

.info-list-item {
  @apply flex items-start gap-2;
}

.bullet-blue {
  @apply text-blue-400;
}

.bullet-amber {
  @apply text-amber-400;
}

/* Cards and panels */
.card {
  @apply border border-gray-200 rounded-lg p-4;
}

.card-gray {
  @apply border border-gray-200 rounded-lg p-3 bg-gray-50;
}

.card-content {
  @apply px-3 py-2 bg-gray-50 rounded text-sm;
}

.card-white {
  @apply px-3 py-2 bg-white rounded text-sm;
}

.card-white-border {
  @apply px-3 py-2 bg-white border border-green-200 rounded text-sm;
}

/* Status badges */
.badge-blue {
  @apply w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded-full;
}

/* Dividers */
.divider {
  @apply pt-6 border-t border-gray-200;
}

/* File path display */
.file-path {
  @apply font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded;
}

.file-path-green {
  @apply font-mono text-xs bg-green-100 px-1.5 py-0.5 rounded;
}

.file-path-blue {
  @apply font-mono text-xs bg-blue-100 px-1 rounded;
}

/* Status message boxes */
.status-success {
  @apply px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800;
}

.status-warning {
  @apply px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800;
}

.status-error {
  @apply px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-800;
}

/* Settings items */
.setting-item {
  @apply flex items-center justify-between py-2 px-3 bg-gray-50 rounded;
}

/* Menu items */
.menu-item {
  @apply flex items-center gap-2 text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded-md;
}

/* Icon containers */
.icon-box {
  @apply flex items-center gap-2 mb-2;
}

.icon-green {
  @apply w-5 h-5 text-green-600;
}

.icon-blue {
  @apply w-5 h-5 text-blue-600;
}

.icon-success {
  @apply w-4 h-4 text-green-500;
}
</style>
