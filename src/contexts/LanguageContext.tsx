'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fil';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.officials': 'Officials',
    'nav.services': 'Services',
    'nav.transparency': 'Transparency',
    'nav.events': 'Announcements/Events',
    'nav.contact': 'Contact',
    'nav.login': 'Resident Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile Settings',
    'nav.track': 'Track Certificates',
    'nav.notifications': 'Notifications',
    'nav.mark_all_read': 'Mark all read',
    'nav.view_all_notifications': 'View all notifications',
    'nav.no_notifications': 'No notifications yet',
    'nav.install': 'Install App',
    'nav.sk_programs': 'SK Youth Programs',

    // Hero Section
    'hero.badge': 'Republic of the Philippines • City of San Juan',
    'hero.title_part1': 'Smart Governance',
    'hero.title_part2': 'At Your Fingertips',
    'hero.desc': 'Welcome to the official website of Barangay Onse. Request civil clearances online, verify documents with anti-counterfeit QR codes, track public finances, and access 24/7 community services.',
    'hero.cta_request': 'Request Clearance Online',
    'hero.cta_track': 'Track Application',
    'hero.cta_login': 'Resident Login',
    'hero.cta_admin': 'Admin Portal',
    'hero.cta_resident_services': 'Resident Services',
    'hero.search_placeholder': 'Paste Tracking Code (e.g. ONSE-2026-8891)...',
    'hero.search_button': 'Track Status',

    // Services Page & Section
    'services.badge': 'Online Barangay Hall',
    'services.heading': 'Official Barangay Certificates & Documents',
    'services.subheading': 'Barangay E-Services',
    'services.subtitle': 'Digitized & Streamlined Resident Certificate Requests',
    'services.desc': 'Skip the long lines. Apply for official documents from home with secure digital processing, online payment options, and express pickup windows.',
    'services.view_all': 'View All Document Types',
    'services.request_btn': 'Apply Online',
    'services.fee_free': 'FREE',
    'services.fee_label': 'Fee:',
    'services.turnaround_label': 'Processing:',
    'services.btn_request': 'Request Online →',
    'services.btn_requirements': 'View Requirements',
    'services.modal_req_title': 'Required Documents:',
    'services.modal_proceed': 'Proceed to Request',
    'services.modal_close': 'Close',

    // Specific Services
    'svc.brgy_clearance.title': 'Barangay Clearance',
    'svc.brgy_clearance.desc': 'Official certificate for local employment, postal ID, bank accounts, and legal requirements.',
    'svc.residency.title': 'Certificate of Residency',
    'svc.residency.desc': 'Certified proof of official residency in Barangay Onse for government and commercial uses.',
    'svc.indigency.title': 'Certificate of Indigency',
    'svc.indigency.desc': 'Free official documentation for medical assistance, burial aid, and social welfare subsidies.',
    'svc.jobseeker.title': 'First-Time Jobseeker Certificate',
    'svc.jobseeker.desc': 'Waives government pre-employment document fees under Republic Act No. 11261 for entry-level applicants.',
    'svc.business.title': 'Barangay Business Clearance',
    'svc.business.desc': 'Mandatory commercial permit for new business registration and annual mayor\'s permit renewal.',
    'svc.blotter.title': 'Barangay Incident / Blotter Certification',
    'svc.blotter.desc': 'Official certification of recorded blotter, incident extract, or conciliation settlement before the Lupong Tagapamayapa.',

    // Features Section
    'features.badge': 'Modern Public Administration',
    'features.heading': 'Why Choose SmartOnse Digital Portal?',
    'features.f1.title': 'Anti-Counterfeit QR Verification',
    'features.f1.desc': 'Every issued certificate carries a tamper-proof encrypted QR code verifiable by employers, embassies, and banks.',
    'features.f2.title': 'Fast & Transparent Processing',
    'features.f2.desc': 'Real-time SMS and dashboard updates as your documents are reviewed, printed, and signed by the Barangay Captain.',
    'features.f3.title': 'Philippine Data Privacy Compliance',
    'features.f3.desc': 'Protected under Republic Act No. 10173 and GDPR-grade standards with encrypted civil registry archives.',

    // Transparency
    'transparency.badge': 'Full Fiscal Transparency',
    'transparency.heading': 'Public Governance & Budget Disclosures',
    'transparency.desc': 'Under the DILG Full Disclosure Policy, Barangay Onse publishes quarterly itemized IRA utilization ledgers, BDRRMF allocations, and procurement biddings.',

    // About Page
    'about.badge': 'Republic of the Philippines • City of San Juan',
    'about.title_prefix': 'Barangay ',
    'about.title_name': 'Onse',
    'about.subtitle': 'A progressive, resilient, and digitally-transformed barangay dedicated to prompt, transparent, and compassionate public service for every resident.',
    'about.nav_metrics': 'Key Metrics',
    'about.nav_vision': 'Pillars & Vision',
    'about.nav_leadership': 'Council Leadership',
    'about.nav_charter': 'Service Pledge',
    'about.nav_hall': 'Barangay Hall',
    'about.mandate_title': 'Our Mandate',
    'about.mandate_badge': 'Republic Act 7160 • RA 11032',
    'about.mandate_desc': 'Under the Local Government Code of 1991 and the Ease of Doing Business & Efficient Government Services Delivery Act of 2018 (RA 11032), Barangay Onse delivers statutory community services, promotes general welfare, maintains public safety, and safeguards community rights with utmost transparency and accountability.',
    'about.vision_title': 'Our Vision',
    'about.vision_badge': 'Smart San Juan Future',
    'about.vision_desc': 'Barangay Onse envisions itself as a benchmark smart community in San Juan City—an empowered, resilient, and inclusive barangay where frontline services are automated, neighborhood safety is guaranteed, youth leadership flourishes, and every family experiences dignity and progress.',
    'about.mission_title': 'Our Mission',
    'about.mission_badge': 'Frontline Action Plan',
    'about.mission_desc': 'To eliminate red tape through digital innovation, maintain 24/7 peace and disaster preparedness, provide prompt assistance for senior citizens, solo parents, and indigent families, and maintain an open-door policy where citizen voices actively shape local governance.',
    'about.charter_title': 'Citizens\' Service Charter',
    'about.charter_subtitle': 'Four unyielding commitments upholding our pledge to deliver responsive public administration to every Juan and Juana.',
    'about.charter_c1_title': 'Honest Public Service (Tapat na Serbisyo)',
    'about.charter_c1_desc': 'Transparent fiscal allocations, open council proceedings, and zero tolerance for red tape.',
    'about.charter_c2_title': 'Fast, Clean & Humane Delivery',
    'about.charter_c2_desc': 'Same-day processing for clearances, clean public spaces, and courteous desk frontline officers.',
    'about.charter_c3_title': 'Your Community Companion',
    'about.charter_c3_desc': 'Dedicated social welfare desks for senior citizens, solo parents, PWDs, and children in need.',
    'about.charter_c4_title': 'Modern Digital Governance',
    'about.charter_c4_desc': '24/7 SmartOnse citizen portal, QR code document verification, and real-time status tracking.',
    'about.social_title': 'Verified Social Channels & Announcements',
    'about.social_desc': 'Follow official announcements, disaster advisories, and community program schedules.',
    'about.hall_title': 'Barangay Onse Hall • San Juan City',
    'about.hall_desc': 'Located in the heart of San Juan City, Metro Manila. Our barangay hall houses the Punong Barangay executive office, Session Hall, Lupong Tagapamayapa conciliation room, Barangay Health Station, Day Care Center, and 24/7 BDRRM Emergency Operations Center.',
    'about.hall_hours_title': 'Operating Hours',
    'about.hall_hours_val': 'Monday to Friday: 8:00 AM – 5:00 PM',
    'about.hall_hours_sub': 'Emergency & Blotter: 24/7 Active',
    'about.hall_contact_title': 'Frontline Contact',
    'about.hall_contact_val': 'Hotline: (02) 8723-0011 / 0917-888-0011',
    'about.hall_contact_sub': 'Email: info@onse.gov.ph',
    'about.cta_badge': 'SmartOnse 24/7 Digital Desk',
    'about.cta_title': 'Request Barangay Certificates Online',
    'about.cta_desc': 'Skip the long line. Apply for Barangay Clearance, Certificate of Residency, Indigency, and First Time Jobseeker certificates with secure digital verification.',
    'about.cta_apply_btn': 'Apply for Document',
    'about.cta_officials_btn': 'View All Council Officials',

    // Officials Page
    'officials.badge': 'Official Leadership Directory',
    'officials.title': 'Barangay Officials',
    'officials.subtitle': 'The dedicated public servants and youth leaders guiding Barangay Onse, City of San Juan. Structured in service hierarchy: Chairman • Treasurer • Secretary • Kagawads.',
    'officials.jump_brgy': 'Barangay Council',
    'officials.jump_sk': 'SK Youth Council',
    'officials.jump_about': 'About Barangay',
    'officials.brgy_heading': 'Barangay Council Officials',
    'officials.brgy_sub': 'Elected and appointed executive leaders of Barangay Onse',
    'officials.sk_heading': 'Sangguniang Kabataan (SK) Council',
    'officials.sk_sub': 'Youth leaders advocating education, sports, and civic empowerment',

    // Contact Page
    'contact.badge': 'Emergency & Hotlines',
    'contact.title': 'Emergency & Contact',
    'contact.subtitle': '24/7 Hotlines, Office Information & Location Map',
    'contact.emergency_heading': 'Emergency Hotlines',
    'contact.emergency_sub': 'Available 24/7 for urgent matters and critical distress calls',
    'contact.med_emergency': 'Medical Emergency',
    'contact.med_sub': 'San Juan Emergency Dispatch & Ambulance',
    'contact.brgy_hotline': 'Barangay Hotline',
    'contact.brgy_hotline_sub': 'Onse Operations Center Desk',
    'contact.fire_emergency': 'Fire Emergency',
    'contact.fire_sub': 'San Juan City Bureau of Fire Protection',
    'contact.hall_heading': 'Barangay Hall',
    'contact.address_label': 'Office Address',
    'contact.phone_label': 'Office Numbers',
    'contact.email_label': 'Official Email Addresses',
    'contact.hours_heading': 'Office Hours',
    'contact.hours_general': 'Regular Operations: Monday – Friday: 8:00 AM – 5:00 PM',
    'contact.hours_emergency': 'Emergency Dispatch, Police & Tanod Blotter: 24/7 Active Non-Stop',

    // Track Page
    'track.title': 'Track Application Status',
    'track.subtitle': 'Real-time monitoring of your requested certificates and clearances',
    'track.placeholder': 'Enter your tracking code (e.g. ONSE-2026-8891)...',
    'track.btn': 'Track Now',
    'track.status_pending': 'Pending Review',
    'track.status_processing': 'In Processing',
    'track.status_ready': 'Ready for Pickup',
    'track.status_completed': 'Released & Completed',
    'track.status_rejected': 'Rejected / Needs Revision',

    // Footer
    'footer.developed': 'Developed for Barangay Onse, San Juan City',
    'footer.copyright': '© 2026 SmartOnse Digital Governance Systems. Republic of the Philippines.',
    'footer.overview_desc': 'The official digital e-governance platform of Barangay Onse, providing transparent, secure, and expedited public services to every resident and constituent.',
    'footer.dpo_badge': 'NPC Registered DPO',
    'footer.dpo_desc': 'National Privacy Commission compliance certified for public sector e-services.',
    'footer.quick_links': 'Citizen E-Services',
    'footer.link_request': '• Request for Certificate',
    'footer.link_track': '• Track Certificate Application',
    'footer.link_services': '• Citizen\'s Charter & Fees',
    'footer.link_transparency': '• Full Disclosure & Budget Board',
    'footer.link_sk': '• SK Youth Development Programs',
    'footer.link_officials': '• Barangay Council & Officials',
    'footer.link_events': '• Community Events & News',
    'footer.laws_title': 'Statutory Compliance',
    'footer.contact_us': 'Barangay Hall Contact',
    'footer.hall_address': '145 Lt. Artiaga St., Barangay Onse, City of San Juan, Metro Manila',
    'footer.hall_hours': 'Monday – Friday: 8:00 AM – 5:00 PM',
    'footer.emergency': 'Emergency Hotline: (02) 8724-4488 / (02) 8723-8888',

    // Accessibility Controls
    'a11y.title': 'Accessibility Controls',
    'a11y.font_size': 'Font Size (Seniors & Low Vision)',
    'a11y.normal': 'Normal (100%)',
    'a11y.large': 'Large (118%)',
    'a11y.xlarge': 'Extra Large (132%)',
    'a11y.contrast': 'Visual Contrast & Filters',
    'a11y.default_contrast': 'Default',
    'a11y.high_contrast': 'High Contrast',
    'a11y.dark_mode': 'Dark Mode',
    'a11y.lang': 'Language / Wika',
    'a11y.reset': 'Reset Filters',
    'a11y.done': 'Done',
  },

  fil: {
    // Nav
    'nav.home': 'Tahanan',
    'nav.about': 'Tungkol sa Onse',
    'nav.officials': 'Mga Opisyal',
    'nav.services': 'Mga Serbisyo',
    'nav.transparency': 'Katapatan at Badyet',
    'nav.events': 'Mga Anunsyo at Kaganapan',
    'nav.contact': 'Ugnayan',
    'nav.login': 'Mag-login ang Residente',
    'nav.register': 'Magrehistro',
    'nav.logout': 'Mag-logout',
    'nav.profile': 'Mga Setting ng Profile',
    'nav.track': 'Subaybayan ang Dokumento',
    'nav.notifications': 'Mga Abiso',
    'nav.mark_all_read': 'Basahin lahat',
    'nav.view_all_notifications': 'Tingnan ang lahat ng abiso',
    'nav.no_notifications': 'Wala pang mga abiso',
    'nav.install': 'I-install ang App',
    'nav.sk_programs': 'Mga Programa ng Kabataan (SK)',

    // Hero Section
    'hero.badge': 'Republika ng Pilipinas • Lungsod ng San Juan',
    'hero.title_part1': 'Matalinong Pamamahala',
    'hero.title_part2': 'Abot-Kamay Mo',
    'hero.desc': 'Maligayang pagdating sa opisyal na website ng Barangay Onse. Mag-request ng clearance online, mag-verify gamit ang anti-counterfeit QR code, subaybayan ang badyet, at kumuha ng tulong 24/7.',
    'hero.cta_request': 'Mag-request ng Clearance Online',
    'hero.cta_track': 'Subaybayan ang Aplikasyon',
    'hero.cta_login': 'Login ng Residente',
    'hero.cta_admin': 'Admin Portal',
    'hero.cta_resident_services': 'Mga Serbisyo ng Residente',
    'hero.search_placeholder': 'I-paste ang Tracking Code (hal. ONSE-2026-8891)...',
    'hero.search_button': 'Alamin ang Katayuan',

    // Services Page & Section
    'services.badge': 'Online na Barangay Hall',
    'services.heading': 'Mga Opisyal na Sertipiko at Dokumento',
    'services.subheading': 'Mga E-Serbisyo ng Barangay',
    'services.subtitle': 'Mabilis at Digitized na Pagkuha ng mga Sertipiko ng Residente',
    'services.desc': 'Iwasan ang mahabang pila. Mag-apply para sa mga opisyal na dokumento mula sa tahanan gamit ang mabilis na online processing, mga paraan ng pagbabayad, at express pick-up.',
    'services.view_all': 'Tingnan ang Lahat ng Uri ng Dokumento',
    'services.request_btn': 'Mag-apply Online',
    'services.fee_free': 'LIBRE',
    'services.fee_label': 'Bayad:',
    'services.turnaround_label': 'Bilis ng Pagproseso:',
    'services.btn_request': 'Mag-apply Online →',
    'services.btn_requirements': 'Tingnan ang mga Kinakailangan',
    'services.modal_req_title': 'Mga Kinakailangang Dokumento:',
    'services.modal_proceed': 'Tumuloy sa Pag-apply',
    'services.modal_close': 'Isara',

    // Specific Services
    'svc.brgy_clearance.title': 'Barangay Clearance',
    'svc.brgy_clearance.desc': 'Opisyal na sertipiko para sa lokal na trabaho, Postal ID, bank account, at iba pang legal na pangangailangan.',
    'svc.residency.title': 'Sertipiko ng Paninirahan (Residency)',
    'svc.residency.desc': 'Katunayan ng opisyal na paninirahan sa Barangay Onse para sa mga transaksyong pampubliko at pribado.',
    'svc.indigency.title': 'Sertipiko ng Indigency',
    'svc.indigency.desc': 'Libreng opisyal na dokumento para sa tulong-medikal, ayuda sa libing, at suporta mula sa DSWD/AICS.',
    'svc.jobseeker.title': 'Sertipiko ng First-Time Jobseeker',
    'svc.jobseeker.desc': 'Libreng pre-employment documents alinsunod sa itinatadhana ng Republic Act No. 11261 para sa mga bagong naghahanap ng trabaho.',
    'svc.business.title': 'Barangay Business Clearance',
    'svc.business.desc': 'Kailangang permit para sa pagpaparehistro ng bagong negosyo at taunang Mayor\'s Permit renewal.',
    'svc.blotter.title': 'Sertipikasyon ng Barangay Blotter / Rekord',
    'svc.blotter.desc': 'Opisyal na katunayan ng naitalang blotter, ulat ng insidente, o kasunduan sa Lupong Tagapamayapa.',

    // Features Section
    'features.badge': 'Makabagong Serbisyong Publiko',
    'features.heading': 'Bakit SmartOnse ang Ginagamit ng Pamayanan?',
    'features.f1.title': 'Anti-Counterfeit QR Verification',
    'features.f1.desc': 'Bawat sertipiko ay may naka-encrypt na QR code na madaling mai-verify ng mga kumpanya, embahada, at bangko.',
    'features.f2.title': 'Mabilis at Transparent na Proseso',
    'features.f2.desc': 'Makatanggap ng real-time SMS at online update habang sinusuri, pinipirmahan, at inihahanda ng Kapitan ang iyong dokumento.',
    'features.f3.title': 'Proteksyon sa ilalim ng Data Privacy Act',
    'features.f3.desc': 'Mahigpit na protektado sa ilalim ng Republic Act No. 10173 gamit ang mga secure at naka-encrypt na civil registry database.',

    // Transparency
    'transparency.badge': 'Buong Katapatan sa Pondo',
    'transparency.heading': 'Ulat sa Badyet at Pamamahala',
    'transparency.desc': 'Alinsunod sa DILG Full Disclosure Policy, inilalathala ng Barangay Onse ang kwarterly na ulat sa paggamit ng IRA, pondo sa kalamidad (BDRRMF), at pampublikong bidding.',

    // About Page
    'about.badge': 'Republika ng Pilipinas • Lungsod ng San Juan',
    'about.title_prefix': 'Barangay ',
    'about.title_name': 'Onse',
    'about.subtitle': 'Isang progresibo, matatag, at modernong barangay na tapat na naglilingkod nang may bilis, malasakit, at integridad sa bawat mamamayan.',
    'about.nav_metrics': 'Mga Pangunahing Datos',
    'about.nav_vision': 'Mga Simulain at Pananaw',
    'about.nav_leadership': 'Pamunuan ng Konseho',
    'about.nav_charter': 'Pangako sa Serbisyo',
    'about.nav_hall': 'Barangay Hall',
    'about.mandate_title': 'Ang Ating Mandato',
    'about.mandate_badge': 'Republic Act 7160 • RA 11032',
    'about.mandate_desc': 'Sa ilalim ng Local Government Code of 1991 at ng Ease of Doing Business Act (RA 11032), ang Barangay Onse ay nagkakaloob ng opisyal na serbisyong pambarangay, nagtataguyod ng kaligtasan at kaayusan, at nangangalaga sa karapatan ng bawat residente nang may buong pananagutan.',
    'about.vision_title': 'Ang Ating Pananaw (Vision)',
    'about.vision_badge': 'Kinabukasan ng Smart San Juan',
    'about.vision_desc': 'Isang huwarang pamayanang digital sa Lungsod ng San Juan—may maunlad na pamumuhay, ligtas na lansangan, aktibong kabataan, at modernong serbisyong pampubliko na may dignidad para sa bawat pamilya.',
    'about.mission_title': 'Ang Ating Misyon (Mission)',
    'about.mission_badge': 'Plano ng Aksyon at Pagsisilbi',
    'about.mission_desc': 'Pawiin ang red tape gamit ang makabagong teknolohiya, tiyakin ang 24/7 na katahimikan at kahandaan sa sakuna, magbigay ng kagyat na kalinga sa mga senior citizen, solo parent, at nangangailangang pamilya, at panatilihing bukas ang pinto sa tinig ng mamamayan.',
    'about.charter_title': 'Citizens\' Service Charter (Panunumpa sa Paglilingkod)',
    'about.charter_subtitle': 'Apat na matibay na paninindigan para sa tapat, mabilis, at makataong pamamahala sa bawat Juan at Juana.',
    'about.charter_c1_title': 'Tapat na Serbisyo, Para sa Tao',
    'about.charter_c1_desc': 'Malinis na pamamahala sa pondo, hayag na sesyon ng konseho, at walang puwang ang red tape.',
    'about.charter_c2_title': 'Mabilis, Malinis, Makataong Serbisyo',
    'about.charter_c2_desc': 'Parehong araw na paglabas ng clearance, maayos na kapaligiran, at magalang na pagtanggap sa frontline.',
    'about.charter_c3_title': 'Barangay Mo, Kaagapay Mo',
    'about.charter_c3_desc': 'May nakalaang tulong para sa mga lolo\'t lola, solo parents, may kapansanan (PWD), at kabataan.',
    'about.charter_c4_title': 'Digital na Pamamahala',
    'about.charter_c4_desc': '24/7 SmartOnse portal, QR verification laban sa pekeng dokumento, at real-time tracking ng aplikasyon.',
    'about.social_title': 'Mga Opisyal na Pahina sa Social Media',
    'about.social_desc': 'Manatiling updated sa mga abiso ng barangay, anunsyo sa bagyo, at mga programang pangkomunidad.',
    'about.hall_title': 'Barangay Onse Hall • Lungsod ng San Juan',
    'about.hall_desc': 'Matatagpuan sa gitna ng Lungsod ng San Juan, Kalakhang Maynila. Narito ang opisina ng Punong Barangay, Session Hall, Lupong Tagapamayapa, Barangay Health Station, Day Care Center, at 24/7 BDRRM Operations Center.',
    'about.hall_hours_title': 'Oras ng Tanggapan',
    'about.hall_hours_val': 'Lunes hanggang Biyernes: 8:00 AM – 5:00 PM',
    'about.hall_hours_sub': 'Emergency at Blotter: Bukas 24/7 Araw-araw',
    'about.hall_contact_title': 'Ugnayan sa Frontline',
    'about.hall_contact_val': 'Hotline: (02) 8723-0011 / 0917-888-0011',
    'about.hall_contact_sub': 'Email: info@onse.gov.ph',
    'about.cta_badge': 'SmartOnse 24/7 Digital Desk',
    'about.cta_title': 'Mag-request ng Sertipiko Online',
    'about.cta_desc': 'Iwasan ang siksikan at mahabang pila. Kumuha ng Barangay Clearance, Residency, Indigency, at First Time Jobseeker certificate gamit ang ligtas na digital verification.',
    'about.cta_apply_btn': 'Mag-apply Para sa Dokumento',
    'about.cta_officials_btn': 'Kilalanin ang mga Opisyal ng Konseho',

    // Officials Page
    'officials.badge': 'Opisyal na Direktoryo ng Pamunuan',
    'officials.title': 'Mga Opisyal ng Barangay',
    'officials.subtitle': 'Ang mga tapat na lingkod-bayan at pinuno ng kabataan na gumagabay sa Barangay Onse, Lungsod ng San Juan. Nakaayos ayon sa wastong hirarkiya: Punong Barangay • Ingat-Yaman • Kalihim • Mga Kagawad.',
    'officials.jump_brgy': 'Konseho ng Barangay',
    'officials.jump_sk': 'Konseho ng Kabataan (SK)',
    'officials.jump_about': 'Tungkol sa Barangay',
    'officials.brgy_heading': 'Mga Opisyal ng Sangguniang Barangay',
    'officials.brgy_sub': 'Mga inihalal at hinirang na pinuno ng Barangay Onse',
    'officials.sk_heading': 'Sangguniang Kabataan (SK) Council',
    'officials.sk_sub': 'Mga pinuno ng kabataan para sa edukasyon, palakasan, at kaunlaran ng komunidad',

    // Contact Page
    'contact.badge': 'Emergency at Ugnayan',
    'contact.title': 'Emergency at Ugnayan',
    'contact.subtitle': '24/7 Hotlines, Impormasyon sa Opisina at Mapa ng Lokasyon',
    'contact.emergency_heading': 'Mga Emergency Hotline',
    'contact.emergency_sub': 'Bukas 24/7 para sa agarang saklolo at mga emerhensiya',
    'contact.med_emergency': 'Medikal na Saklolo',
    'contact.med_sub': 'San Juan Emergency Dispatch at Ambulansya',
    'contact.brgy_hotline': 'Hotline ng Barangay',
    'contact.brgy_hotline_sub': 'Desk ng Onse Operations Center',
    'contact.fire_emergency': 'Kagawaran ng Sunog (BFP)',
    'contact.fire_sub': 'San Juan City Bureau of Fire Protection',
    'contact.hall_heading': 'Barangay Hall',
    'contact.address_label': 'Tirahan ng Tanggapan',
    'contact.phone_label': 'Mga Numero ng Telepono',
    'contact.email_label': 'Opisyal na mga Email Address',
    'contact.hours_heading': 'Oras ng Serbisyo',
    'contact.hours_general': 'Karaniwang Transaksyon: Lunes – Biyernes: 8:00 AM – 5:00 PM',
    'contact.hours_emergency': 'Emergency Dispatch, Pulisya at Blotter ng Tanod: Bukas 24/7 Walang Patid',

    // Track Page
    'track.title': 'Alamin ang Katayuan ng Aplikasyon',
    'track.subtitle': 'Real-time na pagsubaybay sa iyong mga ni-request na sertipiko at clearance',
    'track.placeholder': 'I-type ang iyong tracking code (hal. ONSE-2026-8891)...',
    'track.btn': 'Subaybayan Ngayon',
    'track.status_pending': 'Hinihintay ang Pagsusuri',
    'track.status_processing': 'Kasalukuyang Pinoproseso',
    'track.status_ready': 'Handa nang Kunin sa Barangay',
    'track.status_completed': 'Nailabas at Tapos Na',
    'track.status_rejected': 'Hindi Naaprubahan / Kailangan ng Pagbabago',

    // Footer
    'footer.developed': 'Binuo para sa Barangay Onse, Lungsod ng San Juan',
    'footer.copyright': '© 2026 SmartOnse Digital Governance Systems. Republika ng Pilipinas.',
    'footer.overview_desc': 'Ang opisyal na digital e-governance platform ng Barangay Onse, nagbibigay ng tapat, ligtas, at mabilis na serbisyong pampubliko sa bawat mamamayan.',
    'footer.dpo_badge': 'Rehistradong DPO sa NPC',
    'footer.dpo_desc': 'Sertipikadong sumusunod sa National Privacy Commission para sa pampublikong e-services.',
    'footer.quick_links': 'Mga E-Serbisyo ng Mamamayan',
    'footer.link_request': '• Mag-request ng Sertipiko',
    'footer.link_track': '• Subaybayan ang Aplikasyon',
    'footer.link_services': '• Citizen\'s Charter at mga Bayarin',
    'footer.link_transparency': '• Buong Katapatan at Badyet ng Barangay',
    'footer.link_sk': '• Mga Programa ng Kabataan (SK)',
    'footer.link_officials': '• Konseho at mga Opisyal ng Barangay',
    'footer.link_events': '• Mga Kaganapan at Balita sa Komunidad',
    'footer.laws_title': 'Pagsunod sa mga Batas ng Pilipinas',
    'footer.contact_us': 'Ugnayan sa Barangay Hall',
    'footer.hall_address': '145 Lt. Artiaga St., Barangay Onse, Lungsod ng San Juan, Metro Manila',
    'footer.hall_hours': 'Lunes – Biyernes: 8:00 AM – 5:00 PM',
    'footer.emergency': 'Emergency Hotline: (02) 8724-4488 / (02) 8723-8888',

    // Accessibility Controls
    'a11y.title': 'Mga Kontrol sa Accessibility',
    'a11y.font_size': 'Laki ng Letra (Para sa Seniors at Malabong Mata)',
    'a11y.normal': 'Karaniwan (100%)',
    'a11y.large': 'Malaki (118%)',
    'a11y.xlarge': 'Napakalaki (132%)',
    'a11y.contrast': 'Mga Filter at Kontras sa Kulay',
    'a11y.default_contrast': 'Karaniwan',
    'a11y.high_contrast': 'Mataas na Kontras',
    'a11y.dark_mode': 'Madilim na Mode',
    'a11y.lang': 'Wika / Language',
    'a11y.reset': 'Ibalik sa Karaniwan',
    'a11y.done': 'Tapos Na',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartonse_lang') as Language;
      if (saved === 'fil' || saved === 'en') {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartonse_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'fil' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
