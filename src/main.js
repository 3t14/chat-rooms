import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// Firebaseの準備
import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/auth'

firebase.initializeApp({
  apiKey: 'AIzaSyCCDuAMj-TNA6abpu-TwfLYGgSVFxulrSw',
  authDomain: 'chat-rooms-dee41.firebaseapp.com',
  projectId: 'chat-rooms-dee41'
});
Vue.prototype.$db = firebase.firestore();
Vue.prototype.$auth = firebase.auth();
Vue.prototype.$firebase = firebase;

new Vue({
  render: h => h(App),
}).$mount('#app')
