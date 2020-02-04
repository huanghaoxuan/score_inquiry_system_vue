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
        <template slot="serial" slot-scope="text">
          {{ text + 1 }}
        </template>
        <template slot="status" slot-scope="text">
          <div v-if="text == 1">
            教师录入中
          </div>
          <div v-else-if="text == 2" style="color : #f00;">
            教师已确认
          </div>
          <div v-else-if="text == 3" style="color : #96ceb4;">
            成绩已发布
          </div>
        </template>
        <template slot="newStatus" slot-scope="text, record">
          <a
            @click="updateStauts(record, 2)"
            v-if="record.status == 1"
            style="margin-left:10px"
            >确认成绩</a
          >
          <a
            @click="updateStauts(record, 1)"
            v-if="record.status == 2 || record.status == 3"
            :class="record.status == 3 ? 'disabled' : ''"
            style="margin-left:10px"
            >重新录入</a
          >
        </template>
        <template slot="operation1" slot-scope="text, record">
          <div class="editable-row-operations">
            <scores_student
              :teachingClassInformationData="data[record.key]"
            ></scores_student>
          </div>
        </template>
        <template slot="publicStatus" slot-scope="text, record">
          <a
            @click="updateStauts(record, 3)"
            v-if="record.status == 2 || record.status == 1"
            :class="record.status == 1 ? 'disabled' : ''"
            style="margin-left:10px"
            >发布成绩</a
          >
          <a
            @click="updateStauts(record, 2)"
            v-if="record.status == 3"
            style="margin-left:10px"
            >取消发布</a
          >
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import scores_student from "./scores_student.vue";
let columns = [
  {
    title: "序号",
    dataIndex: "serial",
    key: "0",
    scopedSlots: { customRender: "serial" }
  },
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
    title: "当前状态",
    dataIndex: "status",
    key: "41",
    scopedSlots: { customRender: "status" }
  },
  {
    title: "状态变更",
    dataIndex: "nemStatus",
    key: "42",
    scopedSlots: { customRender: "newStatus" }
  },
  {
    title: "操作",
    dataIndex: "operation1",
    key: "4",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "发布成绩",
    dataIndex: "publicStatus",
    key: "5",
    scopedSlots: { customRender: "publicStatus" }
  }
];
let data = [];
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
      pagination: {
        defaultPageSize: 9,
        total: 9,
        showTotal: total => `共 ${total} 条记录`
      }
    };
  },
  methods: {
    updateStauts(record, status) {
      let _this = this;
      this.axios
        .post(
          "/teachingClassInformation/updateStauts",
          this.qs.stringify({
            ...record,
            courseId: record.id,
            id: record.uniqueSign,
            status: status
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
            if (res.data.status != 0) {
              _this.$notification.success({
                message: "状态变更成功！"
              });
              record.status = parseInt(status);
            } else {
              _this.$notification.error({
                message: "状态变更失败，请重新尝试！"
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
              res.data.data[index].serial = (pageNum - 1) * pageSize + index;
            }
            this.data = res.data.data;
            this.pagination.total = res.data.count;
            this.pagination.defaultPageSize = res.data.pageSize;
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
.disabled {
  pointer-events: none;
  filter: alpha(opacity=50); /*IE滤镜，透明度50%*/
  -moz-opacity: 0.5; /*Firefox私有，透明度50%*/
  opacity: 0.5; /*其他，透明度50%*/
}
</style>
