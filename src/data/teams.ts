import type { Team, TeamMember } from '@/types';

export const teams: Team[] = [
  {
    id: 't1',
    name: '疾风跑团',
    slogan: '疾风般的速度，钢铁般的意志',
    avatar: 'https://picsum.photos/id/1018/200/200',
    memberCount: 25,
    maxMembers: 30,
    totalDistance: 685.5,
    rank: 1,
    leaderId: 'u2',
    leaderName: '李大力',
    members: [
      {
        id: 'u2',
        name: '李大力',
        avatar: 'https://picsum.photos/id/91/200/200',
        role: 'leader',
        totalDistance: 220.5,
        joinTime: '2026-01-15'
      },
      {
        id: 'u5',
        name: '刘芳',
        avatar: 'https://picsum.photos/id/1027/200/200',
        role: 'member',
        totalDistance: 185.2,
        joinTime: '2026-02-01'
      },
      {
        id: 'u9',
        name: '孙磊',
        avatar: 'https://picsum.photos/id/91/200/200',
        role: 'member',
        totalDistance: 120.8,
        joinTime: '2026-02-15'
      },
      {
        id: 'u11',
        name: '林小雨',
        avatar: 'https://picsum.photos/id/177/200/200',
        role: 'member',
        totalDistance: 98.5,
        joinTime: '2026-03-01'
      },
      {
        id: 'u12',
        name: '高峰',
        avatar: 'https://picsum.photos/id/338/200/200',
        role: 'member',
        totalDistance: 60.5,
        joinTime: '2026-04-01'
      }
    ]
  },
  {
    id: 't2',
    name: '追风少年队',
    slogan: '追逐风的脚步，永远年轻',
    avatar: 'https://picsum.photos/id/1015/200/200',
    memberCount: 18,
    maxMembers: 25,
    totalDistance: 568.2,
    rank: 2,
    leaderId: 'u8',
    leaderName: '吴刚',
    members: [
      {
        id: 'u8',
        name: '吴刚',
        avatar: 'https://picsum.photos/id/91/200/200',
        role: 'leader',
        totalDistance: 256.8,
        joinTime: '2026-01-20'
      },
      {
        id: 'u4',
        name: '赵强',
        avatar: 'https://picsum.photos/id/338/200/200',
        role: 'member',
        totalDistance: 128.5,
        joinTime: '2026-02-10'
      },
      {
        id: 'u13',
        name: '黄涛',
        avatar: 'https://picsum.photos/id/1025/200/200',
        role: 'member',
        totalDistance: 95.2,
        joinTime: '2026-03-05'
      },
      {
        id: 'u14',
        name: '徐静',
        avatar: 'https://picsum.photos/id/64/200/200',
        role: 'member',
        totalDistance: 87.7,
        joinTime: '2026-03-20'
      }
    ]
  },
  {
    id: 't3',
    name: '阳光跑团',
    slogan: '阳光运动，健康生活',
    avatar: 'https://picsum.photos/id/1039/200/200',
    memberCount: 32,
    maxMembers: 50,
    totalDistance: 485.8,
    rank: 3,
    leaderId: 'u1',
    leaderName: '张小明',
    members: [
      {
        id: 'u1',
        name: '张小明',
        avatar: 'https://picsum.photos/id/64/200/200',
        role: 'leader',
        totalDistance: 156.3,
        joinTime: '2026-01-10'
      },
      {
        id: 'u6',
        name: '陈军',
        avatar: 'https://picsum.photos/id/1025/200/200',
        role: 'member',
        totalDistance: 115.0,
        joinTime: '2026-02-05'
      },
      {
        id: 'u10',
        name: '杨雪',
        avatar: 'https://picsum.photos/id/177/200/200',
        role: 'member',
        totalDistance: 89.5,
        joinTime: '2026-02-20'
      },
      {
        id: 'u15',
        name: '马明',
        avatar: 'https://picsum.photos/id/91/200/200',
        role: 'member',
        totalDistance: 65.0,
        joinTime: '2026-03-10'
      },
      {
        id: 'u16',
        name: '朱丽',
        avatar: 'https://picsum.photos/id/1027/200/200',
        role: 'member',
        totalDistance: 60.0,
        joinTime: '2026-04-01'
      }
    ]
  },
  {
    id: 't4',
    name: '快乐奔跑队',
    slogan: '快乐奔跑，跑出精彩',
    avatar: 'https://picsum.photos/id/1044/200/200',
    memberCount: 15,
    maxMembers: 20,
    totalDistance: 396.3,
    rank: 4,
    leaderId: 'u3',
    leaderName: '王美丽',
    members: [
      {
        id: 'u3',
        name: '王美丽',
        avatar: 'https://picsum.photos/id/177/200/200',
        role: 'leader',
        totalDistance: 142.0,
        joinTime: '2026-01-25'
      },
      {
        id: 'u7',
        name: '周婷',
        avatar: 'https://picsum.photos/id/64/200/200',
        role: 'member',
        totalDistance: 98.6,
        joinTime: '2026-02-15'
      },
      {
        id: 'u17',
        name: '胡亮',
        avatar: 'https://picsum.photos/id/338/200/200',
        role: 'member',
        totalDistance: 78.5,
        joinTime: '2026-03-01'
      },
      {
        id: 'u18',
        name: '郭静',
        avatar: 'https://picsum.photos/id/177/200/200',
        role: 'member',
        totalDistance: 77.2,
        joinTime: '2026-03-15'
      }
    ]
  },
  {
    id: 't5',
    name: '晨跑先锋队',
    slogan: '一日之计在于晨，晨跑开启美好一天',
    avatar: 'https://picsum.photos/id/1036/200/200',
    memberCount: 20,
    maxMembers: 30,
    totalDistance: 325.6,
    rank: 5,
    leaderId: 'u19',
    leaderName: '何伟',
    members: [
      {
        id: 'u19',
        name: '何伟',
        avatar: 'https://picsum.photos/id/91/200/200',
        role: 'leader',
        totalDistance: 105.0,
        joinTime: '2026-02-01'
      },
      {
        id: 'u20',
        name: '罗敏',
        avatar: 'https://picsum.photos/id/1027/200/200',
        role: 'member',
        totalDistance: 85.2,
        joinTime: '2026-02-10'
      },
      {
        id: 'u21',
        name: '梁宇',
        avatar: 'https://picsum.photos/id/1025/200/200',
        role: 'member',
        totalDistance: 72.8,
        joinTime: '2026-02-20'
      }
    ]
  }
];

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(item => item.id === id);
};

export const getMyTeam = (): Team | undefined => {
  return teams[0];
};
