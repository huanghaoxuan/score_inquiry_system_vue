<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="课程管理">
      <floder slot="extra"></floder>
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
        <template
          v-for="col in ['courseId', 'name', 'year', 'semester']"
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
            <classes_management
              :courseData="data[record.key]"
            ></classes_management>
          </div>
        </template>
        <template slot="operation2" slot-scope="text, record">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record.key)">保存</a>
              <a @click="() => cancel(record.key)" style="padding:10px">取消</a>
            </span>
            <span v-else>
              <a @click="() => edit(record.key)">修改</a>
              <a-popconfirm
                title="确定删除该条数据？?"
                @confirm="() => onDelete(record.key)"
              >
                <a style="padding:10px">删除</a>
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
const columns = [
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
    title: "学年（若显示为2019，即为2019-2020学年）",
    dataIndex: "year",
    key: "2",
    scopedSlots: { customRender: "year" }
  },
  {
    title: "学期",
    dataIndex: "semester",
    key: "3",
    scopedSlots: { customRender: "semester" }
  },
  {
    title: "教学班管理",
    dataIndex: "operation",
    key: "4",
    scopedSlots: { customRender: "operation" }
  },
  {
    title: "操作",
    dataIndex: "operation2",
    key: "5",
    scopedSlots: { customRender: "operation2" }
  }
];
const data = [];
export default {
  inject: ["reload"],
  components: { floder, classes_management },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 10, total: 10 }
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
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
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
