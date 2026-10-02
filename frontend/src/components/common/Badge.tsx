interface BadgeProps {
  type: 'status' | 'priority';
  label: string;
}

export default function Badge({ type, label }: BadgeProps) {
  // Normalize label for class name
  const normalized = label.toLowerCase().replace(/\s+/g, '-');
  const className = `badge badge-${type} badge-${type}-${normalized}`;

  return <span className={className}>{label}</span>;
}
