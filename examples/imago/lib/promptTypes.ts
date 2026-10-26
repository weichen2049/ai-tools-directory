export type PromptJson = {
  pose_key?: string;
  style_mode?: string;
  gender?: string;
  ethnicity?: string; // Raw ethnicity choice for Z-Image
  look?: string;
  camera?: {
    vantage?: string;
    framing?: string;
    lens_behavior?: string;
    sensor_quality?: string;
    aspect_ratio?: string;
    aspect_ratio_note?: string;
    phone_hold?: string;
  };
  scene?: {
    environment?: {
      setting?: string;
      lighting?: string;
      scene_location?: string; // Raw scene choices
    };
    subject?: {
      description?: string;
      body_type?: string; // Raw body type choice
      hair?: string;
      expression?: {
        mood?: string;
        action?: string;
      };
      makeup?: {
        style?: string;
        complexion?: string;
        cheeks?: string;
        lips?: string;
      };
      attire?: {
        top?: string;
        bottom?: string;
        hosiery?: string;
        footwear?: string;
        details?: string;
        top_style?: string;
        bottom_style?: string;
        hosiery_type?: string;
        hosiery_material?: string;
        footwear_style?: string;
      };
      pose?: string;
      leg_pose?: string;
      attire_notes?: string;
      accessories?: {
        hair_clip?: string;
        earrings?: string;
        glasses?: string;
        neck_body_accessories?: string;
      };
      accessories_raw?: {
        hair_clip?: string;
        earrings?: string;
        glasses?: string;
        neck_body_accessories?: string;
      };
      hand_notes?: string;
    };
  };
  aesthetic_controls?: {
    material_fidelity?: string[];
    color_grade?: {
      overall?: string;
      contrast?: string;
    };
  };
  negative_prompt?: {
    forbidden_elements?: string[];
    forbidden_style?: string[];
  };
  custom_base_prompt?: string;
  custom_detail_segments?: string[];
};