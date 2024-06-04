const app = getApp();

Page({
  data: {
    submittedData: [],
     value: '',
     search_value:'',
     course_Number:'',
  },
 
  // 接收从recordpublish页面传递过来的数据
  onLoad: function () {
    this.setData({ submittedData: [] });
    //首先获取openid
    const openid = wx.getStorageSync('openid');
    
    //根据openid发送请求获取手机号
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
          // 将 getClassInfo() 调用放在这里，放在 wx.setStorageSync 成功的回调中
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
  
    
    
  },
  //根据手机号查班号
  getClassInfo: function () {
    const phone = wx.getStorageSync('phone');
 
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
              const responseData = res.data;
              const code = responseData.code;
              if (code === 0) {
                const courseinfos = responseData.courseinfos;
                if (courseinfos && courseinfos.length > 0) {
                  // 遍历每个课程信息，调用getRuleInfo获取规则信息
                  courseinfos.forEach((courseinfo) => {
                    const courseNumber = courseinfo.courseNumber;
                    const courseName = courseinfo.courseName;

                    this.getRuleInfo(courseNumber, courseName);
                  });
                }
              } 
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
// 定义一个函数用于获取规则信息并保存到submittedData数组中
getRuleInfo: function (courseNumber, courseName) {

  const requestData = {
    courseNumber: courseNumber,
  };
  
  wx.request({
    url: 'https://www.njwuqi.com/getAllRuleinfoByCourseNumber',
    method: 'POST',
    data: requestData,
    header: getApp().globalData.header,
    success: (res) => {
      const responseData = res.data;
      const code = responseData.code;
      
      if (code === 0) {
        const ruleinfos = responseData.ruleinfos;
        
        if (ruleinfos && ruleinfos.length > 0) {
          // 获取第一组规则信息
          const firstRuleInfo = ruleinfos[0];
          
          // 提取startTime和finalTime
          const startTime = firstRuleInfo.startTime;
          const finalTime = firstRuleInfo.finalTime;
          const ruleNumber=firstRuleInfo.ruleNumber;
          // 保存数据到submittedData数组
          const submittedData = this.data.submittedData;
          submittedData.push({ className: courseName, startTime: startTime, finalTime: finalTime,classNumber:courseNumber,ruleNumber:ruleNumber });
          this.setData({ submittedData: submittedData });
        } 
        
      } 
    },
   
  });
},

  onShareAppMessage() {
    return {};
  },
  onClick(event) {
    const index = event.currentTarget.dataset.index;
    const {  className,startTime,finalTime,classNumber,ruleNumber} = this.data.submittedData[index];
    wx.setStorageSync('className',className);
    wx.setStorageSync('startTime',startTime);
    wx.setStorageSync('finalTime',finalTime);
    wx.setStorageSync('classNumber',classNumber);
    wx.setStorageSync('ruleNumber',ruleNumber);
  
    wx.navigateTo({
      url: `/packageA/pages/recordInfo/recordInfo`,
    });
  },
  onClick_1() {
    wx.redirectTo({ url: '/packageC/pages/tPersonInfo/tPersonInfo' });
  },
  onClick_2() {
    wx.navigateTo({ url: '/packageC/pages/recordPublish/recordPublish' });
  },

    onChange(event) {
      this.setData({
        search_value:event.detail.value
      })
      
      //根据本地的手机号，查询与搜索名称相等的班级班号
      this.getCourseInfo();
      
    },
    getCourseInfo: function () {
      const phone = wx.getStorageSync('phone');
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
          if (code === 0) {
            const courseinfos_1 = responseData.courseinfos;
          
            // 使用 .filter() 方法来进行模糊查询
            const matchedCourses = courseinfos_1.filter(course => course.courseName.includes(this.data.search_value));
          
            if (matchedCourses.length > 0) {
              // 如果有匹配项，可以选择第一个匹配项继续后续处理
              const selectedCourse = matchedCourses[0];
              const courseNumber = selectedCourse.courseNumber;
              const courseName = selectedCourse.courseName;
              // 遍历
              this.getRuleInfo_1(courseNumber, courseName);
            } else {
              // 如果没有匹配项，根据业务需求进行处理
            }
          }
          else {
            
          }
        },
        fail: (error) => {
          console.error('请求失败:', error);
        },
      });
    },
    getRuleInfo_1: function (courseNumber, courseName) {
      const requestData = {
        courseNumber: courseNumber,
      };
      
      wx.request({
        url: 'https://www.njwuqi.com/getAllRuleinfoByCourseNumber',
        method: 'POST',
        data: requestData,
        header: getApp().globalData.header,
        success: (res) => {
          const responseData = res.data;
          const code = responseData.code;
          
          if (code === 0) {
            const ruleinfos = responseData.ruleinfos;
        if (ruleinfos && ruleinfos.length > 0) {
          // 保存数据到submittedData数组
          const submittedData = [];
          wx.showToast({
            title: '搜索成功',
            icon: 'none',
            duration: 2000
          });
          // 遍历所有规则信息并存储到数组
          for (const ruleInfo of ruleinfos) {
            const startTime = ruleInfo.startTime;
            
            const finalTime = ruleInfo.finalTime;
           const ruleNumber=ruleInfo.ruleNumber;

            submittedData.push({ className: courseName, startTime: startTime, finalTime: finalTime,classNumber:courseNumber,ruleNumber:ruleNumber });
            this.setData({ submittedData: submittedData });
          }
              this.setData({ submittedData: submittedData });
             
            } else {
              console.error('未查询到规则信息');
            }
          } else {
            console.error('请求返回数据格式错误:', res.data);
          }
        },
        fail: (error) => {
          console.error('获取规则信息失败:', error);
          wx.showToast({
            title: '获取规则信息失败，请重试',
            icon: 'none',
            duration: 2000,
          });
        },
      });
    },
});