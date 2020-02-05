<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="课程管理">
      <a-form layout="inline" :form="form" @submit="handleSubmit">
        <a-form-item label="课程号">
          <a-input v-decorator="['courseId']" placeholder="请输入课程号" />
        </a-form-item>
        <a-form-item label="课程名">
          <a-input v-decorator="['name']" placeholder="请输入课程名" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            查询
          </a-button>
        </a-form-item>
      </a-form>
      <br />
      <a-table
        :scroll="{ x: true }"
        :pagination="pagination"
        :columns="columns"
        :dataSource="data"
        @change="handleTableChange"
      >
        <template slot="serial" slot-scope="text">
          {{ text + 1 }}
        </template>
        <template slot="courseAdministrator" slot-scope="text, record">
          {{ record.courseAdministratorName }}
        </template>
        <template slot="operation" slot-scope="text, record">
          <div class="editable-row-operations">
            <scores :teachingClassInformationData="data[record.key]"></scores>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import scores from "./scores.vue";
let columns = [
  {
    title: "序号",
    dataIndex: "serial",
    key: "01",
    scopedSlots: { customRender: "serial" }
  },
  {
    title: "课程号",
    dataIndex: "courseId",
    key: "0"
  },
  {
    title: "课程名",
    dataIndex: "name",
    key: "1"
  },
  {
    title: "学年",
    dataIndex: "year1",
    key: "2",
    scopedSlots: { customRender: "year1" }
  },
  {
    title: "学期",
    dataIndex: "semester",
    key: "3",
    scopedSlots: { customRender: "semester" }
  },
  {
    title: "教学班个数",
    dataIndex: "classCount",
    key: "4",
    scopedSlots: { customRender: "classCount" }
  },
  {
    title: "学生总人数",
    dataIndex: "studentCount",
    key: "5",
    scopedSlots: { customRender: "studentCount" }
  },
  {
    title: "已完成录入教学班个数",
    dataIndex: "completeInput",
    key: "51",
    scopedSlots: { customRender: "completeInput" }
  },
  {
    title: "未完成录入教学班个数",
    dataIndex: "unCompleteInput",
    key: "52",
    scopedSlots: { customRender: "unCompleteInput" }
  },
  {
    title: "课程管理员",
    dataIndex: "courseAdministrator",
    key: "53",
    scopedSlots: { customRender: "courseAdministrator" }
  },
  {
    title: "管理",
    dataIndex: "operation",
    key: "6",
    scopedSlots: { customRender: "operation" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  components: { scores },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      form: this.$form.createForm(this),
      pagination: {
        defaultPageSize: 9,
        total: 9,
        showTotal: total => `共 ${total} 条记录`
      },
      teacherInfos: []
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
      let _this = this;
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/course/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            courseAdministrator: _this.$store.state.id
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
              var temp = res.data.data[index].year + 1;
              res.data.data[index].year1 =
                res.data.data[index].year + "-" + temp + " 学年";
            }
            this.data = res.data.data;
            this.pagination.total = parseInt(res.data.count);
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
  },
  mounted() {
    this.getdata(1, 9);
  }
};
</script>
