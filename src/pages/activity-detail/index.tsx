import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getActivityById } from '@/data/activities';
import type { Activity } from '@/types';
import { getStatusText, formatDate } from '@/utils';

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

  useEffect(() => {
    const id = router.params.id;
    console.log('[ActivityDetail] 活动ID:', id);
    if (id) {
      const data = getActivityById(id);
      if (data) {
        setActivity(data);
      }
    }
  }, [router.params.id]);

  const handleSignup = () => {
    if (!activity) return;
    
    if (activity.status === 'ended') {
      Taro.showToast({
        title: '活动已结束',
        icon: 'none'
      });
      return;
    }
    
    if (isSignedUp) {
      Taro.showToast({
        title: '已报名成功',
        icon: 'success'
      });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: `确定要参加"${activity.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[ActivityDetail] 报名活动:', activity.id);
          Taro.showLoading({ title: '报名中...' });
          setTimeout(() => {
            Taro.hideLoading();
            setIsSignedUp(true);
            Taro.showToast({
              title: '报名成功！',
              icon: 'success'
            });
          }, 1000);
        }
      }
    });
  };

  const handleShare = () => {
    console.log('[ActivityDetail] 分享活动');
    Taro.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '生成海报'],
      success: () => {
        Taro.showToast({
          title: '分享成功',
          icon: 'success'
        });
      }
    });
  };

  const handleViewResult = () => {
    console.log('[ActivityDetail] 查看活动成果');
    Taro.navigateTo({
      url: '/pages/activity-result/index'
    });
  };

  if (!activity) {
    return (
      <View className={styles.page}>
        <View style={{ textAlign: 'center', padding: '200rpx 0' }}>
          <Text style={{ color: '#86909c' }}>加载中...</Text>
        </View>
      </View>
    );
  }

  const progressPercent = Math.min((activity.participants / activity.maxParticipants) * 100, 100);

  return (
    <ScrollView className={styles.page} scrollY>
      <Image
        className={styles.coverImage}
        src={activity.coverImage}
        mode="aspectFill"
      />

      <View className={styles.content}>
        <View className={styles.infoCard}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{activity.title}</Text>
            <View className={classnames(styles.statusBadge, styles[activity.status])}>
              {getStatusText(activity.status)}
            </View>
          </View>
          <Text className={styles.description}>{activity.description}</Text>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📅</Text>
              <Text>{formatDate(activity.startTime)} - {formatDate(activity.endTime)}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🎯</Text>
              <Text>目标 {activity.targetDistance}km</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>👥</Text>
              <Text>{activity.type === 'team' ? '团队赛' : '个人赛'}</Text>
            </View>
          </View>
        </View>

        <View className={styles.progressSection}>
          <Text className={styles.sectionTitle}>报名进度</Text>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </View>
          <View className={styles.progressInfo}>
            <Text>已报名 <Text className={styles.progressHighlight}>{activity.participants}</Text> 人</Text>
            <Text>上限 {activity.maxParticipants} 人</Text>
          </View>
        </View>

        <View className={styles.rulesSection}>
          <Text className={styles.sectionTitle}>活动规则</Text>
          {activity.rules.map((rule, index) => (
            <View key={index} className={styles.ruleItem}>
              <View className={styles.ruleIndex}>{index + 1}</View>
              <Text className={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <View className={styles.rewardSection}>
          <Text className={styles.sectionTitle}>活动奖励</Text>
          <View className={styles.rewardContent}>
            <Text className={styles.rewardIcon}>🏆</Text>
            <View className={styles.rewardText}>
              <Text className={styles.rewardTitle}>{activity.reward}</Text>
              <Text className={styles.rewardDesc}>完赛即可获得全部奖励</Text>
            </View>
          </View>
        </View>

        {activity.sponsor && (
          <View className={styles.sponsorSection}>
            <Text className={styles.sectionTitle}>赞助方</Text>
            <View className={styles.sponsorContent}>
              <Text className={styles.sponsorIcon}>🏢</Text>
              <View className={styles.sponsorText}>
                <Text className={styles.sponsorName}>{activity.sponsor}</Text>
                <Text className={styles.sponsorLabel}>本次活动由以上品牌赞助支持</Text>
              </View>
            </View>
          </View>
        )}

        {activity.status === 'ended' && (
          <View 
            className={styles.rewardSection}
            onClick={handleViewResult}
          >
            <View className={styles.rewardContent}>
              <Text className={styles.rewardIcon}>📊</Text>
              <View className={styles.rewardText}>
                <Text className={styles.rewardTitle}>查看活动成果</Text>
                <Text className={styles.rewardDesc}>数据统计、获奖名单、精彩回顾</Text>
              </View>
              <Text style={{ fontSize: '32rpx', color: '#86909c' }}>›</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.shareButton} onClick={handleShare}>
          📤
        </Button>
        <Button
          className={classnames(
            styles.signupButton,
            (activity.status === 'ended' || isSignedUp) && styles.disabled
          )}
          onClick={handleSignup}
        >
          {activity.status === 'ended' ? '活动已结束' : isSignedUp ? '已报名 ✓' : '立即报名'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default ActivityDetailPage;
