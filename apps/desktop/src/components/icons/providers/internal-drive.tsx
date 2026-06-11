export type InternalDriveIconProps = {
  className?: string;
};

export function InternalDriveIcon({ className }: InternalDriveIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>This computer</title>
      <path
        d="M85.5428 17.3541C83.7447 15.5561 81.306 14.5459 78.7632 14.5459H21.2368C18.694 14.5459 16.2553 15.5561 14.4572 17.3541C12.6592 19.1522 11.649 21.5908 11.649 24.1337V65.0062H88.351V24.1337C88.351 21.5908 87.3408 19.1522 85.5428 17.3541Z"
        stroke="currentColor"
        strokeWidth="9.58774"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M94.4871 79.5029L89.3672 69.3063L88.6099 67.2162H11.3903L10.6327 69.3063L5.51287 79.5029C5.14328 80.2363 4.9683 81.0523 5.00471 81.8728C5.04113 82.6932 5.2877 83.4906 5.72081 84.1883C6.15391 84.8861 6.75901 85.4609 7.47809 85.8576C8.19717 86.2544 9.00611 86.4597 9.82735 86.454H90.1726C90.9938 86.4597 91.8028 86.2544 92.5219 85.8576C93.2409 85.4609 93.846 84.8861 94.2791 84.1883C94.7122 83.4906 94.9588 82.6932 94.9952 81.8728C95.0316 81.0523 94.8567 80.2363 94.4871 79.5029Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9.58774"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
