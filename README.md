# POSHAAK 👗

**Your wardrobe. More ways to wear it.**

POSHAAK is an AI-assisted digital wardrobe and personal styling app. Snap the clothes you already own, and it builds outfit ideas from *only* those clothes for college, work, parties and more.

> "I had nothing to wear… so I built an app."

<p>
  <img src="docs/screenshots/welcome.png" width="200" alt="Welcome screen">
  <img src="docs/screenshots/home.png" width="200" alt="Home with outfit discovery">
  <img src="docs/screenshots/recs.png" width="200" alt="Outfit recommendations">
  <img src="docs/screenshots/look.png" width="200" alt="Outfit details">
</p>
<p>
  <img src="docs/screenshots/home-empty.png" width="200" alt="First run: unlock outfits">
  <img src="docs/screenshots/review-edited.png" width="200" alt="Review AI-detected details">
  <img src="docs/screenshots/wardrobe.png" width="200" alt="My wardrobe">
  <img src="docs/screenshots/saved.png" width="200" alt="Saved looks">
</p>

---

## What it does

| | |
|---|---|
| 📸 **Add clothes** | Take photos or upload up to 10 from your gallery at once. |
| 🎨 **AI recognition** | Detects each item's colour from the photo, and guesses the clothing type with an on-device image model. |
| ✅ **You stay in control** | Review and fix the name, type, colour and occasions before anything is saved. |
| 👕 **My wardrobe** | A visual grid with category filters and search. |
| ✨ **Outfit ideas** | Pick an occasion and get complete looks made **only from your own items**, each with a short styling reason. |
| 🔁 **Another look** | Cycle through combinations; the app tells you when you've seen them all. |
| 🙅 **Honest no-results** | If your wardrobe can't make a look, it lists what's missing instead of inventing clothes. |
| ❤️ **Saved looks** | Save favourites, filter by occasion, reopen any time. |
| 👍👎 **Feedback** | Thumbs up/down shapes future suggestions. |
| 📱 **Installable** | Add to your home screen for a full-screen, app-like experience that works offline. |

Meet **Kaaj** (काज, "buttonhole"), the cozy mascot who reacts as you use the app.

## How the "AI" works (no magic, no invented capabilities)

- **Colour detection**: samples the centre of each photo, ignores the background and maps the dominant colour to a named palette.
- **Clothing type**: [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) via TensorFlow.js runs **in the browser**. It downloads once on first use. If it isn't confident, the app asks you to pick the type.
- **Outfit engine**: a rule-based recommender that combines tops + bottoms (or dresses) with footwear and accessories tagged for the chosen occasion. Looks are ranked by colour pairing (neutrals, complementary and analogous hues), your style preferences and your feedback.

## Privacy

Everything (profile, photos, wardrobe, saved looks) is stored **in your browser on your device** (IndexedDB). Nothing is uploaded to a server.

## Run it

It's plain HTML, CSS and JavaScript, so there's no build step.

```bash
# from the project folder
python3 -m http.server 8000
# open http://localhost:8000
```

> The camera needs HTTPS (or `localhost`).

### Deploy with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Build and deployment → Deploy from a branch**, then choose `main` and `/ (root)`.
3. Your app goes live at `https://<your-username>.github.io/<repo-name>/`.
4. On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome).

## Project structure

```
index.html        App shell + design tokens and styles
app.js            Screens, storage, photo pipeline, colour detection, outfit engine
sw.js             Offline cache (service worker)
manifest.json     Installable app (PWA) settings
assets/           Kaaj animations, hand-drawn icons, logo, app icons
docs/             PRD and screenshots
```

## How it was built

Problem identification → [PRD](docs/POSHAAK-PRD.pdf) → user flow → wireframes → brand directions → design system (Milk Chai palette, DM Serif Display + Space Grotesk, doodle-sticker icons, Kaaj mascot) → clickable prototype → working web app.

## MVP scope

**In:** account (on device), style preferences, image upload, AI-assisted recognition with review, wardrobe, occasion-based outfit generation, outfit details, save, feedback, and loading, empty, error and no-results states.

**Out (for now):** cloud accounts and sync, background removal, weather, virtual try-on, shopping and social features.

---

Made with ☕ and a closet full of "nothing to wear."
