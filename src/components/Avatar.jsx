function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}
export default function Avatar({ src, name, size = 36 }) {
  const style = { width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 };
  if (src) return <img src={src} alt={name || 'Avatar'} style={style} />;
  return <div style={{ ...style, background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.36 }}>{initials(name)}</div>;
}
