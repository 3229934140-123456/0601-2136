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
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? notifications : notifications.filter(n => n.type === activeTab);
    if (onlyUnread) list = list.filter(n => !n.isRead);
    return list;
  }, [activeTab, notifications, onlyUnread]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClick = (item: Notification) => {
    markNotificationRead(item.id);
    if (item.activityId) {
      Taro.navigateTo({ url: `/pages/activity-detail/index?id=${item.activityId}` });
    }
  };

  const handleMarkAll = () => {
    if (unreadCount === 0) {
      Taro.showToast({ title: '没有未读消息', icon: 'none' });
      return;
    }
    markAllNotificationsRead();
  };

  const handleClear = () => {
    if (notifications.length === 0) {
      Taro.showToast({ title: '暂无消息', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '清空消息',
      content: `确定清空${notifications.length}条消息吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) clearNotifications();
      }
    });
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

      <View className={styles.toolbar}>
        <View
          className={classnames(styles.filterToggle, onlyUnread && styles.active)}
          onClick={() => setOnlyUnread(!onlyUnread)}
        >
          {onlyUnread ? '🔴 只看未读' : '⚪ 只看未读'}
        </View>
        <View className={styles.toolbarRight}>
          <Text className={styles.toolBtn} onClick={handleMarkAll}>全部已读</Text>
          <Text className={styles.toolDivider}>|</Text>
          <Text className={styles.toolBtn} onClick={handleClear}>清空</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无消息</Text>
          <Text className={styles.emptyHint}>
            {onlyUnread ? '所有消息都已阅读' : '暂无相关消息'}
          </Text>
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
