<template>
  <div>
    <a-spin :spinning="spinning" size="large">
      <v-chart :forceFit="true" :height="height" :data="data" :scale="scale">
        <v-tooltip :showTitle="false" dataKey="item*percent" />
        <v-axis />
        <v-legend dataKey="item" />
        <v-pie
          position="percent"
          color="item"
          :vStyle="pieStyle"
          :label="labelConfig"
        />
        <v-coord type="theta" :radius="0.75" :innerRadius="0.6" />
      </v-chart>
    </a-spin>
  </div>
</template>

<script>
let DataSet = require("@antv/data-set");

export default {
  data() {
    return {
      data: null,
      scale: null,
      height: 400,
      spinning: true,
      pieStyle: {
        stroke: "#fff",
        lineWidth: 1
      },
      labelConfig: [
        "percent",
        {
          formatter: (val, item) => {
            return item.point.item + ": " + val;
          }
        }
      ]
    };
  },
  methods: {
    getData() {
      this.axios
        .get("/analysis/pass/" + this.$store.state.studentId, {
          headers: {
            Authorization: this.$store.state.token
          }
        })
        .then(
          function(res) {
            let sourceData = res.data.data;

            let scale = [
              {
                dataKey: "percent",
                min: 0,
                formatter: ".0%"
              }
            ];

            let dv = new DataSet.View().source(sourceData);
            dv.transform({
              type: "percent",
              field: "count",
              dimension: "item",
              as: "percent"
            });
            let data = dv.rows;

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
