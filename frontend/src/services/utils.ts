export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PREPARATION': 'bg-military-metal text-white',
    'EN_COURS': 'bg-military-green text-dark-900',
    'CRITIQUE': 'bg-military-alert text-white',
    'TERMINE': 'bg-military-green-bright text-dark-900',
    'ACTIF': 'bg-military-green text-dark-900',
    'INACTIF': 'bg-military-charcoal-light text-white',
    'OCCUPE': 'bg-military-radar text-dark-900',
    'TODO': 'bg-military-charcoal-light text-white',
    'EN_REVIEW': 'bg-military-radar text-dark-900',
    'COMPLETEE': 'bg-military-green-bright text-dark-900',
    'BLOQUEE': 'bg-military-alert text-white',
  };
  return statusMap[status] || 'bg-military-charcoal-light text-white';
};

export const getPriorityIcon = (priority: string) => {
  const iconMap: { [key: string]: string } = {
    'BASSE': '⬇️',
    'MOYENNE': '➡️',
    'HAUTE': '⬆️',
    'CRITIQUE': '🚨',
  };
  return iconMap[priority] || '•';
};

export const calculateProgressColor = (progress: number) => {
  if (progress < 25) return 'alert';
  if (progress < 50) return 'radar';
  if (progress < 75) return 'green';
  return 'green';
};
