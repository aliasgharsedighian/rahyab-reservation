const ForkKnifeIcon = ({ size = 64, color = "black" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fork /}
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        <line x1="20" y1="6" x2="20" y2="26" />
        <line x1="16" y1="6" x2="16" y2="18" />
        <line x1="24" y1="6" x2="24" y2="18" />
        <line x1="20" y1="26" x2="20" y2="58" />
      </g>

      {/ Knife */}
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M40 6 C44 14, 44 26, 40 34 L40 58" />
      </g>
    </svg>
  );
};
