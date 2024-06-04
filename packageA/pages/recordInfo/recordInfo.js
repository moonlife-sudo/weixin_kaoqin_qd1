//引入echarts.js
import * as echarts from '../../../ec-canvas/echarts';
let chart = null
const moment = require('moment');
let seriesData = [0, 0, 0, 0]; // 用于保存页面数据的数组
Page({
  data: {
    ec: {
      onInit: initChart
    },
    show: false,
    minDate: new Date().getTime(),
    maxDate: new Date().getTime() + 365 * 24 * 60 * 60 * 1000,
    selectedTime: '',
    startTime: '',
    endTime: '',
    selectedType: '', // 新增的字段，用于标识选择的时间类型
    classNumber: '', //接收传过来的数据
    className: '',
    start_time: '',
    final_time: '',
    ruleNumber: '',
    rule: '', //默认为：HH:mm格式
    submittedData: [],
    attendanceRate: '', //出勤率
    show1: false,
    student_phone: '', //学生手机号
    realName: '', //学生的姓名
    totalNumber: '',
    startNotCallNumber: '', //上课未打卡人数
    endNotCallNumber: '', //下课未打卡人数

  },
  onLoad: function () {
    // options对象包含传递过来的参数，获取并设置到data中
    const classNumber = wx.getStorageSync('classNumber');
    const className = wx.getStorageSync('className');
    const start_time = wx.getStorageSync('startTime');
    const final_time = wx.getStorageSync('finalTime');
    const ruleNumber = wx.getStorageSync('ruleNumber');
    //进行模式匹配
    const startTimeParts = start_time.match(/\d{2}:\d{2}/);
    const finalTimeParts = final_time.match(/\d{2}:\d{2}/);

    const rule = `${startTimeParts[0]}-${finalTimeParts[0]}`;

    this.setData({
      classNumber: classNumber,
      className: className,
      start_time: startTimeParts,
      final_time: finalTimeParts,
      rule: rule,
      ruleNumber: ruleNumber,

    });

    //根据classNumber课程号查询打卡统计
    this.searchRuleInfo();

  },
  searchRuleInfo: function () {

    // 从 rule 中提取开始时间和结束时间
    const ruleMatch = this.data.rule.match(/\d{2}:\d{2}/g);
    const ruleStartTime = ruleMatch[0];
    const ruleEndTime = ruleMatch[1];

    // 发送请求
    const requestData = {
      courseNumber: this.data.classNumber,
      ruleNumber: this.data.ruleNumber,
    };
    wx.request({
      url: 'https://www.njwuqi.com/teacherRollCallInfoByRuleNumber',
      method: 'POST',
      data: requestData,
      header: getApp().globalData.header,
      success: (res) => {
        const responseData = res.data;
        console.log(responseData);
        const code = responseData.code;
        if (code === 0) {
          // 当前正在考勤时间段内
          if (responseData.statisticsinfoNowDisplays.length == 1) {
            const data = responseData.statisticsinfoNowDisplays[0];
            const startNotCallNumber = data.startNotCallNumber.toString(); // 将 startNotCallNumber 转换为字符串
            const endNotCallNumber = data.endNotCallNumber.toString(); // 将 endNotCallNumber 转换为字符串
            this.setData({
              totalNumber: data.totalNumber,
              startNotCallNumber: `上课未打卡人数: ${startNotCallNumber}`, // 使用字符串模板来拼 接字符串
              endNotCallNumber: `下课未打卡人数: ${endNotCallNumber}`, // 使用字符串模板来拼接字符串
            });
            //更新图表
            seriesData[0] = data.absentNumber;
            seriesData[1] = data.lateNumber;
            seriesData[2] = data.earlyNumber;
            seriesData[3] = data.leaveNumber;
            // 访问并处理早到、请假、迟到、缺勤数据
            const earlyInfos = data.earlyInfos;
            const leaveInfos = data.leaveInfos;
            const lateInfos = data.lateInfos;
            const absentInfos = data.absentInfos;
            const startNotCallInfos = data.startNotCallInfos;
            const endNotCallInfos = data.endNotCallInfos;
            if (earlyInfos !== "") {
              const earlyData = earlyInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < earlyData.length; i++) {
                const info = earlyData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const earlyNumbers = info[1]; // 数字部分
                  const earlyNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: earlyNumbers,
                    student_Name: earlyNames,
                    student_State: '早退',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理请假数据
            if (leaveInfos !== "") {
              const leaveData = leaveInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < leaveData.length; i++) {
                const info = leaveData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const leaveNumbers = info[1]; // 数字部分
                  const leaveNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: leaveNumbers,
                    student_Name: leaveNames,
                    student_State: '请假',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理迟到数据
            if (lateInfos !== "") {
              const lateData = lateInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < lateData.length; i++) {
                const info = lateData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const lateNumbers = info[1]; // 数字部分
                  const lateNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: lateNumbers,
                    student_Name: lateNames,
                    student_State: '迟到',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理旷课数据
            if (absentInfos !== "") {
              const absentData = absentInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < absentData.length; i++) {
                const info = absentData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const absentNumbers = info[1]; // 数字部分
                  const absentNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: absentNumbers,
                    student_Name: absentNames,
                    student_State: '旷课',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理上课未打卡数据
            if (startNotCallInfos !== "") {
              const startNotCallData = startNotCallInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < startNotCallData.length; i++) {
                const info = startNotCallData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const startNotCallNumbers = info[1]; // 数字部分
                  const startNotCallNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: startNotCallNumbers,
                    student_Name: startNotCallNames,
                    student_State: '上课未打卡',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
          } else if (responseData.statisticsinfoDisplays.length == 1) {
            // 当前考勤已经超过打卡时间，成为历史记录
            const data = responseData.statisticsinfoDisplays[0];
            this.setData({
              totalNumber: data.totalNumber,
            });
            //更新图表
            seriesData[0] = data.absentNumber;
            seriesData[1] = data.lateNumber;
            seriesData[2] = data.earlyNumber;
            seriesData[3] = data.leaveNumber;

            // 访问并处理早到、请假、迟到、缺勤数据
            const earlyInfos = data.earlyInfos;
            const leaveInfos = data.leaveInfos;
            const lateInfos = data.lateInfos;
            const absentInfos = data.absentInfos;
            if (earlyInfos !== "") {
              const earlyData = earlyInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < earlyData.length; i++) {
                const info = earlyData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const earlyNumbers = info[1]; // 数字部分
                  const earlyNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: earlyNumbers,
                    student_Name: earlyNames,
                    student_State: '早退',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理请假数据
            if (leaveInfos !== "") {
              const leaveData = leaveInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < leaveData.length; i++) {
                const info = leaveData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const leaveNumbers = info[1]; // 数字部分
                  const leaveNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: leaveNumbers,
                    student_Name: leaveNames,
                    student_State: '请假',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理迟到数据
            if (lateInfos !== "") {
              const lateData = lateInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < lateData.length; i++) {
                const info = lateData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const lateNumbers = info[1]; // 数字部分
                  const lateNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: lateNumbers,
                    student_Name: lateNames,
                    student_State: '迟到',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
            // 处理旷课数据
            if (absentInfos !== "") {
              const absentData = absentInfos.split("#");
              const submittedData = this.data.submittedData; // 先获取已有的数据，避免覆盖
              for (let i = 0; i < absentData.length; i++) {
                const info = absentData[i].match(/(\d+)([^\d]+)/);
                if (info) {
                  const absentNumbers = info[1]; // 数字部分
                  const absentNames = info[2]; // 非数字部分
                  // 将每组数据添加到 submittedData 数组中
                  submittedData.push({
                    student_Number: absentNumbers,
                    student_Name: absentNames,
                    student_State: '旷课',
                  });
                }
              }
              // 更新 data 中的 submittedData 数组
              this.setData({
                submittedData: submittedData,
              });
            }
          } else {
            seriesData[0] = 0;
            seriesData[1] = 0;
            seriesData[2] = 0;
            seriesData[3] = 0;
          }
          setTimeout((data0,data1,data2,data3)=>{
            chart.clear();
            let option = getOption(); // echarts 配置信息
            option.series[0].data[0] = data0;
            option.series[0].data[1] = data1;
            option.series[0].data[2] = data2;
            option.series[0].data[3] = data3;
            chart.setOption(option);
          },500,seriesData[0],seriesData[1],seriesData[2],seriesData[3])
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000,
          });
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
  modify_state(event) {
    const itemIndex = event.currentTarget.dataset.index; // 获取触发事件的 item 索引
    const currentItem = this.data.submittedData[itemIndex]; // 获取当前 item 对象
    const currentStudentName = currentItem.student_Name.toString(); // 获取当前 item 的 student_Name 值
    if (currentItem.student_State !== '请假') {
      // 将当前 item 的 student_Name 值赋值给 realName
      this.setData({
        show_1: true,
        realName: currentStudentName,
      });

    } else {
      wx.showToast({
        title: '已经修改过，无法再修改！',
        icon: 'none',
        duration: 2000,
      });
    }
  },
  onClose_3() {
    this.setData({
      show_1: false,
    });
  },

  onConfirm_3() {
    this.setData({
      show_1: false,
    });
    //首先根据班级号进行学生查询，然后找到匹配到的学生，将学生手机号赋值给student_phone
    this.searchStudentName();
    //获取到学生手机号后，将学生的考勤状态更改为 请假leave

  },
  searchStudentName: function () {

    const classNumber = this.data.classNumber; // 获取页面中的classNumber
    // 发送POST请求
    wx.request({
      url: 'https://www.njwuqi.com/queryAllStudentByCourseid',
      method: 'POST',
      data: {
        courseNumber: classNumber, // 将classNumber作为参数传递
      },
      header: getApp().globalData.header,

      success: (res) => {
        const responseData = res.data;

        if (responseData.code === 0) {
          // 当code为0时，表示查询班级学生成功
          const userinfos = responseData.userinfos;

          // 遍历userinfos数组，查找匹配的realName
          for (let i = 0; i < userinfos.length; i++) {
            const userInfo = userinfos[i];

            if (userInfo.realName === this.data.realName) {

              // 找到匹配的realName，将phone赋值给页面data中的student_phone
              this.setData({
                student_phone: userInfo.phone,
              });

              this.modify_student_state();
              // 可以选择在此处添加其他处理逻辑，或者直接跳出循环，因为已经找到匹配的realName了
              break;
            }
          }
        } else {
          // 处理其他code值的情况，根据实际需求进行操作

        }
      },
      fail: (error) => {
        // 处理请求失败的情况
        console.log('请求失败:', error);
      },
    });
  },
  modify_student_state: function () {
    // 发送POST请求

    const requestData = {
      courseNumber: this.data.classNumber,
      phone: this.data.student_phone,
      ruleNumber: this.data.ruleNumber,
    };
    wx.request({
      url: 'https://www.njwuqi.com/teacherUpdateStudentLeave',
      method: 'POST',
      data: requestData,

      header: getApp().globalData.header,

      success: (res) => {
        const responseData = res.data;

        if (responseData.code === 0) {
          wx.showToast({
            title: '修改成功！请下拉刷新后才能在统计图表中显示',
            icon: 'none',
            duration: 2000,
          });
        } else {
          // 处理其他code值的情况，根据实际需求进行操作
          wx.showToast({
            title: responseData.message,
            icon: 'none',
            duration: 2000,
          });

        }
      },
      fail: (error) => {
        // 处理请求失败的情况

      },
    });
  },
  onImageClick(event) {
    const type = event.currentTarget.dataset.type;
    this.setData({
      show: true,
      selectedType: type,
    });
  },

  onClose() {
    this.setData({
      show: false,
    });
  },

  onTimeConfirm(event) {

    const formattedTime = moment(event.detail).format('MM/DD HH:mm');

    const {
      selectedType
    } = this.data;


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

  onPullDownRefresh() {

    wx.redirectTo({
      url: `/packageA/pages/recordInfo/recordInfo`,
    });
    setTimeout(() => {

      wx.stopPullDownRefresh();
    }, 2000);

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

});
// 对 chart 赋值
function initChart(canvas, width, height, dpr) {
  console.log(new Date());
  console.log("initChart");
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);
  seriesData = [0, 0, 0, 0];
  // this.setData({
  //   submittedData: [],
  // });
  let option = getOption(); // echarts 配置信息

  chart.setOption(option);

  return chart;
}

// 图表的配置信息
function getOption() {
  return {
    xAxis: {
      type: 'category',
      data: ['旷课', '迟到', '早退', '请假']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: seriesData, // 使用保存的数据数组
      type: 'bar'
    }]
  };
}