export const GooglePlayBadge = () => {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-14 w-[140px]"
    >
      <rect width="120" height="40" rx="5" fill="white" />
      <path
        d="M8.445 7.75c-.237.257-.38.693-.38 1.235v22.03c0 .542.143.978.38 1.235l.062.06L20.29 20.525v-.284L8.507 7.69l-.062.06z"
        fill="url(#paint0_linear)"
      />
      <path
        d="M24.207 24.441l-3.918-3.917v-.283l3.918-3.917.088.05 4.641 2.637c1.326.753 1.326 1.986 0 2.74l-4.641 2.636-.088.054z"
        fill="url(#paint1_linear)"
      />
      <path
        d="M24.295 24.387l-3.006-3.006-12.782 12.782c.437.462 1.164.518 1.996.062l13.792-7.838"
        fill="url(#paint2_linear)"
      />
      <path
        d="M24.295 15.613L10.503 7.775c-.832-.456-1.56-.4-1.996.062L20.289 20.525l4.006-4.912z"
        fill="url(#paint3_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="19.354"
          y1="9.006"
          x2="5.055"
          y2="23.305"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A0FF" />
          <stop offset=".007" stopColor="#00A1FF" />
          <stop offset=".26" stopColor="#00BEFF" />
          <stop offset=".512" stopColor="#00D2FF" />
          <stop offset=".76" stopColor="#00DFFF" />
          <stop offset="1" stopColor="#00E3FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="30.012"
          y1="20.525"
          x2="7.493"
          y2="20.525"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE000" />
          <stop offset=".409" stopColor="#FFBD00" />
          <stop offset=".775" stopColor="#FFA500" />
          <stop offset="1" stopColor="#FF9C00" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="22.344"
          y1="22.862"
          x2="2.344"
          y2="42.862"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF3A44" />
          <stop offset="1" stopColor="#C31162" />
        </linearGradient>
        <linearGradient
          id="paint3_linear"
          x1="5.99"
          y1="-1.188"
          x2="15.99"
          y2="8.812"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#32A071" />
          <stop offset=".069" stopColor="#2DA771" />
          <stop offset=".476" stopColor="#15CF74" />
          <stop offset=".801" stopColor="#06E775" />
          <stop offset="1" stopColor="#00F076" />
        </linearGradient>
      </defs>
      <text
        x="40"
        y="13"
        fontSize="8"
        fill="black"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        GET IT ON
      </text>
      <text
        x="40"
        y="28"
        fontSize="14"
        fill="black"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Google Play
      </text>
    </svg>
  )
}
