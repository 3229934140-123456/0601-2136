export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  type: 'individual' | 'team';
  targetDistance: number;
  startTime: string;
  endTime: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'ended';
  reward: string;
  rules: string[];
  sponsor?: string;
  relatedRewardId?: string;
  rewardImage?: string;
}

export interface CheckinRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  activityId: string;
  activityTitle: string;
  distance: number;
  duration: number;
  pace: string;
  calories: number;
  checkinTime: string;
  status: 'verified' | 'pending' | 'rejected';
  image?: string;
  comment?: string;
  likes: number;
  isLiked: boolean;
}

export interface RankingItem {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalDistance: number;
  totalCheckins: number;
  teamName?: string;
  change: number;
}

export interface Team {
  id: string;
  name: string;
  slogan: string;
  avatar: string;
  members: TeamMember[];
  memberCount: number;
  maxMembers: number;
  totalDistance: number;
  rank: number;
  leaderId: string;
  leaderName: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member';
  totalDistance: number;
  joinTime: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  points: number;
  stock: number;
  category: 'badge' | 'prize' | 'coupon';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: 'bronze' | 'silver' | 'gold' | 'diamond';
  obtainDate: string;
  condition: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  totalDistance: number;
  totalCheckins: number;
  totalPoints: number;
  level: number;
  badges: Badge[];
  isAdmin: boolean;
  isTeamLeader: boolean;
  teamId?: string;
}

export interface ActivityStats {
  totalParticipants: number;
  totalDistance: number;
  totalCheckins: number;
  avgDistance: number;
  completionRate: number;
  dailyData: { date: string; count: number; distance: number }[];
}

export interface SponsorMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  sponsor: string;
  status: 'available' | 'distributed' | 'reserved';
}
