import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Activity, CheckinRecord, Team, TeamMember, Reward, Badge, UserInfo } from '@/types';
import { activities as initialActivities } from '@/data/activities';
import { checkinRecords as initialCheckins } from '@/data/checkins';
import { teams as initialTeams } from '@/data/teams';
import { rewards as initialRewards, badges as initialBadges } from '@/data/rewards';
import { currentUser as initialUser } from '@/data/user';
import { weeklyRankings } from '@/data/rankings';

export interface ExchangeRecord {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  points: number;
  exchangeTime: string;
  status: 'pending' | 'completed';
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'activity' | 'system' | 'reward';
  activityId?: string;
  createTime: string;
  isRead: boolean;
}

interface AppState {
  activities: Activity[];
  checkins: CheckinRecord[];
  teams: Team[];
  rewards: Reward[];
  badges: Badge[];
  user: UserInfo;
  exchangeRecords: ExchangeRecord[];
  notifications: Notification[];
  invitations: { code: string; teamId: string }[];

  addActivity: (activity: Omit<Activity, 'id' | 'participants' | 'status'>) => void;
  addCheckin: (checkin: Omit<CheckinRecord, 'id' | 'likes' | 'isLiked' | 'status' | 'pace' | 'calories'>) => boolean;
  createTeam: (team: { name: string; slogan: string; avatar?: string; maxMembers: number }) => string;
  joinTeamByCode: (code: string) => { success: boolean; message: string };
  addTeamMember: (teamId: string, member: Omit<TeamMember, 'role' | 'totalDistance' | 'joinTime'>) => void;
  inviteTeammate: (teamId: string) => string;
  exchangeReward: (rewardId: string) => { success: boolean; message: string };
  pushNotification: (notification: Omit<Notification, 'id' | 'createTime' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  likeCheckin: (id: string) => void;
  exportWinners: (activityId: string) => string;
}

const STORAGE_KEY = 'sport_community_store_v1';

const loadState = (): Partial<AppState> | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('加载本地存储失败:', e);
  }
  return null;
};

const saveState = (state: Partial<AppState>) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify({
      activities: state.activities,
      checkins: state.checkins,
      teams: state.teams,
      rewards: state.rewards,
      badges: state.badges,
      user: state.user,
      exchangeRecords: state.exchangeRecords,
      notifications: state.notifications,
      invitations: state.invitations
    }));
  } catch (e) {
    console.error('保存本地存储失败:', e);
  }
};

const genId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

const persisted = loadState();

export const useAppStore = create<AppState>((set, get) => ({
  activities: persisted?.activities || initialActivities,
  checkins: persisted?.checkins || initialCheckins,
  teams: persisted?.teams || initialTeams,
  rewards: persisted?.rewards || initialRewards,
  badges: persisted?.badges || initialBadges,
  user: persisted?.user || initialUser,
  exchangeRecords: persisted?.exchangeRecords || [],
  notifications: persisted?.notifications || [],
  invitations: persisted?.invitations || [],

  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: genId('act'),
      participants: 0,
      status: new Date(activityData.startTime) > new Date() ? 'upcoming' :
              new Date(activityData.endTime) < new Date() ? 'ended' : 'ongoing'
    };
    set(state => {
      const next = { ...state, activities: [newActivity, ...state.activities] };
      saveState(next);
      return next;
    });
  },

  addCheckin: (checkinData) => {
    const { activities } = get();
    const activity = activities.find(a => a.id === checkinData.activityId);
    
    if (activity) {
      const nowDate = new Date();
      const start = new Date(activity.startTime);
      const end = new Date(activity.endTime);
      if (nowDate < start || nowDate > end) {
        Taro.showToast({ title: '不在活动允许打卡时间内', icon: 'none' });
        return false;
      }
    }

    const distance = checkinData.distance;
    const duration = checkinData.duration;
    const pace = duration > 0 && distance > 0 ? (() => {
      const pacePerKm = duration / distance;
      const m = Math.floor(pacePerKm / 60);
      const s = Math.floor(pacePerKm % 60);
      return `${m}'${s.toString().padStart(2, '0')}"`;
    })() : "0'00\"";
    const calories = Math.round(distance * 70 * 1.036);

    const newCheckin: CheckinRecord = {
      ...checkinData,
      id: genId('chk'),
      likes: 0,
      isLiked: false,
      status: 'verified',
      pace,
      calories,
      checkinTime: now()
    };

    set(state => {
      const next = { ...state, checkins: [newCheckin, ...state.checkins] };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '打卡成功！', icon: 'success' });
    return true;
  },

  createTeam: ({ name, slogan, avatar, maxMembers }) => {
    const { user } = get();
    const teamId = genId('team');
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    const newTeam: Team = {
      id: teamId,
      name,
      slogan,
      avatar: avatar || `https://picsum.photos/seed/${teamId}/200/200`,
      memberCount: 1,
      maxMembers,
      totalDistance: 0,
      rank: 0,
      leaderId: user.id,
      leaderName: user.name,
      members: [{
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: 'leader',
        totalDistance: user.totalDistance,
        joinTime: now()
      }]
    };

    set(state => {
      const next = {
        ...state,
        teams: [newTeam, ...state.teams],
        user: { ...state.user, isTeamLeader: true, teamId },
        invitations: [...state.invitations, { code: inviteCode, teamId }]
      };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '队伍创建成功！', icon: 'success' });
    return inviteCode;
  },

  joinTeamByCode: (code) => {
    const { invitations, teams, user } = get();
    const invite = invitations.find(i => i.code === code.toUpperCase());
    
    if (!invite) {
      return { success: false, message: '邀请码无效' };
    }
    
    const team = teams.find(t => t.id === invite.teamId);
    if (!team) {
      return { success: false, message: '队伍不存在' };
    }
    if (team.memberCount >= team.maxMembers) {
      return { success: false, message: '队伍人数已满' };
    }
    if (team.members.some(m => m.id === user.id)) {
      return { success: false, message: '您已加入该队伍' };
    }

    const newMember: TeamMember = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: 'member',
      totalDistance: user.totalDistance,
      joinTime: now()
    };

    set(state => {
      const nextTeams = state.teams.map(t => {
        if (t.id === team.id) {
          return {
            ...t,
            memberCount: t.memberCount + 1,
            members: [...t.members, newMember],
            totalDistance: t.totalDistance + user.totalDistance
          };
        }
        return t;
      });
      const next = {
        ...state,
        teams: nextTeams,
        user: { ...state.user, teamId: team.id }
      };
      saveState(next);
      return next;
    });
    return { success: true, message: `成功加入 ${team.name}` };
  },

  addTeamMember: (teamId, memberData) => {
    const { teams } = get();
    const team = teams.find(t => t.id === teamId);
    if (!team || team.memberCount >= team.maxMembers) {
      Taro.showToast({ title: '无法添加成员', icon: 'none' });
      return;
    }

    const newMember: TeamMember = {
      ...memberData,
      role: 'member',
      totalDistance: 0,
      joinTime: now()
    };

    set(state => {
      const next = {
        ...state,
        teams: state.teams.map(t =>
          t.id === teamId
            ? { ...t, memberCount: t.memberCount + 1, members: [...t.members, newMember] }
            : t
        )
      };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '邀请成功', icon: 'success' });
  },

  inviteTeammate: (teamId) => {
    const { invitations } = get();
    let existing = invitations.find(i => i.teamId === teamId);
    if (existing) {
      return existing.code;
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    set(state => {
      const next = { ...state, invitations: [...state.invitations, { code, teamId }] };
      saveState(next);
      return next;
    });
    return code;
  },

  exchangeReward: (rewardId) => {
    const { rewards, user } = get();
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: '奖品不存在' };
    }
    if (user.totalPoints < reward.points) {
      return { success: false, message: '积分不足' };
    }
    if (reward.stock <= 0) {
      return { success: false, message: '库存不足' };
    }

    const record: ExchangeRecord = {
      id: genId('exc'),
      rewardId,
      rewardName: reward.name,
      rewardImage: reward.image,
      points: reward.points,
      exchangeTime: now(),
      status: 'completed'
    };

    set(state => {
      const next = {
        ...state,
        rewards: state.rewards.map(r =>
          r.id === rewardId ? { ...r, stock: r.stock - 1 } : r
        ),
        user: { ...state.user, totalPoints: state.user.totalPoints - reward.points },
        exchangeRecords: [record, ...state.exchangeRecords]
      };
      saveState(next);
      return next;
    });
    return { success: true, message: '兑换成功！' };
  },

  pushNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: genId('notif'),
      createTime: now(),
      isRead: false
    };
    set(state => {
      const next = { ...state, notifications: [newNotif, ...state.notifications] };
      saveState(next);
      return next;
    });
  },

  markNotificationRead: (id) => {
    set(state => {
      const next = {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      };
      saveState(next);
      return next;
    });
  },

  likeCheckin: (id) => {
    set(state => {
      const next = {
        ...state,
        checkins: state.checkins.map(c =>
          c.id === id
            ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
            : c
        )
      };
      saveState(next);
      return next;
    });
  },

  exportWinners: (activityId) => {
    const sorted = [...weeklyRankings].sort((a, b) => b.totalDistance - a.totalDistance);
    let content = `活动获奖名单\n`;
    content += `活动ID: ${activityId}\n`;
    content += `导出时间: ${new Date().toLocaleString()}\n`;
    content += '='.repeat(50) + '\n\n';
    content += '排名\t姓名\t队伍\t总里程(km)\t打卡次数\n';
    content += '-'.repeat(50) + '\n';
    
    sorted.forEach((item, idx) => {
      content += `${idx + 1}\t${item.userName}\t${item.teamName || '-'}\t${item.totalDistance.toFixed(1)}\t${item.totalCheckins}\n`;
    });
    
    content += '\n';
    content += '='.repeat(50) + '\n';
    content += '奖励说明：\n';
    content += '第1名：金奖章 + 5000积分 + 运动装备大礼包\n';
    content += '第2-3名：银奖章 + 3000积分 + 品牌跑步鞋\n';
    content += '第4-10名：铜奖章 + 1000积分 + 运动水杯\n';
    content += '完赛奖：完赛徽章 + 500积分\n';
    
    return content;
  }
}));
