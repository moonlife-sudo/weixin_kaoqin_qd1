const { relativeTimeThreshold } = require("moment");

Page({
  data: {
   student_phone:'',//存储学生手机号
    submittedData: [],//存储课程信息
    input_value: '',//搜索框输入的值
    class_name:'',
    course_number:'',
    show:false,
    class_value:'',
    teacher_value:'',
    QRcourse_number:'',//获取的二维码课程号
    show_popup:false,
    query_class_name:'',
    columns: [],//用来存储 显示的可以添加的班级信息
    columnsCourseNumbers: [],//用来存储班级号
  },
  onClick_popup(){
    this.setData({
      show_popup:true
    });
    //当显示弹出窗时，查看该学生可以添加的所有班级，并且把班级名称赋值给columns数组[]
    this.get_student_className();
  },
  get_student_className: function () {
    const phone = wx.getStorageSync('phone');
    wx.request({
      url: 'https://www.njwuqi.com/queryAllCanAddCourseByPhone',
      method: 'POST',
      data: {
        phone: phone,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        if (code === 0) {
          const courseinfos = responseData.courseinfos || [];
          const columns = courseinfos.map(item => {
            const { courseName, realName, courseNumber } = item;
            const str_input = `${courseName} ${realName} ${courseNumber}`;
            return str_input;
          });

          var columnsCourseNumbers = [];
          for(var i = 0; i < responseData.courseinfos.length; i++){
            columnsCourseNumbers[i] = responseData.courseinfos[i].courseNumber;
          }
          
          this.setData({
            columns: columns,
            columnsCourseNumbers: columnsCourseNumbers
          });
  
          
        } else {
          wx.showToast({
            title: responseData.message,
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '查询课程信息失败（queryAllCanAddCourseByPhone），请重试',
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
  onConfirm_1(event) {
    const { index } = event.detail;
    const courseNumber = this.data.columnsCourseNumbers[index];

  // 更新页面的 course_number
  this.setData({
    course_number: courseNumber,
    show_popup: false,
  });
  this.do_Insert();
  },
//关闭选择器
  onCancel_1() {
  
    this.setData({
      show_popup:false
    });
  },

  scanQRCode() {
    wx.scanCode({
      success: (res) => {
        // 扫码成功，获取二维码内容并赋值给QRcourse_number
        const scannedData = res.result;
        const scannedNumber = parseInt(scannedData); // 将字符串转换为整数，结果为 12345

        this.setData({
          QRcourse_number: scannedNumber, // 将整数赋值给 QRcourse_number 变量
        });
      
        //执行二维码插入班级函数
        this.QRinsert_Class();
      },
      fail: (error) => {
        // 扫码失败或用户取消扫码的处理逻辑
       
      },
    });
  },
  QRinsert_Class:function(){
    //首先获取手机号
    const phone=wx.getStorageSync('phone');
    wx.request({
      url: 'https://www.njwuqi.com/joinCourse',
      method: 'POST',
      data: {
        phone: phone,
        courseNumber:this.data.QRcourse_number
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        if (code === 0) {
          //跳转刷新页面
          wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
          wx.showToast({
            title: '加入班级成功！',
            icon: 'none',
            duration: 2000,
          });
        } else {
        
          wx.showToast({
            title: responseData.message,
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
        
        wx.showToast({
          title: '查询课程信息失败（joinCourse），请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  //在页面上显示所有我已经加入的班级
  onLoad: function () {
    this.setData({ submittedData: [] });
    const openid = wx.getStorageSync('openid');
  
    wx.request({
      url: 'https://www.njwuqi.com/queryUserinfo',
      method: 'POST',
      data: {
        openid: openid,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        if (code === 0) {
         
          const userinfo = responseData.userinfo;
          const phone = userinfo.phone;
          const realName=userinfo.realName;
          const userNumber=userinfo.userNumber;
          wx.setStorageSync('phone', phone); 
          wx.setStorageSync('realName', realName);
          wx.setStorageSync('userNumber', userNumber);
          this.getClassInfo();
        } else {
        
          wx.showToast({
            title: '查询个人信息失败，请重试',
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (error) => {
      
        wx.showToast({
          title: '查询个人信息失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
   
    // 调用wx.login方法获取用户的code
   
    
  },
  getClassInfo:function () {
    const phone=wx.getStorageSync('phone');
   
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取用户code成功，可以进行登录验证
          const requestData = {
            phone: phone,
          };

          // 发起POST请求
          wx.request({
            url: 'https://www.njwuqi.com/queryAllCourseByPhone',
            method: 'POST',
            data: requestData,
            header: getApp().globalData.header,
            success: (res) => {
              if (res.data && Array.isArray(res.data.courseinfos)) {
                const filteredData = res.data.courseinfos.filter(item => item.courseName && item.addressName);
                const submittedData = filteredData.map(item => ({
                  courseName: item.courseName,
                  realName: item.realName,
                  addressName: item.addressName,
                  courseNumber: item.courseNumber,
                }));
                this.setData({ submittedData });
              }  else {
                console.error('请求返回数据格式错误:', res.data);
              }
            },
            fail: (error) => {
              // 登录验证失败的处理逻辑
              console.error('登录验证失败:', error);
              wx.showToast({
                title: '登录验证失败，请重试',
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
       
        wx.showToast({
          title: '获取用户信息失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  
  //搜索框失焦触发函数
  onChange(event) {
    this.setData({
      input_value : event.detail.value,
    });
   
    this.onSearch(this.data.submittedData);
  },
  //进行查询功能，查询已经添加的班级
  onSearch(submittedData) {
    
    const { input_value } = this.data;
    
   // 如果输入为空，则不进行过滤，保留原始数据
   if (input_value.trim() === '') {
    return;
  }

  // 对submittedData数组进行过滤，保留匹配到的数据项
  const filteredData = submittedData.filter(item => item.courseName.includes(input_value));
  if (filteredData.length > 0) {
    wx.showToast({
      title: '搜索成功',
      icon: 'none',
      duration: 2000
    });
  } else {
    wx.showToast({
      title: '搜索失败，未添加该班级',
      icon: 'none',
      duration: 2000
    });
  }
  // 更新submittedData数组，显示匹配到的数据
  this.setData({ submittedData: filteredData });
},

do_Insert:function(){
  //获取用户手机号
  const phone=wx.getStorageSync('phone');
  wx.request({
    url: 'https://www.njwuqi.com/joinCourse',
    method: 'POST',
    data: {
      phone: phone,
      courseNumber:this.data.course_number,
    },
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const code = responseData.code;
      if (code === 0) {
        wx.redirectTo({ url: '/packageC/pages/sClassInfo/sClassInfo' });
          wx.showToast({
            title: '加入班级成功！',
            icon: 'none',
            duration: 2000,
          });
      } else {
       
        wx.showToast({
          title: responseData.message,
          icon: 'none',
          duration: 2000,
        });
      }
    },
    fail: (error) => {
     
      wx.showToast({
        title: '查询课程信息失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
},
onShareAppMessage() {
  return {};
},
onClick() {
  wx.navigateTo({ url: '/packageC/pages/recordState/recordState' });
},
onClick_1(event) {
  const index = event.currentTarget.dataset.index;
  const { courseNumber, courseName, addressName } = this.data.submittedData[index];
 
  wx.navigateTo({
    url: `/packageC/pages/recordState/recordState?courseNumber=${courseNumber}&courseName=${courseName}&addressName=${addressName}`,
  });
},
//点击添加按钮触发添加班级函数

onClick_3() {
  wx.redirectTo({ url: '/packageC/pages/sPersonInfo/sPersonInfo' });
},
onClick_5() {
  wx.navigateTo({ url: '/packageC/pages/sStudyInfo/sStudyInfo' });
},
onClick_4(event) {
  const index = event.currentTarget.dataset.index;
    const { courseNumber } = this.data.submittedData[index];
    
  
    wx.navigateTo({
      url: `/packageC/pages/sHistroyRecord/sHistroyRecord?courseNumber=${courseNumber}`,
    });

},

});