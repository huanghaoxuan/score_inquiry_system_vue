<template>
  <div>
    <a-button style="margin: 0 20px 0 0" @click="showModal">添加课程</a-button>
    <a-button
      type="primary"
      icon="download"
      :href="`${path}/static/course.xlsx`"
      download="课程管理批量导入模板.xlsx"
    >
      模板下载
    </a-button>
    <a-tooltip placement="left">
      <template slot="title">
        <span>
          1、该按钮用于课程信息批量上传<br />
          2、仅接受xls、xlsx为后缀的表格文件<br />
          3、课程号唯一，当有多个重复时，以第一个为准，若需修改，请手动修改
        </span>
      </template>
      <a-icon type="question-circle" style="fontSize:17px;padding:10px" />
    </a-tooltip>
    <a-upload
      name="file"
      :multiple="true"
      action="/api/multiCourse/upload"
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      :headers="headers"
      @change="handleChangeUpload"
    >
      <a-button> <a-icon type="upload" />批量上传</a-button>
    </a-upload>
    <a-modal
      title="正在新添加课程"
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
          label="课程号"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'courseId',
              { rules: [{ required: true, message: '课程号不能为空' }] }
            ]"
            placeholder="请输入课程号"
          />
        </a-form-item>
        <a-form-item
          label="课程名"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'name',
              { rules: [{ required: true, message: '课程名不能为空' }] }
            ]"
            placeholder="请输入课程名"
          />
        </a-form-item>
        <a-form-item
          label="学年"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input-group compact>
            <a-input
              style=" width: 100px; text-align: center"
              v-decorator="[
                'year',
                {
                  getValueFromEvent: yearChange(),
                  rules: [
                    {
                      pattern: /(^[\-0-9][0-9]*([0-9]+)?)$/,
                      required: true,
                      message: '学年输入有误（请输入数字）'
                    }
                  ]
                }
              ]"
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

        <a-form-item
          label="学期"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-select v-decorator="['semester']" placeholder="请选择学期">
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
      form: this.$form.createForm(this),
      path: process.env.BASE_URL,
      year2: "",
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
        this.reload();
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败，请重试！`);
      }
    },
    yearChange(value) {
      this.year2 = parseInt(this.form.getFieldValue("year")) + 1;
    },
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
                "/multiCourse/insert",
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
                  this.reload();
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
