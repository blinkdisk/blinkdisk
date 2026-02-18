export function initLightbox() {
  const lightbox = document.querySelector("[data-lightbox]") as HTMLElement;
  const lightboxImage = document.querySelector("[data-lightbox-image]") as HTMLImageElement;
  const triggers = document.querySelectorAll("[data-lightbox-trigger]");
  const backdrop = document.querySelector("[data-lightbox-backdrop]");

  function openLightbox(src: string, alt: string) {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.remove("hidden");
    lightbox.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    document.body.style.overflow = "";
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (window.innerWidth < 768) return;
      const src = trigger.getAttribute("data-src") || "";
      const alt = trigger.getAttribute("data-alt") || "";
      openLightbox(src, alt);
    });
  });

  backdrop?.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.classList.contains("hidden")) {
      closeLightbox();
    }
  });
}

initLightbox();
