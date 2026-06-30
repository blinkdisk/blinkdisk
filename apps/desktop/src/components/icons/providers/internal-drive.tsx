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
        d="M85.54 17.35C83.74 15.56 81.31 14.55 78.76 14.55H21.24C18.69 14.55 16.26 15.56 14.46 17.35C12.66 19.15 11.65 21.59 11.65 24.13V65.01H88.35V24.13C88.35 21.59 87.34 19.15 85.54 17.35Z"
        stroke="currentColor"
        strokeWidth="9.59"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M94.49 79.5L89.37 69.31L88.61 67.22H11.39L10.63 69.31L5.51 79.5C5.14 80.24 4.97 81.05 5 81.87C5.04 82.69 5.29 83.49 5.72 84.19C6.15 84.89 6.76 85.46 7.48 85.86C8.2 86.25 9.01 86.46 9.83 86.45H90.17C90.99 86.46 91.8 86.25 92.52 85.86C93.24 85.46 93.85 84.89 94.28 84.19C94.71 83.49 94.96 82.69 95 81.87C95.03 81.05 94.86 80.24 94.49 79.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="9.59"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
