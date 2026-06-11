import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { formatDate } from '@/utils';
import { currentUser } from '@/data/user';

const CheckinFormPage: React.FC = () => {
  const { activities, addCheckin } = useAppStore();

  const availableActivities = useMemo(() =>
    activities.filter(a => a.status === 'ongoing'),
    [activities]
  );

  const [activityId, setActivityId] = useState<string>(availableActivities[0]?.id || '');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [seconds, setSeconds] = useState('0');
  const [comment, setComment] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedActivity = activities.find(a => a.id === activityId);
  const timeHint = useMemo(() => {
    if (!selectedActivity) return '';
    const start = formatDate(selectedActivity.startTime);
    const end = formatDate(selectedActivity.endTime);
    return `活动允许打卡时间：${start} 至 ${end}`;
  }, [selectedActivity]);

  const handleUpload = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          setScreenshot(res.tempFilePaths[0]);
        }
      },
      fail: () => {
        setScreenshot(`https://picsum.photos/seed/${Date.now()}/400/600`);
        Taro.showToast({ title: '已使用示例图片', icon: 'none' });
      }
    });
  };

  const handleSubmit = () => {
    if (!activityId) {
      Taro.showToast({ title: '请选择活动', icon: 'none' });
      return;
    }
    const distNum = Number(distance);
    if (!distance || distNum <= 0) {
      Taro.showToast({ title: '请输入有效的跑步里程', icon: 'none' });
      return;
    }
    const duration = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    if (duration <= 0) {
      Taro.showToast({ title: '请输入有效的运动用时', icon: 'none' });
      return;
    }
    if (!screenshot) {
      Taro.showToast({ title: '请上传运动截图', icon: 'none' });
      return;
    }

    setSubmitting(true);
    const activity = activities.find(a => a.id === activityId);
    const success = addCheckin({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      activityId,
      activityTitle: activity?.title || '',
      distance: distNum,
      duration,
      image: screenshot,
      comment: comment.trim() || undefined
    });

    setTimeout(() => {
      setSubmitting(false);
      if (success) {
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/checkin/index' });
        }, 800);
      }
    }, 300);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>选择活动</Text>
        {availableActivities.length === 0 ? (
          <Text style={{ fontSize: 28, color: '#86909c' }}>暂无进行中的活动</Text>
        ) : (
          <View className={styles.activityPicker}>
            {availableActivities.map(act => (
              <View
                key={act.id}
                className={classnames(styles.activityOption, activityId === act.id && styles.active)}
                onClick={() => setActivityId(act.id)}
              >
                <View className={styles.activityInfo}>
                  <Text className={styles.activityName}>{act.title}</Text>
                  <Text className={styles.activityTime}>
                    {formatDate(act.startTime)} - {formatDate(act.endTime)} · 目标{act.targetDistance}km
                  </Text>
                </View>
                {activityId === act.id && <View className={styles.checkIcon}>✓</View>}
              </View>
            ))}
          </View>
        )}
        {timeHint && <View className={styles.timeHint}>{timeHint}</View>}
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>运动数据</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>跑步里程（km）*</Text>
          <Input
            className={styles.formInput}
            type="digit"
            placeholder="例如：5.2"
            value={distance}
            onInput={(e) => setDistance(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>运动用时 *</Text>
          <View className={styles.inputRow}>
            <View className={styles.inputGroup}>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="小时"
                value={hours}
                onInput={(e) => setHours(e.detail.value)}
              />
            </View>
            <View className={styles.inputGroup}>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="分钟"
                value={minutes}
                onInput={(e) => setMinutes(e.detail.value)}
              />
            </View>
            <View className={styles.inputGroup}>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="秒"
                value={seconds}
                onInput={(e) => setSeconds(e.detail.value)}
              />
            </View>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>运动截图 *</Text>
          {screenshot ? (
            <View className={classnames(styles.uploadBox, styles.uploaded)} onClick={handleUpload}>
              <Image className={styles.previewImage} src={screenshot} mode="aspectFill" />
            </View>
          ) : (
            <View className={styles.uploadBox} onClick={handleUpload}>
              <Text className={styles.uploadIcon}>📷</Text>
              <Text className={styles.uploadText}>点击上传截图</Text>
            </View>
          )}
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>心情留言（选填）</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="记录今天跑步的感受..."
            value={comment}
            onInput={(e) => setComment(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelButton} onClick={handleCancel}>取消</Button>
        <Button
          className={classnames(styles.submitButton, submitting && styles.disabled)}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交打卡'}
        </Button>
      </View>
    </View>
  );
};

export default CheckinFormPage;
