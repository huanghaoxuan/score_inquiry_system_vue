<template>
  <div>
    <a-button style="margin: 0 20px 0 0" @click="showModal"
      >添加单个信息</a-button
    >
    <a-button
      type="primary"
      icon="download"
      :href="`${path}/static/teachingClassInformation.xlsx`"
      download="教学班批量导入模板.xlsx"
    >
      模板下载
    </a-button>
    <a-tooltip placement="left">
      <template slot="title">
        <span>
          1、该按钮用于教学班信息批量上传<br />
          2、仅接受xls、xlsx为后缀的表格文件<br />
          3、当上传的表格中的课程名与当前所在的课程名不相同时，将不进行该行数据的导入<br />
          4、当进行多次上传时，学生信息不会被覆盖，会累计进行添加
        </span>
      </template>
      <a-icon type="question-circle" style="fontSize:17px;padding:10px" />
    </a-tooltip>
    <a-upload
      name="file"
      :multiple="true"
      action="/api/teachingClass/upload"
      :data="{
        courseId: this.courseData.id,
        courseName: this.courseData.name
      }"
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      :headers="headers"
      @change="handleChangeUpload"
    >
      <a-button> <a-icon type="upload" />批量上传</a-button>
    </a-upload>
    <a-modal
      title="正在新添加教学班信息"
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
          label="教学班号"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'teachingClassId',
              { rules: [{ required: true, message: '教学班号不能为空' }] }
            ]"
            placeholder="请输入教学班号"
          />
        </a-form-item>
        <a-form-item
          label="任课老师名字"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'courseTeacherName',
              { rules: [{ required: true, message: '任课老师名字不能为空' }] }
            ]"
            placeholder="请输入任课老师名字"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
export default {
  inject: ["reload"],
  props: {
    courseData: {}
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      path: process.env.BASE_URL,
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
        this.$emit("getdata", 1, 5);
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败，请重试！`);
      }
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
                "/teachingClassInformation/insert",
                this.qs.stringify({
                  courseId: this.courseData.id,
                  courseName: this.courseData.name,
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
                  if (res.data.status == 0) {
                    this.$notification.error({
                      message: "该教学班号已存在，请重新填写！"
                    });
                  } else {
                    this.visible = false;
                    this.$emit("getdata", 1, 5);
                    this.$notification.success({
                      message: "添加成功！"
                    });
                  }
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
