export type Lang = "es" | "en";

/** A string that is either language-neutral (proper nouns, names) or a pair. */
export type Localized = string | { es: string; en: string };

/** Resolve a Localized value to one language. Used where only a plain string is
 *  allowed (alt text, <title>, image alt generation) — defaults to the site's
 *  default locale. Visible UI should use the <T> component instead so both
 *  languages ship and the client toggle can swap them. */
export function pick(value: Localized, lang: Lang = "es"): string {
  return typeof value === "string" ? value : value[lang];
}

/** Chrome / UI strings (everything not coming from content frontmatter). */
export const ui = {
  nav: {
    video: { es: "VIDEO", en: "VIDEO" },
    photo: { es: "FOTO", en: "PHOTO" },
    design: { es: "DISEÑO", en: "DESIGN" },
    about: { es: "ACERCA DE MÍ", en: "ABOUT ME" },
  },
  header: {
    video: { es: "VIDEO", en: "VIDEO" },
    photo: { es: "FOTO", en: "PHOTO" },
    design: { es: "DISEÑO GRÁFICO", en: "GRAPHIC DESIGN" },
  },
  credits: { es: "CRÉDITOS", en: "CREDITS" },
  awards: { es: "PREMIOS", en: "AWARDS" },
  unknown: { es: "Desconocido", en: "Unknown" },
  moreVideos: { es: "MÁS VIDEOS", en: "MORE VIDEOS" },
  morePhotos: { es: "MÁS FOTOS", en: "MORE PHOTOS" },
  moreDesigns: { es: "MÁS DISEÑOS", en: "MORE DESIGNS" },
  backToTop: { es: "VOLVER ARRIBA", en: "BACK TO TOP" },
  backToHome: { es: "VOLVER AL INICIO", en: "BACK TO HOME" },
  aboutMe: { es: "ACERCA DE MÍ", en: "ABOUT ME" },
  downloadCv: { es: "DESCARGAR CV", en: "DOWNLOAD CV" },
  recognitions: { es: "RECONOCIMIENTOS", en: "AWARDS" },
  exhibitions: { es: "EXHIBICIONES", en: "EXHIBITIONS" },
  contact: { es: "CONTACTO", en: "CONTACT" },
} satisfies Record<string, Localized | Record<string, Localized>>;
