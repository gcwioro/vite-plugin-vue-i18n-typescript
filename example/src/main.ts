import App from './App.vue'
import {createApp} from "vue";
import {i18nApp} from "./i18n";

const app = createApp(App)

app.use(i18nApp)

app.mount('#app')
