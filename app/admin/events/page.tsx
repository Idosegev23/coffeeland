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
import { Calendar, Plus, Edit, Trash2, Users, ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

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
  registrations?: Array<{
    id: string;
    user: {
      full_name: string;
      phone: string;
    };
    status: string;
    registered_at: string;
  }>;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'class' as 'class' | 'workshop' | 'event',
    start_at: '',
    end_at: '',
    is_recurring: false,
    recurrence_pattern: '',
    capacity: '',
    price: '',
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
          price: formData.price ? parseFloat(formData.price) : null,
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

  const handleUpdate = async () => {
    if (!editingEvent) return;

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          requires_registration: true
        })
      });

      if (!res.ok) throw new Error('Failed to update event');

      const data = await res.json();
      setEvents(events.map(e => e.id === editingEvent.id ? data.event : e));
      setShowCreateDialog(false);
      setEditingEvent(null);
      resetForm();
      alert('✅ אירוע עודכן בהצלחה וסונכרן ליומן Google!');
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
      capacity: '',
      price: '',
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
        {/* כפתור חזרה */}
        <Link href="/admin">
          <Button variant="outline" className="mb-4 flex items-center gap-2">
            <ArrowRight size={18} />
            חזרה לפאנל ניהול
          </Button>
        </Link>

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
                      {event.price && (
                        <div>
                          <span className="text-gray-500">מחיר:</span>
                          <p className="font-medium text-green-600">₪{event.price}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">רישום:</span>
                        <p className="font-medium text-blue-600">דרך האתר + תשלום</p>
                      </div>
                      {event.registrations && event.registrations.length > 0 && (
                        <div>
                          <span className="text-gray-500">נרשמו:</span>
                          <p className="font-medium text-green-600">
                            {event.registrations.length}
                            {event.capacity && ` מתוך ${event.capacity}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mr-4">
                    {event.registrations && event.registrations.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRegistrationsDialog(true);
                        }}
                      >
                        <UserCheck size={16} className="ml-1" />
                        נרשמים ({event.registrations.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          title: event.title,
                          description: event.description || '',
                          type: event.type,
                          start_at: event.start_at.slice(0, 16),
                          end_at: event.end_at.slice(0, 16),
                          is_recurring: event.is_recurring,
                          recurrence_pattern: event.recurrence_pattern || '',
                          capacity: event.capacity?.toString() || '',
                          price: event.price?.toString() || '',
                        });
                        setShowCreateDialog(true);
                      }}
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

        {/* דיאלוג יצירה/עריכה */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            setEditingEvent(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'עריכת אירוע' : 'יצירת אירוע חדש'}</DialogTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">קיבולת (אופציונלי)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="מספר מקומות מקסימלי"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">מחיר (₪)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="מחיר ההרשמה"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingEvent(null);
                  resetForm();
                }}
              >
                ביטול
              </Button>
              <Button
                onClick={editingEvent ? handleUpdate : handleCreate}
                disabled={!formData.title || !formData.start_at || !formData.end_at}
                className="bg-accent hover:bg-accent/90"
              >
                {editingEvent ? (
                  <>
                    <Edit className="ml-2" size={16} />
                    עדכן אירוע
                  </>
                ) : (
                  <>
                    <Plus className="ml-2" size={16} />
                    צור אירוע
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog - רשימת נרשמים */}
        <Dialog open={showRegistrationsDialog} onOpenChange={setShowRegistrationsDialog}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                רשימת נרשמים - {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {selectedEvent?.registrations && selectedEvent.registrations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">סך נרשמים</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedEvent.registrations.length}
                        </p>
                      </div>
                      {selectedEvent.capacity && (
                        <div className="text-left">
                          <p className="text-sm text-gray-600">מקומות פנויים</p>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedEvent.capacity - selectedEvent.registrations.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold">#</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">שם</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">טלפון</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">סטטוס</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">תאריך רישום</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedEvent.registrations.map((registration, index) => (
                          <tr key={registration.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 font-medium">
                              {registration.user?.full_name || 'לא ידוע'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {registration.user?.phone || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                registration.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : registration.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {registration.status === 'confirmed' ? 'מאושר' : 
                                 registration.status === 'pending' ? 'ממתין' : 
                                 registration.status === 'cancelled' ? 'בוטל' : 
                                 registration.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(registration.registered_at).toLocaleDateString('he-IL', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>אין נרשמים לאירוע זה</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowRegistrationsDialog(false)}>
                סגור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

