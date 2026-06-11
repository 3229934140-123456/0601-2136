import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { teams } from '@/data/teams';
import { currentUser } from '@/data/user';
import type { Team, TeamMember } from '@/types';

const TeamPage: React.FC = () => {
  const [myTeam] = useState<Team | undefined>(teams[0]);

  const handleInvite = () => {
    console.log('[Team] 邀请队友');
    Taro.showActionSheet({
      itemList: ['微信分享', '生成邀请码', '复制链接'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          Taro.showToast({
            title: '邀请方式已复制',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleTeamManage = () => {
    console.log('[Team] 队伍管理');
    Taro.showToast({
      title: '队伍管理功能开发中',
      icon: 'none'
    });
  };

  const handleCreateTeam = () => {
    console.log('[Team] 创建队伍');
    Taro.showModal({
      title: '创建队伍',
      content: '确定要创建新队伍吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '创建成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleJoinTeam = () => {
    console.log('[Team] 加入队伍');
    Taro.showActionSheet({
      itemList: ['搜索队伍', '输入邀请码', '浏览热门队伍'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          Taro.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      }
    });
  };

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
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>热门队伍</Text>
            <Text className={styles.sectionMore}>查看全部</Text>
          </View>
          <View className={styles.rankingList}>
            {teams.map((team, index) => (
              <View key={team.id} className={styles.rankingItem}>
                <Text className={classnames(styles.rankNum, index < 3 && styles[`top${index + 1}`])}>
                  {team.rank}
                </Text>
                <Image className={styles.rankingAvatar} src={team.avatar} mode="aspectFill" />
                <View className={styles.rankingInfo}>
                  <Text className={styles.rankingName}>{team.name}</Text>
                  <Text className={styles.rankingMembers}>{team.memberCount}人 · {team.leaderName}</Text>
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

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.myTeamCard}>
        <View className={styles.teamHeader}>
          <Image className={styles.teamAvatar} src={myTeam.avatar} mode="aspectFill" />
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{myTeam.name}</Text>
            <Text className={styles.teamSlogan}>{myTeam.slogan}</Text>
          </View>
          <View className={styles.teamRank}>No.{myTeam.rank}</View>
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
            <Text className={styles.teamStatValue}>Lv.{currentUser.level}</Text>
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
          {myTeam.members.slice(0, 5).map((member: TeamMember, index) => (
            <View key={member.id} className={styles.memberItem}>
              <Image className={styles.memberAvatar} src={member.avatar} mode="aspectFill" />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>
                  {member.name}
                  {member.role === 'leader' && (
                    <Text className={styles.roleBadge}>队长</Text>
                  )}
                </Text>
                <Text className={styles.memberDistance}>{member.totalDistance.toFixed(1)}km · 加入于 {member.joinTime}</Text>
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
          {teams.slice(0, 5).map((team, index) => (
            <View key={team.id} className={styles.rankingItem}>
              <Text className={classnames(styles.rankNum, index < 3 && styles[`top${index + 1}`])}>
                {team.rank}
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
