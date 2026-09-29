import { siteUrl } from "@/lib/site-url"

const description =
  "Dots is a 24/7 on-demand AI personal assistant for questions, plans, and tasks. Submit a request anytime, follow its status in a thread, and review the result when it is ready."

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Dots",
        url: siteUrl,
        description,
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#application`,
        name: "Dots",
        url: `${siteUrl}/app`,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description,
        featureList: [
          "On-demand answers to questions",
          "Structured planning and task organization",
          "Task status tracking in conversation threads",
        ],
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
