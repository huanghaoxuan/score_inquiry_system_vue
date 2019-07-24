<template>
  <div>
    <a @click="showModal">录入阶段性测验成绩</a>
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
          <template :slot="sourceStageData.id" slot-scope="text, record">
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
const columns = [];
var data = [];
export default {
  inject: ["reload"],
  props: {
    allData: null,
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
          "/sourceStage/updates",
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
      this.getTableHeader();
      this.getdata(1, 15);
      this.visible = true;
    },
    //生成表头
    getTableHeader() {
      const columns = [
        {
          title: "名字",
          dataIndex: "name",
          key: "1",
          scopedSlots: { customRender: "name" }
        },
        {
          title: "学号",
          dataIndex: "studentId",
          key: "2",
          scopedSlots: { customRender: "studentId" }
        }
      ];
      for (let index = 0; index < this.allData.length; index++) {
        var nextColumns = {
          title: this.allData[index].stageNote,
          dataIndex: this.allData[index].id,
          key: index + 3 + "",
          scopedSlots: { customRender: this.allData[index].id }
        };
        columns.push(nextColumns);
      }
      this.columns = columns;
      console.log(this.columns);
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleTableChange(pagination, filters, sorter) {
      this.update();
      // this.getdata(pagination.current, 15);
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
          "/sourceStage/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            id: this.sourceStageData.id,
            teachingClassId: this.sourceStageData.teachingClassId
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
            this.pagination.total = res.data.data.length;
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
    }
  }
  // mounted() {
  //   this.getdata(1, 15);
  // }
};
</script>
