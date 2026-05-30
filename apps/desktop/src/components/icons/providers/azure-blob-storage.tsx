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
          d="M28.903 6.19773C29.55 4.28701 31.3481 3.00066 33.3717 3.00066H62.9999L32.2475 93.8039C31.6004 95.7145 29.8024 97.0007 27.7789 97.0007H4.7199C1.4933 97.0007 -0.780581 93.8441 0.251219 90.7978L28.903 6.19773Z"
          fill="url(#azure-blob-paint0)"
        />
        <path
          d="M76.3846 64.0007H29.1892C27.2061 64.0007 26.2487 66.4028 27.6984 67.7407L58.0248 95.7325C58.9075 96.5472 60.0699 97.0007 61.2771 97.0007H87.9999L76.3846 64.0007Z"
          fill="#0078D4"
        />
        <path
          d="M33.4627 3.00066C31.4336 3.00066 29.6307 4.28701 28.9819 6.19773L0.251905 90.7978C-0.782712 93.8441 1.49738 97.0007 4.73278 97.0007H27.8547C29.8837 97.0007 31.6867 95.7145 32.3356 93.8039L38.0472 76.9847L58.2616 95.7352C59.1373 96.548 60.2905 96.9995 61.4887 96.9995H87.9999L76.476 64.0994H42.423L63.1719 3.00066H33.4627Z"
          fill="url(#azure-blob-paint1)"
        />
        <path
          d="M71.3301 6.19768C70.6885 4.28702 68.9051 3.00066 66.8976 3.00066H33.9999H34.15C36.1572 3.00066 37.9408 4.28702 38.5826 6.19768L67.0028 90.7978C68.0263 93.8441 65.7706 97.0007 62.5703 97.0007H62.0694H95.3181C98.5184 97.0007 100.774 93.8441 99.7506 90.7978L71.3301 6.19768Z"
          fill="url(#azure-blob-paint2)"
        />
      </g>
      <defs>
        <linearGradient
          id="azure-blob-paint0"
          x1="33.1698"
          y1="6.25431"
          x2="2.59646"
          y2="96.8893"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient
          id="azure-blob-paint1"
          x1="57.9131"
          y1="64.1103"
          x2="50.7941"
          y2="66.5325"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0.3" />
          <stop offset="0.0711768" stopOpacity="0.2" />
          <stop offset="0.321031" stopOpacity="0.1" />
          <stop offset="0.623053" stopOpacity="0.05" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="azure-blob-paint2"
          x1="52.9962"
          y1="6.25449"
          x2="86.766"
          y2="95.8101"
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
