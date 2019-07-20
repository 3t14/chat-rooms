<template>
  <div id="app">
    <h2>チャットアプリ</h2>
    <div v-if="user == null">
      <p>まずログインしてください。</p>
      <top :onLogin="login" />
    </div>
    <div v-else>
      <div>
        <h3>現在のユーザー: {{user.displayName}}</h3>
        <button @click="logout">ログアウト</button>
      </div>
      <room-list v-if="screen == 'RoomList'"  @enter="enterRoom" >

      </room-list>
      <room v-else-if="screen == 'Room'" :room="currentRoom" @back-to-room-list="backToRoomList">
      </room>      
    </div>    
    
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Top from './components/Top.vue'
import RoomList from './components/RoomList.vue'
import Room from './components/Room.vue'

export default {
  name: 'app',
  components: {
    Top,
    RoomList,
    Room
  },
  data() {
    let user = this.$auth.currentUser;
    let screen = 'top';
    let currentRoom = null;
    return {
      user,
      screen,
      currentRoom
    };
  },
  methods: {
    login() {
      console.log('login');
      let provider = new this.$firebase.auth.GoogleAuthProvider();
      this.$auth.signInWithPopup(provider).then( (result) => {
        console.log(`アカウント ${result.user.displayName}でログインしました。`);
        this.user = result.user;
        this.screen = 'RoomList';
      });
    },
    logout() {
      this.$auth.signOut();      
    },
    enterRoom(room) {
      this.currentRoom = room;
      this.screen = 'Room';
    },
    backToRoomList(){
      this.currentRoom = null;
      this.screen = 'RoomList';
    }
  },
  mounted() {
    // firebaseの接続後にログイン状態が変化したら、それを反映する
    this.$auth.onAuthStateChanged((user) => {
      this.user = this.$auth.currentUser;
      if (this.user != null) {
        this.screen = 'RoomList';
      }
    });
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
