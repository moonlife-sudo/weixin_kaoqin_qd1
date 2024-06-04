//引入echarts.js
import * as echarts from '../../../ec-canvas/echarts';
let chart =null
let seriesData = [0, 0, 0, 0]; // 用于保存页面数据的数组
Page({
  data: {
   activeNames: ['1'],
   ec:{
     onInit:initChart
   },
   classNumber:'',
   absentInfos:[],
   lateInfos:[],
   earlyInfos:[],
   leaveInfos:[],
   refreshText: '',
  },
  onLoad() {
    const classNumber = wx.getStorageSync('classNumber');
   this.setData({
 classNumber:classNumber
  });
  this.searchClassInfo();
  },
  searchClassInfo:function () {
    let f1=0;
    let f2=0;
    let f3=0;
    let f4=0;
    const that = this;
    const classNumber = that.data.classNumber;
    var header = getApp().globalData.header; //获取app.js中的请求头
    wx.request({
      url: 'https://www.njwuqi.com/teacherRollALLCallInfo',
      method: 'POST',
      data: {
        courseNumber: classNumber
      },
      header: getApp().globalData.header,
      success: function (res) {
        if (res.data.code === 0) {
          const statisticsinfos = res.data.statisticsinfos;
          // 处理 earlyInfos 数组
          const earlyInfos = statisticsinfos.earlyInfos || [];
          const processedEarlyInfos = [];
          earlyInfos.forEach(item => {
            
            const [studentInfo, count] = item.split('#');
            const studentNumber = studentInfo.match(/\d+/)[0]; // 使用正则表达式匹配数字部分
            const studentName = studentInfo.replace(studentNumber, '').trim(); // 获取 studentName
            const processedItem = {
              studentNumber: studentNumber,
              studentName: studentName,
              count: count.trim() // 获取 count
            };
            processedEarlyInfos.push(processedItem);
            f1++;
          });
          seriesData[2] = f1;
          that.setData({
            earlyInfos: processedEarlyInfos
          });

         
       // 处理 absentInfos 数组
       const absentInfos = statisticsinfos.absentInfos || [];
       const processedAbsentInfos = [];
       absentInfos.forEach(item => {
         const [studentInfo, count] = item.split('#');
         const studentNumber = studentInfo.match(/\d+/)[0]; // 使用正则表达式匹配数字部分
         const studentName = studentInfo.replace(studentNumber, '').trim(); // 获取 studentName
         const processedItem = {
           studentNumber: studentNumber,
           studentName: studentName,
           count: count.trim() // 获取 count
         };
         processedAbsentInfos.push(processedItem);
         f2++;
       });
       seriesData[1] = f2;
       that.setData({
         absentInfos: processedAbsentInfos
       });

       // 处理 lateInfos 数组
       const lateInfos = statisticsinfos.lateInfos || [];
       const processedLateInfos = [];
       lateInfos.forEach(item => {
         const [studentInfo, count] = item.split('#');
         const studentNumber = studentInfo.match(/\d+/)[0]; // 使用正则表达式匹配数字部分
         const studentName = studentInfo.replace(studentNumber, '').trim(); // 获取 studentName
         const processedItem = {
           studentNumber: studentNumber,
           studentName: studentName,
           count: count.trim() // 获取 count
         };
         processedLateInfos.push(processedItem);
         f3++;
       });
       seriesData[0] = f3;
       that.setData({
         lateInfos: processedLateInfos
       });

       // 处理 leaveInfos 数组
       const leaveInfos = statisticsinfos.leaveInfos || [];
       const processedLeaveInfos = [];
       leaveInfos.forEach(item => {
         const [studentInfo, count] = item.split('#');
         const studentNumber = studentInfo.match(/\d+/)[0]; // 使用正则表达式匹配数字部分
         const studentName = studentInfo.replace(studentNumber, '').trim(); // 获取 studentName
         const processedItem = {
           studentNumber: studentNumber,
           studentName: studentName,
           count: count.trim() // 获取 count
         };
         processedLeaveInfos.push(processedItem);
         f4++;
       });
       seriesData[3] = f4;
       that.setData({
         leaveInfos: processedLeaveInfos
       });
                
                
              
                

        } else {
          // 处理 code 不等于 0 的情况（例如显示错误信息）
          console.error('查询失败：', res.data.message);
        }
      },
      fail: function (err) {
        // 处理请求失败的情况（例如显示错误信息）
        console.error('请求失败：', err);
      }
    });
  },
  onPullDownRefresh() {
    
    wx.redirectTo({
      url: `/packageB/pages/classStatistic/classStatistic`,
    });
       setTimeout(() => {
     
        wx.stopPullDownRefresh();
      }, 2000);
        
  },
  
  onShareAppMessage() {
    return {};
  },

  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
})


//对chart赋值
function initChart(canvas,width,height,dpr){
  chart=echarts.init(canvas,null,{
    width:width,
    height:height,
    devicePixelRatio:dpr
  })
  canvas.setChart(chart)

  let option = getOption()//echarts配置信息

  chart.setOption(option)

  return chart
}
//图表的配置信息
function getOption(){
  return {

  xAxis: {
    type: 'category',
    data: ['迟到', '旷课', '早退', '请假']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: seriesData,
      type: 'bar'
    }
  ]
  }
}
