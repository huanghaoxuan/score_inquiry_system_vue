<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="成绩查看">
      <a-form layout="inline" :form="form" @submit="handleSubmit">
        <a-form-item label="课程名">
          <a-input v-decorator="['courseName']" placeholder="请输入课程名" />
        </a-form-item>
        <a-form-item label="教学班号">
          <a-input
            v-decorator="['teachingClassId']"
            placeholder="请输入教学班号"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            查询
          </a-button>
        </a-form-item>
      </a-form>
      <br />
      <a-table
        :pagination="pagination"
        :columns="columns"
        :dataSource="data"
        @change="handleTableChange"
        :scroll="{ x: true }"
      >
        <template slot="operation1" slot-scope="text, record">
          <div class="editable-row-operations">
            <scores_student
              :teachingClassInformationData="data[record.key]"
            ></scores_student>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import scores_student from "./scores_student.vue";
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
    title: "操作",
    dataIndex: "operation1",
    key: "4",
    width: "20%",
    scopedSlots: { customRender: "operation1" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  components: { scores_student },
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
<style>
.ant-table td {
  white-space: nowrap;
}
</style>
