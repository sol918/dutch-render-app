import { RenderConfig } from "@/types";

const STYLE_NAMES: Record<string, string> = {
  "jaren-30": "Jaren '30",
  modern: "Modern",
  landelijk: "Landelijk",
  biobased: "Biobased",
};

const BRICK_NAMES: Record<string, string> = {
  "waals-rood": "warm Waals rood metselwerk",
  "ijsselsteen-geel": "klassieke IJsselstenen in warme gele tinten",
  "handvorm-bruin": "ambachtelijke handvorm bakstenen in bruin",
  "strengpers-grijs": "strakke strengpers bakstenen in grijs",
  "langformaat-antraciet": "langformaat bakstenen in antraciet",
  "geglazuurd-donker": "geglazuurde donkere bakstenen",
  "lichte-baksteen": "lichte bakstenen in zand- en wittinten",
};

const WOOD_NAMES: Record<string, string> = {
  "smalle-latten-vuren": "smalle vurenhouten latten",
  "smalle-latten-frake": "fraké houten gevelbekleding",
  "smalle-latten-cedar": "Western Red Cedar gevelbekleding",
  "smalle-latten-thermowood": "thermowood gevelbekleding",
  "brede-latten-vuren": "brede vurenhouten planken",
  "brede-latten-frake": "brede fraké planken",
  "smalle-latten-moso-bamboe": "Moso bamboe gevelbekleding",
  "diepe-profilering": "diep geprofileerde houten gevelbekleding",
  "zwart-hout": "zwart gebrand hout (shou sugi ban)",
};

const GUTTER_NAMES: Record<string, string> = {
  overstek: "een ruime dakoverstek",
  mastgoot: "een strakke mastgoot",
  "verholen-goot": "een verholen goot",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  pergola: "geïntegreerde pergola's",
  dakkapel: "zorgvuldig gedetailleerde dakkapellen",
  "extra-ramen-kopgevel": "extra ramen in de kopgevels voor optimaal daglicht",
  luifel: "elegante luifels bij de entrees",
  "franse-balkons": "Franse balkons met slanke balustraden",
  erker: "verfijnde erkers",
  zonnepanelen: "geïntegreerde zonnepanelen",
  "afwijkende-voordeuraccenten": "bijzondere voordeuraccenten",
};

// --- Style-specific living experience descriptions ---

const STYLE_LIVING: Record<string, string> = {
  "jaren-30": `De architectuur ademt de warmte en het karakter van de jaren dertig, maar dan in een eigentijdse interpretatie. Het zijn woningen met een ziel, de genereuze verhoudingen, de zorgvuldige detaillering rond ramen en entrees, de warme baksteentinten die veranderen met het licht van de dag. Wie hier binnenkomt, voelt meteen de rust van een huis dat doordacht is ontworpen: hoge plafonds, diepe dagkanten die het licht zacht naar binnen leiden, en een vloeiende overgang van de intieme voortuin naar de huiskamer.`,

  modern: `Deze woningen zijn ontworpen voor mensen die van eigentijds wonen houden — van strakke lijnen, eerlijke materialen en een zelfverzekerde uitstraling. De baksteengevels geven het blok een robuuste maar verfijnde presentie. Binnen vertaalt die kalmte zich in heldere, lichte ruimtes met slanke kozijnprofielen die het daglicht maximaal binnenlaten. Het is wonen met de luxe van eenvoud: zuivere lijnen, eerlijke materialen, en precies genoeg karakter om het bijzonder te maken.`,

  landelijk: `Hier woon je niet zomaar in een huis — je woont in hout. En dat voel je. De geur van natuurlijk hout bij de voordeur, de zachte warmte die de gevelbekleding uitstraalt als de zon erop valt, het subtiele spel van schaduw tussen de latten dat met de seizoenen verandert. Een houten woning leeft met je mee. Het materiaal ademt, dempt geluid op een natuurlijke manier, en creëert een binnenklimaat dat zacht aanvoelt — geen droge verwarmingslucht, maar een evenwichtige, behaaglijke warmte. De landelijke architectuur versterkt dat gevoel: genereuze dakoverstekken, een ontspannen verhouding tot de tuin, en een materialiteit die eerlijk en warm is. Dit is geen huis dat indruk wil maken — het is een huis dat je verwelkomt.`,

  biobased: `Wonen in een biobased woning is een bewuste keuze, maar het voelt niet als een compromis — het voelt als een voorrecht. De houten constructie en gevelbekleding geven het huis een warmte die je direct merkt als je binnenstapt. Hout reguleert vocht op een natuurlijke manier, dempt geluid, en voelt aangenaam aan — het is een materiaal dat je huis zachter maakt. In combinatie met het groene sedumdak ontstaat een woning die letterlijk leeft: het dak bloeit in het voorjaar, vangt regenwater op, en isoleert mee met de seizoenen. Je woont hier in een huis dat niet alleen weinig van de aarde vraagt, maar er actief aan bijdraagt. De CO₂ die in de houtconstructie is opgeslagen, maakt van elke woning een klein stukje klimaatoplossing.`,
};

const WOOD_LIVING = `Wonen in een houten gebouw is wezenlijk anders dan in steen. Hout is een levend materiaal — het reguleert vocht, absorbeert geluid, en creëert een binnenklimaat dat je niet kunt nabootsen met installaties. De akoestiek is zachter, de lucht voelt frisser, en de temperatuur is stabieler. Veel bewoners van houtbouw beschrijven het als een soort rust die je pas opvalt als je eraan gewend bent en ergens anders slaapt. Het is de kwaliteit van het onzichtbare — geen gadgets, geen techniek die je hoort, gewoon een huis dat goed voelt.`;

function materialParagraph(config: RenderConfig): string {
  const timberStyles = new Set(["landelijk", "biobased"]);
  const isTimber = timberStyles.has(config.style);

  if (isTimber && config.woodType) {
    const wood = WOOD_NAMES[config.woodType] || config.woodType;
    return `De gevels worden uitgevoerd in ${wood}, gekozen om hun warme uitstraling en duurzame eigenschappen. Het houtwerk wordt gecombineerd met ${GUTTER_NAMES[config.gutterType] || config.gutterType}, wat het geheel een ambachtelijke maar eigentijdse kwaliteit geeft.`;
  }

  if (config.brickType) {
    const brick = BRICK_NAMES[config.brickType] || config.brickType;
    return `De gevels worden uitgevoerd in ${brick}, zorgvuldig geselecteerd op kleur, textuur en duurzaamheid. In combinatie met ${GUTTER_NAMES[config.gutterType] || config.gutterType} ontstaat een gevelbeeld dat verfijning uitstraalt en decennialang mooi blijft.`;
  }

  return `De gevels worden uitgevoerd in hoogwaardige materialen, afgestemd op de architectonische taal van het ontwerp. ${GUTTER_NAMES[config.gutterType]?.replace(/^een /, "Een ") || "Het gootdetail"} zorgt voor een zuivere dakrand.`;
}

function featuresParagraph(config: RenderConfig): string {
  if (config.optionalFeatures.length === 0) return "";

  const descs = config.optionalFeatures
    .map((f) => FEATURE_DESCRIPTIONS[f])
    .filter(Boolean);

  if (descs.length === 0) return "";
  if (descs.length === 1) return `Het ontwerp wordt verrijkt met ${descs[0]}, als vanzelfsprekend onderdeel van de architectuur.`;

  const last = descs.pop();
  return `Het ontwerp wordt verrijkt met ${descs.join(", ")} en ${last}, elk als vanzelfsprekend onderdeel van de architectuur.`;
}

function sustainabilityParagraph(config: RenderConfig): string {
  const isTimber = new Set(["landelijk", "biobased"]).has(config.style);
  const isBiobased = config.style === "biobased";

  const intro = `Achter de zorgvuldige verschijning gaat een ambitieus duurzaamheidsconcept schuil. De woningen zijn volledig elektrisch en worden ontwikkeld als passiefhuis. Dat betekent in de praktijk: een uitzonderlijk goed geïsoleerde schil, hoogwaardig drievoudig glas, en koudebrugvrije details door de hele constructie. De aansluiting tussen gevel, dak, kozijn en vloer is tot in detail doorgewerkt om warmteverlies te minimaliseren.`;

  const airtightness = `De luchtdichtheid van de woningen wordt tot op het hoogste niveau geborgd en na oplevering getest. Dat is geen formaliteit — het is de kern van het concept. Een luchtdichte schil voorkomt tocht, vochtproblemen en onnodig energieverlies. In combinatie met een gebalanceerd ventilatiesysteem met warmteterugwinning ademt de woning gecontroleerd: altijd verse lucht, altijd de juiste temperatuur, zonder dat je er iets voor hoeft te doen.`;

  const noHeatpump = `En hier zit misschien wel het mooiste van het passiefhuisconcept: er is geen warmtepomp nodig. De woning is zó goed geïsoleerd en luchtdicht dat de warmte van bewoners, apparaten en de zon vrijwel volstaat om het huis op temperatuur te houden. Geen buitenunit in de tuin, geen compressor die aanslaat, geen onderhoudscontract. De energierekening is minimaal, en het enige dat je hoort als je thuiskomt is stilte. Dat is het comfort van écht goed bouwen: niet meer techniek, maar minder — omdat het gebouw het werk doet.`;

  const biobasedExtra = isBiobased
    ? `\n\nDe biobased materialisatie versterkt deze ambitie. Van de houtskeletbouw tot de gevelbekleding — elk onderdeel draagt bij aan een lage milieu-impact en een aanzienlijke CO₂-opslag in de constructie. Deze woningen zijn niet alleen energiezuinig in gebruik, ze hebben al tijdens de bouw een positief verhaal: elke kubieke meter hout die is verwerkt, is CO₂ die uit de atmosfeer is gehaald en voor decennia is vastgelegd.`
    : "";

  const timberExtra = isTimber && !isBiobased
    ? `\n\nDe houtconstructie draagt hier ook aan bij: hout is van nature een uitstekende isolator, en de combinatie van een houten draagstructuur met hoogwaardige isolatie levert een schil op die thermisch uitzonderlijk presteert. Minder koudebruggen, minder materiaalgebruik, en een bouwproces dat sneller en droger is dan traditionele bouw.`
    : "";

  return `${intro}\n\n${airtightness}\n\n${noHeatpump}${biobasedExtra}${timberExtra}`;
}

function architecturalVisionParagraph(config: RenderConfig): string {
  const style = STYLE_NAMES[config.style] || config.style;
  const n = config.geometry.numberOfHouses;
  const width = config.geometry.width;

  const crossGableText = config.geometry.crossGables
    ? "De dwarskappen geven het ensemble ritmiek en plasticiteit, en doorbreken de herhaling op een natuurlijke manier."
    : "De doorgaande noklijn geeft het blok rust en samenhang.";

  const steppingText = config.geometry.stepping
    ? " De subtiele verspringingen in de rooilijn zorgen voor dieptewerking en geven elke woning een eigen adres binnen het geheel."
    : "";

  return `Het plan omvat ${n} woningen in de ${style}-architectuur, elk met een breedte van ${width} meter. ${crossGableText}${steppingText} De woningbreedte biedt ruimte voor een genereuze plattegrond met logische daglichttoetreding en een comfortabele woonbeleving.`;
}

function livingExperienceParagraph(config: RenderConfig): string {
  const styleLiving = STYLE_LIVING[config.style] || "";
  const isTimber = new Set(["landelijk", "biobased"]).has(config.style);

  if (isTimber) {
    return `${styleLiving}\n\n${WOOD_LIVING}`;
  }

  return styleLiving;
}

function closingParagraph(): string {
  return `Het resultaat is een woonensemble dat bewijst dat hoge duurzaamheidsambities en een aantrekkelijk, herkenbaar straatbeeld hand in hand gaan. Bewoners krijgen een woning die uitzonderlijk weinig energie vraagt, een gezond binnenklimaat biedt, en er van buiten uitziet als een plek waar je met trots woont — vandaag en over dertig jaar.`;
}

export function generateTenderStory(config: RenderConfig): string {
  const vision = architecturalVisionParagraph(config);
  const living = livingExperienceParagraph(config);
  const material = materialParagraph(config);
  const features = featuresParagraph(config);
  const sustainability = sustainabilityParagraph(config);
  const closing = closingParagraph();

  const title = `Architectonische visie & duurzaamheid`;

  const parts = [title, "", vision, "", living, "", material];
  if (features) parts.push("", features);
  parts.push("", sustainability, "", closing);

  return parts.join("\n");
}
