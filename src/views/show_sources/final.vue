<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="成绩查询">
      <a-form layout="inline" :form="form" @submit="handleSubmit">
        <a-form-item label="课程名">
          <a-input v-decorator="['courseName']" placeholder="请输入课程名" />
        </a-form-item>
        <a-form-item label="学年">
          <a-input-group compact>
            <a-input
              style=" width: 100px; text-align: center"
              v-decorator="['year', { getValueFromEvent: yearChange() }]"
            />
            <a-input
              style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="-"
              disabled
            />
            <a-input
              v-model="year2"
              style="width: 100px; text-align: center; border-left: 0;pointer-events: none;backgroundColor: #fff"
              disabled
            />
            <a-input
              style=" width: 60px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="学年"
              disabled
            />
          </a-input-group>
        </a-form-item>
        <a-form-item label="学期">
          <a-select
            v-decorator="['semester']"
            placeholder="请选择学期"
            style="width: 120px;"
          >
            <a-select-option value="第一学期">
              第一学期
            </a-select-option>
            <a-select-option value="第二学期">
              第二学期
            </a-select-option>
            <a-select-option value="">
              暂无
            </a-select-option>
          </a-select>
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
        <template slot="serial" slot-scope="text">
          {{ text + 1 }}
        </template>
        <template slot="result" slot-scope="result">
          <div v-if="parseInt(`${result}`) < 60" style="color : #f00;">
            {{ result }}
          </div>
          <div v-else>
            {{ result }}
          </div>
        </template>
        <!-- 查看阶段性成绩 -->
        <!-- <template slot="sourceStage" slot-scope="text, record">
          <div class="editable-row-operations">
            <stage :sourceStageData="data[record.key]"></stage>
          </div>
        </template> -->
      </a-table>
    </a-card>
  </div>
</template>

<script>
// import stage from "./stage.vue";
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
    key: "0",
    scopedSlots: { customRender: "courseName" }
  },
  {
    title: "课程名字",
    dataIndex: "courseName",
    key: "1",
    scopedSlots: { customRender: "courseName" }
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
    title: "期末成绩成绩",
    dataIndex: "result",
    key: "4",
    scopedSlots: { customRender: "result" }
  }
];
let data = [];
export default {
  inject: ["reload"],
  // components: { stage },
  data() {
    return {
      data,
      columns,
      form: this.$form.createForm(this),
      pagination: {
        defaultPageSize: 9,
        total: 9,
        showTotal: total => `共 ${total} 条记录`
      },
      year2: ""
    };
  },
  methods: {
    yearChange(value) {
      this.year2 = parseInt(this.form.getFieldValue("year")) + 1;
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
          "/teachingClass/showFinal",
          this.qs.stringify({
            pageNum: pageNum,
            pageSize: pageSize,
            ...formData,
            studentId: this.$store.state.studentId,
            status: 3
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
            this.pagination.defaultPageSize = parseInt(res.data.pageSize);
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
