export type AzureBlobStorageIconProps = {
  className?: string;
};

export function AzureBlobStorageIcon({ className }: AzureBlobStorageIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Azure Blob Storage</title>
      <g clipPath="url(#azure-blob-clip-0)">
        <path
          d="M28.9 6.2C29.55 4.29 31.35 3 33.37 3H63L32.25 93.8C31.6 95.71 29.8 97 27.78 97H4.72C1.49 97 -0.78 93.84 0.25 90.8L28.9 6.2Z"
          fill="url(#azure-blob-paint0)"
        />
        <path
          d="M76.38 64H29.19C27.21 64 26.25 66.4 27.7 67.74L58.02 95.73C58.91 96.55 60.07 97 61.28 97H88L76.38 64Z"
          fill="#0078D4"
        />
        <path
          d="M33.46 3C31.43 3 29.63 4.29 28.98 6.2L0.25 90.8C-0.78 93.84 1.5 97 4.73 97H27.85C29.88 97 31.69 95.71 32.34 93.8L38.05 76.98L58.26 95.74C59.14 96.55 60.29 97 61.49 97H88L76.48 64.1H42.42L63.17 3H33.46Z"
          fill="url(#azure-blob-paint1)"
        />
        <path
          d="M71.33 6.2C70.69 4.29 68.91 3 66.9 3H34H34.15C36.16 3 37.94 4.29 38.58 6.2L67 90.8C68.03 93.84 65.77 97 62.57 97H62.07H95.32C98.52 97 100.77 93.84 99.75 90.8L71.33 6.2Z"
          fill="url(#azure-blob-paint2)"
        />
      </g>
      <defs>
        <linearGradient
          id="azure-blob-paint0"
          x1="33.17"
          y1="6.25"
          x2="2.6"
          y2="96.89"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient
          id="azure-blob-paint1"
          x1="57.91"
          y1="64.11"
          x2="50.79"
          y2="66.53"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0.3" />
          <stop offset="0.07" stopOpacity="0.2" />
          <stop offset="0.32" stopOpacity="0.1" />
          <stop offset="0.62" stopOpacity="0.05" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="azure-blob-paint2"
          x1="53"
          y1="6.25"
          x2="86.77"
          y2="95.81"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3CCBF4" />
          <stop offset="1" stopColor="#2892DF" />
        </linearGradient>
        <clipPath id="azure-blob-clip-0">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
