import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { Notification } from '@/store';
import { formatDateTime } from '@/utils';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'activity', label: '活动' },
  { key: 'reward', label: '奖励' },
  { key: 'system', label: '系统' }
];

const iconMap: Record<string, string> = {
  activity: '🏃',
  reward: '🎁',
  system: '📢'
};

const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [activeTab, notifications]);

  const handleClick = (item: Notification) => {
    markNotificationRead(item.id);
    if (item.activityId) {
      Taro.navigateTo({ url: `/pages/activity-detail/index?id=${item.activityId}` });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无消息</Text>
        </View>
      ) : (
        <View className={styles.notifList}>
          {filtered.map(item => (
            <View
              key={item.id}
              className={classnames(styles.notifItem, !item.isRead && styles.unread)}
              onClick={() => handleClick(item)}
            >
              <View className={classnames(styles.notifIcon, styles[item.type])}>
                {iconMap[item.type]}
              </View>
              <View className={styles.notifContent}>
                <View className={styles.notifHeader}>
                  <Text className={styles.notifTitle}>{item.title}</Text>
                  <Text className={styles.notifTime}>{formatDateTime(item.createTime)}</Text>
                </View>
                <Text className={styles.notifText}>{item.content}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default NotificationsPage;
