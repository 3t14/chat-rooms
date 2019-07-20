<template>
  <span>
    <input v-if="command == null" type="checkbox" value="message.value" v-model="checked" @change="toggle">
    <span v-else>/todo </span>
    <del class="task-done" v-if="checked" @dblclick="editMessage(message)" >
    {{$typeTrim(message.content)}}
    </del>
    <span v-else @dblclick="editMessage(message)" >
    {{$typeTrim(message.content)}}
    </span>
    <span class="done-time" v-if="checked && message.done != null">({{message.done.toDate().toLocaleString()}}完了)</span>
    <h4 v-if="command=='list'">未完了のタスク一覧</h4>
    <ul class="todo-list" v-if="command=='list'">
      <li v-for="task in unfinishedTasks" :key="task.id">
        <task-view v-if="task.content!='/todo list'" :message="task">{{$typeTrim(task.content)}}</task-view>
      </li>
    </ul>
  </span>
</template>

<script>
import TaskView from './TaskView'

export default {
  name: 'task-view',
  data() {
    let checked = this.message.value ? this.message.value: false;
    let command = null;
    let unfinishedTasks = [];
    return {
      checked,
      command,
      unfinishedTasks,
      unsubscribeUnfinishedTasks: null
    }
  },
  props: {
    message: Object
  },
  methods: {
    toggle() {
      // 更新
      this.$db.doc(this.message.firestorePath).update('value', this.checked);
      if (this.checked) {
        this.$db.doc(this.message.firestorePath).update('done', new Date());
      }
    },
    updateUnfinishedTasks(querySnapshot) {   
      this.unfinishedTasks = []; 
      if (!querySnapshot.empty) {
        querySnapshot.forEach( (doc) => {
          let data = doc.data();
          data.id = doc.id;
          data.room = this.room;
          data.firestorePath = this.message.roomPath + '/messages/' + doc.id;
          data.roomPath = this.message.roomPath;
          
          this.unfinishedTasks.push(data);
        });
      }
    },
    editMessage(message){
      console.log(this.$parent.$parent);
      try {
        this.$parent.$parent.editMessage(message);
      } catch {
         this.$parent.$parent.$parent.editMessage(message);
      }
    }
  },
  mounted() {
    if (this.message.content.trim() == '/todo list'){
      this.command = 'list';
      this.unsubscribeUnfinishedTasks = this.$db.collection(this.message.roomPath + '/messages')
        .where('type', '==', 'todo')
        .where('value', '==', false)
        .orderBy('created')
        .onSnapshot((querySnapshot) => {
        this.updateUnfinishedTasks(querySnapshot);
      });
    }
  },
  beforeDestroy() {
    if (this.unsubscribeUnfinishedTasks)
      this.unsubscribeUnfinishedTasks();
  }
}
</script>

<style>
.task-done {
  color: lightgray;
}
.done-time {
  font-size: x-small
}
.todo-list {
  border:blue 1px solid;
  border-radius: 0.5em;
  list-style-type: none;
  padding-left: 1em;
}
</style>
