<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  mounted() {
    window.onpopstate = () => {
      if (!this.allowBack) {
        //    这个allowBack 是存在vuex里面的变量
        history.go(1);
      }
    };
  }
};
</script>
