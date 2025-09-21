'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  sort_order: number;
}

const mockGalleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'יוגה הורה-ילד בשקיעה',
    image_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    tags: ['יוגה', 'הורה-ילד', 'רגיעה'],
    sort_order: 1,
  },
  {
    id: '2',
    title: 'סדנת יצירה - פיסול בחימר',
    image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['יצירה', 'חימר', 'אמנות'],
    sort_order: 2,
  },
  {
    id: '3',
    title: 'יום הולדת 5 - חגיגה צבעונית',
    image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
    tags: ['יום הולדת', 'חגיגה', 'ילדים'],
    sort_order: 3,
  },
  {
    id: '4',
    title: 'פינת הקפה - רגעי שקט',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2047&q=80',
    tags: ['קפה', 'אווירה', 'נוחות'],
    sort_order: 4,
  },
  {
    id: '5',
    title: 'סיפור ומוזיקה - עולם דמיון',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80',
    tags: ['סיפור', 'מוזיקה', 'דמיון'],
    sort_order: 5,
  },
  {
    id: '6',
    title: 'משחקי קבוצה - כיף משותף',
    image_url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['משחקים', 'קבוצה', 'כיף'],
    sort_order: 6,
  },
];

const allTags = Array.from(new Set(mockGalleryItems.flatMap(item => item.tags)));

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(mockGalleryItems);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>(mockGalleryItems);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterItems();
  }, [selectedTags, searchQuery, items]);

  const filterItems = () => {
    let filtered = items;

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const downloadImage = (item: GalleryItem) => {
    // In a real app, you'd implement proper image download
    window.open(item.image_url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">גלריית רגעים מיוחדים</h1>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            צפו ברגעי השמחה, היצירה והלמידה המשותפת שלנו. כל תמונה מספרת סיפור של חוויה בלתי נשכחת
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
            <input
              type="text"
              placeholder="חפשו תמונות לפי כותרת או תגית..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
            />
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-coffee-900">סינון לפי תגיות</h3>
              {(selectedTags.length > 0 || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  נקה מסננים
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    selectedTags.includes(tag)
                      ? 'bg-tropical-600 text-latte'
                      : 'bg-latte-200 text-coffee-700 hover:bg-latte-300'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-coffee-600">
            מציג {filteredItems.length} מתוך {items.length} תמונות
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-latte-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-coffee-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-coffee-400" />
            </div>
            <h3 className="text-xl font-semibold text-coffee-900 mb-2">לא נמצאו תמונות</h3>
            <p className="text-coffee-600 mb-4">נסו לשנות את המסננים או מילות החיפוש</p>
            <Button onClick={clearFilters}>נקה מסננים</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative aspect-square bg-latte-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => openLightbox(item)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white w-full">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-white/20 backdrop-blur px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-coffee-900 mb-4">
              רוצים להיות חלק מהגלריה שלנו?
            </h3>
            <p className="text-coffee-700 mb-6">
              הצטרפו לפעילויות שלנו וצרו זכרונות יפים שיישארו איתכם לתמיד
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/calendar">הירשמו לסדנה</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/events-contact">תאמו אירוע</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image */}
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur text-white p-4 rounded-b-lg">
              <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedImage.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => downloadImage(selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד תמונה
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
