import { Button as EmailButton } from "@react-email/components";

export function Button({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <EmailButton
      href={href}
      className="bg-primary block rounded-md px-6 py-3 text-center text-sm font-semibold text-white no-underline"
    >
      {children}
    </EmailButton>
  );
}
