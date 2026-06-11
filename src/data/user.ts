import type { UserInfo, Badge } from '@/types';
import { badges } from './rewards';

export const currentUser: UserInfo = {
  id: 'u1',
  name: '张小明',
  avatar: 'https://picsum.photos/id/64/200/200',
  totalDistance: 156.3,
  totalCheckins: 28,
  totalPoints: 3680,
  level: 5,
  badges: badges.filter(b => b.obtainDate),
  isAdmin: true,
  isTeamLeader: true,
  teamId: 't1'
};

export const getCurrentUser = (): UserInfo => {
  return currentUser;
};

export const getMyBadges = (): Badge[] => {
  return currentUser.badges;
};
