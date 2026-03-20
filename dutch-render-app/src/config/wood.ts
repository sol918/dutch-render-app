import { WoodType } from "@/types";

export interface WoodConfig {
  id: WoodType;
  label: string;
  promptBlock: string;
}

export const WOOD_CONFIGS: Record<WoodType, WoodConfig> = {
  "smalle-latten-vuren": {
    id: "smalle-latten-vuren",
    label: "Smalle latten — vuren",
    promptBlock: `Timber cladding specification: NARROW vertical or horizontal slats (approximately 6-8cm wide) in European spruce (vuren). The wood has a pale, honey-blonde tone with subtle grain. The slats are tightly spaced with fine shadow gaps between them, creating a delicate linear rhythm across the façade. The surface is smooth-planed and lightly treated with a transparent or semi-transparent stain that lets the natural pale grain show through.`,
  },
  "smalle-latten-frake": {
    id: "smalle-latten-frake",
    label: "Smalle latten — fraké",
    promptBlock: `Timber cladding specification: NARROW vertical or horizontal slats (approximately 6-8cm wide) in fraké (African limba wood). The wood has a distinctive warm golden-brown tone with a pronounced, elegant interlocked grain pattern. The slats are tightly spaced with fine shadow gaps. Fraké has a refined, slightly exotic appearance — richer and more characterful than standard European softwoods. The surface has a subtle sheen from the interlocked grain.`,
  },
  "smalle-latten-cedar": {
    id: "smalle-latten-cedar",
    label: "Smalle latten — ceder",
    promptBlock: `Timber cladding specification: NARROW vertical or horizontal slats (approximately 6-8cm wide) in Western Red Cedar. The wood has warm reddish-brown tones with natural colour variation from plank to plank — some darker, some lighter, creating a lively but harmonious palette. The slats have fine shadow gaps between them. Cedar has a smooth, straight grain with a naturally rich, warm character.`,
  },
  "smalle-latten-thermowood": {
    id: "smalle-latten-thermowood",
    label: "Smalle latten — thermowood",
    promptBlock: `Timber cladding specification: NARROW vertical or horizontal slats (approximately 6-8cm wide) in thermally modified wood (thermowood). The wood has a deep, rich dark brown tone — darker than natural timber due to the thermal treatment process. The grain is subtle and even. The slats are tightly spaced with crisp shadow gaps. Thermowood has a refined, contemporary feel — uniform in colour, precise in expression, and slightly more architectural than natural timber.`,
  },
  "brede-latten-vuren": {
    id: "brede-latten-vuren",
    label: "Brede latten — vuren",
    promptBlock: `Timber cladding specification: WIDE vertical or horizontal planks (approximately 15-20cm wide) in European spruce (vuren). The wider boards create a calmer, more solid façade expression with fewer joints. The wood has a pale honey-blonde tone with visible grain. The joints between planks show subtle shadow lines. The overall effect is more robust and rustic compared to narrow slats — generous, calm, and grounded.`,
  },
  "brede-latten-frake": {
    id: "brede-latten-frake",
    label: "Brede latten — fraké",
    promptBlock: `Timber cladding specification: WIDE vertical or horizontal planks (approximately 15-20cm wide) in fraké (African limba wood). The wider boards showcase the distinctive golden-brown interlocked grain pattern of fraké more prominently. The façade reads as warm, elegant, and substantial. Fewer joints create a calmer, more monolithic timber expression with a refined exotic character.`,
  },
  "smalle-latten-moso-bamboe": {
    id: "smalle-latten-moso-bamboe",
    label: "Smalle latten — moso bamboe",
    promptBlock: `Timber cladding specification: NARROW vertical or horizontal slats (approximately 6-8cm wide) in Moso bamboo (bamboe). The material has a distinctive warm caramel-brown tone with a very tight, fine grain pattern unique to bamboo — denser and more uniform than conventional timber. The slats are precisely dimensioned with tight shadow gaps. Moso bamboo cladding has a contemporary, sustainable character — smooth, hard, and with a subtle natural lustre. It reads as premium and ecologically conscious.`,
  },
  "diepe-profilering": {
    id: "diepe-profilering",
    label: "Diepe profilering",
    promptBlock: `Timber cladding specification: Deep-profiled timber cladding with pronounced shadow lines and three-dimensional depth. The slats or boards (approximately 8-12cm wide) are mounted with significant depth variation — some projecting further than others, or using a deep tongue-and-groove profile that creates strong shadow patterns across the façade. The wood species can be larch or thermowood in warm-to-dark brown tones. The key characteristic is the dramatic interplay of light and shadow across the façade surface, giving the timber cladding a bold, sculptural quality with much more depth and texture than flat-mounted boards.`,
  },
  "zwart-hout": {
    id: "zwart-hout",
    label: "Zwart hout (shou sugi ban)",
    promptBlock: `Timber cladding specification: BLACKENED timber cladding (shou sugi ban / zwart gebrand hout). The wood has been charred or stained to a deep, near-black colour with a subtle charcoal texture visible up close. The slats (approximately 8-12cm wide) are vertical or horizontal with crisp shadow gaps. The blackened surface has a matte, slightly textured finish — not shiny or painted, but genuinely carbonised or deeply stained. The overall effect is dramatic, bold, and contemporary — a striking dark facade that reads as premium and architecturally confident. Combine with warm timber accents around windows or doors for contrast.`,
  },
};

export const WOOD_OPTIONS = Object.values(WOOD_CONFIGS);
