Page({
  data: {
    inputValue_EZK: '',
    inputValue_jBc: '',
    inputValue_hit: '',
    inputValue_Til: '',
    inputValue_oMs: '',
  },
  EZK_onInputBlur(event) {
    this.setData({
      inputValue_EZK: event.detail.value,
    });
  },
  jBc_onInputBlur(event) {
    this.setData({
      inputValue_jBc: event.detail.value,
    });
  },
  hit_onInputBlur(event) {
    this.setData({
      inputValue_hit: event.detail.value,
    });
  },
  getPhoneNumber: function(e) {
    let that = this;
    let phonecode = e.detail.code;
    console.log(e.detail.errMsg);
    // 拒绝授权
    if(e.detail.errMsg == 'getPhoneNumber:fail user deny')
    {
      return;
    }
    wx.request({
      url: 'https://www.njwuqi.com/phone',
      method: 'POST',
      data: {
        code: phonecode,
      },
      header: getApp().globalData.header,
      success: (res) => {
      console.log(res.data.purePhoneNumber);
      that.setData({
        inputValue_Til: res.data.purePhoneNumber
      });
      },
      fail: (error) => {
        
        wx.showToast({
          title: '获取手机号失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  oMs_onInputBlur(event) {
    this.setData({
      inputValue_oMs: event.detail.value,
    });
  },

  // 点击Login按钮时触发的事件处理函数
  onLoginClick() {
    wx.showModal({
      title: '警告：注册成功后信息不能修改',
      content: '是否确认所填信息无误？',
      cancelText: '取消',
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          const openid = wx.getStorageSync('openid');
    
          const username = this.data.inputValue_EZK;
        
          const studentID = this.data.inputValue_jBc;
          const phoneNumber = this.data.inputValue_Til;
            // 调用wx.login方法获取用户的code
            wx.login({
              success: (res) => {
                if (res.code) {
                  // 获取用户code成功，可以进行登陆验证
                  const requestData = {
                    phone:phoneNumber,
                    realName:username,
                    userNumber:studentID,
                    role:1,
                    openid:openid,
                  };
        
                  var header = getApp().globalData.header; //获取app.js中的请求头
                  // 发起POST请求
                  wx.request({
                    url: 'https://www.njwuqi.com/bindingInfo',
                    method: 'POST',
                    data: requestData,
                    header: getApp().globalData.header,
                    success: (res) => {
                      // 登陆验证成功的处理逻辑
                      const responseData = res.data;
                      const code = responseData.code;
                      const message = responseData.message;
                      if (code===0) {
                        // 登陆成功
                        wx.showToast({
                          title: '登录成功',
                          icon: 'none',
                          duration: 2000,
                        });
                        wx.redirectTo({ url: '/packageC/pages/tRecord/tRecord' });
                      } else {
                        // 登陆失败，根据返回的message进行相应的处理
                        wx.showToast({
                          title: responseData.message,
                          icon: 'none',
                          duration: 2000,
                        });
                      }
                    },
                    fail: (error) => {
                      // 登陆验证失败的处理逻辑
                      console.error('登陆验证失败:', error);
                      wx.showToast({
                        title: '登陆验证失败，请重试',
                        icon: 'none',
                        duration: 2000,
                      });
                    },
                  });
                } else {
                  // 获取用户code失败
                  console.error('获取用户code失败:', res.errMsg);
                  wx.showToast({
                    title: '获取用户信息失败，请重试',
                    icon: 'none',
                    duration: 2000,
                  });
                }
              },
              fail: (error) => {
                // 调用wx.login方法失败
                console.error('调用wx.login方法失败:', error);
                wx.showToast({
                  title: '获取用户信息失败，请重试',
                  icon: 'none',
                  duration: 2000,
                });
              },
            });
        } else if (res.cancel) {
            return;
        }
      }
    })
    
    },
  });
