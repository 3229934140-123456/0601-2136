export const formatDistance = (distance: number): string => {
  if (distance >= 1) {
    return distance.toFixed(1) + ' km';
  }
  return (distance * 1000).toFixed(0) + ' m';
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
    verified: '已通过',
    pending: '审核中',
    rejected: '已驳回'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    upcoming: '#165dff',
    ongoing: '#00b42a',
    ended: '#86909c',
    verified: '#00b42a',
    pending: '#ff7d00',
    rejected: '#f53f3f'
  };
  return colorMap[status] || '#86909c';
};

export const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff'
  };
  return colorMap[level] || '#86909c';
};

export const getLevelText = (level: string): string => {
  const textMap: Record<string, string> = {
    bronze: '铜',
    silver: '银',
    gold: '金',
    diamond: '钻石'
  };
  return textMap[level] || level;
};

export const calculateCalories = (distance: number, weight: number = 70): number => {
  return Math.round(distance * weight * 1.036);
};

export const calculatePace = (distance: number, duration: number): string => {
  if (distance === 0) return "0'00\"";
  const pacePerKm = duration / distance;
  const minutes = Math.floor(pacePerKm / 60);
  const seconds = Math.floor(pacePerKm % 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

export const getRankChangeText = (change: number): string => {
  if (change > 0) return `↑${change}`;
  if (change < 0) return `↓${Math.abs(change)}`;
  return '—';
};

export const getRankChangeColor = (change: number): string => {
  if (change > 0) return '#00b42a';
  if (change < 0) return '#f53f3f';
  return '#86909c';
};
