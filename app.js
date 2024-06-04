App({
  onLaunch() {var amapFile = require('libs/amap-wx.js');
  this.hasNewBanben() // 校验小程序版本
},
// 校验更新
hasNewBanben() {
  console.log('校验更新')
  //判断微信版本是否 兼容小程序更新机制API的使用
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res1) => {
      if (res1.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function(res) {
              // todo 做一些操作，比如说清除 Storage 缓存等
              updateManager.applyUpdate();
            }
          })
          console.log('正在更新中......')
        })
        updateManager.onUpdateFailed(function () {
          // todo 做一些操作，比如说清除 Storage 缓存等
          // 新版本下载失败
          wx.showModal({
            title: '已经有新版本呦~',
            content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
          })
        })
      }
    })
  } else {
    // todo 做一些操作，比如说清除 Storage 缓存等
    // 此时微信版本太低（一般而言版本都是支持的）
    wx.showModal({
      title: '溫馨提示',
      content: '当前微信版本过低，请升级到最新微信版本后重试。'
    })
  }
},
getUserInfo: function () {
  return new Promise((resolve, reject) => {
    const openid=wx.getStorageSync('openid');

    var header = getApp().globalData.header; //获取app.js中的请求头
    // 发送POST请求获取用户信息
    wx.request({
      url: 'https://www.njwuqi.com/queryUserinfo',
      method: 'POST',
      data: {
        openid: openid
      },
      header: getApp().globalData.header,
      success: res => {
        const userinfo = res.data.userinfo;
        // 保存userinfo表中的phone到本地
        wx.setStorageSync('phone', userinfo.phone);

        // 成功获取用户信息，将Promise标记为resolved
        resolve();
      },
      fail: err => {
        console.error('请求用户信息失败', err);
        // 获取用户信息失败，将Promise标记为rejected
        reject(err);
      }
    });
  });
},

  globalData: {
    submittedData: [],
    header: {'Cookie': '','openid':'','weixinxiaochengxu':'34534256asddggasfgd'}
  }
})