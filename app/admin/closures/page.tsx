'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Lock, Plus, Trash2, Loader2, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface Closure {
  id: string;
  closure_date: string;
  is_full_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  holiday_name: string | null;
  hebcal_category: string | null;
  created_at: string;
}

interface Holiday {
  date: string;
  title: string;
  title_en: string;
  category: string;
  subcat: string | null;
  is_yom_tov: boolean;
}

const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const HE_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ClosuresPage() {
  const toast = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [closures, setClosures] = useState<Closure[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Dialog state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('18:30');
  const [reason, setReason] = useState('');
  const [holidayName, setHolidayName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const from = isoDate(new Date(year, month, 1));
      const to = isoDate(new Date(year, month + 1, 0));
      const [cRes, hRes] = await Promise.all([
        fetch(`/api/admin/closures?from=${from}&to=${to}`),
        fetch(`/api/admin/closures/hebcal?year=${year}&month=${month + 1}`),
      ]);
      const cJson = await cRes.json();
      const hJson = await hRes.json();
      setClosures(cJson.closures || []);
      setHolidays(hJson.holidays || []);
    } catch (e) {
      console.error(e);
      toast('שגיאה בטעינת נתונים', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // Map by date
  const closuresByDate = useMemo(() => {
    const map: Record<string, Closure[]> = {};
    for (const c of closures) {
      (map[c.closure_date] ||= []).push(c);
    }
    return map;
  }, [closures]);

  const holidaysByDate = useMemo(() => {
    const map: Record<string, Holiday[]> = {};
    for (const h of holidays) {
      (map[h.date] ||= []).push(h);
    }
    return map;
  }, [holidays]);

  // Build calendar grid
  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlank = firstOfMonth.getDay(); // 0=Sunday
    const arr: Array<{ date: Date | null; iso: string | null }> = [];
    for (let i = 0; i < leadingBlank; i++) arr.push({ date: null, iso: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      arr.push({ date, iso: isoDate(date) });
    }
    while (arr.length % 7 !== 0) arr.push({ date: null, iso: null });
    return arr;
  }, [year, month]);

  const handleOpenDay = (iso: string) => {
    setSelectedDate(iso);
    setIsFullDay(true);
    setStartTime('16:30');
    setEndTime('18:30');
    setReason('');
    // Auto-suggest holiday name if exists
    const h = holidaysByDate[iso]?.[0];
    setHolidayName(h?.title || '');
  };

  const handleAddClosure = async () => {
    if (!selectedDate) return;
    if (!isFullDay) {
      if (!startTime || !endTime) {
        toast('יש להזין שעות התחלה וסיום', 'error');
        return;
      }
      if (startTime >= endTime) {
        toast('שעת הסיום חייבת להיות אחרי שעת ההתחלה', 'error');
        return;
      }
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closure_date: selectedDate,
          is_full_day: isFullDay,
          start_time: isFullDay ? null : startTime,
          end_time: isFullDay ? null : endTime,
          reason: reason || null,
          holiday_name: holidayName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה');
      toast('סגירה נוספה בהצלחה', 'success');
      setSelectedDate(null);
      await loadAll();
    } catch (e: any) {
      toast('שגיאה: ' + (e?.message || ''), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק סגירה זו?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/closures?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה');
      toast('סגירה נמחקה', 'success');
      await loadAll();
    } catch (e: any) {
      toast('שגיאה במחיקה: ' + (e?.message || ''), 'error');
    } finally {
      setBusy(false);
    }
  };

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  const formatTime = (t: string | null) => (t ? t.slice(0, 5) : '');

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin"><ArrowRight className="w-4 h-4 ml-1" /> חזרה</Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <CalendarDays className="w-7 h-7" /> סגירות וונאו
          </h1>
        </div>

        <p className="text-text-light/70 mb-6">
          סגרי ימים שלמים או חלונות שעות. בלוח השנה מסומנים גם החגים והאירועים היהודיים מ-Hebcal — לחיצה על יום פותחת חלון להוספת סגירה.
        </p>

        {/* Month nav */}
        <Card className="p-4 mb-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goPrev}>← חודש קודם</Button>
          <div className="text-xl font-bold text-primary">
            {HE_MONTHS[month]} {year}
          </div>
          <Button variant="outline" size="sm" onClick={goNext}>חודש הבא →</Button>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-accent" />
            <p className="text-text-light/70 mt-2">טוען...</p>
          </div>
        ) : (
          <>
            {/* Calendar */}
            <Card className="p-3 sm:p-4 mb-6">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {HE_WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs sm:text-sm font-semibold text-text-light/70 py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((cell, idx) => {
                  if (!cell.date || !cell.iso) {
                    return <div key={idx} className="aspect-square" />;
                  }
                  const isToday = cell.iso === isoDate(new Date());
                  const dayClosures = closuresByDate[cell.iso] || [];
                  const dayHolidays = holidaysByDate[cell.iso] || [];
                  const isFullClosed = dayClosures.some(c => c.is_full_day);
                  const hasPartialClosure = !isFullClosed && dayClosures.length > 0;
                  const hasHoliday = dayHolidays.length > 0;
                  const isMajorHoliday = dayHolidays.some(h => h.is_yom_tov);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOpenDay(cell.iso!)}
                      className={`relative aspect-square rounded-lg border-2 text-right p-1.5 sm:p-2 transition-all hover:shadow-md ${
                        isFullClosed
                          ? 'bg-red-50 border-red-300 hover:border-red-400'
                          : hasPartialClosure
                            ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                            : isMajorHoliday
                              ? 'bg-purple-50 border-purple-300 hover:border-purple-400'
                              : hasHoliday
                                ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                : 'bg-white border-gray-200 hover:border-accent'
                      } ${isToday ? 'ring-2 ring-accent' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="text-base sm:text-lg font-bold">
                          {cell.date.getDate()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {isFullClosed && <Lock className="w-3 h-3 text-red-600" />}
                          {hasPartialClosure && <Lock className="w-3 h-3 text-amber-600" />}
                          {isMajorHoliday && <Star className="w-3 h-3 text-purple-600" />}
                        </div>
                      </div>
                      {hasHoliday && (
                        <div className="text-[10px] sm:text-xs text-text-light/80 line-clamp-2 mt-1 text-right">
                          {dayHolidays[0].title}
                        </div>
                      )}
                      {isFullClosed && (
                        <div className="text-[10px] sm:text-xs text-red-700 font-semibold mt-1">סגור</div>
                      )}
                      {hasPartialClosure && (
                        <div className="text-[9px] sm:text-[10px] text-amber-700 mt-1 truncate">
                          {dayClosures
                            .filter(c => !c.is_full_day)
                            .map(c => `${formatTime(c.start_time)}-${formatTime(c.end_time)}`)
                            .join(', ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-light/70 border-t pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> סגור יום שלם
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> סגירת שעות
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-100 border border-purple-300" /> חג עיקרי
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> אירוע יהודי
                </span>
              </div>
            </Card>

            {/* Existing closures list */}
            <Card className="p-4">
              <h2 className="font-bold text-primary mb-3">סגירות בחודש זה</h2>
              {closures.length === 0 ? (
                <p className="text-text-light/60 text-sm">אין סגירות בחודש זה.</p>
              ) : (
                <ul className="space-y-2">
                  {closures.map(c => (
                    <li key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background-light">
                      <div className="flex items-center gap-2">
                        <Lock className={`w-4 h-4 ${c.is_full_day ? 'text-red-600' : 'text-amber-600'}`} />
                        <div>
                          <div className="font-semibold">
                            {new Date(c.closure_date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                            {!c.is_full_day && ` · ${formatTime(c.start_time)}-${formatTime(c.end_time)}`}
                            {c.is_full_day && ' · יום שלם'}
                          </div>
                          {(c.reason || c.holiday_name) && (
                            <div className="text-xs text-text-light/70">
                              {c.holiday_name && <span className="font-medium">{c.holiday_name}</span>}
                              {c.holiday_name && c.reason && ' · '}
                              {c.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(c.id)}
                        disabled={busy}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}

        {/* Add closure dialog */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDate(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-primary">סגירת תאריך</h3>
              </div>

              <p className="text-sm text-text-light/70 mb-4">
                {new Date(selectedDate).toLocaleDateString('he-IL', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>

              {/* Holiday hint */}
              {holidaysByDate[selectedDate]?.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="flex items-center gap-1 text-blue-800 font-semibold mb-1">
                    <Star className="w-3 h-3" /> חגים/אירועים בתאריך זה
                  </div>
                  <ul className="text-blue-700 text-xs space-y-0.5">
                    {holidaysByDate[selectedDate].map((h, i) => (
                      <li key={i}>{h.title} {h.is_yom_tov && '(יו"ט)'}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Existing closures on this date */}
              {closuresByDate[selectedDate]?.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <div className="flex items-center gap-1 text-amber-800 font-semibold mb-1">
                    <AlertCircle className="w-3 h-3" /> כבר קיימות סגירות:
                  </div>
                  <ul className="text-amber-700 text-xs space-y-0.5">
                    {closuresByDate[selectedDate].map(c => (
                      <li key={c.id}>
                        {c.is_full_day ? 'יום שלם' : `${formatTime(c.start_time)}-${formatTime(c.end_time)}`}
                        {c.reason && ` — ${c.reason}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Type toggle */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary mb-2">סוג סגירה</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullDay(true)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium ${
                      isFullDay ? 'bg-accent text-white border-accent' : 'bg-white border-gray-300'
                    }`}
                  >
                    יום שלם
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullDay(false)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium ${
                      !isFullDay ? 'bg-accent text-white border-accent' : 'bg-white border-gray-300'
                    }`}
                  >
                    חלון שעות
                  </button>
                </div>
              </div>

              {/* Hours */}
              {!isFullDay && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">משעה</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">עד שעה</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Holiday name */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">שם חג (אופציונלי)</label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={e => setHolidayName(e.target.value)}
                  placeholder="למשל: יום העצמאות, יום כיפור"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">סיבה (אופציונלי)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  placeholder="למשל: ערב חג, אירוע פרטי, תחזוקה"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddClosure} disabled={busy} className="flex-1 gap-1">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  הוסף סגירה
                </Button>
                <Button variant="outline" onClick={() => setSelectedDate(null)} disabled={busy} className="flex-1">
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
