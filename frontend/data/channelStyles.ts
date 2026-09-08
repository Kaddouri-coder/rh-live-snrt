// Badges de chaîne : couleur + initiales par défaut, ou vrai logo si disponible.
export interface ChannelStyle {
  initials: string;
  color: string;
  logo?: string;
}

const CHANNEL_STYLES: Record<string, ChannelStyle> = {
  'Al Aoula': { initials: 'AO', color: '#c0392b', logo: '/logos-chaines/al-aoula.png' },
  '2M': { initials: '2M', color: '#1f3a93', logo: '/logos-chaines/2m.png' },
  'Arryadia': { initials: 'AR', color: '#16a085', logo: '/logos-chaines/arryadia.png' },
  'Assadissa': { initials: 'AS', color: '#7d5ba6', logo: '/logos-chaines/assadissa.png' },
  'Al Maghribia': { initials: 'AM', color: '#d68910', logo: '/logos-chaines/al-maghribia.png' },
  'Laâyoune': { initials: 'LY', color: '#2471a3', logo: '/logos-chaines/laayoune.png' },
  'Tamazight': { initials: 'TZ', color: '#b7950b', logo: '/logos-chaines/tamazight.png' },
  'Chada TV': { initials: 'CH', color: '#a93226', logo: '/logos-chaines/chada-tv.png' },
};

const FALLBACK_STYLE: ChannelStyle = { initials: '—', color: '#3a4750' };

export function getChannelStyle(chaineName: string): ChannelStyle {
  return CHANNEL_STYLES[chaineName] || FALLBACK_STYLE;
}