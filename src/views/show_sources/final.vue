<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="成绩查询">
      <a-form layout="inline" :form="form" @submit="handleSubmit">
        <!-- <a-form-item label="名字">
          <a-input v-decorator="['name']" placeholder="请输入名字" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            查询
          </a-button>
        </a-form-item> -->
      </a-form>
      <a-table
        :pagination="pagination"
        :columns="columns"
        :dataSource="data"
        @change="handleTableChange"
      >
        <!-- 查看阶段性成绩 -->
        <!-- <template slot="sourceStage" slot-scope="text, record">
          <div class="editable-row-operations">
            <stage :sourceStageData="data[record.key]"></stage>
          </div>
        </template> -->
      </a-table>
    </a-card>
  </div>
</template>

<script>
// import stage from "./stage.vue";
const columns = [
  {
    title: "课程名字",
    dataIndex: "courseName",
    key: "1",
    width: "16%",
    scopedSlots: { customRender: "courseName" }
  },
  {
    title: "学年",
    dataIndex: "year1",
    key: "2",
    width: "16%",
    scopedSlots: { customRender: "year1" }
  },
  {
    title: "学期",
    dataIndex: "semester",
    key: "3",
    width: "16%",
    scopedSlots: { customRender: "semester" }
  },
  {
    title: "期末成绩成绩",
    dataIndex: "result",
    key: "4",
    width: "16%",
    scopedSlots: { customRender: "scores" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  // components: { stage },
  data() {
    return {
      data,
      columns,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 9, total: 9 }
    };
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      this.getdata(pagination.current, 9);
    },
    //查询时提交数据
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.getdata(1, 9);
        }
      });
    },
    getdata(pageNum, pageSize) {
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClass/showFinal",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            studentId: this.$store.state.studentId
          }),
          {
            headers: {
              Authorization: this.$store.state.token,
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(
          function(res) {
            //console.log(res.data);
            //每条数据需要一个唯一的key值
            for (let index = 0; index < res.data.data.length; index++) {
              res.data.data[index].key = index;
              var temp = res.data.data[index].year + 1;
              res.data.data[index].year1 =
                res.data.data[index].year + "-" + temp + " 学年";
            }
            this.data = res.data.data;
            this.pagination.total = res.data.count;
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
    this.getdata(1, 9);
  }
};
</script>
