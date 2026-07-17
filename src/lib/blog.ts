export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category:
    | "Investment"
    | "Buying Guide"
    | "Market Trends"
    | "Legal"
    | "Localities";
  date: string;
  readTime: string;
  image: string;
  imageAlt?: string;
  author: string;
  content: { type: "h2" | "h3" | "p" | "quote" | "ul" | "img"; text?: string; items?: string[]; caption?: string; src?: string }[];
};

const commonBody = (topic: string): Post["content"] => [
  { type: "p", text: `Kakinada's real-estate landscape has changed considerably over the past decade. This guide walks through everything you need to know about ${topic.toLowerCase()} — what to expect, what to check, and how to protect yourself as a buyer.` },
  { type: "h2", text: "Why this matters" },
  { type: "p", text: "The single largest financial decision most families ever make is a home. Getting the process right the first time avoids years of costly corrections later. In a growing city like Kakinada, the ground rules are still forming — which is exactly why buyers benefit from doing their homework." },
  { type: "quote", text: "A good property is one you understand completely before you sign anything." },
  { type: "h2", text: "What to look for" },
  { type: "ul", items: [
    "Clear, unencumbered title — verified by an independent advocate",
    "RERA registration for apartments and gated communities",
    "KAUDA / DTCP approval on plots",
    "Documented approach road, drainage and power",
    "Written agreement covering timelines, delivery, and penalties",
  ]},
  { type: "img", src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80", caption: "A site visit is the fastest way to test any claim in a brochure." },
  { type: "h2", text: "A practical process" },
  { type: "p", text: "Start with a shortlist of three to five properties that fit your budget and commute. Visit each at different times of day. Ask for the title chain going back thirty years, the encumbrance certificate, and property tax receipts. If a seller resists any of this, walk away." },
  { type: "h3", text: "Financing" },
  { type: "p", text: "Most nationalised banks lend against approved layouts. Get an in-principle sanction before you negotiate — it puts you in a stronger position and confirms the property is bankable." },
  { type: "h2", text: "How Swamy Reality Developers helps" },
  { type: "p", text: "Every one of our layouts is RERA / KAUDA approved and comes with a documented title chain. We walk you through every step — from first visit to registration — and we're here after handover, too." },
];

export const POSTS: Post[] = [
  { slug: "plot-registration-kakinada", title: "Plot Registration in Kakinada", excerpt: "A step-by-step walk through registering your plot at the sub-registrar's office in Kakinada — documents, charges, and timelines.", category: "Legal", date: "Jun 12, 2026", readTime: "8 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80", content: commonBody("plot registration") },
  { slug: "legal-process-plots-kakinada", title: "Legal Process for Plots in Kakinada", excerpt: "Title verification, encumbrance certificates and layout approvals — the legal checklist every buyer must run.", category: "Legal", date: "Jun 04, 2026", readTime: "10 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80", content: commonBody("the legal process") },
  { slug: "understanding-plot-buying-process", title: "Understanding the Plot Buying Process", excerpt: "From shortlist to registration — an unhurried, buyer-first view of how a plot purchase should actually go.", category: "Buying Guide", date: "May 28, 2026", readTime: "9 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80", content: commonBody("the plot buying process") },
  { slug: "investment-opportunities-kakinada", title: "Investment Opportunities in Kakinada", excerpt: "Where the smart money is going in 2026 — corridors, upcoming infrastructure and the localities to watch.", category: "Investment", date: "May 20, 2026", readTime: "7 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1554224154-26032cdc0dc1?auto=format&fit=crop&w=1600&q=80", content: commonBody("investment opportunities") },
  { slug: "land-price-trends-kakinada", title: "Land Price Trends in Kakinada", excerpt: "Five years of price data, what drove each move, and how to read the market going into the next cycle.", category: "Market Trends", date: "May 12, 2026", readTime: "6 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80", content: commonBody("land price trends") },
  { slug: "kakinada-real-estate-market-analysis", title: "Kakinada Real Estate Market Analysis", excerpt: "Supply, demand, absorption and rental yields — a data-led snapshot of the Kakinada market this quarter.", category: "Market Trends", date: "May 06, 2026", readTime: "11 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80", content: commonBody("the Kakinada market") },
  { slug: "choose-right-builder-kakinada", title: "How to Choose the Right Builder in Kakinada", excerpt: "Seven questions every buyer should ask before signing with any developer in the city.", category: "Buying Guide", date: "Apr 28, 2026", readTime: "8 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80", content: commonBody("choosing a builder") },
  { slug: "properties-near-jntu-kakinada", title: "Properties near JNTU Kakinada", excerpt: "A close look at the neighbourhoods around JNTU — rental demand, connectivity, and long-term value.", category: "Localities", date: "Apr 20, 2026", readTime: "6 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80", content: commonBody("properties near JNTU") },
  { slug: "apartments-in-ramanayapeta", title: "Apartments in Ramanayapeta", excerpt: "Why Ramanayapeta is quietly becoming Kakinada's most sought-after apartment corridor.", category: "Localities", date: "Apr 12, 2026", readTime: "5 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80", content: commonBody("apartments in Ramanayapeta") },
  { slug: "plots-for-sale-sarpavaram", title: "Plots for Sale in Sarpavaram", excerpt: "Wide roads, calm streets and steady appreciation — what makes Sarpavaram special right now.", category: "Localities", date: "Apr 04, 2026", readTime: "5 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80", content: commonBody("plots in Sarpavaram") },
  { slug: "best-residential-areas-kakinada", title: "Best Residential Areas in Kakinada", excerpt: "Our shortlist of the strongest neighbourhoods for families in 2026 — with why each one made it.", category: "Localities", date: "Mar 26, 2026", readTime: "9 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80", content: commonBody("the best residential areas") },
  { slug: "local-guide-kakinada-top-residential-areas", title: "A Local's Guide to Kakinada's Top Residential Areas", excerpt: "Walk each neighbourhood with us — schools, markets, temples and the small things that make a place feel like home.", category: "Localities", date: "Mar 18, 2026", readTime: "12 min read", author: "SRD Editorial", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", content: commonBody("Kakinada's top residential areas") },
];

export const BLOG_CATEGORIES = ["All", "Investment", "Buying Guide", "Market Trends", "Legal", "Localities"] as const;

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
