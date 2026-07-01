export type GoogleCloudStorageIconProps = {
  className?: string;
};

export function GoogleCloudStorageIcon({
  className,
}: GoogleCloudStorageIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Google Cloud Storage</title>
      <g clipPath="url(#google-cloud-storage-clip-0)">
        <path
          d="M66.5 31.96L75.2 23.27L75.78 19.61C59.94 5.2 34.76 6.84 20.48 23.02C16.51 27.51 13.57 33.11 12 38.9L15.11 38.46L32.5 35.59L33.84 34.22C41.57 25.72 54.65 24.58 63.58 31.81L66.5 31.96Z"
          fill="#EA4335"
        />
        <path
          d="M87.58 38.64C85.58 31.28 81.48 24.67 75.78 19.61L63.58 31.81C66.12 33.89 68.16 36.51 69.54 39.49C70.91 42.47 71.6 45.73 71.54 49.01V51.18C77.53 51.18 82.4 56.04 82.4 62.03C82.4 68.03 77.53 72.77 71.54 72.77H49.79L47.66 75.09V88.11L49.79 90.15H71.54C87.13 90.28 99.88 77.85 100 62.25C100.03 57.6 98.92 53.01 96.75 48.89C94.59 44.77 91.44 41.25 87.58 38.64Z"
          fill="#4285F4"
        />
        <path
          d="M28.07 90.15H49.79V72.77H28.07C26.54 72.77 25.02 72.44 23.62 71.79L20.54 72.74L11.79 81.43L11.02 84.39C15.93 88.1 21.92 90.18 28.07 90.15Z"
          fill="#34A853"
        />
        <path
          d="M28.07 33.76C12.48 33.85 -0.09 46.57 0 62.17C0.03 66.47 1.03 70.71 2.94 74.56C4.85 78.41 7.62 81.77 11.02 84.39L23.62 71.79C18.16 69.32 15.73 62.89 18.2 57.43C20.67 51.96 27.1 49.53 32.56 52C34.97 53.09 36.9 55.02 37.99 57.43L50.58 44.83C47.94 41.38 44.53 38.58 40.63 36.66C36.72 34.74 32.43 33.74 28.07 33.76Z"
          fill="#FBBC05"
        />
      </g>
      <defs>
        <clipPath id="google-cloud-storage-clip-0">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
