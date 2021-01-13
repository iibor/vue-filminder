import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import firebase from 'firebase';

Vue.config.productionTip = false

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAo7fzhpHJacqJ6UaqYrlXAKt2GI0I0Kb8",
    authDomain: "filminder-514b2.firebaseapp.com",
    projectId: "filminder-514b2",
    storageBucket: "filminder-514b2.appspot.com",
    messagingSenderId: "5719619417",
    appId: "1:5719619417:web:54f484b630852f50b4fe48"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
  
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
