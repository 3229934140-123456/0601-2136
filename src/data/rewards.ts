import type { Reward, Badge } from '@/types';

export const rewards: Reward[] = [
  {
    id: 'r1',
    name: '运动手环',
    description: '智能运动手环，支持心率监测、睡眠监测、运动记录',
    image: 'https://picsum.photos/id/1/300/300',
    points: 5000,
    stock: 50,
    category: 'prize'
  },
  {
    id: 'r2',
    name: '运动背包',
    description: '大容量运动背包，防水面料，多隔层设计',
    image: 'https://picsum.photos/id/2/300/300',
    points: 3000,
    stock: 100,
    category: 'prize'
  },
  {
    id: 'r3',
    name: '跑步T恤',
    description: '速干透气跑步T恤，舒适面料',
    image: 'https://picsum.photos/id/119/300/300',
    points: 1500,
    stock: 200,
    category: 'prize'
  },
  {
    id: 'r4',
    name: '运动水杯',
    description: '大容量运动水杯，食品级材质',
    image: 'https://picsum.photos/id/6/300/300',
    points: 800,
    stock: 300,
    category: 'prize'
  },
  {
    id: 'r5',
    name: '毛巾套装',
    description: '速干运动毛巾套装，柔软亲肤',
    image: 'https://picsum.photos/id/8/300/300',
    points: 500,
    stock: 500,
    category: 'prize'
  },
  {
    id: 'r6',
    name: '星巴克咖啡券',
    description: '中杯咖啡兑换券，全国门店通用',
    image: 'https://picsum.photos/id/3/300/300',
    points: 600,
    stock: 200,
    category: 'coupon'
  },
  {
    id: 'r7',
    name: '超市购物卡',
    description: '100元超市购物卡，多门店可用',
    image: 'https://picsum.photos/id/9/300/300',
    points: 2000,
    stock: 100,
    category: 'coupon'
  }
];

export const badges: Badge[] = [
  {
    id: 'b1',
    name: '初跑者',
    description: '完成第一次跑步打卡',
    icon: '🏃',
    level: 'bronze',
    obtainDate: '2026-04-01',
    condition: '完成1次跑步打卡'
  },
  {
    id: 'b2',
    name: '坚持达人',
    description: '连续7天跑步打卡',
    icon: '💪',
    level: 'bronze',
    obtainDate: '2026-04-15',
    condition: '连续7天打卡'
  },
  {
    id: 'b3',
    name: '5公里达人',
    description: '单次跑步达到5公里',
    icon: '🎯',
    level: 'silver',
    obtainDate: '2026-05-01',
    condition: '单次跑步5公里以上'
  },
  {
    id: 'b4',
    name: '月度百次',
    description: '月累计跑步100公里',
    icon: '🏆',
    level: 'gold',
    obtainDate: '2026-05-31',
    condition: '月累计跑步100公里'
  },
  {
    id: 'b5',
    name: '团队之星',
    description: '作为团队成员获得团队第一名',
    icon: '⭐',
    level: 'gold',
    obtainDate: '2026-05-20',
    condition: '团队第一名'
  },
  {
    id: 'b6',
    name: '公益使者',
    description: '参与公益跑步活动',
    icon: '❤️',
    level: 'silver',
    obtainDate: '2026-05-10',
    condition: '参与公益活动'
  },
  {
    id: 'b7',
    name: '半马勇士',
    description: '完成半程马拉松距离',
    icon: '🥇',
    level: 'diamond',
    obtainDate: '',
    condition: '单次跑步21.0975公里'
  },
  {
    id: 'b8',
    name: '全马英雄',
    description: '完成全程马拉松距离',
    icon: '👑',
    level: 'diamond',
    obtainDate: '',
    condition: '单次跑步42.195公里'
  }
];

export const getBadgesByLevel = (level: string): Badge[] => {
  return badges.filter(badge => badge.level === level);
};

export const getObtainedBadges = (): Badge[] => {
  return badges.filter(badge => badge.obtainDate);
};
