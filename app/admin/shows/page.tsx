'use client';

/**
 * אדמין - ניהול הצגות
 * דף ייעודי לניהול כל ההצגות עם כל הפיצ'רים
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Calendar, Users, DollarSign, Ticket, RefreshCw, ArrowRight, Plus, Eye, Upload, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Show {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  capacity: number;
  status: string;
  banner_image_url?: string;
  price_show_only: number;
  price_show_and_playground: number;
  is_featured: boolean;
  cancellation_deadline_hours: number;
  registrations?: Array<{
    id: string;
    status: string;
    ticket_type?: string;
    user: { full_name: string; phone: string; email?: string; };
    payment?: {
      amount: number;
      status: string;
    };
    registered_at: string;
  }>;
}

export default function AdminShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const supabase = createClientComponentClient();

  // Form state for creating show
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_time: '',
    capacity: 13,
    price_show_only: 45,
    price_show_and_playground: 70,
    is_featured: false,
    cancellation_deadline_hours: 24,
    banner_image: null as File | null,
  });

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const res = await fetch('/api/events?type=show');
      const data = await res.json();
      setShows(data.events || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSales = async (show: Show) => {
    const newStatus = show.status === 'full' ? 'active' : 'full';
    const action = newStatus === 'full' ? 'עצירת' : 'פתיחת';
    
    if (!confirm(`האם אתה בטוח שברצונך ${action} מכירה עבור "${show.title}"?`)) return;

    try {
      const res = await fetch(`/api/events/${show.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // עדכון מקומי
      setShows(shows.map(s => 
        s.id === show.id ? { ...s, status: newStatus } : s
      ));

      alert(newStatus === 'full' 
        ? '⛔ המכירה נעצרה בהצלחה!' 
        : '✅ המכירה נפתחה בהצלחה!');
    } catch (error: any) {
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload image if provided
      let banner_image_url = null;
      if (formData.banner_image) {
        setUploading(true);
        const fileName = `${Date.now()}-${formData.banner_image.name.replace(/\s+/g, '-')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('show-images')
          .upload(fileName, formData.banner_image);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('העלאת התמונה נכשלה');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('show-images')
          .getPublicUrl(fileName);
        
        banner_image_url = publicUrl;
        setUploading(false);
      }

      // 2. Prepare event data
      const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
      const endDateTime = `${formData.start_date}T${formData.end_time}:00`;

      const eventData = {
        title: formData.title,
        description: formData.description,
        type: 'show',
        start_at: startDateTime,
        end_at: endDateTime,
        capacity: formData.capacity,
        status: 'active',
        requires_registration: true,
        price_show_only: formData.price_show_only,
        price_show_and_playground: formData.price_show_and_playground,
        is_featured: formData.is_featured,
        cancellation_deadline_hours: formData.cancellation_deadline_hours,
        banner_image_url,
      };

      // 3. Create event
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (!res.ok) throw new Error('יצירת ההצגה נכשלה');

      // 4. Close dialog and reload
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_time: '',
        capacity: 13,
        price_show_only: 45,
        price_show_and_playground: 70,
        is_featured: false,
        cancellation_deadline_hours: 24,
        banner_image: null,
      });
      
      await loadShows();
      alert('✅ ההצגה נוצרה בהצלחה!');
    } catch (error: any) {
      alert('❌ שגיאה: ' + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const calculateStats = (show: Show) => {
    const registrations = show.registrations || [];
    const confirmed = registrations.filter(r => r.status === 'confirmed');
    const totalSold = confirmed.length;
    const availableSeats = show.capacity - totalSold;
    const revenue = confirmed.reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

    return { totalSold, availableSeats, revenue };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exportToCSV = (show: Show) => {
    const registrations = show.registrations || [];
    const confirmed = registrations.filter(r => r.status === 'confirmed');
    
    const headers = ['שם מלא', 'טלפון', 'אימייל', 'סוג כרטיס', 'סכום', 'סטטוס תשלום', 'תאריך רישום'];
    const rows = confirmed.map(r => [
      r.user.full_name,
      r.user.phone,
      r.user.email || '',
      r.ticket_type === 'show_only' ? 'הצגה בלבד' : 'הצגה + גימבורי',
      `₪${r.payment?.amount || 0}`,
      r.payment?.status === 'completed' ? 'שולם' : 'ממתין',
      new Date(r.registered_at).toLocaleDateString('he-IL')
    ]);

    const csvContent = [
      '\uFEFF', // BOM for Excel UTF-8
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${show.title.replace(/\s+/g, '_')}_משתתפים.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">טוען הצגות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה לפאנל ניהול
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">ניהול הצגות</h1>
              <p className="text-text-light/70">כל ההצגות שלך במקום אחד</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadShows} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              רענן
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 ml-2" />
              הצגה חדשה
            </Button>
          </div>
        </div>

        {/* Shows Grid */}
        {shows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Ticket className="w-16 h-16 text-secondary mx-auto mb-4" />
            <p className="text-xl font-bold text-primary mb-2">אין הצגות במערכת</p>
            <p className="text-text-light/70 mb-6">צור הצגה ראשונה</p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-accent">
              <Plus className="w-4 h-4 ml-2" />
              צור הצגה
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {shows.map((show) => {
              const stats = calculateStats(show);
              const isFull = show.status === 'full';
              const isPast = new Date(show.start_at) < new Date();

              return (
                <div 
                  key={show.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                    isFull ? 'border-red-300' : isPast ? 'border-gray-300' : 'border-green-300'
                  }`}
                >
                  {/* Image */}
                  {show.banner_image_url && (
                    <div className="relative w-full h-48">
                      <Image 
                        src={show.banner_image_url} 
                        alt={show.title}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded font-bold text-white ${
                        isFull ? 'bg-red-600' : isPast ? 'bg-gray-600' : 'bg-green-600'
                      }`}>
                        {isFull ? '⛔ אזל המלאי' : isPast ? '✓ הסתיים' : '✓ פעיל'}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary mb-2">{show.title}</h2>
                    
                    {show.description && (
                      <p className="text-text-light/70 text-sm mb-4 line-clamp-2">
                        {show.description}
                      </p>
                    )}

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-text-light">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>{formatDate(show.start_at)}</span>
                      </div>
                      <span className="text-accent font-bold">
                        {formatTime(show.start_at)}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-4 bg-background rounded-lg p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalSold}</p>
                        <p className="text-xs text-gray-600">נמכרו</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Ticket className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.availableSeats}</p>
                        <p className="text-xs text-gray-600">פנויים</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-[#4C2C21]" />
                        </div>
                        <p className="text-xl font-bold text-[#4C2C21]">₪{stats.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">הכנסות</p>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-light/70">🎭 הצגה בלבד</span>
                        <span className="font-bold text-accent">₪{show.price_show_only}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-light/70">🎪 הצגה + גימבורי</span>
                        <span className="font-bold text-accent">₪{show.price_show_and_playground}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-3">
                      <Button
                        onClick={() => {
                          setSelectedShow(show);
                          setAttendeesDialogOpen(true);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        משתתפים ({stats.totalSold})
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {!isPast && (
                        <Button
                          onClick={() => handleToggleSales(show)}
                          className={`flex-1 ${isFull ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {isFull ? '✓ פתח מכירה' : '⛔ עצור מכירה'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Show Dialog */}
        {createDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">הצגה חדשה</h2>
              
              <form onSubmit={handleCreateShow} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">כותרת</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="שם ההצגה"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תיאור</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="תיאור ההצגה"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">תאריך</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">שעת התחלה</label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">שעת סיום</label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">קיבולת</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">מחיר - הצגה בלבד (₪)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price_show_only}
                      onChange={(e) => setFormData({ ...formData, price_show_only: parseFloat(e.target.value) })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">מחיר - הצגה + גימבורי (₪)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price_show_and_playground}
                      onChange={(e) => setFormData({ ...formData, price_show_and_playground: parseFloat(e.target.value) })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תמונת באנר</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.files?.[0] || null })}
                    className="w-full border rounded p-2"
                  />
                  {uploading && <p className="text-sm text-blue-600 mt-2">מעלה תמונה...</p>}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">הצג בדף הבית (מומלץ)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    {uploading ? 'מעלה...' : 'צור הצגה'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendees Dialog */}
        {attendeesDialogOpen && selectedShow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">{selectedShow.title} - משתתפים</h2>
                <Button
                  onClick={() => exportToCSV(selectedShow)}
                  variant="outline"
                  size="sm"
                >
                  ייצוא ל-CSV
                </Button>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-background rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">סה&quot;כ כרטיסים</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedShow.registrations?.filter(r => r.status === 'confirmed').length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">סה&quot;כ הכנסות</p>
                    <p className="text-2xl font-bold text-[#4C2C21]">
                      ₪{selectedShow.registrations
                        ?.filter(r => r.status === 'confirmed' && r.payment)
                        .reduce((sum, r) => sum + (r.payment?.amount || 0), 0)
                        .toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">מקומות פנויים</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedShow.capacity - (selectedShow.registrations?.filter(r => r.status === 'confirmed').length || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background">
                    <tr>
                      <th className="text-right p-3 text-sm font-semibold">שם</th>
                      <th className="text-right p-3 text-sm font-semibold">טלפון</th>
                      <th className="text-right p-3 text-sm font-semibold">אימייל</th>
                      <th className="text-right p-3 text-sm font-semibold">סוג כרטיס</th>
                      <th className="text-right p-3 text-sm font-semibold">סכום</th>
                      <th className="text-right p-3 text-sm font-semibold">סטטוס</th>
                      <th className="text-right p-3 text-sm font-semibold">תאריך</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShow.registrations
                      ?.filter(r => r.status === 'confirmed')
                      .map((reg) => (
                        <tr key={reg.id} className="border-t hover:bg-background/50">
                          <td className="p-3 text-sm">{reg.user.full_name}</td>
                          <td className="p-3 text-sm">{reg.user.phone}</td>
                          <td className="p-3 text-sm">{reg.user.email || '-'}</td>
                          <td className="p-3 text-sm">
                            {reg.ticket_type === 'show_only' ? '🎭 הצגה בלבד' : '🎪 הצגה + גימבורי'}
                          </td>
                          <td className="p-3 text-sm font-semibold">
                            ₪{reg.payment?.amount || 0}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              reg.payment?.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reg.payment?.status === 'completed' ? (
                                <><Check className="w-3 h-3 ml-1" /> שולם</>
                              ) : (
                                'ממתין'
                              )}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(reg.registered_at).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {(!selectedShow.registrations || selectedShow.registrations.filter(r => r.status === 'confirmed').length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    אין משתתפים עדיין
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => {
                    setAttendeesDialogOpen(false);
                    setSelectedShow(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  סגור
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
