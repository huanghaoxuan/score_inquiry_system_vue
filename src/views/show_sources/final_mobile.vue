<template>
  <div>
    <van-list v-model="loading"
              :finished="true"
              finished-text="没有更多了">
      <van-cell v-for="item in list"
                :key="item"
                :title="item" />
    </van-list>
  </div>
</template>

<script>
import Vue from 'vue';
import { List, Cell, CellGroup } from 'vant';
import 'vant/lib/index.css';
Vue.use(List).use(Cell).use(CellGroup);
export default {
  data () {
    return {
      list: [1,1,1,1],
      loading: false,
    };
  },

  methods: {
  }
}
</script>