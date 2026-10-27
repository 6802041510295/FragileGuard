export const formatDuration = (durationMs: number) => {
  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;
  const displaySeconds = seconds % 60;
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
    : `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
};

export const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

export const formatEventTime = (timestamp: number) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
