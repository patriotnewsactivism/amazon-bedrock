"use client";

import { useState } from "react";

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({
  onFileContent,
  accept = ".txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.css,.html",
  maxSize = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Max size: ${maxSize}MB`);
      return;
    }

    try {
      const content = await file.text();
      onFileContent(content, file.name);
    } catch (err) {
      setError("Failed to read file");
      console.error(err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="mb-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-gray-600 dark:text-gray-400"
        >
          <div className="text-4xl mb-2">📎</div>
          <div className="text-sm">
            Drop a file here or{" "}
            <span className="text-blue-600 dark:text-blue-400 underline">
              browse
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Max size: {maxSize}MB
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}
    </div>
  );
}
