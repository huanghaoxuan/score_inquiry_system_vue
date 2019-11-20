<template>
  <a-layout
    id="components-layout-demo-custom-trigger"
    style="min-height: 100vh"
  >
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <div class="logo" />
      <a-menu theme="dark" :defaultSelectedKeys="['']" mode="inline">
        <a-menu-item key="welcome" @click="() => jump('/welcome')">
          <a-icon type="home" />
          <span>首页</span>
        </a-menu-item>
        <a-sub-menu key="management" v-if="permissions == 3">
          <span slot="title"> <a-icon type="user" /><span>管理</span></span>
          <a-menu-item
            key="student_management"
            @click="() => jump('/management/student_management')"
            >学生学籍管理</a-menu-item
          >
          <a-menu-item
            key="teacher_management"
            @click="() => jump('/management/teacher_management')"
            >教师管理</a-menu-item
          >
          <a-menu-item
            key="course_management"
            @click="() => jump('/management/course_management')"
            >课程管理</a-menu-item
          >
        </a-sub-menu>
        <a-sub-menu key="scores_input" v-if="permissions == 2">
          <span slot="title"> <a-icon type="user" /><span>成绩录入</span></span>
          <a-menu-item
            key="scores_input_stage"
            @click="() => jump('/scores_input/stage')"
            >阶段性成绩录入</a-menu-item
          >
          <a-menu-item
            key="scores_input_final"
            @click="() => jump('/scores_input/final')"
            >期末成绩录入</a-menu-item
          >
        </a-sub-menu>
        <a-menu-item
          key="show_scores"
          @click="() => jump('/out_scores')"
          v-if="permissions == 2"
        >
          <a-icon type="pie-chart" />
          <span>成绩导出</span>
        </a-menu-item>
        <!-- <span slot="title"> <a-icon type="user" /><span>管理</span></span> -->
        <a-menu-item
          key="show_scores"
          @click="() => jump('/show_scores')"
          v-if="permissions == 1"
        >
          <a-icon type="pie-chart" />
          <span>成绩查询</span>
        </a-menu-item>
        <a-menu-item
          key="show_all_scores"
          @click="() => jump('/show_all_scores')"
          v-if="permissions == 3"
        >
          <a-icon type="pie-chart" />
          <span>成绩查询</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-row>
          <a-col :span="20">
            <a-icon
              class="trigger"
              :type="collapsed ? 'menu-unfold' : 'menu-fold'"
              @click="() => (collapsed = !collapsed)"
            />
          </a-col>
          <a-popover>
            <template slot="content">
              <a-list itemLayout="horizontal">
                <a-list-item>
                  <a-list-item-meta
                    ><a
                      slot="title"
                      @click="() => (this.newPasswordBool = true)"
                    >
                      <a-avatar
                        size="small"
                        slot="avatar"
                        icon="security-scan"
                      />&nbsp;&nbsp;修改密码</a
                    >
                  </a-list-item-meta>
                </a-list-item>
                <a-list-item>
                  <a-list-item-meta
                    ><a slot="title" @click="() => jump('/login')">
                      <a-avatar
                        size="small"
                        slot="avatar"
                        icon="poweroff"
                      />&nbsp;&nbsp;退出登录</a
                    >
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
              <!-- 修改密码弹窗 -->
              <a-modal
                title="修改密码"
                v-model="newPasswordBool"
                @ok="handleOk"
                width="40%"
              >
                <template slot="footer">
                  <a-button key="back" @click="handleCancel">取消</a-button>
                  <a-button key="submit" type="primary" @click="handleOk">
                    确认
                  </a-button>
                </template>
                <a-form
                  id="components-form-demo-normal-login"
                  :form="form"
                  class="login-form"
                  @submit="handleOk"
                >
                  <a-form-item
                    label="旧密码"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                  >
                    <a-input
                      v-decorator="[
                        'oldPassword',
                        {
                          rules: [
                            {
                              required: true,
                              message: '请输入旧密码'
                            }
                          ]
                        }
                      ]"
                      type="password"
                      placeholder="请输入旧密码"
                    >
                      <a-icon
                        slot="prefix"
                        type="lock"
                        style="color: rgba(0,0,0,.25)"
                      />
                    </a-input>
                  </a-form-item>
                  <a-form-item
                    label="新密码"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                  >
                    <a-input
                      v-decorator="[
                        'newPassword',
                        {
                          rules: [
                            {
                              required: true,
                              message: '请输入新密码'
                            }
                          ]
                        }
                      ]"
                      type="password"
                      placeholder="请输入新密码"
                    >
                      <a-icon
                        slot="prefix"
                        type="lock"
                        style="color: rgba(0,0,0,.25)"
                      />
                    </a-input>
                  </a-form-item>
                  <a-form-item
                    label="再输入新密码"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol"
                  >
                    <a-input
                      v-decorator="[
                        'newPassword2',
                        {
                          rules: [
                            {
                              required: true,
                              message: '请重新输入新密码'
                            }
                          ]
                        }
                      ]"
                      type="password"
                      placeholder="请重新输入新密码"
                    >
                      <a-icon
                        slot="prefix"
                        type="lock"
                        style="color: rgba(0,0,0,.25)"
                      />
                    </a-input>
                  </a-form-item>
                </a-form>
              </a-modal>
            </template>
            <a-avatar
              shape="square"
              size="large"
              :style="{ backgroundColor: color, verticalAlign: 'middle' }"
              >您</a-avatar
            >
          </a-popover>
        </a-row>
      </a-layout-header>
      <router-view v-if="alive" />
    </a-layout>
  </a-layout>
</template>
<script>
import router from "../router";
import crypto from "crypto";
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  provide() {
    return {
      reload: this.reload
    };
  },
  data() {
    return {
      newPasswordBool: false, //修改密码弹窗控制器
      permissions: this.$store.state.permissions,
      alive: true,
      dataIdentity: this.$store.state.dataIdentity,
      avatarValue: "我",
      color: "#f56a00",
      collapsed: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 }
      }
    };
  },
  methods: {
    handleCancel(e) {
      this.newPasswordBool = false;
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          if (values.newPassword2 != values.newPassword) {
            this.$message.error("请两次输入的新密码保持一致");
          } else {
            var md5 = crypto.createHash("md5");
            md5.update(values.newPassword);
            var newPassword = md5.digest("hex");

            md5 = crypto.createHash("md5");
            md5.update(values.oldPassword);
            var oldPassword = md5.digest("hex");
            this.axios
              .post(
                "/user/UpdatePassWord",
                JSON.stringify({
                  studentId: this.$store.state.studentId,
                  oldPassword: oldPassword,
                  newPassword: newPassword
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
                  if (res.data.status == 0) {
                    this.$notification.error({
                      message: "旧密码错误！"
                    });
                  } else {
                    this.$notification.success({
                      message: "密码修改成功！"
                    });
                    this.newPasswordBool = false;
                  }
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
          }
        }
      });
    },
    jump(address) {
      this.$router.push(address);
    },
    handleChange(value) {
      this.$store.commit("changeShowIdentity", value);
      this.reload();
    },
    reload() {
      this.alive = false;
      this.$nextTick(() => {
        this.alive = true;
      });
    }
  },
  mounted() {
    // if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
    //   this.$router.push("/show_scores_mobile")
    // }
  }
};
</script>

<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}
#components-form-demo-normal-login .login-form-forgot {
  float: right;
}
#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>
