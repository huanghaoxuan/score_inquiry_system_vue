<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="阶段性成绩录入">
      <a-table
        :pagination="pagination"
        :columns="columns"
        :dataSource="data"
        @change="handleTableChange"
      >
        <template slot="operation1" slot-scope="text, record">
          <div class="editable-row-operations">
            <student :teachingClassInformationData="data[record.key]"></student>
          </div>
        </template>
        <template slot="operation2" slot-scope="text, record">
          <div class="editable-row-operations">
            <scores :teachingClassInformationData="data[record.key]"></scores>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import student from "./student.vue";
import scores from "./scores.vue";
const columns = [
  {
    title: "课程名称",
    dataIndex: "courseName",
    key: "1",
    width: "20%"
  },
  {
    title: "教学班号",
    dataIndex: "teachingClassId",
    key: "2",
    width: "20%"
  },
  {
    title: "任课老师名字",
    dataIndex: "courseTeacherName",
    key: "3",
    width: "20%"
  },
  {
    title: "学生管理",
    dataIndex: "operation1",
    key: "4",
    width: "20%",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "管理",
    dataIndex: "operation2",
    key: "5",
    width: "20%",
    scopedSlots: { customRender: "operation2" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  components: { student, scores },
  props: {
    courseData: {}
  },
  data() {
    return {
      data,
      columns,
      confirmLoading: false,
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
          "/teachingClassInformation/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            courseTeacherName: this.$store.state.name
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
            this.data = res.data.data;
            this.pagination.total = res.data.data.length;
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
