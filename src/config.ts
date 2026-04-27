export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  target: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
}

export interface HeroConfig {
  videoPath: string
  eyebrow: string
  titleLine: string
  titleEmphasis: string
  subtitleLine1: string
  subtitleLine2: string
  ctaText: string
  ctaTargetId: string
}

export interface ManifestoConfig {
  sectionLabel: string
  text: string
}

export interface AnatomyPillar {
  label: string
  title: string
  body: string
}

export interface AnatomyConfig {
  sectionLabel: string
  title: string
  pillars: AnatomyPillar[]
}

export interface TierConfig {
  name: string
  price: string
  frequency: string
  journeys: string
  image: string
  description: string
  amenities: string[]
  ctaText: string
  ctaHref: string
}

export interface TiersConfig {
  sectionLabel: string
  title: string
  tiers: TierConfig[]
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export interface FooterConfig {
  ageGateText: string
  brandName: string
  brandTaglineLines: string[]
  columns: FooterColumn[]
  copyright: string
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteTitle: "Smart Supply Chains — Resilient Logistics",
  siteDescription: "Predictive supply chain optimization platform with real-time disruption detection and dynamic route intelligence.",
}

export const navigationConfig: NavigationConfig = {
  brandName: "NexusChain",
  links: [
    { label: "Platform", target: "#manifesto" },
    { label: "Capabilities", target: "#anatomy" },
    { label: "Solutions", target: "#tiers" },
    { label: "Dashboard", target: "/dashboard" },
  ],
}

export const heroConfig: HeroConfig = {
  videoPath: "videos/hero.mp4",
  eyebrow: "Predictive Logistics Intelligence",
  titleLine: "Don't Monitor.",
  titleEmphasis: "Predict & Prevent.",
  subtitleLine1: "Real-time disruption detection across multimodal networks",
  subtitleLine2: "with AI-powered route optimization and proactive risk mitigation.",
  ctaText: "Explore Platform",
  ctaTargetId: "#tiers",
}

export const manifestoConfig: ManifestoConfig = {
  sectionLabel: "Our Philosophy",
  text: "Most supply chain tools tell you something broke. We tell you something is about to break — with a recommended fix already queued. By fusing IoT telemetry, machine learning forecasting, and dynamic network optimization, we transform reactive logistics into predictive, self-healing supply chains that anticipate disruption before it cascades.",
}

export const anatomyConfig: AnatomyConfig = {
  sectionLabel: "Core Capabilities",
  title: "The Anatomy of Resilient Logistics",
  pillars: [
    {
      label: "PREDICTION",
      title: "Preemptive Disruption Detection",
      body: "Our ML ensemble models — XGBoost, LSTM networks, and deep reinforcement learning — continuously analyze millions of transit data points to forecast delays, weather impacts, and supplier failures 24-48 hours before they occur. Confidence scores above 85% trigger automatic alert generation and contingency routing.",
    },
    {
      label: "OPTIMIZATION",
      title: "Dynamic Route Reconfiguration",
      body: "When risk thresholds are breached, our optimization engine instantly evaluates alternative corridors across truck, rail, air, and ocean modes. It balances cost, speed, carbon footprint, and reliability to recommend the optimal pivot — then auto-executes with carrier re-assignment and warehouse pre-positioning.",
    },
    {
      label: "RESILIENCE",
      title: "Self-Healing Network Intelligence",
      body: "The digital supply chain twin maintains a live mirror of your network. It simulates what-if scenarios — port closures, demand surges, geopolitical shocks — and stress-tests your logistics graph to identify hidden bottlenecks before they propagate into systemic delays.",
    },
  ],
}

export const tiersConfig: TiersConfig = {
  sectionLabel: "Deployment Tiers",
  title: "Scale to Your Network Complexity",
  tiers: [
    {
      name: "Essential",
      price: "$2,400",
      frequency: "per month",
      journeys: "Up to 1,000 concurrent shipments",
      image: "images/tier-01.jpg",
      description: "Real-time tracking, basic disruption alerts, and standard route analytics for emerging supply chain operations.",
      amenities: [
        "Shipment visibility dashboard",
        "Email & SMS alerts",
        "Basic delay prediction",
        "Standard route optimization",
        "7-day data retention",
      ],
      ctaText: "Deploy Essential",
      ctaHref: "/dashboard",
    },
    {
      name: "Professional",
      price: "$6,800",
      frequency: "per month",
      journeys: "Up to 10,000 concurrent shipments",
      image: "images/tier-02.jpg",
      description: "Advanced predictive analytics, digital twin simulation, and automated route reconfiguration for growing logistics networks.",
      amenities: [
        "Everything in Essential",
        "AI-powered delay forecasting",
        "Digital twin scenario modeling",
        "Automated rerouting engine",
        "Multi-modal optimization",
        "90-day analytics history",
      ],
      ctaText: "Deploy Professional",
      ctaHref: "/dashboard",
    },
    {
      name: "Enterprise",
      price: "Custom",
      frequency: "annual contract",
      journeys: "Unlimited global scale",
      image: "images/tier-03.jpg",
      description: "Full-scale resilience platform with custom ML model training, dedicated infrastructure, and white-glove implementation.",
      amenities: [
        "Everything in Professional",
        "Custom prediction models",
        "Private cloud or on-premise",
        "Kafka event streaming",
        "SLA guarantees & 24/7 SRE",
        "Unlimited data retention",
        "Dedicated customer engineer",
      ],
      ctaText: "Contact Sales",
      ctaHref: "/dashboard",
    },
  ],
}

export const footerConfig: FooterConfig = {
  ageGateText: "Engineered for the next era of intelligent logistics.",
  brandName: "NexusChain",
  brandTaglineLines: [
    "Predictive Supply Chain Intelligence",
    "Built for resilience at global scale.",
  ],
  columns: [
    {
      heading: "Platform",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Shipments", href: "/shipments" },
        { label: "Network Map", href: "/network" },
        { label: "Analytics", href: "/analytics" },
      ],
    },
    {
      heading: "Intelligence",
      links: [
        { label: "Predictions", href: "/analytics" },
        { label: "Disruptions", href: "/alerts" },
        { label: "Route Optimizer", href: "/routes" },
        { label: "Telemetry", href: "/shipments" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#manifesto" },
        { label: "Research", href: "#anatomy" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
        { label: "Compliance", href: "#" },
      ],
    },
  ],
  copyright: "NexusChain Inc. All rights reserved.",
}
