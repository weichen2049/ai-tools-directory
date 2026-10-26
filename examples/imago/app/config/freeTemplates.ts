export type FreeTemplate = {
  id: string;
  name: string;
  name_en?: string;
  prompts: {
    none: string;
    one: string;
    two: string;
  };
  hint?: string;
  hint_en?: string;
  image: string;
  limitImages?: number;
  requiredImages?: number;
};

const TEMPLATE_IMAGE_BASE = (() => {
  const base = process.env.NEXT_PUBLIC_TEMPLATE_CDN_BASE?.trim();
  if (!base) return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
})();

const templateImg = (path: string) => (TEMPLATE_IMAGE_BASE ? `${TEMPLATE_IMAGE_BASE}${path}` : path);

const SINGLE_REF_REQUIRED_ZH = "该模版必须上传一张参考图";
const SINGLE_REF_ONLY_ZH = "该模版仅限上传一张参考图";
const SINGLE_REF_HINT_EN = "This template requires exactly one reference image";

export const FREE_TEMPLATES: ReadonlyArray<FreeTemplate> = [
  {
    id: "ordinaryselfie",
    name: "潦草自拍",
    name_en: "Messy Selfie",
    prompts: {
      none:
        "Please draw an extremely ordinary and unremarkable iPhone selfie, with no clear subject or sense of composition — just like a random snapshot taken casually. The photo should include slight motion blur, with uneven lighting caused by sunlight or indoor lights resulting in mild overexposure. The angle is awkward, the composition is messy, and the overall aesthetic is deliberately plain — as if it was accidentally taken while pulling the phone out of a pocket. The subjects are [Names], taken at night, next to the [Location].",
      one:
        "Please draw an extremely ordinary and unremarkable iPhone selfie, with no clear subject or sense of composition — just like a random snapshot taken casually. The photo should include slight motion blur, with uneven lighting caused by sunlight or indoor lights resulting in mild overexposure. The angle is awkward, the composition is messy, and the overall aesthetic is deliberately plain — as if it was accidentally taken while pulling the phone out of a pocket. The subjects are the people in the reference image and [Names], taken at night, next to the [Location].",
      two:
        "Please draw an extremely ordinary and unremarkable iPhone selfie, with no clear subject or sense of composition — just like a random snapshot taken casually. The photo should include slight motion blur, with uneven lighting caused by sunlight or indoor lights resulting in mild overexposure. The angle is awkward, the composition is messy, and the overall aesthetic is deliberately plain — as if it was accidentally taken while pulling the phone out of a pocket. The subjects are the people in the reference images, taken at night, next to the [Location]."
    },
    hint: "请替换 [Names] 和 [Location] 为你想要的人物和地点",
    hint_en: "Replace [Names] and [Location] with your desired characters and places",
    image: templateImg("/templates/templates_ordinaryselfie.png")
  },
  {
    id: "polaroid",
    name: "拍立得合影",
    name_en: "Polaroid Group Photo",
    prompts: {
      none:
        "Create a 4K HD realistic polaroid-style photograph of [names]. They are posing together. Keep the faces unchanged, add slight blur and consistent lighting, with a white curtain backdrop, like a cozy candid film photo.",
      one:
        "Create a 4K HD realistic polaroid-style photograph of the people in the provided images and [name]. They are posing together. Keep the faces unchanged, add slight blur and consistent lighting, with a white curtain backdrop, like a cozy candid film photo.",
      two:
        "Create a 4K HD realistic polaroid-style photograph of the people in the provided images. They are posing together. Keep the faces unchanged, add slight blur and consistent lighting, with a white curtain backdrop, like a cozy candid film photo."
    },
    hint: "如无参考图或一张参考图，请替换 [Names] 为你想要的人物",
    hint_en: "If 0-1 ref images, replace [Names] with desired characters",
    image: templateImg("/templates/templates_polaroid.png")
  },
  {
    id: "scalefigure",
    name: "手办模型",
    name_en: "Scale Figure",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one:
        "create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment.Place the figure on a computer desk, using a circular transparent acrylic base without any text.On the computer screen, display the ZBrush modeling process of the figure.Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.",
      two: SINGLE_REF_REQUIRED_ZH
    },
    hint: SINGLE_REF_REQUIRED_ZH,
    hint_en: SINGLE_REF_HINT_EN,
    image: templateImg("/templates/templates_scalefigure.png"),
    limitImages: 1,
    requiredImages: 1
  },
  {
    id: "photogrid",
    name: "九宫格快拍",
    name_en: "9-Grid Photobooth",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one: "Turn the photo into a 3x3 grid of photo strips with different studio-style poses and expressions.",
      two: SINGLE_REF_REQUIRED_ZH
    },
    hint: SINGLE_REF_REQUIRED_ZH,
    hint_en: "This template requires one portrait image",
    image: templateImg("/templates/templates_photogrid.png"),
    limitImages: 1,
    requiredImages: 1
  },
  {
    id: "black-and-white",
    name: "黑白写真",
    name_en: "B&W Portrait",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one:
        "Please generate a top-angle and close-up black and white portrait of my face, focused on the head facing forward. Use a 35mm lens look, 10.7K 4HD quality. Proud expression. Deep black shadow background - only the face, the upper chest, and the shoulder.",
      two: SINGLE_REF_ONLY_ZH
    },
    hint: SINGLE_REF_REQUIRED_ZH,
    hint_en: "This template requires one portrait image",
    image: templateImg("/templates/templates_black-and-white.png"),
    limitImages: 1,
    requiredImages: 1
  },
  {
    id: "cosplay",
    name: "动漫转 COS",
    name_en: "Anime to Cosplay",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one: "Generate a photo of a real human cosplaying this illustration, with the background set at Comiket",
      two: SINGLE_REF_ONLY_ZH
    },
    hint: SINGLE_REF_REQUIRED_ZH,
    hint_en: SINGLE_REF_HINT_EN,
    image: templateImg("/templates/templates_cosplay.png"),
    limitImages: 1,
    requiredImages: 1
  },
  {
    id: "sculpture",
    name: "大理石雕塑",
    name_en: "Marble Sculpture",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one: "A photorealistic image of an ultra-detailed sculpture of the subject in image made of shining marble. The sculpture should display smooth and reflective marble surface, emphasizing its luster and artistic craftsmanship. The design is elegant, highlighting the beauty and depth of marble. The lighting in the image should enhance the sculpture's contours and textures, creating a visually stunning and mesmerizing effect",
      two: SINGLE_REF_ONLY_ZH
    },
    hint: SINGLE_REF_REQUIRED_ZH,
    hint_en: SINGLE_REF_HINT_EN,
    image: templateImg("/templates/templates_sculpture.png"),
    limitImages: 1,
    requiredImages: 1
  },
  {
    id: "idphoto",
    name: "证件照",
    name_en: "ID Photo",
    prompts: {
      none: SINGLE_REF_REQUIRED_ZH,
      one: `Crop the head and create a 2-inch ID photo with:
1. Blue background
2. Professional business attire
3. Frontal face
4. Slight smile`,
      two: SINGLE_REF_ONLY_ZH
    },
    hint: "该模版必须上传一张参考图，可自行修改背景颜色（Prompt 中的第一点）",
    hint_en: "Upload exactly one reference photo. You may change the background color by adjusting the prompt (bullet 1).",
    image: templateImg("/templates/templates_idphoto.png"),
    limitImages: 1,
    requiredImages: 1
  }
];

export function getTemplateMeta(id: string | null | undefined) {
  if (!id) return undefined;
  return FREE_TEMPLATES.find((tpl) => tpl.id === id);
}