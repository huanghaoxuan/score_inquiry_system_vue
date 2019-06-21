/* eslint-disable vue/no-parsing-error */
<template>
  <a-layout
    id="components-layout-demo-custom-trigger"
    style="min-height: 100vh"
  >
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <div class="logo" />
      <a-menu theme="dark" :defaultSelectedKeys="['']" mode="inline">
        <a-sub-menu key="teacheringWork">
          <span slot="title"> <a-icon type="user" /><span>教学工作</span></span>
          <a-menu-item
            key="teacheringWork_classroomTeaching"
            @click="() => jump('/classroomTeaching/status')"
            >课堂教学</a-menu-item
          >
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-row>
          <a-col>
            <a-icon
              class="trigger"
              :type="collapsed ? 'menu-unfold' : 'menu-fold'"
              @click="() => (collapsed = !collapsed)"
            />
          </a-col>
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
      color: "#f56a00",
      collapsed: false
    };
  },
  methods: {
    jump(address) {
      this.$router.push(address);
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
