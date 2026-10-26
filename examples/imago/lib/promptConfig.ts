export const INTENTION_BY_STYLE: Record<string, string> = {
    studio_photoreal_high_fidelity:
        "High-end editorial photography, professional lighting, composition, crisp detail, intentional framing, styling, hosiery showcase.",
    dormitory_mirror_selfie:
        "Casual mirror selfie, rear camera, intentional but relaxed composition, full outfit, pose in reflection, authentic, everyday, natural lighting, clear detail.",
    mobile_front_camera_accidental_snapshot:
        "Ordinary iPhone selfie, slightly blurry, awkwardly framed, dimly lit snapshot, quick capture, unposed, messy composition, uneven lighting, minor motion blur, unintentional, mundane, raw, unedited, spontaneous technical failure.",
    pov_interaction_first_person:
        "First-person interaction, viewer's eyes as lens, subject invades personal space, hovering near gaze, unwavering eye contact, tactile immediacy, no visible walls."
};

export const DEFAULT_INTENTION =
    "Maintain a coherent, style-aware composition that respects the selected pose, wardrobe, and camera notes.";

export type StyleFallback = {
    vantage: string;
    framing: string;
    pose: string;
    subjectAction: string;
    setting: string;
    hair: string;
    makeup: string;
    attireNote: string;
    focus: string;
    lighting: string;
    forbiddenElements: string;
    forbiddenStyles: string;
};

export const STYLE_FALLBACKS: Record<string, StyleFallback> = {
    studio_photoreal_high_fidelity: {
        vantage: "Eye-level portrait vantage, gentle lens compression, flattering proportions",
        framing: "Three-quarter to full-length portrait framing, deliberate negative space control",
        pose: "Confident upright posture, relaxed shoulders, graceful hands",
        subjectAction: "Composed expression, precise eye contact, subtle intentional emotion",
        setting: "Polished studio or stylized location, purposeful set dressing, controlled lighting",
        hair: "Immaculately groomed hair, clean flyaways, refined silhouette",
        makeup:
            "Balanced editorial makeup, controlled highlight and contour, soft blush, refined lip color",
        attireNote: "Wardrobe as hero element, crisp tailoring, coordinated fabrics",
        focus:
            "Focus & Fidelity: Razor-sharp detail across skin, hair, and textiles, zero motion blur, zero noise.",
        lighting:
            "Lighting & Color: Controlled key/fill ratios, clean highlights, neutral-to-warm grade, honors fabric color.",
        forbiddenElements:
            "text watermarks, logo overlays, visible tripods, selfies, crude doodles, cropped limbs, harsh on-camera flash shadows",
        forbiddenStyles:
            "snapshots, blurry handheld phone shots, amateur webcam imagery, comic/anime renderings, over-processed HDR, surreal glitch filters"
    },
    dormitory_mirror_selfie: {
        vantage: "Handheld phone slightly above eye level, pointed squarely into mirror",
        framing: "Full-body reflection contained within mirror frame, hands and phone natural",
        pose: "Stand casually, one leg relaxed, shoulders open, phone held in nearer hand",
        subjectAction: "Laid-back facial expression, easy eye contact toward reflection",
        setting: "Dorm or apartment mirror zone, believable clutter, posters, furnishings",
        hair: "Soft natural hair, casual flyaways, authentic",
        makeup: "Everyday makeup, light foundation, subtle blush, natural tinted lip balm",
        attireNote: "Daily wear wardrobe, slight wrinkles, comfort-driven layering",
        focus:
            "Focus & Fidelity: Crisp reflection from head to toe, no computational blur, no portrait-mode depth tricks.",
        lighting:
            "Lighting & Color: Ambient indoor lighting, balanced exposure inside reflection, mild falloff outside mirror area.",
        forbiddenElements:
            "text watermarks, logo overlays, second photographer in frame, editing UI, extreme vignette, neon cyberpunk grading, virtual backgrounds",
        forbiddenStyles:
            "studio strobes, cinematic anamorphic flares, 3D renders, anime illustration, glitch art, vaporwave palettes"
    },
    mobile_front_camera_accidental_snapshot: {
        vantage: "High-angle, directly overhead POV shot",
        framing:
            "Accidental, EXTREME CLOSE-UP, frame haphazardly filled by face, head, upper shoulders only. Strictly exclude hands, arms, lower body, wider room view.",
        pose:
            "Lying absolutely flat on back, completely still, relaxed on pillow, looking directly up into camera, natural unposed posture.",
        subjectAction:
            "Look straight into camera, lips parted, tip of tongue touching lower lip, playful confidence, hint of flirt, glancing non-chalantly toward lens, acknowledging camera without posing.",
        setting:
            "Cluttered or indistinct indoor background, messy, uncomposed setting, captured by chance, uneven mundane lighting.",
        hair: "Natural hair characteristics, candid facial features.",
        makeup:
            "No makeup or extremely minimal, smudged, uneven makeup. Complexion unfiltered and raw, visible pores, faint blemishes, mildly uneven skin tone, no smoothing.",
        attireNote: "Wardrobe appears naturally without emphasis or styling.",
        focus:
            "Focus & Fidelity: Soft focus, slight motion blur, visible digital noise, compression artifacts, textures indistinct or washed out in highlights.",
        lighting:
            "Lighting & Color: Uneven lighting, overexposed areas, flat shadows, natural uncalibrated phone camera colour, variable contrast, slight white balance shifts.",
        forbiddenElements:
            "text watermarks, logo overlays, phone in hand, obvious hand or arm holding device, visible hands or arms, clear focus on face, intentional composition, flattering angle, well-lit face, smooth skin, aesthetic appeal, professional quality, perfect lighting, sharp image, clean background, excessive makeup (eyeshadow, false lashes, bold lipstick, glittery highlighter)",
        forbiddenStyles:
            "crisp focus, even exposure, balanced composition, high dynamic range, professional portraiture, stylized photography, artistic photography, cinematic film grain, flawless plastic skin, overly polished look, studio lighting setup, commercial advertising quality, anime rendering, illustrated style, CG render look"
    },
    pov_interaction_first_person: {
        vantage: "Viewer-height first-person vantage, subject invading personal space",
        framing: "Half-body framing, subject close, nearby surfaces visible",
        pose: "Subject leans toward viewer, angled shoulders, tactile proximity cues",
        subjectAction: "Intent eye contact, breathing naturally, arm's length of viewer",
        setting: "Environment wraps tightly around viewer, chairs, walls, or bedding inches away",
        hair: "Natural movement, slight displacement from close interaction",
        makeup: "Breathable realistic makeup, slight glow suited for intimate distance",
        attireNote: "Wardrobe emphasizes drape and contact with viewer's personal space",
        focus:
            "Focus & Fidelity: Entire first-person plane sharp, face and nearby surfaces share equal clarity, no depth isolation.",
        lighting:
            "Lighting & Color: Natural ambient light, gentle contrast, believable skin tone, nearby surface color.",
        forbiddenElements:
            "text watermarks, logo overlays, visible second camera, selfie sticks, fisheye distortion, floating disembodied limbs, VR controller renderings",
        forbiddenStyles:
            "studio glamour shots, overhead drone views, anime POV illustration, hyper-stylized neon palettes, surreal glitch filters"
    },
    default: {
        vantage: "Balanced portrait vantage, centered on subject, mid-eye level",
        framing: "Well-composed frame, subject comfortably within view",
        pose: "Relaxed posture, appropriate to style, avoid stiffness",
        subjectAction: "Natural expression, aligned with mood, intentional eye direction",
        setting: "Coherent lighting, believable context, reinforces style choice",
        hair: "True to intended style, tidy overall silhouette",
        makeup: "Balanced finish, visible skin realism, aligned with style",
        attireNote: "Wardrobe supports character, does not overpower concept",
        focus:
            "Focus & Fidelity: Clear subject detail, controlled depth-of-field, matches style, no distracting blur or noise.",
        lighting:
            "Lighting & Color: Consistent with scene, balanced exposure, accurate color, no heavy filters.",
        forbiddenElements:
            "text watermarks, logo overlays, harsh flash hotspots, lens dirt, stock-photo watermarks, obvious editing glitches",
        forbiddenStyles:
            "low-effort snapshots, over-processed HDR, cartoon/anime rendering, vaporwave gradients, surreal collage effects"
    }
};

export const HOSIERY_COLOR_TERMS = ["black", "gray", "white", "brown", "random color"];
export const GENERIC_FORBIDDEN = new Set(["text watermarks", "logo overlays"]);