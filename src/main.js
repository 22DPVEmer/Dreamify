import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Import Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js"; // includes Popper.js

import "./assets/main.css"; // Your custom CSS

const app = createApp(App);
library.add(fas);

app.use(router);
app.use(store);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
