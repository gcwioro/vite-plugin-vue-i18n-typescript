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
// import {createI18nInstance, type CreateI18nOptions, useI18nTypeSafe} from "virtual:vue-i18n-types";
import type {
  ResourceValue,
  TranslationsPaths,
  PickupPaths,
  RemoveIndexSignature,
  PickupKeys,
  PickupLocales,
  ResourcePath,
  IsEmptyObject,
} from "@intlify/core-base";
import type {
  AllMessages,
  AllTranslationKeys,
  MessageSchemaGen, MessageSchemeType
} from "virtual:vue-i18n-types/messages";
//
// import {createI18n, type DefineLocaleMessage, type PickupFormatPathKeys, useI18n} from "vue-i18n";
//
// const {tm, rt} = useI18n()
//
// const x =createI18nInstance( )
// x.global.tm('App.fruits')
// const mess = {de: {App: {apple: 'Apfel'}}}  as const
// const a = useI18n({locale: 'de', messages: mess, legacy:false} )
//
// type GetX<Messages> = 'App'  extends ResourcePath<IsEmptyObject<Messages> extends false ? NonNullable<Messages>[PickupLocales<NonNullable<Messages>>] : RemoveIndexSignature<{ [K in keyof Messages]: Messages[K] }>> ? ResourceValue<IsEmptyObject<Messages> extends false ? NonNullable<Messages>[PickupLocales<NonNullable<Messages>>] : RemoveIndexSignature<{ [K in keyof Messages]: Messages[K] }>, string> : Record<string, any>
// a.t()
// type TestX =PickupPaths<typeof mess>
// type TestLocales =PickupLocales<AllMessages>
// type TestformatP =PickupFormatPathKeys<typeof mess>
// type TestformatPd =PickupKeys<AllMessages>
// type translationPaths =TranslationsPaths<AllMessages> ;
// type translationPathsSmall =TranslationsPaths<typeof mess>
// // type to define all values in AllTranslationKeys that are not in translationPaths
// type notInAllKeys = Exclude< translationPaths,AllTranslationKeys>
// type notInAllKeysInternal = Exclude< AllTranslationKeys,translationPaths>
// type allKeyss = Exclude< translationPaths,notInAllKeys>
// const all = allKeys
//
//
//
// type testX=GetX<typeof mess>

import {useI18nTypeSafe} from "virtual:vue-i18n-types";

type a = ResourceValue<AllMessages, 'en.PluralizationDemo.fruits'>
const {tm, rt} = useI18nTypeSafe()
type x = PickupPaths<AllMessages>
type sx = ResourceValue<MessageSchemeType, "PluralizationDemo">
let aa = tm('PluralizationDemo') as ResourceValue<MessageSchemeType, "PluralizationDemo">;

</script>
