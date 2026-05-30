# AI Product Launch Studio (Hackathon UI)

Page unique (Next.js + Tailwind) : formulaire → génération instantanée (mock) → rendu interactif.

## Fonctionnalités
- 1 page : **Nom** / **Description** / **Audience cible** + bouton **Generate Campaign**
- Résultat :
  - **Slogan marketing**
  - **Landing page générée** (preview + export Markdown)
  - **3 posts LinkedIn** (copiable)
  - **Score de potentiel marketing**
  - **Storyboard & prompts PixVerse** (5 shots × 6s = 30s)
  

## Lancer en local
```bash
npm install
npm run dev
```
Puis ouvre http://localhost:3000

## Landing page + hero video
La home `/` est une landing page courte. Le formulaire est sur `/studio`.

Pour afficher une vidéo dans le hero, définis:
```bash
NEXT_PUBLIC_HERO_VIDEO_URL="/hero.mp4"
```
- Si c’est un fichier local: place-le dans `public/hero.mp4`.
- Si c’est un URL mp4 direct: mets l’URL.
- Si c’est un embed (YouTube/Vimeo): mets l’URL d’embed.

## n8n webhooks (redirect + results)
La page d’accueil POST un brief à n8n puis **redirige** vers `/results/<jobId>`, qui poll un second webhook pour récupérer le JSON final.

Variables d’environnement (optionnel):
```bash
# webhook appelé au clic "Generate Campaign" (POST)
NEXT_PUBLIC_N8N_START_WEBHOOK_URL="http://localhost:5678/webhook/pixverse-launch"

# webhook pollé sur /results/<jobId> (GET ?jobId=...)
NEXT_PUBLIC_N8N_RESULT_WEBHOOK_URL="http://localhost:5678/webhook/pixverse-result"
```

Attendu côté webhook “result” (exemple):
```json
{
  "status": "pending",
  "linkedin": { "posts": [], "prompts": [] },
  "pixverse": { "negative_prompt": "", "pack": "", "shots": [] }
}
```
Quand c’est prêt, renvoie `status: "done"` + les champs remplis.

## Déploiement Vercel
- Importer le repo sur Vercel
- Build command : `npm run build`
- Output : Next.js (auto)

## Notes hackathon
- La génération est **mock** côté client (setTimeout) : parfait pour une démo instantanée.
- Tu peux remplacer `generateCampaign()` par un appel API (TRAE / OpenAI / etc.) en gardant le même rendu UI.
