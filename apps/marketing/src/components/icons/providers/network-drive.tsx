export type NetworkDriveIconProps = {
  className?: string;
};

export function NetworkDriveIcon({ className }: NetworkDriveIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Network drive</title>
      <path
        d="M90.5 68H72.5C70.01 68 68 70.01 68 72.5V90.5C68 92.99 70.01 95 72.5 95H90.5C92.99 95 95 92.99 95 90.5V72.5C95 70.01 92.99 68 90.5 68Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 68H9.5C7.01 68 5 70.01 5 72.5V90.5C5 92.99 7.01 95 9.5 95H27.5C29.99 95 32 92.99 32 90.5V72.5C32 70.01 29.99 68 27.5 68Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M59 5H41C38.51 5 36.5 7.01 36.5 9.5V27.5C36.5 29.99 38.51 32 41 32H59C61.49 32 63.5 29.99 63.5 27.5V9.5C63.5 7.01 61.49 5 59 5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 68V54.5C18.5 53.31 18.97 52.16 19.82 51.32C20.66 50.47 21.81 50 23 50H77C78.19 50 79.34 50.47 80.18 51.32C81.03 52.16 81.5 53.31 81.5 54.5V68"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 50V32"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
