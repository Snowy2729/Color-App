// 12-season personal color analysis knowledge base.
// Single source of truth for the analyzer, palette generator and AI stylist.

export interface SeasonProfile {
  name: string;
  dimensions: string; // hue / value / chroma
  identifying: string; // typical skin, eyes, hair
  bestColors: { name: string; hex: string }[];
  avoidColors: { name: string; hex: string }[];
  makeup: string;
  hair: string;
}

export const SEASONS: Record<string, SeasonProfile> = {
  'Bright Winter': {
    name: 'Bright Winter',
    dimensions: 'Cool hue, medium-deep value, very high chroma (brightness is dominant)',
    identifying: 'Clear, cool skin (porcelain to deep) with a striking, jewel-like brightness; high contrast between skin, eyes and hair; eyes are bright and clear (icy blue, emerald, clear brown); hair usually medium brown to black with cool tone.',
    bestColors: [
      { name: 'True Red', hex: '#D0021B' }, { name: 'Fuchsia', hex: '#E5097F' },
      { name: 'Royal Blue', hex: '#1F49C7' }, { name: 'Emerald', hex: '#009B77' },
      { name: 'Ice Pink', hex: '#F6C6D8' }, { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' }, { name: 'Hot Turquoise', hex: '#00B4C5' },
    ],
    avoidColors: [
      { name: 'Muted Olive', hex: '#7A7A52' }, { name: 'Dusty Rose', hex: '#C4A4A0' },
      { name: 'Camel', hex: '#B9935A' }, { name: 'Soft Beige', hex: '#D8C8B0' },
    ],
    makeup: 'Blue-red or fuchsia lips, crisp black liner, cool jewel eyeshadow; avoid muted browns.',
    hair: 'Keep it cool and deep: blue-black, cool espresso, cool dark brown; avoid golden or caramel tones.',
  },
  'Cool Winter': {
    name: 'Cool Winter',
    dimensions: 'Strongly cool hue (coolness is dominant), medium-deep value, high chroma',
    identifying: 'Skin with clear blue/pink undertone (fair to deep); cool dark eyes (dark brown, gray-blue); ash-toned or black hair; noticeable contrast.',
    bestColors: [
      { name: 'Blue Red', hex: '#C10020' }, { name: 'Magenta', hex: '#BE0071' },
      { name: 'Cobalt', hex: '#2244AA' }, { name: 'Icy Gray', hex: '#D5DBE3' },
      { name: 'Pine Green', hex: '#01796F' }, { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Charcoal', hex: '#36454F' }, { name: 'Amethyst', hex: '#7A4FA3' },
    ],
    avoidColors: [
      { name: 'Orange', hex: '#E8641B' }, { name: 'Mustard', hex: '#C69214' },
      { name: 'Warm Beige', hex: '#CBB28E' }, { name: 'Rust', hex: '#A0522D' },
    ],
    makeup: 'Cool pink or blue-red lips, silver-toned highlight, cool taupe shadows; skip bronzer-heavy looks.',
    hair: 'Ash brown, cool black, silver-platinum accents; avoid golden highlights.',
  },
  'Deep Winter': {
    name: 'Deep Winter',
    dimensions: 'Cool-neutral hue, very deep value (depth is dominant), high chroma',
    identifying: 'Deep, rich coloring: dark brown to black hair, dark eyes (espresso, black-brown), skin from olive to deep with cool-neutral undertone; strong contrast when skin is lighter than features.',
    bestColors: [
      { name: 'Black Cherry', hex: '#5B1A32' }, { name: 'Deep Claret', hex: '#8B0E3A' },
      { name: 'Midnight Navy', hex: '#151E3D' }, { name: 'Emerald', hex: '#046307' },
      { name: 'Pure White', hex: '#FFFFFF' }, { name: 'True Black', hex: '#000000' },
      { name: 'Royal Purple', hex: '#4B0082' }, { name: 'Deep Teal', hex: '#014D4E' },
    ],
    avoidColors: [
      { name: 'Pastel Peach', hex: '#F5CBA7' }, { name: 'Powder Blue', hex: '#B7C9E2' },
      { name: 'Golden Beige', hex: '#D2B48C' }, { name: 'Soft Coral', hex: '#F1A7A0' },
    ],
    makeup: 'Deep berry or wine lips, defined dark liner, plum and espresso shadows; pastels wash you out.',
    hair: 'Rich espresso, black, deep cool burgundy; avoid light golden shades.',
  },
  'Light Summer': {
    name: 'Light Summer',
    dimensions: 'Cool hue, very light value (lightness is dominant), soft-medium chroma',
    identifying: 'Light, delicate coloring: light ash blonde to light brown hair, light cool eyes (blue, gray, soft green), fair skin with pink undertone; low-medium contrast.',
    bestColors: [
      { name: 'Powder Blue', hex: '#A7C7E7' }, { name: 'Dusty Rose', hex: '#D8A7B1' },
      { name: 'Lavender', hex: '#C5B4E3' }, { name: 'Soft White', hex: '#F4F4F0' },
      { name: 'Light Aqua', hex: '#A3D5D3' }, { name: 'Rose Pink', hex: '#E8909C' },
      { name: 'Light Gray', hex: '#C9CCD1' }, { name: 'Periwinkle', hex: '#8FA3D8' },
    ],
    avoidColors: [
      { name: 'Black', hex: '#000000' }, { name: 'Rust', hex: '#A0522D' },
      { name: 'Mustard', hex: '#C69214' }, { name: 'Deep Chocolate', hex: '#4E342E' },
    ],
    makeup: 'Rose and soft pink lips, cool champagne shadows, gray-brown (not black) liner.',
    hair: 'Ash blonde, cool light brown, baby highlights; avoid warm gold and copper.',
  },
  'Cool Summer': {
    name: 'Cool Summer',
    dimensions: 'Strongly cool hue (coolness is dominant), medium value, soft-medium chroma',
    identifying: 'Cool rose-beige skin, gray-blue or cool green eyes, ash brown hair; medium, gentle contrast — cooler and slightly deeper than Light Summer.',
    bestColors: [
      { name: 'Raspberry', hex: '#B3446C' }, { name: 'Slate Blue', hex: '#6A7BA2' },
      { name: 'Soft Fuchsia', hex: '#C54B8C' }, { name: 'Blue Gray', hex: '#8C9CAD' },
      { name: 'Soft Navy', hex: '#39537C' }, { name: 'Rose Brown', hex: '#9C6B70' },
      { name: 'Seafoam', hex: '#93C6B4' }, { name: 'Icy Lilac', hex: '#CDB9DE' },
    ],
    avoidColors: [
      { name: 'Orange', hex: '#E8641B' }, { name: 'Warm Gold', hex: '#D4A017' },
      { name: 'Tomato Red', hex: '#E23D28' }, { name: 'Camel', hex: '#B9935A' },
    ],
    makeup: 'Berry and cool rose lips, mauve shadows, cool pink blush; avoid orange-based products.',
    hair: 'Ash brown, cool mocha, ash highlights; golden tones clash with the undertone.',
  },
  'Soft Summer': {
    name: 'Soft Summer',
    dimensions: 'Cool-neutral hue, medium value, very low chroma (softness is dominant)',
    identifying: 'Muted, blended coloring: gray-ish undertone in the skin, soft hazel/gray-green/gray-blue eyes, ash brown to dark blonde hair; low contrast, nothing about the coloring is bright.',
    bestColors: [
      { name: 'Dusty Plum', hex: '#8E6C88' }, { name: 'Sage', hex: '#9CAF88' },
      { name: 'Dusty Blue', hex: '#7C98AB' }, { name: 'Mauve', hex: '#B784A7' },
      { name: 'Stone Gray', hex: '#9FA4A9' }, { name: 'Soft Burgundy', hex: '#8D5A63' },
      { name: 'Pewter', hex: '#8E9294' }, { name: 'Misty Rose', hex: '#C8A2A6' },
    ],
    avoidColors: [
      { name: 'Bright Orange', hex: '#FF6F1F' }, { name: 'Electric Blue', hex: '#0652DD' },
      { name: 'Pure Black', hex: '#000000' }, { name: 'Neon Pink', hex: '#FF2E93' },
    ],
    makeup: 'Muted rose and mauve lips, taupe shadows, soft definition; high-chroma colors overwhelm you.',
    hair: 'Ash brown, mushroom blonde, subtle babylights; avoid vivid or very dark colors.',
  },
  'Soft Autumn': {
    name: 'Soft Autumn',
    dimensions: 'Warm-neutral hue, medium value, very low chroma (softness is dominant)',
    identifying: 'Gentle warm coloring: beige or golden-beige skin, soft hazel/warm green/light brown eyes, dark blonde to medium brown hair with a golden cast; low contrast, muted rather than vivid.',
    bestColors: [
      { name: 'Warm Taupe', hex: '#A89078' }, { name: 'Salmon', hex: '#E29587' },
      { name: 'Olive', hex: '#7A7A52' }, { name: 'Soft Teal', hex: '#5E8C87' },
      { name: 'Camel', hex: '#B9935A' }, { name: 'Muted Coral', hex: '#D88C75' },
      { name: 'Cream', hex: '#F3E9DC' }, { name: 'Bronze', hex: '#9C7A3C' },
    ],
    avoidColors: [
      { name: 'Pure Black', hex: '#000000' }, { name: 'Fuchsia', hex: '#E5097F' },
      { name: 'Icy Blue', hex: '#AFDBF5' }, { name: 'Pure White', hex: '#FFFFFF' },
    ],
    makeup: 'Warm rose and terracotta-nude lips, golden taupe shadows, peach blush; skip cool pinks.',
    hair: 'Golden brown, dark blonde balayage, caramel accents; avoid ash and blue-black.',
  },
  'Warm Autumn': {
    name: 'Warm Autumn',
    dimensions: 'Strongly warm hue (warmth is dominant), medium-deep value, medium chroma',
    identifying: 'Golden warmth everywhere: golden-beige to bronze skin, warm brown/amber/green eyes, hair from golden brown to auburn and copper; freckles are common.',
    bestColors: [
      { name: 'Terracotta', hex: '#C8553D' }, { name: 'Mustard', hex: '#C69214' },
      { name: 'Olive Green', hex: '#6B8E23' }, { name: 'Rust', hex: '#A0522D' },
      { name: 'Pumpkin', hex: '#D35400' }, { name: 'Warm Cream', hex: '#F5E6C8' },
      { name: 'Tortoise Brown', hex: '#8B5A2B' }, { name: 'Deep Teal', hex: '#207178' },
    ],
    avoidColors: [
      { name: 'Pure White', hex: '#FFFFFF' }, { name: 'Cool Pink', hex: '#E75480' },
      { name: 'Icy Blue', hex: '#AFDBF5' }, { name: 'Blue Red', hex: '#C10020' },
    ],
    makeup: 'Brick, terracotta and warm nude lips, copper and bronze shadows, golden glow.',
    hair: 'Copper, auburn, golden brown, caramel; ash tones dull the natural warmth.',
  },
  'Deep Autumn': {
    name: 'Deep Autumn',
    dimensions: 'Warm-neutral hue, very deep value (depth is dominant), medium chroma',
    identifying: 'Deep and warm: dark brown to black-brown hair with warm cast, dark warm eyes (espresso, dark hazel), olive to deep golden skin; richer and darker than Warm Autumn.',
    bestColors: [
      { name: 'Dark Chocolate', hex: '#3E2723' }, { name: 'Burgundy', hex: '#6D071A' },
      { name: 'Forest Green', hex: '#1B4D3E' }, { name: 'Burnt Orange', hex: '#B7410E' },
      { name: 'Deep Gold', hex: '#B8860B' }, { name: 'Warm Navy', hex: '#2C3E60' },
      { name: 'Brick Red', hex: '#8E3B2F' }, { name: 'Olive', hex: '#556B2F' },
    ],
    avoidColors: [
      { name: 'Pastel Pink', hex: '#F4C2C2' }, { name: 'Powder Blue', hex: '#B7C9E2' },
      { name: 'Light Gray', hex: '#D3D6DA' }, { name: 'Icy Lilac', hex: '#CDB9DE' },
    ],
    makeup: 'Deep brick, brown-red and bronze lips, espresso liner, warm smoky eyes; pastels disappear on you.',
    hair: 'Deep espresso, black-brown, warm mahogany; very light shades break the harmony.',
  },
  'Light Spring': {
    name: 'Light Spring',
    dimensions: 'Warm hue, very light value (lightness is dominant), medium chroma',
    identifying: 'Fresh, light and warm: golden blonde to light warm brown hair, light warm eyes (blue with warmth, light green, light hazel), ivory-peach skin; low-medium contrast with a sunny quality.',
    bestColors: [
      { name: 'Peach', hex: '#F6B092' }, { name: 'Warm Ivory', hex: '#FFF4E0' },
      { name: 'Light Coral', hex: '#F08080' }, { name: 'Apple Green', hex: '#9DC183' },
      { name: 'Aqua', hex: '#7FD1CC' }, { name: 'Warm Pink', hex: '#F49AC2' },
      { name: 'Light Camel', hex: '#CBB28E' }, { name: 'Sunny Yellow', hex: '#F7D774' },
    ],
    avoidColors: [
      { name: 'Black', hex: '#000000' }, { name: 'Deep Burgundy', hex: '#6D071A' },
      { name: 'Dark Charcoal', hex: '#333B42' }, { name: 'Cool Fuchsia', hex: '#BE0071' },
    ],
    makeup: 'Peachy pink and coral lips, warm champagne shadows, fresh peach blush; heavy dark looks are too harsh.',
    hair: 'Golden blonde, honey, light copper accents; avoid black and ash.',
  },
  'Warm Spring': {
    name: 'Warm Spring',
    dimensions: 'Strongly warm hue (warmth is dominant), light-medium value, medium-high chroma',
    identifying: 'Golden and glowing: golden blonde to copper-brown hair, warm green/topaz/warm blue eyes, golden or peachy skin that tans warmly; often freckled, sunny overall impression.',
    bestColors: [
      { name: 'Coral', hex: '#F1654C' }, { name: 'Warm Turquoise', hex: '#40C4B4' },
      { name: 'Golden Yellow', hex: '#F2C14E' }, { name: 'Leaf Green', hex: '#71A92C' },
      { name: 'Salmon Pink', hex: '#F98B88' }, { name: 'Camel', hex: '#B9935A' },
      { name: 'Warm Cream', hex: '#F5E6C8' }, { name: 'Tomato Red', hex: '#E23D28' },
    ],
    avoidColors: [
      { name: 'Black', hex: '#000000' }, { name: 'Cool Mauve', hex: '#B784A7' },
      { name: 'Icy Gray', hex: '#D5DBE3' }, { name: 'Plum', hex: '#5B1A32' },
    ],
    makeup: 'Coral and warm peach lips, golden bronze shadows, apricot blush; cool berry shades fight your glow.',
    hair: 'Golden copper, honey blonde, warm caramel; ash tones mute your warmth.',
  },
  'Bright Spring': {
    name: 'Bright Spring',
    dimensions: 'Warm-neutral hue, light-medium value, very high chroma (brightness is dominant)',
    identifying: 'Clear and vivid with warmth: bright eyes (clear green, turquoise, warm blue), hair from golden blonde to dark brown, clear warm skin; higher contrast than other Springs — colors look "switched on".',
    bestColors: [
      { name: 'Bright Coral', hex: '#FF6F61' }, { name: 'Turquoise', hex: '#30D5C8' },
      { name: 'Lime', hex: '#A4C639' }, { name: 'Warm Fuchsia', hex: '#E5539B' },
      { name: 'Bright Navy', hex: '#1F4096' }, { name: 'Poppy Red', hex: '#E3350D' },
      { name: 'Ivory', hex: '#FFF4E0' }, { name: 'Golden Yellow', hex: '#F2C14E' },
    ],
    avoidColors: [
      { name: 'Dusty Rose', hex: '#C4A4A0' }, { name: 'Muted Olive', hex: '#7A7A52' },
      { name: 'Stone Gray', hex: '#9FA4A9' }, { name: 'Soft Beige', hex: '#D8C8B0' },
    ],
    makeup: 'Bright coral or poppy lips, clean liner, luminous skin; muted, dusty shades dull your sparkle.',
    hair: 'Rich golden brown, bright copper, glossy warm black-brown; avoid ashy, flat colors.',
  },
};

export const SEASON_NAMES = Object.keys(SEASONS);

// Map common synonyms/spellings to canonical names (also covers older records).
const SEASON_ALIASES: Record<string, string> = {
  'true winter': 'Cool Winter', 'dark winter': 'Deep Winter', 'clear winter': 'Bright Winter',
  'true summer': 'Cool Summer', 'muted summer': 'Soft Summer',
  'true autumn': 'Warm Autumn', 'dark autumn': 'Deep Autumn', 'muted autumn': 'Soft Autumn',
  'true spring': 'Warm Spring', 'clear spring': 'Bright Spring',
};

export function getSeasonProfile(seasonType: string | null | undefined): SeasonProfile | null {
  if (!seasonType) return null;
  const key = seasonType.trim();
  if (SEASONS[key]) return SEASONS[key];
  const alias = SEASON_ALIASES[key.toLowerCase()];
  if (alias) return SEASONS[alias];
  // Loose match: find a canonical name contained in the string
  const found = SEASON_NAMES.find(n => key.toLowerCase().includes(n.toLowerCase()));
  return found ? SEASONS[found] : null;
}

// Compact reference block for stylist prompts.
export function formatSeasonReference(seasonType: string | null | undefined): string {
  const p = getSeasonProfile(seasonType);
  if (!p) {
    return 'No detailed season profile available; rely on general 12-season color theory.';
  }
  const best = p.bestColors.map(c => `${c.name} (${c.hex})`).join(', ');
  const avoid = p.avoidColors.map(c => `${c.name} (${c.hex})`).join(', ');
  return `SEASON PROFILE — ${p.name}
- Dimensions: ${p.dimensions}
- Typical features: ${p.identifying}
- Best colors: ${best}
- Colors to avoid: ${avoid}
- Makeup guidance: ${p.makeup}
- Hair guidance: ${p.hair}`;
}

// One-line criteria list of all 12 seasons, used by the photo analyzer.
export function formatSeasonCriteria(): string {
  return SEASON_NAMES
    .map(n => `- ${n}: ${SEASONS[n].dimensions}. ${SEASONS[n].identifying}`)
    .join('\n');
}

export const ANALYSIS_SYSTEM_PROMPT = `You are a world-class personal color analyst certified in the 12-season color analysis system. You analyze portrait photos with a rigorous, unbiased methodology.

METHODOLOGY — follow these steps in order, based ONLY on what you actually observe in the photo:
1. SKIN: Estimate depth (fair / light / medium / tan / deep) and undertone. Undertone cues: golden, peachy or yellow cast = warm; pink, rosy or bluish cast = cool; olive or hard to tell = neutral (lean warm or cool).
2. EYES: Identify the color and clarity (e.g. icy blue, gray-blue, clear green, soft hazel, amber, warm brown, espresso). Note whether they look bright/clear or soft/muted.
3. HAIR: Identify depth and cast (e.g. ash blonde, golden blonde, copper, ash brown, golden brown, espresso, black). Ash/cool cast vs golden/warm cast matters.
4. CONTRAST: Compare the value difference between skin, eyes and hair: high / medium / low.
5. THREE DIMENSIONS: From the above, decide: Hue (warm / cool / neutral-warm / neutral-cool), Value (light / medium / deep), Chroma (bright / medium / soft).
6. CLASSIFY into exactly one of these 12 seasons (primary) and optionally the closest alternative (secondary):
${formatSeasonCriteria()}

ANTI-BIAS RULES (critical):
- Evaluate every photo independently. Do NOT default to a frequent answer — every one of the 12 seasons must be a genuinely possible outcome depending on the person.
- Deep Autumn requires BOTH clearly warm undertone AND very deep features. A person with light hair or cool undertone can never be Deep Autumn.
- If the photo has strong artificial lighting, filters or heavy makeup, factor that in and reduce your confidence score.
- The season must be logically consistent with your recorded observations. Double-check: does your chosen season's typical description actually match what you wrote in steps 1-4?

OUTPUT: Return ONLY a valid JSON object, no markdown, no extra text.`;

export const ANALYSIS_USER_PROMPT = `Analyze this photo using your methodology and return JSON in exactly this format:
{
  "undertone": "warm | cool | neutral-warm | neutral-cool",
  "depth": "light | medium | deep",
  "chroma": "bright | medium | soft",
  "contrast": "high | medium | low",
  "features": {
    "skin": "short description of skin depth and undertone cues",
    "eyes": "short description of eye color and clarity",
    "hair": "short description of hair depth and cast"
  },
  "season_type": "one of: ${SEASON_NAMES.join(', ')}",
  "secondary_season": "the closest alternative season, or null",
  "confidence": 0-100,
  "reasoning": "2-3 sentences explaining why this season fits the observations"
}`;
