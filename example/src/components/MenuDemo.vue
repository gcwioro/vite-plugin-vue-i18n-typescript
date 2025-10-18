<template>
  <section class="section">
    <h2 class="section-title">
      Menu Demo (Array via tm)
    </h2>
    <p class="text-description">
      Demonstrates using <span class="code-inline">tm()</span> to access translation messages as
      arrays
    </p>
    <ul class="space-y-2">
      <li
        v-for="(label, idx) in tm('App.menu')"
        :key="idx"
        class="menu-item"
      >
        <span class="badge-blue">{{ idx + 1 }}</span>
        <span>{{ rt(label) }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:vue-i18n-types";

const {tm, rt} = useI18nTypeSafe()
</script>
