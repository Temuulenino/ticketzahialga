import Link from 'next/link'
import { Ticket, Github, Twitter, Instagram, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative border-t border-black/8 dark:border-white/8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Брэнд */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Ticket size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">TicketPro</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed">
              Концерт, үзвэр, музей болон шууд тоглолтын тасалбарын премиум платформ.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all border border-black/8 dark:border-white/8 hover:border-black/20 dark:hover:border-white/20"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Холбоосууд */}
          {[
            {
              title: 'Судлах',
              links: [
                { label: 'Бүх арга хэмжээ', href: '/events' },
                { label: 'Концерт', href: '/concerts' },
                { label: 'Үзвэр', href: '/entertainment' },
                { label: 'Музей', href: '/museums' },
                { label: 'Наадам', href: '/events?category_type=festival' },
              ],
            },
            {
              title: 'Бүртгэл',
              links: [
                { label: 'Нэвтрэх', href: '/login' },
                { label: 'Бүртгүүлэх', href: '/register' },
                { label: 'Миний профайл', href: '/profile' },
                { label: 'Миний захиалгууд', href: '/profile?tab=bookings' },
                { label: 'Тохиргоо', href: '/settings' },
              ],
            },
            {
              title: 'Компани',
              links: [
                { label: 'Бидний тухай', href: '#' },
                { label: 'Холбоо барих', href: '#' },
                { label: 'Нууцлалын бодлого', href: '#' },
                { label: 'Үйлчилгээний нөхцөл', href: '#' },
                { label: 'Тусламж', href: '#' },
              ],
            },
          ].map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-black/8 dark:border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 dark:text-white/30">
            © {new Date().getFullYear()} TicketPro. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <p className="text-sm text-slate-400 dark:text-white/30">
            Шууд тоглолтын хайрыг дэлгэрүүлж байна ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}
