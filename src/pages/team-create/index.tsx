import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const TeamCreatePage: React.FC = () => {
  const createTeam = useAppStore(s => s.createTeam);

  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [maxMembers, setMaxMembers] = useState('20');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入队伍名称', icon: 'none' });
      return;
    }
    if (!maxMembers || Number(maxMembers) < 2) {
      Taro.showToast({ title: '队伍人数至少2人', icon: 'none' });
      return;
    }
    const code = createTeam({
      name: name.trim(),
      slogan: slogan.trim() || '一起跑步，共同进步！',
      maxMembers: Number(maxMembers)
    });
    setCreatedCode(code);
  };

  const handleCopy = () => {
    if (createdCode) {
      Taro.setClipboardData({
        data: createdCode,
        success: () => Taro.showToast({ title: '邀请码已复制', icon: 'success' })
      });
    }
  };

  const handleBack = () => {
    Taro.switchTab({ url: '/pages/team/index' });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  if (createdCode) {
    return (
      <View className={styles.page}>
        <View className={styles.resultCard}>
          <Text className={styles.resultIcon}>🎉</Text>
          <Text className={styles.resultTitle}>队伍创建成功！</Text>
          <Text className={styles.resultDesc}>分享邀请码给好友，邀请他们加入吧</Text>
        </View>

        <View className={styles.codeBox}>
          <Text className={styles.codeLabel}>队伍邀请码</Text>
          <Text className={styles.codeText}>{createdCode}</Text>
          <Text className={styles.codeTip}>发送邀请码给好友，好友通过邀请码即可加入队伍</Text>
        </View>

        <Button className={styles.copyButton} onClick={handleCopy}>复制邀请码</Button>
        <Button className={styles.backButton} onClick={handleBack}>返回队伍页</Button>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>队伍信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>队伍名称 *</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：阳光跑团"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>队伍口号</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入队伍口号，激励队友！"
            value={slogan}
            onInput={(e) => setSlogan(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>人数上限 *</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入最大成员数"
            value={maxMembers}
            onInput={(e) => setMaxMembers(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelButton} onClick={handleCancel}>取消</Button>
        <Button className={styles.submitButton} onClick={handleSubmit}>创建队伍</Button>
      </View>
    </View>
  );
};

export default TeamCreatePage;
