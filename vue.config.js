module.exports = {
  // 基本路径
  publicPath: "./",
  // 输出文件目录
  outputDir: "dist",
  devServer: {
    port: 8089, // 端口号
    //host: 'localhost',
    https: false, // https:{type:Boolean}
    open: false, //配置自动启动浏览器
    //disableHostCheck: true,
    //proxy: null //'http://localhost:4000' // 配置跨域处理,只有一个代理
    proxy: {
      "/api": {
        //使用"/api"来代替"http://f.apiplus.c"
        target: "http://localhost:8083", //源地址
        changeOrigin: true, //改变源
        ws: true,
        pathRewrite: {
          "^/api": "" //路径重写
        }
      }
    } // 配置多个代理
  }
};
