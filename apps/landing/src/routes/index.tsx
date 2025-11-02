import { Faq } from "@landing/sections/faq";
import { Features } from "@landing/sections/features";
import { Hero } from "@landing/sections/hero";
import { Integrations } from "@landing/sections/integrations";
import { Problems } from "@landing/sections/problems";
import { Quote } from "@landing/sections/quote";
import { Solution } from "@landing/sections/solution";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Problems />
      <Solution />
      <Quote />
      <Features />
      <Integrations />
      <Faq />
    </>
  );
}
