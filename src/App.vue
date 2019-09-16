<template>
  <div>
    <div id="app">
      <router-view />
    </div>
    <div class="footer">Copyright © 2019 黄浩轩. All rights reserved.</div>
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
<style>
.footer {
  text-align: center;
  color: rgba(3, 32, 48, 1);
  line-height: 30px;
  width: 100%;
  font-size: 12px;
  position: fixed;
  bottom: 0;
  overflow: hidden;
  margin: 0;
}
</style>
