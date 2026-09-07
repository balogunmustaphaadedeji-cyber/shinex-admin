export default function ShinexLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#0B3D24" />
      <path d="M32 12c-6 0-9 3-9 7s3 6 8 7.5c5 1.5 7 3 7 6s-3 5-8 5c-4.5 0-7.5-1.7-9-4.5"
        stroke="url(#g)" strokeWidth="4.4" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="35" r="2.1" fill="#fff" />
      <circle cx="23" cy="35" r="2.1" fill="#fff" />
      <path d="M9 17h3l2 12.5h10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="g" x1="23" y1="12" x2="37" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3FC773" /><stop offset="1" stopColor="#1FAE5C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
