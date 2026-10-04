export const calcRemainingMs = (slaDeadline: string | number): number => {
  const deadlineMs =
    typeof slaDeadline === 'string'
      ? new Date(slaDeadline).getTime()
      : slaDeadline;
  
  // If invalid date, return 0 or maybe a very large number? 
  // Let's return 0 to trigger breach if backend sends garbage
  if (isNaN(deadlineMs)) return 0;

  return deadlineMs - Date.now();
};

export const calcSeverityZone = (remainingMs: number): 'CRITICAL' | 'WARNING' | 'NORMAL' => {
  const mins = remainingMs / 60000;
  if (mins < 30) return 'CRITICAL';
  if (mins <= 120) return 'WARNING';
  return 'NORMAL';
};

export const formatSlaCountdown = (remainingMs: number): string => {
  if (remainingMs <= 0) return 'BREACH';
  const totalMins = Math.floor(remainingMs / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
