
export const formatYoutubeDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) {
    return '0:00';
  }

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  return `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`;
};