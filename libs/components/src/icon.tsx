import { cn } from "@utils/class";

type IconProps = {
  className?: string;
};

export function Icon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={1000}
      height={1000}
      viewBox="0 0 1000 1000"
      fill="none"
      className={cn(className)}
    >
      <g clipPath="url(#clip0_221_2)">
        <rect
          x={349.158}
          y={145.577}
          width={501.92}
          height={501.92}
          rx={89.5542}
          transform="rotate(45 349.158 145.577)"
          stroke="currentColor"
          strokeWidth={63}
          strokeMiterlimit={1}
          strokeDasharray="104.91 104.91"
        />
        <rect
          x={650.541}
          y={101.029}
          width={564.92}
          height={564.92}
          rx={121.054}
          transform="rotate(45 650.541 101.029)"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_221_2">
          <rect width={1000} height={1000} fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}
