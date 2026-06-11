import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { rewards, badges } from '@/data/rewards';
import { currentUser } from '@/data/user';
import type { Reward } from '@/types';

const tabs = [
  { key: 'prize', label: '实物奖品' },
  { key: 'coupon', label: '优惠券' },
  { key: 'badge', label: '徽章' }
];

const RewardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('prize');
  const [userPoints, setUserPoints] = useState<number>(currentUser.totalPoints);

  const filteredRewards = useMemo(() => {
    if (activeTab === 'badge') return [];
    return rewards.filter(item => {
      if (activeTab === 'prize') return item.category === 'prize';
      if (activeTab === 'coupon') return item.category === 'coupon';
      return true;
    });
  }, [activeTab]);

  const handleExchange = (reward: Reward) => {
    console.log('[Reward] 兑换奖品:', reward.name);
    if (userPoints < reward.points) {
      Taro.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '确认兑换',
      content: `确定用 ${reward.points} 积分兑换"${reward.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '兑换中...' });
          setTimeout(() => {
            Taro.hideLoading();
            setUserPoints(prev => prev - reward.points);
            Taro.showToast({
              title: '兑换成功！',
              icon: 'success'
            });
          }, 1000);
        }
      }
    });
  };

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const myBadges = badges.filter(b => b.obtainDate);
  const allBadges = badges;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.pointsCard}>
          <Text className={styles.pointsLabel}>我的积分</Text>
          <Text className={styles.pointsValue}>{userPoints}</Text>
          <Text className={styles.pointsUnit}>积分可用于兑换奖品和优惠券</Text>
        </View>
      </View>

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

      {activeTab !== 'badge' && (
        <View className={styles.goodsGrid}>
          {filteredRewards.map((reward) => (
            <View key={reward.id} className={styles.goodsCard}>
              <Image
                className={styles.goodsImage}
                src={reward.image}
                mode="aspectFill"
              />
              <View className={styles.goodsInfo}>
                <Text className={styles.goodsName}>{reward.name}</Text>
                <Text className={styles.goodsDesc}>{reward.description}</Text>
                <View className={styles.goodsBottom}>
                  <View>
                    <Text className={styles.goodsPrice}>
                      {reward.points}
                      <Text className={styles.priceUnit}>积分</Text>
                    </Text>
                  </View>
                  <Button
                    className={classnames(
                      styles.exchangeButton,
                      (userPoints < reward.points || reward.stock <= 0) && styles.disabled
                    )}
                    onClick={() => handleExchange(reward)}
                  >
                    {reward.stock <= 0 ? '已售罄' : '兑换'}
                  </Button>
                </View>
                <Text className={styles.stockInfo}>库存: {reward.stock}件</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'badge' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            已获得徽章 ({myBadges.length}/{allBadges.length})
          </Text>
          <View className={styles.badgeList}>
            {allBadges.map((badge) => (
              <View key={badge.id} className={styles.badgeItem}>
                <View className={`${styles.badgeIcon} ${styles[badge.level]}`}>
                  {badge.icon}
                </View>
                <Text className={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RewardPage;
