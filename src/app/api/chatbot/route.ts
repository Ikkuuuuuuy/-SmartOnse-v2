import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const q = (message || '').toLowerCase();

    let reply = "Mabuhay! You can apply for Barangay Clearance, Indigency, and Residency directly through our online portal. For assistance, visit Barangay Onse Hall or call (02) 8123-4567.";

    if (q.includes('clearance')) {
      reply = "To get a Barangay Clearance: 1. Fill out our online form at /portal/request. 2. Fee is ₱50.00 (exempt for first-time jobseekers under RA 11261). 3. Processing takes 24 hours.";
    } else if (q.includes('indigency')) {
      reply = "Certificate of Indigency is 100% FREE. It is issued for PAO legal aid, hospital assistance, medical bills, or educational scholarships. Apply online at /portal/request.";
    } else if (q.includes('health') || q.includes('vaccine') || q.includes('doctor')) {
      reply = "Our Barangay Onse Health Center offers free doctor consultations, prenatal checkups, child vaccinations, and senior maintenance medicine from Mon-Fri, 8 AM - 5 PM. Book an appointment at /health-center.";
    } else if (q.includes('emergency') || q.includes('hotline') || q.includes('fire') || q.includes('police')) {
      reply = "Emergency Hotlines:\n• Barangay Onse Desk: (02) 8123-4567\n• San Juan CDRRMO: (02) 8722-9837\n• San Juan Police: (02) 8724-2509\n• San Juan Fire Station: (02) 8723-9371";
    } else if (q.includes('sk') || q.includes('youth') || q.includes('scholarship')) {
      reply = "SK Barangay Onse conducts educational assistance programs, coding bootcamps, and sports leagues. Check upcoming programs at /sk-programs.";
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
