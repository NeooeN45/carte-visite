# Vidéo de fond hero

Dépose ici tes fichiers vidéo :

- `hero.mp4`  — format principal (H.264, ~720p, < 10 Mo recommandé)
- `hero.webm` — format alternatif (VP9, optionnel mais plus léger)

Une fois le fichier en place, **décommente** le bloc `<video>` dans `index.html` (lignes autour de `hero__video`).

## Conseils de format
- Durée : 10–30 secondes en boucle
- Résolution : 1280×720 minimum
- Codec : H.264 pour .mp4
- Compresser avec HandBrake ou ffmpeg :
  `ffmpeg -i ta-video.mp4 -vcodec libx264 -crf 28 -preset slow -an hero.mp4`
  `-an` supprime l'audio (inutile pour un fond muet)
