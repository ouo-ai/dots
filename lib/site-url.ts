// Production sets this explicitly; local builds use the purchased apex domain.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dotsai.bot").origin
