Page({
  data: {
    input_value: '',
    submittedData: [
    ],
    searchResult: [],
  },

  onLoad(options) {
    // options 中包含从上一个页面传递过来的参数
    const clickedInfoname = options.infoname;
    
    // 清零 submittedData 数组
    this.setData({
      submittedData: [],
    });
  
    // 发送请求获取参数数组，例如：
    wx.request({
      url: 'https://www.njwuqi.com/getFilePaths',
      method: 'POST',
      header: getApp().globalData.header,
      success: (res) => {
        if (res.data && Array.isArray(res.data)) {
          // 遍历返回的参数数组
          res.data.forEach(paramUrl => {
            // 使用正则表达式提取 infoname 后面的值
            const matchResult = paramUrl.match(new RegExp(`/${clickedInfoname}(?:([^?]+))`));
            if (matchResult && matchResult[1]) {
              const paramName = matchResult[1].substring(1);
             // 使用 '.' 分隔字符串，取第二部分作为后缀
             const suffix = paramName.split('.')[1];

             // 定义 flag 和 image_url
             let flag = "";
             let image_url = "";
 
             // 根据后缀设定 flag 和 image_url
             if (suffix === "pdf") {
               flag = "pdf";
               image_url = "../../../images/ppd.png";
             } else if (suffix === "docx") {
               flag = "word";
               image_url = "../../../images/word.png";
             } else {
               flag = "other";
               image_url = "../../../images/ppt.png";
             }
              this.setData({
                submittedData: [...this.data.submittedData, { infoname: paramName, kind: 'file', image_url: image_url,clickedInfoname:clickedInfoname }],
              });
            }
          });
        }
      }
    });
  },


  
 
  
  OnClick(event) {
  
    const clickedItem = event.currentTarget.dataset.item;
    const infoname = clickedItem.infoname;
    const clickedInfoname=clickedItem.clickedInfoname;
    wx.showLoading({
      title: '下载中...',
      mask: true, // 设置为 true，表示loading期间遮罩层是透明的
    });

    const downloadTask = wx.downloadFile({
      url: "https://www.njwuqi.com/files/"+clickedInfoname+'/'+infoname+"?filekey=kjaasdf3uuxdfasfdabvawew",
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
