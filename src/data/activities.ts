import type { Activity } from '@/types';

export const activities: Activity[] = [
  {
    id: '1',
    title: '社区春季跑步挑战赛',
    description: '春暖花开，一起来跑步吧！完成挑战即可获得精美徽章和丰厚奖品。',
    coverImage: 'https://picsum.photos/id/1018/750/400',
    type: 'individual',
    targetDistance: 50,
    startTime: '2026-06-01',
    endTime: '2026-06-30',
    participants: 256,
    maxParticipants: 500,
    status: 'ongoing',
    reward: '完赛徽章 + 运动手环',
    relatedRewardId: 'r1',
    rewardImage: 'https://picsum.photos/id/1/300/300',
    rules: [
      '活动期间累计跑步里程达到50公里即为完赛',
      '每天最多记录1次跑步，单次跑步不少于1公里',
      '跑步记录需上传运动APP截图',
      '严禁作弊，一经发现取消资格'
    ],
    sponsor: '社区体育中心'
  },
  {
    id: '2',
    title: '团队接力马拉松',
    description: '组队挑战，共同完成42.195公里接力赛，团队协作，共享荣誉！',
    coverImage: 'https://picsum.photos/id/1015/750/400',
    type: 'team',
    targetDistance: 42.195,
    startTime: '2026-06-10',
    endTime: '2026-07-10',
    participants: 128,
    maxParticipants: 200,
    status: 'ongoing',
    reward: '团队奖杯 + 定制T恤',
    relatedRewardId: 'r3',
    rewardImage: 'https://picsum.photos/id/119/300/300',
    rules: [
      '每队5-10人，共同完成42.195公里',
      '每人至少贡献1公里',
      '团队总里程达标即为完赛',
      '队长负责组织和审核'
    ],
    sponsor: '运动品牌旗舰店'
  },
  {
    id: '3',
    title: '7天连续打卡挑战',
    description: '坚持7天每天跑步打卡，养成运动好习惯，赢取积分奖励！',
    coverImage: 'https://picsum.photos/id/1039/750/400',
    type: 'individual',
    targetDistance: 14,
    startTime: '2026-06-15',
    endTime: '2026-06-21',
    participants: 389,
    maxParticipants: 1000,
    status: 'upcoming',
    reward: '500积分 + 坚持徽章',
    relatedRewardId: 'r5',
    rewardImage: 'https://picsum.photos/id/8/300/300',
    rules: [
      '连续7天每天跑步不少于2公里',
      '中断一天挑战失败',
      '每天打卡时间为6:00-22:00',
      '完赛即可获得全部奖励'
    ]
  },
  {
    id: '4',
    title: '夜跑荧光派对',
    description: '夏夜荧光夜跑，点亮城市夜景，和邻居们一起享受跑步的快乐！',
    coverImage: 'https://picsum.photos/id/1044/750/400',
    type: 'individual',
    targetDistance: 5,
    startTime: '2026-06-20',
    endTime: '2026-06-20',
    participants: 156,
    maxParticipants: 300,
    status: 'upcoming',
    reward: '荧光装备 + 补给包',
    rules: [
      '线下活动，现场签到',
      '全程5公里，不竞速',
      '穿着荧光装备参加',
      '活动后有抽奖环节'
    ],
    sponsor: '社区居委会'
  },
  {
    id: '5',
    title: '月度百公里达人',
    description: '挑战月度百公里，成为社区跑步达人，展示你的实力！',
    coverImage: 'https://picsum.photos/id/1036/750/400',
    type: 'individual',
    targetDistance: 100,
    startTime: '2026-06-01',
    endTime: '2026-06-30',
    participants: 68,
    maxParticipants: 200,
    status: 'ongoing',
    reward: '百公里达人徽章 + 运动背包',
    relatedRewardId: 'r2',
    rewardImage: 'https://picsum.photos/id/2/300/300',
    rules: [
      '本月累计跑步里程达到100公里',
      '不限次数，累计计算',
      '单次跑步不少于3公里',
      '前10名额外奖励'
    ]
  },
  {
    id: '6',
    title: '亲子趣味跑',
    description: '带上孩子一起跑步，增进亲子关系，享受运动乐趣！',
    coverImage: 'https://picsum.photos/id/1025/750/400',
    type: 'team',
    targetDistance: 3,
    startTime: '2026-06-25',
    endTime: '2026-06-25',
    participants: 89,
    maxParticipants: 150,
    status: 'ended',
    reward: '亲子奖牌 + 小礼品',
    relatedRewardId: 'r4',
    rewardImage: 'https://picsum.photos/id/6/300/300',
    rules: [
      '家长陪同孩子参加',
      '全程3公里趣味跑',
      '沿途有游戏打卡点',
      '所有完成者都有奖牌'
    ],
    sponsor: '亲子教育中心'
  },
  {
    id: '7',
    title: '健康跑公益活动',
    description: '每跑1公里捐赠1元，用脚步传递爱心，为公益事业助力！',
    coverImage: 'https://picsum.photos/id/100/750/400',
    type: 'individual',
    targetDistance: 100,
    startTime: '2026-05-01',
    endTime: '2026-05-31',
    participants: 520,
    maxParticipants: 1000,
    status: 'ended',
    reward: '公益徽章 + 捐赠证书',
    relatedRewardId: 'r6',
    rewardImage: 'https://picsum.photos/id/3/300/300',
    rules: [
      '活动期间累计跑步里程',
      '每公里企业捐赠1元',
      '所有参与者获得公益证书',
      '捐赠金额实时公示'
    ],
    sponsor: '爱心企业联盟'
  },
  {
    id: '8',
    title: '夏日清凉跑',
    description: '夏日炎炎，清凉开跑！沿途补给站提供冰水和水果。',
    coverImage: 'https://picsum.photos/id/103/750/400',
    type: 'individual',
    targetDistance: 10,
    startTime: '2026-07-01',
    endTime: '2026-07-31',
    participants: 0,
    maxParticipants: 500,
    status: 'upcoming',
    reward: '清凉礼包 + 积分奖励',
    rules: [
      '建议早晚时段跑步',
      '注意补水，量力而行',
      '累计10公里获得奖励',
      '可多次打卡累计'
    ]
  }
];

export const getActivityById = (id: string): Activity | undefined => {
  return activities.find(item => item.id === id);
};

export const getOngoingActivities = (): Activity[] => {
  return activities.filter(item => item.status === 'ongoing');
};

export const getUpcomingActivities = (): Activity[] => {
  return activities.filter(item => item.status === 'upcoming');
};

export const getEndedActivities = (): Activity[] => {
  return activities.filter(item => item.status === 'ended');
};
