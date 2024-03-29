import './assets/main.css'

import { createApp } from 'vue'

import {library } from '@fortawesome/fontawesome-svg-core'
import {fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'


const app = createApp(App)
library.add(fas)
app.use(router)

app
.component('font-awesome-icon',FontAwesomeIcon)
.mount('#app')
