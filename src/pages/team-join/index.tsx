import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const TeamJoinPage: React.FC = () => {
  const joinTeamByCode = useAppStore(s => s.joinTeamByCode);
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (!code.trim()) {
      Taro.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    const result = joinTeamByCode(code.trim());
    Taro.showModal({
      title: result.success ? '加入成功' : '加入失败',
      content: result.message,
      showCancel: !result.success,
      cancelText: '重试',
      confirmText: result.success ? '返回队伍' : '好的',
      success: (res) => {
        if (res.confirm && result.success) {
          Taro.switchTab({ url: '/pages/team/index' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.heroSection}>
        <Text className={styles.heroIcon}>🤝</Text>
        <Text className={styles.heroTitle}>加入跑团</Text>
        <Text className={styles.heroDesc}>输入好友分享的邀请码，加入队伍一起跑步</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formLabel}>邀请码</Text>
        <Input
          className={styles.codeInput}
          placeholder="请输入6位邀请码"
          value={code}
          maxlength={6}
          onInput={(e) => setCode(e.detail.value.toUpperCase())}
        />
        <Button className={styles.joinButton} onClick={handleJoin}>立即加入</Button>
      </View>

      <View className={styles.hintSection}>
        <Text className={styles.hintTitle}>如何获取邀请码？</Text>
        <View className={styles.hintList}>
          <View className={styles.hintItem}>
            <Text className={styles.hintIndex}>1</Text>
            <Text>向已加入跑团的好友索要邀请码</Text>
          </View>
          <View className={styles.hintItem}>
            <Text className={styles.hintIndex}>2</Text>
            <Text>跑团团长或管理员可在"队伍管理"中查看邀请码</Text>
          </View>
          <View className={styles.hintItem}>
            <Text className={styles.hintIndex}>3</Text>
            <Text>如自行创建队伍，创建后会自动获得邀请码</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TeamJoinPage;
