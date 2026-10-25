import prisma from '@/lib/prisma';

export interface ChatbotResponse {
  reply: string;
  category?: 'security' | 'officials' | 'events' | 'services' | 'sk' | 'transparency' | 'general';
}

/**
 * Normalizes input text for keyword and intent matching
 */
function cleanQuery(text: string): string {
  return (text || '').toLowerCase().trim();
}

/**
 * 1. PRIVACY & SECURITY GUARDRAIL
 * Detects unauthorized requests for resident PII, census records,
 * internal admin credentials, and database secrets.
 */
function checkSecurityViolation(q: string): string | null {
  // Pattern 1: Resident PII & Census Inquiries
  const piiPatterns = [
    /\b(who lives|who live|where does .* live|address of|residence of)\b/i,
    /\b(resident list|list of residents|inhabitant list|list of inhabitants)\b/i,
    /\b(phone number of|contact number of|mobile number of|email of resident)\b/i,
    /\b(voter list|registered voters list|list of voters|precinct number of)\b/i,
    /\b(pwd list|list of pwd|senior citizen list|list of seniors|solo parent list)\b/i,
    /\b(4ps beneficiary list|list of 4ps|monthly income of|salary of resident)\b/i,
    /\b(civil status of|blood type of|religion of|birth date of|birthday of)\b/i,
    /\b(rbi number|rbi record|census record|inhabitant record)\b/i,
    /\b(who requested|clearance applicant|request tracking of|patient record|medical symptom)\b/i,
  ];

  // Pattern 2: Admin Portal, System Credentials & Database Probes
  const adminPatterns = [
    /\b(admin password|admin pass|system password|super admin password)\b/i,
    /\b(admin login|admin portal credentials|admin account credentials)\b/i,
    /\b(database credentials|db password|sql injection|drop table|select \* from)\b/i,
    /\b(prisma schema|env file|secret key|jwt secret|api key|smtp_pass)\b/i,
    /\b(audit log|audit logs|system audit|who logged in|failed logins)\b/i,
    /\b(password hash|bcrypt hash|reset token)\b/i,
  ];

  for (const pattern of piiPatterns) {
    if (pattern.test(q)) {
      return (
        '🛡️ **Data Privacy Protection Notice**\n\n' +
        'In strict compliance with the **Data Privacy Act of 2012 (Republic Act No. 10173)** and Barangay Onse Security Policy:\n\n' +
        '• Resident profiles, RBI census records, residential addresses, and personal contact numbers are strictly confidential.\n' +
        '• The chatbot cannot search or disclose any individual resident data.\n\n' +
        'For official and verified citizen records, please visit the **Barangay Onse Hall** in person with a valid government ID.'
      );
    }
  }

  for (const pattern of adminPatterns) {
    if (pattern.test(q)) {
      return (
        '🔒 **System Security Notice**\n\n' +
        'Access to administrative credentials, audit logs, authentication keys, and database systems is strictly restricted to authorized barangay personnel.\n\n' +
        'This virtual desk is restricted to public civic inquiries and community services.'
      );
    }
  }

  return null;
}

/**
 * 2. LIVE OFFICIALS ENGINE
 * Answers queries about Barangay Captain, SK Chairperson, Kagawads, and Committees
 */
async function handleOfficialsQuery(q: string): Promise<string | null> {
  const isAskingOfficials =
    q.includes('official') ||
    q.includes('officials') ||
    q.includes('captain') ||
    q.includes('kapitan') ||
    q.includes('punong barangay') ||
    q.includes('sk chairperson') ||
    q.includes('sk chairman') ||
    q.includes('sk leader') ||
    q.includes('kagawad') ||
    q.includes('councilor') ||
    q.includes('treasurer') ||
    q.includes('secretary') ||
    q.includes('who is the') ||
    q.includes('sino ang') ||
    q.includes('committee on') ||
    q.includes('peace and order') ||
    q.includes('public works');

  if (!isAskingOfficials) return null;

  try {
    const officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });

    if (!officials.length) {
      return 'The official directory of Barangay Onse is currently being updated by the administration.';
    }

    // Specific: SK Chairperson
    if (
      (q.includes('sk') && (q.includes('chair') || q.includes('leader') || q.includes('head') || q.includes('president'))) ||
      q.includes('sk chairperson') ||
      q.includes('sk chairman')
    ) {
      const skChair = officials.find(
        (o) =>
          o.position.toLowerCase().includes('sk chairperson') ||
          o.position.toLowerCase().includes('sk chairman')
      );

      if (skChair) {
        return (
          `🏅 **SK Chairperson of Barangay Onse**\n\n` +
          `• **Name:** ${skChair.name}\n` +
          `• **Position:** ${skChair.position}\n` +
          `• **Committee:** ${skChair.committee || 'Youth Leadership & Sports'}\n` +
          `• **Term:** ${skChair.term}\n\n` +
          `You can view our complete youth initiatives under **SK Programs** on our official website.`
        );
      }
    }

    // Specific: Barangay Captain / Chairman
    if (
      q.includes('captain') ||
      q.includes('kapitan') ||
      q.includes('punong barangay') ||
      (q.includes('chairman') && !q.includes('sk'))
    ) {
      const captain = officials.find(
        (o) =>
          o.position.toLowerCase().includes('captain') ||
          o.position.toLowerCase().includes('chairman') ||
          o.position.toLowerCase().includes('punong')
      );

      if (captain) {
        return (
          `🏛️ **Punong Barangay (Barangay Chairman)**\n\n` +
          `• **Name:** ${captain.name}\n` +
          `• **Position:** ${captain.position}\n` +
          `• **Committee:** ${captain.committee || 'Executive & Peace and Order'}\n` +
          `• **Term:** ${captain.term}\n\n` +
          `Office Hours: Monday to Friday, 8:00 AM – 5:00 PM at Barangay Onse Hall.`
        );
      }
    }

    // Specific: SK Councilors / Kagawad
    if (q.includes('sk') && (q.includes('kagawad') || q.includes('member') || q.includes('council') || q.includes('officials'))) {
      const skMembers = officials.filter((o) => o.position.toLowerCase().includes('sk'));
      if (skMembers.length > 0) {
        const list = skMembers
          .map((m) => `• **${m.name}** – ${m.position} (${m.committee || 'Youth Affairs'})`)
          .join('\n');

        return `🌟 **Sangguniang Kabataan (SK) Council of Barangay Onse (Term ${skMembers[0]?.term || '2023-2026'}):**\n\n${list}`;
      }
    }

    // Specific: Barangay Kagawads / Councilors
    if (q.includes('kagawad') || q.includes('councilor') || q.includes('konsehal')) {
      const kagawads = officials.filter((o) =>
        o.position.toLowerCase().includes('kagawad') && !o.position.toLowerCase().includes('sk')
      );
      if (kagawads.length > 0) {
        const list = kagawads
          .map((k) => `• **${k.name}** – ${k.committee || 'Barangay Affairs'}`)
          .join('\n');

        return `🏛️ **Barangay Onse Councilors (Kagawad):**\n\n${list}\n\nTerm: ${kagawads[0]?.term || '2023-2026'}`;
      }
    }

    // Search by official name or committee
    const matchedOfficial = officials.find((o) => {
      const nameParts = o.name.toLowerCase().replace(/hon\.|\bjr\.|\bsr\./g, '').trim().split(/\s+/);
      const queryWords = q.split(/\s+/);
      const matchesName = nameParts.some((part) => part.length > 3 && q.includes(part));
      const matchesCommittee = o.committee && q.includes(o.committee.toLowerCase());
      return matchesName || matchesCommittee;
    });

    if (matchedOfficial) {
      return (
        `👤 **Barangay Official Information**\n\n` +
        `• **Name:** ${matchedOfficial.name}\n` +
        `• **Position:** ${matchedOfficial.position}\n` +
        `• **Committee:** ${matchedOfficial.committee || 'General Public Service'}\n` +
        `• **Term:** ${matchedOfficial.term}`
      );
    }

    // General list of officials
    const leaders = officials.slice(0, 8);
    const list = leaders
      .map((o) => `• **${o.name}** – ${o.position}`)
      .join('\n');

    return (
      `🏛️ **Barangay Onse Officials Directory:**\n\n${list}\n\n` +
      `You can view all council and SK members on our **Officials** page.`
    );
  } catch (err) {
    console.error('Error fetching officials:', err);
    return null;
  }
}

/**
 * 3. LIVE EVENTS & SCHEDULES ENGINE
 * Answers queries about specific dates (e.g. October 31), upcoming events, and community activities.
 */
async function handleEventsQuery(q: string): Promise<string | null> {
  const isAskingEvents =
    q.includes('event') ||
    q.includes('events') ||
    q.includes('activity') ||
    q.includes('activities') ||
    q.includes('schedule') ||
    q.includes('calendar') ||
    q.includes('what is happening') ||
    q.includes('kailan') ||
    q.includes('anong meron') ||
    q.includes('october') ||
    q.includes('november') ||
    q.includes('december') ||
    q.includes('january') ||
    q.includes('february') ||
    q.includes('march') ||
    q.includes('april') ||
    q.includes('may') ||
    q.includes('june') ||
    q.includes('july') ||
    q.includes('august') ||
    q.includes('september');

  if (!isAskingEvents) return null;

  try {
    const allEvents = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
    });

    if (!allEvents.length) {
      return 'There are currently no active public events registered in the Barangay Onse community calendar. Please check back soon or visit the Barangay Hall for announcements.';
    }

    // Detect month and day in query
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    let targetMonth: number | null = null;
    let targetDay: number | null = null;

    for (let i = 0; i < months.length; i++) {
      if (q.includes(months[i])) {
        targetMonth = i; // 0-indexed
        break;
      }
    }

    // Extract day number (e.g. "31", "15", "5th")
    const dayMatch = q.match(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\b/);
    if (dayMatch) {
      targetDay = parseInt(dayMatch[1], 10);
    }

    // If user specified month (e.g., October 31)
    if (targetMonth !== null) {
      const monthName = months[targetMonth].toUpperCase();
      
      const matchedEvents = allEvents.filter((ev) => {
        const d = new Date(ev.eventDate);
        const matchesM = d.getMonth() === targetMonth;
        if (targetDay !== null) {
          return matchesM && d.getDate() === targetDay;
        }
        return matchesM;
      });

      if (matchedEvents.length > 0) {
        const eventText = matchedEvents
          .map((ev) => {
            const formattedDate = new Intl.DateTimeFormat('en-PH', {
              dateStyle: 'full',
              timeStyle: 'short',
            }).format(new Date(ev.eventDate));

            return (
              `📅 **${ev.title}**\n` +
              `• **Date & Time:** ${formattedDate}\n` +
              `• **Location:** ${ev.location}\n` +
              `• **Category:** ${ev.category.toUpperCase()}\n` +
              `• **Details:** ${ev.description}`
            );
          })
          .join('\n\n');

        return `🎉 **Events in Barangay Onse on ${monthName} ${targetDay ? targetDay : ''}:**\n\n${eventText}`;
      } else {
        // If no events on that exact day/month, list the upcoming events
        const upcoming = allEvents.slice(0, 3).map((ev) => {
          const d = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(ev.eventDate));
          return `• **${ev.title}** (${d}) - ${ev.location}`;
        }).join('\n');

        const dayPhrase = targetDay ? `${months[targetMonth]} ${targetDay}` : months[targetMonth];
        return (
          `📅 No scheduled events were found for **${dayPhrase}** in our official calendar.\n\n` +
          `Here are upcoming community activities:\n${upcoming}\n\n` +
          `Follow our official portal announcements for event additions!`
        );
      }
    }

    // General upcoming events
    const upcomingList = allEvents.slice(0, 4).map((ev) => {
      const formatted = new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(ev.eventDate));

      return `📅 **${ev.title}**\n• ${formatted} | 📍 ${ev.location}\n• ${ev.description}`;
    }).join('\n\n');

    return `📢 **Upcoming Events & Activities in Barangay Onse:**\n\n${upcomingList}`;
  } catch (err) {
    console.error('Error fetching events:', err);
    return null;
  }
}

/**
 * 4. LIVE SK PROGRAMS & YOUTH INITIATIVES
 */
async function handleSkQuery(q: string): Promise<string | null> {
  const isAskingSk =
    q.includes('sk program') ||
    q.includes('sk project') ||
    q.includes('youth program') ||
    q.includes('scholarship') ||
    q.includes('sk budget') ||
    q.includes('sportsfest') ||
    q.includes('coding workshop');

  if (!isAskingSk) return null;

  try {
    const programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (!programs.length) {
      return 'The Sangguniang Kabataan of Barangay Onse is preparing upcoming youth programs for this quarter. Check back on the /sk-programs page.';
    }

    const list = programs.slice(0, 3).map((p) => {
      const budgetFormatted = p.budget > 0 ? `₱${p.budget.toLocaleString()}` : 'Allocated';
      return (
        `🏀 **${p.title}**\n` +
        `• **Category:** ${p.category} | **Status:** ${p.status}\n` +
        `• **Schedule:** ${p.schedule}\n` +
        `• **Target Audience:** ${p.targetAudience}\n` +
        `• **Objective:** ${p.objective}`
      );
    }).join('\n\n');

    return `🌟 **Active SK Programs & Youth Projects:**\n\n${list}\n\nFor registrations or scholarship applications, visit the SK Youth Desk at Barangay Onse Hall.`;
  } catch (err) {
    console.error('Error fetching SK programs:', err);
    return null;
  }
}

/**
 * 5. LIVE SERVICES, CERTIFICATES & CLEARANCES
 */
async function handleServicesQuery(q: string): Promise<string | null> {
  const isAskingService =
    q.includes('clearance') ||
    q.includes('indigency') ||
    q.includes('residency') ||
    q.includes('jobseeker') ||
    q.includes('business permit') ||
    q.includes('blotter') ||
    q.includes('cedula') ||
    q.includes('certificate') ||
    q.includes('requirement') ||
    q.includes('requirements') ||
    q.includes('how much') ||
    q.includes('fee') ||
    q.includes('cost') ||
    q.includes('service') ||
    q.includes('services');

  if (!isAskingService) return null;

  try {
    const docTypes = await prisma.documentType.findMany({
      where: { isActive: true },
    });

    // Specific: Barangay Clearance
    if (q.includes('clearance') && !q.includes('business')) {
      const doc = docTypes.find((d) => d.code === 'BRGY_CLEARANCE');
      let reqList = 'Valid Government ID, Proof of Address, Cedula';
      try {
        if (doc?.requirements) {
          const parsed = JSON.parse(doc.requirements);
          if (Array.isArray(parsed)) reqList = parsed.join(', ');
        }
      } catch {}

      return (
        `📄 **Barangay Clearance Application**\n\n` +
        `• **Fee:** ₱${doc?.fee.toFixed(2) || '50.00'} (FREE for first-time jobseekers under R.A. 11261)\n` +
        `• **Processing Time:** ${doc?.processingDays || 1} Business Day\n` +
        `• **Requirements:** ${reqList}\n\n` +
        `You can apply directly online by navigating to **Online Services > Request Certificate**.`
      );
    }

    // Specific: Certificate of Indigency
    if (q.includes('indigency')) {
      const doc = docTypes.find((d) => d.code === 'CERT_INDIGENCY');
      return (
        `📑 **Certificate of Indigency**\n\n` +
        `• **Fee:** 100% FREE\n` +
        `• **Processing Time:** Same Day / 24 Hours\n` +
        `• **Requirements:** Voter Certificate or Barangay ID, Referral assessment for hospital, school, or PAO legal assistance.\n\n` +
        `Apply online through your resident portal account at **Request Certificate**.`
      );
    }

    // Specific: Certificate of Residency
    if (q.includes('residency')) {
      const doc = docTypes.find((d) => d.code === 'CERT_RESIDENCY');
      return (
        `🏠 **Certificate of Residency**\n\n` +
        `• **Fee:** ₱${doc?.fee.toFixed(2) || '30.00'}\n` +
        `• **Processing Time:** 1 Business Day\n` +
        `• **Requirements:** Valid ID with Barangay Onse residential address, minimum 6 months residency verification.\n\n` +
        `Apply online through your resident portal account.`
      );
    }

    // Specific: First Time Jobseeker
    if (q.includes('jobseeker') || q.includes('11261')) {
      return (
        `💼 **First-Time Jobseeker Certificate (R.A. 11261)**\n\n` +
        `• **Fee:** 100% FREE (Government fee waiver)\n` +
        `• **Processing Time:** Same Day\n` +
        `• **Requirements:** Barangay Oath of Undertaking, Valid School ID / PSA Birth Certificate, Proof of residency.\n\n` +
        `Under Republic Act No. 11261, pre-employment barangay clearances and government fees are completely waived!`
      );
    }

    // General services overview
    if (docTypes.length > 0) {
      const list = docTypes.map((d) => {
        const feeStr = d.fee === 0 ? 'FREE' : `₱${d.fee.toFixed(2)}`;
        return `• **${d.name}** – ${feeStr} (${d.processingDays} day processing)`;
      }).join('\n');

      return (
        `📑 **Available Barangay Onse Certificates & Clearances:**\n\n${list}\n\n` +
        `Registered residents can request any certificate online with 24-hour status tracking.`
      );
    }

    return null;
  } catch (err) {
    console.error('Error fetching services:', err);
    return null;
  }
}

/**
 * 6. LIVE TRANSPARENCY & BUDGET INQUIRIES
 */
async function handleTransparencyQuery(q: string): Promise<string | null> {
  const isAskingTransparency =
    q.includes('transparency') ||
    q.includes('budget') ||
    q.includes('financial') ||
    q.includes('procurement') ||
    q.includes('audit') ||
    q.includes('ordinance') ||
    q.includes('ira') ||
    q.includes('allotment');

  if (!isAskingTransparency) return null;

  try {
    const docs = await prisma.transparencyDocument.findMany({
      orderBy: { publishedDate: 'desc' },
      take: 4,
    });

    if (!docs.length) {
      return 'Barangay Onse publishes quarterly and annual financial statements, budgets, and procurement plans on the **Transparency Board** page.';
    }

    const list = docs.map((d) => {
      const yearQuarter = d.quarter ? `${d.quarter} ${d.year}` : `${d.year}`;
      return `• **${d.title}** [${yearQuarter}] (${d.fileSize})`;
    }).join('\n');

    return (
      `📊 **Barangay Onse Full Disclosure & Transparency Board:**\n\n${list}\n\n` +
      `Residents can inspect and download all official audit reports and budgets under the **Transparency** tab.`
    );
  } catch (err) {
    console.error('Error fetching transparency docs:', err);
    return null;
  }
}

/**
 * 7. HEALTH CENTER & EMERGENCY HOTLINES
 */
function handleHealthAndEmergencyQuery(q: string): string | null {
  if (
    q.includes('health') ||
    q.includes('center') ||
    q.includes('doctor') ||
    q.includes('vaccine') ||
    q.includes('vaccination') ||
    q.includes('medicine') ||
    q.includes('prenatal') ||
    q.includes('clinic')
  ) {
    return (
      `🏥 **Barangay Onse Health Center Services**\n\n` +
      `• **Hours:** Monday to Friday, 8:00 AM – 5:00 PM\n` +
      `• **Free Services:** Doctor consultations, prenatal checkups, immunization & child vaccines, dental checkups, and senior maintenance medicine distribution.\n` +
      `• **Location:** Adjacent to Barangay Onse Hall, J. Perez St.\n\n` +
      `Residents can also book health center consultation slots directly through our online appointment portal.`
    );
  }

  if (
    q.includes('emergency') ||
    q.includes('hotline') ||
    q.includes('police') ||
    q.includes('fire') ||
    q.includes('ambulance') ||
    q.includes('rescue') ||
    q.includes('saklolo')
  ) {
    return (
      `🚨 **Barangay Onse & San Juan Emergency Hotlines:**\n\n` +
      `• **Barangay Onse Desk:** (02) 8123-4567\n` +
      `• **San Juan CDRRMO (Disaster & Rescue):** (02) 8722-9837\n` +
      `• **San Juan Police Station:** (02) 8724-2509\n` +
      `• **San Juan Fire Station (BFP):** (02) 8723-9371\n` +
      `• **Philippine National Emergency:** 911\n\n` +
      `For immediate police or medical assistance, personnel are on 24/7 standby.`
    );
  }

  return null;
}

/**
 * 8. GREETINGS & GENERAL ASSISTANT IDENTITY
 */
function handleGreetingsAndFallback(q: string): string {
  if (
    q.includes('hello') ||
    q.includes('hi') ||
    q.includes('hey') ||
    q.includes('mabuhay') ||
    q.includes('magandang araw') ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening')
  ) {
    return (
      `👋 Mabuhay! I am **OnseBot**, the official SmartOnse virtual assistant.\n\n` +
      `You can ask me about:\n` +
      `• **Barangay & SK Officials** (e.g., "Who is the SK Chairperson?", "Who is the Barangay Captain?")\n` +
      `• **Community Events** (e.g., "What are the events on October 31?")\n` +
      `• **Certificates & Clearances** (fees, requirements, processing time)\n` +
      `• **SK Programs & Youth Grants**\n` +
      `• **Health Center & Emergency Hotlines**\n\n` +
      `How can I assist you today?`
    );
  }

  if (q.includes('thank') || q.includes('salamat')) {
    return `Walang anuman! It is our pleasure to serve the residents of Barangay Onse. Let me know if you need any other assistance! 🇵🇭`;
  }

  // Friendly Fallback
  return (
    `I am OnseBot, your Barangay Onse assistant. I can answer inquiries regarding:\n\n` +
    `• **Officials Directory:** Punong Barangay, SK Chairperson, Kagawads\n` +
    `• **Calendar:** Upcoming community events & SK activities\n` +
    `• **Services:** Barangay Clearance, Certificate of Indigency, Residency, Jobseeker waivers\n` +
    `• **Health & Safety:** Health Center hours & 24/7 Emergency Hotlines\n\n` +
    `For inquiries not covered here, feel free to visit the **Barangay Hall** (Mon-Fri 8 AM - 5 PM) or call **(02) 8123-4567**.`
  );
}

/**
 * MAIN CHATBOT PIPELINE
 */
export async function processChatbotMessage(rawMessage: string): Promise<ChatbotResponse> {
  const q = cleanQuery(rawMessage);

  if (!q) {
    return {
      reply: 'Mabuhay! Please type a question regarding Barangay Onse services, officials, or announcements.',
      category: 'general',
    };
  }

  // Step 1: Security & Privacy Check (Hard-blocked before any database access)
  const securityWarning = checkSecurityViolation(q);
  if (securityWarning) {
    return {
      reply: securityWarning,
      category: 'security',
    };
  }

  // Step 2: Officials Query
  const officialsReply = await handleOfficialsQuery(q);
  if (officialsReply) {
    return { reply: officialsReply, category: 'officials' };
  }

  // Step 3: Events Query (Handles October 31, dates, activities)
  const eventsReply = await handleEventsQuery(q);
  if (eventsReply) {
    return { reply: eventsReply, category: 'events' };
  }

  // Step 4: SK Programs & Initiatives
  const skReply = await handleSkQuery(q);
  if (skReply) {
    return { reply: skReply, category: 'sk' };
  }

  // Step 5: Services & Clearances
  const servicesReply = await handleServicesQuery(q);
  if (servicesReply) {
    return { reply: servicesReply, category: 'services' };
  }

  // Step 6: Transparency & Budget
  const transparencyReply = await handleTransparencyQuery(q);
  if (transparencyReply) {
    return { reply: transparencyReply, category: 'transparency' };
  }

  // Step 7: Health Center & Hotlines
  const healthReply = handleHealthAndEmergencyQuery(q);
  if (healthReply) {
    return { reply: healthReply, category: 'general' };
  }

  // Step 8: Greetings & Fallback
  return {
    reply: handleGreetingsAndFallback(q),
    category: 'general',
  };
}
