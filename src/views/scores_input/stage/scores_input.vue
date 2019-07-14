<template>
  <div>
    <a @click="showModal">录入阶段性测验成绩</a>
    <a-modal
      title="正在录入阶段性测验成绩"
      :visible="visible"
      @ok="handleOk"
      okText="确认"
      cancelText="取消"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      width="50%"
      @cancel="handleCancel"
    >
      <a-card title="阶段性成绩管理">
        <a-button style="margin: 0 20px 0 0" @click="handleOk" slot="extra"
          >确认添加</a-button
        >
        <a-table
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          @change="handleTableChange"
        >
          <template slot="scoresNote" slot-scope="text, record">
            <a-input
              style="margin: -5px 0"
              v-model="data[`${record.key}`].scoresNote"
            />
          </template>
          <template slot="scores" slot-scope="text, record">
            <a-input
              style="margin: -5px 0"
              v-model="data[`${record.key}`].scores"
            />
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
const columns = [
  {
    title: "姓名",
    dataIndex: "name",
    key: "1",
    width: "33%"
  },
  {
    title: "成绩相关说明",
    dataIndex: "scoresNote",
    key: "2",
    width: "33%",
    scopedSlots: { customRender: "scoresNote" }
  },
  {
    title: "成绩",
    dataIndex: "scores",
    key: "3",
    width: "33%",
    scopedSlots: { customRender: "scores" }
  }
];
var data = [];
export default {
  inject: ["reload"],
  props: {
    sourceStageData: null
  },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 5, total: 5 }
    };
  },
  methods: {
    handleChange(value, key, column) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        target[column] = value;
        this.data = newData;
      }
      //axios
    },
    handleOk(key) {
      this.confirmLoading = true;
      this.axios
        .post(
          "/sourceStage/inserts",
          JSON.stringify({
            data: this.data
          }),
          {
            headers: {
              Authorization: this.$store.state.token,
              "Content-Type": "application/json"
            }
          }
        )
        .then(
          function(res) {
            if (res.data.status != 0) {
              this.$notification.success({
                message: "保存成功！"
              });
              this.visible = false;
              this.confirmLoading = false;
            } else {
              this.$notification.error({
                message: "保存失败，请重新保存！"
              });
            }
          }.bind(this)
        )
        .catch(
          function(err) {
            if (err.response.status == 403) {
              //console.log(err.response);
              this.$notification.error({
                message: "账号密码已过期，请重新登录！"
              });
              this.$router.push("/login");
              //控制台打印错误返回的内容
            }
            //bind(this)可以不用
          }.bind(this)
        );
    },
    cancel(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => key === item.key)[0]
        );
        delete target.editable;
        this.data = newData;
      }
    },
    showModal() {
      // console.log(this.courseData);
      this.getdata(1, 5);
      this.visible = true;
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleTableChange(pagination, filters, sorter) {
      this.getdata(pagination.current, 5);
    },
    //查询时提交数据
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.getdata(1, 5);
        }
      });
    },
    getdata(pageNum, pageSize) {
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClass/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: this.sourceStageData.teachingClassId,
            ...formData
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
            this.data = res.data.data;
            for (let index = 0; index < res.data.data.length; index++) {
              // debugger;
              this.data[index].name = res.data.data[index].name;
              this.data[index].studentId = res.data.data[index].studentId;
              this.data[index].teachingClassId =
                res.data.data[index].teachingClassId;
              this.data[index].sourceStageId = this.sourceStageData.id;
              this.data[index].key = index;
            }
            console.log(this.data);
            // this.data = res.data.data;
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
  }
  // mounted() {
  //   this.getdata(1, 5);
  // }
};
</script>
