import { cn } from "@utils/class";

export type BlinkCloudIconProps = {
  className?: string;
};

export function BlinkCloudIcon({ className }: BlinkCloudIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      fill="none"
      className={cn(className)}
    >
      <rect
        width="1000"
        height="1000"
        rx="250"
        fill="url(#paint0_linear_117_2)"
      />
      <g filter="url(#filter0_d_117_2)">
        <g filter="url(#filter1_d_117_2)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M195.757 529.196L223.478 517.726C225.656 522.992 228.893 527.954 233.246 532.307L250.924 549.985L229.711 571.198L212.033 553.52C204.842 546.33 199.417 538.042 195.757 529.196ZM335.777 677.264L356.99 656.051L374.668 673.729C379.021 678.082 383.982 681.318 389.248 683.497L377.779 711.218C368.933 707.558 360.645 702.133 353.454 694.942L335.777 677.264ZM583.264 571.198L562.051 549.985L579.728 532.307C584.082 527.954 587.318 522.992 589.497 517.726L617.218 529.196C613.558 538.042 608.132 546.33 600.942 553.52L583.264 571.198ZM477.198 323.711L459.52 306.033C452.329 298.842 444.042 293.417 435.196 289.757L423.726 317.478C428.992 319.657 433.954 322.893 438.307 327.246L455.985 344.924L477.198 323.711ZM229.711 429.777L250.924 450.99L233.246 468.668C228.893 473.021 225.656 477.982 223.478 483.248L195.757 471.779C199.417 462.933 204.842 454.645 212.033 447.454L229.711 429.777ZM265.066 394.421L286.279 415.635L321.634 380.279L300.421 359.066L265.066 394.421ZM335.777 323.711L356.99 344.924L374.667 327.246C379.021 322.893 383.982 319.657 389.248 317.478L377.779 289.757C368.933 293.417 360.645 298.842 353.454 306.033L335.777 323.711ZM512.553 359.066L491.34 380.279L526.695 415.635L547.909 394.421L512.553 359.066ZM583.264 429.777L562.051 450.99L579.728 468.668C584.082 473.021 587.318 477.982 589.497 483.248L617.218 471.779C613.558 462.933 608.132 454.645 600.942 447.454L583.264 429.777ZM547.909 606.553L526.695 585.34L491.34 620.696L512.553 641.909L547.909 606.553ZM477.198 677.264L455.985 656.051L438.307 673.729C433.954 678.082 428.992 681.318 423.726 683.497L435.196 711.218C444.042 707.558 452.329 702.133 459.52 694.942L477.198 677.264ZM300.421 641.909L321.634 620.696L286.279 585.34L265.066 606.553L300.421 641.909Z"
            fill="white"
          />
        </g>
        <rect
          x="593.212"
          y="253"
          width="350"
          height="350"
          rx="75"
          transform="rotate(45 593.212 253)"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_117_2"
          x="37.0568"
          y="125.366"
          width="931.276"
          height="750.243"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="79.35" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_117_2"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_117_2"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_117_2"
          x="37.0568"
          y="131.057"
          width="738.861"
          height="738.861"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="79.35" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_117_2"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_117_2"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_117_2"
          x1="0"
          y1="0"
          x2="1000"
          y2="1000"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.01" stopColor="#6366F1" />
          <stop offset="1" stopColor="#2327D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
