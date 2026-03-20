// ─── Base geometry parameters ───

export type NumberOfHouses = 4 | 5 | 6 | 7 | 8;
export type AvailableWidth = 4.0 | 4.5 | 5.0 | 5.5 | 6.0 | 6.5 | 7.0;

export interface GeometryParams {
  numberOfHouses: NumberOfHouses;
  width: number; // user-selected, 4.0–7.3
  crossGables: boolean;
  stepping: boolean;
}

// ─── Style presets ───

export type StylePreset =
  | "jaren-30"
  | "moderne-stadswoning"
  | "landelijk"
  | "biobased"
  | "oud-hollands"
  | "industrieel"
  | "haags";

// ─── Gutter types ───

export type GutterType = "overstek" | "mastgoot" | "verholen-goot";

// ─── Floor-line treatment ───

export type FloorLineTreatment =
  | "bijna-onzichtbaar"
  | "architectonisch-opgelost"
  | "expliciet-gemaakt";

// ─── Optional features ───

export type OptionalFeature =
  | "pergola"
  | "dakkapel"
  | "extra-ramen-kopgevel"
  | "luifel"
  | "franse-balkons"
  | "erker"
  | "zonnepanelen"
  | "afwijkende-voordeuraccenten";

// ─── Wood types (for timber styles) ───

export type WoodType =
  | "smalle-latten-vuren"
  | "smalle-latten-frake"
  | "smalle-latten-cedar"
  | "smalle-latten-thermowood"
  | "brede-latten-vuren"
  | "brede-latten-frake"
  | "smalle-latten-moso-bamboe"
  | "diepe-profilering"
  | "zwart-hout";

// ─── Brick types (for brick styles) ───

export type BrickType =
  | "waals-rood"
  | "ijsselsteen-geel"
  | "handvorm-bruin"
  | "strengpers-grijs"
  | "langformaat-antraciet"
  | "geglazuurd-donker"
  | "lichte-baksteen";

// ─── Full configuration ───

export interface RenderConfig {
  geometry: GeometryParams;
  style: StylePreset;
  gutterType: GutterType;
  floorLine: FloorLineTreatment;
  optionalFeatures: OptionalFeature[];
  woodType?: WoodType;
  brickType?: BrickType;
  userNuance: string;
}

// ─── Image library entry ───

export interface GreyVolumeImage {
  index: number;
  numberOfHouses: NumberOfHouses;
  width: AvailableWidth;
  crossGables: boolean;
  stepping: boolean;
  fileName: string;
  label: string;
}

// ─── Generation result ───

export interface GenerationResult {
  id: string;
  timestamp: number;
  config: RenderConfig;
  baseImage: GreyVolumeImage;
  prompt: string;
  variants: GeneratedVariant[];
}

export interface GeneratedVariant {
  id: string;
  imageUrl: string; // base64 data URL or blob URL
  config?: RenderConfig;
}

// ─── Render engine ───

export type RenderEngine = "google" | "bytedance";

// ─── API request/response ───

export type RenderQuality = "quick" | "hq";

export interface GenerateRequest {
  config: RenderConfig;
  quality?: RenderQuality;
  engine?: RenderEngine;
}

export interface GenerateResponse {
  success: boolean;
  result?: GenerationResult;
  error?: string;
}
