<template>
  <div></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.$store.commit("isLogin", false);
    //console.log(this.$store.state.loginStatus);
    //window.location.href = "./Login.html";
  }
};
</script>
