<template>
  <div>
    <a @click="showModal">查看教学班</a>
    <a-modal
      title="正在管理教学班"
      :visible="visible"
      @ok="handleOk"
      okText="确认"
      cancelText="取消"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      width="70%"
      @cancel="handleCancel"
    >
      <a-card title="教学班管理">
        <floder
          slot="extra"
          v-if="extraBool"
          :courseData="this.courseData"
          @getdata="getdata"
        ></floder>
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
          <template
            v-for="col in [
              'courseName',
              'teachingClassId',
              'courseTeacherName'
            ]"
            :slot="col"
            slot-scope="text, record"
          >
            <div :key="col">
              <a-input
                v-if="record.editable"
                style="margin: -5px 0"
                :value="text"
                @change="e => handleChange(e.target.value, record.key, col)"
              />
              <template v-else>{{ text }}</template>
            </div>
          </template>
          <!-- <template slot="status" slot-scope="text">
            <div v-if="text == 1">
              教师录入中
            </div>
            <div v-else-if="text == 2" style="color : #f00;">
              教师已确认
            </div>
            <div v-else-if="text == 3" style="color : #1f640a;">
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
          </template> -->
          <template slot="operation1" slot-scope="text, record">
            <div class="editable-row-operations">
              <student
                :teachingClassInformationData="data[record.key]"
              ></student>
            </div>
          </template>
          <template slot="operation2" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record.key)" style="padding:10px">保存</a>
                <a @click="() => cancel(record.key)">取消</a>
              </span>
              <span v-else>
                <a
                  @click="() => edit(record.key)"
                  style="padding:10px"
                  :class="extraBool ? '' : 'disabled'"
                  >修改</a
                >
                <a-popconfirm
                  title="确定删除该条数据？?"
                  @confirm="() => onDelete(record.key)"
                >
                  <a :class="extraBool ? '' : 'disabled'">删除</a>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
import student from "./student.vue";
import floder from "./floder.vue";
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
    key: "3",
    scopedSlots: { customRender: "courseTeacherName" }
  },
  {
    title: "学生人数",
    dataIndex: "studentCount",
    key: "4",
    scopedSlots: { customRender: "studentCount" }
  },
  // {
  //   title: "当前状态",
  //   dataIndex: "status",
  //   key: "41",
  //   scopedSlots: { customRender: "status" }
  // },
  // {
  //   title: "状态变更",
  //   dataIndex: "nemStatus",
  //   key: "42",
  //   scopedSlots: { customRender: "newStatus" }
  // },
  {
    title: "学生管理",
    dataIndex: "operation1",
    key: "5",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "操作",
    dataIndex: "operation2",
    key: "6",
    scopedSlots: { customRender: "operation2" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  components: { student, floder },
  props: {
    extraBool: {
      type: Boolean,
      default: true
    },
    courseData: {}
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
        defaultPageSize: 5,
        total: 5,
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
    showModal() {
      this.getdata(1, 5);
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
    handleChange(value, key, column) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      if (target) {
        target[column] = value;
        this.data = newData;
      }
      //axios
    },
    edit(key) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },
    onDelete(key) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      //console.log(target);
      this.axios
        .get("/teachingClassInformation/delete/" + target.uniqueSign, {
          params: {},
          headers: {
            Authorization: this.$store.state.token,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(
          function(res) {
            //console.log(res.data);
            //每条数据需要一个唯一的key值
            if (res.data.status != 0) {
              this.data = newData.filter(item => item.key !== key);
              this.$notification.warning({
                message: "删除成功！"
              });
            } else {
              this.$notification.error({
                message: "删除失败，请重新删除！"
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
    save(key) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      //console.log(target);
      this.axios
        .post(
          "/teachingClassInformation/update",
          this.qs.stringify({
            id: target.uniqueSign,
            courseTeacherName: target.courseTeacherName
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
            if (res.data.status != 0) {
              delete target.editable;
              this.data = newData;
              this.cacheData = newData.map(item => ({ ...item }));
              this.$notification.success({
                message: "修改成功！"
              });
            } else if (res.data.status == 0) {
              this.$notification.warning({
                message: "数据未进行修改或修改有误，请检查数据正确性！"
              });
            } else {
              this.$notification.error({
                message: "修改失败，请重新修改！"
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
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => key === item.key)[0]
        );
        delete target.editable;
        this.data = newData;
      }
    },
    getdata(pageNum, pageSize) {
      let _this = this;
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClassInformation/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            courseId: this.courseData.id,
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
              res.data.data[index].courseId = _this.courseData.courseId;
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
  }
  // mounted() {
  //   this.getdata(1, 5);
  // }
};
</script>
<style lang="scss">
.disabled {
  pointer-events: none;
  filter: alpha(opacity=50); /*IE滤镜，透明度50%*/
  -moz-opacity: 0.5; /*Firefox私有，透明度50%*/
  opacity: 0.5; /*其他，透明度50%*/
}
</style>
<style>
.table-striped {
  background-color: #e3e3e3;
}
</style>
