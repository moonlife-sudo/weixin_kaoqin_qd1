const { relativeTimeThreshold } = require("moment");

Page({
  data: { checked: true,//默认按钮打开
          show:false,
          type:'',//班级状态
          list_1HGZ42fr: [
           
          ],
          classNumber: '',
          className: '',
          addressName: '',
          student_name1:'',
          student_number1:'',
          phone1:'',
          input_value:'',
         totalNumber:'',
        },
//接收传过来的参数
        onLoad: function (options) {
          // options对象包含传递过来的参数，获取并设置到data中
          const classNumber = options.classNumber;
         
          const className = options.className;
          
          const addressName = options.addressName;
      
          this.setData({
            classNumber: classNumber,
            className: className,
            addressName: addressName,
          });
         //获取班级状态
         this.getClassState();
        
        //查找该班级所有学生，并显示出来
        this.Search_studentInfo();
        },
        Search_studentInfo:function () {
          let f1=0;
          const classNumber = this.data.classNumber; // 从data中获取classNumber
    var header = getApp().globalData.header; //获取app.js中的请求头
    wx.request({
      url: 'https://www.njwuqi.com/queryAllStudentByCourseid',
      method: 'POST',
      data: {
        courseNumber: classNumber,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const result = res.data;
        if (result.code === 0) {
          const userinfos = result.userinfos;
          const updatedList = [];

          // 遍历userinfos并更新list_1HGZ42fr
          for (let i = 0; i < userinfos.length; i++) {
            const userInfo = userinfos[i];
            const { realName, userNumber, phone } = userInfo;
            updatedList.push({
              student_name: realName,
              student_number: userNumber,
              phone: phone,
            });
            f1++;
          }
          
          // 更新data中的list_1HGZ42fr数组
          this.setData({
            list_1HGZ42fr: updatedList,
            totalNumber:f1,
          });
         
        }else {
          // 处理查询失败的情况（例如显示错误消息）
          
        }
      },
      fail: function (err) {
        // 处理请求失败（例如显示错误消息）
        
      },
    });
        },
        getClassState:function(){
          wx.request({
            url: 'https://www.njwuqi.com/isCloseAddStudentByid',
            method: 'POST',
            data: {
              courseNumber: this.data.classNumber,
            },
            header: getApp().globalData.header,
            success: (res) => {
              const responseData = res.data;
              const code = responseData.code;

              if (code === 0) {
               
                this.setData({
                  
                  checked:false,
                });
              } else {
                
                this.setData({
                  
                  checked:true,
                });
              }
            },
            fail: (error) => {
              
              wx.showToast({
                title: '失败，请重试！',
                icon: 'none',
                duration: 2000,
              });
            },
          });
          
        },
  
  onShareAppMessage() {
    return {};
  },
  onSwitchChange_lfk({detail}) {
    this.setData({
      checked: detail
    });
  
    
    if(this.data.checked===true){
      this.openInsertClass();
    }

    //关闭学生添加班级功能
    if(this.data.checked===false){
      this.closeInsertClass();
    }
  },
  openInsertClass:function () {
    wx.request({
      url: 'https://www.njwuqi.com/openAddStudentByid',
      method: 'POST',
      data: {
        courseNumber: this.data.classNumber,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        if (code === 0) {
          wx.showToast({
            title: '打开加入班级成功！',
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
          title: '失败，请重试！',
          icon: 'none',
          duration: 2000,
        });
      },
    });
    
  },
  closeInsertClass:function(){
    wx.request({
      url: 'https://www.njwuqi.com/closeAddStudentByid',
      method: 'POST',
      data: {
        courseNumber: this.data.classNumber,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        const code = responseData.code;
        if (code === 0) {
          wx.showToast({
            title: '关闭加入班级成功！',
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
          title: '失败，请重试！',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  
    
  },
  onClick() {
    
    wx.redirectTo({ url: '/packageC/pages/tClass/tClass' });
  },
  onClick_ck: function (e) {
    const i = e.currentTarget.dataset.index;
    const student_name = this.data.list_1HGZ42fr[i].student_name;
    const student_number = this.data.list_1HGZ42fr[i].student_number;
    const phone = this.data.list_1HGZ42fr[i].phone;
      this.setData({
        show: true,
        student_name1:student_name,
         student_number1:student_number,
         phone1:phone,
      })

  },
  onClose() {
    this.setData({ 
      show: false 
    });
  },
  showDialog: function(e) {
    const i = e.currentTarget.dataset.index; // 获取当前项的索引
    
    wx.showModal({
      title: '提示',
      content: '是否确定将该学生移出班级？',
      cancelText: '取消',
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确认按钮
         
          //删除学生信息
         this.delateStudent_Info(i);
        } else if (res.cancel) {
          
          
          // 在这里可以添加取消按钮被点击后的逻辑处理
        }
      }
    })
  },
  delateStudent_Info: function (i) {
   
    const phone = this.data.list_1HGZ42fr[i].phone; // 假设`i`是`wx:for`循环中当前项的索引
    const classNumber = this.data.classNumber;
  
  

    // 发送 POST 请求
    wx.request({
      url: 'https://www.njwuqi.com/deleteStudentFromCourse',
      method: 'POST',
      data: {
        courseNumber: classNumber,
        phone: phone,
      },
      header: getApp().globalData.header,
      success: (res) => {
        const result = res.data;
        if (result.code === 0) {
          // 删除学生成功
          wx.showToast({
            title: '删除学生成功!',
            icon: 'none',
            duration: 2000,
          });
          
          // 更新 list_1HGZ42fr 数组，从中删除该学生
          const updatedList = this.data.list_1HGZ42fr.slice();
          updatedList.splice(i,1);

          // 更新 data 中的 list_1HGZ42fr 数组
          this.setData({
            list_1HGZ42fr: updatedList,
          });
        } else {
          // 处理删除失败的情况
          
          wx.showToast({
            title: '删除学生失败',
            icon: 'none',
            duration: 2000,
          });
        }
      },
      fail: (err) => {
        // 处理请求失败的情况
       
        wx.showToast({
          title: '删除学生失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  onChange(event){
   
    this.setData({
      input_value: event.detail.value,
    });
   
    const classNumber = this.data.classNumber; // 获取班级号
    

    // 发送 POST 请求
   // 发送 POST 请求
wx.request({
  url: 'https://www.njwuqi.com/queryAllStudentByCourseid',
  method: 'POST',
  data: {
    courseNumber: classNumber,
  },
  header: getApp().globalData.header,
  success: (res) => {
    const result = res.data;
    if (result.code === 0) {
      // 查询成功
      const userinfos = result.userinfos;

      // 使用 filter 方法进行模糊匹配
      const filteredUsers = userinfos.filter((user) => user.realName.includes(this.data.input_value));
      if (filteredUsers.length > 0) {
        const updatedList = filteredUsers.map((user) => {
          return {
            phone: user.phone,
            student_name: user.realName,
            student_number: user.userNumber,
          };
        });
        this.setData({
          list_1HGZ42fr: [],
        });
        // 更新 data 中的 list_1HGZ42fr 数组
        this.setData({
          list_1HGZ42fr: updatedList,
        });
        wx.showToast({
          title: '查询成功！',
          icon: 'none',
          duration: 2000,
        });
      } else {
        // 若没有找到匹配项，清空 list_1HGZ42fr 数组
        this.setData({
          list_1HGZ42fr: [],
        });
      }
    } else {
      // 处理查询失败的情况
      console.log('查询班级学生失败:', result.message);
      wx.showToast({
        title: '查询班级学生失败',
        icon: 'none',
        duration: 2000,
      });
    }
  },
  fail: (err) => {
    // 处理请求失败的情况
    console.error('查询班级学生失败:', err);
    wx.showToast({
      title: '查询班级学生失败',
      icon: 'none',
      duration: 2000,
    });
  },
});

  }
});