import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { AppState } from '@/store';
import { badges } from '@/data/rewards';
import type { Reward } from '@/types';
import { formatDateTime } from '@/utils';

const tabs = [
  { key: 'prize', label: '实物奖品' },
  { key: 'coupon', label: '优惠券' },
  { key: 'badge', label: '徽章' },
  { key: 'record', label: '兑换记录' }
];

const recordTabs = [
  { key: 'all', label: '全部' },
  { key: 'completed', label: '已完成' },
  { key: 'pending', label: '待领取' },
  { key: 'prize', label: '实物奖品' },
  { key: 'coupon', label: '优惠券' },
  { key: 'badge', label: '徽章' }
];

const RewardPage: React.FC = () => {
  const { rewards, user, exchangeRecords, exchangeFilter, exchangeReward, clearExchangeRecords, setExchangeFilter } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('prize');

  const filteredRewards = useMemo(() => {
    if (activeTab === 'badge' || activeTab === 'record') return [];
    return rewards.filter(item => {
      if (activeTab === 'prize') return item.category === 'prize';
      if (activeTab === 'coupon') return item.category === 'coupon';
      return true;
    });
  }, [activeTab, rewards]);

  const handleExchange = (reward: Reward) => {
    if (user.totalPoints < reward.points) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    if (reward.stock <= 0) {
      Taro.showToast({ title: '库存不足', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认兑换',
      content: `确定用 ${reward.points} 积分兑换"${reward.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          exchangeReward(reward.id);
        }
      }
    });
  };

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleClearRecords = () => {
    if (exchangeRecords.length === 0) return;
    Taro.showModal({
      title: '清空记录',
      content: `确定清空${exchangeRecords.length}条兑换记录吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) clearExchangeRecords();
      }
    });
  };

  const handleRecordFilter = (key: string) => {
    setExchangeFilter(key as AppState['exchangeFilter']);
  };

  const filteredRecords = useMemo(() => {
    if (exchangeFilter === 'all') return exchangeRecords;
    if (exchangeFilter === 'completed' || exchangeFilter === 'pending') {
      return exchangeRecords.filter(r => r.status === exchangeFilter);
    }
    return exchangeRecords.filter(r => r.category === exchangeFilter);
  }, [exchangeRecords, exchangeFilter]);

  const myBadges = badges.filter(b => b.obtainDate);
  const allBadges = badges;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.pointsCard}>
          <Text className={styles.pointsLabel}>我的积分</Text>
          <Text className={styles.pointsValue}>{user.totalPoints}</Text>
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

      {(activeTab === 'prize' || activeTab === 'coupon') && (
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
                      (user.totalPoints < reward.points || reward.stock <= 0) && styles.disabled
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
              <View key={badge.id} className={classnames(styles.badgeItem, !badge.obtainDate && styles.badgeLocked)}>
                <View className={`${styles.badgeIcon} ${styles[badge.level]}`}>
                  {badge.icon}
                </View>
                <Text className={styles.badgeName}>{badge.name}</Text>
                <Text className={styles.badgeCond}>
                  {badge.obtainDate ? `获得于${badge.obtainDate}` : badge.condition}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'record' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              兑换记录（{filteredRecords.length}/{exchangeRecords.length}）
            </Text>
            {exchangeRecords.length > 0 && (
              <Text className={styles.clearBtn} onClick={handleClearRecords}>清空</Text>
            )}
          </View>

          <View className={styles.recordTabs}>
            {recordTabs.map(tab => (
              <View
                key={tab.key}
                className={classnames(styles.recordTabItem, exchangeFilter === tab.key && styles.active)}
                onClick={() => handleRecordFilter(tab.key)}
              >
                {tab.label}
              </View>
            ))}
          </View>

          {filteredRecords.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
              暂无{exchangeFilter === 'all' ? '' : recordTabs.find(t => t.key === exchangeFilter)?.label}兑换记录
            </View>
          ) : (
            <View>
              {filteredRecords.map(record => (
                <View key={record.id} className={styles.recordItem}>
                  <Image className={styles.recordImg} src={record.rewardImage} mode="aspectFill" />
                  <View className={styles.recordInfo}>
                    <Text className={styles.recordName}>{record.rewardName}</Text>
                    <Text className={styles.recordTime}>{formatDateTime(record.exchangeTime)}</Text>
                  </View>
                  <View className={styles.recordRight}>
                    <Text className={styles.recordPoints}>-{record.points}积分</Text>
                    <Text className={classnames(styles.recordStatus, record.status === 'completed' ? styles.completed : styles.pending)}>
                      {record.status === 'completed' ? '已完成' : '待领取'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default RewardPage;
