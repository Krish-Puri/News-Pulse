export const SOURCES = [
  {
    id: 'BBC',
    name: 'BBC News',
    label: 'BBC',
    color: '#DC2626', // Red
    borderColor: 'border-red-600',
    bgColor: 'bg-red-600',
    lightBg: 'bg-red-500/10',
    dotColor: '#DC2626'
  },
  {
    id: 'NPR',
    name: 'NPR News',
    label: 'NPR',
    color: '#2563EB', // Blue
    borderColor: 'border-blue-600',
    bgColor: 'bg-blue-600',
    lightBg: 'bg-blue-500/10',
    dotColor: '#2563EB'
  },
  {
    id: 'Reuters',
    name: 'Reuters World',
    label: 'Reuters',
    color: '#D97706', // Amber/Orange
    borderColor: 'border-amber-600',
    bgColor: 'bg-amber-600',
    lightBg: 'bg-amber-500/10',
    dotColor: '#D97706'
  },
  {
    id: 'Guardian',
    name: 'The Guardian',
    label: 'Guardian',
    color: '#059669', // Emerald/Green
    borderColor: 'border-emerald-600',
    bgColor: 'bg-emerald-600',
    lightBg: 'bg-emerald-500/10',
    dotColor: '#059669'
  }
];

export const SOURCE_COLOR_MAP = SOURCES.reduce((acc, s) => {
  acc[s.id] = s.color;
  return acc;
}, {});
