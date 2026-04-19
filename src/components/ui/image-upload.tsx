"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "@/lib/toast";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo é muito grande. O limite é 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-300
          flex flex-col items-center justify-center gap-2
          border-2 border-dashed rounded-xl overflow-hidden
          w-full aspect-video max-w-md
          ${preview ? "border-transparent" : "border-border hover:border-[#3a5e36] bg-muted/60 hover:bg-muted"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/80 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground text-center">
            <div className="p-3 mb-2 rounded-full bg-white border border-border shadow-sm">
              <Upload className="w-6 h-6 text-[#2d4a2b]" />
            </div>
            <p className="text-sm font-semibold text-foreground">Foto da Reunião</p>
            <p className="text-xs text-muted-foreground mt-1">Clique para selecionar (Max. 5MB)</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
