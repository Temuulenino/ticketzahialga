from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
from apps.events.models import Category, Event, TicketType
from apps.users.models import User


EVENTS_DATA = [
    # CONCERT
    {
        'title': 'Mongolian Rock Night 2026',
        'description': 'Монголын хамгийн том рок хөгжмийн фестиваль. The Hu, Ego Fall, Camerton болон бусад алдарт хамтлагууд тоглолтоо толилуулна. Хоёр тайзан дээр нэгэн зэрэг тоглолт явагдах бөгөөд үзэгчид Монголын рок хөгжмийн түүхийг мэдрэх боломжтой.',
        'short_description': 'The Hu, Ego Fall, Camerton болон бусад хамтлагуудын рок фестиваль',
        'category_type': 'concert',
        'venue': 'Монгол Мьюзик Хол',
        'venue_address': 'Чингисийн өргөн чөлөө 12',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 15,
        'duration_hours': 4,
        'status': 'published',
        'is_featured': True,
        'is_trending': True,
        'tags': 'рок, хөгжим, фестиваль, the hu, монгол',
        'total_capacity': 2000,
        'ticket_types': [
            {'name': 'Энгийн', 'price': 35000, 'total_count': 1500},
            {'name': 'VIP', 'description': 'VIP зал, буфет багтсан', 'price': 75000, 'total_count': 400},
            {'name': 'Backstage', 'description': 'Backstage нэвтрэх эрх + гар үсэг авах', 'price': 150000, 'total_count': 100},
        ],
    },
    {
        'title': 'Mongolian Jazz Festival',
        'description': 'Улаанбаатар хотод болох жазз хөгжмийн баяр. Орон нутгийн болон гадаадын алдарт жазз хамтлагууд тоглолтоо толилуулна. Агаар мандлын орчин тойрон, сайхан хөгжим, амттай хоол хүнсний хамт жааз хөгжмийн дэлхийд аялаарай.',
        'short_description': 'Орон нутгийн болон гадаадын жазз урлагчдын баяр',
        'category_type': 'concert',
        'venue': 'Тэнгис кино театр',
        'venue_address': 'Сүхбаатарын талбай, 1-р байр',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 22,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': False,
        'is_trending': True,
        'tags': 'жазз, хөгжим, баяр, тайз',
        'total_capacity': 800,
        'ticket_types': [
            {'name': 'Стандарт', 'price': 25000, 'total_count': 600},
            {'name': 'Онцгой суудал', 'description': 'Тайзны өмнөх хэсэг', 'price': 50000, 'total_count': 200},
        ],
    },
    {
        'title': 'Хан-Уул Нийслэлийн Дуурийн Шөнө',
        'description': 'Монгол улсын Дуурийн театрын шилдэг дуурчид хамтдаа гала тоглолт зохион байгуулна. Тэнор, сопрано, баритон болон бусад алдарт дуурчид Верди, Пуччини, Моцартын бүтээлүүдийг тоглоно. Монгол хэлний орчуулгатай субтитр дэлгэцэн дээр гарна.',
        'short_description': 'Монгол Дуурийн театрын шилдэг дуурчдын гала тоглолт',
        'category_type': 'concert',
        'venue': 'Улсын Дуурийн театр',
        'venue_address': 'Их сургуулийн гудамж 3',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 30,
        'duration_hours': 2,
        'status': 'published',
        'is_featured': True,
        'is_trending': False,
        'tags': 'дуурь, хөгжим, классик, театр',
        'total_capacity': 600,
        'ticket_types': [
            {'name': 'Партер', 'price': 45000, 'total_count': 300},
            {'name': 'Бельетаж', 'price': 60000, 'total_count': 200},
            {'name': 'Ложа', 'description': 'Хувийн ложа, 4 суудал', 'price': 200000, 'total_count': 100},
        ],
    },

    # ENTERTAINMENT
    {
        'title': 'Монгол Стэнд-Ап Шөнө',
        'description': 'Монголын хамгийн алдартай стэнд-ап комедийн урлагчид нэг тайзан дээр цугларна. Танаа баталгаатай инээдэм, хошин үг болон дотоодын мэдээний ёгтлол. Хүн бүрт тохирсон, 18+ насны хязгаарлалтгүй.',
        'short_description': 'Монголын тэргүүлэх стэнд-ап комедийн шилдэг шөнө',
        'category_type': 'entertainment',
        'venue': 'Comedy House UB',
        'venue_address': 'Баянгол дүүрэг, Энхтайваны өргөн чөлөө 15',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 10,
        'duration_hours': 2,
        'status': 'published',
        'is_featured': False,
        'is_trending': True,
        'tags': 'комеди, стэнд-ап, инээдэм, хошин үг',
        'total_capacity': 300,
        'ticket_types': [
            {'name': 'Ердийн', 'price': 20000, 'total_count': 200},
            {'name': 'Сонгомол', 'description': 'Тайзны өмнөх хэсэг + нэг коктейль', 'price': 35000, 'total_count': 100},
        ],
    },
    {
        'title': 'Монгол Хошин Шог 2026',
        'description': 'Монголын телевизийн алдарт хошин шогийн нэвтрүүлгийн шилдэг тоглолтуудыг нэг тайзан дээр толилуулах шоу. Тоглолт дотроо ялалт, дуу хөгжим болон гялалзсан хэсгүүд багтана.',
        'short_description': 'Телевизийн алдарт хошин шогийн тайзны тоглолт',
        'category_type': 'entertainment',
        'venue': 'Монгол Экспо Центр',
        'venue_address': 'Чингисийн өргөн чөлөө 44',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 18,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': True,
        'is_trending': False,
        'tags': 'хошин шог, шоу, телевиз, инээдэм',
        'total_capacity': 1500,
        'ticket_types': [
            {'name': 'Стандарт', 'price': 15000, 'total_count': 1000},
            {'name': 'Дээд', 'price': 30000, 'total_count': 500},
        ],
    },

    # THEATER
    {
        'title': 'Гэр Оронгүй — Жүжиг',
        'description': 'Монголын залуу зохиолчийн бичсэн орчин үеийн нийгмийн тулгамдсан асуудлыг харуулсан жүжиг. Хотын залуус, тэдний мөрөөдөл болон бодит амьдралын зөрчлийг дүрслэн харуулсан тус бүтээл олон шагнал хүртсэн.',
        'short_description': 'Монголын залуу зохиолчийн орчин үеийн нийгмийн жүжиг',
        'category_type': 'theater',
        'venue': 'Хөгжим Драмын Эрдмийн Театр',
        'venue_address': 'Жуулчны гудамж 5',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 7,
        'duration_hours': 2,
        'status': 'published',
        'is_featured': False,
        'is_trending': False,
        'tags': 'жүжиг, театр, орчин үе, нийгэм',
        'total_capacity': 400,
        'ticket_types': [
            {'name': 'Ердийн', 'price': 18000, 'total_count': 300},
            {'name': 'Онцгой', 'description': 'Тайзны ойр суудал', 'price': 30000, 'total_count': 100},
        ],
    },
    {
        'title': 'Ромео ба Жульетта',
        'description': 'Уильям Шекспирийн хамгийн алдарт жүжгийн Монгол орчуулга. Монголын шилдэг жүжигчид энэхүү хайрын түүхийг дэлхийн жишигт нийцсэн тайзны бүтээлийн хэлбэрээр толилуулна. Орчин үеийн тайзны угсралт, гэрэлтүүлгийн техник ашиглана.',
        'short_description': 'Шекспирийн алдарт жүжгийн монгол орчуулга тайзны бүтээл',
        'category_type': 'theater',
        'venue': 'Хөдөлмөрийн Ордон',
        'venue_address': 'Сүхбаатарын талбай 3',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 25,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': True,
        'is_trending': False,
        'tags': 'жүжиг, шекспир, театр, классик, хайр',
        'total_capacity': 500,
        'ticket_types': [
            {'name': 'Партер', 'price': 25000, 'total_count': 350},
            {'name': 'Бельетаж', 'price': 35000, 'total_count': 150},
        ],
    },

    # FESTIVAL
    {
        'title': 'Наадам Наадам 2026 — Хотын Тэмцээн',
        'description': 'Улаанбаатар хотын хэмжээнд явагдах Наадмын баяр. Бөх, сур, морь гурван эрийн наадам, дагалдах соёл урлагийн хөтөлбөр. Монгол хувцасны үзэсгэлэн, Монгол хоолны баяр болон урлаг, гар урлалын дэлгүүрүүд ажиллана.',
        'short_description': 'Хотын Наадмын баяр: бөх, сур, морь, соёл хөтөлбөр',
        'category_type': 'festival',
        'venue': 'Улаанбаатарын Стадион',
        'venue_address': 'Нарны зам 12',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 40,
        'duration_hours': 8,
        'status': 'published',
        'is_featured': True,
        'is_trending': True,
        'tags': 'наадам, бөх, сур, морь, нийслэл, баяр',
        'total_capacity': 10000,
        'ticket_types': [
            {'name': 'Энгийн орох', 'price': 5000, 'total_count': 8000},
            {'name': 'VIP тойрог', 'description': 'VIP суудал + буфет', 'price': 25000, 'total_count': 2000},
        ],
    },
    {
        'title': 'Монгол Хоолны Баяр 2026',
        'description': 'Монголын уламжлалт болон орчин үеийн хоолны соёлыг нэгтгэсэн гастрономийн фестиваль. 50 гаруй ресторан, хоолны газрууд оролцох бөгөөд хоол хийх мэдлэгийн хэлэлцүүлэг, дегустаци болон хоолчдын уралдаан явагдана.',
        'short_description': 'Монголын хоолны соёлын фестиваль, 50+ ресторан оролцогч',
        'category_type': 'festival',
        'venue': 'Улаанбаатар Цэцэрлэгт Хүрээлэн',
        'venue_address': 'Чингисийн өргөн чөлөө, Цэцэрлэгт хүрээлэн',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 12,
        'duration_hours': 10,
        'status': 'published',
        'is_featured': False,
        'is_trending': True,
        'tags': 'хоол, баяр, монгол, ресторан, гастро',
        'total_capacity': 5000,
        'ticket_types': [
            {'name': 'Оролцох', 'description': '10 ресторанд үнэгүй дегустаци', 'price': 10000, 'total_count': 4000},
            {'name': 'Дээд', 'description': 'Бүх ресторан + VIP хэлэлцүүлэг', 'price': 25000, 'total_count': 1000},
        ],
    },

    # MUSEUM / EXHIBITION
    {
        'title': 'Монголын Нүүдэлчдийн Хувцасны Үзэсгэлэн',
        'description': 'Монголын уламжлалт нүүдэлчдийн хувцас, гоёл чимэглэлийн 500 гаруй нэгж үзмэрийг багтаасан үзэсгэлэн. Монголын хувцасны 2000 жилийн түүх, бүс нутгийн онцлог болон одоо үеийн монгол загварын хөгжлийг тусгасан.',
        'short_description': 'Монголын уламжлалт нүүдэлчдийн хувцасны 500 үзмэр',
        'category_type': 'museum',
        'venue': 'Монголын Үндэсний Музей',
        'venue_address': 'Жуулчны гудамж 1',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 5,
        'duration_hours': 6,
        'status': 'published',
        'is_featured': False,
        'is_trending': False,
        'tags': 'музей, дээл, хувцас, уламжлал, түүх',
        'total_capacity': 200,
        'ticket_types': [
            {'name': 'Насанд хүрэгч', 'price': 8000, 'total_count': 150},
            {'name': 'Хүүхэд (7-17)', 'price': 3000, 'total_count': 50},
        ],
    },
    {
        'title': 'Чингис Хааны Эзэнт Гүрний Үзэсгэлэн',
        'description': 'Монголын Их эзэнт гүрний үеийн олдворууд, баримт бичиг болон дурсгалт зүйлсийг харуулсан онцгой үзэсгэлэн. Гадаадын эрдэмтэдтэй хамтарч зохион байгуулсан энэхүү үзэсгэлэн дэлхийн 15 оронд аялсны дараа Улаанбаатарт буцаж ирж байна.',
        'short_description': 'Монголын Их эзэнт гүрний олдворуудын онцгой үзэсгэлэн',
        'category_type': 'museum',
        'venue': 'Монголын Үндэсний Дурсгалын Музей',
        'venue_address': 'Засгийн газрын гудамж 7',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 8,
        'duration_hours': 8,
        'status': 'published',
        'is_featured': True,
        'is_trending': True,
        'tags': 'чингис, музей, түүх, эзэнт гүрэн, олдвор',
        'total_capacity': 500,
        'ticket_types': [
            {'name': 'Энгийн', 'price': 12000, 'total_count': 400},
            {'name': 'Хэлмэрч хамт', 'description': 'Мэргэжлийн хэлмэрч байрлуулна', 'price': 20000, 'total_count': 100},
        ],
    },

    # SPORTS
    {
        'title': 'Монголын Хөлбөмбөгийн Аварга Шалгаруулах Тэмцээн',
        'description': 'Монголын хөлбөмбөгийн холбооны нийслэлийн аварга шалгаруулах тэмцээн. Улаанбаатарын шилдэг 8 баг оролцох бөгөөд аварга болсон баг Монгол улсыг гадаадын тэмцээнд төлөөлөх эрхтэй болно.',
        'short_description': 'Нийслэлийн хөлбөмбөгийн аварга шалгаруулах тэмцээн',
        'category_type': 'sports',
        'venue': 'Наадамчдын стадион',
        'venue_address': 'Хан-Уул дүүрэг, Спортын гудамж',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 20,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': False,
        'is_trending': True,
        'tags': 'хөлбөмбөг, спорт, аварга, тэмцээн',
        'total_capacity': 3000,
        'ticket_types': [
            {'name': 'Энгийн', 'price': 5000, 'total_count': 2500},
            {'name': 'VIP', 'description': 'VIP суудал + буфет', 'price': 20000, 'total_count': 500},
        ],
    },
    {
        'title': 'Монголын Бөхийн Барилдаан',
        'description': 'Монголын бөхийн уламжлалт барилдааны тэмцээн. 64 бөх оролцох бөгөөд эзэн аварга болох хүртэл барилдана. Арсланыг тодруулах тэмцээн нь МУ-ын бөхийн холбооноос зохион байгуулагдана.',
        'short_description': 'Монголын уламжлалт бөхийн барилдаан, аварга тодруулах',
        'category_type': 'sports',
        'venue': 'Улаанбаатарын Стадион',
        'venue_address': 'Нарны зам 12',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 35,
        'duration_hours': 6,
        'status': 'published',
        'is_featured': True,
        'is_trending': False,
        'tags': 'бөх, барилдаан, наадам, монгол, спорт',
        'total_capacity': 5000,
        'ticket_types': [
            {'name': 'Ердийн', 'price': 8000, 'total_count': 4000},
            {'name': 'Онцгой суудал', 'price': 15000, 'total_count': 1000},
        ],
    },

    # LIVE SHOW
    {
        'title': 'Mongolian Got Talent — Гранд Финал',
        'description': 'Монголын авъяаслагдсан уран бүтээлчдийг олж нутаглуулдаг "Mongolian Got Talent" шоуны гранд финал. Жилийн турш явагдсан аудишний дараах шилдэг 10 өрсөлдөгч тайзан дээр гарч ирэн ялагчийг тодруулна. Мэргэжилтэй шүүгчид болон олон нийт саналаа өгнө.',
        'short_description': 'Mongolian Got Talent шоуны шилдэг 10 өрсөлдөгчийн гранд финал',
        'category_type': 'live_show',
        'venue': 'Улсын Соёлын Ордон',
        'venue_address': 'Жуулчны гудамж 4',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 14,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': True,
        'is_trending': True,
        'tags': 'талент, шоу, уралдаан, монгол, шууд',
        'total_capacity': 1200,
        'ticket_types': [
            {'name': 'Ердийн', 'price': 22000, 'total_count': 900},
            {'name': 'Онцгой', 'description': 'Тайзны өмнөх 5 мөр', 'price': 45000, 'total_count': 300},
        ],
    },
    {
        'title': 'Монголын Хамгийн Шилдэг Сурагчид',
        'description': 'Монголын ерөнхий боловсролын сургуулийн шилдэг сурагчдын жилийн гала концерт. Дуу, бүжиг, хэнгэрэг, хоомий болон бусад уран сайхны тоглолтуудыг агуулсан гала шоу. Аваргуудыг шагнах, тэтгэлэг хүртэх ёслол мөн явагдана.',
        'short_description': 'Ерөнхий боловсролын шилдэг сурагчдын жилийн гала шоу',
        'category_type': 'live_show',
        'venue': 'Соёл Урлагийн Их Сургуулийн Тайз',
        'venue_address': 'Баянзүрх дүүрэг, Соёлын гудамж',
        'city': 'Улаанбаатар',
        'country': 'Монгол',
        'start_offset_days': 28,
        'duration_hours': 3,
        'status': 'published',
        'is_featured': False,
        'is_trending': False,
        'tags': 'сурагч, гала, шилдэг, хүүхэд, шоу',
        'total_capacity': 600,
        'ticket_types': [
            {'name': 'Ердийн', 'price': 10000, 'total_count': 500},
            {'name': 'Онцгой', 'price': 18000, 'total_count': 100},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with Mongolian events'

    def handle(self, *args, **options):
        admin_user = User.objects.filter(is_staff=True).first()
        now = timezone.now()

        created_count = 0
        skipped_count = 0

        for event_data in EVENTS_DATA:
            title = event_data['title']
            if Event.objects.filter(title=title).exists():
                self.stdout.write(f'  Skipping existing event')
                skipped_count += 1
                continue

            category = Category.objects.filter(type=event_data['category_type']).first()
            if not category:
                self.stdout.write(self.style.WARNING(f'  Category not found: {event_data["category_type"]}'))
                continue

            start_date = now + timedelta(days=event_data['start_offset_days'])
            end_date = start_date + timedelta(hours=event_data['duration_hours'])

            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1

            total_capacity = event_data['total_capacity']

            event = Event.objects.create(
                title=title,
                slug=slug,
                description=event_data['description'],
                short_description=event_data['short_description'],
                category=category,
                venue=event_data['venue'],
                venue_address=event_data['venue_address'],
                city=event_data['city'],
                country=event_data['country'],
                start_date=start_date,
                end_date=end_date,
                status=event_data['status'],
                is_featured=event_data['is_featured'],
                is_trending=event_data['is_trending'],
                tags=event_data['tags'],
                total_capacity=total_capacity,
                created_by=admin_user,
            )

            for tt_data in event_data['ticket_types']:
                TicketType.objects.create(
                    event=event,
                    name=tt_data['name'],
                    description=tt_data.get('description', ''),
                    price=tt_data['price'],
                    currency='MNT',
                    total_count=tt_data['total_count'],
                    sold_count=0,
                    max_per_booking=10,
                )

            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'  Created event #{created_count}'))

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {created_count} events, skipped {skipped_count} existing.'
        ))
