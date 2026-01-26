'use client';

/**
 * אדמין - ניהול חוגים וסדנאות
 */

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';

// Supabase client
const supabase = createClientComponentClient();
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Calendar, Plus, Edit, Trash2, Users, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'workshop' | 'event' | 'show';
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
  is_featured?: boolean;
  cancellation_deadline_hours?: number;
  banner_image_url?: string;
  price_show_only?: number;
  price_show_and_playground?: number;
  registrations?: Array<{
    id: string;
    user: {
      full_name: string;
      phone: string;
      email?: string;
    };
    status: string;
    ticket_type?: string;
    registered_at: string;
  }>;
}

type CreateMode = 'single' | 'repeat_in_day' | 'selected_dates';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function combineDateAndTime(date: string, time: string) {
  // returns datetime-local: YYYY-MM-DDTHH:mm
  return `${date}T${time}`;
}

function addMinutesToDateTimeLocal(dt: string, minutes: number) {
  const d = new Date(dt);
  d.setMinutes(d.getMinutes() + minutes);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function addDaysToDate(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const weekdayLabels: Array<{ key: number; label: string }> = [
  { key: 0, label: 'א׳' },
  { key: 1, label: 'ב׳' },
  { key: 2, label: 'ג׳' },
  { key: 3, label: 'ד׳' },
  { key: 4, label: 'ה׳' },
  { key: 5, label: 'ו׳' },
  { key: 6, label: 'ש׳' },
];

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
    type: 'class' as 'class' | 'workshop' | 'event' | 'show',
    start_at: '',
    end_at: '',
    is_recurring: false,
    recurrence_pattern: '',
    capacity: '',
    price: '',
    is_featured: false,
    cancellation_deadline_hours: 24,
    banner_image_url: '',
    price_show_only: '',
    price_show_and_playground: '',
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);

  const [createMode, setCreateMode] = useState<CreateMode>('single');

  // Repeat-in-day mode
  const [repeatDate, setRepeatDate] = useState('');
  const [repeatFromTime, setRepeatFromTime] = useState('10:00');
  const [repeatToTime, setRepeatToTime] = useState('14:00');
  const [repeatDurationMinutes, setRepeatDurationMinutes] = useState(120);
  const [repeatGapMinutes, setRepeatGapMinutes] = useState(0);
  const [repeatCountPerDay, setRepeatCountPerDay] = useState<number>(0); // 0 = auto (fill window)
  const [repeatAcrossDays, setRepeatAcrossDays] = useState(false);
  const [repeatRangeStart, setRepeatRangeStart] = useState('');
  const [repeatRangeEnd, setRepeatRangeEnd] = useState('');
  const [repeatWeekdays, setRepeatWeekdays] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
  });

  // Selected-dates mode
  const [datesInput, setDatesInput] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDatesStartTime, setSelectedDatesStartTime] = useState('10:00');
  const [selectedDatesDurationMinutes, setSelectedDatesDurationMinutes] = useState(120);

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
      if (editingEvent) return;

      let occurrences: Array<{ start_at: string; end_at: string }> | null = null;

      if (createMode === 'repeat_in_day') {
        if (repeatDurationMinutes <= 0) throw new Error('משך מפגש חייב להיות גדול מ-0');
        if (repeatGapMinutes < 0) throw new Error('מרווח לא יכול להיות שלילי');
        if (repeatCountPerDay < 0) throw new Error('כמות מופעים ביום לא יכולה להיות שלילית');

        const makeOccurrencesForDay = (date: string) => {
          const start = combineDateAndTime(date, repeatFromTime);
          const end = combineDateAndTime(date, repeatToTime);
          if (new Date(start) >= new Date(end)) throw new Error('טווח שעות לא תקין (שעת סיום חייבת להיות אחרי שעת התחלה)');

          const occ: Array<{ start_at: string; end_at: string }> = [];

          if (repeatCountPerDay && repeatCountPerDay > 0) {
            let cursor = start;
            for (let i = 0; i < repeatCountPerDay; i++) {
              const occEnd = addMinutesToDateTimeLocal(cursor, repeatDurationMinutes);
              if (new Date(occEnd) > new Date(end)) {
                throw new Error(`אין מספיק זמן ביום ${new Date(date).toLocaleDateString('he-IL')} ל-${repeatCountPerDay} מופעים`);
              }
              occ.push({ start_at: cursor, end_at: occEnd });
              cursor = addMinutesToDateTimeLocal(occEnd, repeatGapMinutes);
            }
            return occ;
          }

          // Auto-fill: fill the window with duration+gap
          let cursor = start;
          while (new Date(cursor) < new Date(end)) {
            const occEnd = addMinutesToDateTimeLocal(cursor, repeatDurationMinutes);
            if (new Date(occEnd) > new Date(end)) break;
            occ.push({ start_at: cursor, end_at: occEnd });
            cursor = addMinutesToDateTimeLocal(occEnd, repeatGapMinutes);
            if (occ.length > 100) break;
          }
          return occ;
        };

        const occ: Array<{ start_at: string; end_at: string }> = [];

        if (repeatAcrossDays) {
          if (!repeatRangeStart || !repeatRangeEnd) throw new Error('נא לבחור טווח תאריכים');
          if (new Date(`${repeatRangeStart}T00:00`) > new Date(`${repeatRangeEnd}T00:00`)) {
            throw new Error('טווח תאריכים לא תקין');
          }

          // Iterate days (inclusive)
          let cursorDate = repeatRangeStart;
          for (let guard = 0; guard < 366; guard++) {
            const day = new Date(`${cursorDate}T00:00`);
            const dow = day.getDay();
            if (repeatWeekdays[dow]) {
              const dayOcc = makeOccurrencesForDay(cursorDate);
              occ.push(...dayOcc);
              if (occ.length > 100) throw new Error('נוצרו יותר מדי מופעים (מקסימום 100)');
            }
            if (cursorDate === repeatRangeEnd) break;
            cursorDate = addDaysToDate(cursorDate, 1);
          }
        } else {
          if (!repeatDate) throw new Error('נא לבחור תאריך');
          occ.push(...makeOccurrencesForDay(repeatDate));
        }

        if (occ.length === 0) throw new Error('לא נוצרו מופעים לפי ההגדרות (בדוק טווח/משך/ימים)');
        occurrences = occ;
      }

      if (createMode === 'selected_dates') {
        if (selectedDates.length === 0) throw new Error('נא להוסיף לפחות תאריך אחד');
        if (selectedDatesDurationMinutes <= 0) throw new Error('משך מפגש חייב להיות גדול מ-0');
        const occ = selectedDates
          .slice()
          .sort()
          .map((d) => {
            const start = combineDateAndTime(d, selectedDatesStartTime);
            const end = addMinutesToDateTimeLocal(start, selectedDatesDurationMinutes);
            return { start_at: start, end_at: end };
          });
        occurrences = occ;
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // כאשר יוצרים סדרה - נשלח occurrences ונגדיר recurring לתצוגה
          ...(occurrences ? { occurrences, is_recurring: true, recurrence_pattern: createMode } : {}),
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          is_featured: formData.is_featured || false,
          cancellation_deadline_hours: formData.cancellation_deadline_hours || 24,
          banner_image_url: formData.banner_image_url || null,
          price_show_only: formData.price_show_only ? parseFloat(formData.price_show_only) : null,
          price_show_and_playground: formData.price_show_and_playground ? parseFloat(formData.price_show_and_playground) : null,
          requires_registration: true
        })
      });

      if (!res.ok) throw new Error('Failed to create event');

      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        setEvents([...events, ...data.events]);
        alert(`✅ נוצרו ${data.events.length} מופעים וסונכרנו (ככל האפשר) ליומן Google!`);
      } else {
      setEvents([...events, data.event]);
        alert('✅ אירוע נוצר בהצלחה וסונכרן ליומן Google!');
      }
      setShowCreateDialog(false);
      resetForm();
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
          title: formData.title,
          description: formData.description,
          type: formData.type,
          start_at: formData.start_at,
          end_at: formData.end_at,
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.recurrence_pattern || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          is_featured: formData.is_featured || false,
          cancellation_deadline_hours: formData.cancellation_deadline_hours || 24,
          banner_image_url: formData.banner_image_url || null,
          price_show_only: formData.price_show_only ? parseFloat(formData.price_show_only) : null,
          price_show_and_playground: formData.price_show_and_playground ? parseFloat(formData.price_show_and_playground) : null,
          requires_registration: true
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const data = await res.json();
      setEvents(events.map(e => e.id === editingEvent.id ? data.event : e));
      setShowCreateDialog(false);
      setEditingEvent(null);
      resetForm();
      alert('✅ אירוע עודכן בהצלחה וסונכרן ליומן Google!');
    } catch (error: any) {
      console.error('Update error:', error);
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
      is_featured: false,
      cancellation_deadline_hours: 24,
      banner_image_url: '',
      price_show_only: '',
      price_show_and_playground: '',
    });
    setCreateMode('single');
    setRepeatDate('');
    setRepeatFromTime('10:00');
    setRepeatToTime('14:00');
    setRepeatDurationMinutes(120);
    setRepeatGapMinutes(0);
    setRepeatCountPerDay(0);
    setRepeatAcrossDays(false);
    setRepeatRangeStart('');
    setRepeatRangeEnd('');
    setRepeatWeekdays({
      0: true,
      1: true,
      2: true,
      3: true,
      4: true,
      5: false,
      6: false,
    });
    setDatesInput('');
    setSelectedDates([]);
    setSelectedDatesStartTime('10:00');
    setSelectedDatesDurationMinutes(120);
  };

  const handleEdit = useCallback((event: Event) => {
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
      is_featured: event.is_featured || false,
      cancellation_deadline_hours: event.cancellation_deadline_hours || 24,
      banner_image_url: event.banner_image_url || '',
      price_show_only: event.price_show_only?.toString() || '',
      price_show_and_playground: event.price_show_and_playground?.toString() || '',
    });
    setCreateMode('single');
    setShowCreateDialog(true);
  }, []);

  // ייצוא רשימת משתתפים ל-CSV
  const exportToCSV = useCallback((event: Event) => {
    if (!event.registrations || event.registrations.length === 0) {
      alert('אין נרשמים לייצוא');
      return;
    }

    const headers = ['מספר', 'שם', 'טלפון', 'אימייל', 'סוג כרטיס', 'סטטוס', 'תאריך רישום'];
    const rows = event.registrations.map((r, idx) => [
      (idx + 1).toString(),
      r.user?.full_name || 'לא ידוע',
      r.user?.phone || '-',
      r.user?.email || '-',
      r.ticket_type === 'show_only' ? 'הצגה בלבד' :
      r.ticket_type === 'show_and_playground' ? 'הצגה + משחקייה' :
      r.ticket_type || 'רגיל',
      r.status === 'confirmed' ? 'מאושר' :
      r.status === 'pending' ? 'ממתין' :
      r.status === 'cancelled' ? 'בוטל' : r.status,
      new Date(r.registered_at).toLocaleDateString('he-IL')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const bom = '\ufeff'; // UTF-8 BOM for Excel
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title}_משתתפים.csv`;
    link.click();
  }, []);

  // חישוב סטטיסטיקות לאירוע
  const calculateEventStats = useCallback((event: Event) => {
    const registrations = event.registrations || [];
    const confirmedRegs = registrations.filter(r => r.status === 'confirmed');
    const totalSold = confirmedRegs.length;
    const availableSeats = event.capacity ? event.capacity - totalSold : null;

    // חישוב הכנסות
    let revenue = 0;
    if (event.type === 'show') {
      revenue = confirmedRegs.reduce((sum, r) => {
        if (r.ticket_type === 'show_only') {
          return sum + (event.price_show_only || 0);
        } else if (r.ticket_type === 'show_and_playground') {
          return sum + (event.price_show_and_playground || 0);
        }
        return sum;
      }, 0);
    } else {
      revenue = confirmedRegs.reduce((sum, r) => sum + (event.price || 0), 0);
    }

    return { totalSold, availableSeats, revenue, confirmedRegs };
  }, []);

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
        <Link href="/admin" className="block mb-4">
          <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                loadEvents();
              }}
              disabled={loading}
            >
              <RefreshCw className={`ml-2 ${loading ? 'animate-spin' : ''}`} size={18} />
              רענן
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="ml-2" size={20} />
              אירוע חדש
            </Button>
          </div>
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
            events.map(event => {
              const stats = calculateEventStats(event);
              
              return (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.type === 'show' ? 'bg-pink-100 text-pink-700' :
                        event.type === 'class' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {event.type === 'show' ? 'הצגה' : 
                         event.type === 'class' ? 'חוג' : 
                         event.type === 'workshop' ? 'סדנה' : 'אירוע'}
                      </span>
                      {event.is_featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                          ⭐ מומלץ
                        </span>
                      )}
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
                      {/* אינדיקטור זמינות */}
                      {stats.availableSeats !== null && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stats.availableSeats === 0 ? 'bg-red-100 text-red-700' :
                          stats.availableSeats <= 5 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {stats.availableSeats === 0 ? '❌ אזל' :
                           stats.availableSeats <= 5 ? `⚠️ ${stats.availableSeats} נותרו` :
                           `✓ ${stats.availableSeats} מקומות`}
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
                      {event.type === 'show' && event.price_show_only && (
                        <div>
                          <span className="text-gray-500">הצגה בלבד:</span>
                          <p className="font-medium text-green-600">₪{event.price_show_only}</p>
                        </div>
                      )}
                      {event.type === 'show' && event.price_show_and_playground && (
                        <div>
                          <span className="text-gray-500">הצגה + משחקייה:</span>
                          <p className="font-medium text-green-600">₪{event.price_show_and_playground}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">רישום:</span>
                        <p className="font-medium text-blue-600">דרך האתר + תשלום</p>
                      </div>
                      {/* כרטיסים נמכרו */}
                        <div>
                        <span className="text-gray-500">כרטיסים:</span>
                        <p className="font-medium text-blue-600">
                          {stats.totalSold}
                          {event.capacity && ` / ${event.capacity}`}
                        </p>
                      </div>
                      {/* הכנסות */}
                      {stats.revenue > 0 && (
                        <div>
                          <span className="text-gray-500">הכנסות:</span>
                          <p className="font-medium text-green-600">
                            ₪{stats.revenue.toFixed(2)}
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
                      onClick={() => handleEdit(event)}
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
            );
            })
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'עריכת אירוע' : 'יצירת אירוע חדש'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'עדכן את פרטי האירוע והסנכרן ליומן Google' : 'צור אירוע חדש והוסף ליומן Google'}
              </DialogDescription>
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
                      type: e.target.value as 'class' | 'workshop' | 'event' | 'show'
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="class">חוג</option>
                    <option value="workshop">סדנה</option>
                    <option value="event">אירוע</option>
                    <option value="show">הצגה</option>
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
                      disabled={createMode !== 'single'}
                    />
                    <span className="text-sm">מפגש חוזר</span>
                  </label>
                </div>
              </div>

              {!editingEvent && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">יצירת מופעים</p>
                      <p className="text-xs text-gray-600">
                        אפשר ליצור מופע יחיד, כמה מופעים באותו יום (לפי שעות), או סדרה לפי תאריכים מסומנים.
                      </p>
                    </div>
                    <select
                      value={createMode}
                      onChange={(e) => setCreateMode(e.target.value as CreateMode)}
                      className="px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="single">מופע יחיד</option>
                      <option value="repeat_in_day">חוזר במהלך היום</option>
                      <option value="selected_dates">לפי תאריכים נבחרים</option>
                    </select>
                  </div>

                  {createMode === 'single' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">תאריך ושעת התחלה</label>
                        <input
                          type="datetime-local"
                          value={formData.start_at}
                          onChange={e => setFormData({ ...formData, start_at: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">תאריך ושעת סיום</label>
                        <input
                          type="datetime-local"
                          value={formData.end_at}
                          onChange={e => setFormData({ ...formData, end_at: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {createMode === 'repeat_in_day' && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {!repeatAcrossDays ? (
                          <div>
                            <label className="block text-sm font-medium mb-1">תאריך</label>
                            <input
                              type="date"
                              value={repeatDate}
                              onChange={(e) => setRepeatDate(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium mb-1">טווח תאריכים</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={repeatRangeStart}
                                onChange={(e) => setRepeatRangeStart(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white"
                              />
                              <input
                                type="date"
                                value={repeatRangeEnd}
                                onChange={(e) => setRepeatRangeEnd(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white"
                              />
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">בין שעה</label>
                            <input
                              type="time"
                              value={repeatFromTime}
                              onChange={(e) => setRepeatFromTime(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">עד שעה</label>
                            <input
                              type="time"
                              value={repeatToTime}
                              onChange={(e) => setRepeatToTime(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white border rounded-md p-3">
                        <div>
                          <p className="text-sm font-medium">חזרה במספר ימים בשבוע</p>
                          <p className="text-xs text-gray-600">סמן כדי להחיל את אותו הדפוס על טווח תאריכים + ימי שבוע</p>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={repeatAcrossDays}
                            onChange={(e) => setRepeatAcrossDays(e.target.checked)}
                          />
                          החל על טווח ימים
                        </label>
                      </div>

                      {repeatAcrossDays && (
                        <div className="bg-white border rounded-md p-3">
                          <p className="text-sm font-medium mb-2">ימי שבוע</p>
                          <div className="flex flex-wrap gap-2">
                            {weekdayLabels.map(({ key, label }) => (
                              <label key={key} className="flex items-center gap-2 text-sm bg-gray-50 border rounded px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={!!repeatWeekdays[key]}
                                  onChange={(e) => setRepeatWeekdays((prev) => ({ ...prev, [key]: e.target.checked }))}
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">משך מפגש (בדקות)</label>
                          <input
                            type="number"
                            min={15}
                            step={15}
                            value={repeatDurationMinutes}
                            onChange={(e) => setRepeatDurationMinutes(parseInt(e.target.value || '0'))}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">מרווח בין מפגשים (בדקות)</label>
                          <input
                            type="number"
                            min={0}
                            step={5}
                            value={repeatGapMinutes}
                            onChange={(e) => setRepeatGapMinutes(parseInt(e.target.value || '0'))}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">מספר מופעים ביום (אופציונלי)</label>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={repeatCountPerDay}
                            onChange={(e) => setRepeatCountPerDay(parseInt(e.target.value || '0'))}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                            placeholder="0 = מלא את החלון אוטומטית"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            לדוגמה: טווח 10:00–18:00 + 4 מופעים + משך 120 ⇒ 10-12, 12-14, 14-16, 16-18
                          </p>
                        </div>
                        <div className="text-xs text-gray-600 bg-white border rounded-md p-3">
                          <p className="font-medium mb-1">איך זה עובד?</p>
                          <p>אם הזנת “מספר מופעים ביום”, המערכת תיצור בדיוק N מופעים החל מהשעה הראשונה.</p>
                          <p>אם השארת 0, המערכת תמלא את הטווח לפי משך+מרווח.</p>
                        </div>
                      </div>

                      <div className="bg-white border rounded-md p-3">
                        <p className="text-sm font-medium mb-2">תצוגה מקדימה</p>
                        <div className="text-sm text-gray-700 space-y-1">
                          {(() => {
                            try {
                              const previewDate = repeatAcrossDays ? repeatRangeStart : repeatDate;
                              if (!previewDate) return <p className="text-gray-500">בחר תאריך/טווח כדי לראות מופעים</p>;

                              const start = combineDateAndTime(previewDate, repeatFromTime);
                              const end = combineDateAndTime(previewDate, repeatToTime);
                              if (new Date(start) >= new Date(end)) return <p className="text-red-600">טווח שעות לא תקין</p>;
                              const items: string[] = [];

                              if (repeatCountPerDay && repeatCountPerDay > 0) {
                                let cursor = start;
                                for (let i = 0; i < repeatCountPerDay; i++) {
                                  const occEnd = addMinutesToDateTimeLocal(cursor, repeatDurationMinutes);
                                  if (new Date(occEnd) > new Date(end)) break;
                                  items.push(`${cursor.slice(11, 16)}–${occEnd.slice(11, 16)}`);
                                  cursor = addMinutesToDateTimeLocal(occEnd, repeatGapMinutes);
                                  if (items.length > 20) break;
                                }
                              } else {
                                let cursor = start;
                                while (new Date(cursor) < new Date(end)) {
                                  const occEnd = addMinutesToDateTimeLocal(cursor, repeatDurationMinutes);
                                  if (new Date(occEnd) > new Date(end)) break;
                                  items.push(`${cursor.slice(11, 16)}–${occEnd.slice(11, 16)}`);
                                  cursor = addMinutesToDateTimeLocal(occEnd, repeatGapMinutes);
                                  if (items.length > 20) break;
                                }
                              }
                              if (items.length === 0) return <p className="text-gray-500">אין מופעים לפי ההגדרות</p>;
                              return (
                                <div className="flex flex-wrap gap-2">
                                  {items.map((t) => (
                                    <span key={t} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                      {t}
                                    </span>
                                  ))}
                                  {items.length >= 20 && (
                                    <span className="text-xs text-gray-500">... (מוצגים רק 20 ראשונים)</span>
                                  )}
                                </div>
                              );
                            } catch {
                              return <p className="text-gray-500">לא ניתן לחשב תצוגה מקדימה</p>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {createMode === 'selected_dates' && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">הוסף תאריך</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={datesInput}
                              onChange={(e) => setDatesInput(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (!datesInput) return;
                                setSelectedDates((prev) => {
                                  const next = Array.from(new Set([...prev, datesInput]));
                                  next.sort();
                                  return next;
                                });
                                setDatesInput('');
                              }}
                            >
                              הוסף
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">שעת התחלה</label>
                            <input
                              type="time"
                              value={selectedDatesStartTime}
                              onChange={(e) => setSelectedDatesStartTime(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">משך (בדקות)</label>
                            <input
                              type="number"
                              min={15}
                              step={15}
                              value={selectedDatesDurationMinutes}
                              onChange={(e) => setSelectedDatesDurationMinutes(parseInt(e.target.value || '0'))}
                              className="w-full px-3 py-2 border rounded-md bg-white"
                              placeholder="120"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border rounded-md p-3">
                        <p className="text-sm font-medium mb-2">תאריכים שנבחרו</p>
                        {selectedDates.length === 0 ? (
                          <p className="text-sm text-gray-500">עדיין לא נוספו תאריכים</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedDates.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setSelectedDates((prev) => prev.filter((x) => x !== d))}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                title="לחץ להסרה"
                              >
                                {new Date(d).toLocaleDateString('he-IL')} ×
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedDates.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            ייווצר מופע לכל תאריך בשעה {selectedDatesStartTime} למשך {selectedDatesDurationMinutes} דקות.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingEvent && (
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
              )}

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

                {formData.type !== 'show' && (
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
                )}
              </div>

              {/* שדות מיוחדים להצגות */}
              {formData.type === 'show' && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3 text-pink-700">הגדרות הצגה</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">תמונת באנר להצגה</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setUploadingImage(true);
                            
                            try {
                              // Create unique filename
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                              
                              // Upload to Supabase Storage
                              const { data, error } = await supabase.storage
                                .from('show-images')
                                .upload(fileName, file);
                              
                              if (error) {
                                console.error('Error uploading image:', error);
                                alert('שגיאה בהעלאת התמונה');
                                return;
                              }
                              
                              // Get public URL
                              const { data: { publicUrl } } = supabase.storage
                                .from('show-images')
                                .getPublicUrl(fileName);
                              
                              setFormData({...formData, banner_image_url: publicUrl});
                            } catch (err) {
                              console.error('Upload error:', err);
                              alert('שגיאה בהעלאת התמונה');
                            } finally {
                              setUploadingImage(false);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          disabled={uploadingImage}
                        />
                        {uploadingImage && <p className="text-sm text-gray-600 mt-1">מעלה תמונה...</p>}
                        {formData.banner_image_url && (
                          <div className="mt-2">
                            <img 
                              src={formData.banner_image_url} 
                              alt="תצוגה מקדימה" 
                              className="w-full h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">מחיר כרטיס להצגה בלבד (₪)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={formData.price_show_only}
                            onChange={(e) => setFormData({
                              ...formData, 
                              price_show_only: e.target.value
                            })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="50"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">מחיר כרטיס להצגה + כניסה לג׳ימבורי (₪)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={formData.price_show_and_playground}
                            onChange={(e) => setFormData({
                              ...formData, 
                              price_show_and_playground: e.target.value
                            })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="80"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.is_featured}
                              onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                              className="ml-2"
                            />
                            <span className="text-sm font-medium">מסומן כבולט בדף הבית ⭐</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">מועד אחרון לביטול (שעות לפני)</label>
                          <input 
                            type="number" 
                            value={formData.cancellation_deadline_hours}
                            onChange={(e) => setFormData({
                              ...formData, 
                              cancellation_deadline_hours: parseInt(e.target.value) || 24
                            })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="24"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                disabled={
                  !formData.title ||
                  (createMode === 'single' && !editingEvent && (!formData.start_at || !formData.end_at)) ||
                  (editingEvent && (!formData.start_at || !formData.end_at)) ||
                  (createMode === 'repeat_in_day' && ((!repeatAcrossDays && !repeatDate) || (repeatAcrossDays && (!repeatRangeStart || !repeatRangeEnd)))) ||
                  (createMode === 'selected_dates' && selectedDates.length === 0)
                }
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
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                רשימת נרשמים - {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription>
                צפייה ברשימת הנרשמים לאירוע ופרטי קשר שלהם
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedEvent?.registrations && selectedEvent.registrations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">סך נרשמים</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedEvent.registrations.filter(r => r.status === 'confirmed').length}
                        </p>
                      </div>
                      {selectedEvent.capacity && (
                        <div className="text-left">
                          <p className="text-sm text-gray-600">מקומות פנויים</p>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedEvent.capacity - selectedEvent.registrations.filter(r => r.status === 'confirmed').length}
                          </p>
                        </div>
                      )}
                      <div className="text-left">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedEvent && exportToCSV(selectedEvent)}
                          className="bg-green-50 hover:bg-green-100"
                        >
                          📥 ייצוא לאקסל
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-3 text-right text-sm font-semibold">#</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">שם</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">טלפון</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">אימייל</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">סוג כרטיס</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">סטטוס</th>
                          <th className="px-3 py-3 text-right text-sm font-semibold">תאריך רישום</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedEvent.registrations.map((registration, index) => (
                          <tr key={registration.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-gray-600">{index + 1}</td>
                            <td className="px-3 py-3 font-medium">
                              {registration.user?.full_name || 'לא ידוע'}
                            </td>
                            <td className="px-3 py-3 text-gray-600 text-sm">
                              {registration.user?.phone || '-'}
                            </td>
                            <td className="px-3 py-3 text-gray-600 text-sm">
                              {registration.user?.email || '-'}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                registration.ticket_type === 'show_only' ? 'bg-purple-100 text-purple-800' :
                                registration.ticket_type === 'show_and_playground' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {registration.ticket_type === 'show_only' ? 'הצגה בלבד' :
                                 registration.ticket_type === 'show_and_playground' ? 'הצגה + משחקייה' :
                                 registration.ticket_type || 'רגיל'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
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
                            <td className="px-3 py-3 text-sm text-gray-600">
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

