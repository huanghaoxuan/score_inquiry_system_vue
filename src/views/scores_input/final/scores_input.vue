<template>
  <div>
    <a @click="showModal">录入期末测验成绩</a>
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
      <a-card title="期末成绩管理">
        <div slot="extra">
          <a-button style="margin: 0 20px 0 0" @click="updateStudent"
            >同步学生信息</a-button
          >
          <a-button style="margin: 0 20px 0 0" @click="handleOk"
            >确认添加</a-button
          >
        </div>

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
    width: "22%"
  },
  {
    title: "学号",
    dataIndex: "studentId",
    key: "2",
    width: "22%"
  },
  {
    title: "成绩相关说明",
    dataIndex: "scoresNote",
    key: "3",
    width: "33%",
    scopedSlots: { customRender: "scoresNote" }
  },
  {
    title: "成绩",
    dataIndex: "scores",
    key: "4",
    width: "23%",
    scopedSlots: { customRender: "scores" }
  }
];
var data = [];
export default {
  inject: ["reload"],
  props: {
    teachingClassInformationData: null
  },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 15, total: 15 }
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
      this.update();
      this.visible = false;
      this.confirmLoading = false;
    },
    update() {
      this.axios
        .post(
          "/sourceFinal/updates",
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
            this.$notification.success({
              message: "自动保存成功！"
            });
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
    showModal() {
      // console.log(this.courseData);
      this.getdata(1, 15);
      this.visible = true;
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleTableChange(pagination, filters, sorter) {
      this.update();
      this.getdata(pagination.current, 15);
    },
    //查询时提交数据
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.getdata(1, 15);
        }
      });
    },
    getdata(pageNum, pageSize) {
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/sourceFinal/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: this.teachingClassInformationData.teachingClassId,
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
            for (let index = 0; index < res.data.data.length; index++) {
              res.data.data[index].key = index;
            }
            console.log(this.data);
            this.data = res.data.data;
            this.pagination.total = res.data.count;
            this.pagination.defaultPageSize = pageSize;
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
    },
    updateStudent() {
      this.axios
        .get(
          "/sourceFinal/updateStudent/" +
            this.teachingClassInformationData.teachingClassId,
          {
            params: {},
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
            if (res.data.status != 0) {
              this.data = newData.filter(item => item.key !== key);
              this.$notification.success({
                message: "同步成功！"
              });
              this.getdata(1, 15);
            } else {
              this.$notification.error({
                message: "无需要同步学生！"
              });
            }
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
  //   this.getdata(1, 15);
  // }
};
</script>
