import { Choices } from "@lib/schema";
import type { SceneLocation, StyleMode } from "@lib/options";

export const LIGHTING_DESCRIPTIONS: Record<
  StyleMode,
  Partial<Record<Choices["lighting"], string>>
> = {
  studio_elegant: {
    soft_beauty: "Soft diffused glow, golden-hour warmth, gentle shadows, ethereal atmosphere",
    glam_high_key: "Bright airy fill, minimal shadows, creamy highlights, fresh uplifting mood",
    color_wash: "Subtle colored gels (rose gold/teal/amber), stylized shadows, natural skin tones"
  },
  mirror_selfie: {
    soft_beauty: "Warm ambient glow, soft overhead light, smooth skin texture, intimate vibe",
    glam_high_key: "Ring-light vanity glow, even fill, minimal shadows, clean fresh look",
    color_wash: "Neon/lamp tint (lavender/warm orange), cinematic depth, moody reflection"
  },
  mobile_front: {
    soft_beauty: "Natural window light, golden-hour glow, sparkling catchlights, radiant skin",
    glam_high_key: "Bright daylight fill, polished look, clean highlights, minimal shadows",
    color_wash: "City glow or screen tint, low contrast, smooth blended aesthetic"
  },
  pov_interaction: {
    soft_beauty: "Intimate low-key, candlelight warmth, soft eye-focused shadows, close proximity",
    glam_high_key: "Bright clear fill, fully visible face, inviting approachable feel",
    color_wash: "Dual-tone cinematic (warm key + cool rim), bar/evening street mood"
  },
  body_part_closeup: {
    soft_beauty: "Artistic grazing light, texture-defining shadows, contour emphasis",
    glam_high_key: "Clean bright studio fill, even illumination, professional polish",
    color_wash: "Hazy color wash, dreamlike texture, mood over clarity"
  },
  rough_street_snap: {
    soft_beauty: "Diffused daylight, building shadows, raw city texture, pleasant face light",
    color_wash: "Mixed streetlights and neon, gritty film-noir, cinematic color bleed"
  }
};

export const STYLE_MODE_MAP: Record<Choices["style_mode"], {
  style_mode: string;
  look: string;
  cameraLens: string;
  cameraSensor: string;
  environment: string;
  renderIntent: string;
  makeupStyle: string;
  complexion: string;
}> = {
  studio_elegant: {
    style_mode: "studio_photoreal_high_fidelity",
    look: "High-end portrait, precise lighting, realistic skin, refined styling",
    cameraLens: "85mm portrait lens, natural compression, controlled depth roll-off",
    cameraSensor: "Clean full-frame, pristine, noise-free, high dynamic range",
    environment: "Polished studio or on-location backdrop, professionally controlled lighting",
    renderIntent: "Premium photobook portrait, clean light, refined posture, coherent outfit",
    makeupStyle: "Strictly follow selected makeup style and intensity",
    complexion: "Satin photoreal, natural skin texture, respects makeup intensity, no smoothing"
  },
  mirror_selfie: {
    style_mode: "dormitory_mirror_selfie",
    look: "Full/half-body mirror selfie, view through reflection only, outfit priority",
    cameraLens: "Phone rear camera 24-35mm, natural distortion, slight tilt",
    cameraSensor: "Phone sensor, faint noise, soft bloom, no portrait-mode blur",
    environment: "Scene visible purely through mirror reflection",
    renderIntent: "Casual mirror selfie, body lines, outfit clarity, handheld imperfections",
    makeupStyle: "Follow selected style/intensity, self-done look, no beautification",
    complexion: "Natural phone complexion, visible pores, faint sheen, no smoothing"
  },
  mobile_front: {
    style_mode: "mobile_front_camera_accidental_snapshot",
    look: "Unposed front-camera, slight awkwardness, imperfect framing",
    cameraLens: "Front camera wide-angle, natural distortion, off-center",
    cameraSensor: "Phone sensor, luminance noise, no beauty filter, no blur",
    environment: "Spontaneous indoor/outdoor setting, uncomposed",
    renderIntent: "Raw selfie, handheld realism, imperfect crop, visible pores",
    makeupStyle: "Obey selected style/intensity, no AI retouching",
    complexion: "Uneven natural complexion, minor imperfections, no smoothing"
  },
  pov_interaction: {
    style_mode: "pov_interaction_first_person",
    look: "Extreme first-person proximity 10-40cm, eye-line pressure, close distortion",
    cameraLens: "35-50mm human-eye equivalent, first-person height, edge falloff",
    cameraSensor: "Handheld phone, motion blur edges, natural color, pore clarity",
    environment: "Viewer physically present, near surfaces, tactile closeness",
    renderIntent: "Immersive interaction, close eye contact, authentic skin, no polish",
    makeupStyle: "Strictly follow selected style/intensity, no smoothing",
    complexion: "Close-up complexion, visible pores, natural texture, no beautification"
  },
  body_part_closeup: {
    style_mode: "body_part_macro_focus",
    look: "Macro realism, body area fills 70-100% frame, form and texture focus",
    cameraLens: "70-120mm macro, close focus, perspective compression, no full-body",
    cameraSensor: "Phone sensor, micro-grain, zero beautification, texture retention",
    environment: "Soft background context, macro body detail dominates",
    renderIntent: "Macro surface detail, pores, fabric texture, skin transitions",
    makeupStyle: "Minimal/natural only if area normally has makeup",
    complexion: "Fully natural, visible pores, imperfections, zero retouching"
  },
  rough_street_snap: {
    style_mode: "rough_street_snap_candid",
    look: "Amateur phone snapshot, subject integrated into scene, spontaneous gritty",
    cameraLens: "Phone 26-50mm, f/11, hyperfocal sharp foreground-to-background",
    cameraSensor: "Small sensor, high ISO noise, flat focus, no portrait mode",
    environment: "Busy street surrounds subject, visible context, not blurred",
    renderIntent: "Documentary snapshot, flat image, subject part of scene, embrace awkwardness",
    makeupStyle: "Natural everyday, worn-in realistic, not fresh studio look",
    complexion: "Realistic skin under street lighting, no beautification"
  }
};

export const STYLE_MODE_MAP_MALE: Partial<typeof STYLE_MODE_MAP> = {
  mirror_selfie: {
    style_mode: "dormitory_mirror_selfie_male",
    look: "Full-body or half-body mirror selfie emphasizing a relaxed, cool fit check; loose casual posture with effortless attitude",
    cameraLens: "Handheld phone rear camera (~24–35mm equivalent) with natural distortion",
    cameraSensor: "Typical phone sensor response, slightly grainy but realistic",
    environment: "Any chosen scene interpreted through the mirror reflection, messy but aesthetic",
    renderIntent: "Casual boyfriend-vibe selfie, effortless and unposed",
    makeupStyle: "No makeup, natural grooming",
    complexion: "Natural male complexion with skin texture, slight stubble if applicable, no smoothing"
  },
  pov_interaction: {
    style_mode: "pov_interaction_boyfriend",
    look: "Intimate first-person perspective looking up at or level with the subject; focus on eyes and expression, creating a sense of closeness and affection",
    cameraLens: "Human-eye equivalent (~35–50mm) from a close partner's distance",
    cameraSensor: "Handheld realism, slight motion blur, warm and intimate",
    environment: "Scene adapts to chosen location but framed intimately, creating a private world",
    renderIntent: "Boyfriend POV, capturing a moment of connection; looking at the viewer with attention",
    makeupStyle: "No makeup, clean skin",
    complexion: "Realistic skin texture, visible pores, warm skin tone"
  },
  body_part_closeup: {
    style_mode: "body_part_macro_male",
    look: "Macro-distance focus on masculine details: structure, vascularity, and skin texture. Emphasizing defined lines and shadows.",
    cameraLens: "Short-telephoto macro (~85mm) isolating the detail",
    cameraSensor: "Sharp detail retention, highlighting skin texture and anatomical structure",
    environment: "Background blurred into abstraction, focus strictly on the body part",
    renderIntent: "Appreciation of male physical details captured with artistic lighting",
    makeupStyle: "No makeup",
    complexion: "High-fidelity skin texture, showing veins, tendons, and natural skin grain"
  }
};

export const SCENE_DESCRIPTION_MAP: Record<SceneLocation, string> = {
  dorm_room: "Dorm mirror, soft clutter, bedding, posters, standing mirror frame",
  bathroom: "Bathroom vanity mirror, tiled walls, toiletries, warm vanity light. Not public locker-room",
  changing_room: "Fitting-room mirror, neutral panels, enclosed booth, bench, soft downlight",
  elevator_reflection: "Elevator metal panel reflection, brushed surfaces, control buttons, cabin lighting",
  gym: "Gym mirror wall, equipment racks, rubber floor, clean reflective surface",
  hotel_suite: "Hotel full-body mirror, warm lamps, upholstered furniture, modern decor",
  photo_studio: "Editorial studio, seamless backdrop, C-stands, professional equipment",
  city_street: "Urban street, building facades, signage, traffic, reflective pavement",
  cafe: "Café interior, wooden tables, espresso bar, pendant lights, ambient clutter",
  luxury_apartment: "Luxury apartment, marble surfaces, clean furniture, large daylight windows",
  bedroom: "Private bedroom, rumpled bedding, bedside lamps, intimate ambient glow",
  sofa_lounge: "Living-room sofa corner, plush cushions, soft ambient light, furniture edges",
  hallway: "Narrow hallway, wall sconces, receding linear perspective, enclosed passage",
  elevator_cabin: "Compact elevator cabin, brushed metal walls, control buttons, tight enclosure",
  street_corner: "Urban street corner, city lights, building edges, passing cars, distant pedestrians",
  restaurant_booth: "Restaurant booth, cushioned seating, tableware, warm moody ambience",
  beach_sunset: "Golden-hour beach, low sun, warm orange light, ocean waves, breeze in hair",
  crosswalk: "Urban crosswalk, white lines, waiting cars, pedestrian signals, street energy",
  convenience_store: "Convenience store aisle, bright cool overhead strips, colorful shelves",
  subway_platform: "Subway platform, tiled walls, safety lines, gritty artificial lighting",
  night_market: "Night market, neon signs, food stall steam, crowded colorful background",
  car_backseat: "Camera positioned in front of vehicle facing toward backseat. Subject seated in car backseat, seats and door panel visible in frame, window showing exterior scenery"
};

export const MOBILE_FRONT_SCENE_DESCRIPTION_MAP: Partial<Record<SceneLocation, string>> = {
  dorm_room:
    "Cozy dorm room interior showing bed, desk, and scattered study items directly behind the subject; walls and surfaces appear matte with no visible mirror plane.",
  bathroom:
    "Compact private bathroom with tiled walls, sink, and warm overhead lighting; fixtures and walls stay visible but no mirror surface faces the camera.",
  changing_room:
    "Retail changing room with neutral partition panels, a small bench, and hanging hooks surrounding the subject; walls read as plain matte surfaces without any mirror panels.",
  elevator_reflection:
    "Compact elevator cabin with brushed metal walls, control buttons, and indicator lights enclosing the subject; the shot never reveals an actual mirror panel.",
  gym:
    "Fitness studio interior with equipment racks, rubber flooring, and overhead lights directly behind the subject; no mirror wall is visible to the camera.",
  hotel_suite:
    "Upscale hotel suite with warm lamps, upholstered furniture, and curtains forming the background; walls, doors, and wardrobe fronts show no mirrored panels in frame."
  ,
  beach_sunset:
    "Sunset beach background with glowing horizon, ocean waves, and warm light wrapping the subject’s face; wind-tossed hair and relaxed posture read naturally in front-camera perspective.",
  car_backseat:
    "Camera angled from front passenger area looking back at subject in the backseat. Backseat interior with seats and door panel visible, window showing scenery outside, natural light from windows framing the subject."
};