import Link from 'next/link'
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react'
import { generateWhatsAppLink } from '@/lib/utils'

const footerLinks = {
  main: [
    { name: 'משחקייה', href: '/playground' },
    { name: 'אירועים וימי הולדת', href: '/events' },
    { name: 'סדנאות', href: '/workshops' },
    { name: 'תפריט', href: '/menu' },
    { name: 'גלריה', href: '/gallery' },
  ],
  legal: [
    { name: 'תנאי שימוש', href: '/terms' },
    { name: 'מדיניות פרטיות', href: '/privacy' },
    { name: 'מדיניות עוגיות', href: '/cookies' },
  ],
}

const contactInfo = {
  phone: '050-123-4567',
  phoneRaw: '972501234567',
  email: 'info@coffeeland.co.il',
  address: 'רחוב הקפה 123, תל אביב',
  hours: 'ראשון-חמישי: 09:00-19:00 | שישי-שבת: 09:00-15:00',
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
              מקום חם ומזמין למשפחות. משחקייה בטוחה לילדים, קפה איכותי, ימי הולדת
              בלתי נשכחים וסדנאות יצירתיות.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">קישורים מהירים</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href}>
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
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-dark/70">
            <p>© {new Date().getFullYear()} CoffeeLand. כל הזכויות שמורות.</p>
            <p>
              נבנה ב
              <span className="text-accent mx-1">❤️</span>
              למשפחות
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

