# SCRIPTURE WITH LINKS

A scholarly social platform that links YouTube video expositions to the KJV Bible, maps verse-density across biblical passages, and provides WhatsApp-style discussion spaces for study and reflection.

This project is a React + Vite single-page app for exploring Scripture, watching linked teachings, organizing topics, and tracking reading progress in a local “sanctuary” environment.

## Overview

SCRIPTURE WITH LINKS brings together:

- A KJV Bible reader with chapter and verse navigation
- Verse-linked video expositions and commentary archives
- Topic-based scripture exploration and curated categories
- A Pilgrim Map and density heatmap for tracking biblical study patterns
- WhatsApp-style discussion rooms for verse and video conversations
- Progress analytics and personal reading history
- Local-first storage for user profile, study progress, and uploaded content

## Features

### Bible study experience
- Read and navigate the King James Bible by book and chapter
- Open verse references directly from the reader into discussion flows
- Jump from a verse or chapter into linked teachings and related topics

### Video exegesis archive
- Explore a curated archive of YouTube teaching links
- Filter and open videos tied to specific verses or books
- Like, comment, and discuss video content in timed commentary threads

### Community and discussion spaces
- WhatsApp-style rooms for verse study, video discussions, and fellowship spaces
- Invite and manage members in a sanctuary-style community experience
- Upload conversation transcripts and annotate detected scripture references

### Progress and discovery
- Track explored chapters and study progress
- View analytics on engagement, chapter completion, and video participation
- Browse by topical categories and scripture density patterns

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- Express (served in the project setup)

## Project structure

```text
scripture-with-links---kjv-bible-&-video-canon/
├── src/
│   ├── components/
│   ├── data/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── scripts/
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
├── README.md
└── ...
```

## Local development

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm run dev
```

The app is configured to start on port 3000 with host access enabled.

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Notes

- The app stores much of its state in browser local storage, so progress and room data persist on-device.
- Some flows are designed as a “phone sanctuary” experience with an admin, guest, and member mode.
- This is a local-first scholarly study app and not a server-backed social platform by default.

## License

This project does not currently declare a license in the repository metadata. If you plan to share or distribute it publicly, add a LICENSE file that matches your intended usage rights.

## Contributing

Contributions are welcome. Small, well-scoped improvements are especially helpful for:

- Bible data quality and navigation improvements
- Video archive features and curation
- Topic categorization and search
- UI polish and accessibility
- Discussion room workflow and persistence improvements

## Repository context

This repository is a local-first study and fellowship application focused on connecting biblical reading with external teaching content. The experience is intentionally built around a curated, rich, and contemplative reading environment rather than generic blog or forum tooling.
