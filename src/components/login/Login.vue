<template>
  <div>
    <div id="bg">
      <div id="hint">
        <!-- 提示框 -->
        <p>登录失败</p>
      </div>
      <div id="login_wrap">
        <div id="login">
          <!-- 登录注册切换动画 -->
          <div id="status">
            <i style="top: 5px">登录</i>
            <i style="top: 36px">重置</i>
          </div>
          <span>
            <form action="post">
              <p class="form">
                <input
                  type="text"
                  id="user"
                  placeholder="学号"
                  v-model="studentId"
                />
              </p>
              <p class="form confirm">
                <input
                  type="password"
                  id="passwd"
                  placeholder="密码"
                  v-model="password"
                />
              </p>
              <input
                type="button"
                value="登录"
                class="btn"
                @click="login()"
                style="margin-right: 20px;"
              />
              <input
                type="button"
                value="重置"
                class="btn"
                @click="signin()"
                id="btn"
              />
            </form>
          </span>
        </div>

        <div id="login_img">
          <!-- 图片绘制框 -->
          <span class="circle">
            <span></span>
            <span></span>
          </span>
          <span class="star">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="fly_star">
            <span></span>
            <span></span>
          </span>
          <p id="title">东南大学成贤学院<br /><br />成绩查询系统</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import crypto from "crypto";
export default {
  data() {
    return {
      onoff: true,
      studentId: null,
      password: null
    };
  },
  methods: {
    login() {
      var confirm = document.getElementsByClassName("confirm")[0];
      if (this.onoff) {
        if (this.studentId == null || this.studentId == "") {
          this.$notification.error({
            message: "账号未输入"
          });
        } else if (this.password == null || this.password == "") {
          this.$notification.error({
            message: "密码未输入"
          });
        } else {
          var md5 = crypto.createHash("md5");
          md5.update(this.password);
          var password2 = md5.digest("hex");

          this.axios
            .post(
              "/user/login",
              this.qs.stringify({
                studentId: this.studentId,
                password: password2
              }),
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              }
            )
            .then(
              function(res) {
                //console.log(res);
                if (res.data.status == 0) {
                  this.$notification.error({
                    message: "账号密码错误，请重新登录！"
                  });
                } else {
                  this.$store.commit("isLogin", true);
                  this.$store.commit("setToken", res.data.token);
                  this.$store.commit("setNameStudentId", res.data.data);
                  this.$router.push("/sidebar");
                }
              }.bind(this)
            )
            .catch(
              function(err) {
                if (err.response.status == 403) {
                  //console.log(err.response);
                  this.$notification.error({
                    message: "账号密码错误，请重新登录！"
                  });
                  //控制台打印错误返回的内容
                }
                //bind(this)可以不用
              }.bind(this)
            );
        }
      } else {
        let status = document
          .getElementById("status")
          .getElementsByTagName("i");
        confirm.style.height = 51 + "px";
        status[0].style.top = 5 + "px";
        status[1].style.top = 36 + "px";

        this.onoff = !this.onoff;
      }
    },
    signin() {
      var confirm = document.getElementsByClassName("confirm")[0];
      let status = document.getElementById("status").getElementsByTagName("i");
      let hit = document.getElementById("hint").getElementsByTagName("p")[0];
      if (this.onoff) {
        confirm.style.height = 0;
        status[0].style.top = 36 + "px";
        status[1].style.top = 5 + "px";
        this.onoff = !this.onoff;
      } else {
        if (this.studentId == null || this.studentId == "") {
          this.$notification.error({
            message: "账号未输入"
          });
        } else {
          this.axios
            .get("/user/reset/" + this.studentId, {
              params: {},
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            })
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
                  //控制台打印错误返回的内容
                }
                //bind(this)可以不用
              }.bind(this)
            );
        }
      }
    }
  },
  mounted() {
    this.$store.commit("isLogin", false);
    this.$store.commit("setToken", "");
    //console.log(this.$store.state.token);
  }
};
</script>

<style>
@import url("./css/main.css");
</style>
