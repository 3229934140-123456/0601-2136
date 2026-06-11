import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { activities } from '@/data/activities';
import { getStatusText } from '@/utils';

const sponsorMaterials = [
  { id: 1, name: '运动T恤', quantity: 200, unit: '件', sponsor: '运动品牌旗舰店', icon: '👕' },
  { id: 2, name: '运动水杯', quantity: 150, unit: '个', sponsor: '社区体育中心', icon: '🥤' },
  { id: 3, name: '运动毛巾', quantity: 300, unit: '条', sponsor: '健康生活馆', icon: '🧴' },
  { id: 4, name: '完赛奖牌', quantity: 100, unit: '枚', sponsor: '组委会', icon: '🏅' }
];

const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const handleCreateActivity = () => {
    console.log('[Admin] 创建活动');
    Taro.showToast({
      title: '活动发布功能开发中',
      icon: 'none'
    });
  };

  const handleMenuClick = (key: string) => {
    console.log('[Admin] 点击功能:', key);
    setActiveSection(key);
    
    const actions: Record<string, () => void> = {
      statistics: () => Taro.showToast({ title: '数据统计功能开发中', icon: 'none' }),
      export: () => {
        Taro.showModal({
          title: '导出获奖名单',
          content: '确定要导出当前活动的获奖名单吗？',
          success: (res) => {
            if (res.confirm) {
              Taro.showLoading({ title: '导出中...' });
              setTimeout(() => {
                Taro.hideLoading();
                Taro.showToast({ title: '导出成功', icon: 'success' });
              }, 1500);
            }
          }
        });
      },
      materials: () => Taro.showToast({ title: '物料管理功能开发中', icon: 'none' }),
      badges: () => Taro.showToast({ title: '徽章发放功能开发中', icon: 'none' }),
      notifications: () => Taro.showToast({ title: '消息推送功能开发中', icon: 'none' }),
      report: () => Taro.showToast({ title: '举报处理功能开发中', icon: 'none' })
    };
    
    if (actions[key]) {
      actions[key]();
    }
  };

  const handleActivityClick = (id: string) => {
    console.log('[Admin] 管理活动:', id);
    Taro.showActionSheet({
      itemList: ['查看详情', '编辑活动', '推送提醒', '结束活动'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          Taro.showToast({
            title: '操作成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const menuItems = [
    { icon: '📊', title: '数据统计', desc: '参与率、完成率分析', key: 'statistics' },
    { icon: '📋', title: '导出名单', desc: '导出获奖/参与名单', key: 'export' },
    { icon: '📦', title: '物料管理', desc: '赞助物料库存管理', key: 'materials' },
    { icon: '🏆', title: '徽章发放', desc: '管理和发放徽章', key: 'badges' },
    { icon: '🔔', title: '消息推送', desc: '开跑提醒、活动通知', key: 'notifications' },
    { icon: '⚠️', title: '举报处理', desc: '异常成绩举报审核', key: 'report' }
  ];

  const totalParticipants = activities.reduce((sum, a) => sum + a.participants, 0);
  const ongoingCount = activities.filter(a => a.status === 'ongoing').length;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>运营后台</Text>
        <Text className={styles.headerDesc}>活动管理 · 数据统计 · 物料管理</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{activities.length}</Text>
          <Text className={styles.statLabel}>活动总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{ongoingCount}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{totalParticipants}</Text>
          <Text className={styles.statLabel}>总参与人数</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>管理功能</Text>
        <View className={styles.menuGrid}>
          {menuItems.map(item => (
            <View
              key={item.key}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.key)}
            >
              <View className={styles.menuIcon}>{item.icon}</View>
              <View className={styles.menuInfo}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>活动管理</Text>
        <View className={styles.activityList}>
          {activities.slice(0, 5).map(activity => (
            <View
              key={activity.id}
              className={styles.activityItem}
              onClick={() => handleActivityClick(activity.id)}
            >
              <Image
                className={styles.activityCover}
                src={activity.coverImage}
                mode="aspectFill"
              />
              <View className={styles.activityInfo}>
                <Text className={styles.activityName}>{activity.title}</Text>
                <Text className={styles.activityMeta}>
                  {activity.participants}人参与 · 目标{activity.targetDistance}km
                </Text>
              </View>
              <View className={classnames(styles.activityStatus, styles[activity.status])}>
                {getStatusText(activity.status)}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>赞助物料</Text>
        {sponsorMaterials.map(item => (
          <View key={item.id} className={styles.materialItem}>
            <View className={styles.materialIcon}>{item.icon}</View>
            <View className={styles.materialInfo}>
              <Text className={styles.materialName}>{item.name}</Text>
              <Text className={styles.materialSponsor}>赞助商: {item.sponsor}</Text>
            </View>
            <Text className={styles.materialQty}>{item.quantity}{item.unit}</Text>
          </View>
        ))}
      </View>

      <Button className={styles.createButton} onClick={handleCreateActivity}>
        + 发布新活动
      </Button>
    </ScrollView>
  );
};

export default AdminPage;
