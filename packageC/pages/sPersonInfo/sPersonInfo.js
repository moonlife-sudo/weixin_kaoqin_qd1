const { relativeTimeThreshold } = require("moment");
Page({
  data: {
    phone:'',
    realName:'',
    QRcourse_number:'',
    userNumber:'',
  },
//页面加载时根据openid
onLoad:function () {
  const phone = wx.getStorageSync('phone');
  const realName = wx.getStorageSync('realName');
  const userNumber = wx.getStorageSync('userNumber');
  this.setData({
    phone: phone,
    realName: realName,
    userNumber:userNumber,
  });
},
onClick_1(){
  wx.navigateTo({ url: '/packageC/pages/modifystudentclassinfo/modifystudentclassinfo' });
},
  onShareAppMessage() {
    return {};
  },
 
  
  onClick_2() {
    wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
  },
  onClick_3() {
    wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
  },
  onClick_4() {
    wx.navigateTo({ url: '/packageC/pages/sStudyInfo/sStudyInfo' });
  },
  onClick_6() {
    wx.navigateTo({ url: '/packageC/pages/sStudyInfo/sStudyInfo' });
  },
});