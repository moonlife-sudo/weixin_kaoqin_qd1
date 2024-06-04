Page({
  data: {
    courseNumber:'',
    list: {
      th: ["打卡状态", "打卡日期", "开始时间", "结束时间"],
      td: [], // 初始化为空数组
    },
  },
  onLoad: function (options) {
    const courseNumber = options.courseNumber;
    this.setData({
      courseNumber:courseNumber,
    });
    //学生查询我的打卡信息
    this.search_Info();
    
  },
 search_Info:function(){
   //获取用户手机号
    const phone=wx.getStorageSync('phone');
    const courseNumber = this.data.courseNumber;

    // 发送 POST 请求
    wx.request({
      url: 'https://www.njwuqi.com/studentRollCallInfo',
      method: 'POST',
      data: {
        phone: phone,
        courseNumber: courseNumber,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const result = res.data;
        if (result.code === 0) {
          // 查询成功
          const recordinfoDisplays = result.recordinfoDisplays;

          // 将查询结果中的数据转换为表格需要的格式
          const updatedList = recordinfoDisplays.map((record) => {
            return [record.state, record.date, record.starttime, record.endtime];
          });

          // 更新 data 中的 list.td 数组
          this.setData({
            'list.td': updatedList,
          });
        } else {
          // 处理查询失败的情况
          
          wx.showToast({
            title: '查询失败',
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (err) => {
        // 处理请求失败的情况
        console.error('查询失败:', err);
        wx.showToast({
          title: '查询失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
 },
  showAll(){
    if(this.data.isShowAll){
      this.setData({
        isShowAll:false
      })
    }else{
      this.setData({
        isShowAll:true
      })
    }
  },
  onShareAppMessage() {
    return {};
  },

});