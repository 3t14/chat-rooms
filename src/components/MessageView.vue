<template>
  <div >
    <div class="message-view" @mouseenter="activate" @mouseleave="inactivate">
      <div style="text-align: center; width; 40px; margin: 4px; ">
          <img  :src="message.creatorPhotoURL" width="32px" style="border-radius: 3px; margin: 1px;"/>
      </div>
      <div class="author-time">
        <div style="display: inline-block">
          <div class="author-name" >{{message.creatorName}}: {{message.created.toDate().toLocaleString()}}</div>
          <div v-if="message.creatorId == $auth.currentUser.uid || room.creatorId == $auth.currentUser.uid" 
            class="message-close-button" @click="$emit('delete-message', message)">❌</div>
        </div>
        <task-view v-if="message.type == 'todo'" :message="message" />
        <span v-else-if="message.type == 'idea'" @dblclick="$emit('edit-message', message)">
          💡{{$typeTrim(message.content)}}
        </span>
        <span v-else @dblclick="$emit('edit-message', message)">{{message.content}}</span>
        
        
        <ul class="toolbar" v-if="isActive">
          <li class="message-operation">👍</li>
          <li class="message-operation" @click="$emit('select-parent', message)">↪︎</li>
        </ul>
        <ul class="toolbar" v-else>
          <li class="message-operation message-operation-transparent">👍</li>
          <li class="message-operation message-operation-transparent" @click="$emit('select-parent', message)">↪︎</li>
        </ul>
        

      </div>
    </div>
    <ul class="sub-messages"  v-if="message.hasSubMessages">
        <li>
        </li>
        <li>
          <button v-if="!subMessagesVisible" @click="toggleSubMessages">▶︎</button>
        </li>
        <li>
          <button v-if="subMessagesVisible" @click="toggleSubMessages">▼</button>
        </li>
        <li v-if="subMessagesVisible">
          <message-view  v-for="message in subMessages" :key="message.id" 
          :room="room" :message="message" 
          @delete-message="deleteMessage" @edit-message="editMessage"
          @select-parent="selectParent"
          />
        </li>
      </ul>
  </div>
</template>

<script>
import TaskView from './messages/TaskView'
import Vue from 'vue';
// 共通処理をインスタンスメソッドとして登録
Vue.prototype.$typeTrim = (content) => {
  let trimmedContent = content.trim();
  if (trimmedContent.startsWith('/')){
    let bodyPos = content.indexOf(' ');
    if (bodyPos >= 0) {
      return content.substr(bodyPos);
    } else return '';
  } else return trimmedContent;
};

export default {
  name: 'message-view',
  components: {
    TaskView
  },
  props: {
    room: Object, 
    message: Object
  },
  data() {
    return {
      isActive: false,
      subMessagesVisible: false,
      subMessages:[],
      unsubscribeSubMessages: null,
    }
  },
  methods: {
    
    parseCommand(message) {
      if (message.type == null || message.type == 'text') {
        return message.content;
      }
      switch (message.type) {
        case 'idea':
          let elem = this.$createElement('div', {}, [
            this.$createElement('input', {type:'checkbox'}),
            this.$createElement('p', {}, [message.content]),
            ]);
          return elem;
      }
      return message.type;
    },
    activate() {
      this.isActive = true;
    },
    inactivate() {
      this.isActive = false;
    },
    toggleSubMessages() {
      // サブメッセージの表示切り替え
      this.subMessagesVisible = !this.subMessagesVisible;
      if (this.subMessagesVisible) {
         this.unsubscribeSubMessages = this.$db.collection(this.message.firestorePath + '/messages')
          .orderBy('created')
          .onSnapshot((querySnapshot) => {
            this.subMessages = {};
            querySnapshot.forEach((doc) => {
              let message = doc.data();
              message.id = doc.id; // パス取得に必要なため、idを内包する
              message.room = this.room;
              message.firestorePath = this.message.firestorePath + '/messages/' + message.id;
              message.roomPath = this.message.firestorePath;
              this.subMessages[doc.id] = message;
            });
        });
      }
    },
    deleteMessage(message) {
      this.$parent.deleteMessage(message);
    },
    editMessage(message) {
      this.$parent.editMessage(message);
    },
    selectParent(message) {
      this.$parent.selectParent(message);
    }
  },
  beforeDestroy() {
    if (this.unsubscribeSubMessages){
      this.unsubscribeSubMessages();
    }
  }
}
</script>

<style>
.message-view {
  display: flex;
  justify-content:flex-start;
  align-items:flex-start;
  margin: 0em;
  padding: 0em;
  width: 100%;
}

.message-view:hover {
  background-color: #ffeeee;
}

.author-time {
  flex: 16;  
  display:flex; 
  flex-direction:column; 
  justify-content: space-between; 
}
.author-name {
  font-size: small;
  float: left;
}
.message-close-button {
  float: right;
}
.message-time {
  font-size: x-small;
}
.message-operation {
  padding:0; 
  margin-block-start: 0.1em; 
  margin-block-end: 0.1em;
  opacity: 0.5;
  cursor: pointer;
  font-size: small;
}

.message-operation:hover {
  opacity: 1.0;

}

.message-operation-transparent {
  opacity: 0.1;
}

.toolbar {
  list-style-type: none;
  display: inline-block;
  padding-left: 0;
  margin-block-start: 0;
  margin-block-end: 0;
}

.toolbar > li {
  float: left;
  margin-left: 0;
}
.sub-messages {
  list-style-type: none;
  display: flex;
  padding-left: 0;
  margin-block-start: 0;
  margin-block-end: 0;
}

.sub-messages > li {
  float: left;
  margin-left: 0.2em;
}

.sub-messages > li:last-child {
  width:100%
}


</style>
