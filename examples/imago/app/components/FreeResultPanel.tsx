"use client";

import { type ReactNode } from "react";
import { ResultPanel } from "./ResultPanel";

type Props = {
  img: string | null;
  loading: boolean;
  progress: number;
  progressMessage: string | null;
  onPreviewOpen: () => void;
  onDownload: () => void;
  canContinueEdit?: boolean;
  onContinueEdit?: () => void;
  downloading?: boolean;
  downloadError?: string | null;
  className?: string;
  canvasHeightClass?: string;
  placeholderBackgroundImage?: string | null;
  placeholderContent?: ReactNode;
  errorMessage?: string | null;
  aspectRatioHint?: string | null;
  showRechargeCTA?: boolean;
  onAnimate?: (imageUrl: string) => void;
};

export function FreeResultPanel({
  img,
  loading,
  progress,
  progressMessage,
  onPreviewOpen,
  onDownload,
  canContinueEdit = false,
  onContinueEdit,
  downloading = false,
  downloadError = null,
  className = "",
  canvasHeightClass = "h-[60vh] lg:h-[70vh]",
  placeholderBackgroundImage = null,
  placeholderContent,
  errorMessage = null,
  aspectRatioHint = null,
  showRechargeCTA = false,
  onAnimate
}: Props) {
  return (
    <ResultPanel
      img={img}
      loading={loading}
      progress={progress}
      progressMessage={progressMessage}
      downloading={downloading}
      downloadError={downloadError}
      onPreviewOpen={onPreviewOpen}
      onDownload={onDownload}
      canContinueEdit={canContinueEdit}
      onContinueEdit={onContinueEdit ?? (() => { })}
      isContinuingEdit={false}

      uploadingReference={false}
      referenceUploadError={null}
      referenceImageForDisplay={null}
      onReferencePreviewOpen={() => { }}
      className={className}
      canvasHeightClass={canvasHeightClass}
      standbyBackgroundImage={placeholderBackgroundImage}
      standbyContent={placeholderContent}
      errorMessage={errorMessage}
      showRechargeCTA={showRechargeCTA}
      aspectRatioHint={aspectRatioHint}
      onAnimate={onAnimate}
    />
  );
}
