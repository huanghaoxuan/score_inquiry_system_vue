<template>
  <div>
    <a-spin :spinning="spinning" size="large">
      <v-chart :forceFit="true" :height="height" :data="data" :scale="scale">
        <v-tooltip />
        <v-axis />
        <v-bar position="year*count" />
      </v-chart>
    </a-spin>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
      scale: null,
      spinning: true,
      height: 400
    };
  },
  methods: {
    getData() {
      this.axios
        .get("/analysis/score/" + this.$store.state.studentId, {
          headers: {
            Authorization: this.$store.state.token
          }
        })
        .then(
          function(res) {
            const data = res.data.data;
            const scale = [
              {
                dataKey: "count",
                tickInterval: 20
              }
            ];
            this.data = data;
            this.scale = scale;
            this.spinning = false;
          }.bind(this)
        )
        .catch(
          function(err) {
            if (err.response) {
              //console.log(err.response);
              //控制台打印错误返回的内容
              if (err.response.status == 403) {
                //console.log(err.response);
                this.$notification.error({
                  message: "账号密码已过期，请重新登录！"
                });
                this.$router.push("/login");
                //控制台打印错误返回的内容
              }
            }
            //bind(this)可以不用
          }.bind(this)
        );
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
