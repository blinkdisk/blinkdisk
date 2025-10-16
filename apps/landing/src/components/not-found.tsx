import { Button } from "@ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="flex max-w-[80vw] flex-col items-center sm:max-w-sm">
        <h1 className="text-primary text-lg font-medium uppercase tracking-widest">
          404 - Not Found
        </h1>
        <p className="mt-4 text-center text-4xl font-bold sm:text-5xl">
          This page was
          <br className="hidden sm:block" /> not backed up.
        </p>
        <p className="text-muted-foreground mt-4 text-center text-sm sm:text-base">
          We tried restoring it, but it’s gone forever.
          <br className="hidden sm:block" /> (You do have your files backed up…
          right?)
        </p>
        <Button as="link" to="/" className="mt-10" size="lg">
          Back to Home
        </Button>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
