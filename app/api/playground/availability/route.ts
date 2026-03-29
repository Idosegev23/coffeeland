import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

const ENTRY_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

interface TimeSlot {
  start: string; // HH:MM
  end: string;
  active: number; // people currently inside
  max: number;
  blocked: boolean;
  blockReason?: string;
  showTitle?: string;
}

/**
 * GET /api/playground/availability?date=2026-03-29
 * Returns playground availability for a given date (default: today)
 */
export async function GET(req: NextRequest) {
  const supabase = getServiceClient();
  const dateParam = req.nextUrl.searchParams.get('date');
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const dayOfWeek = targetDate.getDay(); // 0=Sun, 6=Sat

  // Get settings
  const [{ data: hoursRow }, { data: capacityRow }] = await Promise.all([
    supabase.from('venue_settings').select('value').eq('key', 'business_hours').single(),
    supabase.from('venue_settings').select('value').eq('key', 'playground_capacity').single(),
  ]);

  const businessHours = hoursRow?.value as Record<string, { open: string; close: string } | null>;
  const capacity = capacityRow?.value as {
    max_concurrent: number;
    entry_duration_minutes: number;
    show_buffer_before_minutes: number;
    show_block_duration_minutes: number;
  };

  const todayHours = businessHours?.[String(dayOfWeek)];
  if (!todayHours) {
    return NextResponse.json({ closed: true, slots: [], message: 'סגור היום' });
  }

  const maxConcurrent = capacity?.max_concurrent || 25;
  const showBufferBefore = capacity?.show_buffer_before_minutes || 30;
  const showBlockDuration = capacity?.show_block_duration_minutes || 120;

  // Build 2-hour slots for the day
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const slots: TimeSlot[] = [];

  let slotStart = openH * 60 + openM;
  const dayEnd = closeH * 60 + closeM;

  while (slotStart < dayEnd) {
    const slotEnd = Math.min(slotStart + 120, dayEnd);
    const startStr = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
    const endStr = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;
    slots.push({
      start: startStr,
      end: endStr,
      active: 0,
      max: maxConcurrent,
      blocked: false,
    });
    slotStart = slotEnd;
  }

  // Get today's date range in UTC
  const dateStr = targetDate.toISOString().split('T')[0];
  const dayStartUTC = `${dateStr}T${todayHours.open}:00+03:00`; // Israel timezone
  const dayEndUTC = `${dateStr}T${todayHours.close}:00+03:00`;

  // Get shows for today (block playground)
  const { data: shows } = await supabase
    .from('events')
    .select('id, title, start_at, end_at')
    .eq('type', 'show')
    .eq('status', 'active')
    .gte('start_at', dayStartUTC)
    .lte('start_at', dayEndUTC);

  // Mark slots blocked by shows
  if (shows) {
    for (const show of shows) {
      const showStart = new Date(show.start_at);
      // Block from (show_start - buffer) to (show_start + block_duration)
      const blockFrom = new Date(showStart.getTime() - showBufferBefore * 60 * 1000);
      const blockUntil = new Date(showStart.getTime() + showBlockDuration * 60 * 1000);

      for (const slot of slots) {
        const slotStartDate = new Date(`${dateStr}T${slot.start}:00+03:00`);
        const slotEndDate = new Date(`${dateStr}T${slot.end}:00+03:00`);

        // Slot overlaps with show block window
        if (slotStartDate < blockUntil && slotEndDate > blockFrom) {
          slot.blocked = true;
          slot.blockReason = 'show';
          slot.showTitle = show.title;
        }
      }
    }
  }

  // Count active playground entries per slot
  // An entry is "active" if used_at is within 2 hours before the slot end
  const { data: usages } = await supabase
    .from('pass_usages')
    .select('used_at')
    .gte('used_at', dayStartUTC)
    .lte('used_at', dayEndUTC);

  if (usages) {
    for (const slot of slots) {
      const slotStartDate = new Date(`${dateStr}T${slot.start}:00+03:00`);
      const slotEndDate = new Date(`${dateStr}T${slot.end}:00+03:00`);

      slot.active = usages.filter(u => {
        const entryTime = new Date(u.used_at);
        const exitTime = new Date(entryTime.getTime() + ENTRY_DURATION_MS);
        // Entry overlaps with this slot
        return entryTime < slotEndDate && exitTime > slotStartDate;
      }).length;
    }
  }

  // Calculate "right now" info
  const now = new Date();
  const nowIsrael = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const nowMinutes = nowIsrael.getHours() * 60 + nowIsrael.getMinutes();

  // Count people inside RIGHT NOW (entries within last 2 hours)
  const twoHoursAgo = new Date(now.getTime() - ENTRY_DURATION_MS).toISOString();
  const { data: currentUsages } = await supabase
    .from('pass_usages')
    .select('used_at')
    .gte('used_at', twoHoursAgo);

  const currentOccupancy = currentUsages?.length || 0;

  // Check if NOW is blocked by a show
  let currentlyBlocked = false;
  let currentBlockReason = '';
  if (shows) {
    for (const show of shows) {
      const showStart = new Date(show.start_at);
      const blockFrom = new Date(showStart.getTime() - showBufferBefore * 60 * 1000);
      const blockUntil = new Date(showStart.getTime() + showBlockDuration * 60 * 1000);
      if (now >= blockFrom && now <= blockUntil) {
        currentlyBlocked = true;
        currentBlockReason = `הצגה: ${show.title}`;
      }
    }
  }

  // Find next show for warning
  let nextShow: { title: string; startsAt: string; blockFrom: string } | null = null;
  if (shows) {
    const upcoming = shows
      .filter(s => new Date(s.start_at) > now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    if (upcoming.length > 0) {
      const s = upcoming[0];
      const showStart = new Date(s.start_at);
      nextShow = {
        title: s.title,
        startsAt: s.start_at,
        blockFrom: new Date(showStart.getTime() - showBufferBefore * 60 * 1000).toISOString(),
      };
    }
  }

  // Calculate max time available right now
  let maxMinutesAvailable = 120;
  if (shows) {
    for (const show of shows) {
      const showStart = new Date(show.start_at);
      const blockFrom = new Date(showStart.getTime() - showBufferBefore * 60 * 1000);
      if (blockFrom > now) {
        const minutesUntilBlock = Math.floor((blockFrom.getTime() - now.getTime()) / 60000);
        maxMinutesAvailable = Math.min(maxMinutesAvailable, minutesUntilBlock);
      }
    }
    // Also check closing time
    const closingToday = new Date(`${dateStr}T${todayHours.close}:00+03:00`);
    if (closingToday > now) {
      const minutesUntilClose = Math.floor((closingToday.getTime() - now.getTime()) / 60000);
      maxMinutesAvailable = Math.min(maxMinutesAvailable, minutesUntilClose);
    }
  }

  return NextResponse.json({
    closed: false,
    date: dateStr,
    businessHours: todayHours,
    currentOccupancy,
    maxConcurrent,
    availableNow: currentlyBlocked ? 0 : Math.max(0, maxConcurrent - currentOccupancy),
    currentlyBlocked,
    currentBlockReason,
    maxMinutesAvailable,
    nextShow,
    slots,
  });
}
