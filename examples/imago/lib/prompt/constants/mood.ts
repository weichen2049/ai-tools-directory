import { Choices } from "@lib/schema";

export type MoodDescriptor = {
  mood: string;
  action: string;
};

export const MOOD_MAP: Record<Choices["mood"], MoodDescriptor> = {
  playful_tongue: {
    mood: "Playful confidence with a hint of flirt",
    action: "Look straight into the camera, lips parted, tip of tongue touching the lower lip"
  },
  confident_smile: {
    mood: "Bright confidence and approachable warmth",
    action: "Hold eye contact with a gentle open-lip smile"
  },
  sultry_gaze: {
    mood: "Magnetic calm with composed elegance",
    action: "Maintain a steady gaze, lips relaxed with a slight head tilt"
  },
  ahegao: {
    mood: "Face flushed with mouth open in exaggerated expression",
    action: "Undo inhibitions with tongue extended, cheeks flushed, and both eyes rolled upward so only slivers of iris remain, exposing the whites"
  },
  pitiful_gaze: {
    mood: "Soft, slightly teary look with downward angled brows",
    action:
      "Tilt the head sideways, let the eyes glisten, keep the lips in a tiny pout, and raise the inner brows just enough to look like a cute plea for attention"
  },
  tearful_cry: {
    mood: "Genuinely teary expression with visible wetness on cheeks",
    action:
      "Angle the phone close to the face, let real tears streak down the cheeks, redden the nose slightly, keep the mouth quivering open, and allow the gaze to meet the lens or drop naturally depending on mood"
  }
};

export const MOBILE_FRONT_MOOD_OVERRIDES: Partial<Record<Choices["mood"], MoodDescriptor>> = {
  playful_tongue: {
    mood: "Sleepy goofiness from a rushed selfie",
    action: "Head tilts slightly, tongue peeks out lazily, eyes drift past the phone instead of locking onto it"
  },
  confident_smile: {
    mood: "Soft everyday smile with zero posing",
    action: "Give a small relaxed grin with lips barely parted; the gaze may meet the camera directly without posing"
  },
  sultry_gaze: {
    mood: "Half-awake stare with heavy lids",
    action: "Let the eyelids droop, mouth relaxed, showing a lazy focus that can settle on the lens or drift away naturally"
  },
  ahegao: {
    mood: "Playfully exaggerated face made on impulse",
    action:
      "Twist the mouth open, tongue out, eyes rolling sharply upward so almost only the whites show, like goofing off without caring about the camera"
  },
  pitiful_gaze: {
    mood: "Soft, slightly teary look that feels more like playful whining than true sadness",
    action:
      "Tilt the head sideways, let the eyes glisten, keep the lips in a tiny pout, and raise the inner brows just enough to look like a cute plea for attention"
  },
  tearful_cry: {
    mood: "Genuinely teary expression, as if the selfie was taken mid-cry",
    action:
      "Angle the phone close to the face, let real tears streak down the cheeks, redden the nose slightly, keep the mouth quivering open, and allow the gaze to meet the lens or drop naturally depending on mood"
  }
};