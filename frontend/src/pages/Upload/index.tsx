import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react';
import { imagesApi } from '../../api/images';
import Button from '../../components/Button';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm fayllarni yuklash mumkin');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fayl hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Rasm tanlang');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('comments_enabled', String(commentsEnabled));

      const newImage = await imagesApi.createImage(formData);
      navigate(`/pin/${newImage.id}`);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Yuklash xatosi';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pt-20 pb-8 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Rasm yuklash</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Upload area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-96 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <UploadIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Rasmni bu yerga tashlang
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  yoki bossangiz tanlang
                </p>
              </div>
              <p className="text-xs text-gray-400">
                JPG, PNG, GIF • Maksimum 5MB
              </p>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Sarlavha
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Rasm sarlavhasi"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Tavsif
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
              placeholder="Rasm haqida qisqacha"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="comments"
              checked={commentsEnabled}
              onChange={(e) => setCommentsEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="comments" className="text-sm text-gray-700">
              Kommentlarni yoqish
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            isLoading={isUploading}
            disabled={!selectedFile}
            className="flex-1"
          >
            Yuklash
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Bekor qilish
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
