# Carte de visite numérique — Camille Perraudeau

Site statique (HTML5 / CSS3 / JavaScript vanilla), pensé mobile-first pour une
consultation principale via scan NFC, et déployable gratuitement sur GitHub Pages.

## ✅ À personnaliser avant la mise en ligne

Tout ce qui suit est actuellement rempli avec des valeurs *plausibles mais
factices*, pour que le site fonctionne dès l'ouverture. Cherchez les
commentaires `<!-- À personnaliser -->` dans le code pour les retrouver.

| Élément | Où | Valeur actuelle (à remplacer) |
|---|---|---|
| Photo professionnelle | `assets/img/photo-camille.jpg` | absente — un monogramme « CP » s'affiche en attendant (dégradation propre, aucune image cassée) |
| E-mail | `index.html` → bloc `#contact-config`, section Contact, `cv.pdf` | `contact@camille-perraudeau.fr` |
| Téléphone | idem | `06 00 00 00 00` |
| Nom d'utilisateur GitHub | `#contact-config` (champ `github`) | `camille-perraudeau` |
| LinkedIn | `#contact-config` (champ `linkedin`) | `camille-perraudeau` |
| Instagram (optionnel) | section Contact — supprimez le `<li>` si inutile | vide |
| URL définitive du site | `index.html` (canonical, OG, Twitter), `robots.txt`, `sitemap.xml`, `manifest.json` | `https://camille-perraudeau.github.io/` |
| CV | `cv.pdf` à la racine | un CV minimal généré automatiquement à partir des informations confirmées (voir `scripts/generate_cv_placeholder.py`) — remplacez-le par votre CV définitif |
| Projet « ShieldCall » | section Projets | description à compléter, je n'avais pas cette information |

**Important — un seul endroit à modifier pour les coordonnées :** le bloc
`<script type="application/json" id="contact-config">` en haut du `<body>`
d'`index.html` est la source unique utilisée pour générer la vCard
(bouton « Ajouter aux contacts »). Les liens visibles (mailto, tel, GitHub,
LinkedIn) sont à mettre à jour séparément dans le HTML pour rester cohérents
— ils sont regroupés dans le hero et la section Contact.

## 📁 Structure

```
index.html              Page unique (toutes les sections)
manifest.json            Manifeste PWA
sw.js                     Service worker (cache app shell, hors-ligne minimal)
robots.txt / sitemap.xml SEO
favicon.svg / favicon.ico
cv.pdf                    CV téléchargeable (placeholder, cf. ci-dessus)
assets/
  css/style.css           Feuille de style unique
  js/main.js              Comportements (thème, nav, vCard, GitHub, QR…)
  icons/                  Icônes PWA (192, 512, maskable, apple-touch-icon)
  img/                    Illustrations, photo, image Open Graph
  fonts/                  Vide — voir section Polices ci-dessous
scripts/                  Scripts Python facultatifs ayant servi à générer
                          les icônes et le CV placeholder (non nécessaires
                          au fonctionnement du site, utiles si vous changez
                          la palette ou voulez régénérer ces fichiers)
```

## 🎨 Choix de conception

- **Palette** : fond quasi noir (`--ink`), texte blanc cassé (`--mist`),
  accent principal vert forêt (`--canopy`) et accent secondaire bleu profond
  (`--dusk`), utilisés ensemble en dégradé pour le monogramme et
  l'illustration GSIE plutôt qu'un seul accent isolé.
- **Typographie** : Manrope pour les titres (plus affirmée), Inter pour le
  texte courant (excellente lisibilité en petite taille sur mobile), une
  pile monospace système pour les éléments techniques (tags, versions).
  Les deux polices sont chargées via Google Fonts avec `font-display: swap`
  et préconnexion — voir la note « Polices » plus bas pour un hébergement
  100 % local.
- **Signature visuelle** : une carte topographique reliée par un réseau
  maillé de capteurs (section GSIE, et en filigrane très discret dans le
  hero), qui matérialise littéralement ce que fait GSIE — lire le terrain
  via un réseau de capteurs — plutôt qu'une illustration décorative
  générique.
- **Animations** : une seule séquence orchestrée à l'arrivée sur le hero
  (apparition en cascade), des révélations discrètes au défilement, et le
  pouls des nœuds de l'illustration GSIE. Tout respecte
  `prefers-reduced-motion`.

## 🚀 Déploiement sur GitHub Pages

1. Créez un dépôt GitHub (par exemple `carte-visite` ou directement
   `camille-perraudeau.github.io` pour un site à la racine de votre compte).
2. Poussez l'intégralité de ce dossier à la racine du dépôt (`index.html`
   doit être à la racine, pas dans un sous-dossier).
3. Dans **Settings → Pages**, choisissez la branche `main` et le dossier
   `/ (root)` comme source.
4. Une fois le site en ligne, mettez à jour toutes les occurrences de
   `https://camille-perraudeau.github.io/` (voir tableau ci-dessus) avec
   l'URL réelle, en particulier si vous déployez sous
   `username.github.io/carte-visite/` (URL avec sous-chemin) plutôt qu'à la
   racine — dans ce cas, les chemins absolus commençant par `/` (CSS, JS,
   manifest…) devront aussi être adaptés en chemins relatifs ou préfixés du
   nom du dépôt.
5. Si vous branchez un nom de domaine personnalisé, ajoutez un fichier
   `CNAME` à la racine (non inclus ici).

## 🔤 Polices : CDN vs auto-hébergement

Par défaut, Manrope et Inter sont chargées depuis Google Fonts (rapide à
mettre en place, bien optimisé avec `preconnect` + `font-display: swap`).
Pour un site 100 % autonome (et un point de plus sur le score de
confidentialité), téléchargez les fichiers `.woff2` correspondants et
placez-les dans `assets/fonts/`, puis remplacez les balises `<link>` Google
Fonts dans `index.html` par une règle `@font-face` en haut de
`assets/css/style.css`.

## 📡 Fonctionnalités qui dépendent d'un service externe

- **Dépôts GitHub récents** (`assets/js/main.js`) : interroge
  `api.github.com` sans authentification (60 requêtes/heure/IP — largement
  suffisant pour une carte de visite). En cas d'échec, un message de repli
  s'affiche au lieu d'un bloc cassé.
- **QR code** : la bibliothèque (~5 Ko, sans dépendance) n'est chargée
  qu'au clic sur « Afficher le QR code », depuis un CDN. Pour un hors-ligne
  total, téléchargez `qrcode.min.js` et adaptez le chemin dans `main.js`
  (commentaire à l'endroit concerné).
- **Carte de localisation** : `iframe` OpenStreetMap centrée sur la région
  de Poitiers (aucune adresse précise, conformément au brief).

## 🧪 Vérification manuelle recommandée

Le HTML, le CSS et le JavaScript ont été validés syntaxiquement (balises
équilibrées, JSON valide, JS sans erreur de syntaxe), mais aucun navigateur
n'était disponible dans l'environnement de génération pour un audit
Lighthouse réel. Avant publication définitive :
- Ouvrez le site avec un petit serveur local (`python3 -m http.server`
  depuis ce dossier) plutôt qu'en `file://`, pour que les requêtes fetch()
  et le service worker fonctionnent normalement.
- Lancez un audit Lighthouse (Chrome DevTools) une fois déployé sur
  GitHub Pages.
- Vérifiez le rendu du QR code, de la vCard téléchargée et du thème
  clair/sombre sur un vrai téléphone après un scan NFC.

## 🔁 Ajouter un projet dans la grille « Projets »

Dupliquez un bloc `<article class="project-card">…</article>` dans
`index.html`, section `#projets` : la grille (`.projects__grid`) s'adapte
automatiquement au nombre de cartes.
