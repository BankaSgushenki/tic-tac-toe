<template>
  <div class="">
    <div class="field">
      <div class="item" v-for="(item, index) in items" v-bind:class="item.value" v-on:click="setField(index)">
        {{item.value}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "field",

  data () {
    return {
      msg: "Field",
      items: [],
      clientId: ""
    }
  },

  methods: {
    getField: function() {
      window.socket = new WebSocket("ws:10.10.2.228:3001", "protocolOne");
      let vm = this;

      socket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        if (data.type === "INIT" || data.type === "FIELD") {
          vm.items = data.field;
        }
        if (data.clientId) {
          vm.clientId = data.clientId;
        }
      }
      socket.onopen = function (event) {
        socket.send("field");
      };
    },
    setField: function(index) {
      const x = index % 16;
      const y = (index - x) / 16;

      const data = {
        x: x,
        y: y,
        value: this.clientId
      }

      socket.send(JSON.stringify(data));
    }
  },

  created: function(index) {
    this.getField();
  }
}
</script>

<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.field {
  display: grid;
  width: 800px;
  font-size: 35px;
  font-weight: bold;
  grid-template-columns: repeat(16, 1fr);
  grid-gap: 3px;

  margin: 0 auto;
}

.item {
  background: #1CA7DB;
  color: white;
  width: 50px;
  height: 50px;
  line-height: 50px;
  cursor: pointer;
}

.item.x {
  color: #35495E;
}

.item:hover {
  opacity: 0.8;
}

</style>
