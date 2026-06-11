import React from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { TeamMember } from '@/types';
import { formatDate } from '@/utils';

const TeamPage: React.FC = () => {
  const { teams, user, inviteTeammate } = useAppStore();

  const myTeam = user.teamId ? teams.find(t => t.id === user.teamId) : undefined;

  const handleInvite = () => {
    if (!myTeam) return;
    const code = inviteTeammate(myTeam.id);
    Taro.showModal({
      title: '邀请好友加入',
      content: `邀请码：${code}\n\n发送邀请码给好友，好友在"加入队伍"页面输入即可加入\n队伍：${myTeam.name}`,
      showCancel: true,
      cancelText: '知道了',
      confirmText: '复制邀请码',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: code,
            success: () => Taro.showToast({ title: '已复制', icon: 'success' })
          });
        }
      }
    });
  };

  const handleTeamManage = () => {
    if (!myTeam) return;
    const memberNames = myTeam.members.map((m, i) =>
      `${i + 1}. ${m.name}${m.role === 'leader' ? '（队长）' : ''} - ${m.totalDistance.toFixed(1)}km`
    ).join('\n');
    Taro.showModal({
      title: `${myTeam.name} - 队伍管理`,
      content: `队伍成员（共${myTeam.memberCount}人）：\n${memberNames}\n\n点击"邀请队友"可获取邀请码`,
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

  const sortedRanking = [...teams].sort((a, b) => b.totalDistance - a.totalDistance);

  if (!myTeam) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的队伍</Text>
          </View>
          <View style={{ textAlign: 'center', padding: '80rpx 0', background: '#fff', borderRadius: '16rpx' }}>
            <Text style={{ fontSize: '64rpx' }}>👥</Text>
            <Text style={{ display: 'block', marginTop: '24rpx', color: '#86909c' }}>还没有加入任何队伍</Text>
            <Text style={{ display: 'block', marginTop: '12rpx', fontSize: '24rpx', color: '#c9cdd4' }}>创建或加入队伍，一起跑步更有动力！</Text>
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
                  <Text className={styles.rankingMembers}>{team.memberCount}人 · 队长{team.leaderName}</Text>
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

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.myTeamCard}>
        <View className={styles.teamHeader}>
          <Image className={styles.teamAvatar} src={myTeam.avatar} mode="aspectFill" />
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{myTeam.name}</Text>
            <Text className={styles.teamSlogan}>{myTeam.slogan}</Text>
          </View>
          <View className={styles.teamRank}>No.{sortedRanking.findIndex(t => t.id === myTeam.id) + 1 || myTeam.rank}</View>
        </View>

        <View className={styles.teamStats}>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>{myTeam.memberCount}</Text>
            <Text className={styles.teamStatLabel}>成员数</Text>
          </View>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>{myTeam.totalDistance.toFixed(1)}</Text>
            <Text className={styles.teamStatLabel}>总里程(km)</Text>
          </View>
          <View className={styles.teamStatItem}>
            <Text className={styles.teamStatValue}>Lv.{user.level}</Text>
            <Text className={styles.teamStatLabel}>队伍等级</Text>
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
          <Text className={styles.sectionTitle}>队员排行</Text>
          <Text className={styles.sectionMore}>全部{myTeam.memberCount}人</Text>
        </View>
        <View className={styles.membersList}>
          {sortedMembers.slice(0, 5).map((member: TeamMember, index) => (
            <View key={member.id} className={styles.memberItem}>
              <Image className={styles.memberAvatar} src={member.avatar} mode="aspectFill" />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>
                  {member.name}
                  {member.role === 'leader' && (
                    <Text className={styles.roleBadge}>队长</Text>
                  )}
                </Text>
                <Text className={styles.memberDistance}>
                  {member.totalDistance.toFixed(1)}km · 加入于 {formatDate(member.joinTime)}
                </Text>
              </View>
              <Text className={styles.memberRank}>#{index + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>队伍排行榜</Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>
        <View className={styles.rankingList}>
          {sortedRanking.slice(0, 5).map((team, index) => (
            <View key={team.id} className={styles.rankingItem}>
              <Text className={classnames(styles.rankNum, index < 3 && styles[`top${index + 1}`])}>
                {index + 1}
              </Text>
              <Image className={styles.rankingAvatar} src={team.avatar} mode="aspectFill" />
              <View className={styles.rankingInfo}>
                <Text className={styles.rankingName}>{team.name}</Text>
                <Text className={styles.rankingMembers}>{team.memberCount}人 · 队长 {team.leaderName}</Text>
              </View>
              <Text className={styles.rankingDistance}>{team.totalDistance.toFixed(1)}km</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TeamPage;
