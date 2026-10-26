import React, { useState, useRef, useEffect } from 'react';

interface LogoUploaderProps {
  label: string;
  logoUrl: string;
  onLogoChange: (base64: string) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ label, logoUrl, onLogoChange }) => {
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(logoUrl);
  }, [logoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onLogoChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mb-4 cursor-pointer"
        onClick={handleUploadClick}
      >
        {preview ? (
          <img src={preview} alt={`${label} preview`} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-xs text-gray-500 text-center">Click to upload</span>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/svg+xml"
      />
    </div>
  );
};

export default LogoUploader; 