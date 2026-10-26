import { callImageProvider } from "@providers/image";
import { callVideoProvider } from "@providers/video";
import { MODEL_TEXT_TO_IMAGE, MODEL_IMAGE_TO_IMAGE, MODEL_TEXT_TO_VIDEO, MODEL_IMAGE_TO_VIDEO } from "./models";
import type { PromptJson } from "./promptTypes";

type ProviderArgs = {
  promptJson: PromptJson;
  referenceImageUrl?: string | null;
  modelId?: string;
  imageSize?: string;
};

export async function callProvider({ promptJson, referenceImageUrl, modelId, imageSize }: ProviderArgs) {
  if (modelId === MODEL_TEXT_TO_VIDEO || modelId === MODEL_IMAGE_TO_VIDEO) {
    const aspectRatio = promptJson.camera?.aspect_ratio;
    return callVideoProvider({ promptJson, referenceImageUrl, aspectRatio, imageSize });
  }

  const aspectRatio = promptJson.camera?.aspect_ratio;
  return callImageProvider({ promptJson, referenceImageUrl, aspectRatio });
}