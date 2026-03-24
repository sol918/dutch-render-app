# RenderStudio — Dutch Terraced Housing Render Configurator

A Next.js web application for generating AI-powered photorealistic architectural renders of Dutch terraced housing (_rijwoningen_). Users configure building geometry, style, and materials, then generate styled renders from grey-volume 3D massing reference images using Google Gemini (primary), ByteDance SeedDream, or Pollinations as the image generation backend.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Environment Variables](#environment-variables)
- [Directory Requirements](#directory-requirements)
- [Getting Started](#getting-started)
- [API Entry Points](#api-entry-points)
- [Project Structure](#project-structure)
- [Configuration Options](#configuration-options)
- [Image Generation Engines](#image-generation-engines)
- [Batch Processing](#batch-processing)

---

## What It Does

1. The user configures a terraced housing design: number of houses, facade width, roof type, stepping, architectural style, brick/wood materials, gutter type, floor-line treatment, and optional features.
2. The app finds the closest matching grey-volume reference image from the `../Images/` library (280 pre-named PNGs).
3. A detailed prompt is assembled from the configuration by `src/lib/prompt-builder.ts`.
4. The prompt + reference image are sent to the selected AI engine, which renders a photorealistic styled facade.
5. Results are saved to `../Generated images/` as PNGs with accompanying JSON metadata.
6. The gallery shows all saved renders; renders can be compared side-by-side or deleted.
7. A batch mode generates up to 50 random configurations overnight using Gemini's batch API.

---

## Environment Variables

Create a `.env.local` file in the project root (next to `package.json`):

```env
# Required — Google Gemini API key
# Used by the primary generation engine (gemini-2.5-flash-image / gemini-3.1-flash-image-preview)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional — selects the image provider
# Values: "gemini" | "pollinations"
# Defaults to "pollinations" if not set
IMAGE_PROVIDER=gemini

# Optional — ByteDance SeedDream credentials (alternative engine)
BYTEDANCE_API_KEY=your_bytedance_api_key_here
BYTEDANCE_MODEL=seedream-5-0-260128
```

**Notes:**
- The app will throw a startup error if `GEMINI_API_KEY` is missing and the Gemini engine is selected.
- Pollinations is a free/public endpoint and requires no key; quality is lower than Gemini.
- `BYTEDANCE_MODEL` defaults to `seedream-5-0-260128` if the key is provided but the model is omitted.

---

## Directory Requirements

The app reads and writes to two directories **outside** the project root:

```
dutch-render-app/           ← this repo
../Images/                  ← grey-volume reference PNGs (read-only input)
../Generated images/        ← saved renders + metadata JSON (auto-created)
```

### `../Images/`

Contains 280 grey-volume PNG reference images used as the base for AI generation. Files follow this naming convention:

```
IDX_{index}_W{width}_H{houses}_DK-{Yes|No}_VP-{Yes|No}.png

Example: IDX_42_W5.0_H5_DK-Yes_VP-No.png
```

| Segment | Values |
|---------|--------|
| `W` — facade width | 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0 |
| `H` — number of houses | 4, 5, 6, 7, 8 |
| `DK` — cross-gables (dwarskapellen) | Yes / No |
| `VP` — facade stepping (verspringen) | Yes / No |

This gives 7 × 5 × 2 × 2 = **280 images**. The app snaps user-selected widths (4.0–7.3 m) to the nearest available value.

### `../Generated images/`

Auto-created on first save. Contains:
- `{id}.png` — generated render
- `{id}.json` — render metadata (config, prompt, timestamp)
- `_batch-state.json` — batch job state (auto-managed)
- `_batch-configs.json` — configs for the current batch (auto-managed)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local   # if example exists, otherwise create manually
# edit .env.local and add GEMINI_API_KEY
```

### 3. Ensure the Images directory is in place

The `../Images/` folder (one level above this project) must exist and contain the 280 grey-volume PNGs before generation will work.

### 4. Run the development server

```bash
npm run dev
```

App runs on **http://localhost:3001**

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server on port 3001 (hot reload) |
| `npm run build` | Production build |
| `npm start` | Run production build on port 3001 |
| `npm run lint` | ESLint |

---

## API Entry Points

All routes are Next.js App Router handlers under `src/app/api/`.

### Generation

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate` | Generate a render from a config |

**Request body:**
```json
{
  "config": { /* RenderConfig — see src/types/index.ts */ },
  "quality": "quick" | "hq",
  "engine": "google" | "bytedance"
}
```

**Response (success):**
```json
{
  "success": true,
  "result": {
    "id": "string",
    "timestamp": 1234567890,
    "config": { },
    "baseImage": { },
    "prompt": "string",
    "variants": [{ "id": "string", "imageUrl": "data:image/png;base64,..." }]
  }
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "error message"
}
```

HTTP `429` = quota exceeded, `503` = model overloaded.

### Renders (saved results)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/renders` | Load all saved renders from disk |
| `POST` | `/api/renders` | Save a render (base64 image + config) to disk |
| `DELETE` | `/api/renders/[id]` | Delete a saved render by ID |

### File serving

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/generated-image/[filename]` | Serve a saved render PNG |
| `GET` | `/api/base-image/[filename]` | Serve a grey-volume reference PNG |

### Batch generation

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/batch-generate` | Get current batch status |
| `POST` | `/api/batch-generate` | Start overnight batch (50 renders) |
| `DELETE` | `/api/batch-generate` | Cancel a running batch |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main client component (UI entry point)
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css
│   └── api/
│       ├── generate/route.ts
│       ├── renders/route.ts
│       ├── renders/[id]/route.ts
│       ├── batch-generate/route.ts
│       ├── generated-image/[filename]/route.ts
│       └── base-image/[filename]/route.ts
├── components/
│   ├── ConfigPanel.tsx             # Left sidebar: all configuration controls
│   ├── PreviewArea.tsx             # Main render display
│   ├── VariantsGallery.tsx         # Gallery of saved renders
│   ├── CompareMode.tsx             # Side-by-side comparison view
│   ├── Header.tsx
│   ├── LoadingState.tsx
│   ├── PromptPreview.tsx           # Debug: shows the assembled prompt
│   ├── ConstraintsSummary.tsx
│   └── TenderStoryBubble.tsx       # Onboarding/tips overlay
├── config/
│   ├── bricks.ts                   # 7 brick material options
│   ├── wood.ts                     # 9 wood material options
│   ├── styles.ts                   # 7 architectural style presets
│   ├── gutters.ts                  # 3 gutter types
│   ├── floorline.ts                # 3 floor-line treatments
│   ├── options.ts                  # 8 optional features
│   └── image-library.ts            # Generated catalog of 280 reference images
├── lib/
│   ├── gemini.ts                   # All image generation engine logic
│   ├── prompt-builder.ts           # Assembles AI prompts from RenderConfig
│   ├── image-selector.ts           # Matches config to nearest reference image
│   ├── batch-processor.ts          # Overnight batch job management
│   ├── tender-story.ts             # Onboarding flow logic
│   └── utils.ts                    # cn(), generateId()
└── types/
    └── index.ts                    # All TypeScript interfaces (RenderConfig, etc.)
```

---

## Configuration Options

### Geometry

| Parameter | Values |
|-----------|--------|
| Number of houses | 4 – 8 |
| Facade width | 4.0 – 7.3 m (snapped to nearest 0.5 m reference) |
| Cross-gables (dwarskapellen) | Yes / No |
| Facade stepping (verspringen) | Yes / No |

### Architectural Styles (7)

| ID | Description |
|----|-------------|
| `jaren-30` | 1930s Dutch brick, warm ochre-terracotta |
| `moderne-stadswoning` | Contemporary urban, muted greys, clean lines |
| `landelijk` | Timber-dominant, warm natural, rural |
| `biobased` | Timber + sedum roof, eco-forward |
| `oud-hollands` | Traditional Dutch, earthy brick |
| `industrieel` | Dark, graphic, industrial aesthetic |
| `haags` | Hague-style |

### Materials

- **Brick (7 types):** waals-rood, ijsselsteen-geel, handvorm-bruin, strengpers-grijs, langformaat-antraciet, geglazuurd-donker, lichte-baksteen
- **Wood (9 types):** smalle-latten variants (vuren, frake, cedar, thermowood), brede-latten, moso-bamboe, diepe-profilering, zwart-hout

### Gutter Types

`overstek` (overhanging eaves) | `mastgoot` (mast gutter) | `verholen-goot` (hidden gutter)

### Floor-line Treatments

`bijna-onzichtbaar` | `architectonisch-opgelost` | `expliciet-gemaakt`

### Optional Features (8)

pergola, dakkapel, extra-ramen-kopgevel, luifel, franse-balkons, erker, zonnepanelen, afwijkende-voordeuraccenten

---

## Image Generation Engines

| Engine | Env var | Quality | Notes |
|--------|---------|---------|-------|
| Google Gemini | `GEMINI_API_KEY` | High | Primary. Quick = `gemini-2.5-flash-image`, HQ = `gemini-3.1-flash-image-preview`. Up to 4 retries. |
| ByteDance SeedDream | `BYTEDANCE_API_KEY` | High | Alternative. Endpoint: `ark.ap-southeast.bytepluses.com`. Up to 2 retries. |
| Pollinations (Flux) | — | Medium | Free/public fallback. No API key needed. |

The engine is selected per-request via the `engine` field in the POST body. The default provider can also be set via `IMAGE_PROVIDER` in `.env.local`.

---

## Batch Processing

The batch endpoint (`/api/batch-generate`) generates **50 renders overnight** using Gemini's batch API.

- Configs are randomly generated with weighted style distribution (landelijk 25%, biobased 25%, jaren-30 15%, …)
- State is persisted to `../Generated images/_batch-state.json` so jobs survive server restarts
- The client polls `/api/batch-generate` every 10 seconds for progress
- Cancel any time via `DELETE /api/batch-generate`
- Max runtime: 24 hours

**Default configuration (single render):**
```json
{
  "geometry": { "numberOfHouses": 5, "width": 5.4, "crossGables": false, "stepping": false },
  "style": "jaren-30",
  "gutterType": "overstek",
  "floorLine": "architectonisch-opgelost",
  "optionalFeatures": [],
  "userNuance": ""
}
```
