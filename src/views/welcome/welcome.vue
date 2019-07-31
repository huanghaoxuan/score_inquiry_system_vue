<template>
  <div style="background:#ECECEC; padding:30px;width:100%">
    <a-card title="成绩分析" v-if="permissions == 1">
      <score-chart></score-chart>
    </a-card>
    <br />
    <a-card title="课程总计" v-if="permissions == 1">
      <score-count></score-count>
    </a-card>
    <a-card title="任课班总计" v-if="permissions != 1">
      <teaching-class-count></teaching-class-count>
    </a-card>
  </div>
</template>
<script>
import scoreChart from "./component/scoreChart";
import scoreCount from "./component/scoreCount";
import teachingClassCount from "./component/teachingClassCount";
export default {
  components: {
    scoreChart,
    scoreCount,
    teachingClassCount
  },
  data() {
    return {
      permissions: this.$store.state.permissions
    };
  }
};
</script>
