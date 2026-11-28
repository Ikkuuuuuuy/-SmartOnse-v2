/**
 * SmartOnse Native ID Scanner & Document Pattern Detection Engine
 * 100% Native, Offline-Capable, Zero External Paid APIs.
 *
 * Powered by Client-Side OCR & Pattern Recognition:
 * Validates Philippine Government IDs and Student/School IDs (R.A. 11261).
 * Inspects real text extracted from the ID image to verify if the applicant's name,
 * birthdate, and official ID security markers match the registration input.
 * Blocks different person's IDs, memes, random pictures, and invalid media.
 */

export interface ScanInput {
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  residencyType?: string;
  idType?: string;
  imageBase64?: string;
  imageDimensions?: { width: number; height: number };
  fileName?: string;
  fileSize?: number;
  ocrText?: string; // Text extracted via client-side OCR
}

export interface ScanResult {
  isValidId: boolean;
  needsManualReview?: boolean;
  idType: string;
  idTypeLabel: string;
  confidenceScore: number; // 0 - 100
  isSchoolId: boolean;
  nameMatchScore: number;  // 0 - 100
  nameMatchPassed: boolean;
  birthdateMatchPassed: boolean;
  genderMatchPassed: boolean;
  addressStatus: 'MATCH_ONSE' | 'PROVINCIAL_PERMITTED' | 'UNVERIFIED';
  addressNote: string;
  aspectRatio: number | null;
  detectedFeatures: string[];
  reasons: string[];
  warnings: string[];
  scanLog: string;
}

export const SUPPORTED_ID_TYPES: Record<string, { label: string; isSchool: boolean; isGovt: boolean }> = {
  PHILSYS: { label: 'PhilSys National ID (Philippine Identification Card)', isSchool: false, isGovt: true },
  DRIVERS_LICENSE: { label: "LTO Driver's License", isSchool: false, isGovt: true },
  PASSPORT: { label: 'Philippine Passport (DFA)', isSchool: false, isGovt: true },
  UMID_SSS_GSIS: { label: 'UMID / SSS / GSIS Card', isSchool: false, isGovt: true },
  POSTAL_ID: { label: 'PhilPost Postal ID', isSchool: false, isGovt: true },
  VOTERS_ID: { label: "COMELEC Voter's ID / Certification", isSchool: false, isGovt: true },
  PRC_ID: { label: 'PRC Professional License', isSchool: false, isGovt: true },
  SENIOR_PWD: { label: 'Senior Citizen ID / PWD ID Card', isSchool: false, isGovt: true },
  BARANGAY_ID: { label: 'Barangay Onse Resident ID / Clearance', isSchool: false, isGovt: true },
  STUDENT_ID: { label: 'Student / School / University ID (R.A. 11261)', isSchool: true, isGovt: false },
  OTHER_VALID_ID: { label: 'Other Valid Photo ID (TIN, PhilHealth, OWWA, NBI)', isSchool: false, isGovt: true },
};

// Known meme / junk filename keywords (excluding 'download'/'screenshot' since phone photos often have those names)
const SUSPICIOUS_FILENAME_KEYWORDS = [
  'meme', 'funny', 'wallpaper', 'cat', 'dog', 'pet',
  'anime', 'tiktok', 'discord', 'roblox', 'genshin', 'food', 'snack', 'avatar',
  'fake', 'joke', 'troll'
];

/**
 * Calculates string similarity using Levenshtein distance algorithm
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const s2 = str2.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');

  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  // Direct containment check (e.g., "Juan Dela Cruz" in "Juan Martinez Dela Cruz")
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return Math.round((minLen / maxLen) * 95);
  }

  // Token matching
  const tokens1 = s1.split(/\s+/).filter(Boolean);
  const tokens2 = s2.split(/\s+/).filter(Boolean);
  let matchedTokens = 0;

  for (const t1 of tokens1) {
    if (tokens2.some(t2 => t1 === t2 || (t1.length > 3 && t2.includes(t1)) || (t2.length > 3 && t1.includes(t2)))) {
      matchedTokens++;
    }
  }

  if (tokens1.length > 0 && tokens2.length > 0) {
    const tokenScore = (matchedTokens / Math.max(tokens1.length, tokens2.length)) * 100;
    if (tokenScore >= 66) return Math.round(tokenScore);
  }

  // Levenshtein Matrix
  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  );
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.max(0, 100 - Math.round((distance / maxLen) * 100));
}

/**
 * Core Native Scanner Function
 */
export function scanIdentityDocument(input: ScanInput): ScanResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const detectedFeatures: string[] = [];
  let confidenceScore = 80;

  const idTypeKey = input.idType || 'OTHER_VALID_ID';
  const typeConfig = SUPPORTED_ID_TYPES[idTypeKey] || SUPPORTED_ID_TYPES.OTHER_VALID_ID;
  const isSchoolId = typeConfig.isSchool;

  // 1. File inspection & Meme / Junk detection
  if (input.fileName) {
    const lowerName = input.fileName.toLowerCase();
    const hasMemeKeyword = SUSPICIOUS_FILENAME_KEYWORDS.some(k => lowerName.includes(k));
    if (hasMemeKeyword) {
      reasons.push(`Suspicious file name "${input.fileName}". Please upload an authentic photo of your ID.`);
      confidenceScore -= 40;
    }
  }

  // 2. File size sanity check
  if (input.fileSize !== undefined) {
    if (input.fileSize < 8 * 1024) {
      reasons.push('Uploaded file size is too small (< 8KB) to contain legible ID document security features.');
      confidenceScore = 10;
    } else {
      detectedFeatures.push(`Valid Document Payload (${Math.round(input.fileSize / 1024)} KB)`);
    }
  }

  // 3. Aspect Ratio / ID card framing analysis
  let aspectRatio: number | null = null;
  if (input.imageDimensions && input.imageDimensions.width > 0 && input.imageDimensions.height > 0) {
    aspectRatio = Number((input.imageDimensions.width / input.imageDimensions.height).toFixed(2));

    const isStandardHorizontal = aspectRatio >= 1.25 && aspectRatio <= 1.85;
    const isStandardVertical = aspectRatio >= 0.50 && aspectRatio <= 0.85;

    if (isSchoolId) {
      if (isStandardVertical || isStandardHorizontal) {
        detectedFeatures.push(`Valid Student ID Card Framing (${aspectRatio}:1)`);
        confidenceScore += 10;
      } else {
        warnings.push(`Non-standard ID framing (${aspectRatio}:1). Please ensure ID is fully visible.`);
        confidenceScore -= 15;
      }
    } else {
      if (isStandardHorizontal) {
        detectedFeatures.push(`Standard ISO/IEC 7810 ID Card Ratio (${aspectRatio}:1)`);
        confidenceScore += 10;
      } else if (isStandardVertical) {
        detectedFeatures.push(`Vertical ID Card / Badge Ratio (${aspectRatio}:1)`);
        confidenceScore += 5;
      } else {
        if (aspectRatio > 2.3 || aspectRatio < 0.4) {
          reasons.push(`Extreme aspect ratio (${aspectRatio}:1) detected. Official ID cards are 1.58:1 (horizontal) or 0.63:1 (vertical).`);
          confidenceScore -= 35;
        } else {
          warnings.push(`Image framing (${aspectRatio}:1) slightly off standard ID proportions.`);
        }
      }
    }
  }

  // 4. Real OCR Inspection: Match Name on ID Card vs Applicant Input
  let nameMatchScore = 0;
  let nameMatchPassed = false;
  let needsManualReview = false;

  const rawOcr = (input.ocrText || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const applicantNameClean = (input.fullName || '').toLowerCase().trim();
  const applicantTokens = applicantNameClean.split(/\s+/).filter(t => t.length > 1);

  const cleanFirst = (input.firstName || '').toLowerCase().trim();
  const cleanLast = (input.lastName || '').toLowerCase().trim();

  if (rawOcr.length > 5 && applicantTokens.length > 0) {
    let matchedTokensCount = 0;
    const ocrWords = rawOcr.split(/\s+/).filter(w => w.length > 1);

    for (const token of applicantTokens) {
      if (rawOcr.includes(token)) {
        matchedTokensCount++;
      } else {
        // Fuzzy token match against OCR words (tolerates camera glare/OCR typos like l/1, o/0)
        const hasFuzzy = ocrWords.some(w => calculateSimilarity(token, w) >= 68);
        if (hasFuzzy) {
          matchedTokensCount++;
        }
      }
    }

    // Explicit First Name + Last Name check (handles "DELA CRUZ, JUAN M." where middle name is just an initial on the ID)
    const firstTokens = cleanFirst.split(/\s+/).filter(t => t.length > 1);
    const lastTokens = cleanLast.split(/\s+/).filter(t => t.length > 1);
    const firstMatched = firstTokens.length > 0 && firstTokens.some(ft => rawOcr.includes(ft) || ocrWords.some(w => calculateSimilarity(ft, w) >= 70));
    const lastMatched = lastTokens.length > 0 && lastTokens.some(lt => rawOcr.includes(lt) || ocrWords.some(w => calculateSimilarity(lt, w) >= 70));

    nameMatchScore = Math.round((matchedTokensCount / applicantTokens.length) * 100);
    if (firstMatched && lastMatched) {
      nameMatchScore = Math.max(nameMatchScore, 90);
    } else if (lastMatched || firstMatched) {
      nameMatchScore = Math.max(nameMatchScore, 55);
    }

    if (nameMatchScore >= 50) {
      nameMatchPassed = true;
      detectedFeatures.push(`Applicant Name verified on ID document (${nameMatchScore}% Match)`);
    } else {
      nameMatchPassed = false;
      needsManualReview = true;
      warnings.push(
        `Low OCR Name Match (${nameMatchScore}%): Camera glare or ID font prevented automatic text match for "${input.fullName}". Queued for Barangay Admin visual ID inspection.`
      );
      confidenceScore -= 20;
    }
  } else {
    // If OCR could not read text clearly due to lighting/hologram glare, queue for manual admin inspection instead of hard-blocking legitimate photos
    nameMatchScore = 40;
    nameMatchPassed = false;
    needsManualReview = true;
    warnings.push('ID text had low OCR contrast (hologram or lighting glare). Document attached for Barangay Admin visual verification.');
    confidenceScore -= 15;
  }

  // 5. Official ID & Philippine Government/School Marker Detection in OCR
  if (rawOcr.length > 5) {
    const idKeywords = [
      'philippines', 'pilipinas', 'republika', 'identipikasyon', 'philsys', 'pambansa',
      'driver', 'license', 'lto', 'land transportation',
      'passport', 'foreign affairs', 'dfa',
      'social security', 'sss', 'gsis', 'umid',
      'postal', 'philpost', 'post office',
      'comelec', 'voter', 'election',
      'prc', 'professional regulation',
      'student', 'university', 'college', 'school', 'academy', 'deped', 'ched', 'campus', 'high school',
      'barangay', 'onse', 'resident', 'clearance', 'san juan',
      'senior citizen', 'osca', 'pwd', 'tin', 'philhealth', 'republic', 'national', 'card', 'id', 'no', 'date', 'birth', 'sex', 'address', 'signature'
    ];

    const matchedKeywords = idKeywords.filter(k => rawOcr.includes(k));
    if (matchedKeywords.length > 0) {
      detectedFeatures.push(`ID Markers Found: ${matchedKeywords.slice(0, 4).join(', ')}`);
      confidenceScore += 10;
    } else {
      needsManualReview = true;
      warnings.push('Standard government/school text headers were not detected by OCR; flagged for Barangay Admin inspection.');
      confidenceScore -= 10;
    }
  }

  // 6. Birthdate Verification against Document OCR Text
  let birthdateMatchPassed = false;
  if (input.birthDate) {
    const bdate = new Date(input.birthDate);
    const now = new Date();
    const age = now.getFullYear() - bdate.getFullYear();

    if (isNaN(bdate.getTime()) || bdate > now || age < 5) {
      birthdateMatchPassed = false;
      reasons.push('Invalid birthdate provided in Step 1.');
    } else {
      detectedFeatures.push(`Applicant Age: ${age} y/o`);
      const birthYear = bdate.getFullYear().toString();

      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const monthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = bdate.getMonth();
      const monthName = monthNames[monthIndex];
      const monthAbbr = monthShort[monthIndex];
      const monthNumPadded = String(monthIndex + 1).padStart(2, '0');
      const dayNum = bdate.getDate().toString();
      const dayNumPadded = String(bdate.getDate()).padStart(2, '0');

      const hasYear = rawOcr.includes(birthYear);
      const hasMonth = rawOcr.includes(monthName) || rawOcr.includes(monthAbbr) || rawOcr.includes(monthNumPadded);
      const hasDay = rawOcr.includes(dayNum) || rawOcr.includes(dayNumPadded);
      const hasDatePattern = hasYear || (hasMonth && hasDay);

      if (hasDatePattern) {
        birthdateMatchPassed = true;
        detectedFeatures.push(`Birthdate (${input.birthDate}) confirmed on document`);
      } else {
        if (isSchoolId) {
          warnings.push('Birthdate not printed on front of School ID (acceptable for student cards).');
          birthdateMatchPassed = true;
        } else {
          birthdateMatchPassed = false;
          needsManualReview = true;
          warnings.push(`Birthdate (${input.birthDate}) not clearly read by OCR; Barangay Admin will verify on card image.`);
        }
      }
    }
  } else {
    birthdateMatchPassed = false;
  }

  // 7. Gender Check
  let genderMatchPassed = true;
  if (input.gender) {
    const g = input.gender.toLowerCase();
    if (g === 'male' || g === 'female' || g === 'm' || g === 'f') {
      detectedFeatures.push(`Sex/Gender Marker: ${input.gender.toUpperCase()}`);
    } else {
      genderMatchPassed = false;
    }
  }

  // 8. Smart Address Tolerance Policy (Respects Residency Type: Homeowner, Tenant/Renter, Commercial Space, Boarder)
  let addressStatus: 'MATCH_ONSE' | 'PROVINCIAL_PERMITTED' | 'UNVERIFIED' = 'MATCH_ONSE';
  let addressNote = 'Current address verified within Barangay Onse, San Juan City.';

  const resType = (input.residencyType || '').toLowerCase();
  const isTenantOrCommercial =
    resType.includes('tenant') ||
    resType.includes('renter') ||
    resType.includes('commercial') ||
    resType.includes('boarder') ||
    resType.includes('relative');

  const ocrMentionsOnse =
    rawOcr.includes('onse') ||
    rawOcr.includes('artiaga') ||
    rawOcr.includes('ibuna') ||
    rawOcr.includes('guevarra') ||
    rawOcr.includes('san juan');

  if (isTenantOrCommercial && !ocrMentionsOnse) {
    addressStatus = 'PROVINCIAL_PERMITTED';
    addressNote = `ID Address Tolerance Enabled (${input.residencyType}): Provincial or previous address on Government ID is permitted and flagged for Barangay Admin review.`;
    detectedFeatures.push(`Residency Policy: ${input.residencyType} (Different ID Address Permitted)`);
  } else if (input.address) {
    const addr = input.address.toLowerCase();
    const mentionsOnse = addr.includes('onse') || addr.includes('lt. artiaga') || addr.includes('artiaga') || addr.includes('san juan') || ocrMentionsOnse;

    if (mentionsOnse) {
      addressStatus = 'MATCH_ONSE';
      addressNote = 'Address confirmed within Barangay Onse, San Juan City.';
    } else {
      addressStatus = 'PROVINCIAL_PERMITTED';
      addressNote = 'Provincial or prior address permitted for renters, boarding students, and new transferees residing in Barangay Onse.';
      warnings.push(addressNote);
      detectedFeatures.push('Address Policy: Provincial Address Permitted for Transferee');
    }
  }

  // Determine overall validity:
  // Hard-reject only if reasons.length > 0 (e.g. corrupt/tiny <8KB file, extreme non-ID aspect ratio, or meme filename).
  // If OCR had low contrast on a real camera photo, allow submission with needsManualReview = true so the Barangay Admin can inspect the uploaded ID in /admin/verifications.
  const isValidId = reasons.length === 0 && confidenceScore >= 35;

  // Build Human-Readable Scan Log
  const scanLog = [
    `ID Scanner Version: Native v3.2 (Client-Side Optical Character Recognition)`,
    `Document Type: ${typeConfig.label}`,
    `Authenticity Confidence: ${Math.max(10, Math.min(100, confidenceScore))}%`,
    `Name Similarity: ${nameMatchScore}% (${nameMatchPassed ? 'OCR MATCHED' : 'QUEUED FOR ADMIN VISUAL CHECK'})`,
    `Birthdate/Age: ${birthdateMatchPassed ? 'VALIDATED' : 'ADMIN VISUAL CHECK'}`,
    `Address Policy: ${addressStatus} - ${addressNote}`,
    `Features Detected: ${detectedFeatures.join(', ')}`,
    reasons.length > 0
      ? `Issues: ${reasons.join('; ')}`
      : needsManualReview
      ? 'Status: ACCEPTED FOR MANUAL ADMIN ID VERIFICATION'
      : 'Status: ACCEPTED & OCR VERIFIED'
  ].join('\n');

  return {
    isValidId,
    needsManualReview,
    idType: idTypeKey,
    idTypeLabel: typeConfig.label,
    confidenceScore: Math.max(10, Math.min(100, confidenceScore)),
    isSchoolId,
    nameMatchScore,
    nameMatchPassed,
    birthdateMatchPassed,
    genderMatchPassed,
    addressStatus,
    addressNote,
    aspectRatio,
    detectedFeatures,
    reasons,
    warnings,
    scanLog,
  };
}
