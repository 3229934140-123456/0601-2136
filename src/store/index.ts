import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Activity, CheckinRecord, Team, TeamMember, Reward, Badge, UserInfo, ActivitySummary } from '@/types';
import { activities as initialActivities } from '@/data/activities';
import { checkinRecords as initialCheckins } from '@/data/checkins';
import { teams as initialTeams } from '@/data/teams';
import { rewards as initialRewards, badges as initialBadges } from '@/data/rewards';
import { currentUser as initialUser } from '@/data/user';
import { weeklyRankings } from '@/data/rankings';

export interface ExchangeRecord {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  points: number;
  exchangeTime: string;
  status: 'pending' | 'completed';
  category: 'badge' | 'prize' | 'coupon';
  pickupMethod?: 'delivery' | 'selfpickup';
  deliveryAddress?: string;
  pickupStore?: string;
  confirmedAt?: string;
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

const mockAvatars = [
  'https://picsum.photos/seed/mem1/200/200',
  'https://picsum.photos/seed/mem2/200/200',
  'https://picsum.photos/seed/mem3/200/200',
  'https://picsum.photos/seed/mem4/200/200',
  'https://picsum.photos/seed/mem5/200/200',
  'https://picsum.photos/seed/mem6/200/200'
];
const mockNames = ['王小雅', '李大伟', '刘浩然', '陈美丽', '赵俊杰', '孙雨萱', '周子轩', '吴梦琪', '郑皓轩', '钱诗涵'];

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
  userSignedUpActivities: string[];
  exchangeFilter: 'all' | 'completed' | 'pending' | 'prize' | 'coupon' | 'badge';
  claimedActivityRewards: string[];

  addActivity: (activity: Omit<Activity, 'id' | 'participants' | 'status'>) => void;
  addCheckin: (checkin: Omit<CheckinRecord, 'id' | 'likes' | 'isLiked' | 'status' | 'pace' | 'calories' | 'checkinTime'>) => boolean;
  createTeam: (team: { name: string; slogan: string; avatar?: string; maxMembers: number }) => string;
  joinTeamByCode: (code: string) => { success: boolean; message: string };
  addTeamMember: (teamId: string, member: Omit<TeamMember, 'role' | 'totalDistance' | 'joinTime'>) => void;
  inviteTeammate: (teamId: string) => string;
  simulateInviteJoin: (teamId: string) => TeamMember | null;
  exchangeReward: (rewardId: string) => { success: boolean; message: string };
  claimActivityReward: (activityId: string) => { success: boolean; message: string };
  pushNotification: (notification: Omit<Notification, 'id' | 'createTime' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  clearExchangeRecords: () => void;
  setExchangeFilter: (filter: AppState['exchangeFilter']) => void;
  likeCheckin: (id: string) => void;
  exportWinners: (activityId: string) => string;
  signupActivity: (activityId: string) => { success: boolean; message: string };
  validateAndFixData: () => void;
  confirmExchange: (recordId: string, pickupMethod: 'delivery' | 'selfpickup', address?: string, store?: string) => { success: boolean; message: string };
  setTeamWeeklyGoal: (teamId: string, goal: number) => { success: boolean; message: string };
  getActivitySummaries: () => ActivitySummary[];
  handleReportedCheckin: (checkinId: string, action: 'approve' | 'reject') => { success: boolean; message: string };
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
      invitations: state.invitations,
      userSignedUpActivities: state.userSignedUpActivities,
      exchangeFilter: state.exchangeFilter,
      claimedActivityRewards: state.claimedActivityRewards
    }));
  } catch (e) {
    console.error('保存本地存储失败:', e);
  }
};

const validateAndFixData = (state: Partial<AppState>): Partial<AppState> => {
  const s = { ...state };
  if (!s.teams || !s.user) return s;

  const user = s.user;
  if (user.teamId) {
    const team = s.teams.find(t => t.id === user.teamId);
    if (team) {
      const isMember = team.members.some(m => m.id === user.id);
      if (!isMember) {
        const selfMember: TeamMember = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.isTeamLeader ? 'leader' : 'member',
          totalDistance: user.totalDistance,
          joinTime: new Date().toISOString()
        };
        s.teams = s.teams.map(t => {
          if (t.id === user.teamId) {
            const newMembers = [...t.members, selfMember];
            return {
              ...t,
              members: newMembers,
              memberCount: newMembers.length,
              totalDistance: Number(newMembers.reduce((sum, m) => sum + m.totalDistance, 0).toFixed(1))
            };
          }
          return t;
        });
      }

      const actualLeader = team.leaderId;
      if (user.isTeamLeader && actualLeader !== user.id) {
        s.teams = s.teams.map(t => t.id === user.teamId
          ? { ...t, leaderId: user.id, leaderName: user.name }
          : t
        );
      }

      if (!user.isTeamLeader && actualLeader === user.id) {
        s.user = { ...user, isTeamLeader: true };
      }
    } else {
      s.user = { ...user, teamId: undefined, isTeamLeader: false };
    }
  }

  s.teams = s.teams.map(t => ({
    ...t,
    memberCount: t.members.length,
    totalDistance: Number(t.members.reduce((sum, m) => sum + m.totalDistance, 0).toFixed(1))
  }));

  return s;
};

const genId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();
const randomName = () => mockNames[Math.floor(Math.random() * mockNames.length)];
const randomAvatar = () => mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
const randomDistance = (min = 5, max = 120) => Number((min + Math.random() * (max - min)).toFixed(1));

const persisted = loadState();
const initialState = persisted ? validateAndFixData(persisted) : {};

export const useAppStore = create<AppState>((set, get) => ({
  activities: initialState.activities || initialActivities,
  checkins: initialState.checkins || initialCheckins,
  teams: initialState.teams || initialTeams,
  rewards: initialState.rewards || initialRewards,
  badges: initialState.badges || initialBadges,
  user: initialState.user || initialUser,
  exchangeRecords: initialState.exchangeRecords || [],
  notifications: initialState.notifications || [],
  invitations: initialState.invitations || [],
  userSignedUpActivities: initialState.userSignedUpActivities || [],
  exchangeFilter: initialState.exchangeFilter || 'all',
  claimedActivityRewards: initialState.claimedActivityRewards || [],

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

  signupActivity: (activityId) => {
    const { activities, userSignedUpActivities } = get();
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    if (activity.status === 'ended') return { success: false, message: '活动已结束' };
    if (userSignedUpActivities.includes(activityId)) return { success: false, message: '您已报名该活动' };
    if (activity.participants >= activity.maxParticipants) return { success: false, message: '活动人数已满' };

    set(state => {
      const next = {
        ...state,
        activities: state.activities.map(a =>
          a.id === activityId ? { ...a, participants: a.participants + 1 } : a
        ),
        userSignedUpActivities: [...state.userSignedUpActivities, activityId]
      };
      saveState(next);
      return next;
    });
    return { success: true, message: '报名成功！' };
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
      const next = {
        ...state,
        checkins: [newCheckin, ...state.checkins],
        user: {
          ...state.user,
          totalDistance: Number((state.user.totalDistance + distance).toFixed(1)),
          totalCheckins: state.user.totalCheckins + 1,
          totalPoints: state.user.totalPoints + Math.round(distance * 10)
        },
        teams: state.teams.map(t => {
          const isMember = t.members.some(m => m.id === state.user.id);
          if (!isMember) return t;
          return {
            ...t,
            totalDistance: Number((t.totalDistance + distance).toFixed(1)),
            weeklyProgress: t.weeklyGoal
              ? Number((Number((t.weeklyProgress || 0).toFixed(1)) + distance).toFixed(1))
              : t.weeklyProgress,
            members: t.members.map(m => m.id === state.user.id
              ? { ...m, totalDistance: Number((m.totalDistance + distance).toFixed(1)) }
              : m
            )
          };
        })
      };
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
      totalDistance: user.totalDistance,
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
            totalDistance: Number((t.totalDistance + user.totalDistance).toFixed(1))
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

  simulateInviteJoin: (teamId) => {
    const { teams } = get();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      Taro.showToast({ title: '队伍不存在', icon: 'none' });
      return null;
    }
    if (team.memberCount >= team.maxMembers) {
      Taro.showToast({ title: '队伍已满员', icon: 'none' });
      return null;
    }

    const dist = randomDistance(5, 80);
    const newMember: TeamMember = {
      id: genId('user'),
      name: randomName(),
      avatar: randomAvatar(),
      role: 'member',
      totalDistance: dist,
      joinTime: now()
    };

    set(state => {
      const next = {
        ...state,
        teams: state.teams.map(t =>
          t.id === teamId
            ? {
                ...t,
                memberCount: t.memberCount + 1,
                members: [...t.members, newMember],
                totalDistance: Number((t.totalDistance + dist).toFixed(1))
              }
            : t
        )
      };
      saveState(next);
      return next;
    });

    get().pushNotification({
      title: '队友加入提醒',
      content: `${newMember.name}通过您的邀请码加入了队伍「${team.name}」，欢迎新队友！`,
      type: 'activity'
    });
    Taro.showToast({ title: `${newMember.name}加入了队伍`, icon: 'success' });
    return newMember;
  },

  exchangeReward: (rewardId) => {
    const { rewards, user, pushNotification: pn } = get();
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
      userId: user.id,
      rewardId,
      rewardName: reward.name,
      rewardImage: reward.image,
      points: reward.points,
      exchangeTime: now(),
      status: reward.category === 'prize' ? 'pending' : 'completed',
      category: reward.category
    };

    const successMsg = reward.category === 'prize'
      ? '兑换成功！请填写领取方式后确认'
      : '兑换成功！';

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

    pn({
      title: '兑换成功',
      content: reward.category === 'prize'
        ? `您已成功兑换"${reward.name}"，消耗${reward.points}积分，请填写领取方式后确认领取。`
        : `您已成功兑换"${reward.name}"，消耗${reward.points}积分，可在兑换记录中查看。`,
      type: 'reward'
    });

    return { success: true, message: successMsg };
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

  markAllNotificationsRead: () => {
    set(state => {
      const next = {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '全部已读', icon: 'success' });
  },

  clearNotifications: () => {
    set(state => {
      const next = { ...state, notifications: [] };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '已清空消息', icon: 'success' });
  },

  clearExchangeRecords: () => {
    set(state => {
      const next = { ...state, exchangeRecords: [] };
      saveState(next);
      return next;
    });
    Taro.showToast({ title: '已清空兑换记录', icon: 'success' });
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
  },

  setExchangeFilter: (filter) => {
    set(state => {
      const next = { ...state, exchangeFilter: filter };
      saveState(next);
      return next;
    });
  },

  claimActivityReward: (activityId) => {
    const { activities, checkins, user, rewards, claimedActivityRewards, userSignedUpActivities, pushNotification: pn } = get();
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    if (!userSignedUpActivities.includes(activityId)) return { success: false, message: '您未报名该活动' };
    if (claimedActivityRewards.includes(activityId)) return { success: false, message: '您已领取过该活动奖励' };

    const mine = checkins.filter(c => c.activityId === activityId && c.userId === user.id && c.status !== 'rejected');
    const myDistance = mine.reduce((sum, c) => sum + c.distance, 0);
    if (myDistance < activity.targetDistance) {
      return { success: false, message: `还需完成 ${(activity.targetDistance - myDistance).toFixed(1)}km 才能领取奖励` };
    }

    let rewardRecord: ExchangeRecord | null = null;
    if (activity.relatedRewardId) {
      const reward = rewards.find(r => r.id === activity.relatedRewardId);
      if (reward && reward.stock > 0) {
        rewardRecord = {
          id: genId('exc'),
          userId: user.id,
          rewardId: reward.id,
          rewardName: reward.name,
          rewardImage: reward.image,
          points: 0,
          exchangeTime: now(),
          status: reward.category === 'prize' ? 'pending' : 'completed',
          category: reward.category
        };
      }
    }

    set(state => {
      const next = {
        ...state,
        claimedActivityRewards: [...state.claimedActivityRewards, activityId],
        user: { ...state.user, totalPoints: state.user.totalPoints + 500 },
        rewards: rewardRecord ? state.rewards.map(r =>
          r.id === activity.relatedRewardId ? { ...r, stock: r.stock - 1 } : r
        ) : state.rewards,
        exchangeRecords: rewardRecord ? [rewardRecord, ...state.exchangeRecords] : state.exchangeRecords
      };
      saveState(next);
      return next;
    });

    pn({
      title: '奖励领取成功',
      content: `恭喜您完成"${activity.title}"，获得完赛奖励：${activity.reward}，500积分已到账！`,
      type: 'reward',
      activityId
    });

    return { success: true, message: '奖励领取成功！500积分已到账' };
  },

  validateAndFixData: () => {
    set(state => {
      const fixed = validateAndFixData(state);
      saveState(fixed);
      return fixed;
    });
  },

  confirmExchange: (recordId, pickupMethod, address, storeName) => {
    const { exchangeRecords, user, pushNotification: pn } = get();
    const record = exchangeRecords.find(r => r.id === recordId);
    if (!record) return { success: false, message: '兑换记录不存在' };
    if (record.userId !== user.id) return { success: false, message: '无法确认他人的兑换记录' };
    if (record.status === 'completed') return { success: false, message: '该记录已完成领取' };

    set(state => {
      const next = {
        ...state,
        exchangeRecords: state.exchangeRecords.map(r =>
          r.id === recordId ? {
            ...r,
            status: 'completed',
            pickupMethod,
            deliveryAddress: pickupMethod === 'delivery' ? address : undefined,
            pickupStore: pickupMethod === 'selfpickup' ? storeName : undefined,
            confirmedAt: now()
          } : r
        )
      };
      saveState(next);
      return next;
    });

    pn({
      title: '领取确认成功',
      content: pickupMethod === 'delivery'
        ? `您已确认邮寄"${record.rewardName}"，地址：${address}`
        : `您已确认门店自取"${record.rewardName}"，门店：${storeName}`,
      type: 'reward'
    });

    return { success: true, message: '领取确认成功！' };
  },

  setTeamWeeklyGoal: (teamId, goal) => {
    const { teams, user, pushNotification: pn } = get();
    const team = teams.find(t => t.id === teamId);
    if (!team) return { success: false, message: '队伍不存在' };
    if (team.leaderId !== user.id) return { success: false, message: '只有队长可以设置目标' };
    if (goal <= 0) return { success: false, message: '目标必须大于0' };

    const monday = new Date();
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    set(state => {
      const next = {
        ...state,
        teams: state.teams.map(t =>
          t.id === teamId ? {
            ...t,
            weeklyGoal: goal,
            weeklyProgress: 0,
            weeklyStartDate: monday.toISOString()
          } : t
        )
      };
      saveState(next);
      return next;
    });

    pn({
      title: '本周目标已设置',
      content: `队长已设置本周团队目标：${goal} km，大家一起加油！`,
      type: 'system'
    });

    return { success: true, message: `本周目标已设置为 ${goal} km！` };
  },

  getActivitySummaries: (): ActivitySummary[] => {
    const { activities, checkins, userSignedUpActivities, claimedActivityRewards, user } = get();

    const summaries = activities.map(activity => {
      const activityCheckins = checkins.filter(c => c.activityId === activity.id && c.status !== 'rejected');
      const signups = userSignedUpActivities.filter(id => id === activity.id).length;
      const totalDistance = activityCheckins.reduce((sum, c) => sum + c.distance, 0);

      const userDistances = new Map<string, number>();
      activityCheckins.forEach(c => {
        const prev = userDistances.get(c.userId) || 0;
        userDistances.set(c.userId, prev + c.distance);
      });

      const finishCount = Array.from(userDistances.values())
        .filter(d => d >= activity.targetDistance).length;

      const rewardClaimedCount = claimedActivityRewards
        .filter(id => id === activity.id).length;

      const reportedCheckins = checkins
        .filter(c => c.activityId === activity.id && c.isReported)
        .map(c => ({
          id: c.id,
          userName: c.userName,
          distance: c.distance,
          reason: c.reportReason || ''
        }));

      return {
        activityId: activity.id,
        activityTitle: activity.title,
        signupCount: signups,
        checkinCount: activityCheckins.length,
        finishCount,
        rewardClaimedCount,
        totalDistance: Number(totalDistance.toFixed(1)),
        reportedCheckins
      };
    });

    return summaries;
  },

  handleReportedCheckin: (checkinId, action) => {
    const { checkins, user, pushNotification: pn } = get();
    if (!user.isAdmin) return { success: false, message: '只有管理员可以处理举报' };

    const checkin = checkins.find(c => c.id === checkinId);
    if (!checkin) return { success: false, message: '打卡记录不存在' };

    if (action === 'reject') {
      set(state => {
        const next = {
          ...state,
          checkins: state.checkins.map(c =>
            c.id === checkinId ? { ...c, status: 'rejected', isReported: false } : c
          ),
          user: state.user.id === checkin.userId
            ? {
                ...state.user,
                totalDistance: Number((state.user.totalDistance - checkin.distance).toFixed(1)),
                totalPoints: Math.max(0, state.user.totalPoints - Math.round(checkin.distance * 10)),
                totalCheckins: Math.max(0, state.user.totalCheckins - 1)
              }
            : state.user,
          teams: state.teams.map(t => {
            const isMember = t.members.some(m => m.id === checkin.userId);
            if (!isMember) return t;
            return {
              ...t,
              totalDistance: Number((t.totalDistance - checkin.distance).toFixed(1)),
              members: t.members.map(m => m.id === checkin.userId
                ? { ...m, totalDistance: Number((m.totalDistance - checkin.distance).toFixed(1)) }
                : m
              )
            };
          })
        };
        saveState(next);
        return next;
      });

      pn({
        title: '举报处理结果',
        content: `您的打卡记录（${checkin.distance} km）因"${checkin.reportReason || '异常'}"被驳回，里程已扣除`,
        type: 'system'
      });

      return { success: true, message: '已驳回该打卡记录，里程已扣除' };
    } else {
      set(state => {
        const next = {
          ...state,
          checkins: state.checkins.map(c =>
            c.id === checkinId ? { ...c, isReported: false } : c
          )
        };
        saveState(next);
        return next;
      });

      return { success: true, message: '已通过该打卡记录，举报标记已移除' };
    }
  }
}));
