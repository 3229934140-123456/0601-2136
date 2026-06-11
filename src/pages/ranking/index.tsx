import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { weeklyRankings, monthlyRankings, teamRankings } from '@/data/rankings';
import { currentUser } from '@/data/user';
import type { RankingItem } from '@/types';
import { getRankChangeText, getRankChangeColor } from '@/utils';

const tabs = [
  { key: 'week', label: '周榜' },
  { key: 'month', label: '月榜' },
  { key: 'team', label: '团队榜' }
];

const RankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('week');

  const rankingData = useMemo(() => {
    switch (activeTab) {
      case 'week':
        return weeklyRankings;
      case 'month':
        return monthlyRankings;
      case 'team':
        return teamRankings;
      default:
        return weeklyRankings;
    }
  }, [activeTab]);

  const topThree = useMemo(() => rankingData.slice(0, 3), [rankingData]);
  const restList = useMemo(() => rankingData.slice(3), [rankingData]);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleReport = (item: RankingItem) => {
    console.log('[Ranking] 举报用户:', item.userName);
    Taro.showActionSheet({
      itemList: ['成绩异常', '作弊嫌疑', '其他原因'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          Taro.showModal({
            title: '举报确认',
            content: `确定要举报 ${item.userName} 吗？`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                Taro.showToast({
                  title: '举报已提交',
                  icon: 'success'
                });
              }
            }
          });
        }
      }
    });
  };

  const getMyRank = () => {
    const myRank = rankingData.find(item => item.userId === 'u1');
    if (myRank) return myRank;
    return {
      rank: rankingData.length + 5,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      totalDistance: currentUser.totalDistance,
      totalCheckins: currentUser.totalCheckins,
      change: 0
    };
  };

  const myRank = getMyRank();

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        <View className={styles.topThree}>
          {topThree.map((item, index) => {
            const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
            return (
              <View key={item.userId} className={classnames(styles.podiumItem, styles[rankClass])}>
                <View className={styles.avatarWrapper}>
                  <Image
                    className={styles.topAvatar}
                    src={item.userAvatar}
                    mode="aspectFill"
                  />
                  <View className={styles.rankBadge}>{item.rank}</View>
                </View>
                <Text className={styles.userName}>{item.userName}</Text>
                <Text className={styles.userDistance}>{item.totalDistance.toFixed(1)}km</Text>
                <View className={styles.podiumBase}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </View>
              </View>
            );
          })}
        </View>

        <View className={styles.listContainer}>
          {restList.map((item) => (
            <View key={item.userId} className={styles.listItem}>
              <Text className={styles.rankNumber}>{item.rank}</Text>
              <Image
                className={styles.listAvatar}
                src={item.userAvatar}
                mode="aspectFill"
              />
              <View className={styles.listUserInfo}>
                <Text className={styles.listUserName}>{item.userName}</Text>
                {item.teamName && (
                  <Text className={styles.listUserTeam}>{item.teamName}</Text>
                )}
              </View>
              <View className={styles.listRight}>
                <Text className={styles.listDistance}>{item.totalDistance.toFixed(1)}km</Text>
                <Text
                  className={classnames(
                    styles.rankChange,
                    item.change > 0 ? styles.up : item.change < 0 ? styles.down : styles.same
                  )}
                >
                  {getRankChangeText(item.change)}
                </Text>
              </View>
              <View className={styles.reportButton} onClick={() => handleReport(item)}>
                举报
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.myRankCard}>
        <Text className={styles.myRankNum}>{myRank.rank}</Text>
        <Image
          className={styles.myAvatar}
          src={currentUser.avatar}
          mode="aspectFill"
        />
        <View className={styles.myInfo}>
          <Text className={styles.myName}>{currentUser.name}</Text>
          <Text className={styles.myDistance}>{myRank.totalDistance.toFixed(1)}km · {myRank.totalCheckins}次打卡</Text>
        </View>
      </View>
    </View>
  );
};

export default RankingPage;
