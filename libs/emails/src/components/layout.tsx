import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Tailwind,
} from "@react-email/components";

export interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#6366f1",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-white font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-lg p-5">
            {children}
            <Hr className="my-10 border-gray-300" />
            <Link
              href="https://blinkdisk.com"
              className="text-sm text-gray-500"
            >
              BlinkDisk
            </Link>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
