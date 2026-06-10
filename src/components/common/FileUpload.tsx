import { useEffect, useRef, useState } from 'react';
import { ImagePlus, UploadCloud, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  bucket: string;
  storagePath: string;
  label?: string;
  description?: string;
  onUpload?: (fileUrl: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function FileUpload({
  bucket,
  storagePath,
  label = 'Upload file',
  description = 'Drag and drop an image or click to browse.',
  onUpload,
  onError,
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const uploadFile = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    try {
      const filePath = `${storagePath}/${selectedFile.name}`.replace(/\/+/g, '/');
      const { error } = await supabase.storage.from(bucket).upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: true
      });

      if (error) {
        throw error;
      }

      const { data, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60);
      if (urlError || !data?.signedURL) {
        throw urlError ?? new Error('Unable to generate file URL');
      }

      onUpload?.(data.signedURL);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Unable to upload file');
      onError?.(normalizedError);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {selectedFile && (
          <Button variant="outline" size="sm" onClick={handleClear} type="button">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      <div
        className={cn(
          'group relative rounded-3xl border border-dashed bg-slate-50 px-6 py-10 text-center transition dark:border-slate-700 dark:bg-slate-950',
          isDragging && 'border-slate-900 bg-slate-100 dark:border-slate-100 dark:bg-slate-900',
          disabled && 'opacity-60'
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100">
          <ImagePlus className="h-8 w-8" />
        </div>
        {previewUrl ? (
          <div className="space-y-3">
            <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-3xl object-cover" />
            <p className="text-sm text-slate-700 dark:text-slate-300">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Drag and drop a file here</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">or click to browse from your computer.</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="default" onClick={uploadFile} disabled={!selectedFile || isUploading || disabled}>
          <UploadCloud className="h-4 w-4" />
          {isUploading ? 'Uploading…' : 'Upload file'}
        </Button>
      </div>
    </div>
  );
}
