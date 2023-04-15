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
      <a-card title="课程管理">
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
          <template slot="operation1" slot-scope="text, record">
            <div class="editable-row-operations">
              <a-button @click="download1(data[record.key].teachingClassId)"
                >本学期导出</a-button
              >
            </div>
          </template>
          <template slot="operation2" slot-scope="text, record">
            <div class="editable-row-operations">
              <select-year-semester
                :teachingClassInformationData="data[record.key]"
              ></select-year-semester>
            </div>
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
import selectYearSemester from "./selectYearSemester";
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
    key: "3",
    scopedSlots: { customRender: "courseTeacherName" }
  },
  {
    title: "本学期导出",
    dataIndex: "operation1",
    key: "4",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "跨学期导出",
    dataIndex: "operation2",
    key: "5",
    scopedSlots: { customRender: "operation2" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  props: {
    courseData: {}
  },
  components: {
    selectYearSemester
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
    download1(teachingClassId) {
      this.axios
        .get(
          "/teachingClass/download/" +
            teachingClassId +
            "/" +
            this.courseData.id,
          {
            params: {},
            responseType: "blob",
            headers: {
              Authorization: this.$store.state.token
            }
          }
        )
        .then(response => {
          let url = window.URL.createObjectURL(new Blob([response.data]));
          let link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            this.courseData.id + "-" + teachingClassId + ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
        })
        .catch(
          function(err) {
            if (err.response) {
              // console.log(err.response);
              //控制台打印错误返回的内容
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
        .get("/teachingClassInformation/delete/" + target.id, {
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
<style>
.table-striped {
  background-color: #e3e3e3;
}
</style>
