<template>
  <div>
    <a @click="showModal">查看阶段性成绩</a>
    <a-modal
      :visible="visible"
      @ok="handleOk"
      okText="确认"
      cancelText="取消"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      width="70%"
      @cancel="handleCancel"
    >
      <a-card title="阶段性成绩查看">
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
          :scroll="{ x: true }"
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          @change="handleTableChange"
        >
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
let columns = [
  {
    title: "阶段性序号",
    dataIndex: "stageId",
    key: "1",
    width: "25%",
    scopedSlots: { customRender: "stageId" }
  },
  {
    title: "阶段性描述",
    dataIndex: "stageNote",
    key: "2",
    width: "25%",
    scopedSlots: { customRender: "stageNote" }
  },
  {
    title: "成绩注释",
    dataIndex: "scoresNote",
    key: "3",
    width: "25%",
    scopedSlots: { customRender: "scoresNote" }
  },
  {
    title: "成绩",
    dataIndex: "scores",
    key: "4",
    width: "25%",
    scopedSlots: { customRender: "scores" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  props: {
    sourceStageData: {}
  },
  data() {
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: {
        defaultPageSize: 9,
        total: 9,
        showTotal: total => `共 ${total} 条记录`
      }
    };
  },
  methods: {
    showModal() {
      console.log(this.sourceStageData);
      this.getdata(1, 9);
      this.visible = true;
    },
    handleOk(e) {
      this.visible = false;
      //this.confirmLoading = true;
      //this.handleSubmit(e);
    },
    handleCancel(e) {
      this.visible = false;
    },
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
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/ShowSource/Stage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            teachingClassId: this.sourceStageData.teachingClassId,
            studentId: this.sourceStageData.studentId
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
              res.data.data[index].serial = (pageNum - 1) * pageSize + index;
            }
            this.data = res.data.data;
            this.pagination.total = parseInt(res.data.count);
            this.pagination.defaultPageSize = parseInt(res.data.pageSize);
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
  }
  // mounted() {
  //   this.getdata(1, 9);
  // }
};
</script>
