export type ExternalDriveIconProps = {
  className?: string;
};

export function ExternalDriveIcon({ className }: ExternalDriveIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>External drive</title>
      <path
        d="M94.76 50.06H5.24M5.95 48.1C5.33 49.35 5 50.73 5 52.13V77C5 79.39 5.95 81.68 7.64 83.36C9.32 85.05 11.61 86 14 86H86C88.39 86 90.68 85.05 92.36 83.36C94.05 81.68 95 79.39 95 77V52.13C95 50.73 94.67 49.35 94.05 48.1L79.47 19C78.73 17.5 77.58 16.23 76.16 15.35C74.74 14.47 73.09 14 71.42 14H28.58C26.91 14 25.26 14.47 23.84 15.35C22.42 16.23 21.27 17.5 20.52 19L5.95 48.1Z"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M93 85H7V51H93V85ZM23 63.5C20.51 63.5 18.5 65.51 18.5 68C18.5 70.49 20.51 72.5 23 72.5H23.04C25.53 72.5 27.54 70.49 27.54 68C27.54 65.51 25.53 63.5 23.04 63.5H23ZM41 63.5C38.51 63.5 36.5 65.51 36.5 68C36.5 70.49 38.51 72.5 41 72.5H41.04C43.53 72.5 45.54 70.49 45.54 68C45.54 65.51 43.53 63.5 41.04 63.5H41Z"
        fill="currentColor"
      />
    </svg>
  );
}
