<template>
  <div>
    <a @click="showModal">录入阶段性测验成绩</a>
    <a-modal
      :visible="visible"
      @ok="handleOk"
      okText="确认"
      cancelText="取消"
      :maskClosable="false"
      :destroyOnClose="true"
      :scroll="{ x: true }"
      :confirmLoading="confirmLoading"
      width="70%"
      @cancel="handleCancel"
    >
      <a-card title="阶段性成绩管理">
        <a-button style="margin: 0 20px 0 0" @click="handleOk" slot="extra"
          >确认添加</a-button
        >
        <a-table
          :scroll="{ x: true }"
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          @change="handleTableChange"
        >
          <template :slot="sourceStageData.id" slot-scope="text, record">
            <a-input
              :ref="record.key"
              v-on:keyup.right="nextInput(record.key)"
              v-on:keyup.down="nextInput(record.key)"
              v-on:keyup.up="preInput(record.key)"
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
let columns = [];
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
      pagination: {
        defaultPageSize: 15,
        total: 15,
        showTotal: total => `共 ${total} 条记录`
      }
    };
  },
  methods: {
    /**
    焦点向后移动
     */
    nextInput(index) {
      //向右移动
      //如果移动到最后一个单元格，阻止操作
      index = index + 1;
      //设置目标焦点
      if (index % 15 == 0 || index == this.pagination.total) {
        return false;
      }
      this.$refs[index].focus();
    },
    /**
    焦点向前移动
     */
    preInput(index) {
      //向右移动
      //如果移动到最后一个单元格，阻止操作
      index = index - 1;
      //设置目标焦点
      if (index == 0 || index % 14 == 0) {
        return false;
      }
      this.$refs[index].focus();
    },
    handleChange(value, key, column) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
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
      let columns = [
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
      let _this = this;
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/sourceStage/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            courseId: this.sourceStageData.courseId,
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
              res.data.data[index].sourceStageId = _this.sourceStageData.id;
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
    }
  }
  // mounted() {
  //   this.getdata(1, 15);
  // }
};
</script>
<style>
.ant-table td {
  white-space: nowrap;
}
</style>
