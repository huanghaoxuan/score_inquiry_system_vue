<template>
  <div>
    <a-button @click="showModal">跨学期课程导出</a-button>
    <a-modal
      :visible="visible"
      @ok="downloadCrossSemester"
      okText="导出"
      cancelText="取消"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      width="70%"
      :scroll="{ x: true }"
      @cancel="handleCancel"
    >
      <a-card title="学生成绩查看">
        <a-table
          :scroll="{ x: true }"
          :rowSelection="rowSelection"
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
const columns = [
  {
    title: "课程名称",
    dataIndex: "courseName",
    key: "1"
  },
  {
    title: "教学班号",
    dataIndex: "teachingClassId",
    key: "2"
  },
  {
    title: "任课老师名字",
    dataIndex: "courseTeacherName",
    key: "3"
  },
  {
    title: "学年",
    dataIndex: "yearAli",
    key: "4",
    scopedSlots: { customRender: "year" }
  },
  {
    title: "学期",
    dataIndex: "semester",
    key: "5",
    scopedSlots: { customRender: "semester" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  props: {
    teachingClassInformationData: {}
  },
  data() {
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      allData: [],
      form: this.$form.createForm(this),
      pagination: {
        defaultPageSize: 15,
        total: 15,
        showTotal: total => `共 ${total} 条记录`
      },
      rowSelection: {},
      outRes: "" //需要导出的
    };
  },
  methods: {
    downloadCrossSemester() {
      const _this = this;
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClass/downloadCrossSemester",
          JSON.stringify({
            data: _this.outRes,
            ...formData
          }),
          {
            params: {},
            responseType: "blob",
            headers: {
              Authorization: this.$store.state.token,
              "Content-Type": "application/json"
            }
          }
        )
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "crossSemester.xlsx");
          document.body.appendChild(link);
          link.click();
          this.visible = false;
        })
        .catch(
          function(err) {
            if (err.response) {
              console.log(err.response);
              //控制台打印错误返回的内容
            }
            //bind(this)可以不用
          }.bind(this)
        );
    },
    showModal() {
      this.getdata(1, 15);
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
      const _this = this;
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClassInformation/selectCrossSemester",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: _this.teachingClassInformationData.teachingClassId,
            id: _this.teachingClassInformationData.id,
            uniqueSign: _this.teachingClassInformationData.uniqueSign,
            courseName: _this.teachingClassInformationData.courseName,
            courseId: _this.teachingClassInformationData.courseId,
            courseTeacherName:
              _this.teachingClassInformationData.courseTeacherName,
            courseTeacherId: _this.teachingClassInformationData.courseTeacherId,
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
              res.data.data[index].yearAli =
                res.data.data[index].year +
                " - " +
                (res.data.data[index].year + 1);
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
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.outRes = selectedRows;
      }
    };
    this.rowSelection = rowSelection;
  }
};
</script>
<style>
.ant-table td {
  white-space: nowrap;
}
</style>
