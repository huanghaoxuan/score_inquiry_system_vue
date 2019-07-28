<template>
  <div class="editable-cell">
    <div v-if="editable" class="editable-cell-input-wrapper">
      <a-input :value="value" @change="handleChange" @pressEnter="check" />
      <a-icon type="check" class="editable-cell-icon-check" @click="check" />
    </div>
    <div v-else class="editable-cell-text-wrapper">
      {{ value || " " }}
      <a-icon type="edit" class="editable-cell-icon" @click="edit" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    studentId: String,
    teachingClassId: String,
    text: String,
    dataIndex: String
  },
  data() {
    return {
      value: this.text,
      editable: false
    };
  },
  methods: {
    updataStage(id, scores) {
      this.axios
        .post(
          "/sourceStage/update",
          this.qs.stringify({
            studentId: this.studentId,
            teachingClassId: this.teachingClassId,
            sourceStageId: id,
            scores: scores
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
            this.$notification.success({
              message: "修改成功！"
            });
            //关闭输入框
            this.editable = false;
            this.$emit("change", this.value);
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
    handleChange(e) {
      const value = e.target.value;
      this.value = value;
    },
    check() {
      this.updataStage(this.dataIndex, this.value);
    },
    edit() {
      this.editable = true;
    }
  }
};
</script>
