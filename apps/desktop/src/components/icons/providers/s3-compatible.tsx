export type S3CompatibleIconProps = {
  className?: string;
};

export function S3CompatibleIcon({ className }: S3CompatibleIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>S3 compatible</title>
      <path
        d="M95.7 33.17C96.27 34.15 96.6 35.3 96.6 36.51C96.6 40.21 93.61 43.2 89.92 43.2H88.85L84.17 87.7C83.63 92.8 79.32 96.68 74.18 96.68H25.38C20.24 96.68 15.93 92.82 15.39 87.7L10.75 43.2H9.69C5.99 43.2 3 40.21 3 36.51C3 35.3 3.33 34.15 3.9 33.17H95.7ZM49.8 3C66.41 3 79.89 16.48 79.89 33.09V39.77H69.86V33.09C69.86 22.01 60.87 13.03 49.8 13.03C38.73 13.03 29.74 22.01 29.74 33.09V39.77H19.71V33.09C19.71 16.48 33.19 3 49.8 3Z"
        fill="currentColor"
      />
    </svg>
  );
}
