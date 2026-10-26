import {
    STYLE_MODE,
    MOOD,
    HAIR_STYLE,
    TOP_STYLE,
    BOTTOM_STYLE,
    FOOTWEAR_STYLE,
    HAIR_CLIP,
    EARRINGS,
    NECK_BODY_ACCESSORIES,
    MAKEUP_STYLE,
    MAKEUP_INTENSITY,
    POSE,
    type SceneLocation,
    type StyleMode
} from "./constants";

const MIRROR_AND_FRONT_SCENES: SceneLocation[] = [
    "dorm_room",
    "bathroom",
    "changing_room",
    "elevator_reflection",
    "gym",
    "hotel_suite",
    "bedroom"
];
const MOBILE_FRONT_SCENES: SceneLocation[] = [...MIRROR_AND_FRONT_SCENES, "beach_sunset", "car_backseat"];
const STUDIO_SCENES: SceneLocation[] = ["photo_studio", "city_street", "cafe", "luxury_apartment", "beach_sunset"];
const POV_SCENES: SceneLocation[] = ["bedroom", "sofa_lounge", "hallway", "elevator_cabin", "street_corner", "restaurant_booth", "beach_sunset", "car_backseat"];
const BODY_PART_SCENES: SceneLocation[] = ["photo_studio", "luxury_apartment", "bedroom", "sofa_lounge"];
const STREET_SNAP_SCENES: SceneLocation[] = ["street_corner", "crosswalk", "convenience_store", "subway_platform", "night_market"];

const ALL_MOOD = [...MOOD] as typeof MOOD[number][];
const ALL_HAIR_STYLE = [...HAIR_STYLE] as typeof HAIR_STYLE[number][];
const ALL_TOP_STYLE = [...TOP_STYLE] as typeof TOP_STYLE[number][];
const ALL_BOTTOM_STYLE = [...BOTTOM_STYLE] as typeof BOTTOM_STYLE[number][];
const ALL_FOOTWEAR = [...FOOTWEAR_STYLE] as typeof FOOTWEAR_STYLE[number][];
const ALL_HAIR_CLIP = [...HAIR_CLIP] as typeof HAIR_CLIP[number][];
const ALL_EARRINGS = [...EARRINGS] as typeof EARRINGS[number][];
const ALL_NECK_BODY_ACCESSORIES = [...NECK_BODY_ACCESSORIES] as typeof NECK_BODY_ACCESSORIES[number][];
const ALL_MAKEUP_STYLE = [...MAKEUP_STYLE] as typeof MAKEUP_STYLE[number][];
const ALL_MAKEUP_INTENSITY = [...MAKEUP_INTENSITY] as typeof MAKEUP_INTENSITY[number][];

export const STYLE_PRESETS: Record<StyleMode, {
    mood: typeof MOOD[number][];
    hair_style: typeof HAIR_STYLE[number][];
    top_style: typeof TOP_STYLE[number][];
    bottom_style: typeof BOTTOM_STYLE[number][];
    footwear_style: typeof FOOTWEAR_STYLE[number][];
    hair_clip: typeof HAIR_CLIP[number][];
    earrings: typeof EARRINGS[number][];
    neck_body_accessories: typeof NECK_BODY_ACCESSORIES[number][];
    makeup_style: typeof MAKEUP_STYLE[number][];
    makeup_intensity: typeof MAKEUP_INTENSITY[number][];
    pose: typeof POSE[number][];
    scene_location: SceneLocation[];
}> = {
    studio_elegant: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: ["studio_runway_cross", "studio_stool_legup", "studio_floor_reach", "peace_sign", "kitten_lookback", "m_squat"],
        scene_location: STUDIO_SCENES
    },
    mirror_selfie: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: ["dorm_mirror_forward", "dorm_bed_relax", "dorm_floor_kneel", "peace_sign", "kitten_lookback", "m_squat"],
        scene_location: MIRROR_AND_FRONT_SCENES
    },
    mobile_front: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: ["mobile_side_lie", "mobile_bed_prone", "mobile_sitting", "mobile_hand_on_cheek", "mobile_side_profile", "peace_sign", "kitten_lookback", "m_squat"],
        scene_location: MOBILE_FRONT_SCENES
    },
    pov_interaction: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: ["pov_hand_hold", "pov_overhead_hover", "pov_sit_beside", "pov_reach_to_camera", "pov_bed_twist", "pov_kneel_lookup", "kitten_lookback", "m_squat"],
        scene_location: POV_SCENES
    },
    body_part_closeup: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: [
            "closeup_legs",
            "closeup_feet",
            "closeup_glutes",
            "closeup_waist",
            "closeup_abdomen",
            "closeup_back",
            "closeup_neck",
            "closeup_chest",
            "closeup_arms",
            "closeup_hands"
        ],
        scene_location: BODY_PART_SCENES
    },
    rough_street_snap: {
        mood: ALL_MOOD,
        hair_style: ALL_HAIR_STYLE,
        top_style: ALL_TOP_STYLE,
        bottom_style: ALL_BOTTOM_STYLE,
        footwear_style: ALL_FOOTWEAR,
        hair_clip: ALL_HAIR_CLIP,
        earrings: ALL_EARRINGS,
        neck_body_accessories: ALL_NECK_BODY_ACCESSORIES,
        makeup_style: ALL_MAKEUP_STYLE,
        makeup_intensity: ALL_MAKEUP_INTENSITY,
        pose: ["walking_lookback", "checking_phone", "fixing_hair", "waiting_lean", "holding_drink", "kitten_lookback", "m_squat"],
        scene_location: STREET_SNAP_SCENES
    }
};

export const POSE_LOWER_BODY_VISIBILITY: Record<typeof POSE[number], boolean> = {
    studio_runway_cross: true,
    studio_stool_legup: true,
    studio_floor_reach: true,
    dorm_mirror_forward: true,
    dorm_bed_relax: true,
    dorm_floor_kneel: true,
    mobile_side_lie: false,
    mobile_bed_prone: true,
    mobile_sitting: false,
    mobile_hand_on_cheek: false,
    mobile_side_profile: false,
    peace_sign: true,
    pov_hand_hold: false,
    pov_overhead_hover: false,
    pov_sit_beside: false,
    pov_reach_to_camera: false,
    pov_bed_twist: true,
    pov_kneel_lookup: false,
    closeup_legs: true,
    closeup_feet: true,
    closeup_glutes: true,
    closeup_waist: true,
    closeup_abdomen: true,
    closeup_back: true,
    closeup_neck: false,
    closeup_chest: false,
    closeup_arms: false,
    closeup_hands: false,
    walking_lookback: true,
    checking_phone: true,
    fixing_hair: true,
    waiting_lean: true,
    holding_drink: true,
    kitten_lookback: true,
    m_squat: true,
    tie_adjust: true,
    wall_lean: true,
    shirt_pull: true
};

export type BodyPartControlVisibility = {
    hair: boolean;
    top: boolean;
    bottom: boolean;
    hosiery: boolean;
    footwear: boolean;
    accessories: boolean;
    makeup: boolean;
};

export const BODY_PART_CONTROL_VISIBILITY: Partial<Record<typeof POSE[number], BodyPartControlVisibility>> = {
    closeup_legs: {
        hair: false,
        top: false,
        bottom: true,
        hosiery: true,
        footwear: true,
        accessories: false,
        makeup: false
    },
    closeup_feet: {
        hair: false,
        top: false,
        bottom: false,
        hosiery: true,
        footwear: true,
        accessories: false,
        makeup: false
    },
    closeup_glutes: {
        hair: false,
        top: false,
        bottom: true,
        hosiery: true,
        footwear: false,
        accessories: false,
        makeup: false
    },
    closeup_waist: {
        hair: false,
        top: true,
        bottom: true,
        hosiery: true,
        footwear: false,
        accessories: true,
        makeup: false
    },
    closeup_abdomen: {
        hair: false,
        top: true,
        bottom: true,
        hosiery: true,
        footwear: false,
        accessories: true,
        makeup: false
    },
    closeup_back: {
        hair: true,
        top: true,
        bottom: true,
        hosiery: false,
        footwear: false,
        accessories: true,
        makeup: false
    },
    closeup_neck: {
        hair: true,
        top: true,
        bottom: false,
        hosiery: false,
        footwear: false,
        accessories: true,
        makeup: false
    },
    closeup_chest: {
        hair: true,
        top: true,
        bottom: false,
        hosiery: false,
        footwear: false,
        accessories: true,
        makeup: false
    },
    closeup_arms: {
        hair: false,
        top: true,
        bottom: false,
        hosiery: false,
        footwear: false,
        accessories: false,
        makeup: false
    },
    closeup_hands: {
        hair: false,
        top: true,
        bottom: true,
        hosiery: false,
        footwear: false,
        accessories: false,
        makeup: false
    }
};

export const TOP_STYLE_HAS_BOTTOM: Record<typeof TOP_STYLE[number], boolean> = {
    casual_tee: false,
    soft_blouse: false,
    knit_sweater: false,
    cozy_sweater: false,
    fitted_wool_top: false,
    sleek_camisole: false,
    mesh_top: false,
    one_piece_swimsuit: true,
    jk_uniform: true,
    one_piece_dress: true,
    high_slit_cheongsam: true,
    mens_suit: true,
    womens_suit: true,
    silk_nightgown: true,
    blazer_no_underlay: false,
    button_down_shirt: false,
    hoodie: false,
    tank_top: false,
    oversized_sweater: false,
    v_neck_tee: false,
    henley_shirt: false,
    bath_towel: false,
    none: false
};