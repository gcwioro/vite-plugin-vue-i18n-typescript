<template>

  <h1 class="">{{ t('Greeting.message', 'not found') }}</h1>

</template>
<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:vue-i18n-types";

const {t} = useI18nTypeSafe()
</script>
