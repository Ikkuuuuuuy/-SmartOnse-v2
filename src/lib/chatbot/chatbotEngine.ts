import prisma from '@/lib/prisma';

export interface ChatbotResponse {
  reply: string;
  category?: 'security' | 'officials' | 'events' | 'services' | 'sk' | 'transparency' | 'tracking' | 'location' | 'directory' | 'general' | 'out_of_scope';
}

/**
 * Normalizes input text for keyword and intent matching
 */
function cleanQuery(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[?!,.:;"'(){}\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. PRIVACY & SYSTEM SECURITY GUARDRAIL
 * Straight to the point: blocks admin credentials, database internals, and resident PII.
 */
function checkSecurityViolation(raw: string, q: string): string | null {
  const adminPatterns = [
    /\b(admin password|system password|super admin password|root password|master password)\b/i,
    /\b(admin credentials|admin account credentials|login as admin|bypass admin|bypass login)\b/i,
    /\b(database credentials|db password|sql injection|drop table|select \* from|union select)\b/i,
    /\b(prisma schema|env file|\.env|secret key|jwt secret|api key|smtp_pass|session_secret)\b/i,
    /\b(audit log|audit logs|system audit|who logged in|failed logins|system logs)\b/i,
    /\b(password hash|bcrypt hash|reset token|auth token|session token)\b/i,
    /\b(ignore (all )?previous instructions|system prompt|jailbreak|pretend you are dan|developer mode)\b/i,
    /\b(dump database|show users table|export all residents|leak data)\b/i,
  ];

  for (const pattern of adminPatterns) {
    if (pattern.test(raw) || pattern.test(q)) {
      return 'Hindi maaaring ilabas ang mga admin credentials, system logs, o database information.';
    }
  }

  const piiPatterns = [
    /\b(who lives at|who lives in|where does .* live|home address of|residence of resident)\b/i,
    /\b(resident list|list of residents|inhabitant list|list of inhabitants|census list)\b/i,
    /\b(phone number of resident|contact number of resident|mobile number of resident|email of resident)\b/i,
    /\b(voter list|registered voters list|list of voters|precinct number of)\b/i,
    /\b(pwd list|list of pwd|senior citizen list|list of seniors|solo parent list)\b/i,
    /\b(4ps beneficiary list|list of 4ps|monthly income of resident|salary of resident)\b/i,
    /\b(rbi number of|rbi record|census record|inhabitant record)\b/i,
    /\b(medical record of|symptoms of patient|blotter records of other people)\b/i,
  ];

  for (const pattern of piiPatterns) {
    if (pattern.test(raw) || pattern.test(q)) {
      return 'Protektado ang personal na impormasyon ng mga residente alinsunod sa Data Privacy Act.';
    }
  }

  return null;
}

/**
 * 2. TICKET / REQUEST REFERENCE NUMBER LOOKUP
 * Straight to the point tracking of submitted requests (e.g. REQ-2026-0001).
 */
async function handleTrackingLookup(raw: string, q: string): Promise<string | null> {
  const reqMatch = raw.match(/\b(REQ-[A-Za-z0-9-]+)\b/i) ||
                   raw.match(/\b([A-Za-z0-9]{8,14})\b/);

  const isAskingAboutTrack =
    q.includes('req-') ||
    q.includes('status') ||
    q.includes('ticket') ||
    q.includes('reference') ||
    q.includes('tracking') ||
    q.includes('pacheck') ||
    q.includes('pa-check') ||
    q.includes('follow up') ||
    q.includes('follow-up') ||
    q.includes('tapos na ba') ||
    q.includes('ready na ba') ||
    q.includes('kukunin') ||
    q.includes('san na') ||
    q.includes('saan na') ||
    q.includes('asan na');

  if (reqMatch) {
    const trackingCode = reqMatch[1].trim();

    try {
      const doc = await prisma.documentRequest.findFirst({
        where: {
          trackingNumber: {
            equals: trackingCode,
            mode: 'insensitive',
          },
        },
        include: {
          documentType: true,
        },
      });

      if (!doc) {
        return `Hindi natagpuan ang reference number na **${trackingCode}**. Pakisuri ang spelling o tingnan sa [Track Request](/track).`;
      }

      const statusMap: Record<string, { label: string; icon: string }> = {
        PENDING: { label: 'PENDING (Nasa Pagsusuri)', icon: '⏳' },
        PROCESSING: { label: 'PROCESSING (Inihahanda)', icon: '⚙️' },
        READY_FOR_PICKUP: { label: 'READY FOR PICKUP (Handa nang kunin sa Window 2)', icon: '📬' },
        COMPLETED: { label: 'COMPLETED (Naibigay Na)', icon: '✅' },
        REJECTED: { label: 'REJECTED (Kailangang Itama)', icon: '⚠️' },
      };

      const s = statusMap[doc.status] || { label: doc.status, icon: '📄' };
      const dateStr = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(doc.createdAt));
      const pickupInfo = doc.pickupDate
        ? `\n• **Pickup Date:** ${new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(doc.pickupDate))}`
        : '';
      const remarksInfo = doc.remarks ? `\n• **Tala:** ${doc.remarks}` : '';

      return (
        `📄 **Request Status: ${doc.trackingNumber}**\n\n` +
        `• **Dokumento:** ${doc.documentType?.name || 'Barangay Document'}\n` +
        `• **Estado:** ${s.icon} **${s.label}**\n` +
        `• **Petsa ng Request:** ${dateStr}` +
        pickupInfo +
        remarksInfo +
        `\n\n👉 [Tingnan sa Tracking Page](/track?trackingNumber=${encodeURIComponent(doc.trackingNumber)})`
      );
    } catch (err) {
      console.error('Error looking up tracking:', err);
    }
  }

  if (isAskingAboutTrack && (q.includes('paano') || q.includes('saan') || q.includes('how') || q.includes('where') || q.includes('link'))) {
    return 'I-type lamang dito ang inyong reference code (halimbawa: `REQ-2026-0001`) o pumunta sa [Track Request Page](/track).';
  }

  return null;
}

/**
 * 3. BARANGAY ONSE LOCATION & CONTACT
 * Straight to the point: exact location, landmarks, office hours, and map link.
 */
function handleLocationAndAboutQuery(q: string): string | null {
  const isAskingLocation =
    q.includes('where is') ||
    q.includes('saan matatagpuan') ||
    q.includes('san matatagpuan') ||
    q.includes('saan ang onse') ||
    q.includes('san ang onse') ||
    q.includes('wer is onse') ||
    q.includes('nasaan ang onse') ||
    q.includes('asan ang onse') ||
    q.includes('location ng onse') ||
    q.includes('lokasyon ng onse') ||
    q.includes('address ng onse') ||
    q.includes('address ng barangay hall') ||
    q.includes('saan ang barangay hall') ||
    q.includes('san ang barangay hall') ||
    q.includes('saan banda ang onse') ||
    q.includes('san banda ang onse') ||
    q.includes('paano pumunta sa onse') ||
    q.includes('pano pumunta sa onse') ||
    q.includes('direksyon papuntang onse') ||
    q.includes('sakay papuntang onse') ||
    q.includes('saan ang opisina') ||
    q.includes('office hours') ||
    q.includes('oras ng bukas') ||
    q.includes('bukas ba ang barangay') ||
    q.includes('anong oras bukas') ||
    q.includes('tungkol sa onse') ||
    q.includes('history ng onse');

  if (!isAskingLocation) return null;

  return (
    `📍 **Lokasyon ng Barangay Onse Hall:**\n\n` +
    `• **Address:** 3 J.V. Panganiban St., Barangay Onse, San Juan City, Metro Manila 1500\n` +
    `• **Landmark:** Malapit sa N. Domingo St., J. Perez St., at LRT-2 J. Ruiz Station (5 minutong lakad).\n` +
    `• **Oras ng Tanggapan:** Lunes hanggang Biyernes, 8:00 AM – 5:00 PM\n` +
    `• **Telepono:** (02) 8723-0011 / (02) 8123-4567 | Mobile: 0917-888-0011\n\n` +
    `👉 [Tingnan ang Mapa at Direksyon](/contact)`
  );
}

/**
 * 4. DIRECTORY NAVIGATION ("WHERE IS THIS / WHERE IS THAT")
 * Straight to the point: directs users with exact links.
 */
function handleDirectoryAndLinksQuery(q: string): string | null {
  const isAskingDirectory =
    q.includes('saan makikita') ||
    q.includes('san makikita') ||
    q.includes('saan pupunta') ||
    q.includes('san pupunta') ||
    q.includes('saan i-click') ||
    q.includes('saan mag-') ||
    q.includes('san mag-') ||
    q.includes('where to') ||
    q.includes('where can i') ||
    q.includes('where is the link') ||
    q.includes('link para sa') ||
    q.includes('link ng') ||
    q.includes('directory') ||
    q.includes('portal link');

  if (!isAskingDirectory) return null;

  if (q.includes('register') || q.includes('rehistro') || q.includes('sign up') || q.includes('account')) {
    return 'Magrehistro rito: [Citizen Registration](/register)';
  }

  if (q.includes('login') || q.includes('log in') || q.includes('mag-sign in') || q.includes('mag-login')) {
    return 'Mag-log in sa inyong account dito: [Portal Login](/login)';
  }

  if (q.includes('request') || q.includes('kuha') || q.includes('clearance') || q.includes('indigency') || q.includes('residency') || q.includes('dokumento')) {
    return 'Mag-apply ng dokumento dito: [Online Document Request](/portal/request)';
  }

  if (q.includes('track') || q.includes('status') || q.includes('ticket') || q.includes('reference')) {
    return 'I-track ang inyong aplikasyon dito: [Track Request Status](/track)';
  }

  if (q.includes('verify') || q.includes('qr')) {
    return 'I-verify ang QR code ng certificate dito: [Verify Certificate](/verify)';
  }

  if (q.includes('opisyal') || q.includes('official') || q.includes('kapitan') || q.includes('kagawad')) {
    return 'Talaan ng mga opisyal: [Officials Directory](/officials)';
  }

  // General Sitemap
  return (
    `🗺️ **Mga Link sa SmartOnse Portal:**\n\n` +
    `• [Mag-request ng Dokumento](/portal/request)\n` +
    `• [I-track ang Request](/track)\n` +
    `• [I-verify ang Certificate QR](/verify)\n` +
    `• [Mga Serbisyo at Bayarin](/services)\n` +
    `• [Mga Opisyal ng Barangay](/officials)\n` +
    `• [SK Programs at Kabataan](/sk-programs)\n` +
    `• [Kalendaryo ng Events](/events)\n` +
    `• [Transparency Board](/transparency)\n` +
    `• [Lokasyon at Hotlines](/contact)\n` +
    `• [Magrehistro](/register) | [Mag-login](/login)`
  );
}

/**
 * 5. BARANGAY & SK OFFICIALS
 * Straight to the point: captain, SK chair, kagawads.
 */
async function handleOfficialsQuery(q: string): Promise<string | null> {
  const isAskingOfficials =
    q.includes('official') ||
    q.includes('officials') ||
    q.includes('opisyal') ||
    q.includes('captain') ||
    q.includes('kapitan') ||
    q.includes('kap ') ||
    q.includes('punong barangay') ||
    q.includes('chairman') ||
    q.includes('sk chairperson') ||
    q.includes('sk chairman') ||
    q.includes('kagawad') ||
    q.includes('councilor') ||
    q.includes('konsehal') ||
    q.includes('sino ang') ||
    q.includes('sno ang') ||
    q.includes('cno ang') ||
    q.includes('who is') ||
    q.includes('alba') ||
    q.includes('permato') ||
    q.includes('florano');

  if (!isAskingOfficials) return null;

  try {
    const officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });

    // SK Chairperson
    if (q.includes('sk') && (q.includes('chair') || q.includes('permato') || q.includes('sino') || q.includes('who'))) {
      return (
        `🏅 **SK Chairperson:** Hon. John Michael D. Permato\n` +
        `• Komite: Youth Leadership & Sports\n` +
        `• Termino: 2023 - 2026\n\n` +
        `👉 [Tingnan ang SK Programs](/sk-programs)`
      );
    }

    // Barangay Captain / Chairman
    if (q.includes('captain') || q.includes('kapitan') || q.includes('kap ') || q.includes('punong') || q.includes('alba') || (q.includes('chairman') && !q.includes('sk'))) {
      return (
        `🏛️ **Punong Barangay:** Hon. Roberto B. Alba\n` +
        `• Posisyon: Barangay Chairman\n` +
        `• Termino: 2023 - 2026\n` +
        `• Oras sa Hall: Lunes – Biyernes, 8:00 AM – 5:00 PM\n\n` +
        `👉 [Tingnan ang Lahat ng Opisyal](/officials)`
      );
    }

    // Kagawad list
    if (q.includes('kagawad') || q.includes('councilor') || q.includes('konsehal')) {
      const kagawads = officials.filter(
        (o) => o.position.toLowerCase().includes('kagawad') && !o.position.toLowerCase().includes('sk')
      );
      if (kagawads.length > 0) {
        const list = kagawads.map((k) => `• **${k.name}** – ${k.committee || 'Councilor'}`).join('\n');
        return `🏛️ **Mga Kagawad ng Barangay Onse:**\n\n${list}\n\n👉 [Talaan ng mga Opisyal](/officials)`;
      }
    }

    // Default leaders
    return (
      `🏛️ **Mga Pinuno ng Barangay Onse (2023 - 2026):**\n\n` +
      `• **Punong Barangay:** Hon. Roberto B. Alba\n` +
      `• **SK Chairperson:** Hon. John Michael D. Permato\n\n` +
      `👉 [Tingnan ang Kumpletong Talaan ng mga Opisyal](/officials)`
    );
  } catch (err) {
    console.error('Error fetching officials:', err);
    return null;
  }
}

/**
 * 6. SERVICES, CLEARANCES, FEES & REQUIREMENTS
 * Straight to the point: fee, processing time, requirements, and request link.
 */
async function handleServicesQuery(q: string): Promise<string | null> {
  const isAskingService =
    q.includes('clearance') ||
    q.includes('indigency') ||
    q.includes('residency') ||
    q.includes('jobseeker') ||
    q.includes('cedula') ||
    q.includes('blotter') ||
    q.includes('certificate') ||
    q.includes('sertipiko') ||
    q.includes('requirement') ||
    q.includes('requirements') ||
    q.includes('kailangan') ||
    q.includes('magkano') ||
    q.includes('hm') ||
    q.includes('how much') ||
    q.includes('bayad') ||
    q.includes('fee') ||
    q.includes('fees') ||
    q.includes('libre ba') ||
    q.includes('libreng') ||
    q.includes('serbisyo') ||
    q.includes('services') ||
    q.includes('paano kumuha') ||
    q.includes('pano kumuha');

  if (!isAskingService) return null;

  try {
    const docTypes = await prisma.documentType.findMany({ where: { isActive: true } });

    // Barangay Clearance
    if (q.includes('clearance') && !q.includes('business')) {
      const doc = docTypes.find((d) => d.code === 'BRGY_CLEARANCE');
      return (
        `📄 **Barangay Clearance**\n\n` +
        `• **Bayad:** ₱${doc?.fee.toFixed(2) || '50.00'} *(LIBRE para sa first-time jobseekers)*\n` +
        `• **Tagal:** 1 Business Day\n` +
        `• **Requirements:** 1 Valid ID, Proof of Address, Cedula\n\n` +
        `👉 [Mag-apply Online](/portal/request)`
      );
    }

    // Certificate of Indigency
    if (q.includes('indigency')) {
      return (
        `📑 **Certificate of Indigency**\n\n` +
        `• **Bayad:** **LIBRE (100% Free)**\n` +
        `• **Tagal:** Same Day / 1 Business Day\n` +
        `• **Gamit:** Hospital/Medical assistance, Scholarship, PAO legal help\n` +
        `• **Requirements:** Valid ID, Proof of residency, Hospital/School endorsement\n\n` +
        `👉 [Mag-apply Online](/portal/request)`
      );
    }

    // Certificate of Residency
    if (q.includes('residency') || q.includes('paninirahan')) {
      const doc = docTypes.find((d) => d.code === 'CERT_RESIDENCY');
      return (
        `🏠 **Certificate of Residency**\n\n` +
        `• **Bayad:** ₱${doc?.fee.toFixed(2) || '30.00'}\n` +
        `• **Tagal:** 1 Business Day\n` +
        `• **Requirements:** Valid ID na may Onse address o Lease contract\n\n` +
        `👉 [Mag-apply Online](/portal/request)`
      );
    }

    // First-Time Jobseeker
    if (q.includes('jobseeker') || q.includes('11261')) {
      return (
        `💼 **First-Time Jobseeker Certificate (R.A. 11261)**\n\n` +
        `• **Bayad:** **LIBRE**\n` +
        `• **Requirements:** Barangay Oath of Undertaking, Valid School ID o PSA Birth Certificate\n\n` +
        `👉 [Mag-apply Online](/portal/request)`
      );
    }

    // Blotter
    if (q.includes('blotter') || q.includes('reklamo') || q.includes('sumbong') || q.includes('lupon')) {
      return (
        `⚖️ **Barangay Blotter / Reklamo (Lupong Tagapamayapa):**\n\n` +
        `Personal na magsadya sa Barangay Onse Hall (Lupon & Tanod Desk). Walang bayad ang pagsasampa ng sumbong.\n` +
        `Hotline sa agarang insidente: **(02) 8723-0011**.`
      );
    }

    // General services overview
    if (docTypes.length > 0) {
      const list = docTypes.map((d) => `• **${d.name}** – ${d.fee === 0 ? 'LIBRE' : `₱${d.fee.toFixed(2)}`} (${d.processingDays} araw)`).join('\n');
      return `📑 **Mga Dokumento at Clearances:**\n\n${list}\n\n👉 [Mag-apply Online](/portal/request)`;
    }

    return null;
  } catch (err) {
    console.error('Error fetching services:', err);
    return null;
  }
}

/**
 * 7. SK YOUTH INITIATIVES
 */
async function handleSkQuery(q: string): Promise<string | null> {
  const isAskingSk =
    q.includes('sk program') ||
    q.includes('sk project') ||
    q.includes('youth') ||
    q.includes('scholarship') ||
    q.includes('paliga') ||
    q.includes('liga') ||
    q.includes('basketball') ||
    q.includes('kabataan');

  if (!isAskingSk) return null;

  try {
    const programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (programs.length > 0) {
      const list = programs.map((p) => `• **${p.title}** (${p.status}) – ${p.schedule}`).join('\n');
      return `🏀 **SK Youth Programs:**\n\n${list}\n\n👉 [Tingnan ang SK Programs](/sk-programs)`;
    }

    return '👉 [Tingnan ang mga Aktibidad ng SK](/sk-programs)';
  } catch (err) {
    console.error('Error fetching SK programs:', err);
    return null;
  }
}

/**
 * 8. EVENTS
 */
async function handleEventsQuery(q: string): Promise<string | null> {
  const isAskingEvents =
    q.includes('event') ||
    q.includes('events') ||
    q.includes('kaganapan') ||
    q.includes('aktibidad') ||
    q.includes('activity') ||
    q.includes('calendar') ||
    q.includes('anong meron');

  if (!isAskingEvents) return null;

  try {
    const allEvents = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
      take: 3,
    });

    if (allEvents.length > 0) {
      const list = allEvents.map((ev) => {
        const d = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(ev.eventDate));
        return `• **${ev.title}** (${d}) - ${ev.location}`;
      }).join('\n');
      return `📅 **Upcoming Events:**\n\n${list}\n\n👉 [Tingnan ang Kalendaryo](/events)`;
    }

    return 'Walang nakatakdang public event sa ngayon. 👉 [Tingnan ang Kalendaryo](/events)';
  } catch (err) {
    console.error('Error fetching events:', err);
    return null;
  }
}

/**
 * 9. HEALTH & EMERGENCY
 */
function handleHealthAndEmergencyQuery(q: string): string | null {
  if (q.includes('health') || q.includes('center') || q.includes('klinika') || q.includes('bakuna') || q.includes('gamot') || q.includes('doktor')) {
    return (
      `🏥 **Barangay Onse Health Center:**\n\n` +
      `• Oras: Lunes – Biyernes, 8:00 AM – 5:00 PM\n` +
      `• Libre: Check-up, bakuna sa bata, prenatal, dental, maintenance medicine\n` +
      `• Lokasyon: Katabi ng Barangay Hall, J. Perez St.`
    );
  }

  if (q.includes('emergency') || q.includes('hotline') || q.includes('saklolo') || q.includes('sunog') || q.includes('pulis') || q.includes('fire')) {
    return (
      `🚨 **Emergency Hotlines:**\n\n` +
      `• Barangay Onse Desk: **(02) 8723-0011** / **(02) 8123-4567**\n` +
      `• San Juan Rescue (CDRRMO - 24/7): **(02) 8722-9837**\n` +
      `• San Juan Police: **(02) 8724-2509**\n` +
      `• San Juan Fire Station: **(02) 8723-9371**\n` +
      `• National Emergency: **911**`
    );
  }

  return null;
}

/**
 * 10. TRANSPARENCY
 */
async function handleTransparencyQuery(q: string): Promise<string | null> {
  const isAskingTransparency =
    q.includes('transparency') ||
    q.includes('budget') ||
    q.includes('badyet') ||
    q.includes('gastos') ||
    q.includes('pondo');

  if (!isAskingTransparency) return null;

  return 'Bukas sa publiko ang mga financial reports at badyet ng barangay rito: [Transparency Board](/transparency)';
}

/**
 * 11. GREETINGS & CASUAL INTERACTION
 */
function handleGreetings(q: string): string | null {
  const isGreeting =
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'mabuhay' ||
    q === 'kamusta' ||
    q === 'musta' ||
    q === 'uy' ||
    q === 'magandang araw' ||
    q === 'magandang umaga' ||
    q === 'magandang gabi' ||
    q === 'magandang hapon' ||
    q === 'good morning' ||
    q === 'good afternoon' ||
    q === 'good evening' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('mabuhay ');

  if (isGreeting) {
    return 'Mabuhay! Ano ang maitutulong ko tungkol sa mga serbisyo, clearances, o impormasyon sa Barangay Onse?';
  }

  if (q.includes('salamat') || q.includes('thank') || q.includes('ty')) {
    return 'Walang anuman! Sabihin lamang kung may kailangan ka pa.';
  }

  return null;
}

/**
 * 12. STRICT OUT-OF-SCOPE FILTER
 * Straight to the point: if question is outside the system / Barangay Onse, state it clearly.
 */
function handleOutOfScopeQuery(): string {
  return (
    'Paumanhin, hindi ito sakop ng aking kaalaman. Ang masasagot ko lamang ay tungkol sa mga serbisyo, dokumento, opisyal, at portal ng Barangay Onse.\n\n' +
    'Maaari ninyong tingnan ang [Mga Serbisyo](/services) o [Talaan ng mga Opisyal](/officials).'
  );
}

/**
 * MAIN CHATBOT PIPELINE
 */
export async function processChatbotMessage(rawMessage: string): Promise<ChatbotResponse> {
  const cleanQ = cleanQuery(rawMessage);

  if (!cleanQ) {
    return {
      reply: 'Mabuhay! Ano ang maitutulong ko tungkol sa mga serbisyo, clearances, o impormasyon sa Barangay Onse?',
      category: 'general',
    };
  }

  // 1. Security Check
  const securityWarning = checkSecurityViolation(rawMessage, cleanQ);
  if (securityWarning) {
    return { reply: securityWarning, category: 'security' };
  }

  // 2. Ticket / Reference Tracking Lookup
  const trackingReply = await handleTrackingLookup(rawMessage, cleanQ);
  if (trackingReply) {
    return { reply: trackingReply, category: 'tracking' };
  }

  // 3. Location & Hall Details
  const locationReply = handleLocationAndAboutQuery(cleanQ);
  if (locationReply) {
    return { reply: locationReply, category: 'location' };
  }

  // 4. Directory & Links
  const directoryReply = handleDirectoryAndLinksQuery(cleanQ);
  if (directoryReply) {
    return { reply: directoryReply, category: 'directory' };
  }

  // 5. Officials
  const officialsReply = await handleOfficialsQuery(cleanQ);
  if (officialsReply) {
    return { reply: officialsReply, category: 'officials' };
  }

  // 6. Services, Clearances, Fees & Requirements
  const servicesReply = await handleServicesQuery(cleanQ);
  if (servicesReply) {
    return { reply: servicesReply, category: 'services' };
  }

  // 7. SK Programs
  const skReply = await handleSkQuery(cleanQ);
  if (skReply) {
    return { reply: skReply, category: 'sk' };
  }

  // 8. Events
  const eventsReply = await handleEventsQuery(cleanQ);
  if (eventsReply) {
    return { reply: eventsReply, category: 'events' };
  }

  // 9. Health & Emergency
  const healthReply = handleHealthAndEmergencyQuery(cleanQ);
  if (healthReply) {
    return { reply: healthReply, category: 'general' };
  }

  // 10. Transparency & Budget
  const transparencyReply = await handleTransparencyQuery(cleanQ);
  if (transparencyReply) {
    return { reply: transparencyReply, category: 'transparency' };
  }

  // 11. Greetings
  const greetingReply = handleGreetings(cleanQ);
  if (greetingReply) {
    return { reply: greetingReply, category: 'general' };
  }

  // 12. Out-of-Scope Fallback (Straight to the point)
  return {
    reply: handleOutOfScopeQuery(),
    category: 'out_of_scope',
  };
}
