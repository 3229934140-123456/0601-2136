import React from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { getStatusText } from '@/utils';

const sponsorMaterials = [
  { id: 1, name: '运动T恤', quantity: 200, unit: '件', sponsor: '运动品牌旗舰店', icon: '👕' },
  { id: 2, name: '运动水杯', quantity: 150, unit: '个', sponsor: '社区体育中心', icon: '🥤' },
  { id: 3, name: '运动毛巾', quantity: 300, unit: '条', sponsor: '健康生活馆', icon: '🧴' },
  { id: 4, name: '完赛奖牌', quantity: 100, unit: '枚', sponsor: '组委会', icon: '🏅' }
];

const AdminPage: React.FC = () => {
  const { activities, exportWinners, pushNotification } = useAppStore();

  const handleCreateActivity = () => {
    Taro.navigateTo({ url: '/pages/admin-create/index' });
  };

  const handleExport = () => {
    const ongoingList = activities.filter(a => a.status === 'ongoing' || a.status === 'ended');
    if (ongoingList.length === 0) {
      Taro.showToast({ title: '暂无可导出的活动', icon: 'none' });
      return;
    }
    const activity = ongoingList[0];
    const content = exportWinners(activity.id);
    Taro.showModal({
      title: `${activity.title} - 获奖名单`,
      content: content.slice(0, 800) + (content.length > 800 ? '\n...(内容过长，已截断)' : ''),
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制全文',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: content,
            success: () => Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
          });
        }
      }
    });
  };

  const handlePushNotif = () => {
    const upcoming = activities.filter(a => a.status === 'upcoming');
    if (upcoming.length === 0) {
      Taro.showToast({ title: '暂无可推送的活动', icon: 'none' });
      return;
    }
    const activity = upcoming[0];
    pushNotification({
      title: `${activity.title} 即将开跑！`,
      content: `${activity.title} 将于明天准时开始，记得做好热身准备，准时打卡哦！活动目标：${activity.targetDistance}km`,
      type: 'activity',
      activityId: activity.id
    });
    Taro.showToast({ title: '提醒已推送', icon: 'success' });
  };

  const handleMenuClick = (key: string) => {
    const actions: Record<string, () => void> = {
      statistics: () => Taro.showToast({ title: '数据统计功能开发中', icon: 'none' }),
      export: handleExport,
      materials: () => Taro.showToast({ title: '物料管理功能开发中', icon: 'none' }),
      badges: () => Taro.showToast({ title: '徽章发放功能开发中', icon: 'none' }),
      notifications: handlePushNotif,
      report: () => Taro.showToast({ title: '举报处理功能开发中', icon: 'none' })
    };
    if (actions[key]) actions[key]();
  };

  const handleActivityClick = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    Taro.showActionSheet({
      itemList: ['查看详情', '推送开跑提醒', '导出获奖名单'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
        } else if (res.tapIndex === 1) {
          pushNotification({
            title: `${activity.title} 开跑提醒`,
            content: `${activity.title} 活动目标${activity.targetDistance}km，请大家准时参加！`,
            type: 'activity',
            activityId: activity.id
          });
          Taro.showToast({ title: '提醒已推送', icon: 'success' });
        } else if (res.tapIndex === 2) {
          const content = exportWinners(activity.id);
          Taro.setClipboardData({
            data: content,
            success: () => Taro.showToast({ title: '名单已复制', icon: 'success' })
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
