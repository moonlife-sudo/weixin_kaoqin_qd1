var amapFile = require('../../../libs/amap-wx.js');
var markersData = [];
Page({
  data: {
    enable:false,
    title: '加载中',
    show:false,
    markers: [],
    latitude: '',
    longitude: '',
    courseNumber: '',
    courseName: '',
    addressName: '',
  },
  onLoad: function(options) {
              // options对象包含传递过来的参数，获取并设置到data中
              const courseNumber = options.courseNumber;
              
              const courseName = options.courseName;
          
              const addressName = options.addressName;
          
          
              this.setData({
                courseNumber: courseNumber,
                courseName: courseName,
                addressName: addressName,
              });
    var that = this;
    // //调用API
    // var myAmapFun = new amapFile.AMapWX({key:'9d9e2fdd420e097198f21297742c2f78'});
    // //使用poi方法get坐标
    // myAmapFun.getPoiAround({
    //   success: function(data){
    //     markersData = data.markers;
    //     //获取经纬度
    //     that.setData({
    //       latitude: markersData[0].latitude
    //     });
    //     that.setData({
    //       longitude: markersData[0].longitude
    //     });
    //     that.setData({
    //       enable: true
    //     });
    //     that.setData({
    //       title: '打卡'
    //     });
    //   },
    // })
        //调用API
        wx.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: function(res){
            console.log("地图加载成功！！！")
            // markersData = data.markers;
            //获取经纬度
            that.setData({
              latitude: res.latitude
            });
            that.setData({
              longitude: res.longitude
            });
            that.setData({
              enable: true
            });
            that.setData({
              title: '打卡'
            });
          },
          fail(err){
            console.log(err)
            wx.showToast({
              title: "定位失败 1）尝试点击右上角-设置-位置信息-允许\n 2）删除微信小程序，重新搜索使用",
              icon: 'none',
              duration: 4000,
            });
          }
        })
  },
  daka: function () {
    if(this.data.enable == false){
      return;
    }
    wx.showLoading({
      title: '打卡中',
    })
    const phone=wx.getStorageSync('phone');
    const requestData = {
        "phone": phone,
        "courseNumber": this.data.courseNumber,
        "latitude": this.data.latitude,
        "longitude": this.data.longitude
    };
    wx.request({
      url: 'https://www.njwuqi.com/studentRollCall',
      method: 'POST',
      data: requestData,
      header: getApp().globalData.header,
      success: (res) => {
        wx.hideLoading();
        const responseData = res.data;
        const code = responseData.code;
        const message = responseData.message;
        if (code===0) {
          // 打卡成功
          wx.showToast({
            title: '打卡成功',
            icon: 'none',
            duration: 2000,
          });
          wx.redirectTo({ url: '/packageC/pages/recordState1/recordState1' });
        }else if(code===1){
          //无需打卡
          wx.showToast({
            title: message,
            icon: 'error',
            duration: 2000,
          });
        }else if(code===2){
          //已打卡，不可以重复打卡
          wx.showToast({
            title: message,
            icon: 'error',
            duration: 2000,
          });
        }else if(code===3){
          //不在考勤打卡时间内
          wx.showToast({
            title: message,
            icon: 'error',
            duration: 2000,
          });
        }else if(code===4){
          //不在考勤打卡范围内
          wx.showToast({
            title: '不在考勤打卡范围内',
            icon: 'error',
            duration: 2000,
          });
        }else if(code===5){
          //该班级不存在
          wx.showToast({
            title: '该班级不存在',
            icon: 'error',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
      },
    });
  },
  SUB(){
    this.daka();
  },
showPopup(){
  this.setData({show:true});
},
onClose() {
  this.setData({ show: false });
},
  onShareAppMessage() {
    return {};
  },
  onClick_3() {
    wx.redirectTo({ url: '/packageC/pages/sPersonInfo/sPersonInfo' });
  },
});