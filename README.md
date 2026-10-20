# SCRIPTURE WITH LINKS

A scholarly social platform linking YouTube video expositions to the KJV Bible, with verse-density mapping, a video archive, and WhatsApp-style discussion spaces for Bible study and fellowship.

This repository contains the full app for exploring Scripture, linking biblical passages to relevant teaching videos, and creating a local-first community study experience.

## Overview

SCRIPTURE WITH LINKS brings together:

- A KJV Bible reader with book, chapter, and verse navigation
- Verse-linked YouTube expositions and theology video archives
- Topic-driven scripture exploration and curated categories
- Density and pilgrimage views for studying patterns across Scripture
- WhatsApp-style discussion rooms for verse and video conversations
- Personal progress tracking and engagement analytics
- Local-first storage for user profiles, rooms, and uploaded content

## Live app concept

The app is designed as a digital “sanctuary” for study, with modes for:

- Sovereign Admin: full local ownership and curation
- Member: community access within a fellowship space
- Guest: private exploration without sign-in

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- Express

## Repository structure

```text
SCRIPTURE-WITH-LINKS/
├── README.md
├── scripture-with-links---kjv-bible-&-video-canon/
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── metadata.json
│   └── README.md
└── ...
```

The main app code lives in the `scripture-with-links---kjv-bible-&-video-canon/` subdirectory.

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
cd scripture-with-links---kjv-bible-&-video-canon
npm install
```

### Run the app locally

```bash
cd scripture-with-links---kjv-bible-&-video-canon
npm run dev
```

The app runs on port 3000.

### Production build

```bash
cd scripture-with-links---kjv-bible-&-video-canon
npm run build
```

### Preview the production build

```bash
cd scripture-with-links---kjv-bible-&-video-canon
npm run preview
```

## Features

### Bible study experience
- Read the King James Bible by book and chapter
- Open verse references directly into discussion rooms
- Connect scripture passages to relevant video teachings

### Video archive and discussion
- Browse YouTube-based theological exposition links
- Like, comment on, and discuss recordings
- Follow conversations tied to specific verses or videos

### Social study spaces
- WhatsApp-style rooms for verse and video discussions
- Community invite flows and shared sanctuary spaces
- Upload conversation transcripts and detect associated verses

### Progress and analytics
- Track explored chapters and reading progress
- View study density and engagement analytics
- Monitor personal and community activity within the app

## Notes

- This project is built as a local-first desktop/mobile web app.
- Much of the state is persisted in browser local storage for offline-friendly study sessions.
- The repository is intentionally designed around contemplation, theological exploration, and discussion rather than a generic social feed.

## Contributing

Contributions are welcome, especially in areas such as:

- Bible and verse data accuracy
- UX and accessibility improvements
- Video archive curation and discovery
- Topic mapping and study density logic
- Community discussion flow improvements

## License

No explicit license file is currently present in this repository. If you plan to distribute or publish this project, consider adding a license that matches your intended usage rights.
