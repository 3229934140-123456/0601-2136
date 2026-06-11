import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const toDateInputValue = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminCreatePage: React.FC = () => {
  const addActivity = useAppStore(s => s.addActivity);

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'individual' | 'team'>('individual');
  const [targetDistance, setTargetDistance] = useState('10');
  const [startTime, setStartTime] = useState(toDateInputValue(nextWeek));
  const [endTime, setEndTime] = useState(toDateInputValue(nextMonth));
  const [maxParticipants, setMaxParticipants] = useState('200');
  const [reward, setReward] = useState('完赛徽章 + 500积分');
  const [rules, setRules] = useState('1.每日最多打卡一次，单次跑步至少1公里\n2.必须上传运动APP截图作为凭证\n3.异常成绩将被审核取消');
  const [sponsor, setSponsor] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入活动名称', icon: 'none' });
      return;
    }
    if (!targetDistance || Number(targetDistance) <= 0) {
      Taro.showToast({ title: '请输入有效的里程目标', icon: 'none' });
      return;
    }
    if (!maxParticipants || Number(maxParticipants) <= 0) {
      Taro.showToast({ title: '请输入有效的人数上限', icon: 'none' });
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }

    const coverImages = [
      'https://picsum.photos/seed/run1/800/400',
      'https://picsum.photos/seed/run2/800/400',
      'https://picsum.photos/seed/run3/800/400',
      'https://picsum.photos/seed/run4/800/400'
    ];
    const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)];

    addActivity({
      title: title.trim(),
      description: description.trim() || `${title}活动，期待你的参与！`,
      coverImage: randomCover,
      type,
      targetDistance: Number(targetDistance),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      maxParticipants: Number(maxParticipants),
      reward: reward.trim() || '完赛奖励',
      rules: rules.split('\n').filter(r => r.trim()),
      sponsor: sponsor.trim() || undefined
    });

    Taro.showToast({ title: '发布成功！', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/activity/index' });
    }, 1000);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动名称 *</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：社区夏日跑步挑战赛"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动描述</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入活动的详细介绍"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动类型</Text>
          <View className={styles.typePicker}>
            <View
              className={classnames(styles.typeOption, type === 'individual' && styles.active)}
              onClick={() => setType('individual')}
            >
              个人赛
            </View>
            <View
              className={classnames(styles.typeOption, type === 'team' && styles.active)}
              onClick={() => setType('team')}
            >
              团队赛
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>目标设置</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>里程目标（km）*</Text>
          <Input
            className={styles.formInput}
            type="digit"
            placeholder="请输入里程目标"
            value={targetDistance}
            onInput={(e) => setTargetDistance(e.detail.value)}
          />
        </View>
        <View className={styles.inputRow}>
          <View className={`${styles.formItem} ${styles.inputGroup}`}>
            <Text className={styles.formLabel}>开始时间 *</Text>
            <Input
              className={styles.formInput}
              type="text"
              value={startTime}
              onInput={(e) => setStartTime(e.detail.value)}
            />
          </View>
          <View className={`${styles.formItem} ${styles.inputGroup}`}>
            <Text className={styles.formLabel}>结束时间 *</Text>
            <Input
              className={styles.formInput}
              type="text"
              value={endTime}
              onInput={(e) => setEndTime(e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>人数上限 *</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入最大参与人数"
            value={maxParticipants}
            onInput={(e) => setMaxParticipants(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>奖励与规则</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动奖励</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入活动奖励内容"
            value={reward}
            onInput={(e) => setReward(e.detail.value)}
            maxlength={100}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动规则（每行一条）</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入活动规则，每行一条"
            value={rules}
            onInput={(e) => setRules(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>赞助方（选填）</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入赞助方名称"
            value={sponsor}
            onInput={(e) => setSponsor(e.detail.value)}
            maxlength={50}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelButton} onClick={handleCancel}>取消</Button>
        <Button className={styles.submitButton} onClick={handleSubmit}>发布活动</Button>
      </View>
    </View>
  );
};

export default AdminCreatePage;
