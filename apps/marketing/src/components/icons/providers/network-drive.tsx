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
        d="M90.5 68H72.5C70.0147 68 68 70.0147 68 72.5V90.5C68 92.9853 70.0147 95 72.5 95H90.5C92.9853 95 95 92.9853 95 90.5V72.5C95 70.0147 92.9853 68 90.5 68Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 68H9.5C7.01472 68 5 70.0147 5 72.5V90.5C5 92.9853 7.01472 95 9.5 95H27.5C29.9853 95 32 92.9853 32 90.5V72.5C32 70.0147 29.9853 68 27.5 68Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M59 5H41C38.5147 5 36.5 7.01472 36.5 9.5V27.5C36.5 29.9853 38.5147 32 41 32H59C61.4853 32 63.5 29.9853 63.5 27.5V9.5C63.5 7.01472 61.4853 5 59 5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 68V54.5C18.5 53.3065 18.9741 52.1619 19.818 51.318C20.6619 50.4741 21.8065 50 23 50H77C78.1935 50 79.3381 50.4741 80.182 51.318C81.0259 52.1619 81.5 53.3065 81.5 54.5V68"
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
