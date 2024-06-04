var QRCode = require('qrcode-generator');
Page({
  data: {
    submittedData: [],
    input_value: '',
    show:false,//一开始弹出窗不显示
    show_1:false,//二维码弹出窗
    class_value:'',//添加的班级名称
    address_value:'',//添加的地点名称
    course_number:'',//用来暂存创建班级时的班级号
    qrCodeImagePath: '',
  },
  
  onLoad: function () {
    
    this.setData({ submittedData: [] });
    const openid = wx.getStorageSync('openid');
    
          this.getClassInfo();
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
                  className: item.courseName,
                  classNumber: item.courseNumber,
                  addressName: item.addressName,
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
        console.error('调用wx.login方法失败:', error);
        wx.showToast({
          title: '获取用户信息失败，请重试',
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
    this.setData({//显示弹出窗
      show:true
    })
  
  },
  onClick_1(event) {
    
    const index = event.currentTarget.dataset.index;
    const { classNumber, className, addressName } = this.data.submittedData[index];
    
    wx.redirectTo({
      url: `/packageC/pages/modifyClassInfo/modifyClassInfo?classNumber=${classNumber}&className=${className}&addressName=${addressName}`,
    });
  },
  // ... 其他微信小程序代码和函数
  onClick_2(event) {
    const index = event.currentTarget.dataset.index;
    const { classNumber } = this.data.submittedData[index];
    wx.setStorageSync('classNumber',classNumber);
    wx.navigateTo({
      url: `/packageB/pages/classStatistic/classStatistic`,
    });
},

  onChange(event) {
    this.setData({
      input_value : event.detail.value,
    });
   
    this.onSearch(this.data.submittedData);
  },
  onSearch(submittedData) {
    
    const { input_value } = this.data;
    
   // 如果输入为空，则不进行过滤，保留原始数据
   if (input_value.trim() === '') {
    return;
  }

  // 对submittedData数组进行过滤，保留匹配到的数据项
  const filteredData = submittedData.filter(item => item.className.includes(input_value));
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
//创建班级弹出窗：
onConfirm(){
  //发布班级
  
  
  this.Insert_class( (code) => {
    if (code === 0) {
      this.setData({
        show:false,
      })
    }
    else {
      this.setData({
        show:true,
      })
    }
})
},
getQR_code: function () {
  var qrCodeData = this.data.course_number;
  var qrcode = QRCode(0, 'H');
  qrcode.addData(qrCodeData);
  qrcode.make();

  var context = wx.createCanvasContext('qrcodeCanvas');
  var cells = qrcode.getModuleCount();
  var cellSize = 6; // 设置每个方块的大小

  // 将生成的二维码绘制到画布上
  for (var row = 0; row < cells; row++) {
    for (var col = 0; col < cells; col++) {
      if (qrcode.isDark(row, col)) {
        context.setFillStyle('#000000');
      } else {
        context.setFillStyle('#ffffff');
      }
      var x = col * cellSize;
      var y = row * cellSize;
      context.fillRect(x, y, cellSize, cellSize);
    }
  }

  context.draw(false, () => {
    // 将画布内容导出成图片，并将图片路径保存到 page data 中，用于页面展示
    wx.canvasToTempFilePath({
      canvasId: 'qrcodeCanvas',
      success: (res) => {
        this.setData({
          qrCodeImagePath: res.tempFilePath,
        });
      },
    });
  });
},

Insert_class:function(callback){
  const openid = wx.getStorageSync('openid');
  wx.login({
    success: (res) => {
      if (res.code) {
        // 获取用户code成功，可以进行登陆验证,传输数据
        const requestData = {
          courseName:this.data.class_value,
          addressName:this.data.address_value,
          openid:openid,
        };

        // 发起POST请求
        wx.request({
          url: 'https://www.njwuqi.com/createCourse',
          method: 'POST',
          data: requestData,
          header: getApp().globalData.header,
          success: (res) => {
            // 登陆验证成功的处理逻辑
            const responseData = res.data;
            const code = responseData.code;
            
            const courseNumber = responseData.courseNumber.toString();
            const message = responseData.message;
            if (typeof callback === 'function') {
              callback(code);
            }
            if (code===0) {
              // 登陆成功
              //先关闭第一个容器
              this.setData({
                show:false,
                course_number:courseNumber,
                show_1:true
              })

              wx.showToast({
                title: '正在生成班级二维码，请耐心等待!',
                icon: 'none',
                duration: 2000,
              });
  
              //生成二维码
              this.getQR_code();
            } else {
              // 登陆失败，根据返回的message进行相应的处理
              wx.showToast({
                title: message,
                icon: 'none',
                duration: 2000,
              });
            }
          
          },
          fail: (error) => {
            // 登陆验证失败的处理逻辑
            console.error('创建班级失败:', error);
            wx.showToast({
              title: '创建班级失败，请重试',
              icon: 'none',
              duration: 2000,
            });
           
          }
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
//关闭弹出窗
onCancel(){
  this.setData({
    show:false
  })
 
},

//输入课程名称
onBlur(event){
  this.setData({
    class_value: event.detail.value,
  });
  
},
//输入教师姓名
onBlur_1(event){
  this.setData({
    address_value: event.detail.value,
  });

},
//下面是二维码的弹出窗
onCancel_1(){
  this.setData({
    show_1:false
  })
},
onConfirm_1(){
  this.setData({
    show_1:false
  })
  wx.redirectTo({ url: '/packageC/pages/tClass/tClass' });
},
onClick_2_1() {
  wx.redirectTo({ url: '/packageC/pages/tPersonInfo/tPersonInfo' });
},
});



















