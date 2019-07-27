<template>
  <div>
    <a @click="showModal">阶段性成绩管理</a>
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
      <a-card title="阶段性成绩管理">
        <floder
          slot="extra"
          @getdata="getdata"
          :teachingClassInformationData="this.teachingClassInformationData"
        ></floder>
        <a-table
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          @change="handleTableChange"
        >
          <template
            v-for="col in ['name', 'teachingClassId', 'stageId', 'stageNote']"
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
          <template slot="operation1" slot-scope="text, record">
            <div class="editable-row-operations">
              <scores_student
                :allData="data"
                :sourceStageData="data[record.key]"
              ></scores_student>
            </div>
          </template>
          <template slot="operation2" slot-scope="text, record">
            <div class="editable-row-operations">
              <scores_input
                :allData="data"
                :sourceStageData="data[record.key]"
              ></scores_input>
            </div>
          </template>
          <template slot="operation" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record.key)">
                  保存
                </a>
                <a @click="() => cancel(record.key)" style="padding:10px"
                  >取消</a
                >
              </span>
              <span v-else>
                <a @click="() => edit(record.key)">修改</a>
                <a-popconfirm
                  title="确定删除该条数据？?"
                  @confirm="() => onDelete(record.key)"
                  style="padding:10px"
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
import scores_student from "./scores_student";
import floder from "./scores_floder.vue";
import scores_input from "./scores_input.vue";
const columns = [
  {
    title: "课程名",
    dataIndex: "name",
    key: "1",
    width: "15%"
  },
  {
    title: "教学班号",
    dataIndex: "teachingClassId",
    key: "2",
    width: "15%"
  },
  {
    title: "阶段性测验序号",
    dataIndex: "stageId",
    key: "3",
    width: "15%",
    scopedSlots: { customRender: "stageId" }
  },
  {
    title: "阶段性测验名称",
    dataIndex: "stageNote",
    key: "4",
    width: "15%",
    scopedSlots: { customRender: "stageNote" }
  },
  {
    title: "查看学生",
    dataIndex: "operation1",
    key: "5",
    width: "15%",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "录入成绩",
    dataIndex: "operation2",
    key: "6",
    width: "15%",
    scopedSlots: { customRender: "operation2" }
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "7",
    width: "15%",
    scopedSlots: { customRender: "operation" }
  }
];
var data = [];
export default {
  inject: ["reload"],
  components: { scores_student, floder, scores_input },
  props: {
    teachingClassInformationData: null
  },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 5, total: 5 }
    };
  },
  methods: {
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
        .get("/sourceStageInformation/delete/" + target.id, {
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
          "/sourceStageInformation/update",
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
    getdata(pageNum, pageSize) {
      const formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/sourceStageInformation/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            teachingClassId: this.teachingClassInformationData.teachingClassId,
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
  }
  // mounted() {
  //   this.getdata(1, 5);
  // }
};
</script>
