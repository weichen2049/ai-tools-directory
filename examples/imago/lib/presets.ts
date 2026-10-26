import type { Choices } from "./schema";

export type PresetId = "casual" | "elegant" | "intimate";

export interface PresetImage {
    src: string;
    
    position: string;
}

export interface StylePreset {
    id: PresetId;
    labelZh: string;
    labelEn: string;
    images: {
        female: PresetImage;
        male: PresetImage;
        agender: PresetImage;
    };
    
    choices: {
        female: Partial<Choices>;
        male: Partial<Choices>;
        agender: Partial<Choices>;
    };
}

export const STYLE_PRESETS_LIST: StylePreset[] = [
    {
        id: "casual",
        labelZh: "日常",
        labelEn: "CASUAL",
        images: {
            female: { src: "/preset_casual.png", position: "center" },
            male: { src: "/preset_casual_male.png", position: "center 25%" },
            agender: { src: "/preset_casual_agender.png", position: "center 25%" }
        },
        choices: {
            female: {
                style_mode: "mirror_selfie",
                scene_location: "dorm_room",
                pose: "dorm_mirror_forward",
                mood: "confident_smile",
                hair_style: "natural_dark_waves",
                hair_color: "black",
                top_style: "casual_tee",
                bottom_style: "casual_shorts",
                hosiery_type: "ankle_sock",
                hosiery_color: "white",
                hosiery_material: "cotton",
                hosiery_denier: 0,
                bare_leg: false,
                footwear_style: "casual_sneakers",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "minimal_studs",
                glasses_style: "none",
                body_type: "model",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            },
            male: {
                style_mode: "mirror_selfie",
                scene_location: "dorm_room",
                pose: "dorm_mirror_forward",
                mood: "confident_smile",
                hair_style: "short_textured_crop",
                hair_color: "black",
                top_style: "casual_tee",
                bottom_style: "casual_shorts",
                bare_leg: true,
                footwear_style: "casual_sneakers",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: true,
                hair_clip: "none",
                earrings: "none",
                glasses_style: "none",
                body_type: "toned",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            },
            agender: {
                style_mode: "mirror_selfie",
                scene_location: "dorm_room",
                pose: "dorm_mirror_forward",
                mood: "confident_smile",
                hair_style: "androgynous_pixie",
                hair_color: "black",
                top_style: "casual_tee",
                bottom_style: "casual_shorts",
                bare_leg: true,
                footwear_style: "casual_sneakers",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "minimal_studs",
                glasses_style: "none",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            }
        }
    },
    {
        id: "elegant",
        labelZh: "精致",
        labelEn: "ELEGANT",
        images: {
            female: { src: "/preset_elegant.png", position: "top" },
            male: { src: "/preset_elegant_male.png", position: "top" },
            agender: { src: "/preset_elegant_agender.png", position: "top" }
        },
        choices: {
            female: {
                style_mode: "studio_elegant",
                scene_location: "photo_studio",
                pose: "studio_runway_cross",
                mood: "sultry_gaze",
                hair_style: "straight_long_hair",
                hair_color: "black",
                top_style: "womens_suit",
                bottom_style: "none",
                hosiery_type: "pantyhose",
                hosiery_color: "black",
                hosiery_material: "glossy",
                hosiery_denier: 20,
                bare_leg: false,
                footwear_style: "patent_heels",
                makeup_style: "mature",
                makeup_intensity: "intense",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "delicate_drops",
                glasses_style: "none",
                body_type: "model",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "glam_high_key"
            },
            male: {
                style_mode: "studio_elegant",
                scene_location: "photo_studio",
                pose: "studio_stool_legup",
                mood: "sultry_gaze",
                hair_style: "slicked_back",
                hair_color: "black",
                top_style: "mens_suit",
                bottom_style: "none",
                bare_leg: true,
                footwear_style: "dress_shoes",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: true,
                hair_clip: "none",
                earrings: "none",
                glasses_style: "none",
                body_type: "toned",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "glam_high_key"
            },
            agender: {
                style_mode: "studio_elegant",
                scene_location: "photo_studio",
                pose: "studio_runway_cross",
                mood: "sultry_gaze",
                hair_style: "chin_length_bob",
                hair_color: "black",
                top_style: "blazer_no_underlay",
                bottom_style: "tailored_trousers",
                bare_leg: true,
                footwear_style: "sleek_mules",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "clean_hoops",
                glasses_style: "none",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "glam_high_key"
            }
        }
    },
    {
        id: "intimate",
        labelZh: "私密",
        labelEn: "INTIMATE",
        images: {
            female: { src: "/preset_intimate.png", position: "center 30%" },
            male: { src: "/preset_intimate_male.png", position: "center 30%" },
            agender: { src: "/preset_intimate_agender.png", position: "center 30%" }
        },
        choices: {
            female: {
                style_mode: "pov_interaction",
                scene_location: "bedroom",
                pose: "pov_bed_twist",
                mood: "sultry_gaze",
                hair_style: "loose_soft_curls",
                hair_color: "black",
                top_style: "silk_nightgown",
                bottom_style: "none",
                hosiery_type: "pantyhose",
                hosiery_color: "black",
                hosiery_material: "glossy",
                hosiery_denier: 40,
                bare_leg: false,
                footwear_style: "barefoot",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "none",
                glasses_style: "none",
                body_type: "model",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            },
            male: {
                style_mode: "pov_interaction",
                scene_location: "bedroom",
                pose: "pov_reach_to_camera",
                mood: "sultry_gaze",
                hair_style: "messy_bedhead",
                hair_color: "black",
                top_style: "none",
                bottom_style: "bath_towel",
                bare_leg: true,
                footwear_style: "barefoot",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: true,
                hair_clip: "none",
                earrings: "none",
                glasses_style: "none",
                body_type: "toned",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            },
            agender: {
                style_mode: "pov_interaction",
                scene_location: "bedroom",
                pose: "pov_reach_to_camera",
                mood: "sultry_gaze",
                hair_style: "loose_soft_curls",
                hair_color: "black",
                top_style: "silk_nightgown",
                bottom_style: "none",
                bare_leg: true,
                footwear_style: "barefoot",
                makeup_style: "natural",
                makeup_intensity: "light",
                bare_makeup: false,
                hair_clip: "none",
                earrings: "none",
                glasses_style: "none",
                ethnicity: "east_asian",
                aspect_ratio: "3:4",
                lighting: "soft_beauty"
            }
        }
    }
];