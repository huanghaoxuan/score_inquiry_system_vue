<template>
  <div style="background:#ECECEC; padding:30px">
    <a-card title="成绩分析">
      <score-chart></score-chart>
    </a-card>
    <br />
    <a-card title="课程总计">
      <score-count></score-count>
    </a-card>
  </div>
</template>
<script>
import scoreChart from "./component/scoreChart";
import scoreCount from "./component/scoreCount";
export default {
  components: {
    scoreChart,
    scoreCount
  }
};
</script>
