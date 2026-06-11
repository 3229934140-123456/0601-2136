import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { badges } from '@/data/rewards';
import { useAppStore } from '@/store';

const MinePage: React.FC = () => {
  const { user, notifications } = useAppStore();

  const handleRewardClick = () => {
    Taro.navigateTo({ url: '/pages/reward/index' });
  };

  const handleAdminClick = () => {
    Taro.navigateTo({ url: '/pages/admin/index' });
  };

  const handleMenuClick = (key: string) => {
    if (key === 'notifications') {
      Taro.navigateTo({ url: '/pages/notifications/index' });
      return;
    }
    if (key === 'records') {
      Taro.switchTab({ url: '/pages/checkin/index' });
      return;
    }
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const myBadges = badges.filter(b => b.obtainDate);
  const lockedBadges = badges.filter(b => !b.obtainDate);
  const displayBadges = [...myBadges, ...lockedBadges.slice(0, 4 - myBadges.length)];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { icon: '🏃', title: '我的活动', desc: '查看已报名的活动', key: 'activities' },
    { icon: '📋', title: '打卡记录', desc: '查看历史打卡', key: 'records' },
    { icon: '🏆', title: '我的成就', desc: '查看全部徽章', key: 'achievements' },
    {
      icon: '🔔',
      title: '消息通知',
      desc: unreadCount > 0 ? `${unreadCount}条未读消息` : '活动提醒与消息',
      key: 'notifications',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { icon: '⚙️', title: '设置', desc: '个人设置与隐私', key: 'settings' }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode="aspectFill"
          />
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{user.name}</Text>
            <View className={styles.levelInfo}>
              <Text className={styles.levelIcon}>⭐</Text>
              <Text>Lv.{user.level}</Text>
            </View>
          </View>
          <View className={styles.pointsInfo}>
            <Text className={styles.pointsIcon}>💰</Text>
            <Text>{user.totalPoints}积分</Text>
          </View>
        </View>

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
            <Text className={styles.statValue}>{myBadges.length}</Text>
            <Text className={styles.statLabel}>获得徽章</Text>
          </View>
        </View>
      </View>

      <View className={styles.rewardEntry} onClick={handleRewardClick}>
        <Text style={{ fontSize: '48rpx', marginRight: '24rpx' }}>🎁</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '32rpx', fontWeight: '600', display: 'block', marginBottom: '4rpx' }}>
            奖励兑换
          </Text>
          <Text style={{ fontSize: '24rpx', opacity: 0.8 }}>
            使用积分兑换精美奖品
          </Text>
        </View>
        <Text style={{ fontSize: '32rpx', opacity: 0.8 }}>›</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.badgeSection}>
          <View className={styles.badgeHeader}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>我的徽章</Text>
            <Text className={styles.badgeCount}>
              {myBadges.length}/{badges.length} 枚
            </Text>
          </View>
          <View className={styles.badgeGrid}>
            {displayBadges.map((badge) => (
              <View
                key={badge.id}
                className={`${styles.badgeItem} ${!badge.obtainDate ? styles.locked : ''}`}
              >
                <View className={`${styles.badgeIcon} ${styles[badge.level]}`}>
                  {badge.icon}
                </View>
                <Text className={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.menuGroup}>
          {menuItems.map((item) => (
            <View
              key={item.key}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.key)}
            >
              <View className={styles.menuIcon}>
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <View className={styles.menuBadge}>{item.badge > 99 ? '99+' : item.badge}</View>
                )}
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      {user.isAdmin && (
        <View className={styles.adminEntry} onClick={handleAdminClick}>
          <Text className={styles.adminIcon}>🛠️</Text>
          <View className={styles.adminInfo}>
            <Text className={styles.adminTitle}>运营后台</Text>
            <Text className={styles.adminDesc}>活动管理 · 数据统计 · 物料管理</Text>
          </View>
          <Text className={styles.adminArrow}>›</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MinePage;
