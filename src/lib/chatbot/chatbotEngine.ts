import prisma from '@/lib/prisma';

export interface ChatHistoryItem {
  sender: 'user' | 'assistant';
  text: string;
}

export interface ChatbotResponse {
  reply: string;
  category?:
    | 'security'
    | 'officials'
    | 'events'
    | 'services'
    | 'sk'
    | 'transparency'
    | 'tracking'
    | 'location'
    | 'directory'
    | 'general'
    | 'out_of_scope';
  suggestions?: string[];
}

/**
 * Levenshtein distance for typo-tolerant keyword matching
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Normalizes input text and expands common Taglish/SMS shorthand & typos
 */
function cleanQuery(text: string): string {
  let cleaned = (text || '')
    .toLowerCase()
    .replace(/[?!,.:;"'(){}\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const phraseReplacements: Array<[RegExp, string]> = [
    [/\b(brgy|bgy|baranggay|brg)\b/g, 'barangay'],
    [/\b(req|reqs|requirments|requirment|rikwayrment|rikwayrments)\b/g, 'requirements'],
    [/\b(klirans|clirance|clerance|clearence)\b/g, 'clearance'],
    [/\b(indigensi|indegency|indigincy|indigent)\b/g, 'indigency'],
    [/\b(residensi|recidency|resedency)\b/g, 'residency'],
    [/\b(sertipiko|certifcate|certfiket|cert)\b/g, 'certificate'],
    [/\b(hm|magkanu|mgkano|mgkno)\b/g, 'magkano'],
    [/\b(pano|paanu|panu)\b/g, 'paano'],
    [/\b(san|saan|nasaan|asan|wer)\b/g, 'saan'],
    [/\b(sno|cno)\b/g, 'sino'],
    [/\b(kng|kung)\b/g, 'kung'],
    [/\b(opisyales|ofc|offcials)\b/g, 'officials'],
    [/\b(kap|capt)\b/g, 'kapitan'],
    [/\b(sec)\b/g, 'secretary'],
    [/\b(treas)\b/g, 'treasurer'],
    [/\b(first time|1st time)\b/g, 'first-time'],
    [/\b(job seeker|jobseekers)\b/g, 'jobseeker'],
  ];

  for (const [pattern, replacement] of phraseReplacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

/**
 * Checks if query contains keyword or a close typo match
 */
function hasTerm(q: string, terms: string[]): boolean {
  const words = q.split(/\s+/);
  for (const term of terms) {
    const t = term.toLowerCase();
    if (t.includes(' ')) {
      if (q.includes(t)) return true;
      continue;
    }
    if (words.includes(t) || q.includes(t)) return true;
    // Allow 1-character typo on words >= 5 chars, 2-character typo on words >= 8 chars
    if (t.length >= 5) {
      const maxDist = t.length >= 8 ? 2 : 1;
      for (const w of words) {
        if (Math.abs(w.length - t.length) <= maxDist && levenshtein(w, t) <= maxDist) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Extracts recently discussed document/topic from conversation history for follow-up questions
 */
function inferTopicFromHistory(history?: ChatHistoryItem[]): string | null {
  if (!history || history.length === 0) return null;
  const recent = [...history].reverse().slice(0, 4);
  for (const item of recent) {
    const t = cleanQuery(item.text);
    if (t.includes('business clearance') || t.includes('negosyo')) return 'BUSINESS_CLEARANCE';
    if (t.includes('barangay clearance') || (t.includes('clearance') && !t.includes('business'))) return 'BRGY_CLEARANCE';
    if (t.includes('indigency')) return 'CERT_INDIGENCY';
    if (t.includes('residency') || t.includes('paninirahan')) return 'CERT_RESIDENCY';
    if (t.includes('jobseeker') || t.includes('11261')) return 'FIRST_TIME_JOBSEEKER';
    if (t.includes('cedula')) return 'CEDULA';
  }
  return null;
}

/**
 * 1. PRIVACY & SYSTEM SECURITY GUARDRAIL
 * Blocks admin credentials, database internals, and resident PII.
 */
function checkSecurityViolation(raw: string, q: string): ChatbotResponse | null {
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
      return {
        reply: '🔒 Hindi maaaring ilabas ang mga admin credentials, system logs, o database information.',
        category: 'security',
      };
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
    /\b(medical record of|symptoms of patient|confidential records of other people)\b/i,
  ];

  for (const pattern of piiPatterns) {
    if (pattern.test(raw) || pattern.test(q)) {
      return {
        reply: '🛡️ Protektado ang personal na impormasyon ng mga residente alinsunod sa **Data Privacy Act of 2012 (R.A. 10173)**.',
        category: 'security',
      };
    }
  }

  return null;
}

/**
 * 2. TICKET / REQUEST REFERENCE NUMBER LOOKUP
 * Accurately matches real tracking codes (e.g. ONSE-2026-0504, REQ-2026-0001) without false-matching normal words.
 */
async function handleTrackingLookup(raw: string, q: string): Promise<ChatbotResponse | null> {
  // Only match actual structured tracking numbers like ONSE-2026-0504 or REQ-2026-0001
  const explicitPrefixMatch = raw.match(/\b((?:ONSE|REQ|BRGY|TRK)-\d{4}-[A-Za-z0-9]+)\b/i) ||
                              raw.match(/\b((?:ONSE|REQ)-[A-Za-z0-9]{3,})\b/i);

  const isAskingAboutTrack = hasTerm(q, [
    'track',
    'tracking',
    'status',
    'ticket',
    'reference',
    'pacheck',
    'pa-check',
    'follow up',
    'follow-up',
    'tapos na ba',
    'ready na ba',
    'kukunin',
    'saan na ang request',
  ]);

  // Also allow 4-digit suffix lookup when explicitly asking about tracking (e.g. "status ng 0504")
  const shortNumberMatch = isAskingAboutTrack ? raw.match(/\b(\d{4})\b/) : null;

  if (explicitPrefixMatch || shortNumberMatch) {
    const rawCode = explicitPrefixMatch ? explicitPrefixMatch[1].trim().toUpperCase() : shortNumberMatch![1];

    try {
      const doc = await prisma.documentRequest.findFirst({
        where: explicitPrefixMatch
          ? {
              trackingNumber: {
                equals: rawCode,
                mode: 'insensitive',
              },
            }
          : {
              trackingNumber: {
                endsWith: `-${rawCode}`,
                mode: 'insensitive',
              },
            },
        include: {
          documentType: true,
        },
      });

      if (!doc) {
        return {
          reply:
            `🔍 Hindi natagpuan ang reference number na **${rawCode}**.\n\n` +
            `• Pakisuri kung tama ang format (halimbawa: \`ONSE-2026-0504\`)\n` +
            `• Maaari rin itong hanapin sa [Track Request Page](/track).`,
          category: 'tracking',
          suggestions: ['Paano mag-track ng request?', 'Mag-request ng Dokumento', 'Emergency Hotlines sa Onse?'],
        };
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

      return {
        reply:
          `📄 **Request Status: ${doc.trackingNumber}**\n\n` +
          `• **Dokumento:** ${doc.documentType?.name || 'Barangay Document'}\n` +
          `• **Estado:** ${s.icon} **${s.label}**\n` +
          `• **Petsa ng Request:** ${dateStr}` +
          pickupInfo +
          remarksInfo +
          `\n\n👉 [Tingnan sa Tracking Page](/track?trackingNumber=${encodeURIComponent(doc.trackingNumber)})`,
        category: 'tracking',
        suggestions: ['Where is Barangay Onse located?', 'Requirements sa Barangay Clearance?'],
      };
    } catch (err) {
      console.error('Error looking up tracking:', err);
    }
  }

  if (
    isAskingAboutTrack ||
    q.includes('req-') ||
    q.includes('onse-')
  ) {
    return {
      reply:
        `🔎 **Paano Mag-track ng Request:**\n\n` +
        `1. I-type lamang dito sa chat ang inyong **Tracking Number** (halimbawa: \`ONSE-2026-0504\`).\n` +
        `2. O buksan ang [Track Request Page](/track) at ilagay ang inyong code.\n\n` +
        `Makikita rito kung **Pending**, **Processing**, o **Ready for Pickup** na ang inyong dokumento.`,
      category: 'tracking',
      suggestions: ['ONSE-2026-0504', 'Requirements sa Barangay Clearance?', 'Paano mag-apply online?'],
    };
  }

  return null;
}

/**
 * 3. SERVICES, CLEARANCES, FEES, REQUIREMENTS & APPLICATION FLOW
 * Context-aware: adapts response based on whether user asks for requirements, fees, processing time, or process.
 */
async function handleServicesQuery(q: string, historyTopic: string | null): Promise<ChatbotResponse | null> {
  const asksRequirements = hasTerm(q, ['requirements', 'requirement', 'kailangan', 'dalhin', 'ipapasa', 'need', 'needs', 'dokumento na kailangan']);
  const asksFee = hasTerm(q, ['magkano', 'presyo', 'price', 'cost', 'fee', 'fees', 'bayad', 'halaga', 'libre', 'free']);
  const asksDuration = hasTerm(q, ['gaano katagal', 'gano katagal', 'ilang araw', 'processing time', 'tagal', 'makuha agad', 'same day']);
  const asksHowTo = hasTerm(q, ['paano kumuha', 'paano mag-apply', 'paano mag apply', 'paano mag-request', 'paano mag request', 'how to apply', 'how to get', 'steps', 'proseso', 'online application']);

  // Determine target service from query or conversation context
  let targetService: string | null = null;
  if (hasTerm(q, ['business clearance', 'business permit', 'negosyo', 'tindahan', 'commercial'])) {
    targetService = 'BUSINESS_CLEARANCE';
  } else if (hasTerm(q, ['barangay clearance', 'clearance'])) {
    targetService = 'BRGY_CLEARANCE';
  } else if (hasTerm(q, ['indigency', 'medical assistance', 'financial assistance', 'pao', 'burial'])) {
    targetService = 'CERT_INDIGENCY';
  } else if (hasTerm(q, ['residency', 'paninirahan', 'bonafide resident', 'katibayan ng paninirahan'])) {
    targetService = 'CERT_RESIDENCY';
  } else if (hasTerm(q, ['jobseeker', 'first-time', '11261', 'unang trabaho', 'fresh grad'])) {
    targetService = 'FIRST_TIME_JOBSEEKER';
  } else if (hasTerm(q, ['blotter', 'reklamo', 'sumbong', 'lupon', 'away', 'incident report', 'kaso'])) {
    targetService = 'DISPUTE_INQUIRY';
  } else if (hasTerm(q, ['cedula', 'community tax', 'ctc'])) {
    targetService = 'CEDULA';
  } else if (hasTerm(q, ['barangay id', 'brgy id', 'resident id'])) {
    targetService = 'BARANGAY_ID';
  } else if ((asksRequirements || asksFee || asksDuration || asksHowTo) && historyTopic) {
    targetService = historyTopic;
  }

  const isGeneralServiceQuery =
    targetService !== null ||
    asksRequirements ||
    asksFee ||
    asksDuration ||
    asksHowTo ||
    hasTerm(q, ['serbisyo', 'services', 'dokumento', 'documents', 'certificates', 'certificate', 'clearances']);

  if (!isGeneralServiceQuery) return null;

  try {
    const docTypes = await prisma.documentType.findMany({ where: { isActive: true } });

    // Helper to parse requirements JSON safely
    const getReqs = (code: string, fallback: string[]): string[] => {
      const found = docTypes.find((d) => d.code === code);
      if (!found?.requirements) return fallback;
      try {
        const parsed = JSON.parse(found.requirements);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
      } catch {
        return fallback;
      }
    };

    // 3A. Barangay Clearance
    if (targetService === 'BRGY_CLEARANCE') {
      const doc = docTypes.find((d) => d.code === 'BRGY_CLEARANCE');
      const feeStr = `₱${doc?.fee.toFixed(2) || '50.00'}`;
      const reqList = getReqs('BRGY_CLEARANCE', [
        'Valid Government ID o School ID',
        'Proof of Residency (Utility Bill / lumang clearance)',
        'Community Tax Certificate (Cedula)',
      ]);

      let intro = `📄 **Barangay Clearance**\n\n`;
      if (asksRequirements && !asksFee) {
        intro = `📋 **Mga Requirements sa Barangay Clearance:**\n${reqList.map((r) => `• **${r}**`).join('\n')}\n\n`;
        return {
          reply:
            intro +
            `**Karagdagang Impormasyon:**\n` +
            `• **Bayad:** ${feeStr} *(LIBRE para sa First-Time Jobseekers)*\n` +
            `• **Tagal ng Proseso:** ${doc?.processingDays || 1} Business Day\n\n` +
            `👉 [Mag-apply ng Barangay Clearance Online](/portal/request)`,
          category: 'services',
          suggestions: ['Magkano ang Business Clearance?', 'Libre ba ang Certificate of Indigency?', 'Paano mag-track ng request?'],
        };
      }

      if (asksFee && !asksRequirements) {
        return {
          reply:
            `💰 **Bayad sa Barangay Clearance:** **${feeStr}** *(LIBRE kung First-Time Jobseeker sa ilalim ng R.A. 11261)*\n\n` +
            `• **Requirements:** ${reqList.join(', ')}\n` +
            `• **Tagal:** ${doc?.processingDays || 1} Business Day\n\n` +
            `👉 [Mag-apply Online](/portal/request)`,
          category: 'services',
          suggestions: ['Requirements sa First-Time Jobseeker?', 'Libre ba ang Certificate of Indigency?'],
        };
      }

      return {
        reply:
          intro +
          `• **Requirements:**\n  - ${reqList.join('\n  - ')}\n` +
          `• **Bayad:** ${feeStr} *(LIBRE para sa First-Time Jobseekers)*\n` +
          `• **Tagal:** ${doc?.processingDays || 1} Business Day\n\n` +
          `👉 [Mag-apply Online](/portal/request) | [Tingnan ang Lahat ng Serbisyo](/services)`,
        category: 'services',
        suggestions: ['Paano mag-apply online?', 'Libre ba ang Certificate of Indigency?', 'Requirements sa Certificate of Residency?'],
      };
    }

    // 3B. Barangay Business Clearance
    if (targetService === 'BUSINESS_CLEARANCE') {
      const doc = docTypes.find((d) => d.code === 'BUSINESS_CLEARANCE');
      const feeStr = `₱${doc?.fee.toFixed(2) || '250.00'}`;
      const reqList = getReqs('BUSINESS_CLEARANCE', [
        'DTI o SEC Certificate of Registration',
        'Contract of Lease o Proof of Property Ownership',
        'Sanitary & Fire Safety Inspection Clearance',
      ]);

      return {
        reply:
          `🏢 **Barangay Business Clearance**\n\n` +
          `• **Requirements:**\n  - ${reqList.join('\n  - ')}\n` +
          `• **Bayad:** **${feeStr}**\n` +
          `• **Tagal:** ${doc?.processingDays || 2} Business Days\n\n` +
          `👉 [Mag-apply Online](/portal/request) | [Mga Serbisyo](/services)`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Where is Barangay Onse located?'],
      };
    }

    // 3C. Certificate of Indigency
    if (targetService === 'CERT_INDIGENCY') {
      const reqList = getReqs('CERT_INDIGENCY', [
        'Voter Certificate o Barangay ID / Valid ID',
        'Hospital, School, o DSWD/PAO Referral Assessment',
      ]);
      const lead = asksFee
        ? `✅ **Oo, 100% LIBRE (Walang Bayad)** ang **Certificate of Indigency** sa Barangay Onse.\n\n`
        : `📑 **Certificate of Indigency**\n\n• **Bayad:** **LIBRE (100% Free)**\n`;

      return {
        reply:
          lead +
          `• **Requirements:**\n  - ${reqList.join('\n  - ')}\n` +
          `• **Gamit:** Medical/Hospital assistance, Scholarship, DSWD, o PAO legal aid\n` +
          `• **Tagal:** Same Day / 1 Business Day\n\n` +
          `👉 [Mag-apply Online](/portal/request)`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Requirements sa First-Time Jobseeker?', 'Paano mag-track ng request?'],
      };
    }

    // 3D. Certificate of Residency
    if (targetService === 'CERT_RESIDENCY') {
      const doc = docTypes.find((d) => d.code === 'CERT_RESIDENCY');
      const feeStr = `₱${doc?.fee.toFixed(2) || '30.00'}`;
      const reqList = getReqs('CERT_RESIDENCY', [
        'Valid ID na may Barangay Onse address o Contract of Lease',
        'Minimum 6 months na paninirahan sa Barangay Onse',
      ]);

      return {
        reply:
          `🏠 **Certificate of Residency**\n\n` +
          `• **Requirements:**\n  - ${reqList.join('\n  - ')}\n` +
          `• **Bayad:** **${feeStr}**\n` +
          `• **Tagal:** ${doc?.processingDays || 1} Business Day\n\n` +
          `👉 [Mag-apply Online](/portal/request)`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Libre ba ang Certificate of Indigency?'],
      };
    }

    // 3E. First-Time Jobseeker Certificate (R.A. 11261)
    if (targetService === 'FIRST_TIME_JOBSEEKER') {
      const reqList = getReqs('FIRST_TIME_JOBSEEKER', [
        'Barangay Oath of Undertaking (pipirmahan sa Hall)',
        'Valid School ID o PSA Birth Certificate',
        'Proof of Barangay Onse Residency (at least 6 months)',
      ]);

      return {
        reply:
          `💼 **First-Time Jobseeker Certificate (R.A. 11261)**\n\n` +
          `• **Bayad:** **LIBRE (100% Free)** – pati Barangay Clearance para sa unang trabaho\n` +
          `• **Requirements:**\n  - ${reqList.join('\n  - ')}\n` +
          `• **Tagal:** Same Day / 1 Business Day\n\n` +
          `👉 [Mag-apply Online](/portal/request)`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'SK Programs at Scholarship?'],
      };
    }

    // 3F. Inquiries on Complaints / Community Concerns
    if (targetService === 'DISPUTE_INQUIRY') {
      return {
        reply:
          `⚖️ **Pampublikong Serbisyo at Kaayusan sa Barangay Onse**\n\n` +
          `Ang SmartOnse portal ay eksklusibong nakatuon sa pag-isyu ng mga opisyal na sertipiko at clearance (Barangay Clearance, Certificate of Residency, Certificate of Indigency, First-Time Jobseeker, at Business Clearance).\n\n` +
          `Para sa mga sumbong, alitan, o mga usaping pang-kapayapaan sa komunidad:\n` +
          `• **Personal na Pagsadya:** Mangyaring magtungo nang personal sa Barangay Onse Hall (Desk Officer / Lupong Tagapamayapa).\n` +
          `• **24/7 Hotline sa Emergency at Insidente:** **(02) 8723-0011** / **0917-888-0011**\n\n` +
          `👉 [Mag-apply ng Opisyal na Sertipiko](/portal/request)`,
        category: 'services',
        suggestions: ['Emergency Hotlines sa Onse?', 'Paano kumuha ng Barangay Clearance?'],
      };
    }

    // 3G. Cedula / Barangay ID
    if (targetService === 'CEDULA') {
      return {
        reply:
          `🧾 **Community Tax Certificate (Cedula)**\n\n` +
          `• **Saan Kukuha:** Window 1 (Treasurer's Desk) sa Barangay Onse Hall o San Juan City Hall.\n` +
          `• **Requirements:** 1 Valid ID at impormasyon sa kita/trabaho.\n` +
          `• **Oras:** Lunes – Biyernes, 8:00 AM – 5:00 PM.`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Where is Barangay Onse located?'],
      };
    }

    if (targetService === 'BARANGAY_ID') {
      return {
        reply:
          `🪪 **Barangay Onse Resident ID**\n\n` +
          `• **Requirements:** 1 Valid ID o Birth Certificate, Proof of Address sa Barangay Onse, at RBI Registration.\n` +
          `• **Paano Kumuha:** Magrehistro muna sa [Citizen Registration](/register) at magsadya sa Barangay Hall para sa litrato at pirma.`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Paano mag-register sa portal?'],
      };
    }

    // 3H. Step-by-step "How to apply"
    if (asksHowTo) {
      return {
        reply:
          `📝 **Paano Kumuha ng Dokumento Online (Step-by-Step):**\n\n` +
          `1. **Mag-log in o Mag-register:** Pumunta sa [Citizen Login](/login) o [Register](/register).\n` +
          `2. **Pumili ng Dokumento:** Buksan ang [Online Document Request](/portal/request) at piliin ang kailangang clearance o certificate.\n` +
          `3. **I-save ang Tracking Code:** Makakatanggap ka ng reference code (hal. \`ONSE-2026-XXXX\`).\n` +
          `4. **Pickup sa Hall:** Kapag **Ready for Pickup** na sa [Track Request](/track), dalhin ang Valid ID sa **Window 2** ng Barangay Onse Hall.`,
        category: 'services',
        suggestions: ['Requirements sa Barangay Clearance?', 'Libre ba ang Certificate of Indigency?', 'Paano mag-track ng request?'],
      };
    }

    // 3I. General Overview of All Services (with fees & requirements summary)
    if (docTypes.length > 0) {
      const seenNames = new Set<string>();
      const uniqueDocs = docTypes.filter((d) => {
        const key = d.name.toLowerCase().replace(/\s*\(permit\)\s*/g, '').trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });
      const list = uniqueDocs
        .map((d) => {
          const feeLabel = d.fee === 0 ? '**LIBRE**' : `**₱${d.fee.toFixed(2)}**`;
          return `• **${d.name}** – ${feeLabel} (${d.processingDays} araw)`;
        })
        .join('\n');

      return {
        reply:
          `📑 **Mga Serbisyo at Dokumento sa Barangay Onse:**\n\n` +
          `${list}\n\n` +
          `Maaari mong itanong ang partikular na dokumento (hal. *"Requirements sa Barangay Clearance?"* o *"Magkano ang Business Clearance?"*).\n\n` +
          `👉 [Mag-apply Online](/portal/request) | [Tingnan ang Buong Detalye](/services)`,
        category: 'services',
        suggestions: [
          'Requirements sa Barangay Clearance?',
          'Libre ba ang Certificate of Indigency?',
          'Magkano ang Business Clearance?',
        ],
      };
    }

    return null;
  } catch (err) {
    console.error('Error fetching services:', err);
    return null;
  }
}

/**
 * 4. BARANGAY & SK OFFICIALS
 * Supports multi-entity queries (e.g. "Sino ang Barangay Captain at SK?"), specific names, roles, and committees.
 */
async function handleOfficialsQuery(q: string): Promise<ChatbotResponse | null> {
  const isAskingOfficials = hasTerm(q, [
    'official',
    'officials',
    'opisyal',
    'captain',
    'kapitan',
    'punong barangay',
    'chairman',
    'chairperson',
    'kagawad',
    'councilor',
    'konsehal',
    'secretary',
    'kalihim',
    'treasurer',
    'ingat-yaman',
    'sino ang',
    'who is',
    'alba',
    'permato',
    'florano',
    'gutierrez',
    'gomez',
    'casao',
    'lorbes',
    'daradal',
    'deniega',
    'zamora',
    'borjal',
    'bongalos',
    'sorio',
    'reyes',
    'garcia',
    'luciano',
    'pantaleon',
    'cadiang',
    'munsayac',
  ]);

  if (!isAskingOfficials) return null;

  try {
    const officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });

    const asksCaptain = hasTerm(q, ['captain', 'kapitan', 'punong barangay', 'alba']) || (q.includes('chairman') && !q.includes('sk'));
    const asksSk = hasTerm(q, ['sk', 'permato', 'kabataan', 'youth']);
    const asksSecretary = hasTerm(q, ['secretary', 'kalihim', 'gomez', 'sorio']);
    const asksTreasurer = hasTerm(q, ['treasurer', 'ingat-yaman', 'gutierrez', 'bongalos']);
    const asksKagawad = hasTerm(q, ['kagawad', 'councilor', 'konsehal']);

    // Multi-intent: Both Barangay Captain AND SK (e.g., "Sino ang Barangay Captain at SK?")
    if (asksCaptain && asksSk) {
      return {
        reply:
          `🏛️ **Mga Pinuno ng Barangay Onse at Sangguniang Kabataan (2023–2026):**\n\n` +
          `• **Punong Barangay (Captain):** Hon. Roberto B. Alba\n` +
          `  - *Komite:* Executive & Peace and Order\n` +
          `• **SK Chairperson:** Hon. John Michael D. Permato\n` +
          `  - *Komite:* Youth Leadership & Sports\n` +
          `• **Barangay Secretary:** Maria Elena C. Gomez\n` +
          `• **Barangay Treasurer:** Elena V. Gutierrez\n\n` +
          `👉 [Tingnan ang Lahat ng 20 Opisyal](/officials) | [SK Programs](/sk-programs)`,
        category: 'officials',
        suggestions: ['Sino ang mga Kagawad?', 'SK Programs at Kabataan?', 'Where is Barangay Onse located?'],
      };
    }

    // Specific Official Match by Last Name
    const matchedByName = officials.filter((o) => {
      const nameParts = o.name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      return nameParts.some((part) => part.length >= 4 && part !== 'john' && part !== 'maria' && q.includes(part));
    });

    if (matchedByName.length === 1) {
      const off = matchedByName[0];
      return {
        reply:
          `👤 **${off.name}**\n\n` +
          `• **Posisyon:** ${off.position}\n` +
          `• **Komite:** ${off.committee || 'Barangay Council'}\n` +
          `• **Termino:** ${off.term}\n` +
          (off.contact ? `• **Opisyal na Linya:** ${off.contact}\n\n` : '\n') +
          `👉 [Tingnan ang Buong Talaan ng mga Opisyal](/officials)`,
        category: 'officials',
        suggestions: ['Sino ang mga Kagawad?', 'Sino ang Barangay Captain at SK?'],
      };
    }

    // Secretary / Treasurer query
    if (asksSecretary || asksTreasurer) {
      return {
        reply:
          `📋 **Secretariat at Finance Officers ng Barangay Onse:**\n\n` +
          `• **Barangay Secretary:** Maria Elena C. Gomez *(Secretariat & Administrative Records)*\n` +
          `• **Barangay Treasurer:** Elena V. Gutierrez *(Finance, Budget & Appropriations)*\n` +
          `• **SK Secretary:** Jonathan D. Sorio\n` +
          `• **SK Treasurer:** Michaelito Bongalos\n\n` +
          `👉 [Talaan ng mga Opisyal](/officials)`,
        category: 'officials',
        suggestions: ['Sino ang Barangay Captain at SK?', 'Sino ang mga Kagawad?'],
      };
    }

    // SK Council / SK Chairperson
    if (asksSk) {
      const skList = officials.filter((o) => o.position.toLowerCase().includes('sk'));
      if (asksKagawad && skList.length > 0) {
        const formatted = skList.map((k) => `• **${k.name}** – *${k.position}* (${k.committee})`).join('\n');
        return {
          reply: `🏅 **Sangguniang Kabataan (SK) Council ng Barangay Onse:**\n\n${formatted}\n\n👉 [SK Programs](/sk-programs) | [Lahat ng Opisyal](/officials)`,
          category: 'officials',
          suggestions: ['SK Programs at Scholarship?', 'Sino ang mga Barangay Kagawad?'],
        };
      }
      return {
        reply:
          `🏅 **SK Chairperson:** Hon. John Michael D. Permato\n` +
          `• **Komite:** Youth Leadership & Sports\n` +
          `• **SK Secretary:** Jonathan D. Sorio\n` +
          `• **SK Treasurer:** Michaelito Bongalos\n` +
          `• **Termino:** 2023 – 2026\n\n` +
          `👉 [Tingnan ang SK Programs](/sk-programs) | [Lahat ng Opisyal](/officials)`,
        category: 'officials',
        suggestions: ['Sino ang mga SK Kagawad?', 'SK Programs at Scholarship?'],
      };
    }

    // Barangay Captain / Chairman
    if (asksCaptain) {
      return {
        reply:
          `🏛️ **Punong Barangay:** Hon. Roberto B. Alba\n` +
          `• **Posisyon:** Barangay Chairman\n` +
          `• **Komite:** Executive & Peace and Order\n` +
          `• **Termino:** 2023 – 2026\n` +
          `• **Oras sa Hall:** Lunes – Biyernes, 8:00 AM – 5:00 PM\n\n` +
          `👉 [Tingnan ang Lahat ng Opisyal](/officials)`,
        category: 'officials',
        suggestions: ['Sino ang mga Kagawad?', 'Sino ang SK Chairperson?', 'Where is Barangay Onse located?'],
      };
    }

    // Barangay Kagawad list
    if (asksKagawad) {
      const kagawads = officials.filter(
        (o) => o.position.toLowerCase().includes('kagawad') && !o.position.toLowerCase().includes('sk')
      );
      if (kagawads.length > 0) {
        const list = kagawads.map((k) => `• **${k.name}** – *${k.committee || 'Councilor'}*`).join('\n');
        return {
          reply: `🏛️ **Mga Barangay Kagawad (Sangguniang Barangay):**\n\n${list}\n\n👉 [Talaan ng mga Opisyal](/officials)`,
          category: 'officials',
          suggestions: ['Sino ang Barangay Captain at SK?', 'Sino ang mga SK Kagawad?'],
        };
      }
    }

    // Default complete leadership summary
    return {
      reply:
        `🏛️ **Pamunuan ng Barangay Onse (2023 – 2026):**\n\n` +
        `• **Punong Barangay:** Hon. Roberto B. Alba\n` +
        `• **SK Chairperson:** Hon. John Michael D. Permato\n` +
        `• **Barangay Secretary:** Maria Elena C. Gomez\n` +
        `• **Barangay Treasurer:** Elena V. Gutierrez\n\n` +
        `Kasama ang **7 Barangay Kagawad** at **7 SK Kagawad**.\n\n` +
        `👉 [Tingnan ang Kumpletong Talaan ng mga Opisyal](/officials)`,
      category: 'officials',
      suggestions: ['Sino ang mga Kagawad?', 'Sino ang mga SK Kagawad?', 'Where is Barangay Onse located?'],
    };
  } catch (err) {
    console.error('Error fetching officials:', err);
    return null;
  }
}

/**
 * 5. BARANGAY ONSE LOCATION, OFFICE HOURS, CONTACT & ABOUT
 */
function handleLocationAndAboutQuery(q: string): ChatbotResponse | null {
  const isAskingHours = hasTerm(q, [
    'office hours',
    'oras ng bukas',
    'bukas ba',
    'anong oras bukas',
    'anong oras sara',
    'schedule ng barangay',
    'sabado',
    'linggo',
    'weekend',
  ]);

  const isAskingAboutStats = hasTerm(q, [
    'populasyon',
    'population',
    'ilang residente',
    'ilang botante',
    'voters',
    'tungkol sa onse',
    'history ng onse',
    'about barangay onse',
  ]);

  const isAskingLocation =
    isAskingHours ||
    isAskingAboutStats ||
    hasTerm(q, [
      'where is',
      'saan matatagpuan',
      'saan ang onse',
      'location',
      'lokasyon',
      'address',
      'barangay hall',
      'paano pumunta',
      'direksyon',
      'landmark',
      'commute',
      'sakay papuntang',
      'contact number',
      'telepono',
    ]);

  if (!isAskingLocation) return null;

  if (isAskingAboutStats) {
    return {
      reply:
        `🏘️ **Tungkol sa Barangay Onse, San Juan City:**\n\n` +
        `• **Populasyon:** 3,824 rehistradong residente\n` +
        `• **Rehistradong Botante:** 1,250 (COMELEC)\n` +
        `• **Aktibong Negosyo:** 412 lokal na establisyimento\n` +
        `• **Address ng Hall:** 3 J.V. Panganiban St., Barangay Onse, San Juan City 1500\n\n` +
        `👉 [Makipag-ugnayan sa Amin](/contact) | [Mga Opisyal](/officials)`,
      category: 'location',
      suggestions: ['Where is Barangay Onse located?', 'Sino ang Barangay Captain at SK?'],
    };
  }

  return {
    reply:
      `📍 **Lokasyon at Oras ng Tanggapan – Barangay Onse Hall:**\n\n` +
      `• **Address:** 3 J.V. Panganiban St., Barangay Onse, San Juan City, Metro Manila 1500\n` +
      `• **Landmark:** Malapit sa N. Domingo St., J. Perez St., at LRT-2 J. Ruiz Station *(~5 minutong lakad)*\n` +
      `• **Oras ng Tanggapan:** Lunes – Biyernes, **8:00 AM – 5:00 PM** *(Bukas ang 24/7 Tanod/Emergency Desk kapag weekend)*\n` +
      `• **Telepono:** (02) 8723-0011 / (02) 8123-4567 | Mobile: **0917-888-0011**\n\n` +
      `👉 [Tingnan ang Mapa at Direksyon](/contact)`,
    category: 'location',
    suggestions: ['Emergency Hotlines sa Onse?', 'Requirements sa Barangay Clearance?', 'Sino ang Barangay Captain at SK?'],
  };
}

/**
 * 6. DIRECTORY NAVIGATION, ACCOUNT HELP & QR VERIFICATION
 */
function handleDirectoryAndLinksQuery(q: string): ChatbotResponse | null {
  if (hasTerm(q, ['verify', 'qr code', 'qr', 'peke', 'authentic', 'validate'])) {
    return {
      reply:
        `🔐 **QR Code & Certificate Verification:**\n\n` +
        `Maaaring i-scan o ilagay ang certificate reference code upang masuri kung tunay ang dokumento rito: [Verify Certificate Page](/verify).`,
      category: 'directory',
      suggestions: ['Paano mag-track ng request?', 'Mag-request ng Dokumento'],
    };
  }

  if (hasTerm(q, ['forgot password', 'nakalimutan ang password', 'reset password', 'di maka-login', 'hindi makapasok'])) {
    return {
      reply:
        `🔑 **Tulong sa Account / Password:**\n\n` +
        `• Kung nakalimutan ang password, gamitin ang **Forgot Password** sa [Login Page](/login).\n` +
        `• Kung wala pang account, gumawa rito: [Citizen Registration](/register).`,
      category: 'directory',
      suggestions: ['Paano mag-apply online?', 'Emergency Hotlines sa Onse?'],
    };
  }

  const isAskingDirectory = hasTerm(q, [
    'saan makikita',
    'saan pupunta',
    'saan i-click',
    'where can i find',
    'where is the link',
    'link para sa',
    'link ng',
    'mga link',
    'directory',
    'portal link',
    'sitemap',
    'mag-register',
    'magparehistro',
  ]);

  if (!isAskingDirectory) return null;

  if (hasTerm(q, ['register', 'rehistro', 'sign up', 'gumawa ng account'])) {
    return {
      reply: '📝 Magrehistro bilang residente rito: [Citizen Registration](/register) | May account na? [Portal Login](/login)',
      category: 'directory',
      suggestions: ['Requirements sa Barangay Clearance?', 'Paano mag-apply online?'],
    };
  }

  return {
    reply:
      `🗺️ **Mga Opisyal na Link sa SmartOnse Portal:**\n\n` +
      `• 📄 [Mag-request ng Dokumento](/portal/request)\n` +
      `• 🔎 [I-track ang Request Status](/track)\n` +
      `• 🔐 [I-verify ang Certificate QR](/verify)\n` +
      `• 📑 [Mga Serbisyo at Bayarin](/services)\n` +
      `• 🏛️ [Talaan ng mga Opisyal](/officials)\n` +
      `• 🏀 [SK Programs at Kabataan](/sk-programs)\n` +
      `• 📅 [Kalendaryo ng Events](/events)\n` +
      `• 📊 [Transparency Board (COA)](/transparency)\n` +
      `• 📍 [Lokasyon at Hotlines](/contact)\n` +
      `• 👤 [Magrehistro](/register) | [Mag-login](/login)`,
    category: 'directory',
    suggestions: ['Requirements sa Barangay Clearance?', 'Sino ang Barangay Captain at SK?', 'Paano mag-track ng request?'],
  };
}

/**
 * 7. SK YOUTH INITIATIVES & SCHOLARSHIPS
 */
async function handleSkQuery(q: string): Promise<ChatbotResponse | null> {
  const isAskingSk = hasTerm(q, [
    'sk program',
    'sk programs',
    'sk project',
    'sk projects',
    'scholarship',
    'educational assistance',
    'paliga',
    'liga',
    'basketball',
    'sportsfest',
    'kabataan',
    'youth program',
  ]);

  if (!isAskingSk) return null;

  try {
    const programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (programs.length > 0) {
      const list = programs
        .map((p) => `• **${p.title}** *(${p.status})*\n  - Eskedyul: ${p.schedule}`)
        .join('\n');
      return {
        reply:
          `🏀 **Mga Programa ng Sangguniang Kabataan (SK Onse):**\n\n` +
          `${list}\n\n` +
          `Pinamumunuan ni **SK Chairperson Hon. John Michael D. Permato**.\n\n` +
          `👉 [Tingnan ang SK Programs at Scholarship](/sk-programs)`,
        category: 'sk',
        suggestions: ['Sino ang mga SK Kagawad?', 'Requirements sa First-Time Jobseeker?', 'Upcoming Events sa Onse?'],
      };
    }

    return {
      reply: '👉 [Tingnan ang mga Aktibidad at Programa ng SK](/sk-programs)',
      category: 'sk',
    };
  } catch (err) {
    console.error('Error fetching SK programs:', err);
    return null;
  }
}

/**
 * 8. COMMUNITY EVENTS & ANNOUNCEMENTS
 */
async function handleEventsQuery(q: string): Promise<ChatbotResponse | null> {
  const isAskingEvents = hasTerm(q, [
    'event',
    'events',
    'kaganapan',
    'aktibidad',
    'activity',
    'activities',
    'calendar',
    'kalendaryo',
    'anong meron',
    'announcement',
    'abiso',
    'assembly',
    'rabies',
    'clean-up',
  ]);

  if (!isAskingEvents) return null;

  try {
    const allEvents = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
      take: 4,
    });

    if (allEvents.length > 0) {
      const list = allEvents
        .map((ev) => {
          const d = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(ev.eventDate));
          return `• **${ev.title}** (${d}) – *${ev.location}*`;
        })
        .join('\n');
      return {
        reply: `📅 **Mga Nakatakdang Kaganapan sa Barangay Onse:**\n\n${list}\n\n👉 [Tingnan ang Buong Kalendaryo](/events)`,
        category: 'events',
        suggestions: ['SK Programs at Kabataan?', 'Where is Barangay Onse located?'],
      };
    }

    return {
      reply: 'Walang nakatakdang public event sa ngayon. 👉 [Tingnan ang Kalendaryo](/events)',
      category: 'events',
    };
  } catch (err) {
    console.error('Error fetching events:', err);
    return null;
  }
}

/**
 * 9. HEALTH CENTER, SENIOR/PWD & EMERGENCY HOTLINES
 */
function handleHealthAndEmergencyQuery(q: string): ChatbotResponse | null {
  if (
    hasTerm(q, [
      'emergency',
      'hotline',
      'hotlines',
      'saklolo',
      'sunog',
      'pulis',
      'police',
      'fire',
      'ambulansya',
      'ambulance',
      'rescue',
      'tanod',
      '911',
    ])
  ) {
    return {
      reply:
        `🚨 **24/7 Emergency Hotlines – Barangay Onse & San Juan City:**\n\n` +
        `• **Barangay Onse Desk:** **(02) 8723-0011** / **(02) 8123-4567**\n` +
        `• **Barangay Mobile:** **0917-888-0011**\n` +
        `• **San Juan Rescue (CDRRMO 24/7):** **(02) 8722-9837**\n` +
        `• **San Juan Police Station:** **(02) 8724-2509**\n` +
        `• **San Juan Fire Station:** **(02) 8723-9371**\n` +
        `• **National Emergency:** **911**\n\n` +
        `👉 [Contact & Emergency Directory](/contact)`,
      category: 'general',
      suggestions: ['Where is Barangay Onse located?', 'Paano kumuha ng Barangay Clearance?'],
    };
  }

  if (
    hasTerm(q, [
      'health',
      'health center',
      'klinika',
      'clinic',
      'bakuna',
      'vaccine',
      'gamot',
      'medicine',
      'doktor',
      'doctor',
      'check-up',
      'checkup',
      'prenatal',
      'dental',
      'senior citizen',
      'pwd',
      'solo parent',
    ])
  ) {
    return {
      reply:
        `🏥 **Barangay Onse Health Center & Social Services:**\n\n` +
        `• **Oras:** Lunes – Biyernes, 8:00 AM – 5:00 PM\n` +
        `• **Libreng Serbisyo:** Check-up, bakuna sa bata, prenatal care, dental check, at maintenance medicine\n` +
        `• **Senior Citizen / PWD / Solo Parent Desk:** Tumatanggap ng endorsement at Certificate of Indigency/Residency para sa OSCA at CSWDO.\n` +
        `• **Lokasyon:** Katabi ng Barangay Hall, J. Perez St.`,
      category: 'general',
      suggestions: ['Libre ba ang Certificate of Indigency?', 'Where is Barangay Onse located?'],
    };
  }

  return null;
}

/**
 * 10. TRANSPARENCY & COA BUDGET REPORTS
 */
async function handleTransparencyQuery(q: string): Promise<ChatbotResponse | null> {
  const isAskingTransparency = hasTerm(q, [
    'transparency',
    'budget',
    'badyet',
    'gastos',
    'pondo',
    'coa',
    'procurement',
    'financial report',
    'abyip',
    'cbydp',
  ]);

  if (!isAskingTransparency) return null;

  return {
    reply:
      `📊 **Barangay Onse Transparency Board (COA Certified):**\n\n` +
      `Bukas sa publiko ang ating **2026 Barangay Annual Budget**, **Quarterly Financial Statements**, **Annual Procurement Plan (APP)**, at **SK ABYIP/CBYDP**.\n\n` +
      `👉 [Buksan ang Transparency Board](/transparency)`,
    category: 'transparency',
    suggestions: ['Sino ang Barangay Captain at SK?', 'Mga Serbisyo at Bayarin'],
  };
}

/**
 * 11. GREETINGS & CONVERSATIONAL POLITENESS
 */
function handleGreetings(q: string): ChatbotResponse | null {
  const isGreeting =
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'mabuhay' ||
    q === 'kamusta' ||
    q === 'kumusta' ||
    q === 'musta' ||
    q === 'uy' ||
    q === 'good morning' ||
    q === 'good afternoon' ||
    q === 'good evening' ||
    q.startsWith('magandang ') ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('mabuhay ') ||
    hasTerm(q, ['tulong', 'help', 'ano pwede itanong', 'what can you do']);

  if (isGreeting) {
    return {
      reply:
        `👋 **Mabuhay! Ako si OnseBot, ang Virtual Assistant ng Barangay Onse.**\n\n` +
        `Maaari mo akong tanungin tungkol sa:\n` +
        `• 📄 **Requirements at Bayarin** *(Barangay Clearance, Indigency, Residency, Business Clearance, First-Time Jobseeker)*\n` +
        `• 🔎 **Request Tracking** *(i-type lang ang \`ONSE-2026-XXXX\`)*\n` +
        `• 🏛️ **Mga Opisyal ng Barangay at SK**\n` +
        `• 📍 **Lokasyon, Oras ng Bukas, at Emergency Hotlines**`,
      category: 'general',
      suggestions: [
        'Requirements sa Barangay Clearance?',
        'Libre ba ang Certificate of Indigency?',
        'Sino ang Barangay Captain at SK?',
      ],
    };
  }

  if (hasTerm(q, ['salamat', 'thank you', 'thanks', 'ty', 'maraming salamat', 'ok salamat', 'okay thank you'])) {
    return {
      reply: 'Walang anuman! Bukas ang SmartOnse Portal 24/7 kung may kailangan ka pang itanong. Ingat po! 😊',
      category: 'general',
      suggestions: ['Mag-request ng Dokumento', 'Tingnan ang mga Serbisyo'],
    };
  }

  return null;
}

/**
 * 12. SMART FALLBACK WITH HELPFUL GUIDANCE
 */
function handleOutOfScopeQuery(): ChatbotResponse {
  return {
    reply:
      `Paumanhin, hindi ko lubos na nakuha ang iyong tanong o labas ito sa sakop ng **Barangay Onse Portal**.\n\n` +
      `Maaari mong subukan ang mga sumusunod:\n` +
      `• *"Requirements sa Barangay Clearance?"*\n` +
      `• *"Libre ba ang Certificate of Indigency?"*\n` +
      `• *"Sino ang Barangay Captain at SK?"*\n` +
      `• O i-type ang iyong tracking code (hal. \`ONSE-2026-0504\`).\n\n` +
      `👉 [Mga Serbisyo](/services) | [Mag-request Online](/portal/request) | [Contact Desk](/contact)`,
    category: 'out_of_scope',
    suggestions: [
      'Requirements sa Barangay Clearance?',
      'Libre ba ang Certificate of Indigency?',
      'Sino ang Barangay Captain at SK?',
      'Emergency Hotlines sa Onse?',
    ],
  };
}

/**
 * MAIN CHATBOT PIPELINE
 */
export async function processChatbotMessage(
  rawMessage: string,
  history?: ChatHistoryItem[]
): Promise<ChatbotResponse> {
  const cleanQ = cleanQuery(rawMessage);

  if (!cleanQ) {
    return {
      reply: 'Mabuhay! Ano ang maitutulong ko tungkol sa mga serbisyo, clearances, o impormasyon sa Barangay Onse?',
      category: 'general',
      suggestions: [
        'Requirements sa Barangay Clearance?',
        'Sino ang Barangay Captain at SK?',
        'Where is Barangay Onse located?',
      ],
    };
  }

  // 1. Security & Data Privacy Guardrail
  const securityWarning = checkSecurityViolation(rawMessage, cleanQ);
  if (securityWarning) return securityWarning;

  // 2. Ticket / Reference Tracking Lookup (strict pattern so words like "Requirements" never false-match)
  const trackingReply = await handleTrackingLookup(rawMessage, cleanQ);
  if (trackingReply) return trackingReply;

  // Infer topic from recent history for follow-up questions ("Magkano?", "Ano requirements?")
  const historyTopic = inferTopicFromHistory(history);

  // 3. Services, Clearances, Fees & Requirements (evaluated before generic directory/location so "saan kukuha ng clearance" or "requirements sa clearance" answers the service directly)
  const servicesReply = await handleServicesQuery(cleanQ, historyTopic);
  if (servicesReply) return servicesReply;

  // 4. Officials (Captain, SK, Kagawads, Secretary, Treasurer)
  const officialsReply = await handleOfficialsQuery(cleanQ);
  if (officialsReply) return officialsReply;

  // 5. Health Center & Emergency Hotlines
  const healthReply = handleHealthAndEmergencyQuery(cleanQ);
  if (healthReply) return healthReply;

  // 6. SK Programs
  const skReply = await handleSkQuery(cleanQ);
  if (skReply) return skReply;

  // 7. Events
  const eventsReply = await handleEventsQuery(cleanQ);
  if (eventsReply) return eventsReply;

  // 8. Transparency & Budget
  const transparencyReply = await handleTransparencyQuery(cleanQ);
  if (transparencyReply) return transparencyReply;

  // 9. Directory, QR Verify & Portal Links
  const directoryReply = handleDirectoryAndLinksQuery(cleanQ);
  if (directoryReply) return directoryReply;

  // 10. Location, Office Hours & Barangay Stats
  const locationReply = handleLocationAndAboutQuery(cleanQ);
  if (locationReply) return locationReply;

  // 11. Greetings & Thanks
  const greetingReply = handleGreetings(cleanQ);
  if (greetingReply) return greetingReply;

  // 12. Out-of-Scope Fallback with Suggested Prompts
  return handleOutOfScopeQuery();
}
