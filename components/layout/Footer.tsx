import Link from 'next/link'
import Image from 'next/image'
import { Phone, MessageCircle, MapPin, Mail, Shield } from 'lucide-react'
import { generateWhatsAppLink } from '@/lib/utils'

const footerLinks = {
  main: [
    { name: 'משחקייה', href: '/playground' },
    { name: 'אירועים וימי הולדת', href: '/events' },
    { name: 'סדנאות וחוגים', href: '/workshops' },
    { name: 'תפריט', href: '/menu' },
    { name: 'כרטיסיות', href: '/passes' },
  ],
  legal: [
    { name: 'מסמכים משפטיים', href: '/legal' },
    { name: 'תנאי שימוש', href: '/legal' },
    { name: 'מדיניות פרטיות', href: '/legal#privacy' },
    { name: 'מדיניות ביטולים', href: '/legal#cancellation' },
  ],
}

const contactInfo = {
  phone: '052-5636067',
  phoneRaw: '972525636067',
  email: 'coffeeland256@gmail.com',
  address: 'גבע 2, אשקלון',
  hours: 'א׳-ה׳: 07:30-21:00 | ו׳: 07:30-15:00 | ש׳: סגור',
}

export function Footer() {
  const whatsappLink = generateWhatsAppLink(
    contactInfo.phoneRaw,
    'שלום, אני מעוניין/ת לקבל מידע נוסף על CoffeeLand'
  )

  return (
    <footer className="bg-primary text-text-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">אודות CoffeeLand</h3>
            <p className="text-sm text-text-dark/80 leading-relaxed">
              בית קפה משפחתי עם משחקייה לגיל הרך (0-5). קפה איכותי, משחקייה בטוחה,
              ימי הולדת בלתי נשכחים, סדנאות וחוגים יצירתיים.
            </p>
            {/* Security Badge */}
            <div className="flex items-center gap-2 pt-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs text-text-dark/70">
                אתר מאובטח | סליקה דרך ישראכרט
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">קישורים מהירים</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-dark/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">צור קשר</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="text-text-dark/80 hover:text-accent transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-dark/80 hover:text-accent transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-text-dark/80 hover:text-accent transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-text-dark/80">{contactInfo.address}</span>
              </li>
            </ul>
          </div>

          {/* Hours & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">שעות פעילות</h3>
            <p className="text-sm text-text-dark/80 leading-relaxed">
              {contactInfo.hours}
            </p>
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-accent mb-2">משפטי</h4>
              <ul className="space-y-1">
                {footerLinks.legal.map((link, index) => (
                  <li key={link.href + index}>
                    <Link
                      href={link.href}
                      className="text-xs text-text-dark/70 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-text-dark/20">
          <div className="flex flex-col items-center gap-4 text-sm text-text-dark/70">
            {/* Built with love - CENTERED */}
            <div className="flex items-center gap-2 justify-center">
              <p>נבנה באהבה על ידי</p>
              <Link
                href="https://www.2-create.co.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="2Create - בניית אתרים"
              >
                <Image
                  src="/2create-logo.webp"
                  alt="2Create Logo"
                  width={80}
                  height={24}
                  className="h-6 w-auto"
                />
              </Link>
            </div>
            {/* Copyright */}
            <p className="text-center">
              © {new Date().getFullYear()} CoffeeLand Club. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
