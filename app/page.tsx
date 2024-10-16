//app\page.tsx

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

export default function ImageUploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ [key: string]: string } | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Resim yükleme başarısız oldu');

      const data = await res.json();
      if (data.success && data.result) {
        const cleanJson = data.result.replace(/^```json/, '').replace(/```$/, '').trim();
        setResponse(JSON.parse(cleanJson));
      } else {
        throw new Error('Geçersiz yanıt formatı');
      }
    } catch (error) {
      console.error('Hata:', error);
      setResponse(null);
      alert(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sınav Notu Okuyucu</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-300 ease-in-out hover:border-blue-500">
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageChange}
              accept="image/*"
            />
            <div className="text-center">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" width={200} height={200} className="mx-auto rounded-lg" />
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">Resim yüklemek için tıklayın veya sürükleyip bırakın</p>
                </>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!selectedImage || isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'İşleniyor...' : 'Notları Oku'}
          </button>
        </form>
        {response && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Sınav Notları</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {Object.entries(response).map(([question, score]) => (
                <div key={question} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-700">Soru {question}</span>
                  <span className="text-blue-600 font-bold">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}