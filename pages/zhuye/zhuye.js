Page({
  data: {
    selectedType:'', // 新增的字段，用于标识选择的角色类型,
    showThisView:false,
  },
 onLoad(){
  const openid = wx.getStorageSync('openid');
  if (!openid) {
    this.login();
  } else {
    this.login2(openid);
  }
 },
  //如果没有openid本地
login: function () {
  wx.login({
    success: (res) => {
      if (res.code) {
        //获取openid
        this.doLogin(res.code);
      } else {
        console.error('获取用户code失败:', res.errMsg);
        wx.showToast({
          title: '获取用户信息失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      }
    },
    fail: (error) => {
      console.error('调用wx.login方法失败:', error);
      wx.showToast({
        title: '获取用户信息失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
},
//根据openid判断是否绑定信息
doLogin: function (code) {
  const requestData = {
    code: code,
  };

  wx.request({
    url: 'https://www.njwuqi.com/wx/login',
    method: 'POST',
    data: requestData,
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const code = responseData.code;
      const message = responseData.message;
      const openid = responseData.openid;
      const sessionid = responseData.sessionid;
      getApp().globalData.header.Cookie = 'JSESSIONID=' + sessionid;
      getApp().globalData.header.openid = openid;
      if (code === 2) {
        // 清空本地缓存
        wx.clearStorage();
        wx.showModal({
          title: '温馨提示',
          showCancel: false,
          content: '系统错误,即将关闭小程序,请重新打开',
          success(res) {
          if (res.confirm) {
              wx.exitMiniProgram({})
          }
        }
        })
      } else if (code === 1) {
        wx.setStorageSync('openid', openid);
        this.setData({
              showThisView: true,
        });
      } else if(code === 0) {
        wx.setStorageSync('openid', openid);
        // 调用 getRoleAndRedirect，并传入回调函数获取 role 值
        this.getRoleAndRedirect(openid, (role) => {
          if (role === 2) {
            wx.redirectTo({
              url: '/packageC/pages/sClassInfo/sClassInfo',
            });
          } else if (role === 1) {
            wx.redirectTo({
              url: '/packageC/pages/tRecord/tRecord',
            });
          } else {
            // 处理未知角色的逻辑
          }
        });
      }
    },
    
    fail: (error) => {
      console.error('登陆验证失败:', error);
      wx.showToast({
        title: '登陆验证失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
},
//本地有openid，判断是否绑定
login2: function (openid) {
  const requestData = {
    openid: openid,
  };

  wx.request({
    url: 'https://www.njwuqi.com/wx/login2',
    method: 'POST',
    data: requestData,
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const code = responseData.code;
      const message = responseData.message;
      const sessionid = responseData.sessionid;
      getApp().globalData.header.Cookie = 'JSESSIONID=' + sessionid;
      getApp().globalData.header.openid = openid;
      if (code === 0 ) {
        this.getRoleAndRedirect(openid, (role) => {
          if (role === 2) {
            wx.redirectTo({
              url: '/packageC/pages/sClassInfo/sClassInfo',
            });
          } else if (role === 1) {
            wx.redirectTo({
              url: '/packageC/pages/tRecord/tRecord',
            });
          } else {
            // 处理未知角色的逻辑
          }
        });
      } else if (code === 1) {
        this.setData({
              showThisView: true,
        });

      } else if(code == 2){
        // 清空本地缓存
        wx.clearStorage();
        wx.showModal({
          title: '温馨提示',
          showCancel: false,
          content: '系统错误,即将关闭小程序,请重新打开',
          success(res) {
          if (res.confirm) {
              wx.exitMiniProgram({})
          }
        }
        })
      } else {

      }
    },
    fail: (error) => {
      
      wx.showToast({
        title: '请求失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
},

getRoleAndRedirect: function (openid, callback) {
  wx.request({
    url: 'https://www.njwuqi.com/queryUserinfo',
    method: 'POST',
    data: {
      openid: openid,
    },
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const role = responseData.userinfo.role;
     
      // 在获取到 role 值后，将其作为参数传递给回调函数
      if (typeof callback === 'function') {
        callback(role);
      }
    },
    fail: (error) => {
      
      wx.showToast({
        title: '获取角色失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
},
  onShareAppMessage() {
    return {};
  },
 onClick(event){
  this.setData({
    selectedType: event.currentTarget.dataset.type,
  });
  
  let role = "学生";
  wx.showModal({
    title: '警告：确认身份后不能修改',
    content: '是否确定是'+role+"?",
    cancelText: '取消',
    confirmText: '确认',
    success: (res) => {
      if (res.confirm) {
        wx.redirectTo({ url: '/packageC/pages/sLogin/sLogin' });
      } else if (res.cancel) {
          return;
      }
    }
  })
 },
 onClick_1(event){
  this.setData({
    selectedType: event.currentTarget.dataset.type,
  });
  
  
  let role = "老师";

  wx.showModal({
    title: '警告：确认身份后不能修改',
    content: '是否确定是'+role+"?",
    cancelText: '取消',
    confirmText: '确认',
    success: (res) => {
      if (res.confirm) {
        wx.redirectTo({ url: '/packageC/pages/tLogin/tLogin' });
      } else if (res.cancel) {
          return;
      }
    }
  })
 },


});