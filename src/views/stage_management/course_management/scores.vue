<template>
  <div>
    <a @click="showModal">阶段性统一管理</a>
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
      <a-card title="阶段性统一管理(仅显示由课程负责人统一添加的阶段性成绩)">
        <floder
          slot="extra"
          @getdata="getdata"
          :teachingClassInformationData="this.teachingClassInformationData"
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
          <!-- <template slot="serial" slot-scope="text">
            {{ text + 1 }}
          </template> -->
          <template
            v-for="col in [
              'name',
              'teachingClassId',
              'stageId',
              'stageNote',
              'percentage'
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
          <template slot="type" slot-scope="text, record">
            <div key="type">
              <a-select
                :defaultValue="text"
                v-if="record.editable"
                style="width: 80px"
                @change="
                  value => {
                    handleChange(value, record.key, 'type');
                  }
                "
              >
                <a-select-option value="平时">平时</a-select-option>
                <a-select-option value="期中">期中</a-select-option>
                <a-select-option value="实践">实践</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>

              <template v-else>{{ text }}</template>
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
import floder from "./scores_floder.vue";
let columns = [
  // {
  //   title: "序号",
  //   dataIndex: "serial",
  //   key: "0",
  //   scopedSlots: { customRender: "serial" }
  // },
  {
    title: "课程名",
    dataIndex: "name",
    key: "1"
  },
  {
    title: "教学班号",
    dataIndex: "teachingClassId",
    key: "2"
  },
  {
    title: "阶段性测验序号",
    dataIndex: "stageId",
    key: "3",
    scopedSlots: { customRender: "stageId" }
  },
  {
    title: "阶段性测验名称",
    dataIndex: "stageNote",
    key: "4",
    scopedSlots: { customRender: "stageNote" }
  },
  {
    title: "类型",
    dataIndex: "type",
    key: "41",
    scopedSlots: { customRender: "type" }
  },
  {
    title: "占比（单位%）",
    dataIndex: "percentage",
    key: "5",
    scopedSlots: { customRender: "percentage" }
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "8",
    scopedSlots: { customRender: "operation" }
  }
];
var data = [];
export default {
  inject: ["reload"],
  components: { floder },
  props: {
    teachingClassInformationData: Object
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
    changeType(value, record) {
      record.type = value;
      {
        this.axios
          .post(
            "/sourceStageInformation/update",
            this.qs.stringify({
              ...record
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
            }.bind(this)
          )
          .catch(
            function(err) {
              if (err.response) {
                //console.log(err.response);
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
      this.axios
        .get("/sourceStageInformation/ByCourseAdministrator/" + target.batch, {
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
              // this.data = newData.filter(item => item.key !== key);
              this.getdata(1, 5);
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
          "/sourceStageInformation/updateByCourseAdministrator",
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
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/sourceStageInformation/selectByPage",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            courseId: this.teachingClassInformationData.id,
            addPeople: 2,
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
