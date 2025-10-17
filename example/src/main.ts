import App from './App.vue'
import {createApp} from "vue";
import {createI18nInstancePlugin} from "virtual:unplug-i18n-dts-generation";

const app = createApp(App)

app.use(createI18nInstancePlugin())

app.mount('#app')

