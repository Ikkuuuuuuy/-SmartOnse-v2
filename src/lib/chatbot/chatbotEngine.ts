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
 * Strictly prevents leaking admin credentials, database internals, audit logs,
 * JWT tokens, and confidential resident personal identifiable information (PII).
 * Resistant to jailbreaks and prompt injection.
 */
function checkSecurityViolation(raw: string, q: string): string | null {
  // Pattern 1: Admin, System, Database & Attack Probes
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
      return (
        '🔒 **System Security & Compliance Notice**\n\n' +
        'Access to administrative credentials, audit logs, system authentication keys, source configuration, and database infrastructure is **strictly restricted** to authorized Barangay Onse IT administrators.\n\n' +
        'OnseBot operates under strict municipal cybersecurity protocols and cannot disclose confidential internal system data.'
      );
    }
  }

  // Pattern 2: Bulk Resident PII & Census Inquiries (DPA 2012 / RA 10173)
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
      return (
        '🛡️ **Data Privacy Protection Notice (R.A. 10173)**\n\n' +
        'Alinsunod sa **Data Privacy Act of 2012** at sa opisyal na Security Policy ng Barangay Onse:\n\n' +
        '• Ang mga personal na impormasyon ng mga residente (tulad ng buong tirahan, numero ng telepono, rekord sa RBI census, at pribadong tala) ay mahigpit na pinangangalagaan.\n' +
        '• Hindi pinahihintulutan ang OnseBot na maglabas ng impormasyon ng ibang mamamayan.\n\n' +
        'Para sa opisyal na mga transaksyon at pagpapatunay ng pagkakakilanlan, mangyaring magsadya nang personal sa **Barangay Onse Hall** dala ang inyong balidong ID.'
      );
    }
  }

  return null;
}

/**
 * 2. TICKET / REQUEST REFERENCE NUMBER LOOKUP
 * Allows citizens to check their submitted document request status using their tracking number (e.g. REQ-2026-0001).
 * Strictly exposes ONLY non-confidential public tracking status, never leaking PII.
 */
async function handleTrackingLookup(raw: string, q: string): Promise<string | null> {
  // Extract tracking number: REQ-XXXX or alphanumeric code (minimum 6 chars)
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

  // If a tracking code is present OR user is asking about tracking
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
        return (
          `🔍 **Request Tracking Lookup**\n\n` +
          `Hindi natagpuan sa aming talaan ang reference number na **${trackingCode}**.\n\n` +
          `Pakisuri po kung tama ang pagkaka-type ng inyong reference code (halimbawa: \`REQ-2026-XXXX\`). Maaari rin ninyong bisitahin ang aming [Track Request Page](/track) upang direktang mag-search gamit ang inyong registered account.`
        );
      }

      // Format status
      const statusLabels: Record<string, { label: string; icon: string; desc: string }> = {
        PENDING: {
          label: 'PENDING (Nasa Pagsusuri)',
          icon: '⏳',
          desc: 'Ang inyong kahilingan ay natanggap na at kasalukuyang sinusuri ng Barangay Records Desk.',
        },
        PROCESSING: {
          label: 'PROCESSING (Inihahanda)',
          icon: '⚙️',
          desc: 'Kasalukuyang inihahanda at bineberipika ang inyong dokumento para sa opisyal na lagda.',
        },
        READY_FOR_PICKUP: {
          label: 'READY FOR PICKUP (Handa nang Kunin)',
          icon: '📬',
          desc: 'Handa na po ang inyong dokumento! Maaari na itong kunin sa Barangay Onse Hall (Window 2).',
        },
        COMPLETED: {
          label: 'COMPLETED (Naibigay Na)',
          icon: '✅',
          desc: 'Matagumpay nang naibigay at nailabas ang dokumentong ito.',
        },
        REJECTED: {
          label: 'REJECTED (Kailangang Itama)',
          icon: '⚠️',
          desc: 'May kakulangan o kinakailangang itama sa inyong isinumiteng requirements.',
        },
      };

      const s = statusLabels[doc.status] || {
        label: doc.status,
        icon: '📄',
        desc: 'Nasa talaan ng Barangay Onse ang kahilingang ito.',
      };

      const dateStr = new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
      }).format(new Date(doc.createdAt));

      let pickupInfo = '';
      if (doc.pickupDate) {
        const pickupStr = new Intl.DateTimeFormat('en-PH', {
          dateStyle: 'medium',
        }).format(new Date(doc.pickupDate));
        pickupInfo = `\n• **Petsa ng Pickup:** ${pickupStr}`;
      }

      const remarksInfo = doc.remarks ? `\n• **Paalala / Tala:** ${doc.remarks}` : '';

      return (
        `📄 **Status ng Iyong Dokumento (Tracking)**\n\n` +
        `• **Reference Code:** \`${doc.trackingNumber}\`\n` +
        `• **Dokumento:** ${doc.documentType?.name || 'Barangay Document'}\n` +
        `• **Estado:** ${s.icon} **${s.label}**\n` +
        `• **Petsa ng Aplikasyon:** ${dateStr}` +
        pickupInfo +
        remarksInfo +
        `\n\n${s.desc}\n\n` +
        `👉 [Buksan ang Buong Tracking Details](/track?trackingNumber=${encodeURIComponent(doc.trackingNumber)})\n\n` +
        `*Paalala: Protektado ang inyong personal na datos alinsunod sa Data Privacy Act (R.A. 10173).*`
      );
    } catch (err) {
      console.error('Error looking up tracking:', err);
    }
  }

  // If user asked about tracking in general without code
  if (isAskingAboutTrack && (q.includes('paano') || q.includes('saan') || q.includes('how') || q.includes('where') || q.includes('link'))) {
    return (
      `🔍 **Paano I-track ang Iyong Request o Ticket:**\n\n` +
      `Maaari ninyong subaybayan ang estado ng inyong clearance o sertipiko sa dalawang paraan:\n\n` +
      `1. **Direktang i-type rito sa OnseBot** ang inyong reference code (halimbawa: \`REQ-2026-0001\`) at agad kong ibibigay ang live status nito.\n` +
      `2. **Pumunta sa Tracking Page:** [Buksan ang Track Request Page](/track) at ilagay ang inyong tracking number o mag-login para makita ang kumpletong kasaysayan ng inyong mga dokumento.`
    );
  }

  return null;
}

/**
 * 3. BARANGAY ONSE LOCATION, MAPS, HALL & OFFICE HOURS
 * Comprehensive information on Barangay Onse's geographical location,
 * street boundaries, landmarks, office hours, and contact details.
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
    q.includes('saan ang san juan') ||
    q.includes('saan ang opisina') ||
    q.includes('office hours') ||
    q.includes('oras ng bukas') ||
    q.includes('bukas ba ang barangay') ||
    q.includes('anong oras bukas') ||
    q.includes('tungkol sa onse') ||
    q.includes('history ng onse') ||
    q.includes('kasaysayan ng onse');

  if (!isAskingLocation) return null;

  return (
    `📍 **Lokasyon at Tanggapan ng Barangay Onse, San Juan City**\n\n` +
    `• **Opisyal na Address ng Barangay Hall:**\n` +
    `  3 J.V. Panganiban St., Barangay Onse, San Juan City, Metro Manila 1500\n\n` +
    `• **Mga Kalye at Hangganan (Landmarks):**\n` +
    `  Ang Barangay Onse ay isa sa mga sentrong barangay ng San Juan City. Matatagpuan ito sa pagitan ng **N. Domingo St.**, **J. Perez St.**, at **A. Luna St.** Malapit ito sa **LRT-2 J. Ruiz Station** (mga 5–7 minutong lakad lamang).\n\n` +
    `• **Paano Pumunta (Commute Directions):**\n` +
    `  - **Via LRT-2:** Bumaba sa **J. Ruiz Station**, maglakad patungong N. Domingo St., at lumiko sa J.V. Panganiban o J. Perez St.\n` +
    `  - **Via Jeepney:** Sumakay ng jeep biyaheng *San Juan – Cubao* o *San Juan – Kalentong*, bumaba malapit sa N. Domingo kanto ng J. Ruiz.\n\n` +
    `• **Oras ng Tanggapan (Office Hours):**\n` +
    `  Lunes hanggang Biyernes: **8:00 AM – 5:00 PM**\n` +
    `  *Sabado, Linggo at mga Piyesta Opisyal: SARADO*\n\n` +
    `• **Mga Numero ng Telepono:**\n` +
    `  - Desk Hotline: **(02) 8723-0011** / **(02) 8123-4567**\n` +
    `  - Mobile: **+63 917 888 0011**\n\n` +
    `🗺️ **Direktang Links:**\n` +
    `• [Tingnan ang Interactive Map at Emergency Contacts](/contact)\n` +
    `• [Basahin ang Kasaysayan ng Barangay Onse](/about)\n` +
    `• [Direksyon sa Google Maps](https://www.google.com/maps/dir/?api=1&destination=3+J+V+Panganiban,+Barangay+Onse,+San+Juan+City,+Metro+Manila+1500)`
  );
}

/**
 * 4. SYSTEM DIRECTORY & "WHERE IS THIS / WHERE IS THAT"
 * Provides direct clickable routes and guides citizens to exact pages.
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
    q.includes('menu') ||
    q.includes('sitemap') ||
    q.includes('portal link');

  if (!isAskingDirectory) return null;

  // Specific: Where to Register / Sign up
  if (q.includes('register') || q.includes('rehistro') || q.includes('sign up') || q.includes('account') || q.includes('sumali')) {
    return (
      `📝 **Saan Magpaparehistro (Citizen Registration):**\n\n` +
      `Maaari kayong gumawa ng opisyal na resident account gamit ang ating online registration portal:\n\n` +
      `👉 [Pumunta sa Citizen Registration Page](/register)\n\n` +
      `*Paalala:* Ihanda ang inyong balidong ID (PhilSys, Driver's License, Voter's ID, School ID, o Barangay ID) at inyong email address para sa verification OTP.`
    );
  }

  // Specific: Where to Login
  if (q.includes('login') || q.includes('log in') || q.includes('pumasok') || q.includes('mag-sign in') || q.includes('mag-login')) {
    return (
      `🔑 **Saan Mag-log In (Citizen & Staff Portal):**\n\n` +
      `Para sa mga rehistradong residente, barangay staff, at mga opisyal:\n\n` +
      `👉 [Mag-log In sa SmartOnse Portal](/login)\n\n` +
      `Maaari kayong mag-login gamit ang inyong registered email at password, o gamit ang **Continue with Google** kung nakatugma ang inyong Gmail.`
    );
  }

  // Specific: Where to Request Certificates
  if (q.includes('request') || q.includes('kuha') || q.includes('clearance') || q.includes('indigency') || q.includes('residency') || q.includes('dokumento')) {
    return (
      `📄 **Saan Mag-a-apply ng Dokumento at Clearances:**\n\n` +
      `Para magsumite ng online request para sa Barangay Clearance, Certificate of Indigency, o Residency:\n\n` +
      `👉 [Pumunta sa Online Document Request Portal](/portal/request)\n\n` +
      `Maaari rin ninyong tingnan muna ang mga requirements at bayarin dito: [Talaan ng mga Serbisyo](/services).`
    );
  }

  // Specific: Where to Track
  if (q.includes('track') || q.includes('status') || q.includes('ticket') || q.includes('reference')) {
    return (
      `🔍 **Saan Ma-t-track ang Aplikasyon:**\n\n` +
      `👉 [Pumunta sa Request Tracking Portal](/track)\n\n` +
      `I-type lamang ang inyong 12-character Reference Number (halimbawa: \`REQ-2026-0001\`) upang makita ang kasalukuyang estado ng inyong dokumento.`
    );
  }

  // Specific: Where to Verify Certificate QR
  if (q.includes('verify') || q.includes('beripika') || q.includes('qr') || q.includes('authenticity')) {
    return (
      `🛡️ **Saan I-ve-verify ang Barangay Certificate:**\n\n` +
      `Para malaman kung lehitimo at orihinal ang isang inisyung sertipiko ng Barangay Onse:\n\n` +
      `👉 [Pumunta sa Certificate Verification Page](/verify)\n\n` +
      `Maaari ninyong i-scan ang QR Code o i-type ang tracking number na nakasulat sa dokumento.`
    );
  }

  // Specific: Where to View Officials
  if (q.includes('opisyal') || q.includes('official') || q.includes('kapitan') || q.includes('kagawad') || q.includes('council')) {
    return (
      `🏛️ **Saan Makikita ang mga Opisyal ng Barangay Onse:**\n\n` +
      `👉 [Tingnan ang Direktoryo ng mga Opisyal](/officials)\n\n` +
      `Makikita rito ang Punong Barangay, Sangguniang Barangay Councilors (Kagawad), at ang pamunuan ng Sangguniang Kabataan (SK).`
    );
  }

  // General Directory Sitemap
  return (
    `🗺️ **Direktoryo ng mga Pahina sa SmartOnse Portal:**\n\n` +
    `Narito ang mga direktang link sa bawat serbisyo ng ating portal:\n\n` +
    `• 📄 **Mag-request ng Dokumento:** [Online Document Request](/portal/request)\n` +
    `• 🔍 **Subaybayan ang Request (Track):** [Track Status](/track)\n` +
    `• 🛡️ **I-verify ang Certificate QR:** [Verify Authenticity](/verify)\n` +
    `• 📑 **Mga Serbisyo at Bayarin:** [Services & Clearances](/services)\n` +
    `• 🏛️ **Mga Opisyal ng Barangay:** [Officials Directory](/officials)\n` +
    `• 🏀 **Mga Programa ng Kabataan:** [SK Programs & Projects](/sk-programs)\n` +
    `• 📅 **Kalendaryo ng Kaganapan:** [Community Events](/events)\n` +
    `• 📊 **Transparency & Badyet:** [Transparency Board](/transparency)\n` +
    `• 🚨 **Emergency Hotlines at Lokasyon:** [Contact & Map](/contact)\n` +
    `• 📝 **Magrehistro bilang Residente:** [Resident Registration](/register)\n` +
    `• 🔑 **Mag-log In sa Account:** [Portal Login](/login)\n` +
    `• 📖 **Kasaysayan ng Barangay Onse:** [About Barangay Onse](/about)`
  );
}

/**
 * 5. LIVE OFFICIALS ENGINE
 * Answers queries about Barangay Captain, SK Chairperson, Kagawads, and Committees
 * Handles Tagalog/English/Slang variations (e.g. "sno kap", "kapitan alba", "sk permato", "opisyal").
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
    q.includes('sk leader') ||
    q.includes('kagawad') ||
    q.includes('councilor') ||
    q.includes('konsehal') ||
    q.includes('treasurer') ||
    q.includes('ingat-yaman') ||
    q.includes('secretary') ||
    q.includes('kalihim') ||
    q.includes('sino ang') ||
    q.includes('sno ang') ||
    q.includes('cno ang') ||
    q.includes('who is the') ||
    q.includes('who is our') ||
    q.includes('alba') ||
    q.includes('permato') ||
    q.includes('florano') ||
    q.includes('casao') ||
    q.includes('lorbes') ||
    q.includes('daradal') ||
    q.includes('deniega') ||
    q.includes('zamora') ||
    q.includes('borjal');

  if (!isAskingOfficials) return null;

  try {
    const officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });

    // Specific: SK Chairperson
    if (
      (q.includes('sk') && (q.includes('chair') || q.includes('leader') || q.includes('head') || q.includes('permato'))) ||
      q.includes('sk chairperson') ||
      q.includes('sk chairman') ||
      q.includes('kabataan leader')
    ) {
      const skChair = officials.find(
        (o) =>
          o.position.toLowerCase().includes('sk chairperson') ||
          o.position.toLowerCase().includes('sk chairman') ||
          o.name.toLowerCase().includes('permato')
      );

      const name = skChair?.name || 'Hon. John Michael D. Permato';
      const term = skChair?.term || '2023 - 2026';
      const committee = skChair?.committee || 'Youth Leadership, Sports & Development';

      return (
        `🏅 **SK Chairperson ng Barangay Onse**\n\n` +
        `• **Pangalan:** ${name}\n` +
        `• **Posisyon:** SK Chairperson (Sangguniang Kabataan)\n` +
        `• **Komite:** ${committee}\n` +
        `• **Termino:** ${term}\n\n` +
        `Maaari ninyong tingnan ang mga aktibidad at youth grants sa ating [SK Programs Page](/sk-programs).`
      );
    }

    // Specific: Barangay Captain / Chairman
    if (
      q.includes('captain') ||
      q.includes('kapitan') ||
      q.includes('kap ') ||
      q.includes('punong barangay') ||
      q.includes('alba') ||
      (q.includes('chairman') && !q.includes('sk'))
    ) {
      const captain = officials.find(
        (o) =>
          o.position.toLowerCase().includes('captain') ||
          o.position.toLowerCase().includes('chairman') ||
          o.position.toLowerCase().includes('punong') ||
          o.name.toLowerCase().includes('alba')
      );

      const capName = captain?.name || 'Hon. Roberto B. Alba';
      const term = captain?.term || '2023 - 2026';
      const comm = captain?.committee || 'Executive & Peace and Order';

      return (
        `🏛️ **Punong Barangay (Barangay Chairman)**\n\n` +
        `• **Pangalan:** ${capName}\n` +
        `• **Posisyon:** Punong Barangay / Chairman\n` +
        `• **Komite:** ${comm}\n` +
        `• **Termino:** ${term}\n\n` +
        `**Oras ng Tanggapan:** Lunes hanggang Biyernes, 8:00 AM – 5:00 PM sa Barangay Onse Hall.\n` +
        `👉 [Tingnan ang Kumpletong Direktoryo ng mga Opisyal](/officials)`
      );
    }

    // Specific: Barangay Kagawads / Councilors
    if (q.includes('kagawad') || q.includes('councilor') || q.includes('konsehal')) {
      const kagawads = officials.filter(
        (o) => o.position.toLowerCase().includes('kagawad') && !o.position.toLowerCase().includes('sk')
      );

      if (kagawads.length > 0) {
        const list = kagawads
          .map((k) => `• **${k.name}** – ${k.committee || 'Barangay Affairs'}`)
          .join('\n');

        return (
          `🏛️ **Mga Kagawad ng Barangay Onse (Sangguniang Barangay):**\n\n${list}\n\n` +
          `Termino: ${kagawads[0]?.term || '2023 - 2026'}\n\n` +
          `👉 [Tingnan ang Kumpletong Talaan ng mga Opisyal](/officials)`
        );
      }
    }

    // Specific: SK Councilors
    if (q.includes('sk') && (q.includes('kagawad') || q.includes('council') || q.includes('treasurer') || q.includes('secretary'))) {
      const skMembers = officials.filter((o) => o.position.toLowerCase().includes('sk'));
      if (skMembers.length > 0) {
        const list = skMembers
          .map((m) => `• **${m.name}** – ${m.position} (${m.committee || 'Youth Affairs'})`)
          .join('\n');

        return (
          `🌟 **Sangguniang Kabataan (SK) Council ng Barangay Onse:**\n\n${list}\n\n` +
          `👉 [Tingnan ang mga Proyekto at Youth Initiatives](/sk-programs)`
        );
      }
    }

    // General Officials List
    if (officials.length > 0) {
      const topLeaders = officials.slice(0, 8);
      const list = topLeaders.map((o) => `• **${o.name}** – ${o.position}`).join('\n');
      return (
        `🏛️ **Direktoryo ng mga Opisyal ng Barangay Onse (2023 - 2026):**\n\n${list}\n\n` +
        `Maaari ninyong makita ang kumpletong 18 miyembro ng Konseho at SK sa [Pahina ng mga Opisyal](/officials).`
      );
    }

    return (
      `🏛️ Ang pamunuan ng Barangay Onse ay pinangungunahan ni **Hon. Roberto B. Alba** (Punong Barangay) at **Hon. John Michael D. Permato** (SK Chairperson).\n\n` +
      `👉 [Tingnan ang Lahat ng Opisyal](/officials)`
    );
  } catch (err) {
    console.error('Error fetching officials:', err);
    return null;
  }
}

/**
 * 6. SERVICES, CLEARANCES, REQUIREMENTS & FEES
 * Handles Tagalog/English/Taglish queries about requirements, costs, processing times, and procedures.
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
    q.includes('kelangan') ||
    q.includes('kailangan') ||
    q.includes('magkano') ||
    q.includes('hm') ||
    q.includes('how much') ||
    q.includes('bayad') ||
    q.includes('presyo') ||
    q.includes('fee') ||
    q.includes('fees') ||
    q.includes('libre ba') ||
    q.includes('free ba') ||
    q.includes('libreng') ||
    q.includes('serbisyo') ||
    q.includes('services') ||
    q.includes('paano kumuha') ||
    q.includes('pano kumuha') ||
    q.includes('paano mag-request') ||
    q.includes('pano mag-request');

  if (!isAskingService) return null;

  try {
    const docTypes = await prisma.documentType.findMany({
      where: { isActive: true },
    });

    // Specific: Barangay Clearance
    if (q.includes('clearance') && !q.includes('business')) {
      const doc = docTypes.find((d) => d.code === 'BRGY_CLEARANCE');
      return (
        `📄 **Barangay Clearance Application**\n\n` +
        `• **Bayad (Fee):** ₱${doc?.fee.toFixed(2) || '50.00'}\n` +
        `  *(Paalala: 100% LIBRE para sa mga first-time jobseekers alinsunod sa R.A. 11261)*\n` +
        `• **Tagal ng Pagproseso:** 1 Business Day (24 Oras)\n` +
        `• **Mga Kinakailangan (Requirements):**\n` +
        `  1. Isang (1) Balidong Government ID o Student ID\n` +
        `  2. Patunay ng Tirahan sa Barangay Onse (Proof of Residency / Utility Bill)\n` +
        `  3. Cedula (Community Tax Certificate)\n\n` +
        `👉 [Mag-apply ng Barangay Clearance Online](/portal/request)`
      );
    }

    // Specific: Certificate of Indigency
    if (q.includes('indigency')) {
      return (
        `📑 **Certificate of Indigency (Katibayan ng Kawalan ng Sapat na Kita)**\n\n` +
        `• **Bayad (Fee):** **100% LIBRE (Walang Bayad)**\n` +
        `• **Tagal ng Pagproseso:** Same Day (1 Business Day)\n` +
        `• **Gamit:** Tulong medikal (hospital/PCSO), educational assistance/scholarship, libreng serbisyong legal (PAO), at financial aid.\n` +
        `• **Mga Kinakailangan:**\n` +
        `  1. Balidong ID ng aplikante\n` +
        `  2. Patunay ng paninirahan sa Barangay Onse\n` +
        `  3. Katibayan ng layunin (hal. Hospital bill, School endorsement, o Referral)\n\n` +
        `👉 [Mag-apply ng Indigency Certificate Online](/portal/request)`
      );
    }

    // Specific: Certificate of Residency
    if (q.includes('residency') || q.includes('paninirahan')) {
      const doc = docTypes.find((d) => d.code === 'CERT_RESIDENCY');
      return (
        `🏠 **Certificate of Residency (Katunayan ng Paninirahan)**\n\n` +
        `• **Bayad (Fee):** ₱${doc?.fee.toFixed(2) || '30.00'}\n` +
        `• **Tagal ng Pagproseso:** 1 Business Day\n` +
        `• **Mga Kinakailangan:**\n` +
        `  1. Balidong ID na may address sa Barangay Onse o Lease Contract para sa mga umuupa\n` +
        `  2. Minimum na 6 na buwang paninirahan sa barangay\n\n` +
        `👉 [Mag-apply ng Certificate of Residency Online](/portal/request)`
      );
    }

    // Specific: First-Time Jobseeker (R.A. 11261)
    if (q.includes('jobseeker') || q.includes('11261') || q.includes('naghahanap ng trabaho')) {
      return (
        `💼 **First-Time Jobseeker Certificate (Republic Act No. 11261)**\n\n` +
        `• **Bayad (Fee):** **100% LIBRE** sa ilalim ng batas para sa mga bagong naghahanap ng trabaho!\n` +
        `• **Benepisyo:** Libreng Barangay Clearance, Police Clearance, NBI Clearance, at Medical Certificate para sa unang trabaho.\n` +
        `• **Mga Kinakailangan:**\n` +
        `  1. Nilagdaang Barangay Oath of Undertaking\n` +
        `  2. Balidong School ID o PSA Birth Certificate\n` +
        `  3. Patunay ng paninirahan sa Barangay Onse\n\n` +
        `👉 [Mag-request ng First-Time Jobseeker Certificate](/portal/request)`
      );
    }

    // Specific: Barangay Blotter & Lupong Tagapamayapa
    if (q.includes('blotter') || q.includes('reklamo') || q.includes('sumbong') || q.includes('lupon') || q.includes('away')) {
      return (
        `⚖️ **Barangay Blotter at Pagsasampa ng Reklamo (Lupong Tagapamayapa):**\n\n` +
        `• **Saan Isasampa:** Personal na magsadya sa Barangay Onse Hall (Lupon & Tanod Desk)\n` +
        `• **Bayad:** Walang bayad ang pag-file ng sumbong sa Lupon\n` +
        `• **Proseso:** Pag-iisyu ng patawag (Mediation & Conciliation) sa ilalim ng Katarungang Pambarangay Law.\n\n` +
        `Para sa agarang insidente o kaguluhan, tumawag sa Onse Patrol Desk: **(02) 8723-0011**.`
      );
    }

    // General Services Overview
    if (docTypes.length > 0) {
      const list = docTypes
        .map((d) => {
          const feeStr = d.fee === 0 ? 'LIBRE' : `₱${d.fee.toFixed(2)}`;
          return `• **${d.name}** – ${feeStr} (${d.processingDays} araw)`;
        })
        .join('\n');

      return (
        `📑 **Mga Available na Clearances at Sertipiko sa Barangay Onse:**\n\n${list}\n\n` +
        `Maaari kayong mag-apply online gamit ang inyong account:\n` +
        `👉 [Mag-apply sa Online Services Portal](/portal/request)\n` +
        `👉 [Tingnan ang Kumpletong Talaan ng Serbisyo at Gabay](/services)`
      );
    }

    return null;
  } catch (err) {
    console.error('Error fetching services:', err);
    return null;
  }
}

/**
 * 7. LIVE SK PROGRAMS & YOUTH INITIATIVES
 */
async function handleSkQuery(q: string): Promise<string | null> {
  const isAskingSk =
    q.includes('sk program') ||
    q.includes('sk project') ||
    q.includes('youth program') ||
    q.includes('scholarship') ||
    q.includes('sportsfest') ||
    q.includes('paliga') ||
    q.includes('liga') ||
    q.includes('basketball') ||
    q.includes('kabataan') ||
    q.includes('sk budget');

  if (!isAskingSk) return null;

  try {
    const programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (!programs.length) {
      return (
        `🏀 **Sangguniang Kabataan (SK) ng Barangay Onse**\n\n` +
        `Kasalukuyang inihahanda ng SK Council sa pamumuno ni **Hon. John Michael D. Permato** ang mga bagong youth initiatives at sports leagues para sa taon.\n\n` +
        `👉 [Tingnan ang SK Programs Portal](/sk-programs)`
      );
    }

    const list = programs
      .map((p) => {
        const budgetStr = p.budget > 0 ? `₱${p.budget.toLocaleString()}` : 'Allocated';
        return (
          `🏀 **${p.title}**\n` +
          `• **Kategorya:** ${p.category} | **Status:** ${p.status}\n` +
          `• **Iskedyul:** ${p.schedule}\n` +
          `• **Para Kanino:** ${p.targetAudience}\n` +
          `• **Layunin:** ${p.objective}`
        );
      })
      .join('\n\n');

    return (
      `🌟 **Mga Aktibong Programa ng SK Barangay Onse:**\n\n${list}\n\n` +
      `Para sa pagpapatala o mga youth workshops, bisitahin ang [SK Programs & Community Wall](/sk-programs).`
    );
  } catch (err) {
    console.error('Error fetching SK programs:', err);
    return null;
  }
}

/**
 * 8. LIVE EVENTS & COMMUNITY ACTIVITIES
 */
async function handleEventsQuery(q: string): Promise<string | null> {
  const isAskingEvents =
    q.includes('event') ||
    q.includes('events') ||
    q.includes('kaganapan') ||
    q.includes('aktibidad') ||
    q.includes('activity') ||
    q.includes('activities') ||
    q.includes('schedule') ||
    q.includes('calendar') ||
    q.includes('anong meron') ||
    q.includes('kailan may') ||
    q.includes('kelan may') ||
    q.includes('january') ||
    q.includes('february') ||
    q.includes('march') ||
    q.includes('april') ||
    q.includes('may') ||
    q.includes('june') ||
    q.includes('july') ||
    q.includes('august') ||
    q.includes('september') ||
    q.includes('october') ||
    q.includes('november') ||
    q.includes('december');

  if (!isAskingEvents) return null;

  try {
    const allEvents = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
    });

    if (!allEvents.length) {
      return (
        `📅 Sa kasalukuyan ay walang nakatalagang pampublikong aktibidad sa ating kalendaryo.\n\n` +
        `Palagiang bisitahin ang [Community Events Page](/events) para sa mga bagong anunsyo!`
      );
    }

    const upcomingList = allEvents.slice(0, 3).map((ev) => {
      const formatted = new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
      }).format(new Date(ev.eventDate));

      return `📅 **${ev.title}**\n• Petsa: ${formatted} | 📍 Lokasyon: ${ev.location}\n• Detalye: ${ev.description}`;
    }).join('\n\n');

    return (
      `📢 **Mga Kaganapan at Aktibidad sa Barangay Onse:**\n\n${upcomingList}\n\n` +
      `👉 [Tingnan ang Kumpletong Kalendaryo ng mga Kaganapan](/events)`
    );
  } catch (err) {
    console.error('Error fetching events:', err);
    return null;
  }
}

/**
 * 9. HEALTH CENTER & EMERGENCY HOTLINES
 */
function handleHealthAndEmergencyQuery(q: string): string | null {
  if (
    q.includes('health') ||
    q.includes('center') ||
    q.includes('klinika') ||
    q.includes('clinic') ||
    q.includes('doktor') ||
    q.includes('doctor') ||
    q.includes('bakuna') ||
    q.includes('vaccine') ||
    q.includes('gamot') ||
    q.includes('turok') ||
    q.includes('prenatal') ||
    q.includes('dentista') ||
    q.includes('dental')
  ) {
    return (
      `🏥 **Mga Serbisyo sa Barangay Onse Health Center:**\n\n` +
      `• **Oras ng Konsultasyon:** Lunes hanggang Biyernes, 8:00 AM – 5:00 PM\n` +
      `• **Libreng Serbisyo:**\n` +
      `  - Regular na check-up ng bata at matatanda\n` +
      `  - Bakuna para sa sanggol at mga bata (Immunization)\n` +
      `  - Prenatal care para sa mga nagdadalang-tao\n` +
      `  - Pamamahagi ng maintenance medicines para sa Senior Citizens at Hypertensive/Diabetic\n` +
      `  - Dental checkup\n\n` +
      `• **Lokasyon:** Katabi ng Barangay Onse Hall, J. Perez St.\n` +
      `👉 [Tingnan ang mga detalye ng Health Services](/services)`
    );
  }

  if (
    q.includes('emergency') ||
    q.includes('hotline') ||
    q.includes('saklolo') ||
    q.includes('sunog') ||
    q.includes('pulis') ||
    q.includes('police') ||
    q.includes('fire') ||
    q.includes('ambulansya') ||
    q.includes('rescue') ||
    q.includes('tulong')
  ) {
    return (
      `🚨 **Mga Emergency Hotlines (Barangay Onse at San Juan City):**\n\n` +
      `• **Barangay Onse Patrol Desk:** (02) 8723-0011 / (02) 8123-4567\n` +
      `• **San Juan Rescue (CDRRMO - 24/7):** (02) 8722-9837\n` +
      `• **San Juan Police Station:** (02) 8724-2509\n` +
      `• **San Juan Fire Station (BFP):** (02) 8723-9371\n` +
      `• **National Emergency Hotline:** **911**\n\n` +
      `Naka-standby ang ating barangay tanod at rescue team 24/7 para sa inyong kaligtasan.\n` +
      `👉 [Tingnan ang Kumpletong Listahan ng Emergency Numbers](/contact)`
    );
  }

  return null;
}

/**
 * 10. TRANSPARENCY & BUDGET INQUIRIES
 */
async function handleTransparencyQuery(q: string): Promise<string | null> {
  const isAskingTransparency =
    q.includes('transparency') ||
    q.includes('budget') ||
    q.includes('badyet') ||
    q.includes('pondo') ||
    q.includes('gastos') ||
    q.includes('financial') ||
    q.includes('procurement') ||
    q.includes('ira') ||
    q.includes('allotment') ||
    q.includes('full disclosure');

  if (!isAskingTransparency) return null;

  try {
    const docs = await prisma.transparencyDocument.findMany({
      orderBy: { publishedDate: 'desc' },
      take: 4,
    });

    const list = docs.length
      ? docs.map((d) => `• **${d.title}** (${d.year}${d.quarter ? ` - ${d.quarter}` : ''}) [${d.fileSize}]`).join('\n')
      : '• Annual Barangay Budget\n• Quarterly Financial Performance\n• Annual Procurement Plan';

    return (
      `📊 **Barangay Onse Full Disclosure & Transparency Board:**\n\n` +
      `Alinsunod sa DILG Full Disclosure Policy, bukas sa publiko ang lahat ng ulat-pananalapi at alokasyon ng pondo ng barangay:\n\n` +
      `${list}\n\n` +
      `👉 [Buksan ang Transparency Board para i-download ang mga PDF](/transparency)`
    );
  } catch (err) {
    console.error('Error fetching transparency:', err);
    return null;
  }
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
    return (
      `👋 **Mabuhay! Ako si OnseBot**, ang opisyal na AI Assistant ng **Barangay Onse, San Juan City**.\n\n` +
      `Maaari ninyo akong tanungin sa Tagalog o English tungkol sa:\n` +
      `• 📄 **Sertipiko at Clearances** (requirements, bayad, paano mag-apply)\n` +
      `• 🔍 **I-track ang Request** (i-type ang inyong Reference Code hal. \`REQ-2026-0001\`)\n` +
      `• 📍 **Lokasyon ng Barangay Onse** at oras ng tanggapan ng Barangay Hall\n` +
      `• 🏛️ **Mga Opisyal ng Barangay at SK**\n` +
      `• 🏀 **SK Youth Programs at Paliga**\n` +
      `• 🚨 **Emergency Hotlines at Health Center**\n\n` +
      `Ano po ang maitutulong ko sa inyo ngayong araw?`
    );
  }

  if (q.includes('salamat') || q.includes('thank') || q.includes('ty') || q.includes('maraming salamat')) {
    return `Walang anuman po! Ikinagagalak ng Barangay Onse na mapagsilbihan kayo. Huwag mag-atubiling magtanong muli kung may kailangan kayo! 🇵🇭`;
  }

  return null;
}

/**
 * 12. STRICT OUT-OF-SCOPE FILTER
 * If the user asks something completely outside Barangay Onse, local government,
 * certificates/clearances, community events, health center, or portal navigation,
 * politely inform them that the question is outside OnseBot's scope.
 */
function handleOutOfScopeQuery(raw: string, q: string): string {
  return (
    `⚠️ **Paumanhin po (Out of Scope Notice):**\n\n` +
    `Bilang opisyal na virtual assistant ng **Barangay Onse, San Juan City**, ang saklaw lamang po ng aking kakayahan at tungkulin ay magbigay ng impormasyon patungkol sa:\n\n` +
    `1. **Mga Serbisyo at Clearances** (Barangay Clearance, Indigency, Residency, Jobseeker)\n` +
    `2. **Pagsusuri ng Reference Numbers / Status** (halimbawa: \`REQ-2026-0001\`)\n` +
    `3. **Lokasyon, Oras ng Tanggapan, at Direksyon** patungong Barangay Onse Hall\n` +
    `4. **Mga Opisyal ng Barangay at Sangguniang Kabataan (SK)**\n` +
    `5. **Community Events, Health Center, at Emergency Hotlines**\n` +
    `6. **Paggabay sa Paggamit ng SmartOnse E-Governance Portal**\n\n` +
    `Hindi po sakop ng aking kaalaman o sistema ang ibang mga pangkalahatang paksa na labas sa ating komunidad at pamahalaan.\n\n` +
    `👉 Kung may tanong po kayo tungkol sa ating barangay, maaari kayong sumangguni sa ating [Talaan ng mga Serbisyo](/services) o magsadya sa [Barangay Hall](/contact). Maraming salamat po!`
  );
}

/**
 * MAIN CHATBOT PIPELINE
 */
export async function processChatbotMessage(rawMessage: string): Promise<ChatbotResponse> {
  const cleanQ = cleanQuery(rawMessage);

  if (!cleanQ) {
    return {
      reply: 'Mabuhay! Magandang araw. Ano po ang maitutulong ng OnseBot patungkol sa mga serbisyo at programa ng Barangay Onse?',
      category: 'general',
    };
  }

  // 1. Security & Anti-Exploit Check (Highest Priority Guardrail)
  const securityWarning = checkSecurityViolation(rawMessage, cleanQ);
  if (securityWarning) {
    return { reply: securityWarning, category: 'security' };
  }

  // 2. Ticket / Reference Number Lookup (e.g. REQ-2026-0001)
  const trackingReply = await handleTrackingLookup(rawMessage, cleanQ);
  if (trackingReply) {
    return { reply: trackingReply, category: 'tracking' };
  }

  // 3. Barangay Onse Location & Hall Directions ("Where is barangay onse located?")
  const locationReply = handleLocationAndAboutQuery(cleanQ);
  if (locationReply) {
    return { reply: locationReply, category: 'location' };
  }

  // 4. Directory & Page Navigation ("Where is this, where is that")
  const directoryReply = handleDirectoryAndLinksQuery(cleanQ);
  if (directoryReply) {
    return { reply: directoryReply, category: 'directory' };
  }

  // 5. Barangay & SK Officials
  const officialsReply = await handleOfficialsQuery(cleanQ);
  if (officialsReply) {
    return { reply: officialsReply, category: 'officials' };
  }

  // 6. Services, Clearances, Fees & Requirements
  const servicesReply = await handleServicesQuery(cleanQ);
  if (servicesReply) {
    return { reply: servicesReply, category: 'services' };
  }

  // 7. SK Programs & Youth Projects
  const skReply = await handleSkQuery(cleanQ);
  if (skReply) {
    return { reply: skReply, category: 'sk' };
  }

  // 8. Community Calendar & Events
  const eventsReply = await handleEventsQuery(cleanQ);
  if (eventsReply) {
    return { reply: eventsReply, category: 'events' };
  }

  // 9. Health Center & Emergency Hotlines
  const healthReply = handleHealthAndEmergencyQuery(cleanQ);
  if (healthReply) {
    return { reply: healthReply, category: 'general' };
  }

  // 10. Transparency & Budget Inquiries
  const transparencyReply = await handleTransparencyQuery(cleanQ);
  if (transparencyReply) {
    return { reply: transparencyReply, category: 'transparency' };
  }

  // 11. Greetings & Casual Interaction
  const greetingReply = handleGreetings(cleanQ);
  if (greetingReply) {
    return { reply: greetingReply, category: 'general' };
  }

  // 12. Out-of-Scope Fallback (Strict boundary enforcement)
  return {
    reply: handleOutOfScopeQuery(rawMessage, cleanQ),
    category: 'out_of_scope',
  };
}
