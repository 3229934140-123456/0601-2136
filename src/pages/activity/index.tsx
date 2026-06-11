import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Activity } from '@/types';
import { getStatusText } from '@/utils';
import { useAppStore } from '@/store';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ended', label: '已结束' }
];

const ActivityPage: React.FC = () => {
  const activities = useAppStore(s => s.activities);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  const filteredActivities = useMemo(() => {
    let result = [...activities];
    
    if (activeTab !== 'all') {
      result = result.filter(item => item.status === activeTab);
    }
    
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  }, [activeTab, searchText, activities]);

  const handleActivityClick = (id: string) => {
    console.log('[Activity] 点击活动:', id);
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${id}`
    });
  };

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>智慧体育社区</Text>
        <Text className={styles.subtitle}>跑出健康，跑出精彩</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索活动"
            placeholderClass={styles.placeholder}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
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

      <View className={styles.listContainer}>
        {filteredActivities.length === 0 ? (
          <View className={styles.emptyState}>暂无相关活动</View>
        ) : (
          filteredActivities.map((activity: Activity) => (
            <View
              key={activity.id}
              className={styles.activityCard}
              onClick={() => handleActivityClick(activity.id)}
            >
              <Image
                className={styles.coverImage}
                src={activity.coverImage}
                mode="aspectFill"
              />
              <View className={styles.cardContent}>
                <View className={styles.cardHeader}>
                  <Text className={styles.activityTitle}>{activity.title}</Text>
                  <View className={classnames(styles.statusBadge, styles[activity.status])}>
                    {getStatusText(activity.status)}
                  </View>
                </View>
                <Text className={styles.activityDesc}>{activity.description}</Text>
                <View className={styles.cardFooter}>
                  <View className={styles.infoItem}>
                    <Text className={styles.infoIcon}>🎯</Text>
                    <Text>目标 {activity.targetDistance}km</Text>
                  </View>
                  <View className={styles.infoItem}>
                    <Text className={styles.highlight}>{activity.participants}</Text>
                    <Text className={styles.participants}>&nbsp;/ {activity.maxParticipants}人</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityPage;
