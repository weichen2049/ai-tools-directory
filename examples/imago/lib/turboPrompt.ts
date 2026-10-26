import type { PromptJson } from "@lib/promptTypes";

const MAX_TURBO_PROMPT_LENGTH = 1000;

const POSE_KEYWORDS: Record<string, string> = {
    studio_runway_cross: "standing with legs elegantly crossed, model pose, full body",
    studio_stool_legup: "sitting on stool with one leg lifted, casual studio pose",
    studio_floor_reach: "sitting on floor, leaning back on hands, legs extended",

    dorm_mirror_forward: "mirror selfie, standing facing mirror, holding smartphone",
    dorm_bed_relax: "mirror selfie, sitting on bed, phone in hand",
    dorm_floor_kneel: "mirror selfie, kneeling on floor, smartphone selfie",

    mobile_side_lie: "lying on bed on side, front camera selfie, relaxed pose",
    mobile_bed_prone: "lying on stomach on bed, front camera selfie",
    mobile_sitting: "sitting selfie, phone held at face level",
    mobile_hand_on_cheek: "selfie with hand resting on cheek, soft expression",
    mobile_side_profile: "side profile selfie, looking away from camera",

    pov_hand_hold: "POV shot, reaching toward camera, intimate perspective",
    pov_overhead_hover: "POV from below looking up, low angle, hovering near gaze",
    pov_sit_beside: "POV sitting beside, close intimate framing, tactile immediacy",
    pov_reach_to_camera: "POV reaching hand toward camera lens, invading personal space, close proximity",
    pov_bed_twist: "kneeling on soft surface with knees apart, hips sinking toward heels, torso twisting back toward lens, lower back arched, confident playful gaze, one shoulder rotated forward",
    pov_kneel_lookup: "POV looking down at kneeling subject, magnetic calm expression, unwavering eye contact",

    peace_sign: "peace sign gesture, playful expression",
    kitten_lookback: "on all fours, looking back over shoulder seductively",
    m_squat: "wide-stance deep squat, legs spread apart, knees pushed outward, holding smartphone for mirror selfie",

    closeup_legs: "legs closeup, smooth skin detail, thigh focus",
    closeup_feet: "feet closeup, delicate toes",
    closeup_glutes: "buttocks closeup, curves emphasized",
    closeup_waist: "waist closeup, slim waist definition",
    closeup_abdomen: "abs closeup, stomach detail",
    closeup_back: "back closeup, spine and shoulder blades",
    closeup_neck: "neck closeup, collarbone detail",
    closeup_chest: "chest closeup, décolletage",
    closeup_arms: "arms closeup, smooth skin",
    closeup_hands: "hands closeup, delicate fingers",

    walking_lookback: "walking and looking back over shoulder, candid",
    checking_phone: "standing and looking at phone, casual candid",
    fixing_hair: "adjusting hair with hand, candid moment",
    waiting_lean: "leaning against wall, casual waiting pose",
    holding_drink: "holding drink in hand, relaxed stance",

    tie_adjust: "adjusting tie with both hands, looking at camera",
    wall_lean: "leaning against wall with one shoulder, arms crossed or in pocket",
    shirt_pull: "pulling shirt hem up slightly, revealing lower abs"
};

const STYLE_MODE_KEYWORDS: Record<string, string> = {
    studio_elegant: "professional studio lighting, sharp focus, clean backdrop, high-end fashion photography",
    mirror_selfie: "mirror selfie, smartphone in hand, casual mirror reflection",
    mobile_front: "front camera phone selfie, casual angle, close to face",
    pov_interaction: "First-person interaction, viewer's eyes as lens, subject invades personal space, hovering near gaze, unwavering eye contact, tactile immediacy, no visible walls",
    body_part_closeup: "macro closeup shot, extreme detail, skin texture visible",
    rough_street_snap: "street photography, candid moment, high ISO grain, natural lighting",
    dormitory_mirror_selfie: "dorm room mirror selfie, casual bedroom setting, smartphone",
    mobile_front_camera_accidental_snapshot: "accidental selfie, caught off-guard, natural expression",
    pov_interaction_first_person: "POV intimate perspective, first-person view, direct eye contact, viewer physically present, near surfaces",
    body_part_macro_focus: "extreme macro detail, skin pores visible, texture focus",
    rough_street_snap_candid: "candid street snapshot, urban setting, authentic moment",
    studio_photoreal_high_fidelity: "studio portrait, professional lighting, 8K quality, photorealistic"
};

const MOOD_KEYWORDS: Record<string, string> = {
    playful_tongue: "playful expression, tongue sticking out, cute and teasing",
    confident_smile: "confident radiant smile, self-assured expression, warm eyes",
    sultry_gaze: "sultry seductive gaze, bedroom eyes, lips slightly parted",
    ahegao: "ahegao expression, eyes rolling back, tongue out, ecstatic face",
    pitiful_gaze: "teary pleading eyes, vulnerable expression, soft pout",
    tearful_cry: "crying, tears streaming down face, emotional expression"
};

const HOSIERY_TYPE_KEYWORDS: Record<string, string> = {
    pantyhose: "pantyhose made with high-gloss finish, bone structure readable but overlaid with intense highlights, seamless coverage from waist to toes, continuous fabric",
    garter: "garter belt and stockings, lace trim, exposed thigh skin above stocking top",
    thigh_high: "thigh-high stockings, stay-up band, bare thighs above",
    knee_high: "knee-high socks, calf-length hosiery",
    calf_sock: "calf-length socks, casual style",
    ankle_sock: "ankle socks, low-cut",
    fishnet: "fishnet stockings, mesh pattern visible, sexy legwear"
};

const HOSIERY_MATERIAL_KEYWORDS: Record<string, string> = {
    velvet: "velvet texture, soft sheen",
    core_spun: "sheer, matte finish",
    glossy: "20D sheer satin finish, soft ambient luster, delicate fabric texture, non-oily natural sheen",
    woolen: "wool texture, warm and matte",
    fishnet_large: "large mesh pattern",
    fishnet_small: "small mesh pattern"
};

const TOP_KEYWORDS: Record<string, string> = {
    casual_tee: "t-shirt",
    soft_blouse: "blouse",
    knit_sweater: "knit sweater",
    cozy_sweater: "sweater",
    fitted_wool_top: "wool top",
    sleek_camisole: "camisole",
    mesh_top: "mesh top",
    one_piece_swimsuit: "swimsuit",
    jk_uniform: "JK uniform",
    one_piece_dress: "dress",
    high_slit_cheongsam: "cheongsam",
    mens_suit: "suit",
    womens_suit: "blazer",
    silk_nightgown: "Silk nightgown with slim straps, delicate lace details",
    blazer_no_underlay: "blazer",
    button_down_shirt: "shirt",
    hoodie: "hoodie",
    tank_top: "tank top",
    oversized_sweater: "oversized sweater",
    v_neck_tee: "v-neck tee",
    henley_shirt: "henley",
    bath_towel: "towel",
    none: "topless"
};

const BOTTOM_KEYWORDS: Record<string, string> = {
    mini_skirt: "mini skirt",
    midi_skirt: "midi skirt",
    body_conscious_maxi_skirt: "maxi skirt",
    tailored_trousers: "trousers",
    yoga_leggings: "leggings",
    denim_jeans: "jeans",
    casual_shorts: "shorts",
    swim_trunks: "trunks",
    cargo_pants: "cargo pants",
    chino_pants: "chinos",
    athletic_shorts: "athletic shorts",
    wide_leg_pants: "wide leg pants",
    pleated_trousers: "pleated trousers",
    bath_towel: "towel",
    none: "no panties"
};

const FOOTWEAR_KEYWORDS: Record<string, string> = {
    patent_heels: "heels",
    platform_boots: "platform boots",
    sleek_mules: "mules",
    casual_sneakers: "sneakers",
    tall_boots: "tall boots",
    birken_sandals: "sandals",
    foam_clogs: "clogs",
    home_slippers: "slippers",
    uniform_loafers: "loafers",
    low_cut_flats: "flats",
    barefoot: "barefoot",
    high_top_sneakers: "high-tops",
    leather_boots: "leather boots",
    canvas_sneakers: "canvas sneakers",
    slip_on_sneakers: "slip-ons",
    dress_shoes: "dress shoes",
    none: "barefoot"
};

const SCENE_KEYWORDS: Record<string, string> = {
    dorm_room: "dorm room with standing mirror, posters, messy bedding, warm ambient lighting",
    bathroom: "bathroom mirror, bright lighting, tiles visible",
    changing_room: "fitting room with full-length mirror, curtain visible",
    elevator_reflection: "elevator mirror, fluorescent lighting, metal walls",
    gym: "gym setting, exercise equipment, mirrors",
    hotel_suite: "hotel room, large bed, warm lighting, elegant decor",
    photo_studio: "photo studio, professional lighting, backdrop",
    city_street: "city street, urban background, natural lighting",
    cafe: "cafe interior, cozy atmosphere, warm tones",
    luxury_apartment: "luxury apartment, modern interior, large windows",
    bedroom: "bedroom, bed visible, soft lighting, intimate setting",
    sofa_lounge: "living room sofa, comfortable setting",
    hallway: "hallway, corridor lighting",
    elevator_cabin: "inside elevator, mirror reflection, confined space",
    street_corner: "street corner, urban setting, passersby",
    restaurant_booth: "restaurant booth, ambient lighting",
    beach_sunset: "beach at sunset, golden hour lighting, waves",
    crosswalk: "crosswalk, city traffic, candid moment",
    convenience_store: "convenience store, fluorescent lighting",
    subway_platform: "subway platform, underground lighting",
    night_market: "night market, colorful lights, bustling crowd",
    car_backseat: "shot from front of car facing backseat, subject seated in backseat, car interior visible, window light"
};

const ETHNICITY_KEYWORDS: Record<string, string> = {
    east_asian: "East Asian",
    south_asian: "South Asian",
    southeast_asian: "Southeast Asian",
    white_caucasian: "Caucasian",
    black_african: "Black",
    hispanic_latino: "Latina",
    middle_eastern: "Middle Eastern",
    mixed: "mixed ethnicity",
    random: ""
};

const BODY_TYPE_KEYWORDS: Record<string, string> = {
    pear: "pear-shaped feminine figure, wider hips, fuller thighs, smaller bust, soft curves",
    petite: "petite frame, slender build, small stature, delicate proportions",
    full: "curvy full figure, soft body contours, generous curves, plush physique",
    voluptuous: "voluptuous thick figure, large bust, wide hips, soft thighs, fleshy curves, heavy feminine silhouette",
    model: "tall stature, long slender limbs, runway model physique, elegant proportions",
    hourglass: "hourglass figure, defined narrow waist, balanced bust and hips, classic feminine curves"
};

const MALE_BODY_TYPE_KEYWORDS: Record<string, string> = {
    lean: "very slender frame, visible collarbones, slight build, youthful physique",
    toned: "athletic build, defined muscle tone, vascular arms, V-taper torso, lean physique",
    muscle_bulky: "heavy muscular build, thick neck, powerful frame",
    beefy: "heavy build, strong frame, thick torso, powerlifter physique",
    chubby: "soft physique, heavier build, rounded features"
};

const AGENDER_BODY_TYPE_KEYWORDS: Record<string, string> = {
    pear: "wide hips, bottom heavy build",
    petite: "petite, small frame, androgynous",
    full: "heavyset, soft physique",
    voluptuous: "thick, soft curves, fleshy",
    model: "tall, lanky, flat chested, runway figure",
    hourglass: "defined waist, wide hips, androgynous",
    lean: "thin, slim, slender build",
    toned: "defined muscle tone, fit",
    muscle_bulky: "muscular, strong build, heavy frame",
    beefy: "thick build, strong frame, bulky physique",
    chubby: "soft physique, overweight"
};

const HAIR_STYLE_KEYWORDS: Record<string, string> = {
    natural_dark_waves: "dark brown wavy hair with natural shine, soft waves cascading, Loose curls resting naturally without styling",
    straight_long_hair: "long straight silky hair, sleek and shiny",
    loose_soft_curls: "Loose curls resting naturally without styling, bouncy romantic waves",
    chin_length_bob: "chin-length bob haircut, neat and stylish",
    casual_ponytail: "casual high ponytail, youthful and sporty",
    twin_ponytails: "twin ponytails, playful and cute",
    short_textured_crop: "short textured cropped hair, edgy style",
    undercut_fade: "undercut fade haircut, modern masculine style",
    messy_bedhead: "messy bedhead hair, tousled and natural",
    slicked_back: "slicked back hair, sleek and polished",
    side_part_classic: "classic side-parted hair, neat and refined",
    androgynous_pixie: "pixie cut, short and androgynous"
};

const NECK_BODY_ACCESSORIES_KEYWORDS: Record<string, string> = {
    none: "",
    choker: "choker necklace",
    body_chain: "body chain jewelry",
    pendant_necklace: "pendant necklace",
    pearl_necklace: "pearl necklace",
    collar: "collar"
};

const HAIR_CLIP_KEYWORDS: Record<string, string> = {
    none: "",
    matte_claw_clip: "claw clip",
    simple_barrette: "barrette",
    soft_headband: "soft headband"
};

const EARRING_KEYWORDS: Record<string, string> = {
    none: "",
    minimal_studs: "stud earrings",
    delicate_drops: "drop earrings",
    clean_hoops: "hoop earrings"
};

const GLASSES_KEYWORDS: Record<string, string> = {
    none: "",
    metal_rimless: "thin metal rimless rectangular glasses, transparent nose pads",
    semi_rimless: "half-frame browline glasses, black acetate browline",
    gold_wire_frame: "delicate gold wire-frame glasses, thin elegant rims",
    full_frame: "thick black full-frame glasses, rounded rectangular lenses",
    aviator_sunglasses: "classic aviator sunglasses, teardrop lenses, metal frames",
    cat_eye_sunglasses: "cat-eye sunglasses, upswept corners, bold frames"
};

const QUALITY_SUFFIX_KEYWORDS: Record<string, string> = {
    studio_elegant: "photorealistic, sharp focus, professional lighting, skin texture",
    studio_photoreal_high_fidelity: "photorealistic, sharp focus, professional lighting, skin texture",
    mirror_selfie: "phone camera quality, slight grain, natural imperfections, no retouching",
    dormitory_mirror_selfie: "phone camera quality, slight grain, natural imperfections, no retouching",
    mobile_front: "front camera selfie quality, natural imperfections, no beauty filter, authentic skin",
    mobile_front_camera_accidental_snapshot: "front camera selfie quality, natural imperfections, no beauty filter, authentic skin",
    pov_interaction: "realistic skin, handheld quality, natural lighting, no retouching",
    pov_interaction_first_person: "realistic skin, handheld quality, natural lighting, no retouching",
    body_part_closeup: "macro detail, skin texture, natural imperfections, zero retouching",
    body_part_macro_focus: "macro detail, skin texture, natural imperfections, zero retouching",
    rough_street_snap: "candid snapshot, high ISO grain, documentary realism, no retouching",
    rough_street_snap_candid: "candid snapshot, high ISO grain, documentary realism, no retouching"
};

export function buildTurboPrompt(prompt: PromptJson): string {
    const parts: string[] = [];

    if (prompt.custom_base_prompt) {
        parts.push(prompt.custom_base_prompt);
    }

    const subject = prompt.scene?.subject;
    const environment = prompt.scene?.environment;

    if (prompt.style_mode) {
        const styleKeyword = STYLE_MODE_KEYWORDS[prompt.style_mode] || prompt.style_mode.replace(/_/g, " ");
        if (styleKeyword) parts.push(styleKeyword);
    }

    if (subject?.description || prompt.gender) {
        parts.push(extractBodyType(prompt));
    }

    if (prompt.pose_key && POSE_KEYWORDS[prompt.pose_key]) {
        parts.push(POSE_KEYWORDS[prompt.pose_key]);
    } else if (subject?.pose) {
        parts.push(extractPoseFallback(subject.pose));
    }

    const attire = subject?.attire;
    if (attire) {
        if (attire.top) parts.push(extractTop(attire.top, attire.top_style));
        if (attire.bottom) parts.push(extractBottom(attire.bottom, attire.bottom_style));

        let hasHosiery = false;
        if (attire.hosiery) {
            const hosieryText = extractHosiery(attire.hosiery, attire.hosiery_type, attire.hosiery_material);
            if (hosieryText && hosieryText !== "bare legs") {
                hasHosiery = true;
                parts.push(hosieryText);
            } else if (hosieryText === "bare legs") {
                parts.push("bare legs");
            }
        }

        if (attire.footwear) parts.push(extractFootwear(attire.footwear, attire.footwear_style, hasHosiery));
    }

    if (environment?.setting) {
        parts.push(extractScene(environment.setting, environment.scene_location));
    }
    if (environment?.lighting) {
        const cleanLighting = environment.lighting.replace(/candle(?:light)?/gi, "dim warm").replace(/flame/gi, "soft");
        parts.push(truncateAtWord(cleanLighting, 60));
    }

    if (subject?.hair) {
        parts.push(extractHair(subject.hair));
    }

    if (subject?.expression?.mood) {
        parts.push(extractExpression(subject.expression.mood));
    }

    const accessoriesStr = extractAccessories(subject?.accessories_raw, subject?.accessories);
    if (accessoriesStr) {
        parts.push(accessoriesStr);
    }

    const styleMode = prompt.style_mode || "studio_elegant";
    const qualitySuffix = QUALITY_SUFFIX_KEYWORDS[styleMode] || "photorealistic, sharp focus, skin texture";
    parts.push(qualitySuffix);

    let result = parts.filter(p => p && p.length > 0).join(", ");
    if (result.length > MAX_TURBO_PROMPT_LENGTH) {
        result = result.slice(0, MAX_TURBO_PROMPT_LENGTH - 3) + "...";
    }
    return result;
}


function extractBodyType(prompt: PromptJson): string {
    const keywords: string[] = [];
    const bodyTypeDesc = prompt.scene?.subject?.description?.toLowerCase() || "";
    const rawBodyType = prompt.scene?.subject?.body_type;
    const gender = prompt.gender || "female";
    const rawEthnicity = prompt.ethnicity;

    if (rawEthnicity && rawEthnicity !== "random" && ETHNICITY_KEYWORDS[rawEthnicity]) {
        keywords.push(ETHNICITY_KEYWORDS[rawEthnicity]);
    }

    if (rawBodyType) {
        if (gender === "agender") {
            if (AGENDER_BODY_TYPE_KEYWORDS[rawBodyType]) {
                keywords.push(AGENDER_BODY_TYPE_KEYWORDS[rawBodyType]);
            } else if (BODY_TYPE_KEYWORDS[rawBodyType]) {
                keywords.push(BODY_TYPE_KEYWORDS[rawBodyType]);
            } else if (MALE_BODY_TYPE_KEYWORDS[rawBodyType]) {
                keywords.push(MALE_BODY_TYPE_KEYWORDS[rawBodyType]);
            }
        } else if (gender === "male" && MALE_BODY_TYPE_KEYWORDS[rawBodyType]) {
            keywords.push(MALE_BODY_TYPE_KEYWORDS[rawBodyType]);
        } else if (BODY_TYPE_KEYWORDS[rawBodyType]) {
            keywords.push(BODY_TYPE_KEYWORDS[rawBodyType]);
        }
    }

    if (keywords.length === 0 || (keywords.length === 1 && rawEthnicity)) {
        if (gender === "male") {
            if (bodyTypeDesc.includes("lean")) keywords.push("lean build");
            if (bodyTypeDesc.includes("muscle") || bodyTypeDesc.includes("bulky")) keywords.push("muscular");
            if (bodyTypeDesc.includes("chubby")) keywords.push("chubby");
        } else {
            if (bodyTypeDesc.includes("pear")) keywords.push("pear shape");
            if (bodyTypeDesc.includes("petite")) keywords.push("petite");
            if (bodyTypeDesc.includes("full") || bodyTypeDesc.includes("voluptuous")) keywords.push("voluptuous");
            if (bodyTypeDesc.includes("model")) keywords.push("slim model");
            if (bodyTypeDesc.includes("hourglass")) keywords.push("hourglass figure");
            if (bodyTypeDesc.includes("flat-chested")) keywords.push("flat chest");
        }
    }

    if (gender === "agender") {
        keywords.push("androgynous person");
    } else if (gender === "male") {
        keywords.push("man");
    } else {
        keywords.push("woman");
    }

    return keywords.join(", ");
}

function extractPoseFallback(pose: string): string {
    const cleanPose = pose.replace(/^Selfie mode\.?\s*/i, "");
    const keywords: string[] = [];

    if (cleanPose.includes("floor")) keywords.push("on floor");
    if (cleanPose.includes("bed")) keywords.push("on bed");
    if (cleanPose.includes("all fours")) keywords.push("doggy position");
    if (cleanPose.includes("stomach") || cleanPose.includes("prone")) keywords.push("lying face down");
    if (cleanPose.includes("back arched")) keywords.push("back arched");
    if (cleanPose.includes("hips high") || cleanPose.includes("hips up")) keywords.push("hips raised");
    if (cleanPose.includes("kneeling")) keywords.push("kneeling");
    if (cleanPose.includes("spread")) keywords.push("legs spread");
    if (cleanPose.includes("mirror")) keywords.push("facing mirror");
    if (cleanPose.includes("phone")) keywords.push("holding phone");

    return keywords.length > 0 ? keywords.join(", ") : cleanPose.split(".")[0].split(",")[0].trim();
}

function extractTop(top: string, rawStyle?: string): string {
    if (rawStyle && TOP_KEYWORDS[rawStyle]) {
        return TOP_KEYWORDS[rawStyle];
    }

    const lower = top.toLowerCase();

    for (const [key, value] of Object.entries(TOP_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
            return value;
        }
    }

    if (lower.includes("no upper") || lower.includes("topless")) return "topless";
    if (lower.includes("bra") || lower.includes("undergarment")) return "in bra";
    if (lower.includes("swimsuit")) return "swimsuit";
    if (lower.includes("bikini")) return "bikini top";

    return top.split(",")[0].trim();
}

function extractBottom(bottom: string, rawStyle?: string): string {
    if (rawStyle && BOTTOM_KEYWORDS[rawStyle]) {
        return BOTTOM_KEYWORDS[rawStyle];
    }

    const lower = bottom.toLowerCase();

    for (const [key, value] of Object.entries(BOTTOM_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
            return value;
        }
    }

    if (lower.includes("no additional") || lower.includes("no bottom") || lower.includes("no panties")) return "no panties";
    if (lower.includes("panties") || lower.includes("underwear")) return "panties only";

    return bottom.split(",")[0].trim();
}

function extractHosiery(hosiery: string, rawType?: string, rawMaterial?: string): string {
    const lower = hosiery.toLowerCase();

    if ((lower.includes("bare") || lower.includes("no hosiery") || lower.includes("none")) && (!rawType || rawType === 'none')) {
        return "bare legs";
    }

    let type = "";
    if (rawType && HOSIERY_TYPE_KEYWORDS[rawType]) {
        type = HOSIERY_TYPE_KEYWORDS[rawType];
    }

    let finish = "";
    if (rawMaterial && HOSIERY_MATERIAL_KEYWORDS[rawMaterial]) {
        finish = HOSIERY_MATERIAL_KEYWORDS[rawMaterial];
    }

    const firstWord = hosiery.match(/^(\w+)/)?.[1] || "";
    const validColors = ["black", "white", "nude", "beige", "grey", "gray", "brown", "coffee", "skin", "dark", "light"];
    const color = validColors.includes(firstWord.toLowerCase()) ? firstWord : "";
    const denier = hosiery.match(/(\d+)D/)?.[1] || "";

    if (!type) {
        for (const [key, value] of Object.entries(HOSIERY_TYPE_KEYWORDS)) {
            if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
                type = value;
                break;
            }
        }
    }

    if (!finish) {
        for (const [key, value] of Object.entries(HOSIERY_MATERIAL_KEYWORDS)) {
            if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
                finish = value;
                break;
            }
        }
    }

    if (!type) return "";

    const result = [color, denier ? `${denier}D` : "", finish, type].filter(Boolean).join(" ");
    return result;
}

function extractFootwear(footwear: string, rawStyle?: string, hasHosiery: boolean = false): string {
    if (rawStyle && FOOTWEAR_KEYWORDS[rawStyle]) {
        if (hasHosiery && (FOOTWEAR_KEYWORDS[rawStyle] === "barefoot" || FOOTWEAR_KEYWORDS[rawStyle] === "no shoes")) {
            return "stockinged feet";
        }
        return FOOTWEAR_KEYWORDS[rawStyle];
    }

    const lower = footwear.toLowerCase();

    for (const [key, value] of Object.entries(FOOTWEAR_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
            if (hasHosiery && (value === "barefoot" || value === "no shoes")) {
                return "stockinged feet";
            }
            return value;
        }
    }

    if (lower.includes("no shoes") || lower.includes("barefoot")) return hasHosiery ? "stockinged feet" : "barefoot";
    if (lower.includes("heels")) return "high heels";
    if (lower.includes("sneakers")) return "sneakers";
    if (lower.includes("boots")) return "boots";

    return footwear.split(",")[0].trim();
}

function extractScene(setting: string, rawLocation?: string): string {
    if (rawLocation && SCENE_KEYWORDS[rawLocation]) {
        return SCENE_KEYWORDS[rawLocation];
    }

    const lower = setting.toLowerCase();

    for (const [key, value] of Object.entries(SCENE_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
            return value;
        }
    }

    return setting.split(".")[0].split(",")[0].trim();
}

function extractHair(hair: string): string {
    const color = hair.match(/^(\w+)/)?.[1] || "";
    const lower = hair.toLowerCase();

    let style = "";
    for (const [key, value] of Object.entries(HAIR_STYLE_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " "))) {
            style = value;
            break;
        }
    }

    if (!style) {
        if (lower.includes("curls") || lower.includes("curly")) style = "curly hair";
        else if (lower.includes("straight")) style = "straight hair";
        else if (lower.includes("wavy")) style = "wavy hair";
        else if (lower.includes("ponytail")) style = "ponytail";
        else if (lower.includes("bun")) style = "hair bun";
        else if (lower.includes("bob")) style = "bob haircut";
        else if (lower.includes("pixie")) style = "pixie cut";
        else if (lower.includes("long")) style = "long hair";
        else if (lower.includes("short")) style = "short hair";
        else style = "hair";
    }

    return color ? `${color} ${style}` : style;
}

function extractExpression(mood: string): string {
    const lower = mood.toLowerCase();

    for (const [key, value] of Object.entries(MOOD_KEYWORDS)) {
        if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
            return value;
        }
    }

    if (lower.includes("ahegao") || lower.includes("ecstasy")) return "ahegao face";
    if (lower.includes("tongue")) return "tongue out";
    if (lower.includes("teary") || lower.includes("crying") || lower.includes("tears")) return "teary expression";
    if (lower.includes("smile") || lower.includes("smiling")) return "smiling";
    if (lower.includes("shy")) return "shy expression";
    if (lower.includes("seductive") || lower.includes("sultry")) return "seductive look";
    if (lower.includes("playful")) return "playful expression";
    if (lower.includes("confident")) return "confident expression";

    return mood.split(",")[0].trim();
}

type AccessoriesInput = {
    hair_clip?: string;
    earrings?: string;
    glasses?: string;
    neck_body_accessories?: string;
} | undefined;

function extractAccessories(accessoriesRaw: AccessoriesInput, accessories: AccessoriesInput): string {
    const source = accessoriesRaw ?? accessories;
    if (!source) return "";

    const parts: string[] = [];

    const neckBody = source.neck_body_accessories;
    if (neckBody && neckBody !== "none" && NECK_BODY_ACCESSORIES_KEYWORDS[neckBody]) {
        const keyword = NECK_BODY_ACCESSORIES_KEYWORDS[neckBody];
        if (keyword) parts.push(keyword);
    }

    const hairClip = source.hair_clip;
    if (hairClip && hairClip !== "none" && HAIR_CLIP_KEYWORDS[hairClip]) {
        const keyword = HAIR_CLIP_KEYWORDS[hairClip];
        if (keyword) parts.push(keyword);
    }

    const earrings = source.earrings;
    if (earrings && earrings !== "none" && EARRING_KEYWORDS[earrings]) {
        const keyword = EARRING_KEYWORDS[earrings];
        if (keyword) parts.push(keyword);
    }

    const glasses = source.glasses;
    if (glasses && glasses !== "none" && GLASSES_KEYWORDS[glasses]) {
        const keyword = GLASSES_KEYWORDS[glasses];
        if (keyword) parts.push(keyword);
    }

    return parts.join(", ");
}

function truncateAtWord(text: string, maxLen: number): string {
    if (!text) return "";
    if (text.length <= maxLen) return text.trim();
    const truncated = text.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLen * 0.6) {
        return truncated.slice(0, lastSpace).trim();
    }
    return truncated.trim();
}