<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="学生管理">
      <a-form
        layout="inline"
        :form="form"
        @submit="handleSubmit"
        v-if="$store.state.identity != 1"
      >
        <a-form-item label="教师工号">
          <a-input
            v-decorator="['classTeacher']"
            placeholder="请输入教师工号"
          />
        </a-form-item>
        <a-form-item label="教师名字">
          <a-input v-decorator="['name']" placeholder="请输入教师名字" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            查询
          </a-button>
        </a-form-item>
      </a-form>
      <br />
      <a-table
        :pagination="pagination"
        :columns="columns"
        :dataSource="data"
        :scroll="{ x: 2000, y: 610 }"
        @change="handleTableChange"
      >
        <template slot="operation1" slot-scope="text, record">
          <edit :editData="data[record.key]"></edit>
        </template>
        <template slot="operation2" slot-scope="text, record">
          <a-popconfirm
            v-if="data.length"
            title="点击确认以删除?"
            cancelText="取消"
            okText="确认"
            @confirm="() => onDelete(record.key)"
          >
            <a-button type="danger" @click="() => {}">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
const columns = [
  {
    title: "所带班级评为校级先进",
    width: 200,
    dataIndex: "schoolLevel",
    key: "1"
  },
  {
    title: "操作",
    dataIndex: "operation1",
    key: "10",
    width: 100,
    fixed: "right",
    scopedSlots: { customRender: "operation1" }
  },
  {
    title: "",
    dataIndex: "operation2",
    key: "11",
    width: 100,
    fixed: "right",
    scopedSlots: { customRender: "operation2" }
  }
];

export default {
  inject: ["reload"],
  data() {
    return {
      data: [],
      columns,
      form: this.$form.createForm(this),
      pagination: { defaultPageSize: 9, total: 9 }
    };
  },
  methods: {
    onDelete(key) {
      const data = [...this.data];
      this.data = data.filter(item => item.key !== key);
      //console.log(data[key].id);
      this.axios
        .get(
          "/publicaffairsCounselor/deleteByPrimaryKey",
          {
            params: {
              id: data[key].id
            }
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(function(res) {}.bind(this))
        .catch(
          function(err) {
            if (err.response) {
              //console.log(err.response);
              //控制台打印错误返回的内容
            }
            //bind(this)可以不用
          }.bind(this)
        );
    },
    handleTableChange(pagination, filters, sorter) {
      if (this.$store.state.identity == 1) {
        this.showListData(pagination.current);
      } else {
        this.form.validateFields((err, values) => {
          if (!err) {
            this.showAllListData(pagination.current, values);
          }
        });
      }
    },
    showListData(pageNum) {
      this.axios
        .get(
          "/publicaffairsCounselor/selectByClassTeacher",
          {
            params: {
              classTeacher: this.$store.state.teacherid,
              pageNum: pageNum,
              pageSize: 9
            }
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(
          function(res) {
            //console.log(res.data);
            //每条数据需要一个唯一的key值
            for (let index = 0; index < res.data.list.length; index++) {
              res.data.list[index].key = index;
              var year = res.data.list[index].year + 1;
              var yearStr = res.data.list[index].year + " — " + year + " 学年";
              res.data.list[index].showYear = yearStr;
            }
            this.data = res.data.list;
            this.pagination.total = res.data.total;
            //控制台打印请求成功时返回的数据
            //bind(this)可以不用
          }.bind(this)
        )
        .catch(
          function(err) {
            if (err.response) {
              //console.log(err.response);
              //控制台打印错误返回的内容
            }
            //bind(this)可以不用
          }.bind(this)
        );
    },
    showAllListData(pageNum, values) {
      this.axios
        .get(
          "/publicaffairsCounselor/selectAll",
          {
            params: {
              ...values,
              pageNum: pageNum,
              pageSize: 9
            }
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(
          function(res) {
            //console.log(res.data);
            //每条数据需要一个唯一的key值
            if (res.data.list != null) {
              for (let index = 0; index < res.data.list.length; index++) {
                res.data.list[index].key = index;
                var year = res.data.list[index].year + 1;
                var yearStr =
                  res.data.list[index].year + " — " + year + " 学年";
                res.data.list[index].showYear = yearStr;
              }
            }
            this.data = res.data.list;
            this.pagination.total = res.data.total;
            //控制台打印请求成功时返回的数据
            //bind(this)可以不用
          }.bind(this)
        )
        .catch(
          function(err) {
            if (err.response) {
              //console.log(err.response);
              //控制台打印错误返回的内容
            }
            //bind(this)可以不用
          }.bind(this)
        );
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.showAllListData(1, values);
        }
      });
    }
  }
};
</script>
