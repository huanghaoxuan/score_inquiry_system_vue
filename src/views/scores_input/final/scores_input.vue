<template>
  <div>
    <a @click="showModal">录入期末测验成绩</a>
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
                @change="onCellChange(record.key, col.dataIndex, $event)"
              />
            </div>
          </template>
          <template slot="final" slot-scope="text, record">
            <a-input
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
const columns = [];
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
    teachingClassInformationData: null
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
      pagination: { defaultPageSize: 15, total: 15 }
    };
  },
  methods: {
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
      this.data[key].result = result.toFixed(2);
      return result.toFixed(2);
    },
    onCellChange(key, dataIndex, value) {
      const dataSource = [...this.data];
      const target = dataSource.find(item => item.key === key);
      // debugger;
      if (target) {
        target[dataIndex] = value;
        this.data = dataSource;
      }
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
      const stageColumns = [];
      const columns = [
        {
          title: "名字",
          dataIndex: "name",
          key: "1",
          width: "200px",
          // fixed: "left",
          scopedSlots: { customRender: "name" }
        },
        {
          title: "学号",
          dataIndex: "studentId",
          key: "2",
          width: "200px",
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
          width: "200px",
          scopedSlots: { customRender: this.allData[index].id }
        };
        columns.push(nextColumns);
        stageColumns.push(nextColumns);
      }
      let col = {
        title: "期末成绩",
        dataIndex: "final",
        width: "200px",
        // fixed: "right",
        key: 3 + this.allData.length,
        scopedSlots: { customRender: "final" }
      };
      columns.push(col);
      col = {
        title: "最终成绩",
        dataIndex: "result",
        width: "200px",
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
      const formData = this.form.getFieldsValue();
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
            }
            console.log(this.data);
            this.data = res.data.data;
            this.pagination.total = res.data.count;
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
</style>
