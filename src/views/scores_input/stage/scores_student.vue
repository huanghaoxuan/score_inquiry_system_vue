<template>
  <div>
    <a @click="showModal">查看学生成绩</a>
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
      <a-card title="学生成绩查看">
        <a-form layout="inline" :form="form" @submit="handleSubmit">
          <a-form-item label="名字">
            <a-input v-decorator="['name']" placeholder="请输入名字" />
          </a-form-item>
          <a-form-item label="学号">
            <a-input v-decorator="['studentId']" placeholder="请输入学号" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              查询
            </a-button>
          </a-form-item>
        </a-form>
        <a-table
          :scroll="{ x: true }"
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          @change="handleTableChange"
          class="ant-table-striped"
          :row-class-name="
            (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
          "
        >
          <template slot="serial" slot-scope="text">
            {{ text + 1 }}
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
let data = [];
export default {
  inject: ["reload"],
  props: {
    allData: null,
    sourceStageData: {}
  },
  data() {
    return {
      data,
      columns: [],
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
    showModal() {
      this.getdata(1, 15);
      this.visible = true;
      // debugger;
      this.getTableHeader();
    },
    //生成表头
    getTableHeader() {
      let columns = [
        {
          title: "序号",
          dataIndex: "serial",
          key: "0",
          scopedSlots: { customRender: "serial" }
        },
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
      // console.log(this.columns);
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
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/sourceStage/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: this.sourceStageData.teachingClassId,
            courseId: this.sourceStageData.courseId,
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
              res.data.data[index].serial = (pageNum - 1) * pageSize + index;
            }
            this.data = res.data.data;
            this.pagination.total = parseInt(res.data.count);
            this.pagination.defaultPageSize = pageSize;
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
.table-striped {
  background-color: #e3e3e3;
}
</style>
