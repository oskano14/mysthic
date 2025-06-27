# 🔮 Mysthic Tarot

**Mysthic Tarot** est une application de tirage divinatoire interactif. Elle permet à l'utilisateur de tirer trois cartes de tarot (passé, présent, futur) et d'obtenir une interprétation générée automatiquement par une intelligence artificielle.

---

## 🚀 Installation & Lancement du projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/oskano14/mysthic.git
cd mysthic
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible à l’adresse : [http://localhost:3000](http://localhost:3000)

> ✅ **Compatibilité :** ce projet est compatible Windows / macOS / Linux.

---

## 🧰 Intégration de Mistral AI

L'application utilise **Mistral AI** pour générer une interprétation personnalisée des cartes tirées.

### Comment ça fonctionne ?

- Les 3 cartes tirées sont envoyées via une requête `POST` à une API locale (`/api/interpretation`).
- Le backend appelle Mistral via un `fetch()` avec une `prompt` structurée.
- Le résultat est affiché dans l'interface sous chaque carte.

### Configuration

- Le code d'appel à Mistral est dans `pages/api/interpretation.js`
- Ajoutez votre clé API Mistral dans un fichier `.env.local` :

```
MISTRAL_API_KEY=your_mistral_key_here
```

> ⚠️ N'oubliez pas de relancer le serveur si vous modifiez `.env.local`

---

## 🎮 Contrôles & Fonctionnalités

- 🕵️‍♂️ L'utilisateur clique pour tirer 3 cartes.
- ✨ Les cartes sont révélées une par une avec une animation.
- 🔮 Une interprétation IA est générée pour chaque carte.
- 🎷 Une ambiance sonore peut être activée.
- 📱 Responsive : s’adapte au mobile et desktop.

---

## 🎨 Technologies utilisées

- **React / Next.js**
- **TailwindCSS**
- **Framer Motion**
- **Lucide Icons**
- **Mistral API**

---

## ❓ En cas de problème

- Assurez-vous que le port 3000 est libre.
- Pour réinitialiser l’environnement :

```bash
rm -rf node_modules
npm install
```

Sur Windows :

```bash
rmdir /s /q node_modules
npm install
```

---

## 🧙‍♂️ Auteur

Projet développé par [oskano14](https://github.com/oskano14)
