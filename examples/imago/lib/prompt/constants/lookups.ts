import { Choices } from "@lib/schema";

export const HAIR_STYLE_MAP: Record<Choices["hair_style"], string> = {
  natural_dark_waves: "Long waves with polished shine",
  straight_long_hair: "Waist-length straight hair that looks simply brushed",
  loose_soft_curls: "Loose curls resting naturally without styling",
  chin_length_bob: "Chin-length bob falling loosely around the face",
  casual_ponytail: "Ponytail gathered quickly with a loose tie",
  twin_ponytails: "Two ponytails tied casually on either side",
  short_textured_crop: "Short textured crop with natural movement and subtle layers",
  undercut_fade: "Undercut fade with short sides and longer textured top",
  messy_bedhead: "Messy bedhead style with tousled texture and natural volume",
  slicked_back: "Slicked back hair with a polished, controlled finish",
  side_part_classic: "Classic side part with clean separation and structured shape",
  androgynous_pixie: "Androgynous pixie cut with soft edges and versatile styling"
};

export const MOBILE_FRONT_HAIR_OVERRIDES: Record<Choices["hair_style"], string> = {
  natural_dark_waves: "Wavy hair, slightly messy",
  straight_long_hair: "Long straight hair that looks simply brushed",
  loose_soft_curls: "Loose curls resting naturally without styling",
  chin_length_bob: "Chin-length bob falling loosely around the face",
  casual_ponytail: "Ponytail gathered quickly with a loose tie",
  twin_ponytails: "Two ponytails tied casually on either side",
  short_textured_crop: "Short textured crop, slightly messy and unstyled",
  undercut_fade: "Undercut fade with short sides and longer textured top, casual and unstyled",
  messy_bedhead: "Messy bedhead style with tousled texture and natural volume",
  slicked_back: "Slicked back hair, slightly disheveled from daily wear",
  side_part_classic: "Classic side part with clean separation, casual and everyday",
  androgynous_pixie: "Androgynous pixie cut with soft edges, slightly tousled"
};

export const HAIR_COLOR_MAP: Record<NonNullable<Choices["hair_color"]>, string> = {
  black: "black",
  brown: "brown",
  white: "white",
  gray: "gray",
  pink: "pink",
  green: "green",
  blue: "blue",
  red: "red",
  purple: "purple",
  blonde: "blonde",
  orange: "orange",
  random: "random color"
};

export const TOP_STYLE_MAP: Record<Choices["top_style"], { top: string; details: string }> = {
  casual_tee: {
    top: "Soft cotton short-sleeve tee with a relaxed neckline",
    details: "Everyday jersey fabric with minimal seams and a laid-back fit"
  },
  soft_blouse: {
    top: "Lightweight blouse with a gentle drape",
    details: "Subtle collar and simple buttons, fabric moves softly with the body"
  },
  knit_sweater: {
    top: "Fine-knit pullover hugging the torso",
    details: "Slim rib trim at the cuffs and hem, smooth knit texture"
  },
  cozy_sweater: {
    top: "Chunky wool sweater with a relaxed drop-shoulder fit",
    details: "Thicker ribbed trims and plush yarn with soft texture"
  },
  fitted_wool_top: {
    top: "Form-fitting wool pullover with a tidy crew neckline",
    details: "Fine-gauge wool hugging the torso with clean vertical ribbing"
  },
  sleek_camisole: {
    top: "Slim camisole with clean straps and straight neckline",
    details: "Smooth fabric with a faint sheen, no additional embellishments"
  },
  mesh_top: {
    top: "Semi-sheer mesh top made of fine translucent fabric with delicate texture",
    details: "Light, breathable mesh material that subtly reveals the skin tone underneath while maintaining an elegant, covered appearance"
  },
  one_piece_swimsuit: {
    top: "High-neck one-piece suit with high-cut leg opening",
    details:
      "Lycra-spandex blend with a soft matte sheen, slightly translucent. Fits like a second skin, exposing hip bones and side curves with the leg opening reaching the waist. Fabric tension rounds the chest, creates gentle indentations at the groin and underarms, and leaves subtle stretch wrinkles along the waist and underbust."
  },
  jk_uniform: {
    top: "Classic JK uniform top with crisp collar and ribbon tie",
    details: "Structured blazer-inspired cut with neat pleats and school-inspired tailoring"
  },
  one_piece_dress: {
    top: "One-piece dress with a cohesive silhouette",
    details: "Continuous fabric from bodice to hem, showing no waist seam"
  },
  high_slit_cheongsam: {
    top: "High-slit cheongsam bodice",
    details: "Fitted upper body with a dramatic side slit integral to the design"
  },
  mens_suit: {
    top: "Structured men's suit jacket with dress shirt underneath",
    details: "Tailored jacket with notch lapels over a crisp dress shirt with collar and tie, matching fabric trousers"
  },
  womens_suit: {
    top: "Fitted women's suit jacket with blouse underneath",
    details: "Softly tailored blazer over a dress blouse, paired with matching skirt or trousers"
  },
  silk_nightgown: {
    top: "Silk nightgown with slim straps",
    details: "Lace-trimmed bodice flowing into a graceful silk skirt"
  },
  blazer_no_underlay: {
    top: "Blazer or suit jacket worn alone without any undergarment",
    details: "Worn directly over skin or minimal undergarments for a deep V-neckline revealing skin"
  },
  button_down_shirt: {
    top: "Classic white button-down shirt, slightly translucent, with top buttons undone",
    details: "Crisp cotton shirt worn with a relaxed, open collar, sleeves rolled up to elbows, hinting at the skin underneath"
  },
  hoodie: {
    top: "Relaxed hoodie with a drawstring hood and front pocket",
    details: "Soft fleece or cotton blend with ribbed cuffs and hem"
  },
  tank_top: {
    top: "Tight-fitting ribbed tank top",
    details: "Form-fitting cotton fabric that clings to the torso and highlights muscle definition"
  },
  oversized_sweater: {
    top: "Oversized sweater with a loose fit",
    details: "Dropped shoulders and plush knit texture"
  },
  v_neck_tee: {
    top: "V-neck t-shirt with a relaxed fit",
    details: "Classic casual top with a flattering neckline"
  },
  henley_shirt: {
    top: "Henley shirt with a buttoned placket",
    details: "Casual long-sleeve top with partial button closure"
  },
  bath_towel: {
    top: "",
    details: ""
  },
  none: {
    top: "",
    details: ""
  }
};

export const BOTTOM_STYLE_MAP: Record<Exclude<Choices["bottom_style"], "none">, string> = {
  mini_skirt: "Simple mini skirt that skims mid-thigh",
  midi_skirt: "Midi skirt falling to mid-calf with a soft flare",
  body_conscious_maxi_skirt: "Body-conscious maxi skirt that hugs the hips and thighs, extending to ankle length",
  tailored_trousers: "Impeccably tailored dress trousers with a sharp crease and fitted waist",
  sweatpants: "Soft grey sweatpants with a relaxed drape and comfortable fit, emphasizing casual texture",
  yoga_leggings: "High-stretch yoga leggings hugging the legs down to the ankle, rendered in muted tones (dusty mauve, slate olive, charcoal brown—avoid default black)",
  denim_jeans: "Classic slim denim jeans with a clean straight leg",
  casual_shorts: "Relaxed mid-thigh shorts with a gentle structure",
  swim_trunks: "Swim trunks with elastic waistband and quick-dry fabric, typically reaching mid-thigh",
  cargo_pants: "Utility cargo pants with multiple pockets and a relaxed fit",
  chino_pants: "Classic chino pants with a clean, tailored silhouette",
  athletic_shorts: "Athletic shorts with a comfortable fit and sporty design",
  wide_leg_pants: "Wide-leg pants with a flowing silhouette",
  pleated_trousers: "Pleated dress trousers with a structured waist and clean lines",
  bath_towel: ""
};

export const HOSIERY_CONCEALING_BOTTOMS = [
  "tailored_trousers",
  "yoga_leggings",
  "denim_jeans",
  "cargo_pants",
  "chino_pants",
  "wide_leg_pants",
  "pleated_trousers",
  "sweatpants"
] as const satisfies ReadonlyArray<Choices["bottom_style"]>;

export type HosieryConcealingBottom = (typeof HOSIERY_CONCEALING_BOTTOMS)[number];

const HOSIERY_CONCEALING_BOTTOM_SET = new Set<Choices["bottom_style"]>(HOSIERY_CONCEALING_BOTTOMS);

export function isHosieryConcealingBottom(
  bottom: Choices["bottom_style"]
): bottom is HosieryConcealingBottom {
  return HOSIERY_CONCEALING_BOTTOM_SET.has(bottom);
}

export const HOSIERY_PEEK_REFERENCES: Record<HosieryConcealingBottom, string> = {
  tailored_trousers: "the trouser hem",
  yoga_leggings: "the leggings cuff near the ankle",
  denim_jeans: "the jean hem",
  cargo_pants: "the cargo pants hem",
  chino_pants: "the chino pants hem",
  wide_leg_pants: "the wide-leg pants hem",
  pleated_trousers: "the pleated trousers hem",
  sweatpants: "the elastic cuff"
};

export const HOSIERY_TYPE_MAP: Record<Choices["hosiery_type"], string> = {
  pantyhose: "pantyhose",
  garter: "garter stockings",
  thigh_high: "thigh-high stockings",
  knee_high: "knee-high socks",
  calf_sock: "calf socks",
  ankle_sock: "ankle socks",
  fishnet: "fishnet tights"
};

export const HOSIERY_COLOR_MAP: Record<Choices["hosiery_color"], string> = {
  black: "black",
  gray: "gray",
  white: "white",
  brown: "brown",
  random: "random color"
};

export const HOSIERY_MATERIAL_MAP: Record<Choices["hosiery_material"], string> = {
  velvet: "Matte, High-stretch, Soft-touch",
  core_spun: "spandex core-spun yarn",
  glossy: "high-gloss finish",
  woolen: "wool-blend knit",
  fishnet_large: "large-diamond fishnet",
  fishnet_small: "fine-diamond fishnet",
  cotton: "soft cotton fabric with matte finish",
  knit: "chunky knit texture with visible weave pattern"
};

export const FOOTWEAR_STYLE_MAP: Record<Choices["footwear_style"], string> = {
  patent_heels: "Patent stiletto heels with mirror shine",
  platform_boots: "Chunky platform ankle boots with metal eyelets",
  sleek_mules: "Sleek pointed-toe mules with smooth leather",
  casual_sneakers: "Low-profile sneakers with clean lines and minimal branding",
  tall_boots: "Knee-high boots with a straight shaft and subtle hardware",
  birken_sandals: "Two-strap cork-footbed sandals with matte buckles",
  foam_clogs: "Soft foam clogs with vent holes and rounded silhouette",
  home_slippers: "Cozy house slippers with soft uppers and flat soles",
  uniform_loafers: "Gloss-finished uniform loafers with low heels and neat stitching",
  low_cut_flats: "Belle Vivier Ballerinas in satin with the signature trompe-l'œil buckle",
  barefoot: "Bare feet",
  high_top_sneakers: "High-top sneakers with laces and ankle support",
  leather_boots: "Classic leather boots with a structured design",
  canvas_sneakers: "Canvas sneakers with a casual, everyday style",
  slip_on_sneakers: "Slip-on sneakers with elastic sides and no laces",
  dress_shoes: "Formal dress shoes with a polished finish and classic design"
};

export const MOBILE_FRONT_FOOTWEAR_OVERRIDES: Partial<
  Record<Exclude<Choices["footwear_style"], "barefoot">, string>
> = {
  patent_heels: "Plain patent heels with light scuffing, nothing especially polished",
  platform_boots: "Regular platform ankle boots with standard laces and everyday wear",
  sleek_mules: "Simple pointed mules with a muted leather finish and minimal shine",
  casual_sneakers: "Everyday sneakers with slightly worn rubber soles",
  tall_boots: "Well-loved tall boots with a few creases around the ankle",
  birken_sandals: "Basic two-strap sandals with visible footbed wear",
  foam_clogs: "Soft foam clogs with a used matte finish",
  home_slippers: "Simple fabric slippers that look flattened from regular use",
  uniform_loafers: "Standard uniform loafers with creased uppers",
  low_cut_flats: "Everyday flats with softened edges",
  high_top_sneakers: "High-tops with gently frayed laces",
  leather_boots: "Broken-in leather boots with subtle creasing",
  canvas_sneakers: "Canvas sneakers with faint scuffing",
  slip_on_sneakers: "Slip-ons with stretched elastic panels",
  dress_shoes: "Polished dress shoes with mild wear"
};

export const HAIR_CLIP_MAP: Record<Choices["hair_clip"], string> = {
  none: "No hair accessory",
  matte_claw_clip: "Matte claw clip gathering hair loosely at the back",
  simple_barrette: "Simple barrette holding a side part neatly in place",
  soft_headband: "Soft fabric headband pushing hair away from the face"
};

export const EARRING_MAP: Record<Choices["earrings"], string> = {
  none: "No earrings",
  minimal_studs: "Minimalist stud earrings with understated shine",
  delicate_drops: "Delicate drop earrings that move subtly with motion",
  clean_hoops: "Clean medium hoops with a light metallic finish"
};

export const NECK_BODY_ACCESSORIES_MAP: Record<Choices["neck_body_accessories"], string> = {
  none: "No neck or body accessories",
  choker: "Black velvet or leather choker worn tight against the neck",
  body_chain: "Thin gold or silver body chain draping over the torso"
};

export const GLASSES_STYLE_MAP: Record<Choices["glasses_style"], string> = {
  none: "No glasses",
  metal_rimless: "True rimless rectangular eyeglasses with thin gold bridge and temples, transparent nose pads",
  semi_rimless: "Half-frame browline eyeglasses with black acetate browline and silver metal lower frame",
  gold_wire_frame: "Delicate gold wire-frame glasses with thin, elegant rims",
  full_frame: "Thick black full-frame eyeglasses with rounded rectangular lenses",
  aviator_sunglasses: "Classic aviator sunglasses with teardrop-shaped lenses and thin metal frames",
  cat_eye_sunglasses: "Cat-eye sunglasses with upswept outer corners and bold frames"
};

export const MAKEUP_STYLE_INTENSITY_MAP: Record<
  `${Choices["makeup_style"]}_${Choices["makeup_intensity"]}`,
  { lips: string; cheeks: string }
> = {
  natural_light: {
    lips: "Soft clear balm with almost no added color; natural lip lines and texture fully visible, no crisp lipstick edges",
    cheeks:
      "Cheeks & eyes: No visible blush or contour, only a faint natural flush; bare lids with no eyeshadow or liner; brows left natural and unfilled, only lightly brushed"
  },
  natural_medium: {
    lips:
      "Sheer beige-rose tint with a touch of gloss; lip texture still clearly visible, looks like everyday tinted balm rather than full lipstick",
    cheeks:
      "Cheeks & eyes: Soft pink blush on the apples of the cheeks, blended with slightly uneven edges; lashes darkened with a single light coat of mascara; brows brushed into shape but not sharply drawn, no harsh lines"
  },
  natural_intense: {
    lips:
      "Rosy-nude lipstick with more solid coverage and gentle definition, edges still slightly softened instead of sharply lined",
    cheeks:
      "Cheeks & eyes: Warm pink blush swept from cheek apples toward the temples; thin brown liner hugging the lash line and a clearer coat of mascara; brows softly filled to slightly deepen color but still look natural, no crisp outline"
  },
  sweet_light: {
    lips: "Soft pink balm with a light peach tint and dewy shine, natural lip lines still visible underneath",
    cheeks:
      "Cheeks & eyes: Light peach-pink blush centered high on the cheek apples, blended with airy, soft edges; lids carry a whisper of pink or peach wash without clear edges; lashes remain mostly natural with at most a hint of mascara"
  },
  sweet_medium: {
    lips: "Pink-coral lip tint with a dewy finish and slightly stronger color, still thin enough that lip texture shows through",
    cheeks:
      "Cheeks & eyes: Peach-pink blush placed on the upper cheek apples and slightly toward the nose, softly diffused; lids show a gentle pink shimmer or satin finish; upper lashes coated once or twice with mascara for a visibly cuter eye, brows kept soft and slightly rounded"
  },
  sweet_intense: {
    lips: "Bright pink-coral lipstick with noticeable color and glossy finish, edges still a bit blurred rather than sharply lined",
    cheeks:
      "Cheeks & eyes: Vivid peach-pink blush extending from cheek apples toward the temples with a clear bloom; lids carry visible pink shimmer or soft glitter; upper lashes more clearly volumized with mascara, lower lashes lightly defined; brows rounded and slightly more defined but not angular"
  },
  mature_light: {
    lips: "Rose-brown tinted balm with subtle sheen, gently deepening the natural lip tone without fully coating it",
    cheeks:
      "Cheeks & eyes: Muted rose blush swept along the cheekbones rather than centered on the apples; lids washed with a very soft taupe or beige shadow; brows groomed and slightly sharpened at the tail without strong filling"
  },
  mature_medium: {
    lips: "Rose-berry lipstick with a satin finish and even coverage, a bit more defined along the natural lip line",
    cheeks:
      "Cheeks & eyes: Rose blush placed along and slightly under the cheekbones for mild contour effect; lids carry taupe or soft brown shadow with visible depth in the crease; a thin line of brown or black liner near the upper lashes; brows filled to a clean but not overly bold shape"
  },
  mature_intense: {
    lips: "Deep rose-berry lipstick with semi-matte finish and clear, intentional edges along the lip line",
    cheeks:
      "Cheeks & eyes: Rose-toned contour and blush emphasizing cheekbone structure; lids show layered brown or plum shadow with intentional depth; upper lash line fully lined in brown or black with slight extension; brows distinctly defined with sharper tails, still keeping a realistic hair texture"
  },
  sultry_light: {
    lips: "Sheer berry tint with subtle shine, slightly deepening the natural lip color without full opacity",
    cheeks:
      "Cheeks & eyes: Soft rose blush higher on the outer cheeks; lids washed with muted smoky taupe or grey-brown, edges gently hazed; upper lashes slightly thickened with mascara, brows kept smooth and slightly stronger than natural"
  },
  sultry_medium: {
    lips: "Berry-wine lipstick with visible color and a soft satin sheen, lip lines still faintly perceptible",
    cheeks:
      "Cheeks & eyes: Rose blush blended toward the temples, leaving the center of the face a bit more sculpted; lids carry a clear smoky brown or charcoal gradient concentrated around the lash line; upper lashes visibly volumized; lower lash line lightly smudged; brows deeper and more defined with a confident arch"
  },
  sultry_intense: {
    lips: "Deep wine-red matte lipstick with bold saturation, edges clean and intentional, slight lived-in texture from wear",
    cheeks:
      "Cheeks & eyes: Strong rose-plum blush and contour framing cheekbones; lids show full smoky eye with dark shadow concentrated at the outer corners and along both lash lines; liner clearly visible with slight wing or extended shape; lashes thick and dark, rendered as real hair; brows bold, well-filled, and sharply structured"
  }
};
export const TOP_STYLE_INTEGRATED_BOTTOM: Partial<Record<Choices["top_style"], {
  bottom: string;
  highlight: string;
}>> = {
  jk_uniform: {
    bottom: "Matching pleated skirt that comes with the JK uniform set",
    highlight: "The JK uniform behaves as one coordinated outfit—tailored top and pleated skirt are inseparable."
  },
  one_piece_dress: {
    bottom: "One-piece dress extending past the hips as a continuous garment",
    highlight: "Treat the dress as a self-contained outfit from neckline to hem—no separate bottom layer or visible waist seam should appear."
  },
  high_slit_cheongsam: {
    bottom: "High-slit cheongsam extending past the hips as a continuous garment with a high side slit",
    highlight: "The cheongsam behaves as one integrated outfit from neckline to hem—no separate bottom layer or visible waist seam should appear. The high side slit is an integral part of the cheongsam design."
  },
  mens_suit: {
    bottom: "Straight cut trousers that come with the men's suit set",
    highlight: "The men's suit behaves as one coordinated outfit—tailored jacket with structured shoulders and straight cut trousers are inseparable. Maintain consistent fabric and color throughout."
  },
  womens_suit: {
    bottom: "Matching skirt or slim trousers that come with the women's suit set",
    highlight: "The women's suit behaves as one coordinated outfit—fitted blazer with soft tailoring and matching skirt or slim trousers are inseparable. Maintain consistent fabric and color throughout."
  },
  silk_nightgown: {
    bottom: "Silk nightgown extending past the hips as a continuous garment with delicate lace details",
    highlight: "The silk nightgown behaves as one integrated outfit from neckline to hem—no separate bottom layer or visible waist seam should appear."
  }
};