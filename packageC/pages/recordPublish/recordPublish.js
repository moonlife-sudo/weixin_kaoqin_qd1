const moment = require('moment');
var amapFile = require('../../../libs/amap-wx.js');
var markersData = [];
Page({
  data: {
    enable:false,
    title: '加载中&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
    show: false,
    show_popup: false,
    minDate: '', // 设置初始值为空
    maxDate: '', // 设置初始值为空
    selectedTime: '',
    startTime: '',
    endTime: '',
    selectedType: '', // 新增的字段，用于标识选择的时间类型
    select: false,
    tihuoWay: '数据结构',
    submittedData: [],
    markers: [],
    latitude: '',
    longitude: '',
    textData: {},
    input_className:'',//输入的课程名称
    courseNumber:'',//课程号
    columns: [],
    defaultIndex: 0, // 设置默认选中项的索引值为0，即默认选择第一个班级
    choose_name:"请选择课程"
  },
  

  //显示弹出窗
  onClick_popup(){
    this.setData({
      show_popup:true
    });
    //当显示弹出窗时，查看该老师创建的所有班级，并且把班级名称赋值给columns数组[]
    this.Search_Class();
  },
  Search_Class:function () {
    //首先获取本地手机号
    const phone=wx.getStorageSync('phone');
    // 发送 POST 请求到 https://www.njwuqi.com/queryAllCourseByPhone 并携带手机号作为请求参数
    wx.request({
      url: 'https://www.njwuqi.com/queryAllCourseByPhone',
      method: 'POST',
      data: {
        phone: phone,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        const message = responseData.message;

        if (code === 0) {
          // 查询成功，提取 courseinfos 数组
          const courseinfos = responseData.courseinfos;

          // 遍历 courseinfos 数组，将每个对象的 courseName 字段的值赋值给 columns 数组
          const columns = courseinfos.map((courseinfo) => {
            return courseinfo.courseName;
          });

          this.setData({
            columns: columns,
          });

        } else {
          // 查询失败或其他处理逻辑
          wx.showToast({
            title: '查询课程信息失败！',
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
        // 请求失败处理逻辑
        console.error('查询课程信息失败:', error);
        wx.showToast({
          title: '查询课程信息失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  //关闭弹出窗
  onClose_popup(){
    this.setData({
      show_popup:false
    });
  },
  //确认选择器
  onConfirm(event) {
    const { value, index } = event.detail;
    this.setData({
      show_popup: false,
      input_className: value, // 将所选班级名称赋值给 input_className
      choose_name:value,
    });
   
    //当点击确认后，把所选中的数组内容的值赋值给input_className，然后根据input_className查询班级号
this.getCourseInfo();
  },
//关闭选择器
  onCancel() {
  
    this.setData({
      show_popup:false
    });
  },
  onChange(event) {
    const {  value, index } = event.detail;
    // 此处使用 Vant Weapp 的 Toast 组件显示当前值和索引
    // 请确保已正确引入 Vant Weapp 的 Toast 组件
    
  },
  
  getCourseInfo: function () {
    const phone = wx.getStorageSync('phone');
    const inputClassName = this.data.input_className; // 获取页面中的 input_className 值
  
    // 发送 POST 请求到 https://www.njwuqi.com/queryAllCourseByPhone 并携带手机号作为请求参数
    wx.request({
      url: 'https://www.njwuqi.com/queryAllCourseByPhone',
      method: 'POST',
      data: {
        phone: phone,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        const message = responseData.message;
  
        if (code === 0) {
          // 查询成功，提取 courseinfos 数组
          const courseinfos = responseData.courseinfos;
  
          // 遍历 courseinfos 数组，查找与 inputClassName 相等的数据，并获取对应的 courseNumber
          let foundCourseNumber = null;
          for (const courseinfo of courseinfos) {
            if (courseinfo.courseName === inputClassName) {
              foundCourseNumber = courseinfo.courseNumber;
              break; // 找到匹配的数据后可以直接退出循环
            }
          }
  
          if (foundCourseNumber !== null) {
            // 找到匹配的数据，将对应的 courseNumber 赋值给 page data 中的 courseNumber
            this.setData({
              courseNumber: foundCourseNumber,
            });
  
            
          } else {
            // 没有找到匹配的数据，进行相应处理
            wx.showToast({
              title: '未找到匹配的班级号！',
              icon: 'none',
              duration: 2000,
            });
          }
        } else {
          // 查询失败或其他处理逻辑
          wx.showToast({
            title: '查询课程信息失败！',
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
        // 请求失败处理逻辑
    
        wx.showToast({
          title: '查询课程信息失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  //获取时间选择器的类型
  onImageClick(event) {
    const type = event.currentTarget.dataset.type;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const formattedTime = `${currentHour}:${currentMinute}`;
  
    this.setData({
      show: true,
      selectedType: type,
      selectedTime: formattedTime,
    });
  },

  onClose() {
    this.setData({
      show: false,
    });
  },
//时间格式化和确定时间
  onTimeConfirm(event) {
   
    // 解析时间部分，构建有效的日期对象
  const timeParts = event.detail.split(':');
  const currentDateTime = new Date();
  currentDateTime.setHours(timeParts[0]); // 设置小时
  currentDateTime.setMinutes(timeParts[1]); // 设置分钟

  // 使用 moment 进行格式化
  const formattedTime = moment(currentDateTime).format('HH:mm');
 
    const { selectedType } = this.data;

     
    if (selectedType === 'start') {
      this.setData({
        startTime: formattedTime,
      });
    } else if (selectedType === 'end') {
      this.setData({
        endTime: formattedTime,
      });
    }
    this.setData({
      show: false,
    });
  },
  
  onTimeCancel() {
    this.setData({
      show: false,
      selectedType: '', // 清空 selectedType 字段
    });
  },
  
  onShareAppMessage() {
    return {};
  },
 
  

  bindShowMsg() {
    this.setData({
      select: !this.data.select
    })
  },

  mySelect(e) {
    var name = e.currentTarget.dataset.name
    this.setData({
      tihuoWay: name,
      select: false
    })
  },



  makertap: function(e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData,id);
  },
  onLoad: async function() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 将 minDate 设置为当前时间的小时和分钟
    this.setData({
      minDate: `${currentHour}:${currentMinute}`,
      maxDate: '23:59', // 设置 maxDate 为一天中最后的时间
    });
  
    try {
      // 调用全局函数获取用户信息并等待函数完成
      await getApp().getUserInfo();
      
      // 获取本地保存的phone
      const phone = wx.getStorageSync('phone');
      
      // 在这里可以对获取到的phone进行处理
    } catch (err) {
     
    }
      
    var that = this;
    // var myAmapFun = new amapFile.AMapWX({key:'9d9e2fdd420e097198f21297742c2f78'});
    // myAmapFun.getPoiAround({
    //   iconPathSelected: '选中 marker 图标的相对路径', //如：..­/..­/img/marker_checked.png
    //   iconPath: '未选中 marker 图标的相对路径', //如：..­/..­/img/marker.png
    //   success: function(data){
    //     markersData = data.markers;
    //     that.setData({
    //       markers: markersData
    //     });
    //     that.setData({
    //       latitude: markersData[0].latitude
    //     });
    //     that.setData({
    //       longitude: markersData[0].longitude
    //     });
    //     that.showMarkerInfo(markersData,0);
    //     that.setData({
    //       enable: true
    //     });
    //     that.setData({
    //       title: '发&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;布&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
    //     });
    //   },
    //   fail: function(info){
    //     wx.showModal({title:info.errMsg})
    //   }
    // })
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: function(res){
        // markersData = data.markers;
        // that.setData({
        //   markers: markersData
        // });
        that.setData({
          latitude: res.latitude
        });
        that.setData({
          longitude: res.longitude
        });
        // that.showMarkerInfo(markersData,0);
        that.setData({
          enable: true
        });
        that.setData({
          title: '发&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;布&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        });
      },
      fail: function(info){
        // wx.showModal("定位失败 1）尝试点击右上角-设置-位置信息-允许 2）删除微信小程序，重新搜索使用")
        console.log(info)
        wx.showToast({
          title: "定位失败 1）尝试点击右上角-设置-位置信息-允许\n 2）删除微信小程序，重新搜索使用",
          icon: 'none',
          duration: 10000,
        });
      }
    })
  },
  showMarkerInfo: function(data,i){
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  //进行打卡请求
  doLogin: function () {
    if(this.data.enable == false){
      return;
    }
    wx.showLoading({
      title: '发布中',
    })
    const requestData = {
      "courseNumber": this.data.courseNumber,
      "finalTime": this.data.endTime,
      "startTime": this.data.startTime,
      "longitude": this.data.longitude,
      "latitude": this.data.latitude
    };
    wx.request({
      url: 'https://www.njwuqi.com/teacherPostCall',
      method: 'POST',
      data: requestData,
      header: getApp().globalData.header,
      success: (res) => {
        wx.hideLoading();
        const responseData = res.data;
        const code = responseData.code;
        const message = responseData.message;
        const courseNumber = responseData.courseNumber;
        
        if (code===0) {
          // 登陆成功
          wx.showToast({
            title: '发布打卡成功',
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
        wx.hideLoading();
        // 登陆验证失败的处理逻辑
        console.error('登陆验证失败:', error);
        wx.showToast({
          title: '登陆验证失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  SUB(){
    wx.showModal({
      title: '提示',
      content: '是否确定发布打卡？',
      cancelText: '取消',
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          this.doLogin();
        } else if (res.cancel) {
            return;
        }
      }
    })
    
  },
  handleShowModal() {
    wx.showModal({
      title: '确认获取您当前位置信息？', //提示的标题
      content:'东经'+this.data.longitude+'北纬'+this.data.latitude, //提示的内容
      success: function (res) {
        if (res.confirm) {
          
        } else if (res.cancel) {
         
        }
      }
    })
  },
});