<template >
  <main class="container">
    <h1>{{ t('App.greetings') }}</h1>

    <section class="card">
      <h2>Pluralization demo</h2>
      {{ messages }}
      <div class="row">
        <label>
          Count:
          <input
            type="number"
            min="0"
            step="1"
            v-model="amount"
          />
        </label>

        <label>
          Fruit:
          <select v-model="fruit">
            <option value="apple">apple</option>
            <option value="banana">banana</option>
          </select>
        </label>
      </div>

      <p class="result">
        <!-- Build the fruit name using pluralization for 'fruits.apple' or 'fruits.banana' -->
        <!-- Then inject it into 'fruitsLabel' as the {fruit} placeholder -->
        Label:
        {{ t('App.fruitsLabel', {amount, fruit: fruitName}) }}
      </p>

      <details>
        <summary>Debug view</summary>
        <ul>

        <li>apple → {{ t('App.fruits.apple', {amount}) }}</li>
          <li>banana → {{ t('App.fruits.banana', amount, {amount}) }}</li>
          <li>tm('App') → {{ tm('App') }}</li>
        </ul>
      </details>
    </section>

    <section class="card">
      <h2>Menu (array via tm)</h2>
      <ul class="menu">
        <!-- tm() returns the raw message (array/object). rt() renders each entry safely -->
        <li v-for="(label, idx) in tm('App.menu')" :key="idx">{{ rt(label) }}</li>
      </ul>
    </section>

  </main>
</template >


<script setup lang="ts" >


import {messages, useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import * as x from "virtual:unplug-i18n-dts-generation";

// const messages= Object.keys(x)
import {computed, ref} from "vue";
import type {MessageSchemaGen} from "virtual:unplug-i18n-dts-generation";


const {t, tm, rt} = useI18nTypeSafe()

const amount = ref<number>(1)
type FruitType = keyof MessageSchemaGen['App']['fruits']
const fruit = ref<FruitType>('apple')
const fruitName = computed(() => {
  return t(`App.fruits.${fruit.value}`, amount.value, {amount: amount.value})
})
// onMounted(()=>{
//   toDtsContent({messagesRaw:messagesI18n,messages:extractJson(messagesI18n)})
// })

</script >
