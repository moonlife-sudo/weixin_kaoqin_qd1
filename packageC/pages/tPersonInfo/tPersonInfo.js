Page({
  data: {
    phone:'',
    realName:'',
  },
  //页面加载时根据openid
  onLoad:function () {
    const phone = wx.getStorageSync('phone');
    const realName = wx.getStorageSync('realName');
    this.setData({
      phone: phone,
      realName: realName,
    });
  },
  onShareAppMessage() {
    return {};
  },
  onClick() {
    wx.navigateTo({ url: '/packageC/pages/notfound' });
  },
  onClick_1() {
   
    wx.redirectTo({ url: '/packageC/pages/tClass/tClass' });
  },
  onClick_2() {
    wx.redirectTo({ url: '/packageC/pages/tRecord/tRecord' });
  },
  onClick_4() {
    wx.navigateTo({ url: '/packageC/pages/modifypersoninfo/modifypersoninfo' });
  },
});