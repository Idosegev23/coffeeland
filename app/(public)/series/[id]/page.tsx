'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface SeriesData {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'workshop';
  series_price: number;
  per_session_price?: number;
  total_sessions: number;
  capacity?: number;
  min_age?: number;
  max_age?: number;
  banner_image_url?: string;
  instructor?: { id: string; name: string };
  room?: { id: string; name: string };
  events: Array<{
    id: string;
    start_at: string;
    end_at: string;
    series_order: number;
  }>;
  active_registrations_count: number;
  available_spots: number | null;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadSeries = async () => {
    try {
      const res = await fetch(`/api/series/${params.id}`);
      if (!res.ok) throw new Error('Series not found');
      const data = await res.json();
      setSeries(data.series);
    } catch (err) {
      setError('הסדרה לא נמצאה');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    const checkoutParams = new URLSearchParams({
      item: series!.id,
      type: 'series',
    });
    router.push(`/checkout?${checkoutParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-text-light">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild>
            <Link href="/events">חזרה לאירועים</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isFull = series.available_spots !== null && series.available_spots <= 0;
  const almostFull = series.available_spots !== null && series.available_spots <= 5 && series.available_spots > 0;
  const futureEvents = series.events.filter(
    (ev) => new Date(ev.start_at) >= new Date()
  );

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6"
        >
          <Link href="/events" className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Link>
        </Button>

        {/* Banner */}
        {series.banner_image_url && (
          <div className="relative w-full h-64 md:h-80 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden mb-6">
            <Image
              src={series.banner_image_url}
              alt={series.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={series.type === 'class' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                  {series.type === 'class' ? 'חוג' : 'סדנה'}
                </Badge>
                {almostFull && (
                  <Badge className="bg-red-100 text-red-700">
                    נותרו {series.available_spots} מקומות!
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-primary mb-3">{series.title}</h1>
              {series.description && (
                <p className="text-text-light/80 text-lg leading-relaxed whitespace-pre-line">
                  {series.description}
                </p>
              )}
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              {series.instructor && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-text-light/60 mb-1">מדריך/ה</p>
                  <p className="font-medium text-primary">{series.instructor.name}</p>
                </div>
              )}
              <div className="bg-white rounded-lg p-4 border">
                <p className="text-xs text-text-light/60 mb-1">מספר מפגשים</p>
                <p className="font-medium text-primary">{series.total_sessions} מפגשים</p>
              </div>
              {series.min_age && series.max_age && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-text-light/60 mb-1">גילאים</p>
                  <p className="font-medium text-primary">{series.min_age}-{series.max_age}</p>
                </div>
              )}
              {series.capacity && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-text-light/60 mb-1">מקומות</p>
                  <p className="font-medium text-primary">
                    {series.available_spots !== null
                      ? `${series.available_spots} פנויים מתוך ${series.capacity}`
                      : `עד ${series.capacity} משתתפים`}
                  </p>
                </div>
              )}
            </div>

            {/* Session schedule */}
            <Card className="p-5">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                לוח מפגשים
              </h2>
              <div className="space-y-2">
                {series.events.map((ev) => {
                  const isPast = new Date(ev.start_at) < new Date();
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isPast ? 'bg-gray-50 opacity-60' : 'bg-accent/5'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                        {ev.series_order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-primary">
                          {formatDate(ev.start_at)}
                        </p>
                        <p className="text-xs text-text-light/60">
                          {formatTime(ev.start_at)} - {formatTime(ev.end_at)}
                        </p>
                      </div>
                      {isPast && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar - Price & Register */}
          <div>
            <Card className="p-5 sticky top-4 space-y-4">
              <div>
                <p className="text-xs text-text-light/60 mb-1">מחיר לסדרה</p>
                <p className="text-4xl font-bold text-accent">
                  ₪{series.series_price}
                </p>
                <p className="text-sm text-text-light/60">
                  {series.total_sessions} מפגשים
                </p>
              </div>

              {series.per_session_price && series.per_session_price > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-text-light/60 mb-1">או: מפגש בודד (דרופ-אין)</p>
                  <p className="text-xl font-bold text-text-light/70">
                    ₪{series.per_session_price}
                  </p>
                </div>
              )}

              {futureEvents.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-text-light/80">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>
                      מפגש הבא: {formatDate(futureEvents[0].start_at)}
                    </span>
                  </div>
                </div>
              )}

              {series.capacity && (
                <div className="flex items-center gap-2 text-sm text-text-light/80">
                  <Users className="w-4 h-4 text-accent" />
                  <span className={isFull ? 'font-bold text-red-500' : ''}>
                    {isFull
                      ? 'אין מקומות פנויים'
                      : `${series.available_spots} מקומות פנויים`}
                  </span>
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={isFull}
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
              >
                <BookOpen className="w-5 h-5 ml-2" />
                {isFull ? 'אין מקומות פנויים' : 'הרשמה ותשלום'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
