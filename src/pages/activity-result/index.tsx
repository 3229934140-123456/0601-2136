import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { weeklyRankings } from '@/data/rankings';

const ActivityResultPage: React.FC = () => {
  const dailyData = [
    { day: 'Day1', value: 45 },
    { day: 'Day2', value: 62 },
    { day: 'Day3', value: 58 },
    { day: 'Day4', value: 75 },
    { day: 'Day5', value: 90 },
    { day: 'Day6', value: 68 },
    { day: 'Day7', value: 82 }
  ];

  const top3 = weeklyRankings.slice(0, 3);
  const restWinners = weeklyRankings.slice(3, 10);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>社区春季跑步挑战赛</Text>
        <Text className={styles.headerSubtitle}>活动圆满结束 · 感谢每一位参与者</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>520</Text>
          <Text className={styles.statLabel}>参与人数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>8,560</Text>
          <Text className={styles.statLabel}>总里程(km)</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>2,340</Text>
          <Text className={styles.statLabel}>打卡次数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>89%</Text>
          <Text className={styles.statLabel}>完赛率</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>个人排行</Text>
        <View className={styles.winnersCard}>
          <View className={styles.winnerTop}>
            {[
              { ...top3[1], rankClass: 'second', rankIcon: '🥈' },
              { ...top3[0], rankClass: 'first', rankIcon: '🥇' },
              { ...top3[2], rankClass: 'third', rankIcon: '🥉' }
            ].map((winner, index) => (
              <View key={winner.userId} className={`${styles.winnerPodium} ${styles[winner.rankClass]}`}>
                <Image
                  className={styles.winnerAvatar}
                  src={winner.userAvatar}
                  mode="aspectFill"
                />
                <Text className={styles.winnerName}>{winner.userName}</Text>
                <Text className={styles.winnerDistance}>{winner.totalDistance.toFixed(1)}km</Text>
                <Text className={styles.winnerRank}>{winner.rankIcon}</Text>
              </View>
            ))}
          </View>

          <View className={styles.winnersList}>
            {restWinners.map((item, index) => (
              <View key={item.userId} className={styles.winnerItem}>
                <Text className={styles.winnerRankNum}>{index + 4}</Text>
                <Image
                  className={styles.winnerItemAvatar}
                  src={item.userAvatar}
                  mode="aspectFill"
                />
                <View className={styles.winnerItemInfo}>
                  <Text className={styles.winnerItemName}>{item.userName}</Text>
                  <Text className={styles.winnerItemTeam}>{item.teamName}</Text>
                </View>
                <Text className={styles.winnerItemDistance}>{item.totalDistance.toFixed(1)}km</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>每日参与趋势</Text>
        <View className={styles.chartSection}>
          <Text className={styles.chartTitle}>打卡次数统计</Text>
          <View className={styles.chartBars}>
            {dailyData.map((item, index) => (
              <View key={index} className={styles.chartBarWrapper}>
                <View
                  className={styles.chartBar}
                  style={{ height: `${item.value}%` }}
                />
                <Text className={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>活动亮点</Text>
        <View className={styles.highlights}>
          <View className={styles.highlightItem}>
            <Text className={styles.highlightIcon}>⚡</Text>
            <View className={styles.highlightInfo}>
              <Text className={styles.highlightValue}>156.8km</Text>
              <Text className={styles.highlightLabel}>最长单次距离</Text>
            </View>
          </View>
          <View className={styles.highlightItem}>
            <Text className={styles.highlightIcon}>🔥</Text>
            <View className={styles.highlightInfo}>
              <Text className={styles.highlightValue}>28天</Text>
              <Text className={styles.highlightLabel}>最长连续打卡</Text>
            </View>
          </View>
          <View className={styles.highlightItem}>
            <Text className={styles.highlightIcon}>🏃</Text>
            <View className={styles.highlightInfo}>
              <Text className={styles.highlightValue}>5'23"</Text>
              <Text className={styles.highlightLabel}>最快配速</Text>
            </View>
          </View>
          <View className={styles.highlightItem}>
            <Text className={styles.highlightIcon}>❤️</Text>
            <View className={styles.highlightInfo}>
              <Text className={styles.highlightValue}>520人</Text>
              <Text className={styles.highlightLabel}>爱心参与</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityResultPage;
