import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// Firebaseの準備
import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/auth'

import config from './config.json'

firebase.initializeApp(config);
Vue.prototype.$db = firebase.firestore();
Vue.prototype.$auth = firebase.auth();
Vue.prototype.$firebase = firebase;

new Vue({
  render: h => h(App),
}).$mount('#app')
