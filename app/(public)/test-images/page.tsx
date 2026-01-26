'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TestImagesPage() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/public/events?type=show&status=active')
      .then(res => res.json())
      .then(data => {
        const urls = (data.events || [])
          .map((e: any) => e.banner_image_url)
          .filter(Boolean);
        setImages(urls);
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">בדיקת תמונות הצגות</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          שגיאה: {error}
        </div>
      )}

      <div className="space-y-8">
        {images.map((url, idx) => (
          <div key={idx} className="border p-4 rounded">
            <p className="mb-2 text-sm text-gray-600 break-all">
              <strong>URL:</strong> {url}
            </p>
            
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Next.js Image Component:</p>
              <div className="relative w-full h-64 bg-gray-100">
                <Image 
                  src={url} 
                  alt={`Test ${idx}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', url);
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="flex items-center justify-center h-full text-red-600">❌ Image failed to load</div>`;
                    }
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">HTML img tag:</p>
              <img 
                src={url} 
                alt={`Test ${idx}`}
                className="w-full h-64 object-cover bg-gray-100"
                onError={(e) => {
                  console.error('HTML img failed to load:', url);
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" fill="red">Failed to load</text></svg>';
                }}
              />
            </div>

            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              פתח בטאב חדש →
            </a>
          </div>
        ))}

        {images.length === 0 && !error && (
          <p className="text-gray-500">אין תמונות להצגה</p>
        )}
      </div>
    </div>
  );
}
