<template>
  <div>
    <a-button style="margin: 0 20px 0 0" @click="showModal"
      >添加单个信息</a-button
    >
    <a-modal
      title="正在新添加阶段性测验信息"
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
          label="阶段性测验排序号"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input-number
            v-decorator="[
              'stageId',
              {
                rules: [{ required: true, message: '阶段性测验排序号不能为空' }]
              }
            ]"
            style="width:100%"
            placeholder="请输入阶段性测验排序号"
          />
        </a-form-item>
        <a-form-item
          label="阶段性测验标题"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'stageNote',
              {
                rules: [{ required: true, message: '阶段性测验标题不能为空' }]
              }
            ]"
            placeholder="请输入阶段性测验标题"
          />
        </a-form-item>
        <a-form-item
          label="阶段性测验占比"
          :label-col="{ span: 9 }"
          :wrapper-col="{ span: 10 }"
        >
          <a-input
            v-decorator="[
              'percentage',
              {
                rules: [{ required: true, message: '阶段性测验占比号不能为空' }]
              }
            ]"
            style="width:100%"
            placeholder="请输入阶段性测验占比"
            addonAfter="%"
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
    teachingClassInformationData: null
  },
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
      this.visible = false;
    },
    handleCancel(e) {
      this.visible = false;
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          {
            this.axios
              .post(
                "/sourceStageInformation/insert",
                this.qs.stringify({
                  ...this.teachingClassInformationData,
                  courseId: this.teachingClassInformationData.id,
                  name: this.teachingClassInformationData.courseName,
                  createdAt: null,
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
                  this.$emit("getdata", 1, 5);
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
