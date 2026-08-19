export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUpcoming: boolean;
  formatted: string;
}

export function getTimeRemaining(startTimeStr: string, endTimeStr: string): TimeRemaining {
  const now = Date.now();
  const start = new Date(startTimeStr).getTime();
  const end = new Date(endTimeStr).getTime();

  if (now < start) {
    const diff = Math.max(0, start - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const formatted = days > 0
      ? `Inicia en ${days}d ${hours}h ${minutes}m`
      : `Inicia en ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      totalMs: diff,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      isUpcoming: true,
      formatted
    };
  }

  const diff = Math.max(0, end - now);
  const isExpired = diff <= 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let formatted = 'Finalizado';
  if (!isExpired) {
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m restantes`;
    } else {
      formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    isUpcoming: false,
    formatted
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
}
