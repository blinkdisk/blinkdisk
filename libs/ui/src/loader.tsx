import { cn } from "@utils/class";

type LoaderProps = {
  size?: number;
  small?: boolean;
  big?: boolean;
  className?: string;
  center?: boolean;
};

export function Loader({ size, small, big, className, center }: LoaderProps) {
  function getSize() {
    if (size) return size;
    if (small) return 1;
    if (big) return 1.5;
    return 1.25;
  }

  return (
    <svg
      style={{
        width: getSize() + "rem",
        height: getSize() + "rem",
        ...(center ? { translateX: "-50%", translateY: "-50%" } : {}),
      }}
      className={cn("m-0 origin-center animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
