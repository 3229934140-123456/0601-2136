import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { Activity } from '@/types';
import { getStatusText, formatDate, formatDistance } from '@/utils';

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const {
    activities,
    checkins,
    user,
    userSignedUpActivities,
    claimedActivityRewards,
    signupActivity,
    pushNotification,
    claimActivityReward
  } = useAppStore();

  const activityId = router.params.id || '';
  const activity: Activity | undefined = useMemo(
    () => activities.find(a => a.id === activityId),
    [activities, activityId]
  );

  const isSignedUp = useMemo(
    () => userSignedUpActivities.includes(activityId),
    [userSignedUpActivities, activityId]
  );

  const activityCheckins = useMemo(
    () => checkins.filter(c => c.activityId === activityId),
    [checkins, activityId]
  );

  const activityTotalDistance = useMemo(
    () => activityCheckins.reduce((sum, c) => sum + c.distance, 0),
    [activityCheckins]
  );

  const activityCheckinUsers = useMemo(() => {
    const ids = new Set(activityCheckins.map(c => c.userId));
    return ids.size;
  }, [activityCheckins]);

  const myProgress = useMemo(() => {
    const mine = activityCheckins.filter(c => c.userId === user.id);
    return mine.reduce((sum, c) => sum + c.distance, 0);
  }, [activityCheckins, user.id]);

  const myCheckins = useMemo(() => {
    return activityCheckins.filter(c => c.userId === user.id);
  }, [activityCheckins, user.id]);

  const isFinished = useMemo(() => {
    return isSignedUp && myProgress >= (activity?.targetDistance || 0);
  }, [isSignedUp, myProgress, activity?.targetDistance]);

  const isRewardClaimed = useMemo(() => {
    return claimedActivityRewards.includes(activityId);
  }, [claimedActivityRewards, activityId]);

  const remainingDistance = useMemo(() => {
    if (!activity || !isSignedUp) return 0;
    return Math.max(0, activity.targetDistance - myProgress);
  }, [activity, isSignedUp, myProgress]);

  const handleClaimReward = () => {
    if (!activity) return;
    Taro.showModal({
      title: '确认领取奖励',
      content: `确定领取"${activity.title}"的完赛奖励吗？\n\n${activity.reward}`,
      success: (res) => {
        if (res.confirm) {
          const result = claimActivityReward(activity.id);
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      }
    });
  };

  const handleSignup = () => {
    if (!activity) return;
    if (activity.status === 'ended') {
      Taro.showToast({ title: '活动已结束', icon: 'none' });
      return;
    }
    if (isSignedUp) {
      Taro.showToast({ title: '您已报名', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认报名',
      content: `确定要参加"${activity.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const result = signupActivity(activity.id);
          if (result.success) {
            pushNotification({
              title: '报名成功',
              content: `您已成功报名"${activity.title}"，活动目标${activity.targetDistance}km，请在活动期间完成打卡。`,
              type: 'activity',
              activityId: activity.id
            });
          } else {
            Taro.showToast({ title: result.message, icon: 'none' });
          }
        }
      }
    });
  };

  const handleCheckin = () => {
    if (!activity) return;
    if (activity.status !== 'ongoing') {
      Taro.showToast({
        title: activity.status === 'upcoming' ? '活动尚未开始' : '活动已结束',
        icon: 'none'
      });
      return;
    }
    if (!isSignedUp) {
      Taro.showToast({ title: '请先报名再打卡', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/checkin-form/index?activityId=${activity.id}`
    });
  };

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '生成海报'],
      success: () => Taro.showToast({ title: '分享成功', icon: 'success' })
    });
  };

  const handleViewResult = () => {
    Taro.navigateTo({
      url: `/pages/activity-result/index?id=${activityId}`
    });
  };

  if (!activity) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View style={{ textAlign: 'center', padding: '200rpx 40rpx' }}>
          <Text style={{ fontSize: '120rpx' }}>😢</Text>
          <Text style={{ display: 'block', marginTop: '24rpx', color: '#86909c', fontSize: '32rpx' }}>
            活动不存在或已被删除
          </Text>
          <Button
            style={{ marginTop: '40rpx', width: '320rpx' }}
            onClick={() => Taro.switchTab({ url: '/pages/activity/index' })}
          >
            返回活动广场
          </Button>
        </View>
      </ScrollView>
    );
  }

  const progressPercent = Math.min((activity.participants / activity.maxParticipants) * 100, 100);
  const myProgressPercent = activity.targetDistance > 0
    ? Math.min((myProgress / activity.targetDistance) * 100, 100)
    : 0;

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

        {isSignedUp && (
          <View className={styles.progressSection}>
            <Text className={styles.sectionTitle}>我的进度</Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${myProgressPercent}%`, background: 'linear-gradient(90deg, #00b42a 0%, #23c343 100%)' }} />
            </View>
            <View className={styles.progressInfo}>
              <Text>
                累计 <Text className={styles.progressHighlight}>{formatDistance(myProgress)}</Text> km
              </Text>
              <Text>
                {remainingDistance > 0
                  ? `还差 ${formatDistance(remainingDistance)} km 完赛`
                  : isFinished
                    ? <Text style={{ color: '#00b42a', fontWeight: 600 }}>🎉 已完赛</Text>
                    : `目标 ${activity.targetDistance} km`
                }
              </Text>
            </View>
          </View>
        )}

        {isSignedUp && myCheckins.length > 0 && (
          <View className={styles.myCheckinsSection}>
            <Text className={styles.sectionTitle}>我的打卡记录（{myCheckins.length}）</Text>
            <View className={styles.myCheckinsList}>
              {myCheckins.slice(0, 5).map((checkin) => (
                <View key={checkin.id} className={styles.myCheckinItem}>
                  <View className={styles.myCheckinLeft}>
                    <Text className={styles.myCheckinDistance}>{formatDistance(checkin.distance)} km</Text>
                    <Text className={styles.myCheckinPace}>配速 {checkin.pace}</Text>
                  </View>
                  <View className={styles.myCheckinRight}>
                    <Text className={styles.myCheckinTime}>{formatDate(checkin.checkinTime)}</Text>
                    <Text className={styles.myCheckinCal}>{checkin.calories} 千卡</Text>
                  </View>
                </View>
              ))}
              {myCheckins.length > 5 && (
                <View className={styles.moreRecordsHint}>
                  还有 {myCheckins.length - 5} 条记录，去打卡页查看全部
                </View>
              )}
            </View>
          </View>
        )}

        {isSignedUp && activity.status === 'ended' && (
          <View
            className={classnames(styles.rewardSection, styles.claimableReward)}
            onClick={isFinished && !isRewardClaimed ? handleClaimReward : undefined}
          >
            <View className={styles.rewardContent}>
              {activity.rewardImage ? (
                <Image className={styles.rewardThumb} src={activity.rewardImage} mode="aspectFill" />
              ) : (
                <Text className={styles.rewardIcon}>🎁</Text>
              )}
              <View className={styles.rewardText}>
                <Text className={styles.rewardTitle}>
                  {isRewardClaimed ? '奖励已领取 ✓' : isFinished ? '可领取完赛奖励' : '完赛奖励'}
                </Text>
                <Text className={styles.rewardDesc}>{activity.reward}</Text>
                {isFinished && !isRewardClaimed && (
                  <Text className={styles.claimHint}>点击领取，前往奖励中心查看</Text>
                )}
              </View>
              {isFinished && !isRewardClaimed && (
                <Text style={{ fontSize: '32rpx', color: '#FF6B35' }}>›</Text>
              )}
            </View>
          </View>
        )}

        <View className={styles.progressSection}>
          <Text className={styles.sectionTitle}>活动累计数据</Text>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{formatDistance(activityTotalDistance)}</Text>
              <Text className={styles.statLabel}>累计里程(km)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activityCheckins.length}</Text>
              <Text className={styles.statLabel}>打卡次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activityCheckinUsers}</Text>
              <Text className={styles.statLabel}>参与人数</Text>
            </View>
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
          <View className={styles.rewardSection} onClick={handleViewResult}>
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
        <Button className={styles.shareButton} onClick={handleShare}>📤</Button>
        {activity.status === 'ongoing' && isSignedUp ? (
          <Button className={classnames(styles.signupButton, styles.checkin)} onClick={handleCheckin}>
            去打卡 🏃
          </Button>
        ) : (
          <Button
            className={classnames(
              styles.signupButton,
              (activity.status === 'ended' || isSignedUp) && styles.disabled
            )}
            onClick={handleSignup}
          >
            {activity.status === 'ended' ? '活动已结束' : isSignedUp ? '已报名 ✓' : '立即报名'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetailPage;
