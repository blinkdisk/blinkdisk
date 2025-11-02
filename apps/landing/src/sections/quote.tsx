import { StarIcon } from "lucide-react";

export function Quote() {
  return (
    <section
      id="quote"
      className="w-content mx-auto px-6 py-16 sm:px-0 sm:py-24 md:max-w-3xl"
    >
      <figure className="w-full">
        <p className="sr-only">5 out of 5 stars</p>
        <div className="flex gap-1">
          <StarIcon className="fill-primary text-primary size-5 flex-none" />
          <StarIcon className="fill-primary text-primary size-5 flex-none" />
          <StarIcon className="fill-primary text-primary size-5 flex-none" />
          <StarIcon className="fill-primary text-primary size-5 flex-none" />
          <StarIcon className="fill-primary text-primary size-5 flex-none" />
        </div>
        <blockquote className="mt-8 text-xl/8 font-semibold tracking-tight sm:text-2xl/9">
          <p>
            “A few months ago, my hard drive suddenly died. Years of work,
            photos, and memories were gone in an instant. If I had set up
            BlinkDisk before, it would’ve taken five minutes to protect
            everything.”
          </p>
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-4">
          <img
            alt="Simon K."
            src="/images/simon.jpg"
            className="size-10 rounded-full bg-gray-50 dark:bg-gray-800"
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Simon K.</p>
            <p className="text-muted-foreground text-sm">BlinkDisk User</p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
