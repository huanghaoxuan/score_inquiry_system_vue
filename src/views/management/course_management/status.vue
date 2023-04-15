<template>
  <div style="background: #ececec; padding: 30px">
    <a-card title="课程管理">
      <floder slot="extra"></floder>
      <a-form layout="inline" :form="form" @submit="handleSubmit">
        <a-form-item label="课程号">
          <a-input v-decorator="['courseId']" placeholder="请输入课程号" />
        </a-form-item>
        <a-form-item label="课程名">
          <a-input v-decorator="['name']" placeholder="请输入课程名" />
        </a-form-item>
        <a-form-item label="学年">
          <a-input-group compact>
            <a-input
              style="width: 100px; text-align: center"
              v-decorator="['year', { getValueFromEvent: yearChange() }]"
            />
            <a-input
              style="
                width: 30px;
                border-left: 0;
                pointer-events: none;
                backgroundcolor: #fff;
              "
              placeholder="-"
              disabled
            />
            <a-input
              v-model="year2"
              style="
                width: 100px;
                text-align: center;
                border-left: 0;
                pointer-events: none;
                backgroundcolor: #fff;
              "
              disabled
            />
            <a-input
              style="
                width: 60px;
                border-left: 0;
                pointer-events: none;
                backgroundcolor: #fff;
              "
              placeholder="学年"
              disabled
            />
          </a-input-group>
        </a-form-item>
        <a-form-item label="学期">
          <a-select
            v-decorator="['semester']"
            placeholder="请选择学期"
            style="width: 120px"
          >
            <a-select-option value="第一学期"> 第一学期 </a-select-option>
            <a-select-option value="第二学期"> 第二学期 </a-select-option>
            <a-select-option value=""> 暂无 </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit"> 查询 </a-button>
        </a-form-item>
      </a-form>
      <br />
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
          v-for="col in ['courseId', 'name']"
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
        <template slot="courseAdministrator" slot-scope="text, record">
          <div key="courseAdministrator">
            <a-select
              showSearch
              labelInValue
              placeholder="请选择课程负责人"
              :defaultActiveFirstOption="false"
              :showArrow="false"
              :filterOption="false"
              @search="searchTeacherInfos"
              :value="{ key: record.courseAdministratorName }"
              v-if="record.editable"
              style="width: 100px"
              @change="
                value => {
                  handleChange(value, record.key, 'courseAdministrator');
                }
              "
            >
              <a-select-option v-for="data in teacherInfos" :key="data.id">{{
                data.name
              }}</a-select-option>
            </a-select>
            <template v-else>{{ record.courseAdministratorName }}</template>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record">
          <div class="editable-row-operations">
            <classes_management
              :courseData="data[record.key]"
            ></classes_management>
          </div>
        </template>
        <template slot="operation2" slot-scope="text, record">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record.key)">保存</a>
              <a @click="() => cancel(record.key)" style="padding: 10px"
                >取消</a
              >
            </span>
            <span v-else>
              <a @click="() => edit(record.key)">修改</a>
              <a-popconfirm
                title="确定删除该条数据？？"
                @confirm="() => onDelete(record.key)"
              >
                <a style="padding: 10px">删除</a>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import floder from "./floder.vue";
import classes_management from "./../classes_management/status.vue";
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
    title: "课程负责人",
    dataIndex: "courseAdministrator",
    key: "53",
    scopedSlots: { customRender: "courseAdministrator" }
  },
  {
    title: "教学班管理",
    dataIndex: "operation",
    key: "6",
    scopedSlots: { customRender: "operation" }
  },
  {
    title: "操作",
    dataIndex: "operation2",
    key: "7",
    scopedSlots: { customRender: "operation2" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  components: { floder, classes_management },
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
    yearChange(value) {
      this.year2 = parseInt(this.form.getFieldValue("year")) + 1;
    },
    updateStauts(record, status) {
      let _this = this;
      this.axios
        .post(
          "/course/releaseCourse",
          this.qs.stringify({
            id: record.id,
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
              this.data[record.key].status = status;
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
    handleChange(value, key, column) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      if (target) {
        if (column == "courseAdministrator") {
          target.courseAdministratorName = value.label;
          target[column] = value.key;
        } else {
          target[column] = value;
        }
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
    searchTeacherInfos(value) {
      if (value == "") {
        return;
      }
      let _this = this;
      this.axios
        .get("/teacherInformation/selectByName/" + value, {
          params: {},
          headers: {
            Authorization: this.$store.state.token,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(
          function(res) {
            _this.teacherInfos = res.data.data;
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
    onDelete(key) {
      let newData = [...this.data];
      let target = newData.filter(item => key === item.key)[0];
      this.axios
        .get("/course/delete/" + target.id, {
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
          "/course/update",
          this.qs.stringify({
            ...target
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
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/course/selectByPage",
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
<style>
.table-striped {
  background-color: #e3e3e3;
}
</style>
