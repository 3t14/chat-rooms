<template>
  <div>
    <h2>チャットルーム一覧</h2>
    <button @click="addRoom" >ルームを追加する</button>
    <table id="room-list-table">
      <tr>
        <th>No.</th>
        <th>ルーム名</th>
        <th>作成者</th>
        <th>作成日時</th>
        <th></th>
      </tr>
      <tr v-for="(room, key, index) in rooms" :key="room.id">
        <td>{{index + 1}}</td>
        <td>
          <a @click="$emit('enter', room)">
          {{room.name}}
          </a>
        </td>
        <td>
          <img :src="room.creatorPhotoURL" width="32px" align="left"/>
          {{room.creatorName}}
          </td>
        <td>{{room.created.toDate().toLocaleString()}}</td>
      </tr>
    </table>
  </div>

</template>

<script>
export default {
  data() {
    let rooms = {};
    return {
      rooms,
      unsbscribeRooms:null
    }
  },
  methods: {
    addRoom() {
      let roomName = prompt('ルーム名を入力してください。');
      if (roomName) {
        console.log(roomName)
        let room = {
          name:roomName, created: new Date(), 
          creatorId: this.$auth.currentUser.uid, creatorName: this.$auth.currentUser.displayName, creatorPhotoURL: this.$auth.currentUser.photoURL
        };
        this.$db.collection('rooms').add(room).then(docRef => {
          console.log(`ルーム${roomName}(${docRef.id})を作成しました。`);
        });
      }
    },
    loadRooms(querySnapshot){
      this.rooms = {};
      querySnapshot.forEach( (doc) => {
        let room = doc.data();
        room.id = doc.id; // パス取得に必要なため、idを内包する
        this.rooms[doc.id] = room;              
      });

    }
  },
  mounted() {
    // ルーム一覧を取得
    // this.$db.collection('rooms').orderBy('created', 'desc').get().then( (querySnapshot) => {
    //   this.loadRooms(querySnapshot);
    // });
    this.unsbscribeRooms = this.$db.collection('rooms').orderBy('created',  'desc').onSnapshot((querySnapshot) => {
      this.loadRooms(querySnapshot);
    });
  },
  beforeDestroy() {
    // onSnapshotのリスナー解除
    this.unsbscribeRooms();
  }

}
</script>

<style>
#room-list-table {
  margin-left: auto;
  margin-right: auto;
  border: gray 1px solid;
  border-collapse: collapse;
}
#room-list-table th, #room-list-table td {
  border: gray 1px solid;
}

#room-list-table a {
  color:mediumblue;
  text-decoration-line: underline;
}
#room-list-table a:hover {
  color: #7cf;
  text-decoration-line: underline;
}
</style>
