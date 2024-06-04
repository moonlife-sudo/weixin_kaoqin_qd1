Page({
  data: {
    phone:'',
    realName:'',
    usernumber:'',
  },
onLoad(){
  const phone = wx.getStorageSync('phone');
  const realName = wx.getStorageSync('realName');
  const userNumber = wx.getStorageSync('userNumber');
  this.setData({
    phone: phone,
    realName: realName,
    userNumber:userNumber,
  });
},
onClick_1() {
  const phone=this.data.phone;
  
  const realName=this.data.realName;
  const userNumber=this.data.userNumber;
  wx.request({
    url: 'https://www.njwuqi.com/updateUserinfoByPhone',
    method: 'POST',
    data: {
     phone:phone,
     realName:realName,
     userNumber:userNumber,
    },
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const code = responseData.code;
      if (code === 0) {
        wx.showToast({
          title: '修改用户信息成功！',
          icon: 'none',
          duration: 2000,
        });
        wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
      } else {
      
        wx.showToast({
          title: '修改用户信息失败！',
          icon: 'none',
          duration: 2000,
        });
      }
    },
    fail: (error) => {
   
      wx.showToast({
        title: '修改用户信息失败！',
        icon: 'none',
        duration: 2000,
      });
    },
  });
  
},
onClick_2() {
  wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
},
onClick_3: function () {
  // 点击事件处理函数
  this.setData({
    realName: "", // 清空realName的值
  });

  // 弹出输入框，获取用户输入
  wx.showModal({
    editable:true,//显示输入框
    title: "输入姓名",
    placeholderText:'修改您的姓名',//显示输入框提示信息
    showCancel: true,
    cancelText: "取消",
    confirmText: "确定",
    success: (res) => {
      if (res.confirm) {
        const inputValue = res.content; // 获取用户输入的值
        this.setData({
          realName: inputValue, // 将用户输入的值赋值给realName
        });
      }
    },
  });
},
onClick_4: function () {
  // 点击事件处理函数
  this.setData({
    userNumber: "", // 清空realName的值
  });

  // 弹出输入框，获取用户输入
  wx.showModal({
    editable:true,//显示输入框
    title: "输入工号",
    placeholderText:'修改您的工号',//显示输入框提示信息
    showCancel: true,
    cancelText: "取消",
    confirmText: "确定",
    success: (res) => {
      if (res.confirm) {
        const inputValue_1 = res.content; // 获取用户输入的值
        this.setData({
          userNumber: inputValue_1, // 将用户输入的值赋值给realName
        });
      }
    },
  });
},

  onShareAppMessage() {
    return {};
  },
});