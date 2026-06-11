export default defineAppConfig({
  pages: [
    'pages/activity/index',
    'pages/checkin/index',
    'pages/ranking/index',
    'pages/team/index',
    'pages/mine/index',
    'pages/activity-detail/index',
    'pages/reward/index',
    'pages/admin/index',
    'pages/activity-result/index',
    'pages/admin-create/index',
    'pages/checkin-form/index',
    'pages/team-create/index',
    'pages/team-join/index',
    'pages/notifications/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '智慧体育社区',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f7f8fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff6b35',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/activity/index',
        text: '活动'
      },
      {
        pagePath: 'pages/checkin/index',
        text: '打卡'
      },
      {
        pagePath: 'pages/ranking/index',
        text: '排行'
      },
      {
        pagePath: 'pages/team/index',
        text: '队伍'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
