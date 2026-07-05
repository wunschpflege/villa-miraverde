// ═══════════════════════════════════════
// DEVICE DETECTION
// ═══════════════════════════════════════
(function(){
  var w = window.innerWidth;
  var ua = navigator.userAgent;
  var isTablet = /iPad|Tablet/i.test(ua) || (w >= 768 && w <= 1024);
  var isMobile = /iPhone|Android|Mobile/i.test(ua) || w < 768;
  document.documentElement.classList.add(isMobile ? 'device-mobile' : isTablet ? 'device-tablet' : 'device-desktop');
  // iOS safe area support
  if (/iPhone|iPad/i.test(ua)) {
    document.documentElement.classList.add('device-ios');
  }
})();

// ═══════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════
var pages = ['start','ausstattung','buchen','empfehlungen','ueber-uns','lage','gaestebuch'];

function showTab(id) {
  // Deactivate all pages & tabs
  pages.forEach(function(p) {
    var pg = document.getElementById('page-' + p);
    if (pg) pg.classList.remove('active');
  });
  document.querySelectorAll('.tab, .mob-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === id);
  });
  // Activate target
  var target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  // Lazy-init 3D viewer
  if (id === 'ausstattung' && !window._3dInit) { init3D(); window._3dInit = true; }
  // Init calendar if buchen
  if (id === 'buchen' && !window._calInit) { renderCalendar(); window._calInit = true; }
  // Kacheln übersetzen wenn Empfehlungen geöffnet wird
  if (id === 'empfehlungen') { setTimeout(function(){ rebuildGridForLang(currentLang || 'de'); }, 50); }
  // Übersetzung auf neue Seite anwenden
  if (currentLang && currentLang !== 'de') { setTimeout(function(){ setLang(currentLang); }, 50); }
}

function toggleMobTabbar() {
  // On mobile, hamburger toggles additional nav (aktivitaeten/einkaufen/ausstattung)
  // For simplicity, just open a mini overlay
  var overlay = document.getElementById('mob-extra-overlay');
  if (overlay) { overlay.classList.toggle('open'); return; }
  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'mob-extra-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;top:56px;z-index:8990;background:rgba(253,250,245,.98);backdrop-filter:blur(20px);display:flex;flex-direction:column;padding:1.4rem 1.4rem;gap:.2rem;overflow-y:auto';
  var items = [
    ['ausstattung','Ausstattung'],
    ['aktivitaeten','Aktivitäten'],
    ['einkaufen','Einkaufen'],
    ['ueber-uns','Über uns'],
  ];
  items.forEach(function(item){
    var a = document.createElement('button');
    a.style.cssText = 'padding:.85rem 0;font-size:.95rem;color:var(--ink);text-align:left;background:none;border:none;border-bottom:1px solid var(--b2);font-family:"DM Sans",sans-serif;display:flex;align-items:center;gap:.7rem;cursor:pointer';
    a.innerHTML = item[1];
    a.onclick = function(){ showTab(item[0]); overlay.classList.remove('open'); overlay.style.display='none'; };
    overlay.appendChild(a);
  });
  var closeBtn = document.createElement('button');
  closeBtn.style.cssText='margin-top:1.2rem;padding:.75rem;background:var(--b2);border:none;border-radius:6px;font-family:"DM Sans",sans-serif;font-size:.82rem;cursor:pointer;color:var(--ink3)';
  closeBtn.textContent='Schließen';
  closeBtn.onclick=function(){overlay.style.display='none'};
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════
// LANGUAGE
// ═══════════════════════════════════════
var langFlags = {de:'🇩🇪',en:'🇬🇧',fr:'🇫🇷',nl:'🇳🇱',pl:'🇵🇱',ru:'🇷🇺',es:'🇪🇸'};
var langCodes = {de:'DE',en:'EN',fr:'FR',nl:'NL',pl:'PL',ru:'RU',es:'ES'};
var T = {
  de:{tab_start:'Start',tab_amenities:'Ausstattung',tab_book:'Buchen',tab_restaurants:'Restaurants',tab_activities:'Aktivitäten',tab_beaches:'Strände',tab_shopping:'Einkaufen',tab_about:'Über uns',tab_location:'Lage & Kontakt',hero_location:'Benissa · Costa Blanca · Spanien',hero_tagline:'Eine außergewöhnliche Architektenvilla hoch über dem Mittelmeer – mit atemberaubendem Meerblick, privatem Pool und der einzigartigen Gastfreundschaft von Sophie & Lisa.',hero_btn1:'Verfügbarkeit prüfen',hero_btn2:'Villa entdecken',hl1_title:'Panorama-Meerblick',hl1_text:'Unverbaubarer Blick auf das türkisblaue Mittelmeer aus allen Haupträumen',hl2_title:'Pool 8 × 4 m',hl2_text:'Privatpool exklusiv für Ihre Gruppe – täglich gepflegt, niemals geteilt',hl3_title:'4 Schlafzimmer',hl3_text:'1 Masterbedroom und 3 Schlafbereiche – jedes Zimmer mit eigenem Bad',hl4_title:'Kulinarischer Guide',hl4_text:'Michelin-verdächtige Restaurants direkt vor der Tür – unser exklusiver Guide hilft',avbar_btn:'Verfügbarkeit prüfen →',am_sea_h:'Meerblick',am_sea_p:'Unverbaubarer Blick auf das Mittelmeer – aus dem Wohnbereich, dem Küchenbereich und von der Dachterrasse.',am_sea_tag:'★ Highlight der Villa',am_pool_h:'Privatpool 8 × 4 m',am_pool_p:'Exklusiver Pool für Ihre Gruppe – auf der eigenen Terrasse, niemals geteilt.',am_roof_h:'Dachterrasse',am_roof_p:'Erreichbar über Außentreppe – Sonnenliegen mit Panoramablick.',am_bed_h:'4 Schlafzimmer',am_bed_p:'1 Masterbedroom und 3 weitere Schlafbereiche – jedes mit eigenem Bad.',am_kitchen_h:'Vollausgestattete Küche',am_kitchen_p:'Herd, Backofen, Kühlschrank, Kaffeemaschine – alles vorhanden.',val1_h:'Persönlichkeit',val1_p:'Kein anonymes Ferienhaus – wir sind immer persönlich für Sie erreichbar.',val2_h:'Vertrauen',val2_p:'Alle Bewertungen sind 5 Sterne. Keine versteckten Kosten.',val3_h:'Schnelligkeit',val3_p:'Wir antworten auf jede Anfrage innerhalb von 24 Stunden.',lbl_contact_msg:'Nachricht',whatsapp_txt:'Schnell & direkt',pill_bed:'Schlafzimmer',pill_bath:'Bäder (3 en-suite, 1 sep.)',pill_area:'Wohnfläche',pill_sea:'Meerblick',opt_2p:'2 Personen',opt_4p:'4 Personen',opt_6p:'6 Personen',opt_8p:'8 Personen',cta_h:'Jetzt Ihren Urlaub',cta_hi:'planen',cta_p:'Direkt bei Sophie & Lisa buchen – keine Buchungsgebühren, persönlicher Service.',viewer_hint:'Ziehen · Zoomen',no_reviews:'Noch keine Bewertungen.',rest_h:'Die besten Restaurants',rest_hi:'Moraira & CV-746',act_h:'Unvergessliche Erlebnisse',act_hi:'rund um Moraira',seh_h:'Traumstrände',seh_hi:'in der Umgebung',eink_h:'Supermärkte &',eink_hi:'Einkaufen in der Nähe',viewer_floor0:'Gesamt',viewer_floor1:'Erdgeschoss',viewer_floor2:'Obergeschoss',viewer_floor3:'Dach + Pool',tab_guestbook:'Gästebuch',tab_empfehlungen:'Empfehlungen',empf_eink:'🛒 Einkaufen',empf_str:'🏖 Strände',empf_akt:'🏄 Aktivitäten',empf_rest:'🍽 Restaurants',empf_all:'Alle',empf_title:'Unsere Empfehlungen'},
  en:{tab_start:'Home',tab_amenities:'Amenities',tab_book:'Book',tab_restaurants:'Restaurants',tab_activities:'Activities',tab_beaches:'Beaches',tab_shopping:'Shopping',tab_about:'About us',tab_location:'Location',hero_location:'Benissa · Costa Blanca · Spain',hero_tagline:'An extraordinary architect villa high above the Mediterranean – with breathtaking sea views, private pool and the unique hospitality of Sophie & Lisa.',hero_btn1:'Check Availability',hero_btn2:'Explore Villa',hl1_title:'Sea View',hl1_text:'Unobstructed views of the turquoise Mediterranean from all main rooms',hl2_title:'Pool 8 × 4 m',hl2_text:'Private pool exclusively for your group – maintained daily, never shared',hl3_title:'4 Bedrooms',hl3_text:'1 Master Bedroom and 3 bedrooms – each with its own private bathroom',hl4_title:'Restaurant Guide',hl4_text:'Michelin-worthy restaurants right on your doorstep – our exclusive guide helps',avbar_btn:'Check Availability →',am_sea_h:'Sea View',am_sea_p:'Unobstructed views of the Mediterranean – from the living area, kitchen and roof terrace.',am_sea_tag:'★ Villa Highlight',am_pool_h:'Private Pool 8 × 4 m',am_pool_p:'Exclusive pool for your group – on your own terrace, never shared.',am_roof_h:'Roof Terrace',am_roof_p:'Accessible via external staircase – sun loungers with panoramic views.',am_bed_h:'4 Bedrooms',am_bed_p:'1 Master Bedroom and 3 further bedrooms – each with its own bathroom.',am_kitchen_h:'Fully Equipped Kitchen',am_kitchen_p:'Hob, oven, fridge, coffee machine – everything you need.',val1_h:'Personal Touch',val1_p:'No anonymous holiday home – we are always personally available for you.',val2_h:'Trust',val2_p:'All reviews are 5 stars. No hidden costs, no surprises.',val3_h:'Fast Response',val3_p:'We respond to every enquiry within 24 hours.',lbl_contact_msg:'Message',whatsapp_txt:'Fast & direct',pill_bed:'Bedrooms',pill_bath:'Bathrooms (3 en-suite, 1 sep.)',pill_area:'Living Space',pill_sea:'Sea View',opt_2p:'2 Persons',opt_4p:'4 Persons',opt_6p:'6 Persons',opt_8p:'8 Persons',cta_h:'Plan Your Holiday',cta_hi:'now',cta_p:'Book directly with Sophie & Lisa – no booking fees, personal service.',viewer_hint:'Drag · Zoom',no_reviews:'No reviews yet.',rest_h:'Best Restaurants',rest_hi:'Moraira & CV-746',act_h:'Unforgettable Experiences',act_hi:'around Moraira',seh_h:'Dream Beaches',seh_hi:'in the area',eink_h:'Supermarkets &',eink_hi:'Shopping nearby',viewer_floor0:'Overview',viewer_floor1:'Ground Floor',viewer_floor2:'Upper Floor',viewer_floor3:'Roof + Pool',tab_guestbook:'Guestbook',tab_empfehlungen:'Recommendations',empf_eink:'🛒 Shopping',empf_str:'🏖 Beaches',empf_akt:'🏄 Activities',empf_rest:'🍽 Restaurants',empf_all:'All',empf_title:'Our Recommendations'},
  es:{tab_start:'Inicio',tab_amenities:'Equipamiento',tab_book:'Reservar',tab_restaurants:'Restaurantes',tab_activities:'Actividades',tab_beaches:'Playas',tab_shopping:'Compras',tab_about:'Nosotras',tab_location:'Ubicación',hero_location:'Benissa · Costa Blanca · España',hero_tagline:'Una extraordinaria villa de arquitecto sobre el Mediterráneo – con impresionantes vistas al mar, piscina privada y la hospitalidad única de Sophie y Lisa.',hero_btn1:'Comprobar disponibilidad',hero_btn2:'Explorar villa',hl1_title:'Vistas al mar',hl1_text:'Vistas despejadas al turquesa Mediterráneo desde todas las estancias principales',hl2_title:'Piscina 8 × 4 m',hl2_text:'Piscina exclusiva para su grupo – mantenida diariamente, nunca compartida',hl3_title:'4 Dormitorios',hl3_text:'1 dormitorio principal y 3 habitaciones – cada una con baño privado',hl4_title:'Guía gastronómica',hl4_text:'Restaurantes de nivel Michelin a la puerta – nuestra guía exclusiva le ayuda',avbar_btn:'Comprobar disponibilidad →',am_sea_h:'Vistas al mar',am_sea_p:'Vistas despejadas al Mediterráneo – desde el salón, la cocina y la terraza.',am_sea_tag:'★ Destacado de la villa',am_pool_h:'Piscina privada 8 × 4 m',am_pool_p:'Piscina exclusiva para su grupo – en su propia terraza, nunca compartida.',am_roof_h:'Terraza en la azotea',am_roof_p:'Accesible por escalera exterior – tumbonas con vistas panorámicas.',am_bed_h:'4 Dormitorios',am_bed_p:'1 dormitorio principal y 3 dormitorios más – cada uno con baño propio.',am_kitchen_h:'Cocina totalmente equipada',am_kitchen_p:'Cocina, horno, nevera, cafetera – todo lo que necesita.',val1_h:'Personalidad',val1_p:'Sin anonimato – siempre disponibles personalmente para vosotros.',val2_h:'Confianza',val2_p:'Todas las reseñas son 5 estrellas. Sin costes ocultos.',val3_h:'Rapidez',val3_p:'Respondemos a cada consulta en menos de 24 horas.',lbl_contact_msg:'Mensaje',whatsapp_txt:'Rápido y directo',pill_bed:'Dormitorios',pill_bath:'Baños (3 en-suite, 1 sep.)',pill_area:'Superficie',pill_sea:'Vistas al mar',opt_2p:'2 Personas',opt_4p:'4 Personas',opt_6p:'6 Personas',opt_8p:'8 Personas',cta_h:'Planifique sus',cta_hi:'vacaciones',cta_p:'Reserve directamente con Sophie y Lisa – sin comisiones, servicio personal.',viewer_hint:'Arrastrar · Zoom',no_reviews:'Sin reseñas aún.',rest_h:'Mejores restaurantes',rest_hi:'Moraira & CV-746',act_h:'Experiencias inolvidables',act_hi:'alrededor de Moraira',seh_h:'Playas de ensueño',seh_hi:'en los alrededores',eink_h:'Supermercados &',eink_hi:'Compras cerca',viewer_floor0:'General',viewer_floor1:'Planta baja',viewer_floor2:'Planta alta',viewer_floor3:'Azotea + Piscina',tab_guestbook:'Libro de visitas'},
  fr:{tab_start:'Accueil',tab_amenities:'Équipements',tab_book:'Réserver',tab_restaurants:'Restaurants',tab_activities:'Activités',tab_beaches:'Plages',tab_shopping:'Shopping',tab_location:'Situation',hero_location:'Benissa · Costa Blanca · Espagne',hero_tagline:'Une villa d\'architecte exceptionnelle surplombant la Méditerranée – avec vue mer imprenable, piscine privée et l\'hospitalité unique de Sophie & Lisa.',hero_btn1:'Vérifier la disponibilité',hero_btn2:'Explorer la villa',hl1_title:'Vue sur mer',hl1_text:'Vue imprenable sur la Méditerranée turquoise depuis toutes les pièces',hl2_title:'Piscine 8 × 4 m',hl2_text:'Piscine exclusive – entretenue quotidiennement, jamais partagée',hl3_title:'4 Chambres',hl3_text:'1 chambre master et 3 chambres – chacune avec salle de bain privée',hl4_title:'Guide gastronomique',hl4_text:'Restaurants dignes du Michelin à deux pas – notre guide exclusif vous aide',avbar_btn:'Vérifier la disponibilité →',am_sea_h:'Vue sur la mer',am_sea_p:'Vue imprenable sur la Méditerranée – depuis le séjour, la cuisine et la terrasse.',am_sea_tag:'★ Point fort de la villa',am_pool_h:'Piscine privée 8 × 4 m',am_pool_p:'Piscine exclusive pour votre groupe – sur votre propre terrasse, jamais partagée.',am_roof_h:'Terrasse sur le toit',am_roof_p:'Accessible par escalier extérieur – chaises longues avec vue panoramique.',am_bed_h:'4 Chambres',am_bed_p:'1 chambre principale et 3 autres chambres – chacune avec salle de bain.',am_kitchen_h:'Cuisine entièrement équipée',am_kitchen_p:'Plaque, four, réfrigérateur, cafetière – tout ce qu\'il faut.',val1_h:'Personnalité',val1_p:'Pas d\'anonymat – toujours personnellement disponibles pour vous.',val2_h:'Confiance',val2_p:'Tous les avis sont 5 étoiles. Sans frais cachés.',val3_h:'Rapidité',val3_p:'Nous répondons à chaque demande en moins de 24 heures.',lbl_contact_msg:'Message',whatsapp_txt:'Rapide & direct',pill_bed:'Chambres',pill_bath:'Salles de bain (3 en-suite, 1 sep.)',pill_area:'Surface habitable',pill_sea:'Vue mer',opt_2p:'2 Personnes',opt_4p:'4 Personnes',opt_6p:'6 Personnes',opt_8p:'8 Personnes',cta_h:'Planifiez vos',cta_hi:'vacances',cta_p:'Réservez directement avec Sophie & Lisa – sans frais, service personnel.',viewer_hint:'Glisser · Zoom',no_reviews:'Pas encore d\'avis.',rest_h:'Meilleurs restaurants',rest_hi:'Moraira & CV-746',act_h:'Expériences inoubliables',act_hi:'autour de Moraira',seh_h:'Plages de rêve',seh_hi:'dans les environs',eink_h:'Supermarchés &',eink_hi:'Shopping à proximité',viewer_floor0:'Vue générale',viewer_floor1:'Rez-de-chaussée',viewer_floor2:'Étage',viewer_floor3:'Toit + Piscine',tab_guestbook:'Livre d\'or'},
  nl:{tab_start:'Start',tab_amenities:'Voorzieningen',tab_book:'Boeken',tab_restaurants:'Restaurants',tab_activities:'Activiteiten',tab_beaches:'Stranden',tab_shopping:'Winkelen',tab_location:'Ligging',hero_location:'Benissa · Costa Blanca · Spanje',hero_tagline:'Een buitengewone architectenvilla hoog boven de Middellandse Zee – met adembenemend zeezicht, privézwembad en de unieke gastvrijheid van Sophie & Lisa.',hero_btn1:'Beschikbaarheid controleren',hero_btn2:'Villa ontdekken',hl1_title:'Zeezicht',hl1_text:'Onbelemmerd uitzicht op de turquoise Middellandse Zee vanuit alle hoofdruimtes',hl2_title:'Zwembad 8 × 4 m',hl2_text:'Privézwembad exclusief voor uw groep – dagelijks onderhouden, nooit gedeeld',hl3_title:'4 Slaapkamers',hl3_text:'1 master bedroom en 3 slaapkamers – elk met eigen badkamer',hl4_title:'Restaurantgids',hl4_text:'Michelin-waardige restaurants vlakbij – onze gids helpt u',avbar_btn:'Beschikbaarheid controleren →',am_sea_h:'Zeezicht',am_sea_p:'Onbelemmerd uitzicht op de Middellandse Zee – vanuit de woonkamer, keuken en dakterras.',am_sea_tag:'★ Hoogtepunt van de villa',am_pool_h:'Privézwembad 8 × 4 m',am_pool_p:'Exclusief zwembad voor uw groep – op uw eigen terras, nooit gedeeld.',am_roof_h:'Dakterras',am_roof_p:'Bereikbaar via buitentrap – ligstoelen met panoramisch uitzicht.',am_bed_h:'4 Slaapkamers',am_bed_p:'1 master bedroom en 3 andere slaapkamers – elk met eigen badkamer.',am_kitchen_h:'Volledig uitgeruste keuken',am_kitchen_p:'Kookplaat, oven, koelkast, koffiezetapparaat – alles aanwezig.',val1_h:'Persoonlijkheid',val1_p:'Geen anoniem vakantiehuis – altijd persoonlijk bereikbaar voor u.',val2_h:'Vertrouwen',val2_p:'Alle beoordelingen zijn 5 sterren. Geen verborgen kosten.',val3_h:'Snelheid',val3_p:'We reageren op elke aanvraag binnen 24 uur.',lbl_contact_msg:'Bericht',whatsapp_txt:'Snel & direct',pill_bed:'Slaapkamers',pill_bath:'Badkamers (3 en-suite, 1 sep.)',pill_area:'Woonoppervlak',pill_sea:'Zeezicht',opt_2p:'2 Personen',opt_4p:'4 Personen',opt_6p:'6 Personen',opt_8p:'8 Personen',cta_h:'Plan uw vakantie',cta_hi:'nu',cta_p:'Boek rechtstreeks bij Sophie & Lisa – geen boekingskosten, persoonlijke service.',viewer_hint:'Slepen · Zoomen',no_reviews:'Nog geen beoordelingen.',rest_h:'Beste restaurants',rest_hi:'Moraira & CV-746',act_h:'Onvergetelijke ervaringen',act_hi:'rond Moraira',seh_h:'Droomstranden',seh_hi:'in de omgeving',eink_h:'Supermarkten &',eink_hi:'Winkelen in de buurt',viewer_floor0:'Overzicht',viewer_floor1:'Begane grond',viewer_floor2:'Verdieping',viewer_floor3:'Dak + Zwembad',tab_guestbook:'Gastenboek'},
  pl:{tab_start:'Start',tab_amenities:'Udogodnienia',tab_book:'Rezerwuj',tab_restaurants:'Restauracje',tab_activities:'Aktywności',tab_beaches:'Plaże',tab_shopping:'Zakupy',tab_location:'Lokalizacja',hero_location:'Benissa · Costa Blanca · Hiszpania',hero_tagline:'Wyjątkowa willa architektów wysoko nad Morzem Śródziemnym – z zapierającym dech widokiem na morze, prywatnym basenem i niepowtarzalną gościnnością Sophie i Lisy.',hero_btn1:'Sprawdź dostępność',hero_btn2:'Odkryj willę',hl1_title:'Widok na morze',hl1_text:'Nieograniczony widok na turkusowe Morze Śródziemne ze wszystkich głównych pomieszczeń',hl2_title:'Basen 8 × 4 m',hl2_text:'Prywatny basen – pielęgnowany codziennie, nigdy współdzielony',hl3_title:'4 Sypialnie',hl3_text:'1 sypialnia główna i 3 sypialnie – każda z własną łazienką',hl4_title:'Przewodnik po restauracjach',hl4_text:'Restauracje godne Michelin tuż za drzwiami – nasz przewodnik pomoże',avbar_btn:'Sprawdź dostępność →',am_sea_h:'Widok na morze',am_sea_p:'Nieograniczony widok na Morze Śródziemne – z salonu, kuchni i tarasu na dachu.',am_sea_tag:'★ Wyróżnienie willi',am_pool_h:'Prywatny basen 8 × 4 m',am_pool_p:'Ekskluzywny basen dla Twojej grupy – na własnym tarasie, nigdy współdzielony.',am_roof_h:'Taras na dachu',am_roof_p:'Dostępny przez zewnętrzne schody – leżaki z widokiem panoramicznym.',am_bed_h:'4 Sypialnie',am_bed_p:'1 sypialnia główna i 3 kolejne sypialnie – każda z własną łazienką.',am_kitchen_h:'W pełni wyposażona kuchnia',am_kitchen_p:'Kuchenka, piekarnik, lodówka, ekspres do kawy – wszystko na miejscu.',val1_h:'Osobowość',val1_p:'Żadnego anonimowości – zawsze osobiście dostępne dla Was.',val2_h:'Zaufanie',val2_p:'Wszystkie opinie to 5 gwiazdek. Bez ukrytych kosztów.',val3_h:'Szybkość',val3_p:'Odpowiadamy na każde zapytanie w ciągu 24 godzin.',lbl_contact_msg:'Wiadomość',whatsapp_txt:'Szybko i bezpośrednio',pill_bed:'Sypialnie',pill_bath:'Łazienki (3 en-suite, 1 sep.)',pill_area:'Powierzchnia',pill_sea:'Widok na morze',opt_2p:'2 Osoby',opt_4p:'4 Osoby',opt_6p:'6 Osób',opt_8p:'8 Osób',cta_h:'Zaplanuj swoje',cta_hi:'wakacje',cta_p:'Rezerwuj bezpośrednio u Sophie i Lisy – bez opłat, osobista obsługa.',viewer_hint:'Przeciągnij · Zoom',no_reviews:'Brak opinii.',rest_h:'Najlepsze restauracje',rest_hi:'Moraira & CV-746',act_h:'Niezapomniane doświadczenia',act_hi:'wokół Morairy',seh_h:'Wymarzone plaże',seh_hi:'w okolicy',eink_h:'Supermarkety &',eink_hi:'Zakupy w pobliżu',viewer_floor0:'Przegląd',viewer_floor1:'Parter',viewer_floor2:'Piętro',viewer_floor3:'Dach + Basen',tab_guestbook:'Księga gości'},
  ru:{tab_start:'Главная',tab_amenities:'Удобства',tab_book:'Бронировать',tab_restaurants:'Рестораны',tab_activities:'Активности',tab_beaches:'Пляжи',tab_shopping:'Магазины',tab_location:'Расположение',hero_location:'Бениса · Коста-Бланка · Испания',hero_tagline:'Удивительная архитектурная вилла высоко над Средиземным морем – с захватывающим видом на море, частным бассейном и неповторимым гостеприимством Софи и Лизы.',hero_btn1:'Проверить наличие',hero_btn2:'Исследовать виллу',hl1_title:'Вид на море',hl1_text:'Беспрепятственный вид на бирюзовое Средиземное море из всех основных комнат',hl2_title:'Бассейн 8 × 4 м',hl2_text:'Частный бассейн – ежедневный уход, никогда не делится',hl3_title:'4 Спальни',hl3_text:'1 мастер-спальня и 3 спальни – каждая с собственной ванной',hl4_title:'Ресторанный гид',hl4_text:'Рестораны достойные Мишлен прямо у дверей – наш гид поможет',avbar_btn:'Проверить наличие →',am_sea_h:'Вид на море',am_sea_p:'Беспрепятственный вид на Средиземное море – из гостиной, кухни и крыши.',am_sea_tag:'★ Изюминка виллы',am_pool_h:'Частный бассейн 8 × 4 м',am_pool_p:'Эксклюзивный бассейн для вашей группы – на собственной террасе, никогда не делится.',am_roof_h:'Крышная терраса',am_roof_p:'Доступна по внешней лестнице – шезлонги с панорамным видом.',am_bed_h:'4 Спальни',am_bed_p:'1 мастер-спальня и 3 другие спальни – каждая с собственной ванной.',am_kitchen_h:'Полностью оборудованная кухня',am_kitchen_p:'Плита, духовка, холодильник, кофемашина – всё необходимое.',val1_h:'Индивидуальность',val1_p:'Никакой анонимности – всегда лично доступны для вас.',val2_h:'Доверие',val2_p:'Все отзывы – 5 звёзд. Никаких скрытых расходов.',val3_h:'Скорость',val3_p:'Отвечаем на каждый запрос в течение 24 часов.',lbl_contact_msg:'Сообщение',whatsapp_txt:'Быстро и напрямую',pill_bed:'Спальни',pill_bath:'Ванные (3 en-suite, 1 отд.)',pill_area:'Жилая площадь',pill_sea:'Вид на море',opt_2p:'2 Человека',opt_4p:'4 Человека',opt_6p:'6 Человек',opt_8p:'8 Человек',cta_h:'Спланируйте свой',cta_hi:'отдых',cta_p:'Бронируйте напрямую у Софи и Лизы – без комиссий, личный сервис.',viewer_hint:'Перетащить · Масштаб',no_reviews:'Отзывов пока нет.',rest_h:'Лучшие рестораны',rest_hi:'Моραира & CV-746',act_h:'Незабываемые впечатления',act_hi:'вокруг Моραиры',seh_h:'Пляжи мечты',seh_hi:'в окрестностях',eink_h:'Супермаркеты &',eink_hi:'Магазины поблизости',viewer_floor0:'Обзор',viewer_floor1:'Первый этаж',viewer_floor2:'Второй этаж',viewer_floor3:'Крыша + Бассейн'}
,tab_guestbook:'Книга гостей'};
var currentLang = 'de';

// ── VOLLSTÄNDIGE ÜBERSETZUNGEN ──
var TX = {
  de:{cta_book:'📅 Verfügbarkeit & Preise',cta_loc:'📍 Lage & Kontakt',footer_book:'Buchen',footer_rest:'Restaurants',footer_loc:'Lage & Kontakt',am_eyebrow:'Ausstattung',am_hi:'im Detail',am_highlights:'Highlights',am_all:'Komplette Ausstattung',tour_eyebrow:'Virtuelle Tour',tour_h:'Erkunden Sie die Villa',tour_hi:'in 3D',feat1_h:'Drei Ebenen',feat1_p:'Wohnbereich, 4 Schlafzimmer, Dachterrasse',feat2_h:'Vollmöbliert',feat2_p:'Lounge, vollausgestattete Küche, alle 4 Schlafzimmer',feat3_h:'Mediterrane Anlage',feat3_p:'1.079 m² Garten, Pool und Panoramaterrassen',season_low:'Nebensaison · Oktober – April',season_mid:'Zwischensaison · Mai, Jun, Sep, Okt',season_high:'Hochsaison · Juli – August',season_badge:'Beliebt',season_low_detail:'Wöchentlich ab € 2.450 · min. 4 Nächte',season_mid_detail:'Wöchentlich ab € 3.990 · min. 5 Nächte',season_high_detail:'Wöchentlich ab € 6.500 · min. 7 Nächte',season_incl:'✓ Endreinigung inklusive · ✓ WLAN inklusive',per_night:'/ Nacht',book_h:'Transparente Preise,',book_hi:'einfache Buchung',rev_eyebrow:'Gästebuch',rev_h:'Was unsere Gäste',rev_hi:'sagen',about_h:'Ihre Gastgeberinnen',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'Glasfaser-WLAN',am_wifi_p:'Highspeed Internet überall, auch auf der Terrasse',am_ac_h:'Klimaanlage',am_ac_p:'Inverter-Klimaanlage in allen Räumen, individuell regelbar',am_park_h:'2 Privatstellplätze',am_park_p:'Geschützte Parkplätze direkt am Haus, inklusive',am_garden_h:'Med. Garten 1.079 m²',am_garden_p:'Oliven, Lavendel, Zitrusbäume',am_tv_h:'Smart-TV',am_tv_p:'Smart-TV im Wohnbereich mit Streaming',am_wash_h:'Waschmaschine',am_wash_p:'Waschmaschine & Trockner, Bügeleisen',am_solar_h:'Solaranlage',am_solar_p:'Eigene Photovoltaikanlage für nachhaltige Energie',am_sec_h:'Sicherheit',am_sec_p:'Alarmanlage, Sicherheitsschlösser',am_wine_h:'Weinkühlschrank',am_wine_p:'Eingebaut, bis zu 36 Flaschen',am_sound_h:'Soundsystem',am_sound_p:'Multiroom-Audio innen & außen, Bluetooth',am_leisure_h:'Freizeitausstattung',am_leisure_p:'Liegestühle, Sonnenschirme, Strandausrüstung',am_kids_h:'Kinderfreundlich',am_kids_p:'Kinderbett, Hochstuhl, Treppengitter auf Anfrage',promise1_h:'Persönlicher Service',promise1_p:'Familie Wunsch ist jederzeit für Sie erreichbar',promise2_h:'Durchgängig top bewertet',promise2_p:'Alle Gäste bewerteten mit 5 Sternen',promise3_h:'Keine versteckten Kosten',promise3_p:'Endreinigung & WLAN inklusive',book_eyebrow:'Preise & Buchung',book_p:'Keine Buchungsgebühren. Direkt bei Sophie & Lisa.',avail_h:'Verfügbarkeit & Anfrage',avail_p:'Wählen Sie Ihren Zeitraum – Sophie & Lisa antworten innerhalb von 24 Stunden.',lbl_fname:'Vorname',lbl_lname:'Nachname',lbl_email:'E-Mail',lbl_phone:'Telefon',lbl_guests:'Gäste',lbl_lang:'Sprache',lbl_msg:'Nachricht',ph_fname:'Maria',ph_lname:'Müller',ph_email:'ihre@email.de',ph_phone:'+49 …',ph_msg:'Besondere Wünsche, Fragen…',btn_book:'Verbindliche Anfrage senden →',trust:'SSL-verschlüsselt · Keine Buchungsgebühr · Direkt bei Sophie & Lisa',cal_avail:'Verfügbar',cal_sel:'Ausgewählt',cal_booked:'Belegt',cal_arrival:'Anreise',cal_dep:'Abreise',price_period:'Zeitraum',price_rent:'Mietpreis',price_clean:'Endreinigung',price_total:'Gesamtpreis',rest_eyebrow:'Kulinarischer Guide',rest_note:'\u003cstrong\u003eEmpfehlung von Familie Wunsch:\u003c/strong\u003e Die CV-746 zwischen Moraira und Calpe ist eine der gastronomisch reichsten Straßen der Costa Blanca. Reservierungen im Sommer dringend empfohlen.',filter_all:'Alle',filter_fine:'Fine Dining',filter_moraira:'Moraira',maps_open:'Auf Google Maps öffnen →',act_eyebrow:'Aktivitäten & Ausflüge',act_note:'\u003cstrong\u003eTipp von Sophie \u0026 Lisa:\u003c/strong\u003e Die Costa Blanca bietet für jeden etwas – von Bootstouren zu verborgenen Buchten bis zu Delfinen in Benidorm. Wir helfen gerne bei der Buchung!',filter_water:'Wasser & Meer',filter_trip:'Ausflüge',filter_family:'Familie',seh_eyebrow:'Strände & Natur',seh_note:'\u003cstrong\u003eMoraira – das Juwel der Costa Blanca:\u003c/strong\u003e Nur 12 km von der Villa entfernt. Weniger touristisch als Calpe, aber genauso schön.',filter_strand:'Strände',filter_natur:'Natur & Wandern',eink_eyebrow:'Einkaufen',eink_note:'\u003cstrong\u003eTipp von Sophie \u0026 Lisa:\u003c/strong\u003e Mercadona Benissa nur 5 Min. entfernt. ALDI ist der einzige Markt der Region, der auch sonntags geöffnet hat!',filter_super:'Supermärkte',filter_spezial:'Spezialitäten',about_eyebrow:'Über uns',about_p1:'Wir sind zwei Schwestern, die Moraira seit vielen Jahren lieben. Was als Kindheitserinnerung begann, wurde mit den Jahren zu einer tiefen Verbundenheit mit dieser Küste, diesem Licht und diesem besonderen Gefühl, das nur die Costa Blanca schenkt.',about_p2:'Irgendwann fragten wir uns: Was wäre, wenn wir dieses Gefühl mit anderen teilen könnten? So entstand der Traum – und aus dem Traum wurde die Villa Las Hermanas.',about_p3:'Wir möchten, dass Sie dasselbe erleben, was uns Moraira bedeutet – und wir sind jederzeit persönlich für Sie da.',about_btn1:'Jetzt anfragen',about_btn2:'Kontakt & Lage',badge1:'5★ Bewertungen',badge2:'Antwortet < 24h',loc_eyebrow:'Lage',loc_p:'Hoch über dem Mittelmeer, in Benissa – einer der schönsten Gemeinden der Costa Blanca.',loc1_h:'Strand',loc1_p:'Cala Advocat & Cala del Moraig in nur 8 Minuten erreichbar',loc2_h:'Benissa',loc2_p:'Charmantes Ortszentrum mit Restaurants & Märkten in 10 Min.',loc3_h:'Flughafen Alicante',loc3_p:'Ca. 80 km – etwa 55 Minuten Fahrtzeit',loc4_h:'Freizeitangebote',loc4_p:'Wandern, Tauchen, Segeln, Weintouren – alles in der Nähe',contact_h:'Nachricht senden',ph_contact_name:'Vorname Nachname',ph_contact_msg:'Wie können wir Ihnen helfen?',btn_contact:'Nachricht senden →',host_eyebrow:'Ihre Gastgeberinnen',rev_form_h:'Bewertung hinterlassen',rev_form_p:'Waren Sie Gast in der Villa Las Hermanas? Wir freuen uns über Ihre Erfahrung!',rev_lbl_name:'Ihr Name *',rev_lbl_country:'Herkunftsland',rev_lbl_text:'Ihre Bewertung *',rev_ph_name:'Maria Müller',rev_ph_country:'Deutschland',rev_ph_text:'Wie war Ihr Aufenthalt?',rev_btn:'Bewertung absenden →',rev_note:'Wird nach Prüfung durch Sophie & Lisa veröffentlicht.',rev_thanks_h:'Vielen Dank!',rev_thanks_p:'Ihre Bewertung wird nach Prüfung veröffentlicht.',rev_rating_lbl:'Ihre Bewertung',footer_impressum:'Impressum',footer_datenschutz:'Datenschutz',loading:'Laden...',tab_guestbook:'Gästebuch',empf_title:'Unsere Empfehlungen',empf_all:'Alle',empf_rest:'🍽 Restaurants',empf_akt:'🏄 Aktivitäten',empf_str:'🏖 Strände',empf_eink:'🛒 Einkaufen',empf_note:'<strong>Tipp von Sophie &amp; Lisa:</strong> Hier findet ihr alles was die Region zu bieten hat – von Michelin-verdächtigen Restaurants über Bootstouren bis zu den schönsten Stränden.',tab_empfehlungen:'Empfehlungen',empf_eink:'🛒 Einkaufen',empf_str:'🏖 Strände',empf_akt:'🏄 Aktivitäten',empf_rest:'🍽 Restaurants',empf_all:'Alle',empf_title:'Unsere Empfehlungen'},
  en:{cta_book:'📅 Availability & Prices',cta_loc:'📍 Location & Contact',footer_book:'Book',footer_rest:'Restaurants',footer_loc:'Location & Contact',am_eyebrow:'Amenities',am_hi:'in Detail',am_highlights:'Highlights',am_all:'Complete Amenities',tour_eyebrow:'Virtual Tour',tour_h:'Explore the Villa',tour_hi:'in 3D',feat1_h:'Three Levels',feat1_p:'Living area, 4 bedrooms, roof terrace with pool',feat2_h:'Fully Furnished',feat2_p:'Lounge, fully equipped kitchen, all 4 bedrooms',feat3_h:'Mediterranean Garden',feat3_p:'1,079 m² garden, pool and panoramic terraces',season_low:'Low Season · October – April',season_mid:'Mid Season · May, Jun, Sep, Oct',season_high:'High Season · July – August',season_badge:'Popular',season_low_detail:'Weekly from € 2,450 · min. 4 nights',season_mid_detail:'Weekly from € 3,990 · min. 5 nights',season_high_detail:'Weekly from € 6,500 · min. 7 nights',season_incl:'✓ Final cleaning included · ✓ WiFi included',per_night:'/ night',book_h:'Transparent prices,',book_hi:'easy booking',rev_eyebrow:'Guestbook',rev_h:'What our guests',rev_hi:'say',about_h:'Your Hosts',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'Fibre WiFi',am_wifi_p:'High-speed internet everywhere, including on the terrace',am_ac_h:'Air Conditioning',am_ac_p:'Inverter AC in all rooms, individually adjustable',am_park_h:'2 Private Parking Spaces',am_park_p:'Sheltered parking directly at the house, included',am_garden_h:'Med. Garden 1,079 m²',am_garden_p:'Olives, lavender, citrus trees',am_tv_h:'Smart TV',am_tv_p:'Smart TV in living room with streaming',am_wash_h:'Washing Machine',am_wash_p:'Washing machine & dryer, iron',am_solar_h:'Solar System',am_solar_p:'Own photovoltaic system for sustainable energy',am_sec_h:'Security',am_sec_p:'Alarm system, security locks',am_wine_h:'Wine Fridge',am_wine_p:'Built-in, up to 36 bottles',am_sound_h:'Sound System',am_sound_p:'Multiroom audio inside & outside, Bluetooth',am_leisure_h:'Leisure Equipment',am_leisure_p:'Sun loungers, parasols, beach equipment',am_kids_h:'Child-Friendly',am_kids_p:'Cot, high chair, stair gate on request',promise1_h:'Personal Service',promise1_p:'The Wunsch family is always available for you',promise2_h:'Consistently top rated',promise2_p:'All guests rated their stay 5 stars',promise3_h:'No hidden costs',promise3_p:'Final cleaning & WiFi included',book_eyebrow:'Prices & Booking',book_p:'No booking fees. Directly with Sophie & Lisa.',avail_h:'Availability & Enquiry',avail_p:'Choose your dates – Sophie & Lisa will respond within 24 hours.',lbl_fname:'First name',lbl_lname:'Last name',lbl_email:'E-Mail',lbl_phone:'Phone',lbl_guests:'Guests',lbl_lang:'Language',lbl_msg:'Message',ph_fname:'Maria',ph_lname:'Smith',ph_email:'your@email.com',ph_phone:'+44 …',ph_msg:'Special requests, questions…',btn_book:'Send enquiry →',trust:'SSL encrypted · No booking fee · Direct with Sophie & Lisa',cal_avail:'Available',cal_sel:'Selected',cal_booked:'Booked',cal_arrival:'Check-in',cal_dep:'Check-out',price_period:'Period',price_rent:'Rental price',price_clean:'Final cleaning',price_total:'Total price',rest_eyebrow:'Culinary Guide',rest_note:'\u003cstrong\u003eRecommendation from the Wunsch family:\u003c/strong\u003e The CV-746 between Moraira and Calpe is one of the most gastronomically rich roads on the Costa Blanca. Reservations strongly recommended in summer.',filter_all:'All',filter_fine:'Fine Dining',filter_moraira:'Moraira',maps_open:'Open in Google Maps →',act_eyebrow:'Activities & Excursions',act_note:'\u003cstrong\u003eTip from the Wunsch family:\u003c/strong\u003e The Costa Blanca has something for everyone – from boat trips to hidden coves to dolphins in Benidorm.',filter_water:'Water & Sea',filter_trip:'Excursions',filter_family:'Family',seh_eyebrow:'Beaches & Nature',seh_note:'\u003cstrong\u003eMoraira – the jewel of the Costa Blanca:\u003c/strong\u003e Just 12 km from the villa. Less touristy than Calpe, but just as beautiful.',filter_strand:'Beaches',filter_natur:'Nature & Hiking',eink_eyebrow:'Shopping',eink_note:'\u003cstrong\u003eTip from the Wunsch family:\u003c/strong\u003e Mercadona Benissa just 5 min away. ALDI is the only supermarket in the area open on Sundays!',filter_super:'Supermarkets',filter_spezial:'Specialities',about_eyebrow:'About us',about_p1:'We are two sisters who have loved Moraira for many years. What started as a childhood memory grew into a deep connection with this coast, this light and the special feeling only the Costa Blanca can give.',about_p2:'One day we asked ourselves: what if we could share this feeling with others? That was the dream – and from that dream came Villa Las Hermanas.',about_p3:'We want you to experience what Moraira means to us – and we are always personally available for you.',about_btn1:'Enquire now',about_btn2:'Contact & Location',badge1:'5★ Reviews',badge2:'Responds < 24h',loc_eyebrow:'Location',loc_p:'High above the Mediterranean, in Benissa – one of the most beautiful municipalities on the Costa Blanca.',loc1_h:'Beach',loc1_p:'Cala Advocat & Cala del Moraig reachable in just 8 minutes',loc2_h:'Benissa',loc2_p:'Charming town centre with restaurants & markets in 10 min.',loc3_h:'Alicante Airport',loc3_p:'Approx. 80 km – about 55 minutes drive',loc4_h:'Leisure activities',loc4_p:'Hiking, diving, sailing, wine tours – all nearby',contact_h:'Send a message',ph_contact_name:'First Last Name',ph_contact_msg:'How can we help you?',btn_contact:'Send message →',host_eyebrow:'Your Hosts',rev_form_h:'Leave a review',rev_form_p:'Were you a guest at Villa Las Hermanas? We\'d love to hear your experience!',rev_lbl_name:'Your name *',rev_lbl_country:'Country of origin',rev_lbl_text:'Your review *',rev_ph_name:'Maria Smith',rev_ph_country:'United Kingdom',rev_ph_text:'How was your stay?',rev_btn:'Submit review →',rev_note:'Will be published after review by Sophie & Lisa.',rev_thanks_h:'Thank you!',rev_thanks_p:'Your review will be published after approval.',rev_rating_lbl:'Your rating',tab_about:'About us',footer_impressum:'Legal Notice',footer_datenschutz:'Privacy Policy',loading:'Loading...',tab_guestbook:'Guestbook',empf_title:'Our Recommendations',empf_all:'All',empf_rest:'🍽 Restaurants',empf_akt:'🏄 Activities',empf_str:'🏖 Beaches',empf_eink:'🛒 Shopping',empf_note:'<strong>Tip from Sophie &amp; Lisa:</strong> Everything the region has to offer – from Michelin-worthy restaurants to boat trips and the most beautiful beaches.',tab_empfehlungen:'Recommendations',empf_eink:'🛒 Shopping',empf_str:'🏖 Beaches',empf_akt:'🏄 Activities',empf_rest:'🍽 Restaurants',empf_all:'All',empf_title:'Our Recommendations'},
  es:{cta_book:'📅 Disponibilidad y Precios',cta_loc:'📍 Ubicación y Contacto',footer_book:'Reservar',footer_rest:'Restaurantes',footer_loc:'Ubicación y Contacto',am_eyebrow:'Equipamiento',am_hi:'en detalle',am_highlights:'Destacados',am_all:'Equipamiento completo',tour_eyebrow:'Tour virtual',tour_h:'Explore la villa',tour_hi:'en 3D',feat1_h:'Tres niveles',feat1_p:'Zona de estar, 4 dormitorios, terraza con piscina',feat2_h:'Completamente amueblada',feat2_p:'Salón, cocina totalmente equipada, 4 dormitorios',feat3_h:'Jardín mediterráneo',feat3_p:'1.079 m² de jardín, piscina y terrazas panorámicas',season_low:'Temporada baja · Octubre – Abril',season_mid:'Temporada media · May, Jun, Sep, Oct',season_high:'Temporada alta · Julio – Agosto',season_badge:'Popular',season_low_detail:'Semanal desde € 2.450 · mín. 4 noches',season_mid_detail:'Semanal desde € 3.990 · mín. 5 noches',season_high_detail:'Semanal desde € 6.500 · mín. 7 noches',season_incl:'✓ Limpieza final incluida · ✓ WiFi incluido',per_night:'/ noche',book_h:'Precios transparentes,',book_hi:'reserva sencilla',rev_eyebrow:'Libro de visitas',rev_h:'Lo que dicen',rev_hi:'nuestros huéspedes',about_h:'Vuestras anfitrionas',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'WiFi de fibra',am_wifi_p:'Internet de alta velocidad en todas partes',am_ac_h:'Aire acondicionado',am_ac_p:'Inverter en todas las habitaciones, regulable individualmente',am_park_h:'2 Plazas de aparcamiento',am_park_p:'Aparcamiento cubierto junto a la casa, incluido',am_garden_h:'Jardín med. 1.079 m²',am_garden_p:'Olivos, lavanda, cítricos',am_tv_h:'Smart TV',am_tv_p:'Smart TV en el salón con streaming',am_wash_h:'Lavadora',am_wash_p:'Lavadora y secadora, plancha',am_solar_h:'Instalación solar',am_solar_p:'Sistema fotovoltaico propio para energía sostenible',am_sec_h:'Seguridad',am_sec_p:'Sistema de alarma, cerraduras de seguridad',am_wine_h:'Vinoteca',am_wine_p:'Integrada, hasta 36 botellas',am_sound_h:'Sistema de sonido',am_sound_p:'Audio multiroom interior y exterior, Bluetooth',am_leisure_h:'Equipamiento de ocio',am_leisure_p:'Tumbonas, sombrillas, equipo de playa',am_kids_h:'Apto para niños',am_kids_p:'Cuna, trona, barrera de escalera a petición',promise1_h:'Servicio personal',promise1_p:'La familia Wunsch siempre está disponible',promise2_h:'Siempre muy bien valorada',promise2_p:'Todos los huéspedes dieron 5 estrellas',promise3_h:'Sin costes ocultos',promise3_p:'Limpieza final y WiFi incluidos',book_eyebrow:'Precios y reservas',book_p:'Sin comisiones. Directamente con Sophie y Lisa.',avail_h:'Disponibilidad y consulta',avail_p:'Elija sus fechas – Sophie y Lisa responderán en 24 horas.',lbl_fname:'Nombre',lbl_lname:'Apellidos',lbl_email:'E-Mail',lbl_phone:'Teléfono',lbl_guests:'Huéspedes',lbl_lang:'Idioma',lbl_msg:'Mensaje',ph_fname:'María',ph_lname:'García',ph_email:'su@email.es',ph_phone:'+34 …',ph_msg:'Peticiones especiales, preguntas…',btn_book:'Enviar consulta →',trust:'Cifrado SSL · Sin comisiones · Directamente con Sophie y Lisa',cal_avail:'Disponible',cal_sel:'Seleccionado',cal_booked:'Ocupado',cal_arrival:'Llegada',cal_dep:'Salida',price_period:'Período',price_rent:'Precio alquiler',price_clean:'Limpieza final',price_total:'Precio total',rest_eyebrow:'Guía gastronómica',rest_note:'\u003cstrong\u003eRecomendación de la familia Wunsch:\u003c/strong\u003e La CV-746 entre Moraira y Calpe es una de las carreteras más gastronómicas de la Costa Blanca.',filter_all:'Todos',filter_fine:'Alta cocina',filter_moraira:'Moraira',maps_open:'Abrir en Google Maps →',act_eyebrow:'Actividades y Excursiones',act_note:'\u003cstrong\u003eConsejo de la familia Wunsch:\u003c/strong\u003e La Costa Blanca tiene algo para todos.',filter_water:'Agua y Mar',filter_trip:'Excursiones',filter_family:'Familia',seh_eyebrow:'Playas y Naturaleza',seh_note:'\u003cstrong\u003eMoraira – la joya de la Costa Blanca:\u003c/strong\u003e A solo 12 km de la villa.',filter_strand:'Playas',filter_natur:'Naturaleza y Senderismo',eink_eyebrow:'Compras',eink_note:'\u003cstrong\u003eConsejo de la familia Wunsch:\u003c/strong\u003e Mercadona Benissa a solo 5 min.',filter_super:'Supermercados',filter_spezial:'Especialidades',about_eyebrow:'Sobre nosotras',about_p1:'Somos dos hermanas que llevan muchos años enamoradas de Moraira. Lo que empezó como un recuerdo de infancia se convirtió en una profunda conexión con esta costa, esta luz y ese sentimiento especial que solo la Costa Blanca puede dar.',about_p2:'Un día nos preguntamos: ¿y si pudiéramos compartir este sentimiento con otros? Así nació el sueño – y de ese sueño nació Villa Las Hermanas.',about_p3:'Queremos que viváis lo que Moraira significa para nosotras – y siempre estamos personalmente disponibles para vosotros.',about_btn1:'Consultar ahora',about_btn2:'Contacto y Ubicación',badge1:'5★ Valoraciones',badge2:'Responde < 24h',loc_eyebrow:'Ubicación',loc_p:'Alto sobre el Mediterráneo, en Benissa.',loc1_h:'Playa',loc1_p:'Cala Advocat y Cala del Moraig a solo 8 minutos',loc2_h:'Benissa',loc2_p:'Encantador centro con restaurantes y mercados a 10 min.',loc3_h:'Aeropuerto de Alicante',loc3_p:'Aprox. 80 km – unos 55 minutos en coche',loc4_h:'Actividades de ocio',loc4_p:'Senderismo, buceo, vela, rutas de vino – todo cerca',contact_h:'Enviar mensaje',ph_contact_name:'Nombre Apellidos',ph_contact_msg:'¿Cómo podemos ayudarle?',btn_contact:'Enviar mensaje →',host_eyebrow:'Vuestras anfitrionas',rev_form_h:'Dejar una valoración',rev_form_p:'¿Fue nuestro huésped?',rev_lbl_name:'Su nombre *',rev_lbl_country:'País de origen',rev_lbl_text:'Su valoración *',rev_ph_name:'María García',rev_ph_country:'España',rev_ph_text:'¿Cómo fue su estancia?',rev_btn:'Enviar valoración →',rev_note:'Se publicará tras revisión de Sophie y Lisa.',rev_thanks_h:'¡Muchas gracias!',rev_thanks_p:'Su valoración se publicará tras aprobación.',rev_rating_lbl:'Su valoración',tab_about:'Nosotras',footer_impressum:'Aviso legal',footer_datenschutz:'Privacidad',loading:'Cargando...',tab_guestbook:'Libro de visitas',empf_title:'Nuestras Recomendaciones',empf_all:'Todo',empf_rest:'🍽 Restaurantes',empf_akt:'🏄 Actividades',empf_str:'🏖 Playas',empf_eink:'🛒 Compras',empf_note:'<strong>Consejo de Sophie &amp; Lisa:</strong> Todo lo que la región tiene para ofrecer – desde restaurantes de nivel Michelin hasta las playas más bonitas.'},
  fr:{cta_book:'📅 Disponibilité & Prix',cta_loc:'📍 Situation & Contact',footer_book:'Réserver',footer_rest:'Restaurants',footer_loc:'Situation & Contact',am_eyebrow:'Équipements',am_hi:'en détail',am_highlights:'Points forts',am_all:'Équipements complets',tour_eyebrow:'Visite virtuelle',tour_h:'Explorez la villa',tour_hi:'en 3D',feat1_h:'Trois niveaux',feat1_p:'Séjour, 4 chambres, terrasse avec piscine',feat2_h:'Entièrement meublée',feat2_p:'Salon, cuisine équipée, 4 chambres',feat3_h:'Jardin méditerranéen',feat3_p:'1 079 m² de jardin, piscine et terrasses panoramiques',season_low:'Basse saison · Octobre – Avril',season_mid:'Moyenne saison · Mai, Jun, Sep, Oct',season_high:'Haute saison · Juillet – Août',season_badge:'Populaire',season_low_detail:'À partir de 2 450 € / semaine · min. 4 nuits',season_mid_detail:'À partir de 3 990 € / semaine · min. 5 nuits',season_high_detail:'À partir de 6 500 € / semaine · min. 7 nuits',season_incl:'✓ Ménage final inclus · ✓ WiFi inclus',per_night:'/ nuit',book_h:'Prix transparents,',book_hi:'réservation simple',rev_eyebrow:'Livre d\'or',rev_h:'Ce que disent',rev_hi:'nos hôtes',about_h:'Vos hôtes',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'WiFi fibre',am_wifi_p:'Internet haut débit partout, même sur la terrasse',am_ac_h:'Climatisation',am_ac_p:'Climatisation inverter dans toutes les pièces',am_park_h:'2 Places de parking privées',am_park_p:'Parking couvert directement à la villa, inclus',am_garden_h:'Jardin méd. 1 079 m²',am_garden_p:'Oliviers, lavande, agrumes',am_tv_h:'Smart TV',am_tv_p:'Smart TV dans le séjour avec streaming',am_wash_h:'Lave-linge',am_wash_p:'Lave-linge & sèche-linge, fer à repasser',am_solar_h:'Installation solaire',am_solar_p:'Système photovoltaïque propre pour énergie durable',am_sec_h:'Sécurité',am_sec_p:'Système d\'alarme, serrures de sécurité',am_wine_h:'Cave à vin',am_wine_p:'Intégrée, jusqu\'à 36 bouteilles',am_sound_h:'Système audio',am_sound_p:'Audio multiroom intérieur & extérieur, Bluetooth',am_leisure_h:'Équipement loisirs',am_leisure_p:'Chaises longues, parasols, équipement de plage',am_kids_h:'Adapté aux enfants',am_kids_p:'Lit bébé, chaise haute, barrière d\'escalier sur demande',promise1_h:'Service personnel',promise1_p:'La famille Wunsch est toujours disponible',promise2_h:'Toujours très bien noté',promise2_p:'Tous les hôtes ont donné 5 étoiles',promise3_h:'Sans frais cachés',promise3_p:'Ménage final et WiFi inclus',book_eyebrow:'Prix & Réservation',book_p:'Sans frais. Directement avec Sophie & Lisa.',avail_h:'Disponibilité & Demande',avail_p:'Choisissez vos dates – Sophie & Lisa répondront dans les 24h.',lbl_fname:'Prénom',lbl_lname:'Nom',lbl_email:'E-Mail',lbl_phone:'Téléphone',lbl_guests:'Voyageurs',lbl_lang:'Langue',lbl_msg:'Message',ph_fname:'Marie',ph_lname:'Dupont',ph_email:'votre@email.fr',ph_phone:'+33 …',ph_msg:'Demandes spéciales, questions…',btn_book:'Envoyer la demande →',trust:'Crypté SSL · Sans frais · Directement avec Sophie & Lisa',cal_avail:'Disponible',cal_sel:'Sélectionné',cal_booked:'Occupé',cal_arrival:'Arrivée',cal_dep:'Départ',price_period:'Période',price_rent:'Prix location',price_clean:'Ménage final',price_total:'Prix total',rest_eyebrow:'Guide gastronomique',rest_note:'\u003cstrong\u003eRecommandation de la famille Wunsch:\u003c/strong\u003e La CV-746 entre Moraira et Calpe est l\'une des routes les plus gastronomiques de la Costa Blanca.',filter_all:'Tous',filter_fine:'Haute cuisine',filter_moraira:'Moraira',maps_open:'Ouvrir dans Google Maps →',act_eyebrow:'Activités & Excursions',act_note:'\u003cstrong\u003eConseil de la famille Wunsch:\u003c/strong\u003e La Costa Blanca a quelque chose pour tout le monde.',filter_water:'Eau & Mer',filter_trip:'Excursions',filter_family:'Famille',seh_eyebrow:'Plages & Nature',seh_note:'\u003cstrong\u003eMoraira – le joyau de la Costa Blanca:\u003c/strong\u003e À seulement 12 km de la villa.',filter_strand:'Plages',filter_natur:'Nature & Randonnée',eink_eyebrow:'Shopping',eink_note:'\u003cstrong\u003eConseil de la famille Wunsch:\u003c/strong\u003e Mercadona Benissa à seulement 5 min.',filter_super:'Supermarchés',filter_spezial:'Spécialités',about_eyebrow:'À propos',about_p1:'Nous sommes deux sœurs qui aiment Moraira depuis de nombreuses années. Ce qui a commencé comme un souvenir d\'enfance est devenu une connexion profonde avec cette côte, cette lumière et ce sentiment particulier que seule la Costa Blanca peut offrir.',about_p2:'Un jour nous nous sommes demandé : et si nous pouvions partager ce sentiment avec d\'autres ? C\'est ainsi qu\'est né le rêve – et de ce rêve est née Villa Las Hermanas.',about_p3:'Nous voulons que vous viviez ce que Moraira représente pour nous – et nous sommes toujours personnellement disponibles pour vous.',about_btn1:'Faire une demande',about_btn2:'Contact & Situation',badge1:'5★ Avis',badge2:'Répond < 24h',loc_eyebrow:'Situation',loc_p:'Haut au-dessus de la Méditerranée, à Benissa.',loc1_h:'Plage',loc1_p:'Cala Advocat & Cala del Moraig à seulement 8 minutes',loc2_h:'Benissa',loc2_p:'Charmant centre-ville avec restaurants à 10 min.',loc3_h:'Aéroport d\'Alicante',loc3_p:'Env. 80 km – environ 55 minutes en voiture',loc4_h:'Loisirs',loc4_p:'Randonnée, plongée, voile, oenotourisme – tout à proximité',contact_h:'Envoyer un message',ph_contact_name:'Prénom Nom',ph_contact_msg:'Comment pouvons-nous vous aider?',btn_contact:'Envoyer →',host_eyebrow:'Vos hôtes',rev_form_h:'Laisser un avis',rev_form_p:'Étiez-vous notre hôte?',rev_lbl_name:'Votre nom *',rev_lbl_country:'Pays d\'origine',rev_lbl_text:'Votre avis *',rev_ph_name:'Marie Dupont',rev_ph_country:'France',rev_ph_text:'Comment était votre séjour?',rev_btn:'Envoyer l\'avis →',rev_note:'Sera publié après vérification par Sophie & Lisa.',rev_thanks_h:'Merci!',rev_thanks_p:'Votre avis sera publié après approbation.',rev_rating_lbl:'Votre note',tab_about:'À propos',footer_impressum:'Mentions légales',footer_datenschutz:'Confidentialité',loading:'Chargement...',tab_guestbook:'Livre d\'or',empf_title:'Nos Recommandations',empf_all:'Tout',empf_rest:'🍽 Restaurants',empf_akt:'🏄 Activités',empf_str:'🏖 Plages',empf_eink:'🛒 Shopping',empf_note:'<strong>Conseil de Sophie &amp; Lisa:</strong> Tout ce que la région a à offrir – des restaurants dignes du Michelin aux plus belles plages.'},
  nl:{cta_book:'📅 Beschikbaarheid & Prijzen',cta_loc:'📍 Ligging & Contact',footer_book:'Boeken',footer_rest:'Restaurants',footer_loc:'Ligging & Contact',am_eyebrow:'Voorzieningen',am_hi:'in detail',am_highlights:'Hoogtepunten',am_all:'Volledige voorzieningen',tour_eyebrow:'Virtuele tour',tour_h:'Ontdek de villa',tour_hi:'in 3D',feat1_h:'Drie niveaus',feat1_p:'Woonruimte, 4 slaapkamers, dakterras met zwembad',feat2_h:'Volledig gemeubileerd',feat2_p:'Woonkamer, volledig uitgeruste keuken, 4 slaapkamers',feat3_h:'Mediterrane tuin',feat3_p:'1.079 m² tuin, zwembad en panoramaterrassen',season_low:'Laagseizoen · Oktober – April',season_mid:'Tussenseizoen · Mei, Jun, Sep, Okt',season_high:'Hoogseizoen · Juli – Augustus',season_badge:'Populair',season_low_detail:'Wekelijks vanaf € 2.450 · min. 4 nachten',season_mid_detail:'Wekelijks vanaf € 3.990 · min. 5 nachten',season_high_detail:'Wekelijks vanaf € 6.500 · min. 7 nachten',season_incl:'✓ Eindschoonmaak inbegrepen · ✓ WiFi inbegrepen',per_night:'/ nacht',book_h:'Transparante prijzen,',book_hi:'eenvoudig boeken',rev_eyebrow:'Gastenboek',rev_h:'Wat onze gasten',rev_hi:'zeggen',about_h:'Uw gastheren',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'Glasvezel WiFi',am_wifi_p:'Snel internet overal, ook op het terras',am_ac_h:'Airconditioning',am_ac_p:'Inverter AC in alle kamers, individueel regelbaar',am_park_h:'2 Privéparkeerplaatsen',am_park_p:'Overdekte parkeerplaatsen direct bij de villa, inbegrepen',am_garden_h:'Med. tuin 1.079 m²',am_garden_p:'Olijven, lavendel, citrusbomen',am_tv_h:'Smart TV',am_tv_p:'Smart TV in de woonkamer met streaming',am_wash_h:'Wasmachine',am_wash_p:'Wasmachine & droger, strijkijzer',am_solar_h:'Zonne-installatie',am_solar_p:'Eigen fotovoltaïsch systeem voor duurzame energie',am_sec_h:'Beveiliging',am_sec_p:'Alarmsysteem, veiligheidssloten',am_wine_h:'Wijnkoelkast',am_wine_p:'Ingebouwd, tot 36 flessen',am_sound_h:'Geluidssysteem',am_sound_p:'Multiroom-audio binnen & buiten, Bluetooth',am_leisure_h:'Recreatie-uitrusting',am_leisure_p:'Ligstoelen, parasols, stranduitrusting',am_kids_h:'Kindvriendelijk',am_kids_p:'Babybedje, kinderstoel, traphekje op aanvraag',promise1_h:'Persoonlijke service',promise1_p:'Familie Wunsch is altijd bereikbaar',promise2_h:'Altijd uitstekend beoordeeld',promise2_p:'Alle gasten gaven 5 sterren',promise3_h:'Geen verborgen kosten',promise3_p:'Eindschoonmaak & WiFi inbegrepen',book_eyebrow:'Prijzen & Boeking',book_p:'Geen boekingskosten. Rechtstreeks bij Sophie & Lisa.',avail_h:'Beschikbaarheid & Aanvraag',avail_p:'Kies uw periode – Sophie & Lisa antwoorden binnen 24 uur.',lbl_fname:'Voornaam',lbl_lname:'Achternaam',lbl_email:'E-Mail',lbl_phone:'Telefoon',lbl_guests:'Gasten',lbl_lang:'Taal',lbl_msg:'Bericht',ph_fname:'Maria',ph_lname:'de Vries',ph_email:'uw@email.nl',ph_phone:'+31 …',ph_msg:'Speciale wensen, vragen…',btn_book:'Aanvraag versturen →',trust:'SSL-versleuteld · Geen boekingskosten · Rechtstreeks bij Sophie & Lisa',cal_avail:'Beschikbaar',cal_sel:'Geselecteerd',cal_booked:'Bezet',cal_arrival:'Aankomst',cal_dep:'Vertrek',price_period:'Periode',price_rent:'Huurprijs',price_clean:'Eindschoonmaak',price_total:'Totaalprijs',rest_eyebrow:'Culinaire gids',rest_note:'\u003cstrong\u003eAanbeveling van familie Wunsch:\u003c/strong\u003e De CV-746 tussen Moraira en Calpe is een van de meest gastronomische wegen van de Costa Blanca.',filter_all:'Alle',filter_fine:'Fine Dining',filter_moraira:'Moraira',maps_open:'Openen in Google Maps →',act_eyebrow:'Activiteiten & Uitstapjes',act_note:'\u003cstrong\u003eTip van familie Wunsch:\u003c/strong\u003e De Costa Blanca heeft voor ieder wat wils.',filter_water:'Water & Zee',filter_trip:'Uitstapjes',filter_family:'Familie',seh_eyebrow:'Stranden & Natuur',seh_note:'\u003cstrong\u003eMoraira – het juweel van de Costa Blanca:\u003c/strong\u003e Slechts 12 km van de villa.',filter_strand:'Stranden',filter_natur:'Natuur & Wandelen',eink_eyebrow:'Winkelen',eink_note:'\u003cstrong\u003eTip van familie Wunsch:\u003c/strong\u003e Mercadona Benissa op slechts 5 min.',filter_super:'Supermarkten',filter_spezial:'Specialiteiten',about_eyebrow:'Over ons',about_p1:'We zijn twee zussen die al vele jaren van Moraira houden. Wat begon als een jeugdherinnering groeide uit tot een diepe verbondenheid met deze kust, dit licht en dat bijzondere gevoel dat alleen de Costa Blanca kan geven.',about_p2:'Op een dag vroegen we ons af: wat als we dit gevoel met anderen konden delen? Zo ontstond de droom – en uit die droom ontstond Villa Las Hermanas.',about_p3:'We willen dat u beleeft wat Moraira voor ons betekent – en we zijn altijd persoonlijk voor u beschikbaar.',about_btn1:'Nu aanvragen',about_btn2:'Contact & Ligging',badge1:'5★ Beoordelingen',badge2:'Reageert < 24u',loc_eyebrow:'Ligging',loc_p:'Hoog boven de Middellandse Zee, in Benissa.',loc1_h:'Strand',loc1_p:'Cala Advocat & Cala del Moraig in slechts 8 minuten',loc2_h:'Benissa',loc2_p:'Charmant stadscentrum met restaurants op 10 min.',loc3_h:'Luchthaven Alicante',loc3_p:'Ca. 80 km – ongeveer 55 minuten rijden',loc4_h:'Vrijetijdsactiviteiten',loc4_p:'Wandelen, duiken, zeilen – alles dichtbij',contact_h:'Bericht sturen',ph_contact_name:'Voor- Achternaam',ph_contact_msg:'Hoe kunnen we u helpen?',btn_contact:'Bericht versturen →',host_eyebrow:'Uw gastheren',rev_form_h:'Beoordeling achterlaten',rev_form_p:'Was u onze gast?',rev_lbl_name:'Uw naam *',rev_lbl_country:'Land van herkomst',rev_lbl_text:'Uw beoordeling *',rev_ph_name:'Maria de Vries',rev_ph_country:'Nederland',rev_ph_text:'Hoe was uw verblijf?',rev_btn:'Beoordeling versturen →',rev_note:'Wordt gepubliceerd na goedkeuring door Sophie & Lisa.',rev_thanks_h:'Hartelijk dank!',rev_thanks_p:'Uw beoordeling wordt na goedkeuring gepubliceerd.',rev_rating_lbl:'Uw beoordeling',tab_about:'Over ons',footer_impressum:'Colofon',footer_datenschutz:'Privacybeleid',loading:'Laden...',tab_guestbook:'Gastenboek',empf_title:'Onze Aanbevelingen',empf_all:'Alle',empf_rest:'🍽 Restaurants',empf_akt:'🏄 Activiteiten',empf_str:'🏖 Stranden',empf_eink:'🛒 Winkelen',empf_note:'<strong>Tip van Sophie &amp; Lisa:</strong> Alles wat de regio te bieden heeft – van restaurants van Michelin-niveau tot de mooiste stranden.'},
  pl:{cta_book:'📅 Dostępność i Ceny',cta_loc:'📍 Lokalizacja i Kontakt',footer_book:'Rezerwuj',footer_rest:'Restauracje',footer_loc:'Lokalizacja i Kontakt',am_eyebrow:'Udogodnienia',am_hi:'w szczegółach',am_highlights:'Wyróżnienia',am_all:'Pełne udogodnienia',tour_eyebrow:'Wirtualna wycieczka',tour_h:'Poznaj willę',tour_hi:'w 3D',feat1_h:'Trzy poziomy',feat1_p:'Część dzienna, 4 sypialnie, taras z basenem',feat2_h:'W pełni umeblowana',feat2_p:'Salon, w pełni wyposażona kuchnia, 4 sypialnie',feat3_h:'Śródziemnomorski ogród',feat3_p:'1.079 m² ogrodu, basen i tarasy panoramiczne',season_low:'Niski sezon · Październik – Kwiecień',season_mid:'Pośredni sezon · Maj, Cze, Wrz, Paź',season_high:'Wysoki sezon · Lipiec – Sierpień',season_badge:'Popularne',season_low_detail:'Tygodniowo od € 2.450 · min. 4 noce',season_mid_detail:'Tygodniowo od € 3.990 · min. 5 nocy',season_high_detail:'Tygodniowo od € 6.500 · min. 7 nocy',season_incl:'✓ Sprzątanie końcowe w cenie · ✓ WiFi w cenie',per_night:'/ noc',book_h:'Przejrzyste ceny,',book_hi:'łatwa rezerwacja',rev_eyebrow:'Księga gości',rev_h:'Co mówią',rev_hi:'nasi goście',about_h:'Wasze gospodynie',about_hi:'Sophie Wunsch & Lisa Wunsch',am_wifi_h:'WiFi światłowodowe',am_wifi_p:'Szybki internet wszędzie, również na tarasie',am_ac_h:'Klimatyzacja',am_ac_p:'Klimatyzacja inverter we wszystkich pokojach',am_park_h:'2 Prywatne miejsca parkingowe',am_park_p:'Zadaszone miejsca parkingowe przy willi, w cenie',am_garden_h:'Ogród śródziemnomorski 1.079 m²',am_garden_p:'Oliwki, lawenda, drzewa cytrusowe',am_tv_h:'Smart TV',am_tv_p:'Smart TV w salonie ze streamingiem',am_wash_h:'Pralka',am_wash_p:'Pralka i suszarka, żelazko',am_solar_h:'Instalacja solarna',am_solar_p:'Własny system fotowoltaiczny dla zrównoważonej energii',am_sec_h:'Bezpieczeństwo',am_sec_p:'System alarmowy, zamki bezpieczeństwa',am_wine_h:'Chłodziarka do wina',am_wine_p:'Wbudowana, do 36 butelek',am_sound_h:'System nagłośnienia',am_sound_p:'Audio multiroom wewnątrz i na zewnątrz, Bluetooth',am_leisure_h:'Wyposażenie rekreacyjne',am_leisure_p:'Leżaki, parasole, sprzęt plażowy',am_kids_h:'Przyjazny dzieciom',am_kids_p:'Łóżeczko, krzesełko, bramka schodowa na życzenie',promise1_h:'Obsługa osobista',promise1_p:'Rodzina Wunsch jest zawsze do dyspozycji',promise2_h:'Zawsze najwyżej oceniana',promise2_p:'Wszyscy goście ocenili pobyt na 5 gwiazdek',promise3_h:'Brak ukrytych kosztów',promise3_p:'Sprzątanie końcowe i WiFi w cenie',book_eyebrow:'Ceny i Rezerwacja',book_p:'Bez opłat. Bezpośrednio z Sophie i Lisą.',avail_h:'Dostępność i zapytanie',avail_p:'Wybierz termin – Sophie i Lisa odpowiedzą w 24h.',lbl_fname:'Imię',lbl_lname:'Nazwisko',lbl_email:'E-Mail',lbl_phone:'Telefon',lbl_guests:'Goście',lbl_lang:'Język',lbl_msg:'Wiadomość',ph_fname:'Maria',ph_lname:'Kowalska',ph_email:'twoj@email.pl',ph_phone:'+48 …',ph_msg:'Specjalne życzenia, pytania…',btn_book:'Wyślij zapytanie →',trust:'Szyfrowanie SSL · Bez opłat · Bezpośrednio z Sophie i Lisą',cal_avail:'Dostępny',cal_sel:'Wybrany',cal_booked:'Zajęty',cal_arrival:'Przyjazd',cal_dep:'Wyjazd',price_period:'Okres',price_rent:'Cena wynajmu',price_clean:'Sprzątanie końcowe',price_total:'Cena całkowita',rest_eyebrow:'Przewodnik kulinarny',rest_note:'\u003cstrong\u003eRekomendacja rodziny Wunsch:\u003c/strong\u003e CV-746 między Morairą a Calpe jest jedną z najbogatszych gastronomicznie dróg na Costa Blanca.',filter_all:'Wszystkie',filter_fine:'Fine Dining',filter_moraira:'Moraira',maps_open:'Otwórz w Google Maps →',act_eyebrow:'Aktywności i Wycieczki',act_note:'\u003cstrong\u003eWskazówka od Sophie \u0026 Lisa:\u003c/strong\u003e Costa Blanca ma coś dla każdego.',filter_water:'Woda i Morze',filter_trip:'Wycieczki',filter_family:'Rodzina',seh_eyebrow:'Plaże i Natura',seh_note:'\u003cstrong\u003eMoraira – klejnot Costa Blanca:\u003c/strong\u003e Zaledwie 12 km od willi.',filter_strand:'Plaże',filter_natur:'Natura i Wędrówki',eink_eyebrow:'Zakupy',eink_note:'\u003cstrong\u003eWskazówka od Sophie \u0026 Lisa:\u003c/strong\u003e Mercadona Benissa tylko 5 min.',filter_super:'Supermarkety',filter_spezial:'Specjały',about_eyebrow:'O nas',about_p1:'Jesteśmy dwiema siostrami, które od wielu lat kochają Morairę. To, co zaczęło się jako wspomnienie z dzieciństwa, przerodziło się w głęboką więź z tym wybrzeżem, tym światłem i tym wyjątkowym uczuciem, które może dać tylko Costa Blanca.',about_p2:'Pewnego dnia zapytałyśmy się: co by było, gdybyśmy mogły podzielić się tym uczuciem z innymi? Tak powstało marzenie – a z marzenia powstała Villa Las Hermanas.',about_p3:'Chcemy, abyście doświadczyli tego, czym Moraira jest dla nas – i zawsze jesteśmy dla Was osobiście dostępne.',about_btn1:'Zapytaj teraz',about_btn2:'Kontakt i Lokalizacja',badge1:'5★ Opinie',badge2:'Odpowiada < 24h',loc_eyebrow:'Lokalizacja',loc_p:'Wysoko nad Morzem Śródziemnym, w Benissie.',loc1_h:'Plaża',loc1_p:'Cala Advocat i Cala del Moraig w zaledwie 8 minut',loc2_h:'Benissa',loc2_p:'Urocze centrum z restauracjami w 10 min.',loc3_h:'Lotnisko Alicante',loc3_p:'Ok. 80 km – około 55 minut jazdy',loc4_h:'Aktywności rekreacyjne',loc4_p:'Piesze wycieczki, nurkowanie, żeglarstwo – wszystko w pobliżu',contact_h:'Wyślij wiadomość',ph_contact_name:'Imię Nazwisko',ph_contact_msg:'Jak możemy Ci pomóc?',btn_contact:'Wyślij wiadomość →',host_eyebrow:'Wasze gospodynie',rev_form_h:'Zostaw opinię',rev_form_p:'Byłeś naszym gościem?',rev_lbl_name:'Twoje imię *',rev_lbl_country:'Kraj pochodzenia',rev_lbl_text:'Twoja opinia *',rev_ph_name:'Maria Kowalska',rev_ph_country:'Polska',rev_ph_text:'Jak był Twój pobyt?',rev_btn:'Wyślij opinię →',rev_note:'Zostanie opublikowana po zatwierdzeniu przez Sophie i Lisę.',rev_thanks_h:'Dziękujemy!',rev_thanks_p:'Opinia zostanie opublikowana po zatwierdzeniu.',rev_rating_lbl:'Twoja ocena',tab_about:'O nas',footer_impressum:'Nota prawna',footer_datenschutz:'Prywatność',loading:'Ładowanie...',tab_guestbook:'Księga gości',empf_title:'Nasze Rekomendacje',empf_all:'Wszystkie',empf_rest:'🍽 Restauracje',empf_akt:'🏄 Aktywności',empf_str:'🏖 Plaże',empf_eink:'🛒 Zakupy',empf_note:'<strong>Wskazówka rodziny Wunsch:</strong> Wszystko co region ma do zaoferowania – od restauracji godnych Michelin po najpiękniejsze plaże.'},
  ru:{cta_book:'📅 Наличие и Цены',cta_loc:'📍 Расположение и Контакт',footer_book:'Бронировать',footer_rest:'Рестораны',footer_loc:'Расположение и Контакт',am_eyebrow:'Удобства',am_hi:'в деталях',am_highlights:'Особенности',am_all:'Полное оснащение',tour_eyebrow:'Виртуальный тур',tour_h:'Исследуйте виллу',tour_hi:'в 3D',feat1_h:'Три уровня',feat1_p:'Гостиная, 4 спальни, крыша с бассейном',feat2_h:'Полностью меблированная',feat2_p:'Гостиная, полностью оборудованная кухня, 4 спальни',feat3_h:'Средиземноморский сад',feat3_p:'1 079 м² сада, бассейн и панорамные террасы',season_low:'Низкий сезон · Октябрь – Апрель',season_mid:'Межсезонье · Май, Июн, Сен, Окт',season_high:'Высокий сезон · Июль – Август',season_badge:'Популярно',season_low_detail:'Еженедельно от € 2.450 · мин. 4 ночи',season_mid_detail:'Еженедельно от € 3.990 · мин. 5 ночей',season_high_detail:'Еженедельно от € 6.500 · мин. 7 ночей',season_incl:'✓ Уборка включена · ✓ WiFi включен',per_night:'/ ночь',book_h:'Прозрачные цены,',book_hi:'простое бронирование',rev_eyebrow:'Книга гостей',rev_h:'Что говорят',rev_hi:'наши гости',about_h:'Ваши хозяйки',about_hi:'Софи Вунш & Лиза Вунш',am_wifi_h:'Оптоволоконный WiFi',am_wifi_p:'Высокоскоростной интернет везде, в том числе на террасе',am_ac_h:'Кондиционер',am_ac_p:'Инверторный кондиционер во всех комнатах',am_park_h:'2 Частных парковочных места',am_park_p:'Крытые парковочные места прямо у виллы, включены',am_garden_h:'Средиземноморский сад 1 079 м²',am_garden_p:'Оливки, лаванда, цитрусовые деревья',am_tv_h:'Smart TV',am_tv_p:'Smart TV в гостиной со стримингом',am_wash_h:'Стиральная машина',am_wash_p:'Стиральная машина и сушилка, утюг',am_solar_h:'Солнечная установка',am_solar_p:'Собственная фотовольтаическая система',am_sec_h:'Безопасность',am_sec_p:'Система сигнализации, замки безопасности',am_wine_h:'Винный холодильник',am_wine_p:'Встроенный, до 36 бутылок',am_sound_h:'Звуковая система',am_sound_p:'Мультирум-аудио внутри и снаружи, Bluetooth',am_leisure_h:'Оборудование для отдыха',am_leisure_p:'Шезлонги, зонты, пляжное снаряжение',am_kids_h:'Подходит для детей',am_kids_p:'Кроватка, стульчик, ворота для лестницы по запросу',promise1_h:'Личный сервис',promise1_p:'Семья Вунш всегда к вашим услугам',promise2_h:'Неизменно высокие оценки',promise2_p:'Все гости поставили 5 звёзд',promise3_h:'Никаких скрытых расходов',promise3_p:'Уборка и WiFi включены',book_eyebrow:'Цены и Бронирование',book_p:'Без комиссий. Напрямую с Софи и Лизой.',avail_h:'Наличие и запрос',avail_p:'Выберите даты – Софи и Лиза ответят в течение 24 часов.',lbl_fname:'Имя',lbl_lname:'Фамилия',lbl_email:'E-Mail',lbl_phone:'Телефон',lbl_guests:'Гостей',lbl_lang:'Язык',lbl_msg:'Сообщение',ph_fname:'Мария',ph_lname:'Иванова',ph_email:'ваш@email.ru',ph_phone:'+7 …',ph_msg:'Пожелания, вопросы…',btn_book:'Отправить запрос →',trust:'SSL-шифрование · Без комиссий · Напрямую с Софи и Лизой',cal_avail:'Доступно',cal_sel:'Выбрано',cal_booked:'Занято',cal_arrival:'Заезд',cal_dep:'Выезд',price_period:'Период',price_rent:'Стоимость аренды',price_clean:'Уборка',price_total:'Итого',rest_eyebrow:'Ресторанный гид',rest_note:'\u003cstrong\u003eРекомендация семьи Вунш:\u003c/strong\u003e CV-746 между Моραирой и Кальпе – одна из самых гастрономических дорог Коста-Бланки.',filter_all:'Все',filter_fine:'Высокая кухня',filter_moraira:'Моραира',maps_open:'Открыть в Google Maps →',act_eyebrow:'Активности и Экскурсии',act_note:'\u003cstrong\u003eСовет семьи Вунш:\u003c/strong\u003e На Коста-Бланке есть что-то для каждого.',filter_water:'Вода и Море',filter_trip:'Экскурсии',filter_family:'Семья',seh_eyebrow:'Пляжи и Природа',seh_note:'\u003cstrong\u003eМоραира – жемчужина Коста-Бланки:\u003c/strong\u003e Всего в 12 км от виллы.',filter_strand:'Пляжи',filter_natur:'Природа и Походы',eink_eyebrow:'Магазины',eink_note:'\u003cstrong\u003eСовет семьи Вунш:\u003c/strong\u003e Mercadona Benissa всего в 5 минутах.',filter_super:'Супермаркеты',filter_spezial:'Деликатесы',about_eyebrow:'О нас',about_p1:'Мы две сестры, которые много лет любят Моραиру. То, что началось как воспоминание детства, переросло в глубокую связь с этим побережьем, этим светом и особым чувством, которое может подарить только Коста-Бланка.',about_p2:'Однажды мы спросили себя: а что, если мы сможем поделиться этим чувством с другими? Так родилась мечта – и из мечты родилась Villa Las Hermanas.',about_p3:'Мы хотим, чтобы вы пережили то, что Моραира значит для нас – и мы всегда лично доступны для вас.',about_btn1:'Отправить запрос',about_btn2:'Контакт и Расположение',badge1:'5★ Отзывы',badge2:'Отвечает < 24ч',loc_eyebrow:'Расположение',loc_p:'Высоко над Средиземным морем, в Бенисе.',loc1_h:'Пляж',loc1_p:'Кала Адвокат и Кала дель Мораиг всего в 8 минутах',loc2_h:'Бениса',loc2_p:'Очаровательный центр с ресторанами в 10 мин.',loc3_h:'Аэропорт Аликанте',loc3_p:'Ок. 80 км – около 55 минут езды',loc4_h:'Развлечения',loc4_p:'Походы, дайвинг, парусный спорт – всё рядом',contact_h:'Отправить сообщение',ph_contact_name:'Имя Фамилия',ph_contact_msg:'Как мы можем вам помочь?',btn_contact:'Отправить →',host_eyebrow:'Ваши хозяйки',rev_form_h:'Оставить отзыв',rev_form_p:'Вы были нашим гостем?',rev_lbl_name:'Ваше имя *',rev_lbl_country:'Страна',rev_lbl_text:'Ваш отзыв *',rev_ph_name:'Мария Иванова',rev_ph_country:'Россия',rev_ph_text:'Как был ваш отдых?',rev_btn:'Отправить отзыв →',rev_note:'Будет опубликован после проверки Софи и Лизой.',rev_thanks_h:'Большое спасибо!',rev_thanks_p:'Ваш отзыв будет опубликован после одобрения.',rev_rating_lbl:'Ваша оценка',tab_about:'О нас',footer_impressum:'Правовая информация',footer_datenschutz:'Конфиденциальность',loading:'Загрузка...',tab_guestbook:'Книга гостей',empf_title:'Наши Рекомендации',empf_all:'Все',empf_rest:'🍽 Рестораны',empf_akt:'🏄 Активности',empf_str:'🏖 Пляжи',empf_eink:'🛒 Магазины',empf_note:'<strong>Совет от Софи и Лизы:</strong> Всё что регион может предложить – от ресторанов уровня Мишлен до красивейших пляжей.'}
};

// ── Ergänzende Übersetzungen für zuvor nicht erfasste statische Texte ──
var EXTRA = {
  de:{nav_contact:"Kontakt:",ft_discover:"Entdecken",ft_contact:"Kontakt",fact_roof:"Dachterrasse",footer_copy:"© 2026 Villa Las Hermanas · Familie Wunsch · Benissa, Costa Blanca",ax_eyebrow:"Exklusiver Neubau · Vermietungsstart 2027",ax_h1:"Die Villa",ax_h1i:"im Detail",ax_intro:"240 m² Wohnfläche, vier Etagen, unverbaubarer Blick auf Meer, Berge und Natur – entdecken Sie jedes Detail dieser außergewöhnlichen Architekturvilla.",ax_tour_p:"Drehen, zoomen und jede Ebene erkunden – so als wären Sie schon vor Ort.",ax_cta_p:"Direkt bei Sophie & Lisa anfragen – persönlich, ohne Buchungsgebühren.",bk_eyebrow_hero:"Preise & Verfügbarkeit",bk_eyebrow:"Preise & Buchung",bk_cta_p:"Fragen? Wir sind jederzeit persönlich für Sie da – per WhatsApp, E-Mail oder Telefon.",cta_rec:"★ Unsere Empfehlungen",ab_hero_h1:"Ihre Gastgeberinnen –",ab_hero_h1i:"Sophie & Lisa Wunsch",ab_badge:"Neubau · Vermietung ab 2027",lg_claim_eyebrow:"Lage & Kontakt",lg_claim_h:"Hoch über dem Meer –",lg_claim_hi:"mitten im Herzen der Costa Blanca",lg_claim_p:"Benissa, eine der schönsten und authentischsten Gemeinden der Region – ruhig gelegen, und doch alles in Reichweite.",contact_wa:"Direkt schreiben →",lg_pin_air:"✈️ Flughafen ~55 Min.",rev_intro:"Echte Erfahrungen, echte Menschen – die persönlichsten Zeilen über Villa Las Hermanas, direkt aus dem Herzen unserer Gäste."},
  en:{nav_contact:"Contact:",ft_discover:"Discover",ft_contact:"Contact",fact_roof:"Roof Terrace",footer_copy:"© 2026 Villa Las Hermanas · Wunsch Family · Benissa, Costa Blanca",ax_eyebrow:"Exclusive New Build · Rentals from 2027",ax_h1:"The Villa",ax_h1i:"in Detail",ax_intro:"240 m² of living space, four floors, unobstructed views of the sea, mountains and nature – discover every detail of this extraordinary architect-designed villa.",ax_tour_p:"Rotate, zoom and explore every level – as if you were already there.",ax_cta_p:"Enquire directly with Sophie & Lisa – personal, with no booking fees.",bk_eyebrow_hero:"Prices & Availability",bk_eyebrow:"Prices & Booking",bk_cta_p:"Questions? We are always here for you personally – via WhatsApp, email or phone.",cta_rec:"★ Our Recommendations",ab_hero_h1:"Your Hosts –",ab_hero_h1i:"Sophie & Lisa Wunsch",ab_badge:"New Build · Rentals from 2027",lg_claim_eyebrow:"Location & Contact",lg_claim_h:"High above the sea –",lg_claim_hi:"right in the heart of the Costa Blanca",lg_claim_p:"Benissa, one of the most beautiful and authentic towns in the region – peacefully located, yet with everything within reach.",contact_wa:"Message us directly →",lg_pin_air:"✈️ Airport ~55 min",rev_intro:"Real experiences, real people – the most personal words about Villa Las Hermanas, straight from the hearts of our guests."},
  es:{tab_empfehlungen:"Recomendaciones",nav_contact:"Contacto:",ft_discover:"Descubrir",ft_contact:"Contacto",fact_roof:"Azotea",footer_copy:"© 2026 Villa Las Hermanas · Familia Wunsch · Benissa, Costa Blanca",ax_eyebrow:"Obra nueva exclusiva · Alquiler desde 2027",ax_h1:"La Villa",ax_h1i:"en Detalle",ax_intro:"240 m² de superficie habitable, cuatro plantas, vistas despejadas al mar, la montaña y la naturaleza: descubre cada detalle de esta extraordinaria villa de autor.",ax_tour_p:"Gira, amplía y explora cada nivel, como si ya estuvieras allí.",ax_cta_p:"Consulta directamente con Sophie y Lisa: trato personal y sin comisiones de reserva.",bk_eyebrow_hero:"Precios y Disponibilidad",bk_eyebrow:"Precios y Reserva",bk_cta_p:"¿Preguntas? Estamos siempre a tu disposición en persona: por WhatsApp, correo o teléfono.",cta_rec:"★ Nuestras Recomendaciones",ab_hero_h1:"Tus Anfitrionas –",ab_hero_h1i:"Sophie y Lisa Wunsch",ab_badge:"Obra nueva · Alquiler desde 2027",lg_claim_eyebrow:"Ubicación y Contacto",lg_claim_h:"En lo alto sobre el mar –",lg_claim_hi:"en pleno corazón de la Costa Blanca",lg_claim_p:"Benissa, uno de los pueblos más bonitos y auténticos de la región: tranquilo, y con todo al alcance.",contact_wa:"Escríbenos directamente →",lg_pin_air:"✈️ Aeropuerto ~55 min",rev_intro:"Experiencias reales, personas reales: las líneas más personales sobre Villa Las Hermanas, directamente del corazón de nuestros huéspedes."},
  fr:{tab_empfehlungen:"Recommandations",nav_contact:"Contact :",ft_discover:"Découvrir",ft_contact:"Contact",fact_roof:"Toit-terrasse",footer_copy:"© 2026 Villa Las Hermanas · Famille Wunsch · Benissa, Costa Blanca",ax_eyebrow:"Construction neuve exclusive · Location dès 2027",ax_h1:"La Villa",ax_h1i:"en Détail",ax_intro:"240 m² de surface habitable, quatre étages, vue dégagée sur la mer, les montagnes et la nature – découvrez chaque détail de cette villa d'architecte exceptionnelle.",ax_tour_p:"Faites pivoter, zoomez et explorez chaque niveau – comme si vous y étiez déjà.",ax_cta_p:"Renseignez-vous directement auprès de Sophie & Lisa – contact personnel, sans frais de réservation.",bk_eyebrow_hero:"Prix & Disponibilité",bk_eyebrow:"Prix & Réservation",bk_cta_p:"Des questions ? Nous sommes toujours là pour vous personnellement – par WhatsApp, e-mail ou téléphone.",cta_rec:"★ Nos Recommandations",ab_hero_h1:"Vos Hôtesses –",ab_hero_h1i:"Sophie & Lisa Wunsch",ab_badge:"Construction neuve · Location dès 2027",lg_claim_eyebrow:"Situation & Contact",lg_claim_h:"Très haut au-dessus de la mer –",lg_claim_hi:"au cœur de la Costa Blanca",lg_claim_p:"Benissa, l'une des communes les plus belles et authentiques de la région – au calme, et pourtant tout à portée de main.",contact_wa:"Écrivez-nous directement →",lg_pin_air:"✈️ Aéroport ~55 min",rev_intro:"Des expériences vraies, des gens vrais – les mots les plus personnels sur la Villa Las Hermanas, droit venus du cœur de nos hôtes."},
  nl:{tab_empfehlungen:"Aanbevelingen",nav_contact:"Contact:",ft_discover:"Ontdekken",ft_contact:"Contact",fact_roof:"Dakterras",footer_copy:"© 2026 Villa Las Hermanas · Familie Wunsch · Benissa, Costa Blanca",ax_eyebrow:"Exclusieve nieuwbouw · Verhuur vanaf 2027",ax_h1:"De Villa",ax_h1i:"in Detail",ax_intro:"240 m² woonoppervlak, vier verdiepingen, vrij uitzicht op zee, bergen en natuur – ontdek elk detail van deze bijzondere architectenvilla.",ax_tour_p:"Draaien, zoomen en elke verdieping verkennen – alsof u er al bent.",ax_cta_p:"Vraag rechtstreeks bij Sophie & Lisa – persoonlijk, zonder boekingskosten.",bk_eyebrow_hero:"Prijzen & Beschikbaarheid",bk_eyebrow:"Prijzen & Boeking",bk_cta_p:"Vragen? Wij staan altijd persoonlijk voor u klaar – via WhatsApp, e-mail of telefoon.",cta_rec:"★ Onze Aanbevelingen",ab_hero_h1:"Uw Gastvrouwen –",ab_hero_h1i:"Sophie & Lisa Wunsch",ab_badge:"Nieuwbouw · Verhuur vanaf 2027",lg_claim_eyebrow:"Ligging & Contact",lg_claim_h:"Hoog boven de zee –",lg_claim_hi:"midden in het hart van de Costa Blanca",lg_claim_p:"Benissa, een van de mooiste en meest authentieke gemeenten van de regio – rustig gelegen en toch alles binnen handbereik.",contact_wa:"Stuur direct een bericht →",lg_pin_air:"✈️ Luchthaven ~55 min",rev_intro:"Echte ervaringen, echte mensen – de meest persoonlijke woorden over Villa Las Hermanas, recht uit het hart van onze gasten."},
  pl:{tab_empfehlungen:"Rekomendacje",nav_contact:"Kontakt:",ft_discover:"Odkryj",ft_contact:"Kontakt",fact_roof:"Taras na dachu",footer_copy:"© 2026 Villa Las Hermanas · Rodzina Wunsch · Benissa, Costa Blanca",ax_eyebrow:"Ekskluzywny nowy dom · Wynajem od 2027",ax_h1:"Willa",ax_h1i:"w Szczegółach",ax_intro:"240 m² powierzchni mieszkalnej, cztery kondygnacje, niczym niezasłonięty widok na morze, góry i przyrodę – odkryj każdy szczegół tej wyjątkowej autorskiej willi.",ax_tour_p:"Obracaj, przybliżaj i odkrywaj każdy poziom – tak, jakbyś już tam był.",ax_cta_p:"Zapytaj bezpośrednio Sophie i Lisę – osobiście, bez opłat rezerwacyjnych.",bk_eyebrow_hero:"Ceny i Dostępność",bk_eyebrow:"Ceny i Rezerwacja",bk_cta_p:"Pytania? Zawsze jesteśmy do Twojej dyspozycji osobiście – przez WhatsApp, e-mail lub telefon.",cta_rec:"★ Nasze Rekomendacje",ab_hero_h1:"Wasze Gospodynie –",ab_hero_h1i:"Sophie i Lisa Wunsch",ab_badge:"Nowy dom · Wynajem od 2027",lg_claim_eyebrow:"Lokalizacja i Kontakt",lg_claim_h:"Wysoko nad morzem –",lg_claim_hi:"w samym sercu Costa Blanca",lg_claim_p:"Benissa, jedna z najpiękniejszych i najbardziej autentycznych miejscowości regionu – spokojna, a jednak wszystko w zasięgu ręki.",contact_wa:"Napisz do nas bezpośrednio →",lg_pin_air:"✈️ Lotnisko ~55 min",rev_intro:"Prawdziwe doświadczenia, prawdziwi ludzie – najbardziej osobiste słowa o Villa Las Hermanas, prosto z serca naszych gości."},
  ru:{tab_empfehlungen:"Рекомендации",nav_contact:"Контакт:",ft_discover:"Разделы",ft_contact:"Контакты",fact_roof:"Крыша-терраса",footer_copy:"© 2026 Villa Las Hermanas · Семья Вунш · Бенисса, Коста-Бланка",ax_eyebrow:"Эксклюзивная новостройка · Аренда с 2027",ax_h1:"Вилла",ax_h1i:"в деталях",ax_intro:"240 м² жилой площади, четыре этажа, ничем не закрытый вид на море, горы и природу — откройте для себя каждую деталь этой необычной авторской виллы.",ax_tour_p:"Вращайте, приближайте и исследуйте каждый уровень — как будто вы уже здесь.",ax_cta_p:"Обращайтесь напрямую к Sophie и Lisa — лично и без комиссий за бронирование.",bk_eyebrow_hero:"Цены и наличие",bk_eyebrow:"Цены и бронирование",bk_cta_p:"Вопросы? Мы всегда лично на связи — через WhatsApp, e-mail или по телефону.",cta_rec:"★ Наши рекомендации",ab_hero_h1:"Ваши хозяйки —",ab_hero_h1i:"Sophie и Lisa Wunsch",ab_badge:"Новостройка · Аренда с 2027",lg_claim_eyebrow:"Расположение и контакты",lg_claim_h:"Высоко над морем —",lg_claim_hi:"в самом сердце Коста-Бланки",lg_claim_p:"Бенисса — один из самых красивых и аутентичных городков региона: тихое расположение и при этом всё под рукой.",contact_wa:"Написать напрямую →",lg_pin_air:"✈️ Аэропорт ~55 мин",rev_intro:"Настоящие впечатления, настоящие люди — самые личные слова о Villa Las Hermanas, прямо от сердца наших гостей."}
};
for (var _el in EXTRA) { if (!T[_el]) T[_el] = {}; for (var _ek in EXTRA[_el]) T[_el][_ek] = EXTRA[_el][_ek]; }

function setLang(lang) {
  currentLang = lang;
  var t = T[lang] || T.de;
  var tx = TX[lang] || TX.de;

  // 1. data-t Elemente
  document.querySelectorAll('[data-t]').forEach(function(el) {
    var k = el.getAttribute('data-t');
    if (tx[k]) el.textContent = tx[k];
    else if (t[k]) el.textContent = t[k];
  });

  // 2. Sprach-Switcher
  // data-ph Platzhalter
  document.querySelectorAll('[data-ph]').forEach(function(el) {
    var k = el.getAttribute('data-ph');
    if (tx[k]) el.placeholder = tx[k];
  });

  document.getElementById('current-flag').textContent = langFlags[lang];
  document.getElementById('current-lang').textContent = langCodes[lang];
  document.querySelectorAll('.lang-option').forEach(function(opt, i) {
    opt.classList.toggle('active', ['de','en','fr','nl','pl','ru','es'][i] === lang);
  });
  document.getElementById('lang-dropdown').classList.remove('open');
  document.documentElement.lang = lang;

  function q(sel){return document.querySelector(sel);}
  function qa(sel){return document.querySelectorAll(sel);}
  function set(sel,key,html){var el=q(sel);if(el&&tx[key]){if(html)el.innerHTML=tx[key];else el.textContent=tx[key];}}
  function ph(id,key){var el=document.getElementById(id);if(el&&tx[key])el.placeholder=tx[key];}

  // Start CTA Buttons
  var ctaBtns = qa('#page-start .start-cta-btns button');
  if(ctaBtns[0]&&tx.cta_book) ctaBtns[0].textContent=tx.cta_book;
  if(ctaBtns[1]&&tx.cta_loc) ctaBtns[1].textContent=tx.cta_loc;

  // (Footer-Links laufen jetzt über data-t — keine manuelle Index-Zuordnung mehr)

  // Ausstattung
  set('#page-ausstattung .eyebrow','am_eyebrow');
  var amTitles = qa('.am-section-title');
  if(amTitles[0]&&tx.am_highlights) amTitles[0].textContent=tx.am_highlights;
  if(amTitles[1]&&tx.am_all) amTitles[1].textContent=tx.am_all;
  var proms = qa('.am-promise-txt');
  if(proms[0]){if(tx.promise1_h)proms[0].querySelector('h5').textContent=tx.promise1_h;if(tx.promise1_p)proms[0].querySelector('p').textContent=tx.promise1_p;}
  if(proms[1]){if(tx.promise2_h)proms[1].querySelector('h5').textContent=tx.promise2_h;if(tx.promise2_p)proms[1].querySelector('p').textContent=tx.promise2_p;}
  if(proms[2]){if(tx.promise3_h)proms[2].querySelector('h5').textContent=tx.promise3_h;if(tx.promise3_p)proms[2].querySelector('p').textContent=tx.promise3_p;}

  // Buchen
  set('#page-buchen .eyebrow','book_eyebrow');
  set('#page-buchen .section-p','book_p');
  set('.book-form h3','avail_h');
  set('.book-form > p','avail_p');
  set('.btn-book','btn_book');
  set('.book-trust','trust');
  ph('b-fname','ph_fname'); ph('b-lname','ph_lname'); ph('b-email','ph_email'); ph('b-phone','ph_phone'); ph('b-msg','ph_msg');
  var fgLabels = qa('.book-form .fg label');
  var lblMap = ['lbl_fname','lbl_lname','lbl_email','lbl_phone','lbl_guests','lbl_lang','lbl_msg'];
  fgLabels.forEach(function(lbl,i){if(lblMap[i]&&tx[lblMap[i]])lbl.textContent=tx[lblMap[i]];});
  var calLeg = qa('.cal-leg-item span');
  if(calLeg[0]&&tx.cal_avail) calLeg[0].textContent=tx.cal_avail;
  if(calLeg[1]&&tx.cal_sel) calLeg[1].textContent=tx.cal_sel;
  if(calLeg[2]&&tx.cal_booked) calLeg[2].textContent=tx.cal_booked;
  var calSel = qa('.cal-sel-label');
  if(calSel[0]&&tx.cal_arrival) calSel[0].textContent=tx.cal_arrival;
  if(calSel[1]&&tx.cal_dep) calSel[1].textContent=tx.cal_dep;
  var pcRows = qa('.pc-row span:first-child');
  var rowKeys = ['price_period','price_rent',null,'price_total'];
  pcRows.forEach(function(s,i){if(rowKeys[i]&&tx[rowKeys[i]])s.textContent=tx[rowKeys[i]];});

  // Restaurants
  set('#page-restaurants .eyebrow','rest_eyebrow');
  set('#page-restaurants .listing-note','rest_note',true);
  var rBtns = qa('#page-restaurants .rf-btn');
  if(rBtns[0]&&tx.filter_all) rBtns[0].textContent=tx.filter_all+' (11)';
  if(rBtns[1]&&tx.filter_fine) rBtns[1].textContent=tx.filter_fine;
  if(rBtns[2]&&tx.filter_moraira) rBtns[2].textContent=tx.filter_moraira;
  qa('.rest-meta-row span[style*="color:var(--teal)"]').forEach(function(el){if(tx.maps_open)el.textContent=tx.maps_open;});

  // Aktivitäten
  set('#page-aktivitaeten .eyebrow','act_eyebrow');
  set('#page-aktivitaeten .listing-note','act_note',true);
  var aBtns = qa('#page-aktivitaeten .rf-btn');
  if(aBtns[0]&&tx.filter_all) aBtns[0].textContent=tx.filter_all;
  if(aBtns[1]&&tx.filter_water) aBtns[1].textContent=tx.filter_water;
  if(aBtns[2]&&tx.filter_trip) aBtns[2].textContent=tx.filter_trip;
  if(aBtns[3]&&tx.filter_family) aBtns[3].textContent=tx.filter_family;

  // Strände
  set('#page-straende .eyebrow','seh_eyebrow');
  set('#page-straende .listing-note','seh_note',true);
  var sBtns = qa('#page-straende .rf-btn');
  if(sBtns[0]&&tx.filter_all) sBtns[0].textContent=tx.filter_all;
  if(sBtns[1]&&tx.filter_strand) sBtns[1].textContent=tx.filter_strand;
  if(sBtns[3]&&tx.filter_natur) sBtns[3].textContent=tx.filter_natur;

  // Einkaufen
  set('#page-einkaufen .eyebrow','eink_eyebrow');
  set('#page-einkaufen .listing-note','eink_note',true);
  var eBtns = qa('#page-einkaufen .rf-btn');
  if(eBtns[0]&&tx.filter_all) eBtns[0].textContent=tx.filter_all;
  if(eBtns[1]&&tx.filter_super) eBtns[1].textContent=tx.filter_super;
  if(eBtns[2]&&tx.filter_spezial) eBtns[2].textContent=tx.filter_spezial;

  // Über uns
  set('#page-ueber-uns .eyebrow','about_eyebrow');
  var aPs = qa('#page-ueber-uns p[style*="font-size:.92rem"]');
  if(aPs[0]&&tx.about_p1) aPs[0].textContent=tx.about_p1;
  if(aPs[1]&&tx.about_p2) aPs[1].textContent=tx.about_p2;
  if(aPs[2]&&tx.about_p3) aPs[2].textContent=tx.about_p3;
  var aBtnA = qa('#page-ueber-uns button');
  if(aBtnA[0]&&tx.about_btn1) aBtnA[0].textContent=tx.about_btn1;
  if(aBtnA[1]&&tx.about_btn2) aBtnA[1].textContent=tx.about_btn2;
  var badges = qa('#page-ueber-uns .hbadge');
  if(badges[0]&&tx.badge1) badges[0].textContent=tx.badge1;
  if(badges[1]&&tx.badge2) badges[1].textContent=tx.badge2;

  // Lage
  set('#page-lage .eyebrow','loc_eyebrow');
  set('#page-lage .section-p','loc_p');
  var locItems = qa('#page-lage .loc-item');
  var locK = [['loc1_h','loc1_p'],['loc2_h','loc2_p'],['loc3_h','loc3_p'],['loc4_h','loc4_p']];
  locItems.forEach(function(item,i){
    if(!locK[i]) return;
    var h4=item.querySelector('h4'); if(h4&&tx[locK[i][0]]) h4.textContent=tx[locK[i][0]];
    var p=item.querySelector('p'); if(p&&tx[locK[i][1]]) p.textContent=tx[locK[i][1]];
  });
  var cH=q('#page-lage h3[style*="1.6rem"]'); if(cH&&tx.contact_h) cH.textContent=tx.contact_h;
  ph('contact-name','ph_contact_name'); ph('contact-msg','ph_contact_msg');
  var cBtn=q('#page-lage .btn-solid[onclick="sendContact()"]'); if(cBtn&&tx.btn_contact) cBtn.textContent=tx.btn_contact;
  var hEy=q('#page-lage div[style*="margin-top:2.5rem"] .eyebrow'); if(hEy&&tx.host_eyebrow) hEy.textContent=tx.host_eyebrow;

  // Empfehlungen
  var empfTitle=q('#page-empfehlungen h2');
  if(empfTitle){empfTitle.textContent=(tx.empf_title||t.empf_title||'Unsere Empfehlungen');}
  var empfBtns=qa('#page-empfehlungen .rf-btn');
  var empfKeys=['empf_all','empf_rest','empf_akt','empf_str','empf_eink'];
  empfBtns.forEach(function(btn,i){
    var k=empfKeys[i];
    if(k&&(tx[k]||t[k]))btn.textContent=(tx[k]||t[k]);
  });
  var empfNote=q('#page-empfehlungen .listing-note');
  if(empfNote&&(tx.empf_note||t.empf_note))empfNote.innerHTML=(tx.empf_note||t.empf_note);
  rebuildGridForLang(lang);

  // Gästebuch
  var rfh=q('.review-form-header h3'); if(rfh&&tx.rev_form_h) rfh.textContent=tx.rev_form_h;
  var rfp=q('.review-form-header p'); if(rfp&&tx.rev_form_p) rfp.textContent=tx.rev_form_p;
  ph('rv-name','rev_ph_name'); ph('rv-country','rev_ph_country'); ph('rv-text','rev_ph_text');
  var rBtn=q('.review-form-footer .btn-solid'); if(rBtn&&tx.rev_btn) rBtn.textContent=tx.rev_btn;
  var rNote=q('.review-form-note'); if(rNote&&tx.rev_note) rNote.textContent='⚐ '+tx.rev_note;
  var rLbl=q('.star-rating-label'); if(rLbl&&tx.rev_rating_lbl) rLbl.textContent=tx.rev_rating_lbl;
  var rfgL=qa('.review-form-grid .fg label');
  if(rfgL[0]&&tx.rev_lbl_name) rfgL[0].textContent=tx.rev_lbl_name;
  if(rfgL[1]&&tx.rev_lbl_country) rfgL[1].textContent=tx.rev_lbl_country;
  var rtL=q('#review-form-body > .fg label'); if(rtL&&tx.rev_lbl_text) rtL.textContent=tx.rev_lbl_text;
  var rtH=q('#review-success h3'); if(rtH&&tx.rev_thanks_h) rtH.textContent=tx.rev_thanks_h;
  var rtP=q('#review-success p'); if(rtP&&tx.rev_thanks_p) rtP.textContent=tx.rev_thanks_p;

  // Kalender neu rendern mit aktueller Sprache
  if (window._calInit) {
    setTimeout(function(){ renderCalendar(); updateCalSelection(); }, 10);
  }
}

function toggleLangDropdown() {
  document.getElementById('lang-dropdown').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  if (!e.target.closest('.lang-switcher')) document.getElementById('lang-dropdown').classList.remove('open');
});

// ═══════════════════════════════════════
// CARD DATA & RENDERING
// ═══════════════════════════════════════
var restData = [
  {cat:'moraira fine',name:'Restaurante Vista Ifach',img:'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=75',dist:'12 km · 15 Min.',stars:'★ 4.5',reviews:'714',cuisine:'Mediterran · Meerblick · Moraira',tags:['Meerblick-Terrasse','Täglich geöffnet'],desc:'Direkt am Hafen von Moraira, mit Blick auf den Peñón de Ifach – perfekt zum Sonnenuntergang. Gehobenes Preisniveau, aber jeder Euro ist es wert. Eine der schönsten Terrassen der gesamten Costa Blanca.',phone:'+34 966 49 24 94',addr:'C. Castillo, 11 · Moraira',hours:'Mo–So 10:00–23:00',maps:'https://www.google.com/maps/search/?api=1&query=Restaurante+Vista+Ifach+Moraira',price:'€€€',special:'✦ Tipp: Tisch zur Abendstunde reservieren – der Ausblick ist unvergesslich'},
  {cat:'moraira',name:'El Chamizo',img:'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=75',dist:'11 km · 13 Min.',stars:'★ 4.2',reviews:'3.211',cuisine:'Paella · Meeresfrüchte · CV-746',tags:['Unser Liebling','Erste Strandreihe'],desc:'Eines unserer absoluten Lieblingsrestaurants. Direkt am Strand, erste Reihe – hier gibt es die hervorragendste Paella der Region. Im Sommer unbedingt reservieren, sonst wird es schwierig.',phone:'+34 965 74 30 90',addr:'Ctra. Moraira a Calpe, Km 1.3',hours:'Mo–So 11:30–22:00',maps:'https://www.google.com/maps/search/?api=1&query=El+Chamizo+Moraira',price:'€€',special:'✦ Tipp: Im Sommer früh reservieren – sehr beliebt!'},
  {cat:'moraira fine',name:'Amantes de Moraira',img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',dist:'11 km · 13 Min.',stars:'★ 4.3',reviews:'1.311',cuisine:'Fine Dining · Meeresfrüchte · CV-746',tags:['Romantisch','Klavier-Abende','Meerblick'],desc:'Ein Abendessen hier ist kein gewöhnliches Dinner – es ist ein Erlebnis. Klaviermusik, elegantes Ambiente, Meerblick und eine Küche, die wirklich beeindruckt. Perfekt für einen besonderen Abend zu zweit.',phone:'+34 616 74 91 67',addr:'Ctra. Moraira a Calpe, 119',hours:'Mo–So 12:30–00:00',maps:'https://www.google.com/maps/search/?api=1&query=Amantes+de+Moraira',price:'€€€',special:'✦ Tipp: Sommerabend mit Klaviermusik reservieren'},
  {cat:'moraira',name:"Algas l\'Andragó",img:'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=75',dist:'10 km · 12 Min.',stars:'★ 4.3',reviews:'3.137',cuisine:'Bar · Café · Meerblick',tags:['Frühstück & Cocktails','Sonnenuntergang'],desc:'Ideal für alles – ob morgendlicher Kaffee, entspannter Snack am Mittag oder Cocktails zum Sonnenuntergang. Direkt an der CV-746 mit unverbautem Meerblick, ab 9:30 Uhr geöffnet.',phone:'keine Tel. – walk-in',addr:'Ctra. Moraira a Calpe · CV-746',hours:'Mo–So 9:30–21:30',maps:'https://www.google.com/maps/search/?api=1&query=Algas+Andrago+Moraira',price:'€€',special:'✦ Tipp: Sonnenuntergang um 19:00 – bester Platz der Küste'},
  {cat:'moraira fine',name:'Maxim Restaurante',img:'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75',dist:'11 km · CV-746',stars:'★ 4.7',reviews:'1.235',cuisine:'Fine Dining · Mediterran · CV-746',tags:['Top bewertet','Wechselnde Menüs'],desc:'Fine Dining auf höchstem Niveau – wechselnde Menüs, außergewöhnliche Präsentation und ein Service, der keine Wünsche offen lässt. Seit 2016 die erste Adresse für exklusives Dining an der Costa Blanca.',phone:'+34 965 74 81 93',addr:'C. Cabo San Vicente, 1',hours:'Di–So 13:00–15:00 & 19:00–22:00',maps:'https://www.google.com/maps/search/?api=1&query=Maxim+Restaurante+Moraira',price:'€€€'},
  {cat:'moraira fine',name:'Kosta',img:'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=75',dist:'11 km · CV-746',stars:'★ 4.8',reviews:'1.059',cuisine:'Mediterran · Italienisch · CV-746',tags:['Fast alle 5 Sterne','Herzlicher Chef'],desc:'Fast alle Bewertungen: 5 Sterne. Der herzliche Inhaber steht selbst in der Küche und sorgt für ein Erlebnis, das man nicht vergisst. Die Plätze draußen sind begrenzt – unbedingt reservieren!',phone:'+34 865 77 83 00',addr:'C. Espadan, Ctra. Moraira a Calpe',hours:'Di–So 12:30–16:00 & 18:30–23:30',maps:'https://www.google.com/maps/search/?api=1&query=Kosta+Restaurante+Moraira',price:'€€€',special:'✦ Tipp: Außenplätze begrenzt – unbedingt reservieren!'},
  {cat:'moraira',name:'Xiringuito Olalà',img:'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=75',dist:'15 km · 18 Min.',stars:'★ 4.2',reviews:'2.024',cuisine:'Strandbar · Livemusik · Benissa',tags:['Traumhafte Abendkulisse','Ifach-Blick'],desc:'Traumhafte Abendkulisse mit direktem Blick auf den Peñón de Ifach – hier empfehlen wir persönlich den Caesar Salad mit Hähnchen. Livemusik an manchen Abenden, dazu ein Glas Rosé: pures Mittelmeer-Gefühl.',phone:'+34 680 50 74 69',addr:'Carrer de la Manta, 7 · Benissa',hours:'Mo–So 10:00–20:00',maps:'https://www.google.com/maps/search/?api=1&query=Xiringuito+Olala+Benissa',price:'€€',special:'✦ Persönlicher Tipp: Caesar Salad mit Hähnchen'},
  {cat:'moraira',name:'Tutto Frutto',img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=75',dist:'12 km · 15 Min.',stars:'★ 4.4',reviews:'956',cuisine:'Eis · Desserts · Moraira Zentrum',tags:['Beste Gelati','Riesige Portionen'],desc:'Das wohl beste Eis an der gesamten Costa Blanca – der sympathische Inhaber macht über 40 Sorten selbst, die Kugeln sind riesig und auch die Milchshakes sind absolut unwiderstehlich. Pflichtbesuch nach dem Abendessen!',phone:'+34 644 26 62 48',addr:'P.º Senillar · Moraira Zentrum',hours:'Mo–So 12:00–00:00',maps:'https://www.google.com/maps/search/?api=1&query=Tutto+Frutto+Moraira',price:'€',special:'✦ Tipp: Max. 2 Kugeln Medium – schmilzt sonst zu schnell!'},
  {cat:'moraira',name:'Pizzeria La Tartana',img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=75',dist:'12 km · 15 Min.',stars:'★ 4.3',reviews:'687',cuisine:'Pizza · Pasta · Moraira',tags:['Große Portionen','Pizza to Go'],desc:'Perfekt für einen entspannten Abend ohne großes Tamtam – einfache, aber wirklich leckere Küche mit großzügigen Portionen. Die Schnitzel sind legendär groß und sehr beliebt. Nach einem langen Strandtag auch ideal für Pizza to Go.',phone:'+34 965 74 41 23',addr:'C. Cantábrico · Moraira',hours:'Di–So 13:00–15:30 & 19:00–22:30',maps:'https://www.google.com/maps/search/?api=1&query=Pizzeria+La+Tartana+Moraira',price:'€€'},
  {cat:'moraira',name:'Bar Restaurante Pinos (Maria)',img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',dist:'~30 Min. · Bergdorf',stars:'★ 4.6',reviews:'312',cuisine:'Traditionell · Spanisch · Bergdorf',tags:['Authentisch','Kein Tourismus'],desc:'Wer das ursprüngliche Spanien abseits aller Touristenrouten erleben möchte, sollte unbedingt hierher fahren. Dieses kleine Familienrestaurant in den Bergen serviert wenige, aber herzhafte Gerichte zu sehr fairen Preisen. Ein Erlebnis, das bleibt.',addr:'Bergdorf in der Umgebung · ca. 30 Min.',hours:'Tägl. ~12:00–20:00 (schließt früh!)',maps:'https://www.google.com/maps/search/?api=1&query=Bar+Restaurante+Pinos+Benissa',price:'€',special:'✦ Tipp: Schließt bereits gegen 20 Uhr – früh planen!'},
  {cat:'moraira fine',name:'Food Bar Moraira',img:'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75',dist:'12 km · 15 Min.',stars:'★ 4.5',reviews:'543',cuisine:'Modern · Vielseitig · Moraira',tags:['Unser Lieblingsspot','Lunch & Abend'],desc:'Einer unserer absoluten Lieblingsorte in Moraira. Modernes Ambiente, eine vielseitige Karte mit wirklich für jeden etwas dabei – ob leichter Lunch oder entspannter Abend mit Freunden. Die Qualität stimmt, die Atmosphäre auch.',phone:'+34 965 74 55 67',addr:'Moraira Zentrum',hours:'Di–So 12:30–23:00',maps:'https://www.google.com/maps/search/?api=1&query=Food+Bar+Moraira',price:'€€'},
  {cat:'moraira',name:'Bar Cascada',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=75',dist:'12 km · 15 Min.',stars:'★ 4.4',reviews:'428',cuisine:'Café · Bar · Moraira',tags:['Frühstück','Meerblick'],desc:'Wunderschöner Frühstücksspot mit herzlichem Inhaber und manchmal ganz besonderen Veranstaltungen. Unser Geheimtipp: Fragt unbedingt nach der Dachterrasse – von dort hat man einen traumhaften Blick aufs Meer.',phone:'+34 965 74 22 11',addr:'Moraira · Hafennähe',hours:'Mo–So 8:00–22:00',maps:'https://www.google.com/maps/search/?api=1&query=Bar+Cascada+Moraira',price:'€€',special:'✦ Geheimtipp: Nach der Dachterrasse fragen!'},
  {cat:'moraira',name:'El Raco',img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',dist:'12 km · El Portet',stars:'★ 4.5',reviews:'891',cuisine:'Strandbar · Tapas · El Portet',tags:['Strandlage','Sonnenuntergang'],desc:'Eine typisch spanische Strandbar direkt in der kleinen Bucht El Portet – besonders schön in der Nebensaison, wenn es ruhiger ist. Zum Sonnenuntergang mit einem Glas Weißwein und Pan con Aioli: pures Mittelmeer-Feeling.',addr:'Cala el Portet · Moraira',hours:'Tägl. 10:00–22:00 (saisonal)',maps:'https://www.google.com/maps/search/?api=1&query=El+Raco+Portet+Moraira',price:'€€',special:'✦ Tipp: Pan con Aioli + Weißwein zum Sonnenuntergang'},
  {cat:'moraira fine',name:'Le Dauphin',img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',dist:'12 km · Moraira',stars:'★ 4.6',reviews:'762',cuisine:'Fine Dining · Französisch · Moraira',tags:['Traumhafte Aussicht','Besonderer Abend'],desc:'Für einen wirklich besonderen Abend – traumhafte Aussicht, elegante Atmosphäre und eine hochwertige Küche, die begeistert. Unser Tipp für Jubiläen, Geburtstage oder einfach wenn man sich selbst etwas Gutes tun möchte.',phone:'+34 965 74 56 89',addr:'Moraira · Hafenbereich',hours:'Di–So 13:00–15:00 & 19:30–22:30',maps:'https://www.google.com/maps/search/?api=1&query=Le+Dauphin+Moraira',price:'€€€',special:'✦ Tipp: Tisch zur goldenen Stunde reservieren'},
];

var aktData = [
  {cat:'ausflug',name:"Penyal d\'Ifac – Calpe",img:'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600&q=75',dist:'18 km · Calpe',stars:'★ 4.6',reviews:'11.559',cuisine:'Naturpark · Wandern · Calpe',tags:['Wahrzeichen Costa Blanca','300m Felsen','Pflichtausflug'],desc:"Das Wahrzeichen der Costa Blanca – 300m hoher Felsen direkt aus dem Meer. Aufstieg ca. 1,5h, atemberaubendes 360°-Panorama bis nach Ibiza. Festes Schuhwerk und mindestens 1L Wasser mitbringen!",phone:'+34 679 19 59 12',addr:'C. Isla de Formentera · Calpe',hours:'Mo–Fr 8:30–14:30 · Sa–So 9:00–14:00',maps:'https://www.google.com/maps/search/?api=1&query=Penyal+Ifac+Calpe',special:'✦ Tipp: Online-Reservierung nötig · festes Schuhwerk · mind. 1L Wasser'},
  {cat:'wasser',name:'Moraira Adventure',img:'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=75',dist:'13 km · Teulada',stars:'★ 5.0',reviews:'36',cuisine:'Kayak · SUP · Jetski · Schnorcheln',tags:['★ 5,0 Perfekt','Höhlen-Kayak','Jetski-Touren'],desc:'Kayak-Touren durch spektakuläre Küstenhöhlen, SUP-Verleih, aufregende Jetski-Touren entlang der Felsküste und Schnorcheln mit professionellen Guides.',phone:'+34 613 19 04 90',addr:'C. Pintor Durero, 1 · Teulada',hours:'Mo–So 9:00–17:00',maps:'https://www.google.com/maps/search/?api=1&query=Moraira+Adventure+Teulada',special:'✦ Tipp: Morgens Sunrise SUP Tour, nachmittags Jetski – perfekter Wassertag'},
  {cat:'familie ausflug',name:'Mundomar Benidorm',img:'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=600&q=75',dist:'45 km · Benidorm',stars:'★ 4.5',reviews:'10.099',cuisine:'Tierpark · Delfine · Benidorm',tags:['Delfinshow','Delfin berühren','Kombi mit Aqualandia'],desc:'Spektakuläre Delfin-, Seelöwen- und Papageienshow. Delfine berühren für €17 (online). Kombikarte mit Aqualandia empfohlen – beide Parks an einem Tag!',phone:'+34 965 86 91 01',addr:'Carrer Serra Gelada, s/n · Benidorm',hours:'Tägl. 10:30–19:00 (saisonal)',maps:'https://www.google.com/maps/search/?api=1&query=Mundomar+Benidorm',special:'✦ Tipp: Kombi-Ticket mit Aqualandia – maximales Erlebnis für die ganze Familie'},
  {cat:'familie ausflug',name:'Aqualandia Benidorm',img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75',dist:'45 km · Benidorm',stars:'★ 4.2',reviews:'20.035',cuisine:'Wasserpark · Rutschen · Benidorm',tags:['Größter Wasserpark Spaniens','Vertigo-Rutsche'],desc:'Europas beliebtester Wasserpark – die legendäre Vertigo-Rutsche ist ein Muss! Riesige Auswahl für alle Altersgruppen. Perfekt kombinierbar mit Mundomar nebenan.',phone:'+34 965 86 01 00',addr:'Sierra Helada, s/n · Benidorm',hours:'Tägl. 10:00–19:00 (saisonal)',maps:'https://www.google.com/maps/search/?api=1&query=Aqualandia+Benidorm',special:'✦ Tipp: Eigene Snacks mitbringen – spart bis zu €30'},
  {cat:'familie ausflug',name:'Safari Aitana',img:'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=75',dist:'35 km · Penàguila',stars:'★ 4.4',reviews:'2.800',cuisine:'Safaripark · Tiere · Penàguila',tags:['Safaribus','Giraffenfüttern','Private Tour möglich'],desc:'Spaniens größter Safaripark in der Bergwelt der Sierra Aitana – Giraffen, Zebras, Nashörner und viele mehr. Private Touren für kleine Gruppen buchbar – näher dran, intensiver erleben.',phone:'+34 965 88 29 41',addr:'Partida Aitana, s/n · Penàguila',hours:'Mo–So 9:00–18:00 (saisonal)',maps:'https://www.google.com/maps/search/?api=1&query=Safari+Aitana+Penaguila',special:'✦ Tipp: Private Tour buchen – exklusiver Kontakt zu den Tieren'},
  {cat:'familie',name:'AV Karting Moraira',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75',dist:'12 km · Moraira',stars:'★ 4.3',reviews:'380',cuisine:'Kartbahn · Spaß · Moraira',tags:['Für alle Altersgruppen','Outdoor-Kartbahn'],desc:'Moderne Outdoor-Kartbahn direkt bei Moraira – ideal für Familien, Gruppen und alle die Spaß am Fahren haben.',phone:'+34 965 74 56 78',addr:'Ctra. Moraira · Teulada',hours:'Mo–So 10:00–20:00',maps:'https://www.google.com/maps/search/?api=1&query=Karting+Moraira',special:'✦ Tipp: Abends wenn es kühler ist – mehr Spaß!'},
  {cat:'ausflug markt',name:'Wochenmarkt Moraira',img:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=75',dist:'12 km · Moraira',stars:'★ 4.5',reviews:'320',cuisine:'Markt · Lokal · Freitags',tags:['Jeden Freitag','Frische Produkte','Lokales Handwerk'],desc:'Jeden Freitagmorgen am Hafen von Moraira – frisches Obst & Gemüse, lokale Delikatessen, Handwerk und die pure Atmosphäre echten spanischen Marktlebens.',addr:'Paseo de los Marineros · Moraira',hours:'Freitags 9:00–14:00',maps:'https://www.google.com/maps/search/?api=1&query=Mercado+Moraira',special:'✦ Tipp: Früh kommen – die besten Stände sind schnell weg'},
  {cat:'natur wandern',name:"Torre del Cap d\'Or",img:'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=75',dist:'15 km · Moraira',stars:'★ 4.7',reviews:'210',cuisine:'Wanderung · Wachturm · Panorama',tags:['Spektakulärer Meerblick','Leichte Wanderung','Historisch'],desc:"Kurze, lohnende Wanderung zum mittelalterlichen Wachturm mit atemberaubendem Panoramablick auf das Meer und die Küste bis zum Penyal d'Ifac – eines der schönsten Aussichtspunkte der Region.",addr:"Cap d'Or · Moraira",hours:'Täglich · Kostenlos · Ca. 45 Min.',maps:'https://www.google.com/maps/search/?api=1&query=Torre+Cap+Or+Moraira',special:'✦ Tipp: Zum Sonnenuntergang wandern – unvergessliches Panorama'},
  {cat:'natur ausflug',name:"Fonts d\'Algar",img:'https://images.unsplash.com/photo-1467038560927-b6c7c4c87c46?w=600&q=75',dist:'28 km · Callosa d\'en Sarrià',stars:'★ 4.4',reviews:'4.100',cuisine:'Naturquellen · Baden · Callosa',tags:['Natürliche Badepools','Wasserfall','Familien'],desc:'Magische Naturquellen mit kristallklaren Badepools und kleinen Wasserfällen mitten im Grünen – einer der beliebtesten Ausflüge der ganzen Costa Blanca.',phone:'+34 966 88 00 92',addr:"Partida Fonts d'Algar · Callosa d'en Sarrià",hours:'Mai–Sep 10:00–19:00 · Eintritt: €3',maps:"https://www.google.com/maps/search/?api=1&query=Fonts+Algar+Callosa+d+en+Sarria",special:'✦ Tipp: Unter der Woche kommen – am Wochenende sehr voll'},
  {cat:'ausflug kultur',name:'Guadalest',img:'https://images.unsplash.com/photo-1558620990-bd91c4038c53?w=600&q=75',dist:'40 km · El Castell de Guadalest',stars:'★ 4.5',reviews:'15.200',cuisine:'Bergdorf · Burg · Stausee',tags:['Malerisches Bergdorf','Burganlage','Stausee-Panorama'],desc:'Eines der schönsten Bergdörfer Spaniens – hoch auf einem Felsen thronend, mit Burganlage, Blick auf den türkisblauen Stausee und charmanten kleinen Geschäften.',addr:'El Castell de Guadalest',hours:'Täglich 10:00–18:00 (saisonal)',maps:'https://www.google.com/maps/search/?api=1&query=Guadalest+Alicante',special:'✦ Tipp: Morgens früh – vor den Tagestouristen aus Benidorm'},
  {cat:'ausflug kultur',name:'Elche – Palmenhain & Markt',img:'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=600&q=75',dist:'75 km · Elche',stars:'★ 4.6',reviews:'8.400',cuisine:'UNESCO · Palmen · Markt',tags:['UNESCO Welterbe','Größter Palmenhain Europas','Samstagsmarkt'],desc:'UNESCO-Welterbe: der größte Palmenhain Europas mit über 200.000 Palmen. Dazu ein lebhafter Samstagsmarkt und das historische Stadtzentrum – ein einzigartiger Tagesausflug.',addr:'Parque Municipal El Palmeral · Elche',hours:'Täglich 9:00–20:00',maps:'https://www.google.com/maps/search/?api=1&query=Palmeral+Elche',special:'✦ Tipp: Samstags – Markt + Palmen = perfekter Tagesausflug'},
  {cat:'ausflug stadt',name:'Valencia – Tagesausflug',img:'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=75',dist:'110 km · Valencia',stars:'★ 4.8',reviews:'52.000',cuisine:'Großstadt · Kultur · Gastronomie',tags:['Ciudad de las Artes','Heimat der Paella','Historische Altstadt'],desc:'Die pulsierende Metropole Valencia – futuristische Ciudad de las Artes y las Ciencias, das historische Zentrum, die prächtige Markthalle und Original-Paella in ihrer Heimatstadt. Ein absolutes Muss!',addr:'Valencia, Spanien',hours:'Ganzjährig · Anfahrt ca. 1,5h',maps:'https://www.google.com/maps/search/?api=1&query=Valencia+Spain+Ciudad+Artes+Ciencias',special:'✦ Tipp: La Pepica am Hafen – Hemingways Lieblingsrestaurant für Original-Paella'},
  {cat:'ausflug einkaufen',name:'Centro Comercial La Marina',img:'https://images.unsplash.com/photo-1519567770579-c2fc5f9d7e0c?w=600&q=75',dist:'32 km · Dénia',stars:'★ 4.0',reviews:'1.200',cuisine:'Shopping · Klimatisiert · Dénia',tags:['Viele Shops','Klimatisiert','Ideal bei Regen'],desc:'Großes Einkaufszentrum nahe Dénia – ideal für einen Regentag oder heiße Mittagsstunden. Mode, Elektronik, Restaurants und Kino unter einem klimatisierten Dach.',addr:'Ctra. La Marina, s/n · El Verger',hours:'Mo–So 10:00–22:00',maps:'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+La+Marina+Denia',special:'✦ Tipp: Perfekter Ausweich-Plan an heißen Mittagsstunden'},
  {cat:'natur wandern',name:'Paseo Ecológico – Küstenpfad',img:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75',dist:'10 km · Benissa–Calpe',stars:'★ 4.6',reviews:'540',cuisine:'Küstenwanderweg · Natur · Panorama',tags:['Spektakulärer Meerblick','Leichter Küstenpfad','Flora & Fauna'],desc:'Malerischer Küstenwanderweg zwischen Benissa und Calpe – traumhafter Meerblick, wilde Felsküste, Olivenhaine und die Stille der Natur direkt vor der Haustür der Villa.',addr:'Cala de la Fustera · Benissa',hours:'Täglich · Kostenlos · Ca. 2–3h',maps:'https://www.google.com/maps/search/?api=1&query=Paseo+Ecologico+Benissa+Calpe',special:'✦ Tipp: Morgens oder abends starten – Mittagshitze meiden'},
];

var sehData = [
  {cat:'strand',name:'Cala de la Fustera',img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',dist:'8 km · 10 Min.',stars:'★ 4.5',reviews:'1.397',cuisine:'Strand · Sandbucht · Benissa',tags:['Sandstrand','Kayak-Verleih','Strandbar'],desc:'Unser Hausstrand – nur 10 Minuten von der Villa, wunderschöner Sandstrand mit kristallklarem Wasser, Kayak-Verleih, Strandbar und Spielplatz. Hier verbringen wir selbst die meisten Nachmittage.',addr:'Carrer del Navegant Josep Ribes · Benissa',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Cala+de+la+Fustera+Benissa',special:'✦ Tipp: Start des wunderschönen Küstenwanderwegs Richtung Calpe'},
  {cat:'strand',name:'Cala Advocat',img:'https://images.unsplash.com/photo-1512551980832-13df02babc9e?w=600&q=75',dist:'8 km · 10 Min.',stars:'★ 4.5',reviews:'1.500',cuisine:'Strand · Naturbucht · Benissa',tags:['Kristallklares Wasser','Schnorcheln','Versteckte Bucht'],desc:'Einer unserer absoluten Lieblinge – versteckte Naturbucht mit türkisblauem Wasser, wilden Felsen und dem Penyal d\'Ifac am Horizont. Kaum bekannt, trotz Traumlage.',addr:'C. del Gavià, 17 · Benissa',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Cala+Advocat+Benissa',special:'✦ Tipp: Schnorcheln bei den Felsen – unglaubliche Unterwasserwelt'},
  {cat:'strand',name:"Cala l\'Andragó",img:'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=600&q=75',dist:'10 km · CV-746',stars:'★ 4.5',reviews:'492',cuisine:'Felsbucht · Schnorcheln · CV-746',tags:['Beste Schnorchelbucht','Strandbar','Glasklares Wasser'],desc:"Die beste Schnorchelbucht der gesamten Region! Glasklares Wasser, riesige Fischschwärme und eine Strandbar mit herrlichem Blick – ein Geheimtipp, der keiner mehr ist.",addr:'Ctra. Moraira a Calpe, 170',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Cala+Andrago+Moraira',special:'✦ Tipp: Wasserschuhe mitbringen – Masken & Schnorchel ausleihen'},
  {cat:'strand moraira',name:'Cala el Portet',img:'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=75',dist:'12 km · Moraira',stars:'★ 4.6',reviews:'3.115',cuisine:'Sandstrand · Moraira · Hafen',tags:['Familienfreundlich','SUP & Kayak','Beste Lage Morairas'],desc:'Der schönste Strand Morairas – direkt beim Hafen, kleiner feiner Sandstrand mit ruhigem, kristallklarem Wasser. Perfekt zum Schwimmen mit Kindern. Danach Eis bei Tutto Frutto – Pflichtprogramm!',addr:'Cala del Portet · Moraira',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Cala+el+Portet+Moraira',special:'✦ Tipp: Morgens früh kommen – im Hochsommer schnell voll'},
  {cat:'strand natur',name:'Cala del Moraig',img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',dist:'14 km · Benitachell',stars:'★ 4.7',reviews:'4.200',cuisine:'Felsenbucht · Tauchen · Benitachell',tags:['Meereshöhle','Tauchen','Spektakulär'],desc:'Absolute Pflicht für Abenteuerlustige – eine der spektakulärsten Buchten der Küste mit einer begehbaren Meereshöhle! Berühmt für Tauchen und Schnorcheln. Wer hier war, vergisst es nie.',addr:'Cala del Moraig · Benitachell',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Cala+del+Moraig+Benitachell',special:'✦ Tipp: Meereshöhle durchschwimmen – eines der unvergesslichsten Erlebnisse der Costa Blanca'},
  {cat:'strand natur',name:'Playa de Calpe',img:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=75',dist:'18 km · Calpe',stars:'★ 4.7',reviews:'2.133',cuisine:'Langer Sandstrand · Calpe',tags:['Langer Sandstrand','Ifach-Blick','Kombinierbar'],desc:"Langer, weitläufiger Sandstrand mit dem spektakulären Penyal d'Ifac im Hintergrund – ein Bild wie aus einem Reisemagazin. Türkisblaues Wasser, herrliche Strandrestaurants.",addr:'C. Dinamarca, 14 · Calpe',hours:'Täglich · Eintritt frei',maps:'https://www.google.com/maps/search/?api=1&query=Playa+de+Calpe',special:"✦ Tipp: Nachmittags – Strand + Sonnenuntergang + Aufstieg auf den Penyal d'Ifac"},
  {cat:'strand',name:"Playa de l\'Ampolla",img:'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=600&q=75',dist:'6 km · Benissa',stars:'★ 4.4',reviews:'890',cuisine:'Sandstrand · Ruhig · Benissa',tags:['Ruhiger Geheimtipp','Blaue Flagge','Familienfreundlich'],desc:'Unser ruhiger Geheimtipp – nur 6 km von der Villa, Blaue-Flagge-Strand ohne den Trubel der bekannten Buchten. Hier findet man noch echte Ruhe, auch in der Hochsaison.',addr:"Playa de l'Ampolla · Benissa",hours:'Täglich · Eintritt frei',maps:"https://www.google.com/maps/search/?api=1&query=Playa+Ampolla+Calpe",special:'✦ Tipp: Der perfekte Morgensstrand – ruhig, nah, wunderschön'},
];

var einkData = [
  {cat:'spezial',name:'Pepe La Sal',img:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=75',dist:'10 km · 12 Min.',stars:'★ 4.4',reviews:'2.147',cuisine:'Delikatessen · Familienbetrieb · CV-746',tags:['Frische Backwaren','Exzellente Fischtheke','Geheimtipp'],desc:'Pflichtbesuch! Liebevoll geführter Familiensupermarkt an der CV-746 mit einer der besten Fleisch- und Fischtheken der ganzen Region. Hier kaufen die Einheimischen – und wir auch.',phone:'+34 965 74 72 25',addr:'Ctra. Moraira a Calpe km 3',hours:'Mo–Sa 8:30–21:00 · So geschlossen',maps:'https://www.google.com/maps/search/?api=1&query=Pepe+La+Sal+Moraira',special:'✦ Tipp: Frisches Baguette morgens – und unbedingt die Fischtheke anschauen'},
  {cat:'super',name:'ALDI Benissa',img:'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=75',dist:'8 km · 10 Min.',stars:'★ 4.3',reviews:'120',cuisine:'Discounter · Günstig · Benissa',tags:['Günstige Preise','Sonntags geöffnet!','Nah an der Villa'],desc:'Moderner ALDI nur 10 Minuten von der Villa – ideal für die tägliche Einkaufstour. Einer der wenigen Supermärkte der Region mit Sonntagsöffnung. Praktisch, günstig, zuverlässig.',phone:'+34 900 902 466',addr:'Av. de la Marina, 112 · Benissa',hours:'Mo–So 9:00–21:30 (auch Sonntag!)',maps:'https://www.google.com/maps/search/?api=1&query=ALDI+Benissa',special:'✦ Tipp: Sonntags geöffnet – einziger Markt der Umgebung'},
  {cat:'super',name:'Mercadona Calpe',img:'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=75',dist:'18 km · 20 Min.',stars:'★ 4.5',reviews:'890',cuisine:'Supermarkt · Fisch · Calpe',tags:['Große Fischtheke','Frische Meeresfrüchte','Vollsortiment'],desc:'Spaniens beliebtester Supermarkt – mit einer herausragenden Fisch- und Meeresfrüchte-Theke. Für frischen Fisch direkt vom Mittelmeer ist Mercadona Calpe die erste Wahl.',phone:'+34 965 83 41 21',addr:'Av. Gabriel Miró, 14 · Calpe',hours:'Mo–Sa 9:00–21:30 · So geschlossen',maps:'https://www.google.com/maps/search/?api=1&query=Mercadona+Calpe',special:'✦ Tipp: Die Fischtheke! Frischer Fisch & Meeresfrüchte direkt aus dem Mittelmeer'},
  {cat:'super',name:'Masymas Teulada',img:'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=75',dist:'7 km · 8 Min.',stars:'★ 4.2',reviews:'340',cuisine:'Supermarkt · Vollsortiment · Teulada',tags:['Lokale Produkte','Großer Parkplatz'],desc:'Gut sortierter spanischer Supermarkt direkt in Teulada – stark bei lokalen Produkten der Costa Blanca und guter Weinauswahl. Der nächste Vollsortimenter zur Villa.',phone:'+34 965 74 00 00',addr:'Av. de la Generalitat · Teulada',hours:'Mo–Sa 9:00–21:00 · So geschlossen',maps:'https://www.google.com/maps/search/?api=1&query=Masymas+Teulada',special:'✦ Tipp: Gute Auswahl an lokalen Weinen und regionalen Produkten'},
];

function buildCard(d, filterAttr) {
  var tagsHtml = (d.tags||[]).map(function(t){return '<span class="tile-tag" data-orig="'+t+'">'+t+'</span>';}).join('');
  var priceHtml = '';
  if(d.price){var p=d.price;priceHtml='<div class="tile-price">';for(var i=0;i<3;i++)priceHtml+='<span'+(i>=p.length?' class="off"':'')+'>€</span>';priceHtml+='</div>';}
  var mapsHtml = d.maps ? '<a class="tile-maps" href="'+d.maps+'" target="_blank" onclick="event.stopPropagation()">📍 Maps</a>' : '';
  var badgeHtml = '';
  if(d.special) badgeHtml = '<div class="tile-badge gold">★ Tipp</div>';
  else if(d.tags && d.tags[0]) badgeHtml = '<div class="tile-badge" data-orig="'+d.tags[0]+'">'+d.tags[0]+'</div>';
  var distClean = d.dist ? d.dist.replace('📍 ','') : '';
  var distHtml = d.dist ? '<div class="tile-dist" data-distraw="'+distClean+'">'+distClean+'</div>' : '';
  var card = document.createElement('div');
  card.className = 'tile-card tile-reveal';
  card.setAttribute(filterAttr, d.cat);
  card.innerHTML =
    '<div class="tile-img-wrap"><img class="tile-img" src="'+d.img+'" alt="'+d.name+'" loading="lazy">'+badgeHtml+distHtml+'</div>'
    +'<div class="tile-body">'
    +'<div class="tile-name">'+d.name+'</div>'
    +'<div class="tile-cuisine">'+d.cuisine+'</div>'
    +'<div class="tile-stars"><span class="tile-stars-val">'+d.stars+'</span><span class="tile-stars-count" data-rev="'+d.reviews+'">('+d.reviews+' Bew.)</span></div>'
    +(tagsHtml?'<div class="tile-tags">'+tagsHtml+'</div>':'')
    +'<p class="tile-desc">'+d.desc+'</p>'
    +(d.special?'<div class="tile-special" data-orig="'+d.special+'">'+d.special+'</div>':'')
    +'<div class="tile-footer">'
    +(d.addr?'<span class="tile-addr">'+d.addr+'</span>':'')
    +mapsHtml+priceHtml
    +'</div></div>';
  if(d.maps){ card.addEventListener('click', function(){ window.open(d.maps,'_blank'); }); }
  return card;
}

function buildGrids() {
  var eg = document.getElementById('empf-grid');
  restData.forEach(function(d){ var c=buildCard(d,'data-empf'); c.setAttribute('data-empf','restaurants'); eg.appendChild(c); });
  aktData.forEach(function(d){ var c=buildCard(d,'data-empf'); c.setAttribute('data-empf','aktivitaeten'); eg.appendChild(c); });
  sehData.forEach(function(d){ var c=buildCard(d,'data-empf'); c.setAttribute('data-empf','straende'); eg.appendChild(c); });
  einkData.forEach(function(d){ var c=buildCard(d,'data-empf'); c.setAttribute('data-empf','einkaufen'); eg.appendChild(c); });
}

// MEHRSPRACHIGE KACHEL-DATEN
var tileTranslations = {"de": {"rest": [{"cuisine": "Mediterran · Meerblick · Moraira", "tags": ["Meerblick-Terrasse", "Täglich geöffnet"], "desc": "Traumhafte Terrasse mit Blick auf Kastell und Meer – das Go-To-Spot in Moraira. Riesige Portionen, top Preise."}, {"cuisine": "Paella · Meeresfrüchte · CV-746", "tags": ["Beste Paella", "Strandnah"], "desc": "Über 3.200 Bewertungen! Beste Paella direkt am Strand, frische Boquerones, hausgemachtes Ali-Oili.", "special": "✦ Tipp: Tisch innen reservieren"}, {"cuisine": "Fine Dining · Meeresfrüchte · CV-746", "tags": ["Romantisch", "Klavier-Abende", "Meerblick"], "desc": "Das romantischste Restaurant der Region – Seeigel, Terrasse mit Klaviermusik, elegantes Ambiente.", "special": "✦ Tipp: Sommerabend mit Klaviermusik reservieren"}, {"cuisine": "Bar · Cocktails · Meerblick", "tags": ["Sonnenuntergang", "Cocktails"], "desc": "Die legendäre Sonnenuntergangs-Bar direkt an der CV-746 – Cocktails mit Meerblick, ab 9:30 Uhr geöffnet.", "special": "✦ Tipp: Sonnenuntergang um 19:00 – bester Platz der Küste"}, {"cuisine": "Mediterran · Elegant · CV-746", "tags": ["Top bewertet", "Seit 2016"], "desc": "Seit 2016 der Liebling von Stammgästen aus ganz Europa – außergewöhnliche Küche, exzellenter Service."}, {"cuisine": "Mediterran · Italienisch · CV-746", "tags": ["Top bewertet", "Exzellente Cocktails"], "desc": "1.059 Bewertungen, fast alle 5 Sterne. Perfekter Service, atemberaubende Präsentation."}, {"cuisine": "Strandbar · Livemusik · Benissa", "tags": ["Livemusik abends", "Klippen-Panorama"], "desc": "Idyllische Klippen-Bar mit spektakulärem Meerblick, Livemusik abends. Calamari sehr empfohlen.", "special": "✦ Tipp: Abends mit Livemusik – romantischster Sonnenuntergang"}, {"cuisine": "Eis · Desserts · Moraira Zentrum", "tags": ["Beste Gelati", "Riesige Portionen"], "desc": "Vielleicht das beste Eis Ihres Lebens – über 40 Sorten für kleines Geld. Pflichtbesuch!", "special": "✦ Tipp: Max. 2 Kugeln Medium – schmilzt sonst zu schnell!"}], "akt": [{"cuisine": "Naturpark · Wandern · Calpe", "tags": ["Wahrzeichen Costa Blanca", "300m Felsen", "Pflichtausflug"], "desc": "Das Wahrzeichen der Costa Blanca – 300m hoher Felsen. Aufstieg ca. 1,5h, 360 Grad Panorama bis nach Ibiza.", "special": "✦ Tipp: Online-Reservierung nötig & festes Schuhwerk"}, {"cuisine": "Kayak · SUP · Schnorcheln", "tags": ["5,0 Perfekt", "Höhlen-Kayak", "Sunrise Tour"], "desc": "Kayak-Touren durch spektakuläre Küstenhöhlen, SUP-Verleih und Schnorcheln mit professionellen Guides.", "special": "✦ Tipp: Sunrise SUP Tour – magischer Start in den Tag"}, {"cuisine": "Tierpark · Delfine · Benidorm", "tags": ["Delfinshow", "Delfin berühren"], "desc": "Spektakuläre Delfin-, Seelöwen- und Papageienshow. Delfine berühren für 17 Euro (online).", "special": "✦ Tipp: Online-Tickets günstiger"}, {"cuisine": "Wasserpark · Rutschen · Benidorm", "tags": ["Größter Wasserpark Spaniens", "Vertigo-Rutsche"], "desc": "Europas beliebtester Wasserpark – die legendäre Vertigo-Rutsche ist ein Muss!", "special": "✦ Tipp: Eigene Snacks mitbringen – spart bis zu 30 Euro"}, {"cuisine": "Safaripark · Tiere · Penàguila", "tags": ["Safaribus", "Giraffenfüttern", "Familien"], "desc": "Spaniens größter Safaripark in der Bergwelt der Sierra Aitana – Giraffen, Zebras, Nashörner und viele mehr.", "special": "✦ Tipp: Safaribus buchen – nah an den Tieren"}, {"cuisine": "Kartbahn · Spaß · Moraira", "tags": ["Für alle Altersgruppen", "Outdoor-Kartbahn"], "desc": "Moderne Outdoor-Kartbahn direkt bei Moraira – ideal für Familien, Gruppen und alle die Spaß am Fahren haben.", "special": "✦ Tipp: Abends wenn es kühler ist – mehr Spaß!"}, {"cuisine": "Markt · Lokal · Freitags", "tags": ["Jeden Freitag", "Frische Produkte", "Lokales Handwerk"], "desc": "Jeden Freitagmorgen am Hafen von Moraira – frisches Obst & Gemüse, lokale Delikatessen, Handwerk und pure Atmosphäre spanischen Marktlebens.", "special": "✦ Tipp: Früh kommen – die besten Stände sind schnell weg"}, {"cuisine": "Wanderung · Wachturm · Panorama", "tags": ["Spektakulärer Meerblick", "Leichte Wanderung", "Historisch"], "desc": "Kurze Wanderung zum mittelalterlichen Wachturm mit atemberaubendem Panoramablick auf Meer und Küste bis zum Penyal d'Ifac.", "special": "✦ Tipp: Zum Sonnenuntergang wandern – unvergessliches Panorama"}, {"cuisine": "Naturquellen · Baden · Callosa", "tags": ["Natürliche Badepools", "Wasserfall", "Familien"], "desc": "Magische Naturquellen mit kristallklaren Badepools und kleinen Wasserfällen mitten im Grünen – einer der beliebtesten Ausflüge der Costa Blanca.", "special": "✦ Tipp: Unter der Woche kommen – am Wochenende sehr voll"}, {"cuisine": "Bergdorf · Burg · Stausee", "tags": ["Malerisches Bergdorf", "Burganlage", "Stausee-Panorama"], "desc": "Eines der schönsten Bergdörfer Spaniens – hoch auf einem Felsen mit Burganlage und Blick auf den türkisblauen Stausee.", "special": "✦ Tipp: Morgens früh – vor den Tagestouristen aus Benidorm"}, {"cuisine": "UNESCO · Palmen · Markt", "tags": ["UNESCO Welterbe", "Größter Palmenhain Europas", "Samstagsmarkt"], "desc": "UNESCO-Welterbe: der größte Palmenhain Europas mit über 200.000 Palmen. Dazu lebhafter Samstagsmarkt und historisches Stadtzentrum.", "special": "✦ Tipp: Samstags – Markt + Palmen = perfekter Tagesausflug"}, {"cuisine": "Großstadt · Kultur · Gastronomie", "tags": ["Ciudad de las Artes", "Heimat der Paella", "Historische Altstadt"], "desc": "Die pulsierende Metropole Valencia – futuristische Ciudad de las Artes y Ciencias, historisches Zentrum und Original-Paella in ihrer Heimatstadt.", "special": "✦ Tipp: La Pepica am Hafen – Hemingways Lieblingsrestaurant für Original-Paella"}, {"cuisine": "Shopping · Klimatisiert · Dénia", "tags": ["Viele Shops", "Klimatisiert", "Ideal bei Regen"], "desc": "Großes Einkaufszentrum nahe Dénia – ideal für Regentage oder heiße Mittagsstunden. Mode, Elektronik, Restaurants und Kino.", "special": "✦ Tipp: Perfekter Ausweich-Plan an heißen Mittagsstunden"}, {"cuisine": "Küstenwanderweg · Natur · Panorama", "tags": ["Spektakulärer Meerblick", "Leichter Küstenpfad", "Flora & Fauna"], "desc": "Malerischer Küstenwanderweg zwischen Benissa und Calpe – traumhafter Meerblick, wilde Felsküste und die Stille der Natur direkt vor der Haustür.", "special": "✦ Tipp: Morgens oder abends starten – Mittagshitze meiden"}], "seh": [{"cuisine": "Strand · Sandbucht · Benissa", "tags": ["Sandstrand", "Kayak-Verleih", "Strandbar"], "desc": "Wunderschöner Sandstrand mit kristallklarem Wasser. Kayak-Verleih, Strandbar und Spielplatz für Kinder.", "special": "✦ Tipp: Start des Küstenwanderwegs Richtung Calpe"}, {"cuisine": "Strand · Naturbucht · Benissa", "tags": ["Kristallklares Wasser", "Schnorcheln"], "desc": "Eine der schönsten Naturbuchten der Costa Blanca – türkisblaues Wasser, malerische Felsen."}, {"cuisine": "Felsbucht · Schnorcheln · CV-746", "tags": ["Beste Schnorchelbucht", "Strandbar"], "desc": "Eine der besten Schnorchelbuchten der Costa Blanca! Glasklares Wasser, riesige Fischschwärme.", "special": "✦ Tipp: Wasserschuhe mitbringen"}, {"cuisine": "Sandstrand · Moraira · Hafen", "tags": ["Familienfreundlich", "SUP & Kayak"], "desc": "Der schönste Strand Morairas – kleiner Sandstrand mit ruhigem, kristallklarem Wasser. Perfekt für Kinder.", "special": "✦ Tipp: Früh morgens kommen – im Sommer schnell voll"}, {"cuisine": "Felsenbucht · Tauchen · Benitachell", "tags": ["Meereshöhle", "Tauchen", "Spektakulär"], "desc": "Eine der spektakulärsten Buchten der Costa Blanca – mit begehbarer Meereshöhle!", "special": "✦ Tipp: Meereshöhle durchschwimmen – unvergesslich!"}, {"cuisine": "Langer Sandstrand · Calpe", "tags": ["Langer Sandstrand", "Ifach-Blick"], "desc": "Langer Sandstrand mit spektakulärem Blick auf den Penyal d'Ifac. Türkisblaues Wasser.", "special": "✦ Tipp: Kombination mit Aufstieg auf den Penyal d'Ifac"}, {"cuisine": "Sandstrand · Ruhig · Calpe", "tags": ["Ruhiger Strand", "Familienfreundlich"], "desc": "Ruhiger, weniger bekannter Sandstrand – ideal für Familien die den Trubel meiden möchten.", "special": "✦ Tipp: Auch in der Hochsaison angenehm ruhig"}], "eink": [{"cuisine": "Delikatessen · Familienbetrieb · CV-746", "tags": ["Frische Backwaren", "Fleisch & Fischtheke"], "desc": "Der Liebling aller Urlauber – liebevoll geführter Familiensupermarkt mit exzellenter Fleisch- und Fischtheke.", "special": "✦ Tipp: Frisches Baguette morgens – täglich frisch gebacken"}, {"cuisine": "Discounter · Günstig · Benissa", "tags": ["Günstige Preise", "Sonntags geöffnet!"], "desc": "Moderner ALDI nur 10 Minuten von der Villa. Einer der wenigen Märkte der Region, der sonntags öffnet.", "special": "✦ Tipp: Einziger Markt mit Sonntagsöffnung"}, {"cuisine": "Supermarkt · Vollsortiment · Teulada", "tags": ["Lokale Produkte", "Großer Parkplatz"], "desc": "Gut sortierter spanischer Supermarkt in Teulada – stark bei lokalen Produkten. Gute Weinauswahl.", "special": "✦ Tipp: Gute Auswahl an lokalen Weinen"}]}, "en": {"rest": [{"cuisine": "Mediterranean · Sea View · Moraira", "tags": ["Sea View Terrace", "Open Daily"], "desc": "Stunning terrace overlooking the castle and sea – the go-to spot in Moraira. Huge portions, great prices."}, {"cuisine": "Paella · Seafood · CV-746", "tags": ["Best Paella", "Near the Beach"], "desc": "Over 3,200 reviews! Best paella right on the beach, fresh Boquerones, homemade Ali-Oili.", "special": "Tip: Book an indoor table"}, {"cuisine": "Fine Dining · Seafood · CV-746", "tags": ["Romantic", "Piano Evenings", "Sea View"], "desc": "The most romantic restaurant in the region – sea urchin, summer terrace with piano music, elegant atmosphere.", "special": "Tip: Book a summer evening with piano music"}, {"cuisine": "Bar · Cocktails · Sea View", "tags": ["Sunset", "Cocktails"], "desc": "The legendary sunset bar right on the CV-746 – cocktails with sea views, open from 9:30.", "special": "Tip: Sunset at 19:00 – best spot on the coast"}, {"cuisine": "Mediterranean · Elegant · CV-746", "tags": ["Top Rated", "Since 2016"], "desc": "Since 2016 the favourite of regulars from across Europe – extraordinary cuisine, excellent service."}, {"cuisine": "Mediterranean · Italian · CV-746", "tags": ["Top Rated", "Excellent Cocktails"], "desc": "1,059 reviews, almost all 5 stars. Perfect service, breathtaking presentation."}, {"cuisine": "Beach Bar · Live Music · Benissa", "tags": ["Live Music Evenings", "Cliff Panorama"], "desc": "Idyllic cliff bar with spectacular sea views, live music in the evenings. Calamari highly recommended.", "special": "Tip: Evenings with live music – most romantic sunset"}, {"cuisine": "Ice Cream · Desserts · Moraira Centre", "tags": ["Best Gelato", "Huge Portions"], "desc": "Perhaps the best ice cream of your life – over 40 flavours for little money. A must after dinner!", "special": "Tip: Max. 2 Medium scoops – melts too fast otherwise!"}], "akt": [{"cuisine": "Nature Park · Hiking · Calpe", "tags": ["Costa Blanca Landmark", "300m Rock", "Must-Visit"], "desc": "The landmark of the Costa Blanca – 300m high rock from the sea. Climb approx. 1.5h, 360 degree panorama to Ibiza.", "special": "Tip: Online reservation required and sturdy shoes needed"}, {"cuisine": "Kayak · SUP · Snorkelling", "tags": ["5.0 Perfect", "Cave Kayak", "Sunrise Tour"], "desc": "Kayak tours through spectacular coastal caves, SUP rental and snorkelling with professional guides.", "special": "Tip: Sunrise SUP Tour – magical start to the day"}, {"cuisine": "Animal Park · Dolphins · Benidorm", "tags": ["Dolphin Show", "Touch Dolphins"], "desc": "Spectacular dolphin, sea lion and parrot show. Touch dolphins for 17 euros online.", "special": "Tip: Online tickets cheaper"}, {"cuisine": "Water Park · Slides · Benidorm", "tags": ["Spain's Largest Water Park", "Vertigo Slide"], "desc": "Europe's most popular water park – the legendary Vertigo slide is a must! Huge choice for all ages.", "special": "Tip: Bring your own snacks – saves up to 30 euros"}, {"cuisine": "Safari Park · Animals · Penaguila", "tags": ["Safari Bus", "Feed Giraffes", "Families"], "desc": "Spain's largest safari park in the Sierra Aitana mountains – giraffes, zebras, rhinos and many more.", "special": "Tip: Book the safari bus – get up close to the animals"}, {"cuisine": "Karting · Fun · Moraira", "tags": ["All Ages", "Outdoor Kart Track"], "desc": "Modern outdoor kart track near Moraira – perfect for families, groups and anyone who loves driving.", "special": "Tip: Go in the evening when it is cooler – more fun!"}, {"cuisine": "Market · Local · Fridays", "tags": ["Every Friday", "Fresh Produce", "Local Crafts"], "desc": "Every Friday morning at Moraira harbour – fresh fruit and vegetables, local delicacies, crafts and the authentic atmosphere of Spanish market life.", "special": "Tip: Arrive early – the best stalls are gone quickly"}, {"cuisine": "Hike · Watchtower · Panorama", "tags": ["Spectacular Sea View", "Easy Hike", "Historic"], "desc": "Short rewarding hike to the medieval watchtower with breathtaking panoramic views of the sea and coast all the way to the Penyal d'Ifac.", "special": "Tip: Hike at sunset – unforgettable panorama"}, {"cuisine": "Natural Springs · Swimming · Callosa", "tags": ["Natural Swimming Pools", "Waterfall", "Families"], "desc": "Magical natural springs with crystal-clear swimming pools and small waterfalls in lush greenery – one of the most popular day trips on the Costa Blanca.", "special": "Tip: Go on a weekday – very crowded at weekends"}, {"cuisine": "Mountain Village · Castle · Reservoir", "tags": ["Picturesque Village", "Castle Ruins", "Reservoir Panorama"], "desc": "One of Spain's most beautiful mountain villages – perched high on a rock with castle ruins and stunning views over the turquoise reservoir.", "special": "Tip: Go early – before the day-trippers from Benidorm arrive"}, {"cuisine": "UNESCO · Palms · Market", "tags": ["UNESCO World Heritage", "Largest Palm Grove in Europe", "Saturday Market"], "desc": "UNESCO World Heritage: Europe's largest palm grove with over 200,000 palms. Plus a lively Saturday market and the historic town centre.", "special": "Tip: On Saturdays – market and palms make the perfect day trip"}, {"cuisine": "City · Culture · Gastronomy", "tags": ["City of Arts", "Home of Paella", "Historic Old Town"], "desc": "The vibrant city of Valencia – futuristic City of Arts and Sciences, historic centre and original paella in its home city. An absolute must!", "special": "Tip: La Pepica at the harbour – Hemingway's favourite restaurant for original paella"}, {"cuisine": "Shopping · Air-Conditioned · Dénia", "tags": ["Many Shops", "Air-Conditioned", "Great on Rainy Days"], "desc": "Large shopping centre near Dénia – perfect for a rainy day or the hottest part of the afternoon. Fashion, electronics, restaurants and cinema.", "special": "Tip: Perfect escape plan on hot afternoons"}, {"cuisine": "Coastal Path · Nature · Panorama", "tags": ["Spectacular Sea View", "Easy Coastal Path", "Flora & Fauna"], "desc": "Picturesque coastal walking path between Benissa and Calpe – stunning sea views, rugged cliffs and the silence of nature right on the villa's doorstep.", "special": "Tip: Start in the morning or evening – avoid the midday heat"}], "seh": [{"cuisine": "Beach · Sandy Cove · Benissa", "tags": ["Sandy Beach", "Kayak Rental", "Beach Bar"], "desc": "Beautiful sandy beach with crystal clear water. Kayak rental, beach bar and playground for children.", "special": "Tip: Start of the coastal walking path towards Calpe"}, {"cuisine": "Beach · Natural Cove · Benissa", "tags": ["Crystal Clear Water", "Snorkelling"], "desc": "One of the most beautiful natural coves on the Costa Blanca – turquoise water, picturesque rocks."}, {"cuisine": "Rocky Cove · Snorkelling · CV-746", "tags": ["Best Snorkelling Cove", "Beach Bar"], "desc": "One of the best snorkelling coves on the Costa Blanca! Crystal clear water, huge shoals of fish.", "special": "Tip: Bring water shoes – best snorkelling spot!"}, {"cuisine": "Sandy Beach · Moraira · Harbour", "tags": ["Family Friendly", "SUP & Kayak"], "desc": "The most beautiful beach in Moraira – small sandy beach with calm, crystal clear water. Perfect for children.", "special": "Tip: Come early morning – gets busy in summer"}, {"cuisine": "Rocky Cove · Diving · Benitachell", "tags": ["Sea Cave", "Diving", "Spectacular"], "desc": "One of the most spectacular coves on the Costa Blanca – with a walkable sea cave! Famous for diving.", "special": "Tip: Swim through the sea cave – unforgettable!"}, {"cuisine": "Long Sandy Beach · Calpe", "tags": ["Long Sandy Beach", "Ifach View"], "desc": "Long beautiful sandy beach with spectacular views of the Penyal d'Ifac. Turquoise water.", "special": "Tip: Combine with the Penyal d'Ifac climb"}, {"cuisine": "Sandy Beach · Quiet · Calpe", "tags": ["Quiet Beach", "Family Friendly"], "desc": "Quiet, lesser-known sandy beach – ideal for families who want to avoid the crowds.", "special": "Tip: Pleasantly quiet even in high season"}], "eink": [{"cuisine": "Delicatessen · Family Business · CV-746", "tags": ["Fresh Bakery", "Meat & Fish Counter"], "desc": "The favourite of all holidaymakers – lovingly run family supermarket with excellent meat and fish counter.", "special": "Tip: Fresh baguette in the morning – baked daily"}, {"cuisine": "Discounter · Budget · Benissa", "tags": ["Great Prices", "Open Sundays!"], "desc": "Modern ALDI just 10 minutes from the villa. One of the few supermarkets in the region open on Sundays.", "special": "Tip: Only supermarket open on Sundays"}, {"cuisine": "Supermarket · Full Range · Teulada", "tags": ["Local Products", "Large Car Park"], "desc": "Well-stocked Spanish supermarket in Teulada – great for local products. Good wine selection.", "special": "Tip: Great selection of local wines"}]}, "es": {"rest": [{"cuisine": "Mediterráneo · Vistas al Mar · Moraira", "tags": ["Terraza con Vistas", "Abierto a Diario"], "desc": "Terraza con vistas al castillo y al mar – el lugar de referencia en Moraira. Porciones enormes, precios excelentes."}, {"cuisine": "Paella · Mariscos · CV-746", "tags": ["Mejor Paella", "Cerca de la Playa"], "desc": "Mas de 3.200 valoraciones! La mejor paella en la playa, boquerones frescos, Ali-Oili casero.", "special": "Consejo: Reservar mesa interior"}, {"cuisine": "Alta Cocina · Mariscos · CV-746", "tags": ["Romántico", "Noches de Piano", "Vistas al Mar"], "desc": "El restaurante mas romántico de la región – erizos de mar, terraza con música de piano.", "special": "Consejo: Reservar noche de verano con piano"}, {"cuisine": "Bar · Cócteles · Vistas al Mar", "tags": ["Puesta de Sol", "Cócteles"], "desc": "El legendario bar de puestas de sol en la CV-746 – cócteles con vistas al mar, abierto desde las 9:30.", "special": "Consejo: Puesta de sol a las 19:00 – mejor lugar de la costa"}, {"cuisine": "Mediterráneo · Elegante · CV-746", "tags": ["Mejor Valorado", "Desde 2016"], "desc": "Desde 2016 el favorito de clientes habituales de toda Europa – cocina extraordinaria, servicio excelente."}, {"cuisine": "Mediterráneo · Italiano · CV-746", "tags": ["Mejor Valorado", "Cócteles Excelentes"], "desc": "1.059 valoraciones, casi todas 5 estrellas. Servicio perfecto, presentación impresionante."}, {"cuisine": "Bar de Playa · Música en Vivo · Benissa", "tags": ["Música en Vivo", "Panorama de Acantilados"], "desc": "Idílico bar en los acantilados con vistas espectaculares al mar, música en vivo por las noches.", "special": "Consejo: Noches con música en vivo – puesta de sol mas romántica"}, {"cuisine": "Helados · Postres · Centro de Moraira", "tags": ["Mejor Gelato", "Porciones Enormes"], "desc": "Quizas el mejor helado de tu vida – mas de 40 sabores por poco dinero. Visita obligatoria tras la cena!", "special": "Consejo: Max. 2 bolas medianas – se derrite muy rapido!"}], "akt": [{"cuisine": "Parque Natural · Senderismo · Calpe", "tags": ["Emblema Costa Blanca", "Roca 300m", "Visita Obligatoria"], "desc": "El emblema de la Costa Blanca – roca de 300m desde el mar. Subida aprox. 1,5h, panorama 360 grados.", "special": "Consejo: Reserva online obligatoria y calzado resistente"}, {"cuisine": "Kayak · SUP · Snorkel", "tags": ["5,0 Perfecto", "Kayak en Cuevas", "Tour al Amanecer"], "desc": "Tours en kayak por espectaculares cuevas costeras, alquiler de SUP y snorkel con guias profesionales.", "special": "Consejo: Tour SUP al amanecer – comienzo magico del dia"}, {"cuisine": "Parque Animal · Delfines · Benidorm", "tags": ["Show de Delfines", "Tocar Delfines"], "desc": "Espectacular show de delfines, leones marinos y loros. Tocar delfines por 17 euros online.", "special": "Consejo: Entradas online mas baratas"}, {"cuisine": "Parque Acuatico · Toboganes · Benidorm", "tags": ["Mayor Parque Acuatico de España", "Tobogan Vertigo"], "desc": "El parque acuatico mas popular de Europa – el legendario tobogan Vertigo es imprescindible!", "special": "Consejo: Llevar merienda propia – ahorra hasta 30 euros"}, {"cuisine": "Safari · Animales · Penaguila", "tags": ["Bus Safari", "Dar de Comer a Jirafas", "Familias"], "desc": "El mayor safari de España en la sierra Aitana – jirafas, cebras, rinocerontes y muchos mas.", "special": "Consejo: Reservar bus safari – cerca de los animales"}, {"cuisine": "Karting · Diversión · Moraira", "tags": ["Todas las Edades", "Pista Exterior"], "desc": "Moderna pista de karts exterior cerca de Moraira – ideal para familias y grupos.", "special": "Consejo: Por la tarde cuando refresca – mas divertido!"}, {"cuisine": "Mercado · Local · Viernes", "tags": ["Todos los Viernes", "Productos Frescos", "Artesanía Local"], "desc": "Todos los viernes por la mañana en el puerto de Moraira – fruta y verdura fresca, delicias locales, artesanía y la auténtica atmósfera del mercado español.", "special": "Consejo: Llegar temprano – los mejores puestos se agotan pronto"}, {"cuisine": "Senderismo · Torre · Panorama", "tags": ["Vistas Espectaculares al Mar", "Senderismo Fácil", "Histórico"], "desc": "Corta y gratificante caminata hasta la torre medieval con vistas panorámicas al mar y la costa hasta el Penyal d'Ifac.", "special": "Consejo: Subir al atardecer – panorama inolvidable"}, {"cuisine": "Fuentes Naturales · Baño · Callosa", "tags": ["Piscinas Naturales", "Cascadas", "Familias"], "desc": "Mágicas fuentes naturales con piscinas de agua cristalina y pequeñas cascadas en plena naturaleza – una de las excursiones más populares de la Costa Blanca.", "special": "Consejo: Ir entre semana – muy concurrido los fines de semana"}, {"cuisine": "Pueblo de Montaña · Castillo · Embalse", "tags": ["Pintoresco Pueblo", "Castillo", "Panorama del Embalse"], "desc": "Uno de los pueblos de montaña más bonitos de España – encaramado en una roca con castillo y vistas sobre el embalse turquesa.", "special": "Consejo: Ir por la mañana temprano – antes de los turistas de Benidorm"}, {"cuisine": "UNESCO · Palmeras · Mercado", "tags": ["Patrimonio UNESCO", "Mayor Palmeral de Europa", "Mercado de Sábado"], "desc": "Patrimonio Mundial UNESCO: el mayor palmeral de Europa con más de 200.000 palmeras. Más un animado mercado de sábado y el casco histórico.", "special": "Consejo: En sábado – mercado y palmeral = excursión perfecta"}, {"cuisine": "Ciudad · Cultura · Gastronomía", "tags": ["Ciudad de las Artes", "Cuna de la Paella", "Casco Histórico"], "desc": "La vibrante ciudad de Valencia – futurista Ciudad de las Artes y las Ciencias, centro histórico y paella original en su ciudad natal.", "special": "Consejo: La Pepica en el puerto – el restaurante favorito de Hemingway para paella original"}, {"cuisine": "Shopping · Climatizado · Dénia", "tags": ["Muchas Tiendas", "Climatizado", "Ideal con Lluvia"], "desc": "Gran centro comercial cerca de Dénia – ideal para un día de lluvia o las horas de más calor. Moda, electrónica, restaurantes y cine.", "special": "Consejo: Plan perfecto para las horas de más calor"}, {"cuisine": "Senda Costera · Naturaleza · Panorama", "tags": ["Vistas Espectaculares al Mar", "Camino Costero Fácil", "Flora y Fauna"], "desc": "Pintoresca senda costera entre Benissa y Calpe – impresionantes vistas al mar, costa rocosa salvaje y el silencio de la naturaleza a las puertas de la villa.", "special": "Consejo: Salir por la mañana o tarde – evitar el calor del mediodía"}], "seh": [{"cuisine": "Playa · Cala de Arena · Benissa", "tags": ["Playa de Arena", "Alquiler Kayak", "Bar de Playa"], "desc": "Hermosa playa de arena con agua cristalina. Alquiler de kayak, bar de playa y parque infantil.", "special": "Consejo: Inicio del sendero costero hacia Calpe"}, {"cuisine": "Playa · Cala Natural · Benissa", "tags": ["Agua Cristalina", "Snorkel"], "desc": "Una de las calas naturales mas bonitas de la Costa Blanca – agua turquesa, rocas pintorescas."}, {"cuisine": "Cala Rocosa · Snorkel · CV-746", "tags": ["Mejor Cala para Snorkel", "Bar de Playa"], "desc": "Una de las mejores calas para snorkel de la Costa Blanca. Agua cristalina, grandes bancos de peces.", "special": "Consejo: Llevar zapatillas acuaticas"}, {"cuisine": "Playa de Arena · Moraira · Puerto", "tags": ["Apta para Familias", "SUP y Kayak"], "desc": "La playa mas bonita de Moraira – pequeña playa de arena con agua tranquila y cristalina. Perfecta para niños.", "special": "Consejo: Llegar temprano – se llena en verano"}, {"cuisine": "Cala Rocosa · Buceo · Benitachell", "tags": ["Cueva Marina", "Buceo", "Espectacular"], "desc": "Una de las calas mas espectaculares de la Costa Blanca – con una cueva marina transitable!", "special": "Consejo: Nadar por la cueva marina – inolvidable!"}, {"cuisine": "Larga Playa de Arena · Calpe", "tags": ["Larga Playa de Arena", "Vistas al Ifach"], "desc": "Larga y bonita playa de arena con vistas espectaculares al Penyal d'Ifac. Agua turquesa.", "special": "Consejo: Combinar con subida al Penyal d'Ifac"}, {"cuisine": "Playa de Arena · Tranquila · Calpe", "tags": ["Playa Tranquila", "Apta para Familias"], "desc": "Playa de arena tranquila y poco conocida – ideal para familias que quieren evitar el bullicio.", "special": "Consejo: Agradablemente tranquila incluso en temporada alta"}], "eink": [{"cuisine": "Delicias · Negocio Familiar · CV-746", "tags": ["Panaderia Fresca", "Carniceria y Pescaderia"], "desc": "El favorito de todos los turistas – supermercado familiar con excelente carniceria y pescaderia.", "special": "Consejo: Baguette fresco por la manana – horneado a diario"}, {"cuisine": "Tienda Descuento · Economico · Benissa", "tags": ["Precios Bajos", "Abierto Domingos!"], "desc": "ALDI moderno a solo 10 minutos de la villa. Uno de los pocos supermercados de la zona que abre los domingos.", "special": "Consejo: Unico supermercado abierto los domingos"}, {"cuisine": "Supermercado · Surtido Completo · Teulada", "tags": ["Productos Locales", "Gran Aparcamiento"], "desc": "Supermercado espanol bien surtido en Teulada – destacado en productos locales. Buena seleccion de vinos.", "special": "Consejo: Buena seleccion de vinos locales"}]}, "fr": {"rest": [{"cuisine": "Méditerranéen · Vue Mer · Moraira", "tags": ["Terrasse Vue Mer", "Ouvert tous les jours"], "desc": "Terrasse de rêve avec vue sur le château et la mer – le spot incontournable à Moraira. Grandes portions, prix excellents."}, {"cuisine": "Paella · Fruits de Mer · CV-746", "tags": ["Meilleure Paella", "Proche de la Plage"], "desc": "Plus de 3 200 avis ! Meilleure paella directement sur la plage, boquerones frais, Ali-Oili maison.", "special": "Conseil: Réserver une table intérieure"}, {"cuisine": "Haute Cuisine · Fruits de Mer · CV-746", "tags": ["Romantique", "Soirées Piano", "Vue Mer"], "desc": "Le restaurant le plus romantique de la région – oursins, terrasse estivale avec musique de piano.", "special": "Conseil: Réserver une soirée estivale avec piano"}, {"cuisine": "Bar · Cocktails · Vue Mer", "tags": ["Coucher de Soleil", "Cocktails"], "desc": "Le légendaire bar coucher de soleil sur la CV-746 – cocktails avec vue mer, ouvert dès 9h30.", "special": "Conseil: Coucher de soleil à 19h – meilleur endroit de la côte"}, {"cuisine": "Méditerranéen · Élégant · CV-746", "tags": ["Très bien noté", "Depuis 2016"], "desc": "Depuis 2016 le favori des habitués de toute Europe – cuisine extraordinaire, service excellent."}, {"cuisine": "Méditerranéen · Italien · CV-746", "tags": ["Très bien noté", "Excellents Cocktails"], "desc": "1 059 avis, presque tous 5 étoiles. Service parfait, présentation époustouflante."}, {"cuisine": "Bar de Plage · Musique Live · Benissa", "tags": ["Musique Live le Soir", "Panorama Falaises"], "desc": "Bar idyllique sur les falaises avec vue spectaculaire sur la mer, musique live le soir.", "special": "Conseil: Soirées avec musique live – coucher de soleil le plus romantique"}, {"cuisine": "Glaces · Desserts · Centre Moraira", "tags": ["Meilleur Gelato", "Grandes Portions"], "desc": "Peut-être la meilleure glace de votre vie – plus de 40 parfums pour peu d'argent. A ne pas manquer!", "special": "Conseil: Max. 2 boules Medium – fond trop vite sinon!"}], "akt": [{"cuisine": "Parc Naturel · Randonnée · Calpe", "tags": ["Emblème Costa Blanca", "Rocher 300m", "Incontournable"], "desc": "L'emblème de la Costa Blanca – rocher de 300m. Montée env. 1h30, panorama 360 degrés jusqu'à Ibiza.", "special": "Conseil: Réservation en ligne obligatoire et chaussures solides"}, {"cuisine": "Kayak · SUP · Snorkeling", "tags": ["5,0 Parfait", "Kayak Grottes", "Tour Lever de Soleil"], "desc": "Tours en kayak dans des grottes côtières spectaculaires, location SUP et snorkeling avec des guides pros.", "special": "Conseil: Tour SUP lever de soleil – début de journée magique"}, {"cuisine": "Parc Animalier · Dauphins · Benidorm", "tags": ["Spectacle Dauphins", "Toucher les Dauphins"], "desc": "Spectaculaire show dauphins, otaries et perroquets. Toucher les dauphins pour 17 euros en ligne.", "special": "Conseil: Billets en ligne moins chers"}, {"cuisine": "Parc Aquatique · Toboggans · Benidorm", "tags": ["Plus Grand Parc Aquatique", "Toboggan Vertige"], "desc": "Le parc aquatique le plus populaire d'Europe – le légendaire toboggan Vertige est incontournable!", "special": "Conseil: Apporter ses propres collations – économise jusqu'à 30 euros"}, {"cuisine": "Safari · Animaux · Penaguila", "tags": ["Bus Safari", "Nourrir les Girafes", "Familles"], "desc": "Le plus grand safari d'Espagne dans la Sierra Aitana – girafes, zèbres, rhinocéros et bien plus.", "special": "Conseil: Réserver le bus safari – au plus près des animaux"}, {"cuisine": "Karting · Fun · Moraira", "tags": ["Tous Ages", "Piste Extérieure"], "desc": "Piste de karting extérieure moderne près de Moraira – idéale pour familles et groupes.", "special": "Conseil: Le soir quand il fait plus frais – plus fun!"}, {"cuisine": "Marché · Local · Vendredis", "tags": ["Chaque Vendredi", "Produits Frais", "Artisanat Local"], "desc": "Chaque vendredi matin au port de Moraira – fruits et légumes frais, délices locaux, artisanat et l'atmosphère authentique du marché espagnol.", "special": "Conseil: Arriver tôt – les meilleurs stands partent vite"}, {"cuisine": "Randonnée · Tour de Guet · Panorama", "tags": ["Vue Spectaculaire", "Randonnée Facile", "Historique"], "desc": "Courte randonnée jusqu'à la tour médiévale avec panorama à couper le souffle sur la mer et la côte jusqu'au Penyal d'Ifac.", "special": "Conseil: Randonnée au coucher du soleil – panorama inoubliable"}, {"cuisine": "Sources Naturelles · Baignade · Callosa", "tags": ["Piscines Naturelles", "Cascade", "Familles"], "desc": "Sources naturelles magiques avec des bassins de baignade cristallins et de petites cascades dans la verdure – l'une des excursions les plus populaires de la Costa Blanca.", "special": "Conseil: Aller en semaine – très fréquenté le week-end"}, {"cuisine": "Village de Montagne · Château · Lac", "tags": ["Village Pittoresque", "Ruines du Château", "Panorama du Lac"], "desc": "Un des plus beaux villages de montagne d'Espagne – perché sur un rocher avec un château et une vue splendide sur le lac turquoise.", "special": "Conseil: Tôt le matin – avant les touristes de Benidorm"}, {"cuisine": "UNESCO · Palmiers · Marché", "tags": ["Patrimoine UNESCO", "Plus Grande Palmeraie d'Europe", "Marché du Samedi"], "desc": "Patrimoine mondial UNESCO: la plus grande palmeraie d'Europe avec plus de 200 000 palmiers. Plus un marché du samedi animé et le centre historique.", "special": "Conseil: Le samedi – marché et palmeraie = excursion parfaite"}, {"cuisine": "Ville · Culture · Gastronomie", "tags": ["Cité des Arts", "Berceau de la Paella", "Vieille Ville"], "desc": "La vibrante métropole de Valence – futuriste Cité des Arts et des Sciences, centre historique et paella originale dans sa ville natale.", "special": "Conseil: La Pepica au port – le restaurant préféré d'Hemingway pour la paella originale"}, {"cuisine": "Shopping · Climatisé · Dénia", "tags": ["Nombreuses Boutiques", "Climatisé", "Idéal par Temps de Pluie"], "desc": "Grand centre commercial près de Dénia – idéal pour un jour de pluie ou les heures les plus chaudes. Mode, électronique, restaurants et cinéma.", "special": "Conseil: Plan parfait pendant les heures de chaleur"}, {"cuisine": "Sentier Côtier · Nature · Panorama", "tags": ["Vue Spectaculaire", "Sentier Côtier Facile", "Flore et Faune"], "desc": "Pittoresque sentier côtier entre Benissa et Calpe – vues magnifiques sur la mer, côte rocheuse sauvage et le silence de la nature à deux pas de la villa.", "special": "Conseil: Partir le matin ou le soir – éviter la chaleur de midi"}], "seh": [{"cuisine": "Plage · Crique Sableuse · Benissa", "tags": ["Plage de Sable", "Location Kayak", "Bar de Plage"], "desc": "Belle plage de sable avec eau cristalline. Location de kayak, bar de plage et aire de jeux pour enfants.", "special": "Conseil: Départ du sentier côtier vers Calpe"}, {"cuisine": "Plage · Crique Naturelle · Benissa", "tags": ["Eau Cristalline", "Snorkeling"], "desc": "Une des plus belles criques naturelles de la Costa Blanca – eau turquoise, rochers pittoresques."}, {"cuisine": "Crique Rocheuse · Snorkeling · CV-746", "tags": ["Meilleure Crique Snorkeling", "Bar de Plage"], "desc": "Une des meilleures criques de snorkeling de la Costa Blanca! Eau cristalline, grands bancs de poissons.", "special": "Conseil: Apporter des chaussures aquatiques"}, {"cuisine": "Plage de Sable · Moraira · Port", "tags": ["Idéale Familles", "SUP et Kayak"], "desc": "La plus belle plage de Moraira – petite plage de sable avec eau calme et cristalline. Parfaite pour les enfants.", "special": "Conseil: Arriver tôt le matin – vite pleine en été"}, {"cuisine": "Crique Rocheuse · Plongée · Benitachell", "tags": ["Grotte Marine", "Plongée", "Spectaculaire"], "desc": "Une des criques les plus spectaculaires de la Costa Blanca – avec une grotte marine praticable!", "special": "Conseil: Nager dans la grotte marine – inoubliable!"}, {"cuisine": "Longue Plage de Sable · Calpe", "tags": ["Longue Plage de Sable", "Vue Ifach"], "desc": "Longue et magnifique plage de sable avec vue spectaculaire sur le Penyal d'Ifac. Eau turquoise.", "special": "Conseil: Combiner avec la montée du Penyal d'Ifac"}, {"cuisine": "Plage de Sable · Calme · Calpe", "tags": ["Plage Calme", "Idéale Familles"], "desc": "Plage de sable calme et peu connue – idéale pour les familles qui veulent éviter la foule.", "special": "Conseil: Agréablement calme même en haute saison"}], "eink": [{"cuisine": "Épicerie Fine · Commerce Familial · CV-746", "tags": ["Boulangerie Fraîche", "Rayon Viande et Poisson"], "desc": "Le favori de tous les vacanciers – supermarché familial avec excellent rayon charcuterie et poissonnerie.", "special": "Conseil: Baguette fraîche le matin – cuite chaque jour"}, {"cuisine": "Discounter · Économique · Benissa", "tags": ["Prix Bas", "Ouvert le Dimanche!"], "desc": "ALDI moderne à seulement 10 minutes de la villa. Un des rares supermarchés de la région ouverts le dimanche.", "special": "Conseil: Seul supermarché ouvert le dimanche"}, {"cuisine": "Supermarché · Complet · Teulada", "tags": ["Produits Locaux", "Grand Parking"], "desc": "Supermarché espagnol bien achalandé à Teulada – fort en produits locaux. Bonne sélection de vins.", "special": "Conseil: Bonne sélection de vins locaux"}]}, "nl": {"rest": [{"cuisine": "Mediterraan · Zeezicht · Moraira", "tags": ["Zeezicht Terras", "Dagelijks Open"], "desc": "Prachtig terras met uitzicht op kasteel en zee – de uitvalsbasis in Moraira. Grote porties, goede prijzen."}, {"cuisine": "Paella · Zeevruchten · CV-746", "tags": ["Beste Paella", "Vlak bij het Strand"], "desc": "Meer dan 3.200 beoordelingen! Beste paella direct aan het strand, verse boquerones, huisgemaakte Ali-Oili.", "special": "Tip: Reserveer een tafel binnen"}, {"cuisine": "Fine Dining · Zeevruchten · CV-746", "tags": ["Romantisch", "Piano-avonden", "Zeezicht"], "desc": "Het meest romantische restaurant in de regio – zee-egels, zomers terras met pianomuziek.", "special": "Tip: Reserveer een zomeravond met pianomuziek"}, {"cuisine": "Bar · Cocktails · Zeezicht", "tags": ["Zonsondergang", "Cocktails"], "desc": "De legendarische zonsondergangbar aan de CV-746 – cocktails met zeezicht, open vanaf 9:30.", "special": "Tip: Zonsondergang om 19:00 – beste plek van de kust"}, {"cuisine": "Mediterraan · Elegant · CV-746", "tags": ["Topbeoordeeld", "Sinds 2016"], "desc": "Sinds 2016 de favoriet van vaste gasten uit heel Europa – buitengewone keuken, uitstekende service."}, {"cuisine": "Mediterraan · Italiaans · CV-746", "tags": ["Topbeoordeeld", "Uitstekende Cocktails"], "desc": "1.059 beoordelingen, bijna allemaal 5 sterren. Perfecte service, adembenemende presentatie."}, {"cuisine": "Strandbar · Live Muziek · Benissa", "tags": ["Live Muziek savonds", "Kliffenpanorama"], "desc": "Idyllische kliffenbar met spectaculair zeezicht, live muziek savonds. Calamari zeer aanbevolen.", "special": "Tip: savonds met live muziek – romantischste zonsondergang"}, {"cuisine": "IJs · Desserts · Centrum Moraira", "tags": ["Beste Gelato", "Grote Porties"], "desc": "Misschien het beste ijs van uw leven – meer dan 40 smaken voor weinig geld. Een must na het avondeten!", "special": "Tip: Max. 2 bollen Medium – smelt anders te snel!"}], "akt": [{"cuisine": "Natuurpark · Wandelen · Calpe", "tags": ["Costa Blanca Blikvanger", "300m Rots", "Must-Visit"], "desc": "Het blikvanger van de Costa Blanca – 300m hoge rots. Beklimming ca. 1,5u, 360 graden panorama tot Ibiza.", "special": "Tip: Online reservering vereist en stevig schoeisel nodig"}, {"cuisine": "Kayak · SUP · Snorkelen", "tags": ["5,0 Perfect", "Grotten-kayak", "Zonsopgang Tour"], "desc": "Kajaktorochten door spectaculaire kustsgrotten, SUP-verhuur en snorkelen met professionele gidsen.", "special": "Tip: Zonsopgang SUP Tour – magisch begin van de dag"}, {"cuisine": "Dierenpark · Dolfijnen · Benidorm", "tags": ["Dolfijnenshow", "Dolfijnen Aanraken"], "desc": "Spectaculaire dolfijnen-, zeeleeuwen- en papegaaienshow. Dolfijnen aanraken voor 17 euro online.", "special": "Tip: Online tickets goedkoper"}, {"cuisine": "Waterpark · Glijbanen · Benidorm", "tags": ["Grootste Waterpark van Spanje", "Vertigo Glijbaan"], "desc": "Europa's populairste waterpark – de legendarische Vertigo-glijbaan is een must!", "special": "Tip: Eigen snacks meenemen – bespaart tot 30 euro"}, {"cuisine": "Safaripark · Dieren · Penaguila", "tags": ["Safaribus", "Giraffen Voeren", "Gezinnen"], "desc": "Spanje's grootste safaripark in de Sierra Aitana – giraffen, zebras, neushoorns en nog veel meer.", "special": "Tip: Reserveer de safaribus – dichtbij de dieren"}, {"cuisine": "Karting · Plezier · Moraira", "tags": ["Alle Leeftijden", "Buiten Kartbaan"], "desc": "Moderne buitenkartbaan vlak bij Moraira – ideaal voor gezinnen en groepen.", "special": "Tip: savonds als het koeler is – meer plezier!"}, {"cuisine": "Markt · Lokaal · Vrijdags", "tags": ["Elke Vrijdag", "Verse Producten", "Lokaal Handwerk"], "desc": "Elke vrijdagochtend in de haven van Moraira – verse groenten en fruit, lokale delicatessen, handwerk en de authentieke sfeer van een Spaanse markt.", "special": "Tip: Vroeg komen – de beste kramen zijn snel weg"}, {"cuisine": "Wandeling · Wachttoren · Panorama", "tags": ["Spectaculair Zeezicht", "Makkelijke Wandeling", "Historisch"], "desc": "Korte lonende wandeling naar de middeleeuwse wachttoren met adembenemend panorama over de zee en kust tot aan de Penyal d'Ifac.", "special": "Tip: Wandelen bij zonsondergang – onvergetelijk panorama"}, {"cuisine": "Natuurbronnen · Zwemmen · Callosa", "tags": ["Natuurlijke Zwembaden", "Waterval", "Gezinnen"], "desc": "Magische natuurbronnen met kristalheldere zwembaden en kleine watervallen in weelderig groen – een van de populairste uitstapjes van de Costa Blanca.", "special": "Tip: Door de week gaan – in het weekend erg druk"}, {"cuisine": "Bergdorp · Kasteel · Stuwmeer", "tags": ["Schilderachtig Dorp", "Kasteelruïne", "Stuwmeer Panorama"], "desc": "Een van de mooiste bergdorpjes van Spanje – hoog op een rots met kasteelruïne en prachtig uitzicht over het turquoise stuwmeer.", "special": "Tip: Vroeg in de ochtend – vóór de dagjesmensen uit Benidorm"}, {"cuisine": "UNESCO · Palmen · Markt", "tags": ["UNESCO Werelderfgoed", "Grootste Palmenbos van Europa", "Zaterdagmarkt"], "desc": "UNESCO Werelderfgoed: het grootste palmenbos van Europa met meer dan 200.000 palmen. Plus een levendige zaterdagmarkt en het historische centrum.", "special": "Tip: Op zaterdag – markt en palmen = perfecte dagtrip"}, {"cuisine": "Stad · Cultuur · Gastronomie", "tags": ["Stad der Kunsten", "Bakermat van Paella", "Historisch Centrum"], "desc": "De bruisende stad Valencia – futuristische Stad der Kunsten en Wetenschappen, historisch centrum en originele paella in haar thuisstad.", "special": "Tip: La Pepica aan de haven – Hemingways lievelingsrestaurant voor originele paella"}, {"cuisine": "Winkelen · Airconditioned · Dénia", "tags": ["Veel Winkels", "Airconditioned", "Ideaal bij Regen"], "desc": "Groot winkelcentrum vlak bij Dénia – ideaal voor een regendag of de heetste uren van de dag. Mode, elektronica, restaurants en bioscoop.", "special": "Tip: Perfect alternatief tijdens de heetste middaguren"}, {"cuisine": "Kustpad · Natuur · Panorama", "tags": ["Spectaculair Zeezicht", "Makkelijk Kustpad", "Flora en Fauna"], "desc": "Schilderachtig kustpad tussen Benissa en Calpe – prachtig zeezicht, ruige kustlijn en de stilte van de natuur vlak bij de villa.", "special": "Tip: 's Ochtends of 's avonds vertrekken – middagwarmte vermijden"}], "seh": [{"cuisine": "Strand · Zandinham · Benissa", "tags": ["Zandstrand", "Kayak Verhuur", "Strandbar"], "desc": "Prachtig zandstrand met kristalhelder water. Kayakverhuur, strandbar en speeltuin voor kinderen.", "special": "Tip: Start van het kustpad richting Calpe"}, {"cuisine": "Strand · Natuurlijke Inham · Benissa", "tags": ["Kristalhelder Water", "Snorkelen"], "desc": "Een van de mooiste natuurlijke inhammen van de Costa Blanca – turquoise water, schilderachtige rotsen."}, {"cuisine": "Rotsinham · Snorkelen · CV-746", "tags": ["Beste Snorkelinham", "Strandbar"], "desc": "Een van de beste snorkelinhammen van de Costa Blanca! Kristalhelder water, grote visscholen.", "special": "Tip: Waterschoenen meenemen – beste snorkelplek!"}, {"cuisine": "Zandstrand · Moraira · Haven", "tags": ["Gezinsvriendelijk", "SUP en Kayak"], "desc": "Het mooiste strand van Moraira – klein zandstrand met rustig, kristalhelder water. Perfect voor kinderen.", "special": "Tip: Vroeg in de ochtend komen – vol in de zomer"}, {"cuisine": "Rotsinham · Duiken · Benitachell", "tags": ["Zeegrot", "Duiken", "Spectaculair"], "desc": "Een van de meest spectaculaire inhammen – met een beloopbare zeegrot! Beroemd voor duiken.", "special": "Tip: Door de zeegrot zwemmen – onvergetelijk!"}, {"cuisine": "Lang Zandstrand · Calpe", "tags": ["Lang Zandstrand", "Ifach-uitzicht"], "desc": "Lang mooi zandstrand met spectaculair uitzicht op de Penyal d'Ifac. Turquoise water.", "special": "Tip: Combineren met beklimming van de Penyal d'Ifac"}, {"cuisine": "Zandstrand · Rustig · Calpe", "tags": ["Rustig Strand", "Gezinsvriendelijk"], "desc": "Rustig, minder bekend zandstrand – ideaal voor gezinnen die de drukte willen vermijden.", "special": "Tip: Aangenaam rustig ook in het hoogseizoen"}], "eink": [{"cuisine": "Delicatessen · Familiebedrijf · CV-746", "tags": ["Verse Bakkerij", "Vlees en Visafdeling"], "desc": "De favoriet van alle vakantiegangers – familiale supermarkt met uitstekende vlees- en visafdeling.", "special": "Tip: Verse baguette savonds – dagelijks gebakken"}, {"cuisine": "Discounter · Voordelig · Benissa", "tags": ["Lage Prijzen", "Open op Zondag!"], "desc": "Moderne ALDI op slechts 10 minuten van de villa. Een van de weinige supermarkten die zondag open zijn.", "special": "Tip: Enige supermarkt met zondagsopening"}, {"cuisine": "Supermarkt · Volledig Assortiment · Teulada", "tags": ["Lokale Producten", "Grote Parkeerplaats"], "desc": "Goed gesorteerde Spaanse supermarkt in Teulada – sterk in lokale producten. Goede wijnkeuze.", "special": "Tip: Goede keuze aan lokale wijnen"}]}, "pl": {"rest": [{"cuisine": "Sródziemnomorska · Widok na Morze · Moraira", "tags": ["Taras z Widokiem", "Otwarte Codziennie"], "desc": "Wspanialy taras z widokiem na zamek i morze – obowiazkowe miejsce w Moraira. Ogromne porcje, swietne ceny."}, {"cuisine": "Paella · Owoce Morza · CV-746", "tags": ["Najlepsza Paella", "Blisko Plazy"], "desc": "Ponad 3200 opinii! Najlepsza paella prosto na plazy, swieze boquerones, domowe Ali-Oili.", "special": "Wskazowka: Zarezerwuj stolik wewnatrz"}, {"cuisine": "Fine Dining · Owoce Morza · CV-746", "tags": ["Romantyczna", "Wieczory z Pianinem", "Widok na Morze"], "desc": "Najbardziej romantyczna restauracja w regionie – jezowce morskie, taras letni z muzyka fortepianowa.", "special": "Wskazowka: Zarezerwuj letni wieczor z muzyka"}, {"cuisine": "Bar · Koktajle · Widok na Morze", "tags": ["Zachod Slonca", "Koktajle"], "desc": "Legendarny bar zachodu slonca przy CV-746 – koktajle z widokiem na morze, otwarte od 9:30.", "special": "Wskazowka: Zachod slonca o 19:00 – najlepsze miejsce na wybrzezu"}, {"cuisine": "Srodziemnomorska · Elegancka · CV-746", "tags": ["Najwyzej Oceniana", "Od 2016"], "desc": "Od 2016 ulubieniec stalych gosci z calej Europy – wyjatkowa kuchnia, doskonala obsluga."}, {"cuisine": "Srodziemnomorska · Wloska · CV-746", "tags": ["Najwyzej Oceniana", "Doskonale Koktajle"], "desc": "1059 opinii, prawie wszystkie 5 gwiazdek. Perfekcyjna obsluga, zapierajaca dech prezentacja."}, {"cuisine": "Bar Plazowy · Muzyka Na Zywo · Benissa", "tags": ["Muzyka Wieczorami", "Panorama Klifow"], "desc": "Idylliczny bar na klifach ze spektakularnym widokiem na morze, muzyka na zywo wieczorami.", "special": "Wskazowka: Wieczory z muzyka – najbardziej romantyczny zachod slonca"}, {"cuisine": "Lody · Desery · Centrum Moraira", "tags": ["Najlepsze Gelato", "Ogromne Porcje"], "desc": "Byc moze najlepsze lody w Twoim zyciu – ponad 40 smaków za male pieniadze. Obowiazkowy przystanek!", "special": "Wskazowka: Max. 2 galki Medium – inaczej za szybko sie topi!"}], "akt": [{"cuisine": "Park Przyrody · Wedrowki · Calpe", "tags": ["Symbol Costa Blanca", "Skala 300m", "Obowiazkowe"], "desc": "Symbol Costa Blanca – skala 300m nad morzem. Wejscie ok. 1,5h, panorama 360 stopni az do Ibizy.", "special": "Wskazowka: Rezerwacja online obowiazkowa i solidne buty"}, {"cuisine": "Kajak · SUP · Snorkling", "tags": ["5,0 Perfekcja", "Kajak w Jaskiniach", "Wycieczka o Swicie"], "desc": "Wycieczki kajakowe przez spektakularne groty przybrzezne, wynajem SUP i snorkling z profesjonalnymi przewodnikami.", "special": "Wskazowka: Wycieczka SUP o swicie – magiczny poczatek dnia"}, {"cuisine": "Park Zwierzat · Delfiny · Benidorm", "tags": ["Pokaz Delfinow", "Dotknij Delfiny"], "desc": "Spektakularny pokaz delfinow, lwow morskich i papug. Dotykanie delfinow za 17 euro online.", "special": "Wskazowka: Bilety online taniej"}, {"cuisine": "Park Wodny · Zjezdz alnie · Benidorm", "tags": ["Najwiekszy Park Wodny w Hiszpanii", "Zjezdz alnia Vertigo"], "desc": "Najpopularniejszy park wodny Europy – legendarna zjezdz alnia Vertigo to obowiazek!", "special": "Wskazowka: Zabierz wlasne przekaski – oszczednosc do 30 euro"}, {"cuisine": "Safari · Zwierzeta · Penaguila", "tags": ["Bus Safari", "Karmienie Zyraf", "Rodziny"], "desc": "Najwieksze safari w Hiszpanii w gorach Sierra Aitana – zyrafy, zebry, nosorozce i wiele wiecej.", "special": "Wskazowka: Zarezerwuj bus safari – blisko zwierzat"}, {"cuisine": "Karting · Zabawa · Moraira", "tags": ["Dla Wszystkich", "Zewnetrzny Tor"], "desc": "Nowoczesny zewnetrzny tor kartingowy blisko Moraira – idealny dla rodzin i grup.", "special": "Wskazowka: Wieczorem gdy chlodniej – wiecej zabawy!"}, {"cuisine": "Targ · Lokalne · Piatki", "tags": ["Kazdy Piatek", "Swieze Produkty", "Lokalne Rekodzielnictwo"], "desc": "Kazdy piatek rano w porcie Moraira – swieze warzywa i owoce, lokalne przysmaki, rekodzielnictwo i autentyczna atmosfera hiszpanskiego targu.", "special": "Wskazowka: Przyjdz wczesnie – najlepsze stragany szybko sie koncza"}, {"cuisine": "Wedrowka · Wieza Straznicza · Panorama", "tags": ["Spektakularne Widoki na Morze", "Latwa Wedrowka", "Historyczne"], "desc": "Krotka, nagradzajaca wedrowka do sredniowiecznej wiezy strazniczej z zapierajacym dech panoramicznym widokiem na morze i wybrzeze az do Penyal d'Ifac.", "special": "Wskazowka: Wedrowka o zachodzie slonca – niezapomniana panorama"}, {"cuisine": "Naturalne Zrodla · Kapiel · Callosa", "tags": ["Naturalne Baseny", "Wodospad", "Rodziny"], "desc": "Magiczne naturalne zrodla z krystalicznie czystymi basenami i malymi wodospadami w bujnej zieleni – jedna z najpopularniejszych wycieczek na Coste Blance.", "special": "Wskazowka: Pojechac w tygodniu – w weekend bardzo tloczno"}, {"cuisine": "Gorska Wioska · Zamek · Jezioro", "tags": ["Malownicza Wioska", "Ruiny Zamku", "Panorama Jeziora"], "desc": "Jedna z najpieki ejszych gorskich wiosek Hiszpanii – osadzona wysoko na skale z ruinami zamku i pieknym widokiem na turkusowe jezioro.", "special": "Wskazowka: Wczesnie rano – przed turystami z Benidorm"}, {"cuisine": "UNESCO · Palmy · Targ", "tags": ["Swiatowe Dziedzictwo UNESCO", "Najwiekszy Palmowy Gaj Europy", "Sobotni Targ"], "desc": "Swiatowe Dziedzictwo UNESCO: najwiekszy palmowy gaj Europy z ponad 200 000 palmami. Plus zywiolowy sobotni targ i historyczne centrum miasta.", "special": "Wskazowka: W sobote – targ i palmy = idealna wycieczka"}, {"cuisine": "Miasto · Kultura · Gastronomia", "tags": ["Ciudad de las Artes", "Ojczyzna Paelli", "Historyczne Stare Miasto"], "desc": "Tetniaca zyciem Walencja – futurystyczne Ciudad de las Artes y Ciencias, historyczne centrum i oryginalna paella w swoim rodzinnym miescie.", "special": "Wskazowka: La Pepica w porcie – ulubiona restauracja Hemingwaya dla oryginalnej paelli"}, {"cuisine": "Zakupy · Klimatyzacja · Denia", "tags": ["Wiele Sklepow", "Klimatyzowane", "Idealne przy Deszczu"], "desc": "Duze centrum handlowe w poblizu Denii – idealne na deszczowy dzien lub najgoretsze pory dnia. Moda, elektronika, restauracje i kino.", "special": "Wskazowka: Idealny plan zastepczy w upal"}, {"cuisine": "Sciezka Przybrzezna · Natura · Panorama", "tags": ["Spektakularne Widoki na Morze", "Latwa Sciezka Przybrzezna", "Flora i Fauna"], "desc": "Malownicza sciezka przybrzezna miedzy Benissa a Calpe – piekne widoki na morze, dzika skalista linia brzegowa i cisza natury tuz przy willi.", "special": "Wskazowka: Startowac rano lub wieczorem – unikac poludniowego upalu"}], "seh": [{"cuisine": "Plaza · Piaszczysta Zatoczka · Benissa", "tags": ["Plaza Piaszczysta", "Wypozyczalnia Kajak ow", "Bar Plazowy"], "desc": "Piekna piaszczysta plaza z krystalicznie czyst a woda. Wypozyczalnia kajak ow, bar plazowy i plac zabaw.", "special": "Wskazowka: Poczatek szlaku wzdluz wybrzeza do Calpe"}, {"cuisine": "Plaza · Naturalna Zatoczka · Benissa", "tags": ["Krystalicznie Czysta Woda", "Snorkling"], "desc": "Jedna z najpieki ejszych naturalnych zatoczek Costa Blanca – turkusowa woda, malownicze skaly."}, {"cuisine": "Skalista Zatoczka · Snorkling · CV-746", "tags": ["Najlepsza Zatoczka do Snorklingu", "Bar Plazowy"], "desc": "Jedna z najlepszych zatoczek do snorklingu na Costa Blanca! Krystalicznie czyst a woda, ogromne lawice ryb.", "special": "Wskazowka: Buty do wody – najlepsze miejsce do snorklingu!"}, {"cuisine": "Plaza Piaszczysta · Moraira · Port", "tags": ["Przyjazna Rodzinom", "SUP i Kajak"], "desc": "Najpi ekniejsza plaza Moraira – mala piaszczysta plaza ze spokojna, krystalicznie czyst a woda.", "special": "Wskazowka: Przyjedz wczesnym rankiem – latem szybko sie zapelnia"}, {"cuisine": "Skalista Zatoczka · Nurkowanie · Benitachell", "tags": ["Morska Grota", "Nurkowanie", "Spektakularna"], "desc": "Jedna z najbardziej spektakularnych zatoczek – z morska grota do przeplyniecia! Slynna z nurkowania.", "special": "Wskazowka: Przeplyndziesz przez morska grote – niezapomniane!"}, {"cuisine": "Dluga Plaza Piaszczysta · Calpe", "tags": ["Dluga Plaza Piaszczysta", "Widok na Ifach"], "desc": "Dluga piekna plaza piaszczysta z spektakularnym widokiem na Penyal d'Ifac. Turkusowa woda.", "special": "Wskazowka: Polacz z wejsciem na Penyal d'Ifac"}, {"cuisine": "Plaza Piaszczysta · Spokojna · Calpe", "tags": ["Spokojna Plaza", "Przyjazna Rodzinom"], "desc": "Spokojna, malo znana plaza piaszczysta – idealna dla rodzin chcacych uniknac tlumow.", "special": "Wskazowka: Przyjemnie spokojna nawet w szczycie sezonu"}], "eink": [{"cuisine": "Delikatesy · Rodzinny Biznes · CV-746", "tags": ["Swieze Pieczywo", "Dzial Miesny i Rybny"], "desc": "Ulubiony sklep wszystkich turystow – rodzinny supermarket z doskonalym dzialem miesnym i rybnym.", "special": "Wskazowka: Swieza bagietka rano – pieczona codziennie"}, {"cuisine": "Dyskonter · Tanie Ceny · Benissa", "tags": ["Niskie Ceny", "Otwarte w Niedziele!"], "desc": "Nowoczesny ALDI tylko 10 minut od willi. Jeden z nielicznych supermarketow w regionie otwartych w niedziele.", "special": "Wskazowka: Jedyny sklep z niedzielnym otwarciem"}, {"cuisine": "Supermarket · Pelen Asortyment · Teulada", "tags": ["Lokalne Produkty", "Duzy Parking"], "desc": "Dobrze zaopatrzony hiszpanski supermarket w Teulada – mocny w lokalnych produktach. Dobry wybor win.", "special": "Wskazowka: Dobry wybor lokalnych win"}]}, "ru": {"rest": [{"cuisine": "Средиземноморская · Вид на Море · Моraира", "tags": ["Терраса с Видом", "Открыто Ежедневно"], "desc": "Потрясающая терраса с видом на замок и море – главное место в Моraире. Большие порции, отличные цены."}, {"cuisine": "Паэлья · Морепродукты · CV-746", "tags": ["Лучшая Паэлья", "Рядом с Пляжем"], "desc": "Более 3200 отзывов! Лучшая паэлья прямо на пляже, свежие boquerones, домашний Ali-Oili.", "special": "Совет: Забронируйте стол внутри"}, {"cuisine": "Высокая Кухня · Морепродукты · CV-746", "tags": ["Романтика", "Вечера с Пианино", "Вид на Море"], "desc": "Самый романтичный ресторан в регионе – морские ежи, летняя терраса с фортепианной музыкой.", "special": "Совет: Забронируйте летний вечер с пианино"}, {"cuisine": "Бар · Коктейли · Вид на Море", "tags": ["Закат", "Коктейли"], "desc": "Легендарный бар заката на CV-746 – коктейли с видом на море, открыто с 9:30.", "special": "Совет: Закат в 19:00 – лучшее место на побережье"}, {"cuisine": "Средиземноморская · Элегантная · CV-746", "tags": ["Высокий Рейтинг", "С 2016 года"], "desc": "С 2016 года любимое место постоянных гостей со всей Европы – выдающаяся кухня, отличный сервис."}, {"cuisine": "Средиземноморская · Итальянская · CV-746", "tags": ["Высокий Рейтинг", "Отличные Коктейли"], "desc": "1059 отзывов, почти все 5 звёзд. Безупречный сервис, потрясающая подача блюд."}, {"cuisine": "Пляжный Бар · Живая Музыка · Бениса", "tags": ["Живая Музыка Вечерами", "Панорама Скал"], "desc": "Идиллический бар на скалах со spectacular видом на море, живая музыка по вечерам.", "special": "Совет: Вечера с живой музыкой – самый романтичный закат"}, {"cuisine": "Мороженое · Десерты · Центр Моraиры", "tags": ["Лучшее Джелато", "Огромные Порции"], "desc": "Пожалуй, лучшее мороженое в вашей жизни – более 40 вкусов за небольшие деньги. Обязательно после ужина!", "special": "Совет: Макс. 2 шарика Medium – иначе тает слишком быстро!"}], "akt": [{"cuisine": "Природный Парк · Пешие Прогулки · Кальпе", "tags": ["Символ Коста-Бланки", "Скала 300м", "Обязательно"], "desc": "Символ Коста-Бланки – скала 300м над морем. Подъём ок. 1,5ч, панорама 360 градусов до Ибицы.", "special": "Совет: Онлайн-бронирование обязательно и прочная обувь"}, {"cuisine": "Каяк · SUP · Снорклинг", "tags": ["5,0 Идеально", "Каяк в Пещерах", "Тур на Рассвете"], "desc": "Туры на каяках через пещеры, аренда SUP и снорклинг с профессиональными гидами.", "special": "Совет: Тур SUP на рассвете – магическое начало дня"}, {"cuisine": "Зоопарк · Дельфины · Бенидорм", "tags": ["Шоу Дельфинов", "Погладить Дельфинов"], "desc": "Захватывающее шоу дельфинов, морских львов и попугаев. Погладить дельфинов за 17 евро онлайн.", "special": "Совет: Онлайн-билеты дешевле"}, {"cuisine": "Аквапарк · Горки · Бенидорм", "tags": ["Крупнейший Аквапарк Испании", "Горка Вертиго"], "desc": "Самый популярный аквапарк Европы – легендарная горка Вертиго обязательна!", "special": "Совет: Возьмите свои закуски – экономия до 30 евро"}, {"cuisine": "Сафари · Животные · Пенагила", "tags": ["Автобус Сафари", "Кормление Жирафов", "Семьи"], "desc": "Крупнейший сафари-парк Испании в горах Сьерра Айтана – жирафы, зебры, носороги и многие другие.", "special": "Совет: Закажите автобус сафари – вблизи от животных"}, {"cuisine": "Картинг · Развлечение · Моraира", "tags": ["Для Всех Возрастов", "Открытая Трасса"], "desc": "Современная открытая картодром рядом с Моraирой – идеально для семей и групп.", "special": "Совет: Вечером когда прохладнее – веселее!"}, {"cuisine": "Рынок · Местный · Пятница", "tags": ["Каждую Пятницу", "Свежие Продукты", "Местные Ремёсла"], "desc": "Каждую пятницу утром в порту Мораиры – свежие овощи и фрукты, местные деликатесы, ремёсла и подлинная атмосфера испанского рынка.", "special": "Совет: Приходите пораньше – лучшие прилавки быстро разбирают"}, {"cuisine": "Прогулка · Сторожевая Башня · Панорама", "tags": ["Захватывающий Вид на Море", "Лёгкая Прогулка", "Историческое"], "desc": "Короткий, но запоминающийся поход к средневековой сторожевой башне с захватывающей панорамой моря и побережья до самого Penyal d'Ifac.", "special": "Совет: Прогулка на закате – незабываемая панорама"}, {"cuisine": "Природные Источники · Купание · Калоса", "tags": ["Природные Бассейны", "Водопад", "Семьи"], "desc": "Волшебные природные источники с кристально чистыми купальными бассейнами и небольшими водопадами среди буйной зелени – одна из самых популярных экскурсий Коста-Бланки.", "special": "Совет: Ехать в будни – в выходные очень много людей"}, {"cuisine": "Горная Деревня · Замок · Водохранилище", "tags": ["Живописная Деревня", "Руины Замка", "Панорама Водохранилища"], "desc": "Одна из красивейших горных деревень Испании – высоко на скале с руинами замка и прекрасным видом на бирюзовое водохранилище.", "special": "Совет: Рано утром – до приезда туристов из Бенидорма"}, {"cuisine": "ЮНЕСКО · Пальмы · Рынок", "tags": ["Объект ЮНЕСКО", "Крупнейшая Пальмовая Роща Европы", "Субботний Рынок"], "desc": "Объект Всемирного наследия ЮНЕСКО: крупнейшая пальмовая роща Европы с более чем 200 000 пальм. Плюс оживлённый субботний рынок и исторический центр.", "special": "Совет: В субботу – рынок и пальмы = идеальная поездка"}, {"cuisine": "Город · Культура · Гастрономия", "tags": ["Город Искусств", "Родина Паэльи", "Исторический Центр"], "desc": "Пульсирующая Валенсия – футуристический Город искусств и наук, исторический центр и оригинальная паэлья в её родном городе. Абсолютный мастхэв!", "special": "Совет: La Pepica в порту – любимый ресторан Хемингуэя с оригинальной паэльей"}, {"cuisine": "Шопинг · Кондиционер · Дения", "tags": ["Много Магазинов", "Кондиционер", "Идеально в Дождь"], "desc": "Большой торговый центр рядом с Денией – идеально для дождливого дня или самых жарких часов. Мода, электроника, рестораны и кино.", "special": "Совет: Идеальный запасной план в жаркий полдень"}, {"cuisine": "Прибрежная Тропа · Природа · Панорама", "tags": ["Захватывающий Вид на Море", "Лёгкая Прибрежная Тропа", "Флора и Фауна"], "desc": "Живописная прибрежная тропа между Бениссой и Кальпе – потрясающие виды на море, дикое скалистое побережье и тишина природы прямо у порога виллы.", "special": "Совет: Стартовать утром или вечером – избегать полуденного зноя"}], "seh": [{"cuisine": "Пляж · Песчаная Бухта · Бениса", "tags": ["Песчаный Пляж", "Аренда Каяков", "Пляжный Бар"], "desc": "Красивый песчаный пляж с кристально чистой водой. Аренда каяков, пляжный бар и детская площадка.", "special": "Совет: Начало прибрежного маршрута до Кальпе"}, {"cuisine": "Пляж · Природная Бухта · Бениса", "tags": ["Кристально Чистая Вода", "Снорклинг"], "desc": "Одна из красивейших природных бухт Коста-Бланки – бирюзовая вода, живописные скалы."}, {"cuisine": "Скальная Бухта · Снорклинг · CV-746", "tags": ["Лучшая Бухта для Снорклинга", "Пляжный Бар"], "desc": "Одна из лучших бухт для снорклинга на Коста-Бланке! Кристально чистая вода, огромные косяки рыб.", "special": "Совет: Возьмите акваботинки – лучшее место для снорклинга!"}, {"cuisine": "Песчаный Пляж · Моraира · Порт", "tags": ["Для Семей", "SUP и Каяк"], "desc": "Красивейший пляж Моraиры – небольшой песчаный пляж со спокойной кристально чистой водой.", "special": "Совет: Приезжайте рано утром – летом быстро заполняется"}, {"cuisine": "Скальная Бухта · Дайвинг · Бенитачель", "tags": ["Морская Пещера", "Дайвинг", "Впечатляющая"], "desc": "Одна из самых впечатляющих бухт – с проходимой морской пещерой! Знаменита дайвингом.", "special": "Совет: Проплыть через морскую пещеру – незабываемо!"}, {"cuisine": "Длинный Песчаный Пляж · Кальпе", "tags": ["Длинный Песчаный Пляж", "Вид на Ифак"], "desc": "Длинный красивый песчаный пляж с захватывающим видом на Penyal d'Ifac. Бирюзовая вода.", "special": "Совет: Совместите с подъёмом на Penyal d'Ifac"}, {"cuisine": "Песчаный Пляж · Спокойный · Кальпе", "tags": ["Спокойный Пляж", "Для Семей"], "desc": "Спокойный, малоизвестный песчаный пляж – идеален для семей, избегающих толпы.", "special": "Совет: Приятно спокойно даже в разгар сезона"}], "eink": [{"cuisine": "Деликатесы · Семейный Бизнес · CV-746", "tags": ["Свежая Выпечка", "Мясной и Рыбный Отдел"], "desc": "Любимое место всех отдыхающих – семейный супермаркет с отличным мясным и рыбным отделом.", "special": "Совет: Свежий багет утром – печётся каждый день"}, {"cuisine": "Дискаунтер · Бюджетно · Бениса", "tags": ["Низкие Цены", "Открыто в Воскресенье!"], "desc": "Современный ALDI всего в 10 минутах от виллы. Один из немногих супермаркетов региона, открытых в воскресенье.", "special": "Совет: Единственный с воскресным графиком"}, {"cuisine": "Супермаркет · Полный Ассортимент · Теулада", "tags": ["Местные Продукты", "Большая Парковка"], "desc": "Хорошо укомплектованный испанский супермаркет в Теуладе – богатый выбор местных продуктов и вин.", "special": "Совет: Хороший выбор местных вин"}]}};

// ── Ergänzende Kachel-Übersetzungen für zuvor nicht abgedeckte Karten ──
// (6 Restaurants + 1 Supermarkt). Werden unten indexgerecht angehängt.
var tileExtra = {
  de:{rest:[
    {cuisine:"Pizza · Pasta · Moraira",tags:["Große Portionen","Pizza to Go"],desc:"Perfekt für einen entspannten Abend ohne großes Tamtam – einfache, aber wirklich leckere Küche mit großzügigen Portionen. Die Schnitzel sind legendär groß und sehr beliebt. Nach einem langen Strandtag auch ideal für Pizza to Go."},
    {cuisine:"Traditionell · Spanisch · Bergdorf",tags:["Authentisch","Kein Tourismus"],desc:"Wer das ursprüngliche Spanien abseits aller Touristenrouten erleben möchte, sollte unbedingt hierher fahren. Dieses kleine Familienrestaurant in den Bergen serviert wenige, aber herzhafte Gerichte zu sehr fairen Preisen. Ein Erlebnis, das bleibt.",special:"✦ Tipp: Schließt bereits gegen 20 Uhr – früh planen!"},
    {cuisine:"Modern · Vielseitig · Moraira",tags:["Unser Lieblingsspot","Lunch & Abend"],desc:"Einer unserer absoluten Lieblingsorte in Moraira. Modernes Ambiente, eine vielseitige Karte mit wirklich für jeden etwas dabei – ob leichter Lunch oder entspannter Abend mit Freunden. Die Qualität stimmt, die Atmosphäre auch."},
    {cuisine:"Café · Bar · Moraira",tags:["Frühstück","Meerblick"],desc:"Wunderschöner Frühstücksspot mit herzlichem Inhaber und manchmal ganz besonderen Veranstaltungen. Unser Geheimtipp: Fragt unbedingt nach der Dachterrasse – von dort hat man einen traumhaften Blick aufs Meer.",special:"✦ Geheimtipp: Nach der Dachterrasse fragen!"},
    {cuisine:"Strandbar · Tapas · El Portet",tags:["Strandlage","Sonnenuntergang"],desc:"Eine typisch spanische Strandbar direkt in der kleinen Bucht El Portet – besonders schön in der Nebensaison, wenn es ruhiger ist. Zum Sonnenuntergang mit einem Glas Weißwein und Pan con Aioli: pures Mittelmeer-Feeling.",special:"✦ Tipp: Pan con Aioli + Weißwein zum Sonnenuntergang"},
    {cuisine:"Fine Dining · Französisch · Moraira",tags:["Traumhafte Aussicht","Besonderer Abend"],desc:"Für einen wirklich besonderen Abend – traumhafte Aussicht, elegante Atmosphäre und eine hochwertige Küche, die begeistert. Unser Tipp für Jubiläen, Geburtstage oder einfach wenn man sich selbst etwas Gutes tun möchte.",special:"✦ Tipp: Tisch zur goldenen Stunde reservieren"}
  ],eink:[
    {cuisine:"Supermarkt · Vollsortiment · Teulada",tags:["Lokale Produkte","Großer Parkplatz"],desc:"Gut sortierter spanischer Supermarkt direkt in Teulada – stark bei lokalen Produkten der Costa Blanca und guter Weinauswahl. Der nächste Vollsortimenter zur Villa.",special:"✦ Tipp: Gute Auswahl an lokalen Weinen und regionalen Produkten"}
  ]},
  en:{rest:[
    {cuisine:"Pizza · Pasta · Moraira",tags:["Large Portions","Pizza to Go"],desc:"Perfect for a relaxed evening without any fuss – simple but truly tasty food with generous portions. The schnitzels are legendarily huge and very popular. Also ideal for pizza to go after a long day at the beach."},
    {cuisine:"Traditional · Spanish · Mountain Village",tags:["Authentic","No Tourism"],desc:"If you want to experience the real Spain away from all the tourist routes, this is a must. This small family restaurant in the mountains serves a few but hearty dishes at very fair prices. An experience that stays with you.",special:"✦ Tip: Closes around 8 pm – plan early!"},
    {cuisine:"Modern · Versatile · Moraira",tags:["Our Favourite Spot","Lunch & Dinner"],desc:"One of our absolute favourite places in Moraira. A modern setting and a versatile menu with something for everyone – whether a light lunch or a relaxed evening with friends. The quality is spot on, and so is the atmosphere."},
    {cuisine:"Café · Bar · Moraira",tags:["Breakfast","Sea View"],desc:"A beautiful breakfast spot with a warm-hearted owner and sometimes very special events. Our insider tip: be sure to ask about the roof terrace – it offers a stunning view over the sea.",special:"✦ Insider tip: Ask about the roof terrace!"},
    {cuisine:"Beach Bar · Tapas · El Portet",tags:["Beachfront","Sunset"],desc:"A typical Spanish beach bar right on the small bay of El Portet – especially lovely off-season, when it is quieter. At sunset, with a glass of white wine and pan con aioli: pure Mediterranean feeling.",special:"✦ Tip: Pan con aioli + white wine at sunset"},
    {cuisine:"Fine Dining · French · Moraira",tags:["Dreamlike View","Special Evening"],desc:"For a truly special evening – a dreamlike view, an elegant atmosphere and high-quality cuisine that delights. Our tip for anniversaries, birthdays or simply when you want to treat yourself.",special:"✦ Tip: Reserve a table for the golden hour"}
  ],eink:[
    {cuisine:"Supermarket · Full Range · Teulada",tags:["Local Products","Large Car Park"],desc:"A well-stocked Spanish supermarket right in Teulada – strong on local Costa Blanca products and with a good wine selection. The closest full-range supermarket to the villa.",special:"✦ Tip: Good selection of local wines and regional products"}
  ]},
  es:{rest:[
    {cuisine:"Pizza · Pasta · Moraira",tags:["Raciones Grandes","Pizza para Llevar"],desc:"Perfecto para una velada tranquila sin complicaciones: cocina sencilla pero realmente sabrosa y con raciones generosas. Los escalopes son legendariamente grandes y muy populares. También ideal para pizza para llevar tras un largo día de playa."},
    {cuisine:"Tradicional · Español · Pueblo de Montaña",tags:["Auténtico","Sin Turismo"],desc:"Si quieres vivir la España auténtica lejos de las rutas turísticas, este lugar es imprescindible. Este pequeño restaurante familiar en la montaña sirve pocos pero sabrosos platos a precios muy justos. Una experiencia que perdura.",special:"✦ Consejo: Cierra hacia las 20 h, ¡planifica temprano!"},
    {cuisine:"Moderno · Variado · Moraira",tags:["Nuestro Lugar Favorito","Almuerzo y Cena"],desc:"Uno de nuestros lugares favoritos en Moraira. Ambiente moderno y una carta variada con algo para todos, ya sea un almuerzo ligero o una cena relajada con amigos. La calidad está a la altura, y el ambiente también."},
    {cuisine:"Café · Bar · Moraira",tags:["Desayuno","Vistas al Mar"],desc:"Un precioso lugar para desayunar, con un propietario muy cordial y a veces eventos muy especiales. Nuestro consejo secreto: pregunta por la azotea, desde allí hay unas vistas al mar de ensueño.",special:"✦ Consejo secreto: ¡Pregunta por la azotea!"},
    {cuisine:"Chiringuito · Tapas · El Portet",tags:["Frente al Mar","Puesta de Sol"],desc:"Un chiringuito típicamente español en la pequeña cala de El Portet, especialmente bonito en temporada baja, cuando hay más tranquilidad. Al atardecer, con una copa de vino blanco y pan con alioli: puro sabor mediterráneo.",special:"✦ Consejo: Pan con alioli + vino blanco al atardecer"},
    {cuisine:"Alta Cocina · Francesa · Moraira",tags:["Vistas de Ensueño","Velada Especial"],desc:"Para una velada realmente especial: vistas de ensueño, un ambiente elegante y una cocina de alta calidad que enamora. Nuestro consejo para aniversarios, cumpleaños o simplemente cuando quieras darte un capricho.",special:"✦ Consejo: Reserva mesa para la hora dorada"}
  ],eink:[
    {cuisine:"Supermercado · Surtido Completo · Teulada",tags:["Productos Locales","Gran Aparcamiento"],desc:"Un supermercado español bien surtido en pleno Teulada, fuerte en productos locales de la Costa Blanca y con una buena selección de vinos. El supermercado de surtido completo más cercano a la villa.",special:"✦ Consejo: Buena selección de vinos locales y productos regionales"}
  ]},
  fr:{rest:[
    {cuisine:"Pizza · Pâtes · Moraira",tags:["Grandes Portions","Pizza à Emporter"],desc:"Parfait pour une soirée détendue sans chichis : une cuisine simple mais vraiment savoureuse, avec des portions généreuses. Les escalopes sont légendairement grandes et très appréciées. Idéal aussi pour une pizza à emporter après une longue journée à la plage."},
    {cuisine:"Traditionnel · Espagnol · Village de Montagne",tags:["Authentique","Sans Tourisme"],desc:"Si vous voulez découvrir l'Espagne authentique, loin des circuits touristiques, il faut absolument y aller. Ce petit restaurant familial en montagne sert quelques plats copieux à des prix très justes. Une expérience mémorable.",special:"✦ Conseil : Ferme vers 20 h – prévoyez tôt !"},
    {cuisine:"Moderne · Varié · Moraira",tags:["Notre Endroit Préféré","Déjeuner & Dîner"],desc:"L'un de nos endroits préférés à Moraira. Cadre moderne et une carte variée où chacun trouve son bonheur – déjeuner léger ou dîner détendu entre amis. La qualité est au rendez-vous, l'ambiance aussi."},
    {cuisine:"Café · Bar · Moraira",tags:["Petit-déjeuner","Vue Mer"],desc:"Un magnifique endroit pour le petit-déjeuner, avec un propriétaire chaleureux et parfois des événements très particuliers. Notre tuyau secret : demandez la terrasse sur le toit – la vue sur la mer y est sublime.",special:"✦ Tuyau secret : Demandez la terrasse sur le toit !"},
    {cuisine:"Bar de Plage · Tapas · El Portet",tags:["Bord de Plage","Coucher de Soleil"],desc:"Un bar de plage typiquement espagnol dans la petite crique d'El Portet – particulièrement charmant hors saison, quand c'est plus calme. Au coucher du soleil, avec un verre de vin blanc et du pan con aioli : pur bonheur méditerranéen.",special:"✦ Conseil : Pan con aioli + vin blanc au coucher du soleil"},
    {cuisine:"Gastronomie · Française · Moraira",tags:["Vue de Rêve","Soirée Spéciale"],desc:"Pour une soirée vraiment spéciale – une vue de rêve, une atmosphère élégante et une cuisine raffinée qui séduit. Notre conseil pour les anniversaires, les fêtes ou simplement pour se faire plaisir.",special:"✦ Conseil : Réservez une table pour l'heure dorée"}
  ],eink:[
    {cuisine:"Supermarché · Gamme Complète · Teulada",tags:["Produits Locaux","Grand Parking"],desc:"Un supermarché espagnol bien achalandé en plein Teulada – riche en produits locaux de la Costa Blanca et avec une belle sélection de vins. Le supermarché à gamme complète le plus proche de la villa.",special:"✦ Conseil : Belle sélection de vins locaux et de produits régionaux"}
  ]},
  nl:{rest:[
    {cuisine:"Pizza · Pasta · Moraira",tags:["Grote Porties","Pizza to Go"],desc:"Perfect voor een ontspannen avond zonder poespas – eenvoudige maar echt lekkere gerechten met royale porties. De schnitzels zijn legendarisch groot en erg geliefd. Ook ideaal voor pizza to go na een lange stranddag."},
    {cuisine:"Traditioneel · Spaans · Bergdorp",tags:["Authentiek","Geen Toerisme"],desc:"Wie het echte Spanje wil beleven, ver van alle toeristische routes, moet hier zeker heen. Dit kleine familierestaurant in de bergen serveert enkele maar hartige gerechten tegen zeer eerlijke prijzen. Een onvergetelijke ervaring.",special:"✦ Tip: Sluit al rond 20 uur – plan op tijd!"},
    {cuisine:"Modern · Veelzijdig · Moraira",tags:["Onze Favoriete Plek","Lunch & Avond"],desc:"Een van onze absolute favorieten in Moraira. Moderne sfeer en een veelzijdige kaart met voor ieder wat wils – of het nu een lichte lunch is of een ontspannen avond met vrienden. De kwaliteit klopt, de sfeer ook."},
    {cuisine:"Café · Bar · Moraira",tags:["Ontbijt","Zeezicht"],desc:"Een prachtige ontbijtplek met een hartelijke eigenaar en soms heel bijzondere evenementen. Onze geheime tip: vraag zeker naar het dakterras – vandaar heb je een schitterend uitzicht op zee.",special:"✦ Geheime tip: Vraag naar het dakterras!"},
    {cuisine:"Strandbar · Tapas · El Portet",tags:["Aan het Strand","Zonsondergang"],desc:"Een typisch Spaanse strandbar in de kleine baai van El Portet – vooral mooi in het laagseizoen, als het rustiger is. Bij zonsondergang met een glas witte wijn en pan con aioli: puur mediterraan gevoel.",special:"✦ Tip: Pan con aioli + witte wijn bij zonsondergang"},
    {cuisine:"Fine Dining · Frans · Moraira",tags:["Droomuitzicht","Bijzondere Avond"],desc:"Voor een echt bijzondere avond – een droomuitzicht, een elegante sfeer en een hoogwaardige keuken die betovert. Onze tip voor jubilea, verjaardagen of gewoon om jezelf te verwennen.",special:"✦ Tip: Reserveer een tafel voor het gouden uur"}
  ],eink:[
    {cuisine:"Supermarkt · Volledig Assortiment · Teulada",tags:["Lokale Producten","Grote Parkeerplaats"],desc:"Een goed gesorteerde Spaanse supermarkt midden in Teulada – sterk in lokale producten van de Costa Blanca en met een goede wijnselectie. De dichtstbijzijnde supermarkt met volledig assortiment bij de villa.",special:"✦ Tip: Goede selectie lokale wijnen en regionale producten"}
  ]},
  pl:{rest:[
    {cuisine:"Pizza · Makarony · Moraira",tags:["Duże Porcje","Pizza na Wynos"],desc:"Idealne miejsce na spokojny wieczór bez zbędnego zamieszania – prosta, ale naprawdę smaczna kuchnia i obfite porcje. Sznycle są legendarnie duże i bardzo lubiane. Świetne także na pizzę na wynos po długim dniu na plaży."},
    {cuisine:"Tradycyjna · Hiszpańska · Górska Wioska",tags:["Autentyczne","Bez Turystów"],desc:"Kto chce poznać prawdziwą Hiszpanię z dala od tras turystycznych, koniecznie powinien tu przyjechać. Ta mała, rodzinna restauracja w górach serwuje kilka, ale sycących dań w bardzo uczciwych cenach. Niezapomniane przeżycie.",special:"✦ Wskazówka: Zamyka się już około 20:00 – planuj wcześnie!"},
    {cuisine:"Nowoczesna · Różnorodna · Moraira",tags:["Nasze Ulubione Miejsce","Lunch i Kolacja"],desc:"Jedno z naszych absolutnie ulubionych miejsc w Moraira. Nowoczesne wnętrze i różnorodne menu, w którym każdy znajdzie coś dla siebie – czy to lekki lunch, czy spokojna kolacja ze znajomymi. Jakość na poziomie, atmosfera również."},
    {cuisine:"Kawiarnia · Bar · Moraira",tags:["Śniadanie","Widok na Morze"],desc:"Przepiękne miejsce na śniadanie, z serdecznym właścicielem i czasem wyjątkowymi wydarzeniami. Nasza tajna wskazówka: koniecznie zapytaj o taras na dachu – rozciąga się stamtąd bajeczny widok na morze.",special:"✦ Tajna wskazówka: Zapytaj o taras na dachu!"},
    {cuisine:"Bar na Plaży · Tapas · El Portet",tags:["Przy Plaży","Zachód Słońca"],desc:"Typowo hiszpański bar na plaży w małej zatoczce El Portet – szczególnie uroczy poza sezonem, gdy jest spokojniej. O zachodzie słońca z kieliszkiem białego wina i pan con aioli: czysty śródziemnomorski klimat.",special:"✦ Wskazówka: Pan con aioli + białe wino o zachodzie słońca"},
    {cuisine:"Wykwintna · Francuska · Moraira",tags:["Bajeczny Widok","Wyjątkowy Wieczór"],desc:"Na naprawdę wyjątkowy wieczór – bajeczny widok, elegancka atmosfera i wysokiej klasy kuchnia, która zachwyca. Nasza propozycja na rocznice, urodziny lub po prostu wtedy, gdy chcesz sprawić sobie przyjemność.",special:"✦ Wskazówka: Zarezerwuj stolik na złotą godzinę"}
  ],eink:[
    {cuisine:"Supermarket · Pełny Asortyment · Teulada",tags:["Produkty Lokalne","Duży Parking"],desc:"Dobrze zaopatrzony hiszpański supermarket w samej Teuladzie – mocny w lokalne produkty z Costa Blanca i z dobrym wyborem win. Najbliższy pełnoasortymentowy supermarket przy willi.",special:"✦ Wskazówka: Dobry wybór lokalnych win i produktów regionalnych"}
  ]},
  ru:{rest:[
    {cuisine:"Пицца · Паста · Морайра",tags:["Большие порции","Пицца на вынос"],desc:"Идеально для спокойного вечера без лишней суеты — простая, но по-настоящему вкусная кухня и щедрые порции. Шницели легендарно большие и очень популярны. Отлично подойдёт и для пиццы на вынос после долгого дня на пляже."},
    {cuisine:"Традиционная · Испанская · Горная деревня",tags:["Аутентично","Без туристов"],desc:"Если хотите почувствовать настоящую Испанию вдали от туристических маршрутов, сюда стоит съездить обязательно. Этот маленький семейный ресторан в горах подаёт несколько, но сытных блюд по очень честным ценам. Впечатление, которое остаётся надолго.",special:"✦ Совет: Закрывается уже около 20:00 — планируйте заранее!"},
    {cuisine:"Современная · Разнообразная · Морайра",tags:["Наше любимое место","Обед и ужин"],desc:"Одно из наших самых любимых мест в Морайре. Современная атмосфера и разнообразное меню, где каждый найдёт что-то своё — будь то лёгкий обед или спокойный ужин с друзьями. Качество на высоте, атмосфера тоже."},
    {cuisine:"Кафе · Бар · Морайра",tags:["Завтрак","Вид на море"],desc:"Прекрасное место для завтрака с радушным хозяином и иногда совершенно особенными мероприятиями. Наш секрет: обязательно спросите про крышу-террасу — оттуда открывается сказочный вид на море.",special:"✦ Секрет: Спросите про крышу-террасу!"},
    {cuisine:"Пляжный бар · Тапас · Эль-Портет",tags:["У самого пляжа","Закат"],desc:"Типично испанский пляжный бар прямо в маленькой бухте Эль-Портет — особенно хорош в межсезонье, когда спокойнее. На закате с бокалом белого вина и pan con aioli: чистое средиземноморское настроение.",special:"✦ Совет: Pan con aioli + белое вино на закате"},
    {cuisine:"Высокая кухня · Французская · Морайра",tags:["Сказочный вид","Особенный вечер"],desc:"Для по-настоящему особенного вечера — сказочный вид, элегантная атмосфера и кухня высокого уровня, которая восхищает. Наш совет для годовщин, дней рождения или просто когда хочется себя порадовать.",special:"✦ Совет: Забронируйте столик к золотому часу"}
  ],eink:[
    {cuisine:"Супермаркет · Полный ассортимент · Теулада",tags:["Местные продукты","Большая парковка"],desc:"Хорошо укомплектованный испанский супермаркет прямо в Теуладе — силён местными продуктами Коста-Бланки и хорошим выбором вин. Ближайший супермаркет с полным ассортиментом рядом с виллой.",special:"✦ Совет: Хороший выбор местных вин и региональных продуктов"}
  ]}
};
for (var _tl in tileExtra) {
  if (!tileTranslations[_tl]) continue;
  for (var _tc in tileExtra[_tl]) {
    tileTranslations[_tl][_tc] = (tileTranslations[_tl][_tc] || []).concat(tileExtra[_tl][_tc]);
  }
}

// ── Übersetzbare Labels der Empfehlungs-Kacheln ──
var tileLabels = {
  de:{tip:'★ Tipp',rev:'Bew.',min:'Min.',maps:'Karte'},
  en:{tip:'★ Tip',rev:'rev.',min:'min',maps:'Maps'},
  es:{tip:'★ Consejo',rev:'reseñas',min:'min',maps:'Mapa'},
  fr:{tip:'★ Conseil',rev:'avis',min:'min',maps:'Carte'},
  nl:{tip:'★ Tip',rev:'beoord.',min:'min',maps:'Kaart'},
  pl:{tip:'★ Wskazówka',rev:'opinii',min:'min',maps:'Mapa'},
  ru:{tip:'★ Совет',rev:'отз.',min:'мин',maps:'Карта'}
};

// Ersatztabelle für Tags/Specials, die die indexbasierten Übersetzungen nicht abdecken
var tileWord = {
  "Cocktails":{en:"Cocktails",es:"Cócteles",fr:"Cocktails",nl:"Cocktails",pl:"Koktajle",ru:"Коктейли"},
  "Pizza to Go":{en:"Pizza to Go",es:"Pizza para llevar",fr:"Pizza à emporter",nl:"Pizza to go",pl:"Pizza na wynos",ru:"Пицца на вынос"},
  "Sunrise Tour":{en:"Sunrise Tour",es:"Tour al amanecer",fr:"Tour au lever du soleil",nl:"Sunrise-tour",pl:"Wycieczka o wschodzie",ru:"Тур на рассвете"},
  "Kombi mit Aqualandia":{en:"Combo with Aqualandia",es:"Combo con Aqualandia",fr:"Combo avec Aqualandia",nl:"Combi met Aqualandia",pl:"Combo z Aqualandia",ru:"Комбо с Aqualandia"},
  "Flora & Fauna":{en:"Flora & Fauna",es:"Flora y fauna",fr:"Flore & faune",nl:"Flora & fauna",pl:"Flora i fauna",ru:"Флора и фауна"},
  "Versteckte Bucht":{en:"Hidden Cove",es:"Cala escondida",fr:"Crique cachée",nl:"Verborgen baai",pl:"Ukryta zatoczka",ru:"Скрытая бухта"},
  "Glasklares Wasser":{en:"Crystal-clear Water",es:"Agua cristalina",fr:"Eau cristalline",nl:"Kristalhelder water",pl:"Krystaliczna woda",ru:"Кристально чистая вода"},
  "Familienfreundlich":{en:"Family-friendly",es:"Ideal para familias",fr:"Familial",nl:"Gezinsvriendelijk",pl:"Przyjazne rodzinom",ru:"Для семей"},
  "SUP & Kayak":{en:"SUP & Kayak",es:"SUP y kayak",fr:"SUP & kayak",nl:"SUP & kajak",pl:"SUP i kajak",ru:"SUP и каяк"},
  "Beste Lage Morairas":{en:"Moraira's Best Spot",es:"La mejor ubicación de Moraira",fr:"Le meilleur emplacement de Moraira",nl:"Beste ligging van Moraira",pl:"Najlepsza lokalizacja Moraira",ru:"Лучшее место Морайры"},
  "Kombinierbar":{en:"Combinable",es:"Combinable",fr:"Combinable",nl:"Combineerbaar",pl:"Do połączenia",ru:"Можно совместить"},
  "Geheimtipp":{en:"Insider Tip",es:"Consejo secreto",fr:"Bon plan secret",nl:"Geheime tip",pl:"Tajna wskazówka",ru:"Секретный совет"},
  "Nah an der Villa":{en:"Close to the Villa",es:"Cerca de la villa",fr:"Proche de la villa",nl:"Dicht bij de villa",pl:"Blisko willi",ru:"Рядом с виллой"},
  "Vollsortiment":{en:"Full Range",es:"Surtido completo",fr:"Gamme complète",nl:"Volledig assortiment",pl:"Pełny asortyment",ru:"Полный ассортимент"},
  "Bergdorf in der Umgebung · ca. 30 Min.":{en:"Mountain village nearby · approx. 30 min",es:"Pueblo de montaña cercano · aprox. 30 min",fr:"Village de montagne à proximité · env. 30 min",nl:"Bergdorp in de buurt · ca. 30 min",pl:"Górska wioska w okolicy · ok. 30 min",ru:"Горная деревня рядом · ок. 30 мин"},
  "✦ Tipp: Tisch zur Abendstunde reservieren – der Ausblick ist unvergesslich":{en:"✦ Tip: Reserve a table for the evening – the view is unforgettable",es:"✦ Consejo: Reserva mesa al atardecer: las vistas son inolvidables",fr:"✦ Conseil : Réservez une table en soirée – la vue est inoubliable",nl:"✦ Tip: Reserveer een tafel in de avond – het uitzicht is onvergetelijk",pl:"✦ Wskazówka: Zarezerwuj stolik wieczorem – widok jest niezapomniany",ru:"✦ Совет: Забронируйте столик на вечер — вид незабываемый"},
  "✦ Tipp: Außenplätze begrenzt – unbedingt reservieren!":{en:"✦ Tip: Outdoor seating is limited – be sure to reserve!",es:"✦ Consejo: Las mesas exteriores son limitadas: ¡reserva sin falta!",fr:"✦ Conseil : Places en terrasse limitées – réservez impérativement !",nl:"✦ Tip: Buitenplaatsen beperkt – zeker reserveren!",pl:"✦ Wskazówka: Miejsca na zewnątrz ograniczone – koniecznie rezerwuj!",ru:"✦ Совет: Мест на улице мало — обязательно бронируйте!"},
  "✦ Tipp: Schnorcheln bei den Felsen – unglaubliche Unterwasserwelt":{en:"✦ Tip: Snorkel by the rocks – an incredible underwater world",es:"✦ Consejo: Bucea con tubo junto a las rocas: un mundo submarino increíble",fr:"✦ Conseil : Faites du snorkeling près des rochers – un monde sous-marin incroyable",nl:"✦ Tip: Snorkelen bij de rotsen – een ongelooflijke onderwaterwereld",pl:"✦ Wskazówka: Snorkeling przy skałach – niesamowity podwodny świat",ru:"✦ Совет: Снорклинг у скал — невероятный подводный мир"}
};

function rebuildGridForLang(lang) {
  var t = tileTranslations[lang] || tileTranslations['de'];
  var lab = tileLabels[lang] || tileLabels.de;
  var grid = document.getElementById('empf-grid');
  if (!grid) return;
  var cards = grid.querySelectorAll('.tile-card');
  var restCards = [], aktCards = [], sehCards = [], einkCards = [];
  cards.forEach(function(c) {
    var cat = c.getAttribute('data-empf');
    if (cat === 'restaurants') restCards.push(c);
    else if (cat === 'aktivitaeten') aktCards.push(c);
    else if (cat === 'straende') sehCards.push(c);
    else if (cat === 'einkaufen') einkCards.push(c);
  });
  function updateCards(cardList, translations) {
    cardList.forEach(function(card, i) {
      var tr = translations[i];
      // Labels (unabhängig von den Übersetzungsdaten)
      var dist = card.querySelector('.tile-dist');
      if (dist) { var raw = dist.getAttribute('data-distraw') || dist.textContent; dist.textContent = raw.replace('Min.', lab.min); }
      var cnt = card.querySelector('.tile-stars-count');
      if (cnt) { var rev = cnt.getAttribute('data-rev') || ''; cnt.textContent = '(' + rev + ' ' + lab.rev + ')'; }
      var mp = card.querySelector('.tile-maps');
      if (mp) mp.textContent = '📍 ' + lab.maps;
      function tr_word(o){ return (lang!=='de' && tileWord[o] && tileWord[o][lang]) ? tileWord[o][lang] : o; }
      // Badge
      var badge = card.querySelector('.tile-badge');
      if (badge && badge.classList.contains('gold')) badge.textContent = lab.tip;
      else if (badge) {
        var bo = badge.getAttribute('data-orig') || badge.textContent;
        badge.textContent = (tr && tr.tags && tr.tags[0] !== undefined) ? tr.tags[0] : tr_word(bo);
      }
      // Küche & Beschreibung (1:1 pro Karte)
      if (tr && tr.cuisine) { var cuisine = card.querySelector('.tile-cuisine'); if (cuisine) cuisine.textContent = tr.cuisine; }
      if (tr && tr.desc) { var desc = card.querySelector('.tile-desc'); if (desc) desc.textContent = tr.desc; }
      // Tags – immer aus data-orig ableiten (idempotent bei Sprachwechsel)
      card.querySelectorAll('.tile-tag').forEach(function(tag, j) {
        var o = tag.getAttribute('data-orig'); if (o === null) { o = tag.textContent; tag.setAttribute('data-orig', o); }
        tag.textContent = (tr && tr.tags && tr.tags[j] !== undefined) ? tr.tags[j] : tr_word(o);
      });
      // Special – aus data-orig
      var special = card.querySelector('.tile-special');
      if (special) {
        var so = special.getAttribute('data-orig') || special.textContent;
        special.textContent = (tr && tr.special) ? tr.special : tr_word(so);
      }
      // Adresse – nur übersetzen, wenn im Wörterbuch (echte Adressen bleiben unverändert)
      var addr = card.querySelector('.tile-addr');
      if (addr) { var ao = addr.getAttribute('data-orig'); if (ao === null) { ao = addr.textContent; addr.setAttribute('data-orig', ao); } addr.textContent = tr_word(ao); }
    });
  }
  updateCards(restCards, t.rest || []);
  updateCards(aktCards, t.akt || []);
  updateCards(sehCards, t.seh || []);
  updateCards(einkCards, t.eink || []);
}

function filterEmpf(cat, btn) {
  btn.closest('.listing-filter').querySelectorAll('.rf-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  document.querySelectorAll('#empf-grid .tile-card').forEach(function(c){
    c.style.display = (cat==='all' || c.getAttribute('data-empf')===cat) ? 'flex' : 'none';
  });
}

// Filter helpers
function filterGrid(gridId, attr, cat) {
  document.querySelectorAll('#'+gridId+' .rest-card').forEach(function(c){
    var cats = c.getAttribute(attr)||'';
    c.style.display = (cat==='all'||cats.includes(cat)) ? 'flex' : 'none';
  });
}
function setFilterBtn(btn) {
  btn.closest('.listing-filter').querySelectorAll('.rf-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
}
function filterRest(cat,btn){setFilterBtn(btn);filterGrid('rest-grid','data-cat',cat);}
function filterAkt(cat,btn){setFilterBtn(btn);filterGrid('akt-grid','data-akat',cat);}
function filterSeh(cat,btn){setFilterBtn(btn);filterGrid('seh-grid','data-scat',cat);}
function filterEink(cat,btn){setFilterBtn(btn);filterGrid('eink-grid','data-ekat',cat);}

// ═══════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════
var calState = {offset:0, selStart:null, selEnd:null};
var bookedRanges = [{from:'2025-07-01',to:'2025-07-14'},{from:'2025-07-20',to:'2025-07-31'}];
var calMonths = {
  de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December'],
  es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  nl:['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
  pl:['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  ru:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
};
var calDow = {
  de:['Mo','Di','Mi','Do','Fr','Sa','So'],
  en:['Mo','Tu','We','Th','Fr','Sa','Su'],
  es:['Lu','Ma','Mi','Ju','Vi','Sa','Do'],
  fr:['Lu','Ma','Me','Je','Ve','Sa','Di'],
  nl:['Ma','Di','Wo','Do','Vr','Za','Zo'],
  pl:['Pn','Wt','Śr','Cz','Pt','So','Nd'],
  ru:['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
};
var months_de = calMonths[currentLang] || calMonths['de'];
var dow_de = calDow[currentLang] || calDow['de'];

async function loadBlockedDates() {
  try {
    var res = await fetch('/api/blocked-dates');
    var data = await res.json();
    if (data && data.length) { bookedRanges = data.map(function(d){return{from:d.date_from.substring(0,10),to:d.date_to.substring(0,10)};}); renderCalendar(); }
  } catch(e){}
}

function isBooked(date){var d=date.getTime();for(var i=0;i<bookedRanges.length;i++){var f=new Date(bookedRanges[i].from).getTime(),t=new Date(bookedRanges[i].to).getTime();if(d>=f&&d<=t)return true;}return false;}
function isRangeBlocked(s,e){var d=new Date(s);while(d<=e){if(isBooked(d))return true;d.setDate(d.getDate()+1);}return false;}
function fmtDate(d){if(!d)return'–';var m=calMonths[currentLang]||calMonths['de'];return d.getDate()+'. '+m[d.getMonth()]+' '+d.getFullYear();}
function fmtISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function getRate(date){var m=date.getMonth();if(m===6||m===7)return 980;if(m===4||m===5||m===8||m===9)return 620;return 380;}

function renderCalendar(){
  months_de = calMonths[currentLang] || calMonths['de'];
  dow_de = calDow[currentLang] || calDow['de'];
  var today=new Date();today.setHours(0,0,0,0);
  var grids=document.getElementById('cal-grids');
  var monthsEl=document.getElementById('cal-months');
  if(!grids||!monthsEl)return;
  grids.innerHTML='';monthsEl.innerHTML='';
  for(var m=0;m<2;m++){
    var base=new Date(today.getFullYear(),today.getMonth()+calState.offset+m,1);
    var year=base.getFullYear(),month=base.getMonth();
    var lbl=document.createElement('div');lbl.className='cal-month-label';lbl.textContent=months_de[month]+' '+year;monthsEl.appendChild(lbl);
    var grid=document.createElement('div');grid.className='cal-grid';
    var dow=document.createElement('div');dow.className='cal-dow';
    dow_de.forEach(function(d){var s=document.createElement('span');s.textContent=d;dow.appendChild(s);});
    grid.appendChild(dow);
    var days=document.createElement('div');days.className='cal-days';
    var firstDow=(new Date(year,month,1).getDay()+6)%7;
    for(var e=0;e<firstDow;e++){var em=document.createElement('div');em.className='cal-day empty';days.appendChild(em);}
    var daysInMonth=new Date(year,month+1,0).getDate();
    for(var day=1;day<=daysInMonth;day++){
      var date=new Date(year,month,day);date.setHours(0,0,0,0);
      var cell=document.createElement('div');cell.className='cal-day';cell.textContent=day;
      if(date.getTime()===today.getTime())cell.classList.add('today');
      if(date<today){cell.classList.add('past');}
      else if(isBooked(date)){cell.classList.add('booked');cell.title='Belegt';}
      else{
        var s=calState.selStart,en=calState.selEnd;
        if(s&&date.getTime()===s.getTime())cell.classList.add('selected-start');
        if(en&&date.getTime()===en.getTime())cell.classList.add('selected-end');
        if(s&&en&&date>s&&date<en)cell.classList.add('in-range');
        (function(d){cell.addEventListener('click',function(){
          if(!calState.selStart||(calState.selStart&&calState.selEnd)){calState.selStart=d;calState.selEnd=null;}
          else{if(d<=calState.selStart){calState.selStart=d;calState.selEnd=null;return;}if(isRangeBlocked(calState.selStart,d)){alert('Dieser Zeitraum enthält bereits gebuchte Tage.');return;}calState.selEnd=d;}
          renderCalendar();updateCalSelection();calcCalPrice();
        });})(date);
      }
      days.appendChild(cell);
    }
    grid.appendChild(days);grids.appendChild(grid);
  }
}

function updateCalSelection(){
  var f=document.getElementById('cal-from'),t=document.getElementById('cal-to'),n=document.getElementById('cal-nights');
  if(!f)return;
  f.textContent=calState.selStart?fmtDate(calState.selStart):'–';
  t.textContent=calState.selEnd?fmtDate(calState.selEnd):'–';
  if(calState.selStart&&calState.selEnd){var nights=Math.round((calState.selEnd-calState.selStart)/86400000);n.textContent=nights+' Nächte';n.style.display='block';}
  else{n.textContent='';n.style.display='none';}
}

function calcCalPrice(){
  if(!calState.selStart||!calState.selEnd){['pn','pr','pt'].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent='– –';});return;}
  var nights=Math.round((calState.selEnd-calState.selStart)/86400000),total=0;
  var d=new Date(calState.selStart);
  for(var i=0;i<nights;i++){total+=getRate(d);d.setDate(d.getDate()+1);}
  var grand=total+250;
  var pn=document.getElementById('pn'),pr=document.getElementById('pr'),pt=document.getElementById('pt');
  if(pn)pn.textContent=nights+' Nächte';
  if(pr)pr.textContent='€ '+total.toLocaleString('de-DE');
  if(pt){pt.textContent='€ '+grand.toLocaleString('de-DE');pt.classList.remove('bump');void pt.offsetWidth;pt.classList.add('bump');}
}

function calPrev(){if(calState.offset>0){calState.offset--;renderCalendar();}}
function calNext(){if(calState.offset<18){calState.offset++;renderCalendar();}}

// ═══════════════════════════════════════
// BOOKING
// ═══════════════════════════════════════
function quickCheck(){
  showTab('buchen');
  if(!window._calInit){renderCalendar();window._calInit=true;}

  // ── Daten aus der Hero-Leiste übernehmen ──
  var qi=document.getElementById('qi');
  var qo=document.getElementById('qo');
  var qg=document.getElementById('qg');

  // Datum-String (YYYY-MM-DD) → lokales Date-Objekt (kein UTC-Versatz)
  function parseLD(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}

  var from = qi&&qi.value ? parseLD(qi.value) : null;
  var to   = qo&&qo.value ? parseLD(qo.value) : null;

  if(from && !isBooked(from)){
    calState.selStart = from;
    // Kalender-Ansicht auf den Anreisemonat springen
    var today=new Date();
    var off=(from.getFullYear()-today.getFullYear())*12+(from.getMonth()-today.getMonth());
    calState.offset = Math.max(0, off);
  }
  if(to && from && to>from && !isRangeBlocked(from,to)){
    calState.selEnd = to;
  }

  // Gäste-Auswahl synchronisieren
  var fg=document.getElementById('fg-guests');
  if(qg&&fg) fg.selectedIndex = qg.selectedIndex;

  renderCalendar();
  updateCalSelection();
  calcCalPrice();

  // Sanft zum Buchungsformular scrollen
  var bf=document.querySelector('.book-form');
  if(bf) setTimeout(function(){bf.scrollIntoView({behavior:'smooth',block:'start'});},160);
}

async function sendBooking(){
  if(!calState.selStart||!calState.selEnd){alert('Bitte wählen Sie zuerst Ihren Anreise- und Abreisetermin.');return;}
  var email=document.getElementById('b-email')?document.getElementById('b-email').value:'';
  if(!email){alert('Bitte E-Mail-Adresse eingeben.');return;}
  try{await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({firstname:document.getElementById('b-fname').value,lastname:document.getElementById('b-lname').value,email:email,phone:document.getElementById('b-phone').value,guests:document.getElementById('fg-guests').value,checkin:fmtISO(calState.selStart),checkout:fmtISO(calState.selEnd),message:document.getElementById('b-msg').value})});}catch(e){}
  document.getElementById('mic').textContent='✅';
  document.getElementById('mtitle').textContent='Anfrage gesendet!';
  document.getElementById('mtext').textContent='Vielen Dank! Sophie & Lisa melden sich persönlich innerhalb von 24 Stunden. Anreise: '+fmtDate(calState.selStart)+' · Abreise: '+fmtDate(calState.selEnd);
  document.getElementById('modal').classList.add('open');
}

function sendContact(){document.getElementById('mic').textContent='✉️';document.getElementById('mtitle').textContent='Nachricht erhalten!';document.getElementById('mtext').textContent='Herzlichen Dank. Familie Wunsch meldet sich innerhalb von 24 Stunden persönlich bei Ihnen.';document.getElementById('modal').classList.add('open');}
function closeModal(e){if(!e||e.target===document.getElementById('modal')||!e.target)document.getElementById('modal').classList.remove('open');}

// ═══════════════════════════════════════
// GUESTBOOK
// ═══════════════════════════════════════
var currentRating=5;
function setRating(val){currentRating=val;document.querySelectorAll('.star').forEach(function(s){s.classList.toggle('active',parseInt(s.getAttribute('data-val'))<=val);});}

async function loadReviews(){
  try{
    var res=await fetch('/api/reviews');var reviews=await res.json();
    function renderRevs(containerId,max){
      var c=document.getElementById(containerId);if(!c)return;
      var show=max?reviews.slice(0,max):reviews;
      if(!show.length){c.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--ink3);font-size:.84rem">'+(TX[currentLang]||TX.de).no_reviews+'\u003c/div>';return;}
      c.innerHTML=show.map(function(r){
        var initials=r.name.split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
        var stars='★'.repeat(r.rating)+'☆'.repeat(5-r.rating);
        return '<div class="rev"><div class="rev-stars">'+stars+'\u003c/div><p class="rev-txt">„'+r.text+'"\u003c/p><div class="rev-auth"><div class="rev-av">'+initials+'\u003c/div><div><div class="rev-name">'+r.name+'\u003c/div><div class="rev-date">'+(r.date||'')+(r.country?' · '+r.country:'')+'\u003c/div>\u003c/div><div class="rev-score">⭐ '+r.rating+',0\u003c/div>\u003c/div>\u003c/div>';
      }).join('');
    }
    renderRevs('reviews-container-start',3);
    renderRevs('reviews-container-lage',0);
  }catch(e){
    var c1=document.getElementById('reviews-container-start'),c2=document.getElementById('reviews-container-lage');
    var msg='<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--ink3);font-size:.84rem">'+(TX[currentLang]||TX.de).no_reviews+'\u003c/div>';
    if(c1)c1.innerHTML=msg;if(c2)c2.innerHTML=msg;
  }
}

async function submitReview(){
  var name=document.getElementById('rv-name').value.trim();
  var text=document.getElementById('rv-text').value.trim();
  if(!name||!text){alert('Bitte Name und Bewertungstext ausfüllen.');return;}
  var country=document.getElementById('rv-country').value.trim();
  var date=new Date().toLocaleDateString('de-DE',{month:'long',year:'numeric'});
  try{
    var res=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,country,date,rating:currentRating,text})});
    var data=await res.json();
    if(data.success){document.getElementById('review-form-body').style.display='none';document.getElementById('review-success').style.display='block';}
    else{alert('Fehler: '+(data.error||'Unbekannter Fehler'));}
  }catch(e){alert('Verbindungsfehler.');}
}

// ═══════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════
var lbImgs=[
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=85',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
];
function openLb(i){document.getElementById('lb').classList.add('open');document.getElementById('lb-img').src=lbImgs[i];}
function closeLb(){document.getElementById('lb').classList.remove('open');}

// ═══════════════════════════════════════
// HERO CINEMATIC SCROLL REVEAL
// ═══════════════════════════════════════
// Hero: Titel & Text erscheinen jetzt beim Laden (CSS-Intro). Beim Scrollen
// blendet nur der Scroll-Hinweis dezent aus.
(function(){
  var scrollHint = document.querySelector('.hero-scroll-hint');
  var heroWrap   = document.querySelector('.hero-wrap');
  if(!scrollHint || !heroWrap) return;
  window.addEventListener('scroll', function(){
    var s = window.scrollY, wH = heroWrap.offsetHeight;
    if(s > 1) scrollHint.style.opacity = Math.max(0, 1 - s/(wH*0.15));
  }, {passive:true});
})();

// ═══════════════════════════════════════
// FAKTEN-LEISTE: Zahlen zählen hoch, sobald sichtbar
// ═══════════════════════════════════════
(function(){
  var bar = document.querySelector('.facts-bar');
  if(!bar) return;
  var done = false;
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
  function run(){
    if(done) return; done = true;
    bar.querySelectorAll('.facts-num').forEach(function(el){
      var small = el.querySelector('small');
      var raw = small ? (el.childNodes[0] ? el.childNodes[0].nodeValue : '') : el.textContent;
      var target = parseInt((raw||'').replace(/\D/g,''), 10);
      if(isNaN(target)) return;
      var suffix = small ? small.outerHTML : '';
      var dur = 1300, t0 = null;
      function step(ts){
        if(t0===null) t0 = ts;
        var p = Math.min((ts - t0)/dur, 1);
        el.innerHTML = Math.round(target*ease(p)) + suffix;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) run(); });
    }, {threshold:.45});
    io.observe(bar);
  } else { run(); }
})();

// ═══════════════════════════════════════
// LIVE-CHIP: Uhrzeit, Temperatur & Sonnenuntergang in Benissa
// ═══════════════════════════════════════
(function(){
  var el = document.getElementById('navLive');
  if(!el) return;
  var LAT = 38.7155, LON = 0.0517, TZ = 'Europe/Madrid';
  var temp = null;
  function fmt(d){
    try { return new Intl.DateTimeFormat('de-DE',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}).format(d); }
    catch(e){ return d.getHours()+':'+('0'+d.getMinutes()).slice(-2); }
  }
  // Sonnenuntergang (astronomische Näherung, NOAA)
  function sunset(){
    var now = new Date();
    var y = now.getUTCFullYear(), mo = now.getUTCMonth()+1, da = now.getUTCDate();
    var N = Math.floor(275*mo/9) - Math.floor((mo+9)/12)*(1+Math.floor((y-4*Math.floor(y/4)+2)/3)) + da - 30;
    var rad = Math.PI/180;
    var lngHour = LON/15;
    var t = N + ((18 - lngHour)/24);
    var M = (0.9856*t) - 3.289;
    var L = M + (1.916*Math.sin(M*rad)) + (0.020*Math.sin(2*M*rad)) + 282.634; L = (L+360)%360;
    var RA = Math.atan(0.91764*Math.tan(L*rad))/rad; RA = (RA+360)%360;
    RA = RA + (Math.floor(L/90)*90 - Math.floor(RA/90)*90); RA = RA/15;
    var sinDec = 0.39782*Math.sin(L*rad);
    var cosDec = Math.cos(Math.asin(sinDec));
    var cosH = (Math.cos(90.833*rad) - (sinDec*Math.sin(LAT*rad))) / (cosDec*Math.cos(LAT*rad));
    if(cosH > 1 || cosH < -1) return null;
    var H = (Math.acos(cosH)/rad)/15;
    var T = H + RA - (0.06571*t) - 6.622;
    var UT = ((T - lngHour) % 24 + 24) % 24;
    var hh = Math.floor(UT), mm = Math.round((UT-hh)*60);
    if(mm===60){hh++;mm=0;}
    return new Date(Date.UTC(y, mo-1, da, hh, mm, 0));
  }
  function render(){
    var parts = ['📍 Benissa', '🕐 ' + fmt(new Date())];
    if(temp !== null) parts.push('🌡 ' + temp + '°C');
    var ss = sunset(); if(ss) parts.push('🌅 ' + fmt(ss));
    el.textContent = parts.join('   ·   ');
  }
  render();
  setInterval(render, 30000);
  // Temperatur vom Browser des Besuchers holen (kostenlos, ohne Schlüssel; fällt still weg)
  try {
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+LAT+'&longitude='+LON+'&current=temperature_2m')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ if(j && j.current && typeof j.current.temperature_2m === 'number'){ temp = Math.round(j.current.temperature_2m); render(); } })
      .catch(function(){});
  } catch(e){}
})();

// ═══════════════════════════════════════
// 3D VIEWER
// ═══════════════════════════════════════
function init3D(){
  var cv=document.getElementById('c3d');
  if(!cv||!window.THREE)return;
  var rend=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  rend.shadowMap.enabled=true;
  rend.setClearColor(0x7EAEC8);
  var sc=new THREE.Scene();
  sc.fog=new THREE.Fog(0x7EAEC8,55,110);
  var cam=new THREE.PerspectiveCamera(45,1,0.1,200);
  function rsz(){var w=cv.clientWidth,h=cv.clientHeight;rend.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  rsz();new ResizeObserver(rsz).observe(cv);
  sc.add(new THREE.AmbientLight(0xddeeff,.9));
  var sun=new THREE.DirectionalLight(0xfffaf0,1.7);sun.position.set(20,30,15);sun.castShadow=true;sc.add(sun);
  function M(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r||0.8});}
  var mW=M(0xF0EBE0),mF=M(0xD8CCAA),mR=M(0xDDD4C0),mG=new THREE.MeshStandardMaterial({color:0x88BBDD,transparent:true,opacity:.5,roughness:.1}),mGr=M(0x5A9040),mD=M(0x7A5E3A),mP=new THREE.MeshStandardMaterial({color:0x1AAAD4,transparent:true,opacity:.88,roughness:.04}),mSt=M(0x9A8E7E),mWd=M(0x9A6830),mBd=M(0xEEE8E0),mBH=M(0x806040),mWh=M(0xF8F8F8,.85),mGn=M(0x3A7828),mPv=M(0xB0A898),mSl=new THREE.MeshStandardMaterial({color:0x1A2A3C,roughness:.15,metalness:.4});
  var g={all:[],eg:[],og:[],roof:[],env:[]};
  function bx(w,h,d,m,x,y,z){var mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
  function ad(mesh){var gs=Array.from(arguments).slice(1);sc.add(mesh);gs.forEach(function(k){g[k].push(mesh);});return mesh;}
  ad(bx(50,.5,38,mD,0,-.75,0),'all','env');ad(bx(50,.1,38,mGr,0,-.45,0),'all','env');
  ad(bx(8,.4,5,mSt,-9,.2,0),'all','env','roof');ad(bx(7,.2,4,mP,-9,.45,0),'all','env','roof');
  [[-14,0,-7],[-15,0,4],[14,0,-8],[13,0,6]].forEach(function(p){
    ad(bx(.35,1.8,.35,mWd,p[0],.9,p[2]),'all','env');
    var cr=new THREE.Mesh(new THREE.SphereGeometry(1.3,7,6),mGn);cr.position.set(p[0],2.9,p[2]);cr.castShadow=true;sc.add(cr);g.all.push(cr);g.env.push(cr);
  });
  var EY=.3;
  ad(bx(14,.28,9,mF,0,EY+.14,0),'all','eg');ad(bx(14,3.2,.3,mW,0,EY+1.9,-4.5),'all','eg');ad(bx(14,3.2,.3,mW,0,EY+1.9,4.5),'all','eg');ad(bx(.3,3.2,9,mW,-7,EY+1.9,0),'all','eg');ad(bx(.3,3.2,9,mW,7,EY+1.9,0),'all','eg');ad(bx(14,.25,9,mF,0,EY+3.5,0),'all','eg');
  ad(bx(4.5,2.2,.15,mG,0,EY+2,-4.5),'all','eg');ad(bx(3.5,2.3,.15,mG,2,EY+2,4.5),'all','eg');
  ad(bx(3.8,.72,1.1,mSl,-1.5,EY+.64,1.5),'all','eg');ad(bx(2.5,1.5,.4,mBH,-1.5,EY+1.03,-4.2),'all','eg');
  var OY=3.78;
  ad(bx(14,.25,9,mF,0,OY+.12,0),'all','og');ad(bx(14,3,.3,mW,0,OY+1.8,-4.5),'all','og');ad(bx(14,3,.3,mW,0,OY+1.8,4.5),'all','og');ad(bx(.3,3,9,mW,-7,OY+1.8,0),'all','og');ad(bx(.3,3,9,mW,7,OY+1.8,0),'all','og');ad(bx(14,.25,9,mR,0,OY+3.1,0),'all','og');
  ad(bx(2.8,2,.15,mG,-5,OY+2.1,-4.5),'all','og');ad(bx(4,2.2,.15,mG,-.5,OY+2.1,4.5),'all','og');
  function bed(x,z){var by=OY+.5;ad(bx(1.6,.38,2.1,mBd,x,by+.19,z),'all','og');ad(bx(1.6,.55,.2,mBH,x,by+.55,z-1.05),'all','og');ad(bx(1.5,.16,1.9,mWh,x,by+.46,z),'all','og');}
  bed(-5.5,-1.5);bed(-1.8,-1.5);bed(1.8,2);bed(5.5,0);
  var RY=7.15;
  ad(bx(14,.25,9,mR,0,RY+.12,0),'all','roof');ad(bx(14,.9,.28,mW,0,RY+.55,-4.5),'all','roof');ad(bx(14,.9,.28,mW,0,RY+.55,4.5),'all','roof');ad(bx(.28,.9,9,mW,-7,RY+.55,0),'all','roof');ad(bx(.28,.9,9,mW,7,RY+.55,0),'all','roof');
  ad(bx(4.5,2.4,3.5,mW,1.5,RY+1.4,0),'all','roof');ad(bx(2.8,.08,1.5,mSl,-3.5,RY+.22,-1),'all','roof');ad(bx(2.8,.08,1.5,mSl,-3.5,RY+.22,1.8),'all','roof');
  var theta=.7,phi=.52,radius=42,lx=0,ly=0,isDrag=false,mx=0,my=0;
  var ft=[{r:42,ly:3,ph:.52},{r:30,ly:2,ph:.45},{r:30,ly:6,ph:.42},{r:28,ly:8,ph:.38}];
  window.setFloor=function(f,btn){
    document.querySelectorAll('.vbtn').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');
    var t=ft[f];radius=t.r;ly=t.ly;phi=t.ph;
    var show={0:['all','env','eg','og','roof'],1:['all','env','eg'],2:['all','env','og'],3:['all','env','roof']}[f];
    sc.children.forEach(function(m){if(m.isMesh)m.visible=false;});
    var seen=[];show.forEach(function(k){g[k].forEach(function(m){seen.push(m);});});
    seen.forEach(function(m){m.visible=true;});
  };
  setFloor(0,document.querySelector('.vbtn.on'));
  cv.addEventListener('mousedown',function(e){isDrag=true;mx=e.clientX;my=e.clientY;});
  window.addEventListener('mouseup',function(){isDrag=false;});
  cv.addEventListener('mousemove',function(e){if(!isDrag)return;theta-=(e.clientX-mx)*.007;phi=Math.max(.1,Math.min(1.4,phi+(e.clientY-my)*.006));mx=e.clientX;my=e.clientY;});
  cv.addEventListener('wheel',function(e){e.preventDefault();radius=Math.max(10,Math.min(80,radius+e.deltaY*.05));},{passive:false});
  var tx=0,ty=0,td=false;
  cv.addEventListener('touchstart',function(e){if(e.touches.length===1){td=true;tx=e.touches[0].clientX;ty=e.touches[0].clientY;}});
  window.addEventListener('touchend',function(){td=false;});
  cv.addEventListener('touchmove',function(e){if(!td||e.touches.length!==1)return;theta-=(e.touches[0].clientX-tx)*.009;phi=Math.max(.1,Math.min(1.4,phi+(e.touches[0].clientY-ty)*.007));tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
  (function loop(){requestAnimationFrame(loop);var cx=lx+radius*Math.sin(phi)*Math.sin(theta),cy=ly+radius*Math.cos(phi),cz=radius*Math.sin(phi)*Math.cos(theta);cam.position.set(cx,cy,cz);cam.lookAt(lx,ly,0);rend.render(sc,cam);})();
}

// ═══════════════════════════════════════
// LEGAL MODALS
// ═══════════════════════════════════════
function showLegal(type){
  var lang = currentLang || 'de';
  var s = '\u003cdiv style="text-align:left;font-size:.82rem;line-height:1.9;color:var(--ink3);max-width:560px">';
  var e = '\u003c/div\u003e';
  function h(txt){return '\u003cp style="font-weight:600;color:var(--ink);margin:1.2rem 0 .3rem;font-size:.85rem;text-transform:uppercase;letter-spacing:.08em">'+txt+'\u003c/p\u003e';}
  function p(txt){return '\u003cp style="margin-bottom:.5rem">'+txt+'\u003c/p\u003e';}
  function a(href,txt){return '\u003ca href="'+href+'" style="color:var(--teal)">'+txt+'\u003c/a\u003e';}

  var titles = {
    de:{imp:'Impressum',priv:'Datenschutzerklärung'},
    en:{imp:'Legal Notice',priv:'Privacy Policy'},
    es:{imp:'Aviso legal',priv:'Política de privacidad'},
    fr:{imp:'Mentions légales',priv:'Politique de confidentialité'},
    nl:{imp:'Colofon',priv:'Privacybeleid'},
    pl:{imp:'Nota prawna',priv:'Polityka prywatności'},
    ru:{imp:'Правовая информация',priv:'Политика конфиденциальности'}
  };
  var lt = titles[lang] || titles.de;

  if(type==='impressum'){
    document.getElementById('mic').textContent='📄';
    document.getElementById('mtitle').textContent=lt.imp;
    document.getElementById('mtext').innerHTML = s
      + h({de:'Angaben gemäß § 5 TMG (Deutschland) / Art. 10 LSSICE (Spanien)',en:'Information according to § 5 TMG (Germany) / Art. 10 LSSICE (Spain)',es:'Información según § 5 TMG (Alemania) / Art. 10 LSSICE (España)',fr:'Mentions légales selon § 5 TMG (Allemagne) / Art. 10 LSSICE (Espagne)',nl:'Gegevens conform § 5 TMG (Duitsland) / Art. 10 LSSICE (Spanje)',pl:'Dane zgodnie z § 5 TMG (Niemcy) / Art. 10 LSSICE (Hiszpania)',ru:'Сведения согласно § 5 TMG (Германия) / Art. 10 LSSICE (Испания)'}[lang]||'Angaben gemäß § 5 TMG')
      + p('\u003cstrong\u003eSophie Wunsch &amp; Lisa Wunsch\u003c/strong\u003e\u003cbr\u003eCarrer de la Dragonera, 7\u003cbr\u003eFanadix, Benissa\u003cbr\u003e03720 Alicante, Spanien')
      + h({de:'Kontakt',en:'Contact',es:'Contacto',fr:'Contact',nl:'Contact',pl:'Kontakt',ru:'Контакт'}[lang]||'Kontakt')
      + p('Tel.: +49 231 888888\u003cbr\u003eE-Mail: \u003ca href="mailto:info@villa-las-hermanas.com" style="color:var(--teal)">info@villa-las-hermanas.com\u003c/a\u003e')
      + h({de:'Verantwortlich für den Inhalt',en:'Responsible for content',es:'Responsable del contenido',fr:'Responsable du contenu',nl:'Verantwoordelijk voor inhoud',pl:'Odpowiedzialny za treść',ru:'Ответственный за контент'}[lang]||'Verantwortlich')
      + p('Sophie Wunsch &amp; Lisa Wunsch, Carrer de la Dragonera 7, Fanadix, Benissa, 03720 Alicante')
      + h('EU-Streitschlichtung / EU Dispute Resolution')
      + p({de:'Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: ',en:'The EU Commission provides a platform for online dispute resolution: ',fr:'La Commission européenne fournit une plateforme: ',es:'La Comisión Europea proporciona una plataforma: ',nl:'De EU-Commissie biedt een platform: ',pl:'Komisja UE udostępnia platformę: ',ru:'Комиссия ЕС предоставляет платформу: '}[lang]+a('https://ec.europa.eu/consumers/odr','ec.europa.eu/consumers/odr'))
      + e;
  } else {
    document.getElementById('mic').textContent='🔒';
    document.getElementById('mtitle').textContent=lt.priv;
    var tx_priv = {
      de: s
        + h('1. Verantwortliche (Art. 4 Nr. 7 DSGVO)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Spanien\u003cbr\u003eE-Mail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com')+'\u003cbr\u003eTel.: +49 231 888888')
        + h('2. Welche Daten wir erheben')
        + p('Beim Ausfüllen unserer Formulare erheben wir: Name, E-Mail, Telefon, Reisezeitraum, Gästeanzahl und Nachricht. Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.')
        + h('3. Rechtsgrundlage')
        + p('Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).')
        + h('4. Weitergabe an Dritte')
        + p('Ihre Daten werden nicht an Dritte weitergegeben, verkauft oder vermietet.')
        + h('5. Hosting')
        + p('Railway Corp., EU-Server Amsterdam. '+a('https://railway.app/legal/privacy','railway.app/legal/privacy'))
        + h('6. Cookies')
        + p('Diese Website verwendet keine Tracking-Cookies und kein Analytics.')
        + h('7. Ihre Rechte')
        + p('Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Widerspruch (Art. 21 DSGVO).\u003cbr\u003eKontakt: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('8. Beschwerderecht')
        + p('BfDI: '+a('https://www.bfdi.bund.de','www.bfdi.bund.de')+' · AEPD: '+a('https://www.aepd.es','www.aepd.es'))
        + h('Stand') + p('Mai 2026') + e,

      en: s
        + h('1. Controller (Art. 4 No. 7 GDPR)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Spain\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Data We Collect')
        + p('When using our forms we collect: name, email, phone, travel dates, guest count and message. This data is used exclusively to process your enquiry.')
        + h('3. Legal Basis')
        + p('Art. 6(1)(b) GDPR (contract performance) and Art. 6(1)(a) GDPR (consent).')
        + h('4. Third Parties')
        + p('Your data is not shared with, sold to, or rented to third parties.')
        + h('5. Hosting')
        + p('Railway Corp., EU servers Amsterdam. '+a('https://railway.app/legal/privacy','railway.app/legal/privacy'))
        + h('6. Cookies')
        + p('This website uses no tracking cookies and no analytics.')
        + h('7. Your Rights')
        + p('Access (Art. 15), rectification (Art. 16), erasure (Art. 17), objection (Art. 21 GDPR).\u003cbr\u003eContact: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('8. Complaints')
        + p('BfDI: '+a('https://www.bfdi.bund.de','www.bfdi.bund.de')+' · AEPD: '+a('https://www.aepd.es','www.aepd.es'))
        + h('Last updated') + p('May 2026') + e,

      es: s
        + h('1. Responsable (Art. 4 núm. 7 RGPD)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, España\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Datos que recogemos')
        + p('Al usar nuestros formularios recogemos: nombre, email, teléfono, fechas, huéspedes y mensaje. Solo para tramitar su consulta.')
        + h('3. Base legal') + p('Art. 6(1)(b) RGPD y Art. 6(1)(a) RGPD.')
        + h('4. Terceros') + p('Sus datos no se comparten ni venden a terceros.')
        + h('5. Hosting') + p('Railway Corp., servidores EU Ámsterdam.')
        + h('6. Cookies') + p('Sin cookies de seguimiento ni analítica.')
        + h('7. Sus derechos') + p('Acceso, rectificación, supresión, oposición (RGPD).\u003cbr\u003e'+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('Actualizado') + p('Mayo 2026') + e,

      fr: s
        + h('1. Responsable (Art. 4 Nr. 7 RGPD)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Espagne\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Données collectées')
        + p('Via nos formulaires: nom, email, téléphone, dates, voyageurs et message. Uniquement pour traiter votre demande.')
        + h('3. Base légale') + p('Art. 6(1)(b) RGPD et Art. 6(1)(a) RGPD.')
        + h('4. Tiers') + p('Vos données ne sont pas partagées ni vendues.')
        + h('5. Hébergement') + p('Railway Corp., serveurs EU Amsterdam.')
        + h('6. Cookies') + p('Pas de cookies de suivi ni d\'analytics.')
        + h('7. Vos droits') + p('Accès, rectification, effacement, opposition (RGPD).\u003cbr\u003e'+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('Mis à jour') + p('Mai 2026') + e,

      nl: s
        + h('1. Verwerkingsverantwoordelijke (Art. 4 Nr. 7 AVG)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Spanje\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Gegevens die we verzamelen')
        + p('Via formulieren: naam, email, telefoon, reisdata, gasten en bericht. Alleen voor verwerking van uw aanvraag.')
        + h('3. Rechtsgrond') + p('Art. 6(1)(b) AVG en Art. 6(1)(a) AVG.')
        + h('4. Derden') + p('Uw gegevens worden niet gedeeld of verkocht.')
        + h('5. Hosting') + p('Railway Corp., EU-servers Amsterdam.')
        + h('6. Cookies') + p('Geen tracking cookies of analytics.')
        + h('7. Uw rechten') + p('Inzage, rectificatie, verwijdering, bezwaar (AVG).\u003cbr\u003e'+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('Bijgewerkt') + p('Mei 2026') + e,

      pl: s
        + h('1. Administrator (Art. 4 Nr. 7 RODO)')
        + p('Sophie Wunsch &amp; Lisa Wunsch\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Hiszpania\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Zbierane dane')
        + p('Przez formularze: imię, email, telefon, daty, goście i wiadomość. Wyłącznie do obsługi zapytania.')
        + h('3. Podstawa prawna') + p('Art. 6 ust. 1 lit. b i a RODO.')
        + h('4. Strony trzecie') + p('Dane nie są udostępniane ani sprzedawane.')
        + h('5. Hosting') + p('Railway Corp., serwery EU Amsterdam.')
        + h('6. Cookies') + p('Brak ciasteczek śledzących i analityki.')
        + h('7. Twoje prawa') + p('Dostęp, sprostowanie, usunięcie, sprzeciw (RODO).\u003cbr\u003e'+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('Aktualizacja') + p('Maj 2026') + e,

      ru: s
        + h('1. Контролёр (ст. 4 п. 7 GDPR)')
        + p('Софи Вунш &amp; Лиза Вунш\u003cbr\u003eCarrer de la Dragonera, 7, Fanadix, Benissa, 03720 Alicante, Испания\u003cbr\u003eEmail: '+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('2. Собираемые данные')
        + p('Через формы: имя, email, телефон, даты, гости и сообщение. Только для обработки запроса.')
        + h('3. Правовая основа') + p('Ст. 6(1)(b) и 6(1)(a) GDPR.')
        + h('4. Третьи стороны') + p('Данные не передаются и не продаются.')
        + h('5. Хостинг') + p('Railway Corp., серверы ЕС Амстердам.')
        + h('6. Cookies') + p('Без отслеживающих cookies и аналитики.')
        + h('7. Ваши права') + p('Доступ, исправление, удаление, возражение (GDPR).\u003cbr\u003e'+a('mailto:info@villa-las-hermanas.com','info@villa-las-hermanas.com'))
        + h('Обновлено') + p('Май 2026') + e
    };
    document.getElementById('mtext').innerHTML = tx_priv[lang] || tx_priv.de;
  }
  document.getElementById('modal').classList.add('open');
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.addEventListener('DOMContentLoaded', function(){
  setLang('de');
  buildGrids();
  showTab('start');
});

// ═══════════════════════════════════════
// SPECIAL FX: Preloader, Parallax/Spotlight, Tageszeit-Licht, Scroll-Reveal
// ═══════════════════════════════════════
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Preloader -> Reveal (setzt body.loaded, das die Hero-Intro startet)
  (function(){
    var pre = document.getElementById('preloader');
    function reveal(){
      document.body.classList.add('loaded');
      if(pre) setTimeout(function(){ pre.style.display = 'none'; }, 2900);
    }
    if(reduce){ if(pre) pre.style.display='none'; document.body.classList.add('loaded'); return; }
    if(document.readyState === 'complete') setTimeout(reveal, 1900);
    else window.addEventListener('load', function(){ setTimeout(reveal, 1900); });
    setTimeout(function(){ if(!document.body.classList.contains('loaded')) reveal(); }, 4400);
  })();

  if(reduce) return;

  // 2) Maus-Parallax (via CSS 'translate', kollidiert nicht mit transform) + Spotlight
  if(window.matchMedia('(pointer:fine)').matches){
    var bg=document.querySelector('.hero-bg'),
        caus=document.querySelector('.hero-caustics'),
        title=document.querySelector('.hero-title-block'),
        eyeb=document.querySelector('.hero-eyebrow'),
        cont=document.querySelector('.hero-content'),
        spot=document.getElementById('fx-spotlight');
    // Zielwerte (t*) und sanft nachgezogene Istwerte (c*) für butterweiche Bewegung
    var tpx=0, tpy=0, cpx=0, cpy=0;
    var tsx=window.innerWidth/2, tsy=window.innerHeight*0.4, csx=tsx, csy=tsy;
    function loop(){
      cpx += (tpx-cpx)*0.055; cpy += (tpy-cpy)*0.055;   // Ebenen langsam nachziehen
      csx += (tsx-csx)*0.10;  csy += (tsy-csy)*0.10;    // Spotlight etwas flotter
      if(window.scrollY < window.innerHeight){
        if(bg)    bg.style.translate    = (-cpx*26).toFixed(2)+'px '+(-cpy*26).toFixed(2)+'px';
        if(caus)  caus.style.translate  = (-cpx*50).toFixed(2)+'px '+(-cpy*50).toFixed(2)+'px';
        if(title) title.style.translate = (cpx*13).toFixed(2)+'px '+(cpy*9).toFixed(2)+'px';
        if(eyeb)  eyeb.style.translate  = (cpx*8).toFixed(2)+'px '+(cpy*5).toFixed(2)+'px';
        if(cont)  cont.style.translate  = (cpx*6).toFixed(2)+'px '+(cpy*4).toFixed(2)+'px';
      }
      if(spot){ spot.style.setProperty('--mx', csx.toFixed(1)+'px'); spot.style.setProperty('--my', csy.toFixed(1)+'px'); }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.addEventListener('mousemove', function(e){
      tpx = e.clientX/window.innerWidth - 0.5;
      tpy = e.clientY/window.innerHeight - 0.5;
      tsx = e.clientX; tsy = e.clientY;
      if(spot) spot.style.opacity='1';
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ if(spot) spot.style.opacity='0'; });
  }

  // 3) Tageszeit-Stimmung über dem Hero (echte Uhrzeit in Benissa)
  (function(){
    var tod = document.getElementById('heroTod'); if(!tod) return;
    function hourMadrid(){
      try { return parseInt(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',hour:'2-digit',hour12:false}).format(new Date()),10); }
      catch(e){ return new Date().getHours(); }
    }
    function set(){
      var h = hourMadrid(), g;
      if(h<6)       g='linear-gradient(to bottom, rgba(10,18,45,.55), rgba(4,8,22,.4))';
      else if(h<8)  g='linear-gradient(to bottom, rgba(120,80,110,.35), rgba(210,150,120,.28))';
      else if(h<17) g='linear-gradient(to bottom, rgba(150,180,200,.10), rgba(120,150,170,.06))';
      else if(h<19) g='linear-gradient(to bottom, rgba(230,150,70,.22), rgba(200,110,50,.18))';
      else if(h<21) g='linear-gradient(to bottom, rgba(242,120,40,.32), rgba(180,60,50,.26))';
      else          g='linear-gradient(to bottom, rgba(10,18,45,.55), rgba(4,8,22,.42))';
      tod.style.background = g;
    }
    set(); setInterval(set, 60000);
  })();

  // 4) Scroll-Choreografie
  (function(){
    var els = document.querySelectorAll('[data-reveal]'); if(!els.length) return;
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.15});
    els.forEach(function(e){ io.observe(e); });
  })();
})();

// ═══════════════════════════════════════
// EMPFEHLUNGEN FX: gestaffeltes Kachel-Reveal + sanfter 3D-Tilt
// ═══════════════════════════════════════
window.addEventListener('DOMContentLoaded', function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = document.querySelectorAll('#empf-grid .tile-card');
  if(!cards.length) return;

  // Reveal beim Scrollen, zeilenweise gestaffelt
  if(!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      var shown = entries.filter(function(e){ return e.isIntersecting; });
      shown.forEach(function(e, i){
        setTimeout(function(){ e.target.classList.add('in'); }, i*85);
        io.unobserve(e.target);
      });
    }, {threshold:.12});
    cards.forEach(function(c){ io.observe(c); });
  } else {
    cards.forEach(function(c){ c.classList.add('in'); });
  }

  // Sanfter 3D-Tilt zur Maus (nur Desktop, ruhige Variante ausgenommen)
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    cards.forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top)/r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left)/r.width  - 0.5) *  5;
        card.style.transform = 'perspective(900px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }
});
