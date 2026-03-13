export default function PinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 14 / 12)}
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", flexShrink: 0 }}
    >
      <path
        d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
        fill="#ef4444"
      />
      <circle cx="6" cy="5" r="1.8" fill="#fff" />
    </svg>
  );
}
