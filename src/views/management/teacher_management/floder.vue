<template>
  <div>
    <a-button style="margin: 0 20px 0 0" @click="showModal"
      >添加教师信息</a-button
    >
    <a-tooltip placement="left">
      <template slot="title">
        <span>
          1、该按钮用于教师信息批量上传<br />
          2、仅接受xls、xlsx为后缀的表格文件<br />
          3、教师工号唯一，当有多个重复时，以第一个为准，若需修改，请手动修改<br />
          4、该工号将作为教师登录凭证
        </span>
      </template>
      <a-icon type="question-circle" style="fontSize:17px;padding:10px" />
    </a-tooltip>
    <a-upload
      name="file"
      :multiple="true"
      action="/api/teacherInformation/upload"
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      :headers="headers"
      @change="handleChangeUpload"
    >
      <a-button> <a-icon type="upload" />批量上传</a-button>
    </a-upload>
    <a-modal
      title="正在新添加教师信息"
      :visible="visible"
      @ok="handleOk"
      okText="确认添加"
      cancelText="取消"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      width="50%"
      @cancel="handleCancel"
    >
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item
          label="姓名"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'name',
              { rules: [{ required: true, message: '姓名不能为空' }] }
            ]"
            placeholder="请输入姓名"
          />
        </a-form-item>
        <a-form-item
          label="工号"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'studentId',
              { rules: [{ required: true, message: '工号不能为空' }] }
            ]"
            placeholder="请输入工号"
          />
        </a-form-item>
        <a-form-item
          label="所在学院"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-select v-decorator="['department']" placeholder="请输入现所在学院">
            <a-select-option value="">
              暂无
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
      </a-form>
    </a-modal>
  </div>
</template>

<script>
export default {
  inject: ["reload"],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this)
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.confirmLoading = true;
      this.handleSubmit(e);
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          //console.log(values);
          {
            this.axios
              .post(
                "/teacherInformation/insert",
                this.qs.stringify({
                  ...values
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
                  this.visible = false;
                  this.$emit("getdata", 1, 9);
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
        }

        this.confirmLoading = false;
      });
    }
  }
};
</script>
