<template>
  <div>
    <h3>チャットルーム</h3>
    <ul class="menu">
      <li>
        <button @click="$emit('back-to-room-list')">🔙 ルーム一覧へ戻る</button>       
      </li>
      <li>
         <button v-if="room.creatorId == $auth.currentUser.uid" @click="deleteRoom">削除する</button>
      </li>
    </ul>
    <div>
      <div>
      ＜ルーム名＞「
      {{room.name}}
      」
      ＜管理者＞
      <img :src="room.creatorPhotoURL" width="16px" />
      {{room.creatorName}}
      </div>
    </div>
    <div id="messages-box">
      <message-view v-for="message in messages" :key="message.id" 
        :room="room" :message="message" 
        @delete-message="deleteMessage" @edit-message="editMessage"
        @select-parent="selectParent"
      />
    </div>
    <ul class="parent-message" v-if="parentMessage">
        <li>投稿対象</li>
        <li class="parent-message-content">{{parentMessage.content}}</li>
        <li><button @click="cancelParent">解除</button></li>
    </ul>
    <textarea id="new-message-input" v-model="newMessage" rows="5"  @keypress="checkEnter" @paste="paste"></textarea>
    <button @click="sendMessage">送信</button>
  </div>
</template>

<script>
import MessageView from './MessageView.vue'

export default {
  components: {
    MessageView
  },
  data() {
    return {
      messages: {},
      newMessage: '',
      scrollFlag: true,
      activeMessageId: null,
      parentMessage: null,
      unscribeRoom: null
    }
  },
  props: {
    room: Object
  },
  methods: {
    loadMessages(querySnapshot){
      this.messages = {};
      querySnapshot.forEach( (doc) => {
        let message = doc.data();
        message.id = doc.id; // パス取得に必要なため、idを内包する
        message.room = this.room;
        message.firestorePath = 'rooms/' + this.room.id + '/messages/' + message.id;
        message.roomPath = 'rooms/' + this.room.id;
        this.messages[doc.id] = message;
      });
      if (this.scrollFlag)
        setTimeout(() => {
          let obj = document.getElementById('messages-box');
          obj.scrollTop = obj.scrollHeight;
          this.scrollFlag = false;
        }, 200);
    },
    sendMessage(){
      let message = {
        content: this.newMessage,
        type: this.parseType(this.newMessage),
        creatorName: this.$auth.currentUser.displayName,
        creatorId: this.$auth.currentUser.uid,
        creatorPhotoURL: this.$auth.currentUser.photoURL,
        created: new Date(),
        value: false
      };
      this.scrollFlag = true;
      let collectionPath = (this.parentMessage ? this.parentMessage.firestorePath: `rooms/${this.room.id}`) + '/messages';
      if (this.parentMessage) {
        // サブメッセージが含まれることを記録
        this.$db.doc(this.parentMessage.firestorePath).update('hasSubMessages', true);
      }
      this.$db.collection(collectionPath).add(message).then( () => {
        this.newMessage = '';
      });        

    },
    checkEnter(event){
      if (event.charCode == 13 && event.shiftKey){
        this.sendMessage();
      }
    },
    deleteRoom() {
      if (confirm('本当に削除しますか？')){
        this.$db.doc('rooms/' + this.room.id).delete();
        this.$emit('back-to-room-list');
      }
    },
    editMessage(message) {
      if (message.creatorId == this.$auth.currentUser.uid){
        let result = prompt('編集してください', message.content);
        if (result != null) {
          this.$db.doc(message.firestorePath).update('content', result);
          let type = this.parseType(result);
          if (message.type != type) {
            
            this.$db.doc(message.firestorePath).update('type', type);
          }
        }
      } else {
        alert('他人のメッセージは編集できません。');
      }
    },
    parseType(content) {
      // メッセージの種別を判定
      content = content.trim();
      let type = 'text';
      if (content.startsWith('/')){
        // タイプ指定
        type = content.split(' ')[0].substr(1);        
      }
      return type;
    },
    deleteMessage(message) {
      if (confirm('本当に削除しますか？')){
        this.$db.doc(message.firestorePath).delete();
        this.$db.collection(message.roomPath + '/messages').get().then((querySnapshot) => {
          if (querySnapshot.empty) {
            this.$db.doc(message.roomPath).update('hasSubMessages', false);
          }          
        });
      }
    },
    paste(event) {
      const files = event.clipboardData.files;
      for (let i=0; i<files.length; i++){
        let file = files[i];
        if (file.type == 'image/png'){
          const fileReader = new FileReader();
          fileReader.onload = function() {
            let dataURL = fileReader.readAsDataURL(file);
            console.log(dataURL);
          }
        }
      }
    },
    selectParent(message) {
      this.parentMessage = message;
    },
    cancelParent(message) {
      this.parentMessage = null;
    }
  },
  mounted() {
    // ルーム一覧を取得
    // this.$db.collection('rooms/' + this.room.id + '/messages').orderBy('created').get().then( (querySnapshot) => {
    //   this.loadMessages(querySnapshot);
    // });
    this.unscribeRoom = this.$db.collection('rooms/'+ this.room.id + '/messages').orderBy('created').onSnapshot((querySnapshot) => {
      this.loadMessages(querySnapshot);
    });
  },
  beforeDestroy() {
    this.unscribeRoom();
  }
}
</script>

<style>

#messages-box {
  border: solid 1px black;
  overflow: scroll;
  height: 440px;
  text-align: left;
  margin: 1em;
  padding: 1em;
  border-radius: 1em;

}

.menu {
  list-style-type: none;
  display: inline-block;
  margin-left: 0;
}

.menu li {
  display: inline;
  margin: 1em;
}

.message-close-button {
  font-size: 0.1em;
  float: right;
  cursor: pointer;
  opacity: 0.1;
}
.message-close-button:hover {
  opacity: 1;
}

#new-message-input {
  width: 80%;
}

.parent-message {
  display: block;
  list-style-type: none;
  width: 100%;
  padding: 0em;
  font-size: small;
  
}
.parent-message > li {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  margin-left: 1em;
  margin-right: 1em;
}
li.parent-message-content {
  width: 60%;
  border:olive 1px solid;
}
.parent-message button {
  display: inline-block;
  padding-bottom: 0.1em;
}
</style>
