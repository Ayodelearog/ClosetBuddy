'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { imageUtils } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  className?: string;
}

export function ImageUpload({ onImageSelect, onImageRemove, selectedImage, className = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Validate image
    const validation = imageUtils.validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image');
      setIsProcessing(false);
      return;
    }

    try {
      // Resize image for optimization
      const resizedFile = await imageUtils.resizeImage(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(resizedFile);
      setPreview(previewUrl);
      
      // Call parent callback
      onImageSelect(resizedFile);
    } catch (err) {
      setError('Failed to process image');
      console.error('Image processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
    onImageRemove();
  };

  // Show preview if we have a selected image
  if (selectedImage || preview) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-6 h-6 text-purple-600" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing 
                ? 'Processing image...' 
                : isDragActive 
                  ? 'Drop your image here' 
                  : 'Upload clothing image'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isProcessing 
                ? 'Please wait while we optimize your image' 
                : 'Drag and drop or click to select (JPEG, PNG, WebP up to 5MB)'
              }
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
