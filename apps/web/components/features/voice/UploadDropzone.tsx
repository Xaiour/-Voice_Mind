"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileAudio } from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function UploadDropzone() {
  const { uploadAudio, isUploading } = useAnalysis();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 50MB.");
        return;
      }

      uploadAudio(file);
    },
    [uploadAudio]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".wav", ".mp3", ".ogg", ".webm", ".m4a"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/50",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <FileAudio className="w-12 h-12 text-primary" />
            <p className="text-primary font-medium">Drop your audio file here</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isUploading ? "Uploading..." : "Drop audio file or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                WAV, MP3, OGG, WebM (max 50MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
