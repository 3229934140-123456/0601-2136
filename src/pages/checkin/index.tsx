import React from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { formatDateTime, formatDistance, formatDuration } from '@/utils';

const CheckinPage: React.FC = () => {
  const { checkins, user, likeCheckin } = useAppStore();

  const handleStartCheckin = () => {
    Taro.navigateTo({ url: '/pages/checkin-form/index' });
  };

  const handleLike = (id: string) => {
    likeCheckin(id);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>我的运动数据</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.totalDistance.toFixed(1)}</Text>
            <Text className={styles.statLabel}>总里程(km)</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.totalCheckins}</Text>
            <Text className={styles.statLabel}>打卡次数</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>Lv.{user.level}</Text>
            <Text className={styles.statLabel}>当前等级</Text>
          </View>
        </View>
      </View>

      <View className={styles.checkinCard}>
        <View className={styles.tipText}>
          今日还未打卡，快去跑步打卡，赢取积分奖励吧！
        </View>
        <Button className={styles.checkinBtn} onClick={handleStartCheckin}>
          去打卡
          <Text className={styles.subText}>立即开始</Text>
        </Button>
        <View className={styles.checkinOptions}>
          <View className={styles.optionItem}>
            <Text className={styles.optionIcon}>📸</Text>
            <Text className={styles.optionText}>上传截图</Text>
          </View>
          <View className={styles.optionItem}>
            <Text className={styles.optionIcon}>⌨️</Text>
            <Text className={styles.optionText}>手动录入</Text>
          </View>
          <View className={styles.optionItem}>
            <Text className={styles.optionIcon}>🔗</Text>
            <Text className={styles.optionText}>关联APP</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>打卡动态</Text>
          <Text className={styles.seeAll} onClick={() => Taro.showToast({ title: '查看全部', icon: 'none' })}>
            查看全部
          </Text>
        </View>

        <View className={styles.checkinList}>
          {checkins.length === 0 ? (
            <View className={styles.emptyText}>还没有打卡记录</View>
          ) : (
            checkins.map(record => (
              <View key={record.id} className={styles.checkinItem}>
                <View className={styles.checkinHeader}>
                  <Image
                    className={styles.userAvatar}
                    src={record.userAvatar}
                    mode="aspectFill"
                  />
                  <View className={styles.userInfo}>
                    <Text className={styles.userName}>{record.userName}</Text>
                    <Text className={styles.checkinTime}>{formatDateTime(record.checkinTime)}</Text>
                  </View>
                  <View className={classnames(styles.verifyBadge, styles[record.status])}>
                    {record.status === 'verified' ? '已通过' :
                     record.status === 'pending' ? '审核中' : '已驳回'}
                  </View>
                </View>
                {record.image && (
                  <Image
                    className={styles.checkinImage}
                    src={record.image}
                    mode="aspectFill"
                  />
                )}
                {record.comment && (
                  <Text className={styles.checkinComment}>{record.comment}</Text>
                )}
                <View className={styles.dataRow}>
                  <View className={styles.dataItem}>
                    <Text className={styles.dataValue}>{formatDistance(record.distance)}</Text>
                    <Text className={styles.dataLabel}>里程</Text>
                  </View>
                  <View className={styles.dataItem}>
                    <Text className={styles.dataValue}>{record.pace}</Text>
                    <Text className={styles.dataLabel}>配速</Text>
                  </View>
                  <View className={styles.dataItem}>
                    <Text className={styles.dataValue}>{record.calories}千卡</Text>
                    <Text className={styles.dataLabel}>卡路里</Text>
                  </View>
                </View>
                <View className={styles.actionRow}>
                  <View className={styles.activityTag}>
                    {record.activityTitle}
                  </View>
                  <View className={styles.likeBtn} onClick={() => handleLike(record.id)}>
                    <Text className={classnames(styles.likeIcon, record.isLiked && styles.liked)}>
                      {record.isLiked ? '❤️' : '🤍'}
                    </Text>
                    <Text className={styles.likeCount}>{record.likes}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckinPage;
