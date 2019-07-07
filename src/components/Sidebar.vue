/* eslint-disable vue/no-parsing-error */
<template>
  <a-layout
    id="components-layout-demo-custom-trigger"
    style="min-height: 100vh"
  >
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <div class="logo" />
      <a-menu theme="dark" :defaultSelectedKeys="['']" mode="inline">
        <a-sub-menu key="management">
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
export default {
  provide() {
    return {
      reload: this.reload
    };
  },
  data() {
    return {
      alive: true,
      dataIdentity: this.$store.state.dataIdentity,
      avatarValue: "您",
      color: "#f56a00",
      collapsed: false
    };
  },
  methods: {
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
</style>
