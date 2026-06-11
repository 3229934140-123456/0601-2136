import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { TeamMember } from '@/types';
import { formatDate } from '@/utils';

const goalOptions = [50, 100, 150, 200, 300, 500];

const TeamPage: React.FC = () => {
  const { teams, user, inviteTeammate, simulateInviteJoin, setTeamWeeklyGoal } = useAppStore();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(100);

  const myTeam = user.teamId ? teams.find(t => t.id === user.teamId) : undefined;

  const handleInvite = async () => {
    if (!myTeam) return;
    const code = inviteTeammate(myTeam.id);
    
    Taro.showModal({
      title: '邀请好友加入',
      content: `邀请码：${code}\n\n点"模拟加入"可立即看到成员加入效果\n队伍：${myTeam.name}（当前${myTeam.memberCount}人）`,
      showCancel: true,
      cancelText: '模拟加入',
      confirmText: '复制邀请码',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: code,
            success: () => Taro.showToast({ title: '已复制邀请码', icon: 'success' })
          });
        } else if (res.cancel) {
          const newMember = simulateInviteJoin(myTeam.id);
          if (newMember) {
            setTimeout(() => {
              const more = Math.random() > 0.5;
              if (more) simulateInviteJoin(myTeam.id);
            }, 1200);
          }
        }
      }
    });
  };

  const handleTeamManage = () => {
    if (!myTeam) return;
    const memberNames = myTeam.members.map((m, i) =>
      `${i + 1}. ${m.name}${m.role === 'leader' ? '（队长）' : m.id === user.id ? '（我）' : ''} - ${m.totalDistance.toFixed(1)}km`
    ).join('\n');
    Taro.showModal({
      title: `${myTeam.name} - 队伍管理`,
      content: `队伍口号：${myTeam.slogan}\n成员（共${myTeam.memberCount}/${myTeam.maxMembers}人）：\n${memberNames}\n\n总里程：${myTeam.totalDistance.toFixed(1)}km`,
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handleCreateTeam = () => {
    Taro.navigateTo({ url: '/pages/team-create/index' });
  };

  const handleJoinTeam = () => {
    Taro.navigateTo({ url: '/pages/team-join/index' });
  };

  const handleSetGoal = () => {
    if (!myTeam) return;
    const res = setTeamWeeklyGoal(myTeam.id, newGoal);
    if (res.success) {
      Taro.showToast({ title: res.message, icon: 'success' });
      setShowGoalModal(false);
    } else {
      Taro.showToast({ title: res.message, icon: 'none' });
    }
  };

  const sortedRanking = [...teams].sort((a, b) => b.totalDistance - a.totalDistance);

  if (!myTeam) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的队伍</Text>
          </View>
          <View style={{ textAlign: 'center', padding: '80rpx 0', background: '#fff', borderRadius: '16rpx' }}>
            <Text style={{ fontSize: '128rpx' }}>👥</Text>
            <Text style={{ display: 'block', marginTop: '24rpx', color: '#86909c', fontSize: '32rpx' }}>
              还没有加入任何队伍
            </Text>
            <Text style={{ display: 'block', marginTop: '12rpx', fontSize: '24rpx', color: '#c9cdd4' }}>
              创建或加入队伍，一起跑步更有动力！
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>热门队伍</Text>
            <Text className={styles.sectionMore}>查看全部</Text>
          </View>
          <View className={styles.rankingList}>
            {sortedRanking.map((team, index) => (
              <View key={team.id} className={styles.rankingItem}>
                <Text className={classnames(styles.rankNum, index < 3 && styles[`top${index + 1}`])}>
                  {index + 1}
                </Text>
                <Image className={styles.rankingAvatar} src={team.avatar} mode="aspectFill" />
                <View className={styles.rankingInfo}>
                  <Text className={styles.rankingName}>{team.name}</Text>
                  <Text className={styles.rankingMembers}>
                    {team.memberCount}人 · 队长 {team.leaderName}
                  </Text>
                </View>
                <Text className={styles.rankingDistance}>{team.totalDistance.toFixed(1)}km</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.bottomBar}>
          <Button className={styles.createButton} onClick={handleCreateTeam}>
            创建队伍
          </Button>
          <Button className={styles.joinButton} onClick={handleJoinTeam}>
            加入队伍
          </Button>
        </View>
      </ScrollView>
    );
  }

  const sortedMembers = [...myTeam.members].sort((a, b) => b.totalDistance - a.totalDistance);
  const myRank = sortedMembers.findIndex(m => m.id === user.id) + 1;
  const weeklyGoal = myTeam.weeklyGoal || 0;
  const weeklyProgress = myTeam.weeklyProgress || 0;
  const weeklyPercent = weeklyGoal > 0 ? Math.min(100, (weeklyProgress / weeklyGoal) * 100) : 0;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.myTeamCard}>
        <View className={styles.teamHeader}>
          <Image className={styles.teamAvatar} src={myTeam.avatar} mode="aspectFill" />
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{myTeam.name}</Text>
            <Text className={styles.teamSlogan}>{myTeam.slogan}</Text>
          </View>
          <View className={styles.teamRank}>
            No.{sortedRanking.findIndex(t => t.id === myTeam.id) + 1 || myTeam.rank}
          </View>
        </View>

        <View className={styles.teamStats}>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>{myTeam.memberCount}/{myTeam.maxMembers}</Text>
            <Text className={styles.teamStatLabel}>成员数</Text>
          </View>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>{myTeam.totalDistance.toFixed(1)}</Text>
            <Text className={styles.teamStatLabel}>总里程(km)</Text>
          </View>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>#{myRank}</Text>
            <Text className={styles.teamStatLabel}>我的排名</Text>
          </View>
        </View>

        <View className={styles.teamActions}>
          <Button className={styles.actionButton} onClick={handleTeamManage}>
            队伍管理
          </Button>
          <Button className={classnames(styles.actionButton, styles.primary)} onClick={handleInvite}>
            邀请队友
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>本周目标</Text>
          {user.isTeamLeader && user.teamId === myTeam.id && (
            <Text className={styles.setGoalBtn} onClick={() => setShowGoalModal(true)}>
              {weeklyGoal > 0 ? '修改目标' : '设置目标'}
            </Text>
          )}
        </View>
        {weeklyGoal > 0 ? (
          <View className={styles.goalCard}>
            <View className={styles.goalHeader}>
              <Text className={styles.goalTitle}>团队目标：{weeklyGoal} km</Text>
              <Text className={styles.goalPercent}>{weeklyPercent.toFixed(0)}%</Text>
            </View>
            <View className={styles.goalBar}>
              <View className={styles.goalFill} style={{ width: `${weeklyPercent}%` }} />
            </View>
            <View className={styles.goalInfo}>
              <Text className={styles.goalProgress}>已完成：{weeklyProgress.toFixed(1)} km</Text>
              <Text className={styles.goalRemaining}>还差：{Math.max(0, (weeklyGoal - weeklyProgress)).toFixed(1)} km</Text>
            </View>
          </View>
        ) : (
          <View className={styles.noGoalCard}>
            <Text style={{ fontSize: '48rpx' }}>🎯</Text>
            <Text className={styles.noGoalText}>
              {user.isTeamLeader ? '队长还未设置本周目标' : '队长还未设置本周目标，一起期待吧！'}
            </Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>队员贡献榜</Text>
          <Text className={styles.sectionMore}>全部{myTeam.memberCount}人</Text>
        </View>
        <View className={styles.membersList}>
          {sortedMembers.map((member: TeamMember, index) => {
            const contribution = myTeam.totalDistance > 0
              ? ((member.totalDistance / myTeam.totalDistance) * 100).toFixed(1)
              : '0.0';
            return (
              <View
                key={member.id}
                className={classnames(styles.memberItem, member.id === user.id && styles.mine)}
              >
                <Text className={styles.memberRankBadge}>#{index + 1}</Text>
                <Image className={styles.memberAvatar} src={member.avatar} mode="aspectFill" />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>
                    {member.name}
                    {member.id === user.id && <Text className={styles.roleBadge}>我</Text>}
                    {member.role === 'leader' && <Text className={styles.leaderBadge}>队长</Text>}
                  </Text>
                  <Text className={styles.memberDistance}>
                    {member.totalDistance.toFixed(1)}km · 贡献 {contribution}% · 加入于 {formatDate(member.joinTime)}
                  </Text>
                </View>
                <View className={styles.memberRight}>
                  {index === 0 && <Text className={styles.topBadge}>🥇</Text>}
                  {index === 1 && <Text className={styles.topBadge}>🥈</Text>}
                  {index === 2 && <Text className={styles.topBadge}>🥉</Text>}
                  {index > 2 && <Text className={styles.contributionPill}>{contribution}%</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>队伍排行榜</Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>
        <View className={styles.rankingList}>
          {sortedRanking.slice(0, 5).map((team, index) => (
            <View
              key={team.id}
              className={classnames(styles.rankingItem, team.id === myTeam.id && styles.myTeamRank)}
            >
              <Text className={classnames(styles.rankNum, index < 3 && styles[`top${index + 1}`])}>
                {index + 1}
              </Text>
              <Image className={styles.rankingAvatar} src={team.avatar} mode="aspectFill" />
              <View className={styles.rankingInfo}>
                <Text className={styles.rankingName}>{team.name}</Text>
                <Text className={styles.rankingMembers}>
                  {team.memberCount}人 · 队长 {team.leaderName}
                  {team.id === myTeam.id && '（我的队伍）'}
                </Text>
              </View>
              <Text className={styles.rankingDistance}>{team.totalDistance.toFixed(1)}km</Text>
            </View>
          ))}
        </View>
      </View>

      {showGoalModal && (
        <View className={styles.modalOverlay} onClick={() => setShowGoalModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>设置本周团队目标</Text>
            <Text className={styles.modalSubtitle}>选择本周大家一起挑战的目标里程</Text>

            <View className={styles.goalOptions}>
              {goalOptions.map(goal => (
                <View
                  key={goal}
                  className={classnames(styles.goalOption, newGoal === goal && styles.selected)}
                  onClick={() => setNewGoal(goal)}
                >
                  {goal} km
                </View>
              ))}
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelBtn} onClick={() => setShowGoalModal(false)}>取消</Button>
              <Button className={styles.confirmBtnModal} onClick={handleSetGoal}>确认设置</Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default TeamPage;
