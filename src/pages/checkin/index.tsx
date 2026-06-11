import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { checkinRecords } from '@/data/checkins';
import { currentUser } from '@/data/user';
import type { CheckinRecord } from '@/types';
import { formatDateTime, getStatusText } from '@/utils';

const CheckinPage: React.FC = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [records, setRecords] = useState<CheckinRecord[]>(checkinRecords);

  const handleCheckin = () => {
    console.log('[Checkin] 点击打卡按钮');
    if (isChecked) {
      Taro.showToast({
        title: '今日已打卡',
        icon: 'none'
      });
      return;
    }
    
    Taro.showActionSheet({
      itemList: ['上传运动截图', '手动录入数据', '关联运动APP'],
      success: (res) => {
        console.log('[Checkin] 选择打卡方式:', res.tapIndex);
        if (res.tapIndex === 0 || res.tapIndex === 1 || res.tapIndex === 2) {
          Taro.showLoading({ title: '打卡中...' });
          setTimeout(() => {
            Taro.hideLoading();
            setIsChecked(true);
            Taro.showToast({
              title: '打卡成功！',
              icon: 'success'
            });
          }, 1500);
        }
      }
    });
  };

  const handleLike = (id: string) => {
    console.log('[Checkin] 点赞记录:', id);
    setRecords(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>我的运动数据</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{currentUser.totalDistance.toFixed(1)}</Text>
            <Text className={styles.statsLabel}>总里程(km)</Text>
          </View>
          <View className={styles.statsDivider} />
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{currentUser.totalCheckins}</Text>
            <Text className={styles.statsLabel}>打卡次数</Text>
          </View>
          <View className={styles.statsDivider} />
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>Lv.{currentUser.level}</Text>
            <Text className={styles.statsLabel}>当前等级</Text>
          </View>
        </View>
      </View>

      <View className={styles.checkinSection}>
        <Text className={styles.checkinStatus}>
          {isChecked ? '今日已打卡 ✓' : '今日还未打卡'}
        </Text>
        <Text className={styles.checkinTip}>
          {isChecked ? '继续保持，明天加油！' : '快去跑步打卡，赢取积分奖励吧！'}
        </Text>
        <Button
          className={classnames(styles.checkinButton, isChecked && styles.checked)}
          onClick={handleCheckin}
        >
          <View>
            <Text className={styles.buttonText}>{isChecked ? '已打卡' : '去打卡'}</Text>
            <Text className={styles.buttonSubtext}>{isChecked ? '明天继续' : '立即开始'}</Text>
          </View>
        </Button>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>打卡动态</Text>
        <Text className={styles.sectionMore}>查看全部</Text>
      </View>

      <View className={styles.feedList}>
        {records.map((record: CheckinRecord) => (
          <View key={record.id} className={styles.feedItem}>
            <View className={styles.feedHeader}>
              <Image
                className={styles.userAvatar}
                src={record.userAvatar}
                mode="aspectFill"
              />
              <View className={styles.userInfo}>
                <Text className={styles.userName}>{record.userName}</Text>
                <Text className={styles.checkinTime}>{formatDateTime(record.checkinTime)}</Text>
              </View>
              <View className={classnames(styles.statusTag, styles[record.status])}>
                {getStatusText(record.status)}
              </View>
            </View>

            <View className={styles.feedContent}>
              {record.image && (
                <Image
                  className={styles.feedImage}
                  src={record.image}
                  mode="aspectFill"
                />
              )}
              {record.comment && (
                <Text className={styles.feedComment}>{record.comment}</Text>
              )}
            </View>

            <View className={styles.feedStats}>
              <View className={styles.feedStatItem}>
                <Text className={styles.feedStatValue}>{record.distance.toFixed(1)}km</Text>
                <Text className={styles.feedStatLabel}>里程</Text>
              </View>
              <View className={styles.feedStatItem}>
                <Text className={styles.feedStatValue}>{record.pace}</Text>
                <Text className={styles.feedStatLabel}>配速</Text>
              </View>
              <View className={styles.feedStatItem}>
                <Text className={styles.feedStatValue}>{record.calories}</Text>
                <Text className={styles.feedStatLabel}>千卡</Text>
              </View>
            </View>

            <View className={styles.feedFooter}>
              <View className={styles.activityTag}>{record.activityTitle}</View>
              <View
                className={classnames(styles.likeButton, record.isLiked && styles.liked)}
                onClick={() => handleLike(record.id)}
              >
                <Text className={styles.likeIcon}>{record.isLiked ? '❤️' : '🤍'}</Text>
                <Text>{record.likes}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CheckinPage;
