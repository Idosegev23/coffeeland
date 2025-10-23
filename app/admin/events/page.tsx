'use client';

/**
 * אדמין - ניהול חוגים וסדנאות
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Calendar, Plus, Edit, Trash2, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'workshop' | 'event';
  start_at: string;
  end_at: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  instructor?: { name: string };
  room?: { name: string; capacity: number };
  capacity?: number;
  price?: number;
  status: string;
  synced_to_google: boolean;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'class' as 'class' | 'workshop' | 'event',
    start_at: '',
    end_at: '',
    is_recurring: false,
    recurrence_pattern: '',
    capacity: '',
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events?status=active');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price: null, // אין מחיר - רק נעילת חלון
          requires_registration: true
        })
      });

      if (!res.ok) throw new Error('Failed to create event');

      const data = await res.json();
      setEvents([...events, data.event]);
      setShowCreateDialog(false);
      resetForm();
      alert('✅ אירוע נוצר בהצלחה וסונכרן ליומן Google!');
    } catch (error: any) {
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את האירוע? (יימחק גם מיומן Google)')) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete');

      setEvents(events.filter(e => e.id !== id));
      alert('✅ אירוע נמחק');
    } catch (error: any) {
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'class',
      start_at: '',
      end_at: '',
      is_recurring: false,
      recurrence_pattern: '',
      capacity: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען אירועים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כותרת */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              <Calendar className="inline-block mr-2 mb-1" />
              ניהול חוגים וסדנאות
            </h1>
            <p className="text-gray-600">יצירה ועריכה של אירועים + סנכרון אוטומטי ליומן Google</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="ml-2" size={20} />
            אירוע חדש
          </Button>
        </div>

        {/* רשימת אירועים */}
        <div className="grid gap-4">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">אין אירועים עדיין</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                className="mt-4"
              >
                צור אירוע ראשון
              </Button>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.type === 'class' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {event.type === 'class' ? 'חוג' : event.type === 'workshop' ? 'סדנה' : 'אירוע'}
                      </span>
                      {event.is_recurring && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          חוזר
                        </span>
                      )}
                      {event.synced_to_google && (
                        <span className="text-green-600 text-xs flex items-center">
                          <Calendar size={12} className="ml-1" />
                          סונכרן ליומן
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{event.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">תאריך:</span>
                        <p className="font-medium">
                          {new Date(event.start_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">שעה:</span>
                        <p className="font-medium">
                          {new Date(event.start_at).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {event.instructor && (
                        <div>
                          <span className="text-gray-500">מדריך:</span>
                          <p className="font-medium">{event.instructor.name}</p>
                        </div>
                      )}
                      {event.capacity && (
                        <div>
                          <span className="text-gray-500">קיבולת:</span>
                          <p className="font-medium">
                            <Users size={14} className="inline ml-1" />
                            {event.capacity} מקומות
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">רישום:</span>
                        <p className="font-medium text-blue-600">טלפונית בלבד</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mr-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: edit dialog */}}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* דיאלוג יצירה */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>יצירת אירוע חדש</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">כותרת</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="לדוגמה: חוג רובוטיקה"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="תיאור האירוע..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">סוג</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({
                      ...formData,
                      type: e.target.value as 'class' | 'workshop' | 'event'
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="class">חוג</option>
                    <option value="workshop">סדנה</option>
                    <option value="event">אירוע</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={e => setFormData({
                        ...formData,
                        is_recurring: e.target.checked
                      })}
                      className="ml-2"
                    />
                    <span className="text-sm">מפגש חוזר</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">תאריך ושעת התחלה</label>
                  <input
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={e => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תאריך ושעת סיום</label>
                  <input
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={e => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">קיבולת (אופציונלי)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="מספר מקומות מקסימלי (השאר ריק ללא הגבלה)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 האירוע ייצור נעילה ביומן Google - רישום נעשה טלפונית
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                ביטול
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.title || !formData.start_at || !formData.end_at}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="ml-2" size={16} />
                צור אירוע
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

