<template>
  <div>
    <a
      @click="showModal"
      :class="teachingClassInformationData.status == 1 ? '' : 'disabled'"
      >录入期末测验成绩</a
    >
    <a-popconfirm
      title="确认成绩后修改后将不可修改"
      @confirm="() => updateStauts(2)"
    >
      <a
        v-if="teachingClassInformationData.status == 1"
        :class="teachingClassInformationData.status == 1 ? '' : 'disabled'"
        style="margin-left:10px"
        >确认成绩</a
      >
    </a-popconfirm>

    <a
      @click="updateStauts(1)"
      v-if="teachingClassInformationData.status == 2"
      :class="teachingClassInformationData.status == 1 ? '' : 'disabled'"
      style="margin-left:10px"
      >重新录入</a
    >
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
      <a-card title="期末成绩管理">
        <div slot="extra">
          <a-button style="margin: 0 20px 0 0" @click="handleOk"
            >确认添加</a-button
          >
        </div>
        <a-table
          :pagination="pagination"
          :columns="columns"
          :dataSource="data"
          :scroll="{ x: true }"
          @change="handleTableChange"
        >
          <template slot="serial" slot-scope="text">
            {{ text + 1 }}
          </template>
          <template
            v-for="col in stageColumns"
            :slot="col.dataIndex"
            slot-scope="text, record"
          >
            <div :key="col.dataIndex">
              <editable-cell
                :text="text"
                :dataIndex="col.dataIndex"
                :studentId="data[record.key].studentId"
                :teachingClassId="teachingClassInformationData.teachingClassId"
                :courseId="teachingClassInformationData.id"
                @change="onCellChange(record.key, col.dataIndex, $event)"
              />
            </div>
          </template>
          <template slot="final" slot-scope="text, record">
            <a-input
              :ref="record.key"
              v-on:keyup.down="nextInput(record.key)"
              v-on:keyup.up="preInput(record.key)"
              style="margin: -5px 0"
              v-model="data[`${record.key}`].final"
            />
          </template>
          <template slot="result" slot-scope="result, record">
            <div v-if="parseInt(`${result}`) < 60" style="color : #f00;">
              {{ showResult(`${record.key}`) }}
            </div>
            <div v-else>
              {{ showResult(`${record.key}`) }}
            </div>
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
</template>

<script>
import EditableCell from "./EditableCell";
let columns = [];
var data = [];
export default {
  computed: {
    showResult() {
      return function(key) {
        return this.getRseult(key);
      };
    }
  },
  components: {
    EditableCell
  },
  inject: ["reload"],
  props: {
    teachingClassInformationData: Object,
    index: Number
  },
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      stageColumns: [],
      visible: false,
      editable: false,
      allData: [],
      confirmLoading: false,
      form: this.$form.createForm(this),
      pagination: {
        defaultPageSize: 15,
        total: 15,
        showTotal: total => `共 ${total} 条记录`
      }
    };
  },
  methods: {
    /**
    焦点向后移动
     */
    nextInput(index) {
      //向右移动
      //如果移动到最后一个单元格，阻止操作
      index = index + 1;
      //设置目标焦点
      if (index % 15 == 0 || index == this.pagination.total) {
        return false;
      }
      this.$refs[index].focus();
    },
    /**
    焦点向前移动
     */
    preInput(index) {
      //向右移动
      //如果移动到最后一个单元格，阻止操作
      index = index - 1;
      //设置目标焦点
      if (index == -1 || index % 14 == 0) {
        return false;
      }
      this.$refs[index].focus();
    },
    updateStauts(status) {
      let _this = this;
      this.axios
        .post(
          "/teachingClassInformation/updateStauts",
          this.qs.stringify({
            ..._this.teachingClassInformationData,
            courseId: _this.teachingClassInformationData.id,
            id: _this.teachingClassInformationData.uniqueSign,
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
              _this.teachingClassInformationData.status = parseInt(status);
              _this.$emit(
                "setTeachingClassInformationData",
                _this.teachingClassInformationData,
                _this.index
              );
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
    getRseult(key) {
      let result = 0;
      let percentage = 0;
      let unpercentage = 0;
      for (let index = 0; index < this.stageColumns.length; index++) {
        let uid = this.stageColumns[index].dataIndex;
        //获得权重
        for (let i = 0; i < this.allData.length; i++) {
          if (this.allData[i].id == uid) {
            percentage = parseInt(this.allData[i].percentage);
            unpercentage += parseInt(this.allData[i].percentage);
          }
        }
        // debugger
        //获得阶段性成绩
        if (this.data[key][uid] != "") {
          result = parseInt(this.data[key][uid]) * percentage * 0.01 + result;
        }
      }
      if (this.data[key].final != "") {
        result =
          parseInt(this.data[key].final) * (100 - unpercentage) * 0.01 + result;
      }
      // debugger;
      this.data[key].result = result.toFixed(0);
      return result.toFixed(0);
    },
    onCellChange(key, dataIndex, value) {
      let dataSource = [...this.data];
      let target = dataSource.find(item => item.key === key);
      // debugger;
      if (target) {
        target[dataIndex] = value;
        this.data = dataSource;
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
    handleOk(key) {
      this.confirmLoading = true;
      this.update();
      this.visible = false;
      this.confirmLoading = false;
    },
    update() {
      this.axios
        .post(
          "/teachingClass/updateFinal",
          JSON.stringify({
            data: this.data
          }),
          {
            headers: {
              Authorization: this.$store.state.token,
              "Content-Type": "application/json"
            }
          }
        )
        .then(
          function(res) {
            this.$notification.success({
              message: "自动保存成功！"
            });
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
    getTableHeader() {
      let stageColumns = [];
      let columns = [
        {
          title: "序号",
          dataIndex: "serial",
          key: "0",
          scopedSlots: { customRender: "serial" }
        },
        {
          title: "名字",
          dataIndex: "name",
          key: "1",
          // fixed: "left",
          scopedSlots: { customRender: "name" }
        },
        {
          title: "学号",
          dataIndex: "studentId",
          key: "2",
          // fixed: "left",
          scopedSlots: { customRender: "studentId" }
        }
      ];
      for (let index = 0; index < this.allData.length; index++) {
        var nextColumns = {
          title:
            this.allData[index].stageNote +
            "（" +
            this.allData[index].percentage +
            "%）",
          dataIndex: this.allData[index].id,
          key: index + 3 + "",
          scopedSlots: { customRender: this.allData[index].id }
        };
        columns.push(nextColumns);
        stageColumns.push(nextColumns);
      }
      let col = {
        title: "期末成绩",
        dataIndex: "final",
        // fixed: "right",
        key: 3 + this.allData.length,
        scopedSlots: { customRender: "final" }
      };
      columns.push(col);
      col = {
        title: "最终成绩",
        dataIndex: "result",
        // fixed: "right",
        key: 4 + this.allData.length,
        scopedSlots: { customRender: "result" }
      };
      columns.push(col);
      this.columns = columns;
      this.stageColumns = stageColumns;
      console.log(this.allData);
    },
    getAllStageInfo() {
      this.axios
        .post(
          "/sourceStageInformation/selectAll",
          this.qs.stringify({
            teachingClassId: this.teachingClassInformationData.teachingClassId,
            courseId: this.teachingClassInformationData.id
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
            this.allData = res.data.data;
            this.getTableHeader();
            // this.pagination.total = res.data.data.length;
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
      this.getAllStageInfo();
      this.getdata(1, 15);
      this.visible = true;
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleTableChange(pagination, filters, sorter) {
      this.update();
      // this.getdata(pagination.current, 15);
    },
    //查询时提交数据
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.getdata(1, 15);
        }
      });
    },
    getdata(pageNum, pageSize) {
      let formData = this.form.getFieldsValue();
      this.axios
        .post(
          "/teachingClass/selectFinal",
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
              res.data.data[index].serial = (pageNum - 1) * pageSize + index;
            }
            console.log(this.data);
            this.data = res.data.data;
            this.pagination.total = parseInt(res.data.count);
            this.pagination.defaultPageSize = parseInt(res.data.pageSize);
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
  //   this.getdata(1, 15);
  // }
};
</script>
<style>
.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 10px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
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
