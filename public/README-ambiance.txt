AMBIANCE SONORE DE L'ORACLE
============================

Pour utiliser votre propre musique d'ambiance de fond (jouée en boucle, à bas
volume, sous la voix de la prédiction) :

1. Récupérez un morceau LIBRE DE DROITS de type "dark ambient / ritual chant /
   temple occulte". Sources gratuites et réutilisables :
     - Pixabay Music        : https://pixabay.com/music/  (recherchez "dark ambient", "ritual")
     - Uppbeat              : https://uppbeat.io/         (offre gratuite avec crédit)
     - YouTube Audio Library: https://studio.youtube.com  (onglet "Bibliothèque audio")
     - Freesound            : https://freesound.org/      (vérifiez la licence CC0/CC-BY)

   ⚠️ N'utilisez PAS un morceau protégé récupéré sur YouTube : c'est une
      violation de copyright pour un site public.

2. Renommez le fichier en :  ambiance.mp3
3. Déposez-le dans ce dossier :  public/ambiance.mp3
4. Redéployez.

L'appli détecte automatiquement le fichier et le joue à la place de la nappe
synthétisée. S'il est absent, elle utilise l'ambiance générée dans le
navigateur (aucune configuration requise).

Réglages dans app/prediction/page.jsx :
  - AMBIENCE_FILE_VOLUME : volume du fichier (0 à 1, défaut 0.4)
  - AMBIENCE_VOLUME      : volume de la nappe synthétisée de repli (défaut 0.18)
