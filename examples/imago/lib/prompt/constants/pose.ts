import { Choices } from "@lib/schema";

export type PoseDescriptor = {
  camera: {
    vantage: string;
    framing: string;
    lens_behavior?: string;
  };
  poseLine: string;
  legFocus?: string;
  excludeLegsInIntent?: boolean;
  phonePoseLine?: string;
};

export type BodyPartFocusSpec = {
  focusArea: string;
  cropNote: string;
  textureNote: string;
  visibleTop?: boolean;
  visibleBottom?: boolean;
  visibleHosiery?: boolean;
  visibleFootwear?: boolean;
};

export const POSE_MAP: Record<Choices["pose"], PoseDescriptor> = {
  studio_runway_cross: {
    camera: {
      vantage: "Slight low-angle studio view at mid-thigh height, looking upward along the body",
      framing: "Full-length composition with the legs forming the main vertical axis"
    },
    poseLine:
      "Stand with one leg clearly crossed in front of the other, weight on the back leg, hips angled slightly, shoulders square to the camera",
    legFocus:
      "The front leg forms a clean diagonal line across the frame, visually separating from the supporting leg to emphasize length and shape"
  },
  studio_stool_legup: {
    camera: {
      vantage: "Mid-height camera with a gentle top-down angle to shape torso and legs",
      framing: "Three-quarter composition focusing on thighs and torso lines"
    },
    poseLine: "Sit on a tall stool with one leg lifted across the other, torso leaning back slightly",
    legFocus: "Raised leg stays closer to the lens, highlighting layered lines and proportions"
  },
  studio_floor_reach: {
    camera: {
      vantage: "Low, reclined camera peeking upward from the floor behind the subject",
      framing: "Close composition that flows from the anchored arms through the torso, with legs suggested rather than dominating the frame"
    },
    poseLine: "Lean back on the hands with elbows softly bent, chest lifted, and legs relaxed in the background without forcing them toward the lens",
    legFocus: "Angle prioritizes torso lines and overall mood; legs may fall slightly out of frame or stay softly blurred"
  },
  dorm_mirror_forward: {
    camera: {
      vantage: "Handheld phone held at chest level toward the full mirror",
      framing: "Full-length mirror composition with legs reaching the bottom edge; both subject and reflected background remain equally sharp"
    },
    poseLine:
      "Stand in front of the mirror, step one leg forward while the other supports, torso angled toward the lens. The subject's own nearer hand holds the phone; its reflection is the only hand visible gripping the device.",
    legFocus: "The forward leg becomes the closest vertical line in the mirror, slightly angled toward the lens to exaggerate length and posture"
  },
  dorm_bed_relax: {
    camera: {
      vantage: "Self-held phone at eye level capturing a relaxed seated posture and leg length",
      framing: "Seated half-body plus legs with furnishings or surroundings as backdrop; keep the entire reflection in equal focus"
    },
    poseLine:
      "Sit on the nearest stable surface—edge of a seat, bench, or platform—extend both legs to one side, and lean toward the lens casually. Raise the subject's own hand to hold the phone so the reflection shows only that same hand grasping it.",
    legFocus: "Legs drape along the supporting surface, emphasizing smooth symmetrical shape"
  },
  dorm_floor_kneel: {
    camera: {
      vantage: "Low selfie angle close to the floor, parallel to the legs",
      framing: "Half-body frame including legs, highlighting knee lines"
    },
    poseLine:
      "Kneel on the rug with knees about hip-width apart and shins flat on the floor, letting the hips settle toward the heels. Keep the torso upright with a gentle lean toward the mirror, the free hand resting lightly on the front thigh. Lift the nearer hand with the phone so only that hand appears gripping the device in the reflection.",
    legFocus: "Parallel shins and relaxed thighs highlighting hosiery sheen"
  },
  mobile_side_lie: {
    camera: {
      vantage: "True front-camera selfie: the lens IS the viewer. Camera is held by the subject at arm’s length; never third-person, never mirror.",
      framing: "Close selfie crop from head to mid-torso; distance always reads as arm’s-length."
    },
    poseLine:
      "Lie on your side and stretch the phone arm above your face so the camera sits just outside the frame. The wrist and forearm can enter the shot, but the phone body stays hidden. Keep the angle unmistakably first-person—no mirror, no distant photographer.",
    legFocus: "Legs only peek into frame if composition allows; keep them soft"
  },
  mobile_bed_prone: {
    camera: {
      vantage: "Front-camera selfie held by the subject while lying prone; the lens sits just above eye level and rides along with the subject as if the viewer were the phone.",
      framing: "Upper-body selfie crop capturing face, shoulders, and the arched back from a close, arm’s-length distance."
    },
    poseLine:
      "Lie on your stomach on the bed, elbows propping up the upper body so the torso lifts slightly. Bend both knees so the feet kick upward behind you, ankles crossing. Hold the phone just outside the frame with one hand while facing the camera directly with a playful, relaxed expression. The pose must still read as a genuine front-camera selfie—no mirror or third-person angle.",
    legFocus: "Raised calves and feet act as playful accents in the background, while the arched back and lifted chest remain the focal lines."
  },
  mobile_sitting: {
    camera: {
      vantage: "True front-camera selfie held by the subject at arm’s length; viewer is the phone lens.",
      framing: "Head-and-torso selfie framing only; cannot pull back into a third-person view."
    },
    poseLine:
      "Sit casually while holding the phone just outside the frame at arm's length. Let the phone-side forearm or shoulder edge peek in to prove the selfie viewpoint while the device itself stays hidden. Never allow a mirror or third-person view.",
    legFocus: "Legs appear softly if the lap is included; otherwise focus on torso"
  },
  mobile_hand_on_cheek: {
    camera: {
      vantage: "Front-camera selfie at arm’s-length; the viewer is the phone lens.",
      framing: "Tight face-dominant selfie crop; no distant background perspective."
    },
    poseLine:
      "Hold the phone in one hand (device just outside the frame) while the free hand touches the cheek. Keep a sliver of the phone-side wrist or forearm visible so the selfie perspective is obvious, but never show the phone body.",
    legFocus: "Legs generally excluded"
  },
  mobile_side_profile: {
    camera: {
      vantage: "Front-camera selfie held beside the face; lens always at arm’s-length.",
      framing: "Profile/three-quarter crop from shoulders up, still always reading as a selfie."
    },
    poseLine:
      "Hold the phone near temple height, letting the wrist edge enter the frame while the device stays invisible. Turn into profile but maintain the arm’s-length selfie distance—never let it read as a photographer’s side shot.",
    legFocus: "Not emphasized"
  },
  pov_hand_hold: {
    camera: {
      vantage:
        "First-person, viewer’s eye level looking slightly downward toward interlocked hands at chest height",
      framing:
        "Half-body framing where the joined hands sit in the lower third of the frame and the subject’s upper body fills the center"
    },
    poseLine:
      "The subject stands just ahead of the viewer, reaching back to gently take the viewer’s hand at mid-chest height. The clasped hands anchor the bottom of the frame while the subject turns the shoulders slightly and looks back toward the lens.",
    excludeLegsInIntent: true
  },
  pov_overhead_hover: {
    camera: {
      vantage:
        "First-person, viewer lying on their back; camera at eye height looking upward toward the subject leaning over",
      framing:
        "Tight upper-body framing from below, showing the subject’s face and shoulders bending into the frame from above"
    },
    poseLine:
      "The subject plants hands or elbows near the viewer’s head (out of frame) and leans in so the face hangs over the lens, shoulders framing the upper edge while the gaze drops directly into the camera.",
    excludeLegsInIntent: true
  },
  pov_sit_beside: {
    camera: {
      vantage:
        "First-person, viewer seated; camera at viewer’s eye height angled 20–30° toward the subject seated at arm’s length to one side",
      framing:
        "Half-body diagonal framing where the subject’s torso occupies the near side of the frame, with partial background visible behind"
    },
    poseLine:
      "The subject sits close at the viewer’s side on the same surface, turning the torso inward and leaning slightly into the shared space, head tilted toward the lens as if speaking in a low voice.",
    excludeLegsInIntent: true
  },
  pov_reach_to_camera: {
    camera: {
      vantage:
        "First-person, viewer’s eye level with the subject positioned one step away and reaching toward the lens",
      framing:
        "Upper-body close framing where the reaching hand enters from the lower edge and stops just before the lens, slightly out of focus"
    },
    poseLine:
      "The subject stands within arm’s reach and extends one hand straight toward the camera as if to adjust or touch it, fingers relaxed, while the face remains sharp just behind the hand and the eyes lock onto the viewer.",
    excludeLegsInIntent: true
  },
  pov_bed_twist: {
    camera: {
      vantage:
        "Low three-quarter angle near knee height, lens positioned just behind the subject’s near hip and angled upward toward the face",
      framing:
        "Tight three-quarter crop where the lower edge falls beneath the hips and the upper edge grazes the head; near hip centered, face placed on the upper-right third"
    },
    poseLine:
      "The subject kneels on the floor or soft surface with both knees apart, hips sinking toward the heels so the near hip becomes the visual anchor. The torso twists back toward the lens, letting the lower back arch and the glute line stay closest to the camera while one shoulder rotates forward. Chin turns over the shoulder with a confident, playful gaze. The nearer hand plants lightly on the ground beside the knee for balance while the far arm drapes across the lower back, showcasing the hip curve before the lens climbs toward the face.",
    excludeLegsInIntent: false
  },
  pov_kneel_lookup: {
    camera: {
      vantage:
        "First-person perspective with the viewer standing and the camera clearly above the subject’s eye line, angled downward 30–45° so the viewer is unmistakably looking down at the kneeling subject",
      framing:
        "Face and upper body dominate the lower half of the frame, with the top of the head clearly below center. Knees and thighs appear nearer the upper edge only as context."
    },
    poseLine:
      "The subject kneels with hips resting on the heels and spine mostly upright. Chin tilts back and face turns upward toward the higher camera so the pupils look clearly up from beneath the brows. Shoulders draw slightly inward and hands rest loosely on the thighs or beside the knees—never lifted toward the camera.",
    legFocus:
      "Knees and thighs appear only near the upper edge of the frame as secondary context to prove the kneeling posture, while the upward-tilted face and raised eye line remain the dominant focal point.",
    excludeLegsInIntent: false
  },
  peace_sign: {
    camera: {
      vantage: "Eye-level portrait view that keeps the torso and face in frame",
      framing: "Mid-to-upper body framing that clearly captures the hand gesture"
    },
    poseLine: "Stand or sit casually, raise one hand to show a relaxed peace sign near the face while the other hand rests naturally.",
    phonePoseLine: "Hold the phone securely in one hand for the selfie or mirror view while the free hand forms a relaxed peace sign near the face."
  },
  closeup_legs: {
    camera: {
      vantage:
        "Macro vantage positioned 15–30 cm from the thighs, aligned along the leg axis to exaggerate length and intimacy through proximity.",
      framing:
        "Tight crop from upper thighs to mid-calves; legs fill 70–95% of the frame. No torso, no feet, no head, yet the visible hosiery must read as one continuous pantyhose layer with no interruptions—the fabric should visually imply that it extends upward beyond the frame toward the waist."
    },
    poseLine:
      "Extend both legs softly or bend one knee slightly to create a natural curve. Visual interest comes from shape, hosiery sheen, and closeness—not explicit spreading.",
    legFocus:
      "Highlight hosiery tension, fabric sheen, calf taper, and thigh curvature with high-resolution texture. Aesthetic appeal is created through macro detail and shape, not explicit posing."
  },
  closeup_feet: {
    camera: {
      vantage:
        "Floor-level macro vantage 10–20 cm from the arches, angled upward through the toes and instep to create intimate proximity without explicit framing.",
      framing:
        "Ultra-tight crop from lower calves to toe tips; feet fill most of the frame with no legs or torso visible."
    },
    poseLine:
      "Point or relax the toes naturally, allowing one foot to shift slightly forward for depth. Visual focus comes from arch curvature, toe alignment, and fabric or skin texture—not explicit gestures.",
    legFocus:
      "Reveals hosiery toe reinforcement, pedicure polish, sole contour, and light pressure shaping the arch from close distance."
  },
  closeup_glutes: {
    camera: {
      vantage:
        "Macro vantage placed 10–25 cm behind the hips, angled slightly downward to follow the lower-back-to-glute curve with intimate proximity.",
      framing:
        "Crop from mid-lower-back to upper thighs. Glutes occupy 70–90% of the frame. No face, no torso, no legs beyond upper thigh."
    },
    poseLine:
      "Maintain a soft natural arch—not exaggerated—letting one hip shift subtly toward the lens to create implied movement through asymmetry. Hands remain off-frame or cropped if present.",
    legFocus:
      "Focus on curve transitions, fabric stretch, hosiery density changes, and subtle tension. Appeal arises from closeness and shape—never explicit action."
  },
  closeup_waist: {
    camera: {
      vantage:
        "Macro vantage at waist height, 15–25 cm behind the subject, perpendicular to the lower back so the camera always views the waistline from the rear.",
      framing:
        "Crop from just below the shoulder blades to mid-hip, showing only the back of the waist; abdomen and navel must never enter the frame."
    },
    poseLine:
      "Present the back toward the camera, letting the lower back and waist lean slightly toward the lens to form a subtle, natural inward arch. Hands may touch belt loops or the back waistband only if cropped low and kept non-explicit.",
    legFocus:
      "Emphasizes waist taper and lower-back curve from behind, fabric tension at the rear waistband, and any hosiery waistband transitions visible along the back."
  },
  closeup_abdomen: {
    camera: {
      vantage:
        "Macro vantage positioned 10–20 cm in front of the stomach, angled shallowly across the abdomen so the camera always views the torso from the front, never from the back or side.",
      framing:
        "Crop from lower ribs to the upper pelvis, captured strictly from the front; the navel sits centered or near center, and the lower back or spine must never appear."
    },
    poseLine:
      "Face the camera with the torso, allowing the abdomen to stretch gently toward the lens in a soft horizontal curve. A hand can rest near the waist only if cropped low and non-explicit, without reaching behind the back.",
    legFocus:
      "Focus on front-side skin gradients, tiny surface textures, waistbands, jewelry, and natural abdominal shape seen only from the front."
  },
  closeup_back: {
    camera: {
      vantage:
        "Macro vantage directly behind the subject at mid-back height, 15–25 cm from the skin, capturing shoulder blade depth and spine line.",
      framing:
        "Crop from nape to the small of the back; head, shoulders, and arms remain off-frame or cropped at edges."
    },
    poseLine:
      "Roll shoulders back softly, allowing the spine to create a gentle S-curve. Hair must be swept aside so the back remains fully exposed (clothed or unclothed as outfit defines).",
    legFocus:
      "Highlights back contours, garment drape, strap geometry, zipper lines, or translucent fabric texture.",
    excludeLegsInIntent: true
  },
  closeup_neck: {
    camera: {
      vantage:
        "Macro lens positioned 10–15 cm from the collarbone, angled slightly upward to elongate the neck and emphasize its sculptural form.",
      framing:
        "Crop includes only neck, nape, collarbones, and top of shoulders. Chin and jawline must never appear."
    },
    poseLine:
      "Tilt the head gently forward or sideways to reveal neck slope and collarbone shadow. Hair swept aside enhances the clear view of the neck without explicit action.",
    legFocus:
      "Focuses on necklace tension, clavicle prominence, soft skin gradients, and natural warmth of the neck area.",
    excludeLegsInIntent: true
  },
  closeup_chest: {
    camera: {
      vantage:
        "Chest-level macro vantage 10–20 cm from the sternum, perpendicular to avoid distortion.",
      framing:
        "Crop from collarbones to the upper bust. No chin, no shoulders, no cleavage beyond the natural garment boundary."
    },
    poseLine:
      "Lift shoulders slightly back to create a gentle V-shape along the collarbones. Hands remain off-frame and must not influence the garment in an explicit way.",
    legFocus:
      "Spotlights neckline structure, lace detail, camisole fabric, and skin texture with soft fine detail.",
    excludeLegsInIntent: true
  },
  closeup_arms: {
    camera: {
      vantage:
        "Macro vantage angled across the arms at 15–30 cm distance, emphasizing forearm and bicep contour.",
      framing:
        "Crop from shoulder caps to just below elbows or wrists. No torso centerline, no head."
    },
    poseLine:
      "Let arms cross or bend softly, creating intersecting diagonal lines and subtle muscle tension. Hands may appear only partially if cropped and non-explicit.",
    legFocus:
      "Highlights glove seams, sleeve wrinkles, bracelet stacks, and natural arm curvature.",
    excludeLegsInIntent: true
  },
  closeup_hands: {
    camera: {
      vantage:
        "Macro lens focused 10–15 cm from the hands at torso level, capturing micro-gestures and tactile interactions.",
      framing:
        "Crop isolates hands and wrists only; no elbows, no torso centerline, no chest."
    },
    poseLine:
      "Let fingers graze fabric, adjust hosiery, trace a waistband, or rest lightly on skin—always subtle, never explicit or forceful. Fingers must stay relaxed with soft curvature.",
    legFocus:
      "Emphasizes manicure detail, ring reflections, skin texture, and fabric tension where hands interact.",
    excludeLegsInIntent: true
  },
  walking_lookback: {
    camera: {
      vantage: "Mid-distance street view, slightly behind the subject, capturing them as they walk away.",
      framing: "Full-body or three-quarter shot, capturing the movement and the turn of the head."
    },
    poseLine: "Caught mid-stride walking away, turning head back slightly. Hair might be moving with the breeze. Expression is neutral or reactive, not a posed smile. Body is in natural motion.",
    legFocus: "Legs in mid-stride, showing natural walking movement."
  },
  checking_phone: {
    camera: {
      vantage: "Eye-level or slightly high angle, observing the subject from a few meters away.",
      framing: "Three-quarter or full-body shot, focusing on the subject's absorption in their device."
    },
    poseLine: "Standing naturally, head bowed slightly, looking down at a phone held in one or both hands. Shoulders relaxed. Completely unaware of the camera, immersed in the screen.",
    legFocus: "Relaxed standing posture, weight shifted to one leg."
  },
  fixing_hair: {
    camera: {
      vantage: "Eye-level candid shot, capturing a spontaneous grooming moment.",
      framing: "Upper-body or three-quarter shot, highlighting the arm movement and the face."
    },
    poseLine: "Caught in the middle of adjusting hair or tucking it behind ear. A natural, functional gesture rather than a stylized pose. Face is visible but not projected at the camera.",
    legFocus: "Natural standing stance."
  },
  waiting_lean: {
    camera: {
      vantage: "Mid-distance observational view, capturing the subject waiting in a public space.",
      framing: "Full-body shot showing the subject interacting with the environment (leaning)."
    },
    poseLine: "Leaning casually against a wall, railing, or lamppost. Looking around or lost in thought. Arms crossed or hanging loosely. A relaxed, everyday waiting stance.",
    legFocus: "Legs crossed at the ankles or one leg bent, resting against the support."
  },
  holding_drink: {
    camera: {
      vantage: "Front or three-quarter view, capturing the subject walking or standing with a beverage.",
      framing: "Three-quarter or full-body shot."
    },
    poseLine: "Walking or standing while holding a drink cup. Maybe looking for keys or checking a watch. The drink is just there, not a prop. Focus is elsewhere. Casual, everyday body language.",
    legFocus: "Natural walking or standing posture."
  },
  kitten_lookback: {
    camera: {
      vantage: "Rear view, slightly elevated angle. Wide enough to show hand placement.",
      framing: "Full-body shot, ensuring both hands and knees are clearly visible on the ground."
    },
    poseLine: "On all fours, crawling position. **Both palms planted firmly on the floor** to support the upper body weight. Arms are straight and locked. Back arched downwards, hips lifted high. Head turned back over the shoulder looking at camera.",
    phonePoseLine: "Selfie mode. One hand planted firmly on the floor supporting weight. The other hand extended back holding the phone. Back arched, hips high.",
    legFocus: "Knees hip-width apart on the ground. Arms vertical and visible."
  },
  m_squat: {
    camera: {
      vantage: "Front view, slightly low angle.",
      framing: "Full-body shot capturing the entire width of the pose."
    },
    poseLine: "Wide-stance deep squat, legs spread far apart exposing the inner thighs. The posture resembles an 'M' shape with knees pushed far outward to the sides. Feet are positioned wide and flat. Upper body leans back, supported by both hands placed on the floor behind the buttocks.",
    phonePoseLine: "Wide-stance deep squat, legs spread far apart. Knees pushed outward. One hand holding a smartphone for a selfie, the other hand supporting the body weight on the floor behind. Leaning back slightly.",
    legFocus: "Maximum leg spread, open pelvis, knees pointing sideways, distinct gap between thighs."
  },
  tie_adjust: {
    camera: {
      vantage: "Eye-level or slightly low angle, enhancing authority and elegance.",
      framing: "Upper-body or mid-shot ensuring the hand action on the tie is the focal point."
    },
    poseLine: "One hand lifted to adjust the necktie knot or loosen the collar. Head tilted slightly down or to the side, with a focused or contemplative expression. Shoulders relaxed but posture straight.",
    legFocus: "Standing straight with weight evenly distributed."
  },
  wall_lean: {
    camera: {
      vantage: "Slightly low angle to emphasize height and dominance, or POV eye-level.",
      framing: "Full-body or three-quarter shot, showing the interaction with the wall."
    },
    poseLine: "Leaning back or sideways against a wall with one shoulder. One hand might be in a pocket or resting on the wall. One leg bent at the knee, foot resting against the wall behind. Radiating cool confidence.",
    legFocus: "One leg straight, the other bent with foot touching the wall, creating a relaxed, triangular shape."
  },
  shirt_pull: {
    camera: {
      vantage: "Eye-level or slightly lower, focusing on the torso.",
      framing: "Mid-shot or three-quarter shot, cropping to emphasize the torso and hand action."
    },
    poseLine: "Lifting the hem of the shirt with one hand, or biting the shirt hem, revealing the abs/midriff. A suggestive, teasing gesture. The gaze is directed at the camera, playful or intense.",
    legFocus: "Natural standing stance."
  }
};

export const BODY_PART_FOCUS_MAP: Partial<Record<Choices["pose"], BodyPartFocusSpec>> = {
  closeup_legs: {
    focusArea: "Upper thighs through calves occupy the whole frame",
    cropNote:
      "Begin at the upper thighs and extend down to mid-calves; hips are only implied while the face never appears. Even within this tight crop the pantyhose must look continuous—no thigh-high bands, no bare gaps, no suggestion of separate stockings. The fabric should appear to keep traveling upward beyond the visible area, hinting that it connects to the waist outside the frame.",
    textureNote:
      "Honor the selected hosiery type exactly—pantyhose must read as one continuous layer without bare thigh gaps; thigh-high or garter styles should only expose skin where that product naturally ends. Never default to thigh-high bands when pantyhose are chosen.",
    visibleBottom: true,
    visibleHosiery: true,
    visibleFootwear: true
  },
  closeup_feet: {
    focusArea: "Feet, ankles, and arches fill the shot",
    cropNote: "Start just above the ankles and finish at the toes; no knees, thighs, or torso allowed.",
    textureNote: "Showcase pedicure polish, hosiery toe seams, and footwear craftsmanship with tactile realism.",
    visibleHosiery: true,
    visibleFootwear: true
  },
  closeup_glutes: {
    focusArea: "Lower back tapering into the glutes and upper thighs",
    cropNote: "Span from lumbar dimples to the top of the thighs; never let the spine rise above mid-back.",
    textureNote: "Accentuate fabric tension, lace trim, or sheer stocking bands wrapping the hips.",
    visibleBottom: true,
    visibleHosiery: true
  },
  closeup_waist: {
    focusArea: "Cinched waistline, belt, or high-rise hosiery viewed strictly from the back",
    cropNote:
      "Capture from just below the shoulder blades to mid-hip, always from the rear; keep arms and face out of frame, and never show the abdomen or navel.",
    textureNote: "Highlight back-of-waist seams, corsetry boning, or rear waistband transitions as the main subject.",
    visibleTop: true,
    visibleBottom: true,
    visibleHosiery: true
  },
  closeup_abdomen: {
    focusArea: "Abdominal plane from lower ribs to pelvis viewed strictly from the front",
    cropNote:
      "Keep the navel centered and stop before the bust or thighs enter frame; only the front abdomen is visible, never the lower back or spine.",
    textureNote: "Reveal front-abdomen definition, jewelry draping, or sheer fabric layering over the stomach.",
    visibleTop: true,
    visibleBottom: true,
    visibleHosiery: true
  },
  closeup_back: {
    focusArea: "Nape through the small of the back",
    cropNote: "Frame shoulder blades down to the waist while leaving hair and face outside.",
    textureNote: "Emphasize backless garments, strap geometry, or zipper hardware tracing the spine.",
    visibleTop: true,
    visibleBottom: true
  },
  closeup_neck: {
    focusArea: "Neckline and collarbones only",
    cropNote: "Stop below the chin and above the bust so only the neck and top of shoulders remain.",
    textureNote: "Capture necklace layering, clavicle shadow, and skin luminosity without revealing facial features.",
    visibleTop: true
  },
  closeup_chest: {
    focusArea: "Collarbones and upper bust structure",
    cropNote: "Confine the crop between shoulders and the top of the bust while excluding the chin.",
    textureNote: "Showcase lingerie materials, lace edges, and contouring light across the sternum.",
    visibleTop: true
  },
  closeup_arms: {
    focusArea: "Arms, sleeves, and glove details",
    cropNote: "Keep the frame around shoulders to wrists with no torso centerline or head visible.",
    textureNote: "Stress sleeve tailoring, glove seams, and muscle tone across the forearms.",
    visibleTop: true
  },
  closeup_hands: {
    focusArea: "Hands, nails, and jewelry interactions",
    cropNote: "Frame only wrists and fingers hovering near fabric; elbows and torso stay out.",
    textureNote: "Magnify manicures, rings, bracelets, or glove texture as the storytelling element.",
    visibleTop: true
  }
};

export const POSE_MAP_MALE: Partial<Record<Choices["pose"], Partial<PoseDescriptor>>> = {
  closeup_legs: {
    poseLine:
      "Extend both legs with natural tension, emphasizing quad definition and angular muscle lines. Visual strength comes from structure and proximity—not curves.",
    legFocus:
      "Highlight quad contour, calf definition, and visible vascularity with tactile realism. Masculinity is conveyed through angular lines and muscle texture."
  },
  closeup_chest: {
    poseLine:
      "Square the shoulders back to broaden the chest, letting pectoral definition and sternum structure become the focal point. Hands remain off-frame.",
    legFocus:
      "Spotlights pectoral muscle separation, sternum shadows, and masculine chest structure with clear definition."
  },
  closeup_abdomen: {
    poseLine:
      "Face the camera with the torso, allowing the abdominal muscles to show natural definition. Core tension reveals subtle v-lines and oblique shadows.",
    legFocus:
      "Focus on abdominal definition, v-line shadows, and masculine core structure. Emphasize natural muscle texture over smooth skin."
  },
  closeup_back: {
    poseLine:
      "Roll shoulders back to engage the lats and reveal back muscle definition. The spine creates a central valley between muscle groups.",
    legFocus:
      "Highlights lat spread, trapezius shape, and the muscular valley along the spine. Emphasize masculine back architecture."
  },
  closeup_arms: {
    poseLine:
      "Let arms flex naturally or cross with visible muscle engagement, creating defined bicep and forearm contours. Veins may be subtly visible.",
    legFocus:
      "Highlights bicep peak, forearm vascularity, and masculine arm definition with natural lighting."
  },
  closeup_hands: {
    poseLine:
      "Let fingers rest naturally with visible knuckle structure and vein patterns. Hands should appear strong but relaxed—never delicate.",
    legFocus:
      "Emphasizes knuckle definition, vein visibility, and masculine hand structure. Focus on strength and texture."
  },
  pov_bed_twist: {
    poseLine:
      "Kneel on the surface with weight on one hip, torso twisting back toward the lens. The back muscles and shoulder blade become the visual anchor as the body rotates. One arm supports the twist while the other drapes naturally, showcasing the lat and oblique before the gaze meets the camera.",
    legFocus:
      "Leg position creates a stable base while the twist emphasizes back muscle definition and masculine waist-to-shoulder ratio."
  },
  closeup_glutes: {
    poseLine:
      "Maintain a natural stance with subtle hip shift, letting glute muscle definition show through fabric or skin. Emphasis on athletic shape rather than curves.",
    legFocus:
      "Focus on glute muscle definition, hamstring tie-in, and athletic masculine shape. Structure over softness."
  }
};

export const BODY_PART_FOCUS_MAP_MALE: Partial<Record<Choices["pose"], Partial<BodyPartFocusSpec>>> = {
  closeup_legs: {
    focusArea: "Quads through calves with masculine definition",
    textureNote:
      "Honor visible muscle striations, natural leg hair texture, and angular contours. Emphasize athletic definition over smoothness."
  },
  closeup_chest: {
    focusArea: "Pectorals and upper chest structure",
    textureNote: "Showcase pectoral separation, chest hair if present, and masculine chest architecture with tactile realism."
  },
  closeup_abdomen: {
    focusArea: "Abdominal muscles and v-line from lower ribs to pelvis",
    textureNote: "Reveal ab definition, oblique shadows, and masculine core musculature. Embrace natural texture."
  },
  closeup_back: {
    focusArea: "Lats and trapezius through the small of the back",
    textureNote: "Emphasize back muscle definition, spine valley, and masculine shoulder width tapering to waist."
  },
  closeup_arms: {
    focusArea: "Biceps, triceps, and forearm definition",
    textureNote: "Stress muscle definition, vein visibility, and masculine arm structure with natural lighting."
  },
  closeup_hands: {
    focusArea: "Masculine hands with visible structure",
    textureNote: "Magnify knuckle prominence, vein patterns, and strong masculine hand architecture."
  },
  closeup_glutes: {
    focusArea: "Glute muscles and hamstring tie-in",
    textureNote: "Accentuate athletic glute definition and masculine muscle shape rather than soft curves."
  }
};