import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { ActivitySummary } from '@/types';
import { getStatusText, formatDistance } from '@/utils';

const sponsorMaterials = [
  { id: 1, name: '运动T恤', quantity: 200, unit: '件', sponsor: '运动品牌旗舰店', icon: '👕' },
  { id: 2, name: '运动水杯', quantity: 150, unit: '个', sponsor: '社区体育中心', icon: '🥤' },
  { id: 3, name: '运动毛巾', quantity: 300, unit: '条', sponsor: '健康生活馆', icon: '🧴' },
  { id: 4, name: '完赛奖牌', quantity: 100, unit: '枚', sponsor: '组委会', icon: '🏅' }
];

const adminTabs = [
  { key: 'main', label: '管理首页' },
  { key: 'statistics', label: '数据统计' },
  { key: 'report', label: '举报处理' }
];

const AdminPage: React.FC = () => {
  const { activities, exportWinners, pushNotification, getActivitySummaries, handleReportedCheckin } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('main');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');

  const summaries: ActivitySummary[] = useMemo(() => getActivitySummaries(), [activities]);

  const allReported = useMemo(() => {
    return summaries.flatMap(s => s.reportedCheckins);
  }, [summaries]);

  const filteredSummaries = selectedActivityId === 'all'
    ? summaries
    : summaries.filter(s => s.activityId === selectedActivityId);

  const filteredReported = selectedActivityId === 'all'
    ? allReported
    : allReported.filter(r => {
        const activity = summaries.find(s => s.reportedCheckins.some(rc => rc.id === r.id));
        return activity?.activityId === selectedActivityId;
      });

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
    if (key === 'statistics') {
      setActiveTab('statistics');
      return;
    }
    if (key === 'report') {
      setActiveTab('report');
      return;
    }
    const actions: Record<string, () => void> = {
      export: handleExport,
      materials: () => Taro.showToast({ title: '物料管理功能开发中', icon: 'none' }),
      badges: () => Taro.showToast({ title: '徽章发放功能开发中', icon: 'none' }),
      notifications: handlePushNotif
    };
    if (actions[key]) actions[key]();
  };

  const handleReportAction = (checkinId: string, action: 'approve' | 'reject') => {
    Taro.showModal({
      title: action === 'reject' ? '确认驳回' : '确认通过',
      content: action === 'reject'
        ? '驳回后该打卡记录将被标记为无效，里程和积分将被扣除，同时影响榜单和完赛资格。'
        : '通过后该打卡记录的举报标记将被移除。',
      success: (res) => {
        if (res.confirm) {
          const result = handleReportedCheckin(checkinId, action);
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      }
    });
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

      <View className={styles.adminTabs}>
        {adminTabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.adminTabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      {activeTab === 'main' && (
        <>
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
        </>
      )}

      {activeTab === 'statistics' && (
        <View className={styles.section}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>按活动筛选：</Text>
            <View className={styles.filterOptions}>
              <View
                className={classnames(styles.filterOption, selectedActivityId === 'all' && styles.active)}
                onClick={() => setSelectedActivityId('all')}
              >
                全部
              </View>
              {activities.slice(0, 6).map(a => (
                <View
                  key={a.id}
                  className={classnames(styles.filterOption, selectedActivityId === a.id && styles.active)}
                  onClick={() => setSelectedActivityId(a.id)}
                >
                  {a.title.length > 6 ? a.title.slice(0, 6) + '...' : a.title}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.summaryList}>
            {filteredSummaries.map(summary => (
              <View key={summary.activityId} className={styles.summaryCard}>
                <Text className={styles.summaryTitle}>{summary.activityTitle}</Text>
                <View className={styles.summaryStats}>
                  <View className={styles.summaryStatItem}>
                    <Text className={styles.summaryStatValue} style={{ color: '#165DFF' }}>{summary.signupCount}</Text>
                    <Text className={styles.summaryStatLabel}>报名人数</Text>
                  </View>
                  <View className={styles.summaryStatItem}>
                    <Text className={styles.summaryStatValue} style={{ color: '#00B42A' }}>{summary.checkinCount}</Text>
                    <Text className={styles.summaryStatLabel}>打卡次数</Text>
                  </View>
                  <View className={styles.summaryStatItem}>
                    <Text className={styles.summaryStatValue} style={{ color: '#FF7D00' }}>{summary.finishCount}</Text>
                    <Text className={styles.summaryStatLabel}>完赛人数</Text>
                  </View>
                  <View className={styles.summaryStatItem}>
                    <Text className={styles.summaryStatValue} style={{ color: '#F53F3F' }}>{summary.rewardClaimedCount}</Text>
                    <Text className={styles.summaryStatLabel}>奖励已领</Text>
                  </View>
                </View>
                <View className={styles.summaryFooter}>
                  <Text className={styles.summaryTotal}>总里程：{formatDistance(summary.totalDistance)}</Text>
                  {summary.signupCount > 0 && (
                    <Text className={styles.summaryRate}>
                      完赛率：{((summary.finishCount / summary.signupCount) * 100).toFixed(1)}%
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'report' && (
        <View className={styles.section}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>按活动筛选：</Text>
            <View className={styles.filterOptions}>
              <View
                className={classnames(styles.filterOption, selectedActivityId === 'all' && styles.active)}
                onClick={() => setSelectedActivityId('all')}
              >
                全部
              </View>
              {activities.slice(0, 6).map(a => (
                <View
                  key={a.id}
                  className={classnames(styles.filterOption, selectedActivityId === a.id && styles.active)}
                  onClick={() => setSelectedActivityId(a.id)}
                >
                  {a.title.length > 6 ? a.title.slice(0, 6) + '...' : a.title}
                </View>
              ))}
            </View>
          </View>

          {filteredReported.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '120rpx 0', color: '#86909c' }}>
              <Text style={{ fontSize: '96rpx' }}>✅</Text>
              <Text style={{ display: 'block', marginTop: '24rpx', fontSize: '32rpx' }}>
                暂无待处理的举报
              </Text>
            </View>
          ) : (
            <View className={styles.reportList}>
              {filteredReported.map(report => (
                <View key={report.id} className={styles.reportItem}>
                  <View className={styles.reportHeader}>
                    <Text className={styles.reportUser}>{report.userName}</Text>
                    <Text className={styles.reportDistance}>{report.distance.toFixed(1)} km</Text>
                  </View>
                  <Text className={styles.reportReason}>
                    举报原因：{report.reason || '异常打卡，疑似作弊'}
                  </Text>
                  <View className={styles.reportActions}>
                    <Button className={styles.approveBtn} onClick={() => handleReportAction(report.id, 'approve')}>
                      通过
                    </Button>
                    <Button className={styles.rejectBtn} onClick={() => handleReportAction(report.id, 'reject')}>
                      驳回
                    </Button>
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

export default AdminPage;
