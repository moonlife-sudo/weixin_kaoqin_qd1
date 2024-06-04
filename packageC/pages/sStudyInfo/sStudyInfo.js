Page({
  data: {
    input_value: '',
    submittedData: [
    ],
    searchResult: [],
  },

  onLoad() {
    wx.request({
      url: 'https://www.njwuqi.com/getFilePaths',
      method: 'POST',
      header: getApp().globalData.header,
      success: (res) => {
       

        // 处理 res.data
        if (res.data && Array.isArray(res.data)) {
          // 遍历 res.data 中的每个 URL
          res.data.forEach(url => {
            // 使用正则表达式提取 files/ 后面的第一个单词
            const matchResult = url.match(/\/files\/([^/]+)\//);
            if (matchResult && matchResult[1]) {
              const infoName = matchResult[1];

              // 检查是否已存在于 submittedData 中
              if (!this.data.submittedData.some(item => item.infoname === infoName)) {
                // 不存在则添加到 submittedData 数组中
                this.setData({
                  submittedData: [...this.data.submittedData, { infoname: infoName ,kind:'file',image_url:'https://ide.code.fun/api/image?token=6564564d28456c0011660385&name=40931c4c6697d451d5d8595294c2c18c.png'}],
                });
              }
            }
          });
        }
      }
    });
  },


  
  OnClick_1(event) {
    const clickedInfoname = event.currentTarget.dataset.infoname;
    console.log("Clicked infoname:", clickedInfoname);
    wx.navigateTo({
      url: `/packageC/pages/sStudyInfo_2/sStudyInfo_2?infoname=${clickedInfoname}`,
    });
  
    
  },
  
  OnClick() {
    wx.showLoading({
      title: '下载中...',
      mask: true, // 设置为 true，表示loading期间遮罩层是透明的
    });

    const downloadTask = wx.downloadFile({
      url: "https://www.njwuqi.com/spring/spring03.pdf?filekey=kjaasdf3uuxdfasfdabvawew",
      timeout: 60000,
      success: (res) => {
        wx.hideLoading();
        console.log(res, "wx.downloadFile success res");
        const Path = res.tempFilePath;
        wx.openDocument({
          filePath: Path,
          showMenu: false,//右上角不显示更多按钮，让用户只能在小程序上进行预览
          success: (res) => {
            console.log('打开成功');
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'error',
          duration: 2000
        });
        console.log(err, "wx.downloadFile fail err");
      }
    });

    downloadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: '下载中 ' + res.progress + '%',
        mask: true,
      });
    });
  },

  handleInput(e) {
    this.setData({ input_value: e.detail.value });
    
  },
  Search: function () {
    const input_value = this.data.input_value;
    const submittedData = this.data.submittedData;

    // 使用 filter 方法过滤匹配项
    const searchResult = submittedData.filter((item) => {
      return item.infoname.includes(input_value);
    });

    if (searchResult.length > 0) {
      // 更新 submittedData 数组为搜索结果
      this.setData({ submittedData: searchResult });
      // 清空 searchResult 数组
      this.setData({ searchResult: [] });
      
      console.log('搜索成功：', searchResult);
      // 在这里处理搜索成功的逻辑
      wx.showToast({
        title: '搜索成功',
        icon: 'none',
        duration: 2000,
      });
    } else {
      console.log('搜索失败');
      // 在这里处理搜索失败的逻辑
      wx.showToast({
        title: '搜索失败',
        icon: 'none',
        duration: 2000,
      });
    }
  },

  bindConfirm: function (e) {
    // 当用户点击键盘上的完成按钮时触发
    this.Search();
  },

  onShareAppMessage() {
    return {};
  },
});
