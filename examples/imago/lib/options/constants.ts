export const STYLE_MODE = ["studio_elegant", "mirror_selfie", "mobile_front", "pov_interaction", "body_part_closeup", "rough_street_snap"] as const;
export const LIGHTING = ["soft_beauty", "glam_high_key", "color_wash"] as const;
export const MOOD = ["playful_tongue", "confident_smile", "sultry_gaze", "ahegao", "pitiful_gaze", "tearful_cry"] as const;
export const GENDER = ["female", "male", "agender"] as const;
export const ETHNICITY = [
    "east_asian",
    "south_asian",
    "southeast_asian",
    "white_caucasian",
    "black_african",
    "hispanic_latino",
    "middle_eastern",
    "mixed",
    "random"
] as const;
export const HAIR_STYLE = [
    "natural_dark_waves",
    "straight_long_hair",
    "loose_soft_curls",
    "chin_length_bob",
    "casual_ponytail",
    "twin_ponytails",
    "short_textured_crop",
    "undercut_fade",
    "messy_bedhead",
    "slicked_back",
    "side_part_classic",
    "androgynous_pixie"
] as const;
export const HAIR_COLOR = [
    "black",
    "brown",
    "white",
    "gray",
    "pink",
    "green",
    "blue",
    "red",
    "purple",
    "blonde",
    "orange",
    "random"
] as const;
export const TOP_STYLE = [
    "casual_tee",
    "soft_blouse",
    "knit_sweater",
    "cozy_sweater",
    "fitted_wool_top",
    "sleek_camisole",
    "mesh_top",
    "one_piece_swimsuit",
    "jk_uniform",
    "one_piece_dress",
    "high_slit_cheongsam",
    "mens_suit",
    "womens_suit",
    "silk_nightgown",
    "blazer_no_underlay",
    "button_down_shirt",
    "hoodie",
    "tank_top",
    "oversized_sweater",
    "v_neck_tee",
    "henley_shirt",
    "bath_towel",
    "none"
] as const;
export const BOTTOM_STYLE = [
    "mini_skirt",
    "midi_skirt",
    "body_conscious_maxi_skirt",
    "tailored_trousers",
    "yoga_leggings",
    "denim_jeans",
    "casual_shorts",
    "swim_trunks",
    "none",
    "cargo_pants",
    "chino_pants",
    "athletic_shorts",
    "wide_leg_pants",
    "pleated_trousers",
    "sweatpants",
    "bath_towel"
] as const;
export const HOSIERY_TYPE = ["pantyhose", "garter", "thigh_high", "knee_high", "calf_sock", "ankle_sock", "fishnet"] as const;
export const HOSIERY_COLOR = ["black", "gray", "white", "brown", "random"] as const;
export const HOSIERY_MATERIAL = ["velvet", "core_spun", "glossy", "woolen", "fishnet_large", "fishnet_small", "cotton", "knit"] as const;
export const HOSIERY_SILK_TYPES: readonly (typeof HOSIERY_TYPE[number])[] = ["pantyhose", "garter", "thigh_high", "fishnet"] as const;
export const HOSIERY_SOCK_TYPES: readonly (typeof HOSIERY_TYPE[number])[] = ["knee_high", "calf_sock", "ankle_sock"] as const;
export const HOSIERY_DENIERS = [0, 10, 20, 40, 80, 120];

export const FOOTWEAR_STYLE = [
    "patent_heels",
    "platform_boots",
    "sleek_mules",
    "casual_sneakers",
    "tall_boots",
    "birken_sandals",
    "foam_clogs",
    "home_slippers",
    "uniform_loafers",
    "low_cut_flats",
    "barefoot",
    "high_top_sneakers",
    "leather_boots",
    "canvas_sneakers",
    "slip_on_sneakers",
    "dress_shoes"
] as const;
export const HAIR_CLIP = ["none", "matte_claw_clip", "simple_barrette", "soft_headband"] as const;
export const EARRINGS = ["none", "minimal_studs", "delicate_drops", "clean_hoops"] as const;
export const NECK_BODY_ACCESSORIES = ["none", "choker", "body_chain"] as const;
export const GLASSES_STYLE = ["none", "metal_rimless", "semi_rimless", "gold_wire_frame", "full_frame", "aviator_sunglasses", "cat_eye_sunglasses"] as const;
export const MAKEUP_STYLE = ["natural", "sweet", "mature", "sultry"] as const;
export const MAKEUP_INTENSITY = ["light", "medium", "intense"] as const;
export const FEMALE_BODY_TYPE = ["pear", "petite", "full", "voluptuous", "model", "hourglass"] as const;
export const MALE_BODY_TYPE = ["lean", "toned", "muscle_bulky", "beefy", "chubby"] as const;

export const SCENE_LOCATION = [
    "dorm_room",
    "bathroom",
    "changing_room",
    "elevator_reflection",
    "gym",
    "hotel_suite",
    "photo_studio",
    "city_street",
    "cafe",
    "luxury_apartment",
    "bedroom",
    "sofa_lounge",
    "hallway",
    "elevator_cabin",
    "street_corner",
    "restaurant_booth",
    "beach_sunset",
    "crosswalk",
    "convenience_store",
    "subway_platform",
    "night_market",
    "car_backseat"
] as const;

export const POSE = [
    "studio_runway_cross",
    "studio_stool_legup",
    "studio_floor_reach",
    "dorm_mirror_forward",
    "dorm_bed_relax",
    "dorm_floor_kneel",
    "mobile_side_lie",
    "mobile_bed_prone",
    "mobile_sitting",
    "mobile_hand_on_cheek",
    "mobile_side_profile",
    "peace_sign",
    "pov_hand_hold",
    "pov_overhead_hover",
    "pov_sit_beside",
    "pov_reach_to_camera",
    "pov_bed_twist",
    "pov_kneel_lookup",
    "closeup_legs",
    "closeup_feet",
    "closeup_glutes",
    "closeup_waist",
    "closeup_abdomen",
    "closeup_back",
    "closeup_neck",
    "closeup_chest",
    "closeup_arms",
    "closeup_hands",
    "walking_lookback",
    "checking_phone",
    "fixing_hair",
    "waiting_lean",
    "holding_drink",
    "kitten_lookback",
    "m_squat",
    "tie_adjust",
    "wall_lean",
    "shirt_pull"
] as const;

export const ASPECT_RATIO = ["1:1", "4:3", "3:4", "16:9", "9:16"] as const;
export const BEACH_SCENE_FORBIDDEN_POSES = ["dorm_bed_relax", "dorm_floor_kneel", "mobile_bed_prone", "pov_bed_twist"] as const;

export type SceneLocation = typeof SCENE_LOCATION[number];
export type StyleMode = typeof STYLE_MODE[number];

export function isSilkHosiery(type: typeof HOSIERY_TYPE[number]): boolean {
    return HOSIERY_SILK_TYPES.includes(type);
}