'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PartyPopper, Gift, Music, Utensils, Gamepad2, Star, Check, Send, Phone } from 'lucide-react'

const packages = [
  {
    name: 'חבילה בסיסית',
    price: 89,
    priceLabel: '₪89 לילד',
    features: [
      'כניסה למשחקייה (2 שעות)',
      'כיבוד קל (פיצה + שתייה)',
      'שולחן מעוצב ליום הולדת',
      'מוזיקת רקע',
    ],
    highlight: false,
  },
  {
    name: 'חבילת פרימיום',
    price: 129,
    priceLabel: '₪129 לילד',
    features: [
      'כניסה למשחקייה (3 שעות)',
      'כיבוד מלא (פיצה + נקניקיות + שתייה)',
      'עוגת יום הולדת',
      'שולחן מעוצב + בלונים',
      'מוזיקה + תאורה',
      'מנחה פעילות (30 דקות)',
    ],
    highlight: true,
  },
  {
    name: 'חבילת דלוקס',
    price: 169,
    priceLabel: '₪169 לילד',
    features: [
      'כניסה למשחקייה (4 שעות)',
      'כיבוד פרימיום + עוגה מעוצבת',
      'שולחן מעוצב + בלונים + קישוטים',
      'מוזיקה + תאורה + מכונת בועות',
      'מנחה פעילות (שעה)',
      'שקיות הפתעה לילדים',
      'צילום מקצועי',
    ],
    highlight: false,
  },
]

const included = [
  { icon: Gamepad2, text: 'משחקייה מאובזרת ובטיחותית' },
  { icon: Utensils, text: 'כיבוד איכותי ומגוון' },
  { icon: Music, text: 'מוזיקה ותאורת אווירה' },
  { icon: Gift, text: 'קישוטים ובלונים' },
  { icon: Star, text: 'צוות מקצועי ואדיב' },
  { icon: PartyPopper, text: 'חוויה בלתי נשכחת!' },
]

const galleryImages = [
  '/images/untitled-10.webp',
  '/images/untitled-20.webp',
  '/images/untitled-30.webp',
  '/images/untitled-40.webp',
  '/images/untitled-50.webp',
  '/images/untitled-60.webp',
]

export default function BirthdayPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    kids_count: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/contact/birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kids_count: parseInt(form.kids_count) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה בשליחה')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת הטופס')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={400} height={400} className="absolute top-10 left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={350} height={350} className="absolute bottom-20 right-10 -rotate-12" />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4C2C21]/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
            ימי הולדת ב-CoffeeLand
          </h1>
          <p className="text-xl sm:text-2xl text-secondary max-w-2xl mx-auto mb-8">
            חגיגות בלתי נשכחות לילדים
          </p>
          <p className="text-lg text-text-light/70 max-w-xl mx-auto">
            תנו לילדים שלכם את חגיגת יום ההולדת המושלמת במתחם המשחק והבילוי הכי מגניב באזור!
          </p>
          <div className="mt-8">
            <Button size="xl" asChild>
              <a href="#contact">השאירו פרטים</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4">
            החבילות שלנו
          </h2>
          <p className="text-center text-text-light/70 mb-12 max-w-lg mx-auto">
            בחרו את החבילה המתאימה לכם - כל חבילה ניתנת להתאמה אישית
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-0 overflow-hidden transition-transform hover:-translate-y-1 ${
                  pkg.highlight ? 'ring-2 ring-accent shadow-lg relative' : ''
                }`}
              >
                {pkg.highlight && (
                  <div className="bg-accent text-white text-center py-1.5 text-sm font-medium">
                    הכי פופולרי
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <p className="text-3xl font-bold text-accent mt-2">{pkg.priceLabel}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-text-light">
                        <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button
                      size="lg"
                      variant={pkg.highlight ? 'default' : 'outline'}
                      className="w-full"
                      asChild
                    >
                      <a href="#contact">הזמינו עכשיו</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-12">
            מה כולל יום הולדת אצלנו?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {included.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-4 p-4 bg-background-light rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none border border-border"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-lg font-medium text-primary">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-12">
            גלריה
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`CoffeeLand birthday ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4">
              השאירו פרטים
            </h2>
            <p className="text-center text-text-light/70 mb-8">
              מלאו את הטופס ונחזור אליכם בהקדם לתיאום המסיבה המושלמת
            </p>

            {submitted ? (
              <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">הפרטים נשלחו בהצלחה!</h3>
                <p className="text-text-light/70">ניצור איתכם קשר בהקדם לתיאום</p>
              </Card>
            ) : (
              <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        שם מלא *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors"
                        placeholder="ישראל ישראלי"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        טלפון *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors"
                        placeholder="050-1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">
                      אימייל
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        תאריך מבוקש *
                      </label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        מספר ילדים *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={form.kids_count}
                        onChange={(e) => setForm({ ...form, kids_count: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">
                      הערות / בקשות מיוחדות
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none border-2 border-border bg-background-light text-text-light focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="ספרו לנו על בקשות מיוחדות, אלרגיות וכו׳..."
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="xl"
                    className="w-full gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>שולח...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        שלחו פנייה
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-border text-center">
                  <p className="text-sm text-text-light/70 mb-2">או התקשרו ישירות:</p>
                  <a
                    href="tel:052-5636067"
                    className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    052-5636067
                  </a>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
