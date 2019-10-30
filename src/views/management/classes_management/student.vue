<template>
  <div>
    <a @click="showModal">查看学生</a>
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
      <a-card title="学生管理">
        <floder
          slot="extra"
          :teachingClassInformationData="this.teachingClassInformationData"
          @getdata="getdata"
        ></floder>
        <a-form layout="inline" :form="form" @submit="handleSubmit">
          <a-form-item label="名字">
            <a-input v-decorator="['name']" placeholder="请输入名字" />
          </a-form-item>
          <a-form-item label="学号">
            <a-input v-decorator="['studentId']" placeholder="请输入学号" />
          </a-form-item>
          <a-form-item label="所在学院">
            <a-select
              v-decorator="['department']"
              placeholder="请输入所在学院"
              style="width: 200px"
            >
              <a-select-option value="">
                学院不参与筛选
              </a-select-option>
              <a-select-option value="电子与计算机工程学院">
                电子与计算机工程学院
              </a-select-option>
              <a-select-option value="建筑与艺术设计学院">
                建筑与艺术设计学院
              </a-select-option>
              <a-select-option value="土木与交通工程学院">
                土木与交通工程学院
              </a-select-option>
              <a-select-option value="机械与电气工程学院">
                机械与电气工程学院
              </a-select-option>
              <a-select-option value="制药与化学工程学院">
                制药与化学工程学院
              </a-select-option>
              <a-select-option value="经济管理学院">
                经济管理学院
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="专业">
            <a-input v-decorator="['professional']" placeholder="请输入专业" />
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
        >
          <template
            v-for="col in [
              'name',
              'studentId',
              'department',
              'professional',
              'class'
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
          <template slot="operation" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record.key)" style="padding:10px">保存</a>
                <a @click="() => cancel(record.key)">取消</a>
              </span>
              <span v-else>
                <a @click="() => edit(record.key)" style="padding:10px">修改</a>
                <a-popconfirm
                  title="确定删除该条数据？?"
                  @confirm="() => onDelete(record.key)"
                >
                  <a>删除</a>
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
import floder from "./student_floder.vue";
const columns = [
  {
    title: "名字",
    dataIndex: "name",
    key: "1",
    width: "16%",
    scopedSlots: { customRender: "name" }
  },
  {
    title: "学号",
    dataIndex: "studentId",
    key: "2",
    width: "16%"
  },
  {
    title: "学院",
    dataIndex: "department",
    key: "3",
    width: "16%",
    scopedSlots: { customRender: "department" }
  },
  {
    title: "专业",
    dataIndex: "professional",
    key: "4",
    width: "16%",
    scopedSlots: { customRender: "professional" }
  },
  {
    title: "班级",
    dataIndex: "class",
    key: "5",
    width: "16%",
    scopedSlots: { customRender: "class" }
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "6",
    width: "16%",
    scopedSlots: { customRender: "operation" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  components: { floder },
  props: {
    teachingClassInformationData: {}
  },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 5, total: 5 },
      headers: {
        Authorization: this.$store.state.token
      }
    };
  },
  methods: {
    //上传
    handleChangeUpload(info) {
      if (info.file.status !== "uploading") {
        //console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        this.$message.success(`${info.file.name} 上传成功`);
        this.getdata(1, 5);
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败，请重试！`);
      }
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
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        target[column] = value;
        this.data = newData;
      }
      //axios
    },
    edit(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },
    onDelete(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      //console.log(target);
      this.axios
        .get("/teachingClass/delete/" + target.id, {
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
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      //console.log(target);
      this.axios
        .post(
          "/teachingClass/update",
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
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
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
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClass/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: this.teachingClassInformationData.teachingClassId,
            courseId: this.teachingClassInformationData.id,
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
  }
  // mounted() {
  //   this.getdata(1, 5);
  // }
};
</script>
