export type StudioInput = {
  name: string;
  description: string;
  audience: string;
};

export type PixVerseShot = {
  title: string;
  durationSec: number;
  prompt: string;
};

export type StudioOutput = {
  slogan: string;
  marketingScore: number; // 0..100
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    valueBullets: string[];
    sections: Array<{ title: string; body: string }>;
    cta: string;
  };
  linkedInPosts: string[];
  prompts: {
    linkedIn: string[];
    pixversePack: string;
    pixverseShots: string[];
  };
  pixverse: {
    secondsTotal: number;
    shots: PixVerseShot[];
    assemblyNote: string;
  };
};

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sentenceCase(s: string) {
  const t = s.trim();
  if (!t) return t;
  return t[0].toUpperCase() + t.slice(1);
}

export function generateCampaign(input: StudioInput): StudioOutput {
  const seed = hashSeed(`${input.name}|${input.description}|${input.audience}`);

  const verbs = ["Lance", "Accélère", "Débloque", "Simplifie", "Transforme", "Industrialise", "Amplifie"];
  const tones = [
    "sans friction",
    "en 48h",
    "avec un rendu premium",
    "avec une clarté radicale",
    "à l’échelle",
    "comme une marque iconique"
  ];
  const promise = pick(
    [
      "une campagne complète",
      "une présence qui convertit",
      "un go-to-market net",
      "un positionnement tranchant",
      "une histoire que le marché retient"
    ],
    seed + 11
  );

  const slogan = `${pick(verbs, seed)} ${sentenceCase(input.name)} — ${promise} ${pick(tones, seed + 7)}.`;

  // Score (simple heuristique lisible, orientée hackathon)
  const lengthFactor = clamp(16 - Math.abs(90 - (input.description.length + input.audience.length)), 0, 16);
  const clarityFactor = clamp(20 - Math.abs(24 - input.name.length), 0, 20);
  const nicheFactor = clamp(18 - Math.abs(70 - input.audience.length), 0, 18);
  const modeBonus = 4;
  const seedNoise = (seed % 17) - 8;
  const marketingScore = clamp(48 + lengthFactor + clarityFactor + nicheFactor + modeBonus + seedNoise, 18, 98);

  const heroTitle = `Du concept à la campagne — en 1 clic`;

  const heroSubtitle = `Tu entres le produit. On sort la campagne : storyboard PixVerse, slogan, landing + 3 posts LinkedIn.`;

  const valueBullets = [
    "Slogan marketing prêt à tester",
    "Landing page générée (copy + sections)",
    "3 posts LinkedIn (annonce / preuve / CTA)",
    "Score de potentiel marketing"
  ];

  const cta = "Générer ma campagne";

  const sections = [
    {
      title: "Pourquoi maintenant",
      body: `Les utilisateurs veulent de la valeur instantanée. ${sentenceCase(input.name)} promet ${input.description.trim()} — et on le rend visible en 30 secondes de storyboard + une page claire.`
    },
    {
      title: "Pour qui",
      body: `Audience cible : ${input.audience.trim()}. On parle leur langage, on montre le “before/after” et on finit par un call-to-action net.`
    },
    {
      title: "Ce que tu lances aujourd’hui",
      body: "Un kit complet pour tester ton positionnement : promesse, preuve, call-to-action et contenus réutilisables."
    }
  ];

  const shotBase = `minimal white studio product ad, clean background, soft shadows, editorial lighting, macro details, cinematic`;

  const shots: PixVerseShot[] = [
    {
      title: "Shot 1 — Reveal",
      durationSec: 6,
      prompt: `${shotBase}. The product "${input.name}" appears on a clean white backdrop with subtle paper grain, soft rim light. Minimal, premium.`
    },
    {
      title: "Shot 2 — Macro",
      durationSec: 6,
      prompt: `${shotBase}. Extreme close-up. Highlight texture/details. Slow camera move.`
    },
    {
      title: "Shot 3 — Demonstration",
      durationSec: 6,
      prompt: `${shotBase}. Show the product in action illustrating: ${input.description.trim()}. Simple, readable, high contrast.`
    },
    {
      title: "Shot 4 — Social proof",
      durationSec: 6,
      prompt: `${shotBase}. Happy customer moment. Confident, modern, authentic. Subtle UI overlay, minimal.`
    },
    {
      title: "Shot 5 — Call to action",
      durationSec: 6,
      prompt: `${shotBase}. Hero shot + bold on-screen text: “${input.name}”. CTA text: “Generate your campaign”. High-end, clean.`
    }
  ];

  const linkedInPosts = buildLinkedInPosts(input, slogan, marketingScore, seed);
  const linkedInPrompts = buildLinkedInPrompts(input);
  const pixverseShots = shots.map((s) => s.prompt);
  const pixversePack = buildPixVersePack(input, shots);

  return {
    slogan,
    marketingScore,
    landing: {
      heroTitle,
      heroSubtitle,
      valueBullets,
      sections,
      cta
    },
    linkedInPosts,
    prompts: {
      linkedIn: linkedInPrompts,
      pixversePack,
      pixverseShots
    },
    pixverse: {
      secondsTotal: shots.reduce((s, x) => s + x.durationSec, 0),
      shots,
      assemblyNote:
        "Astuce hackathon : génère 5 clips de 6s, puis assemble-les (cuts rapides + whoosh + soundbed). Tu obtiens 30s très “pro”."
    }
  };
}

function buildLinkedInPosts(input: StudioInput, slogan: string, score: number, seed: number): string[] {
  const hookA = pick(
    [
      "J’ai une obsession : transformer une idée en campagne en quelques minutes.",
      "Le meilleur marketing = clarté + vitesse.",
      "On perd trop de temps à “faire joli” avant d’avoir un angle qui convertit."
    ],
    seed + 71
  );
  const hookB = pick(
    [
      "Aujourd’hui, j’ai testé un format ultra-simple.",
      "Je voulais un process qui tient en une page.",
      "J’ai construit une mini-studio de lancement en mode hackathon."
    ],
    seed + 91
  );

  const post1 = [
    hookA,
    "",
    `Voici ${input.name} : ${sentenceCase(input.description)}`,
    `Cible : ${input.audience}`,
    "",
    "En 1 clic, ça génère :",
    "• un storyboard PixVerse (5 shots, 30s)",
    "• un slogan",
    "• 3 posts LinkedIn",
    "• les prompts (posts + vidéo)",
    "",
    `Score de potentiel marketing : ${score}/100`,
    "",
    "Si tu veux, je peux partager le template (prompts + structure)."
  ].join("\n");

  const post2 = [
    hookB,
    "",
    "La règle : une campagne doit raconter une histoire en 5 plans.",
    "1) reveal",
    "2) macro",
    "3) démonstration",
    "4) preuve sociale",
    "5) call-to-action",
    "",
    `Slogan test du jour : ${slogan}`,
    "",
    "Ce format est parfait pour itérer sur le positionnement (pas sur les pixels)."
  ].join("\n");

  const post3 = [
    "Question simple : ton produit est-il “filmable” en 30 secondes ?",
    "",
    `Si la réponse est oui, tu peux vendre plus vite que tu ne le penses. ${input.name} vise ${input.audience}.`,
    "",
    "Je cherche 3 personnes pour tester :",
    "• 1 description",
    "• 1 audience",
    "→ je renvoie un kit campagne (storyboard + posts).",
    "",
    "Commente “LAUNCH” et je t’envoie le formulaire."
  ].join("\n");

  return [post1, post2, post3];
}

function buildLinkedInPrompts(input: StudioInput): string[] {
  const base = [
    "Tu es un copywriter LinkedIn senior (ton clair, direct, pas de buzzword inutile).",
    `Produit: ${input.name}`,
    `Description: ${input.description}`,
    `Audience cible: ${input.audience}`,
    "Contraintes: français, phrases courtes, une idée par paragraphe, pas d’emojis, pas de hashtags.",
    "Objectif: générer un post prêt à publier."
  ].join("\n");

  const p1 = [
    base,
    "",
    "Post 1 (annonce):",
    "Structure: Hook (1 phrase) → Quoi/Pour qui → Liste courte (3-5 bullets) → Score (X/100) → CTA soft.",
    "CTA soft: proposer de partager le template / demander un commentaire."
  ].join("\n");

  const p2 = [
    base,
    "",
    "Post 2 (framework):",
    "Thème: ‘une campagne doit raconter une histoire en 5 plans’.",
    "Structure: Hook → liste 1..5 → mini conclusion → 1 question ouverte."
  ].join("\n");

  const p3 = [
    base,
    "",
    "Post 3 (CTA):",
    "Structure: Question d’ouverture → promesse → mini-offre (test) → CTA clair (commenter un mot).",
    "CTA: ‘Commente LAUNCH’."
  ].join("\n");

  return [p1, p2, p3];
}

function buildPixVersePack(input: StudioInput, shots: PixVerseShot[]): string {
  const header = [
    "PixVerse — Prompt Pack (30s total)",
    `Produit: ${input.name}`,
    `Description: ${input.description}`,
    "",
    "Style global (à coller si PixVerse supporte un prompt global):",
    "minimal white studio, clean background, soft shadows, editorial lighting, macro details, crisp typography, premium, 24fps, cinematic",
    "",
    "Shots (6s chacun):"
  ].join("\n");

  const body = shots
    .map((s, i) => [`${i + 1}) ${s.title} (${s.durationSec}s)`, s.prompt].join("\n"))
    .join("\n\n");

  return `${header}\n${body}`;
}
