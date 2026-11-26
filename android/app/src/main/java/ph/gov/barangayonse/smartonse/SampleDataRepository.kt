package ph.gov.barangayonse.smartonse

/**
 * SampleDataRepository.kt
 *
 * Predefined static sample data reproducing the full SmartOnse Capstone 2 Website
 * (Barangay Onse, San Juan City Digital E-Governance Portal) without requiring an
 * external database connection.
 */
data class BarangayServiceItem(
    val id: String,
    val code: String,
    val icon: String,
    val badge: String,
    val title: String,
    val category: String,
    val fee: String,
    val processingTime: String,
    val description: String,
    val requirements: List<String>
)

data class OfficialItem(
    val name: String,
    val position: String,
    val committee: String,
    val contact: String,
    val council: String // "Barangay Council" or "Sangguniang Kabataan (SK)"
)

data class TrackingRecord(
    val trackingNumber: String,
    val applicantName: String,
    val contactNumber: String,
    val address: String,
    val documentType: String,
    val purpose: String,
    val copies: Int,
    val fee: String,
    val status: String, // "READY FOR PICKUP", "PROCESSING", "PENDING", "COMPLETED"
    val filedDate: String,
    val remarks: String
)

data class TransparencyItem(
    val code: String,
    val title: String,
    val category: String,
    val quarter: String,
    val year: String,
    val fileSize: String,
    val council: String // "BARANGAY" or "SK"
)

data class SkProgramItem(
    val code: String,
    val title: String,
    val category: String,
    val status: String,
    val objective: String,
    val schedule: String,
    val budget: String
)

data class BarangayEventItem(
    val title: String,
    val category: String,
    val date: String,
    val time: String,
    val location: String,
    val description: String
)

data class DemoRoleAccount(
    val id: String,
    val roleTitle: String,
    val fullName: String,
    val email: String,
    val badge: String
)

object SampleDataRepository {

    // Active simulated logged-in user (defaults to Resident Juan Dela Cruz or Guest)
    var currentUserName: String = "Juan Dela Cruz"
    var currentUserRole: String = "Verified Resident"
    var currentUserEmail: String = "juan@onse.ph"
    var isLoggedIn: Boolean = true

    val demoAccounts = listOf(
        DemoRoleAccount("resident", "Verified Resident", "Juan Dela Cruz", "juan@onse.ph", "👤 Resident Portal"),
        DemoRoleAccount("captain", "Barangay Captain", "Hon. Roberto B. Alba", "captain@onse.gov.ph", "👑 Punong Barangay"),
        DemoRoleAccount("staff", "Desk Records Officer", "Jonathan D. Sorio", "records@onse.gov.ph", "📋 Window 1 Staff"),
        DemoRoleAccount("kagawad", "Barangay Kagawad", "Hon. Danilo A. Florano", "kagawad@onse.gov.ph", "🏛️ Council Member"),
        DemoRoleAccount("sk", "SK Chairperson", "Hon. John Michael Permato", "sk@onse.gov.ph", "⚡ Youth Council")
    )

    val servicesList = listOf(
        BarangayServiceItem(
            id = "SRV-01",
            code = "BRGY_CLEARANCE",
            icon = "📄",
            badge = "MOST REQUESTED",
            title = "Barangay Clearance",
            category = "General Issuance",
            fee = "₱50.00",
            processingTime = "24 Hours / 1 Business Day",
            description = "Official clearance certifying residency and good moral standing in Barangay Onse for employment, postal ID, bank requirements, or legal transactions.",
            requirements = listOf(
                "Valid Government ID or Student ID with photo",
                "Proof of residency (Utility bill / Lease contract)",
                "Community Tax Certificate (Cedula)"
            )
        ),
        BarangayServiceItem(
            id = "SRV-02",
            code = "CERT_RESIDENCY",
            icon = "🏠",
            badge = "FAST TRACK",
            title = "Certificate of Residency",
            category = "Civil Verification",
            fee = "₱30.00",
            processingTime = "Same Day",
            description = "Official document certifying that the applicant is a bonafide resident of Barangay Onse, San Juan City.",
            requirements = listOf(
                "Valid ID showing Barangay Onse residential address",
                "Minimum of 6 months continuous residency verification"
            )
        ),
        BarangayServiceItem(
            id = "SRV-03",
            code = "CERT_INDIGENCY",
            icon = "🤝",
            badge = "SOCIAL WELFARE",
            title = "Certificate of Indigency",
            category = "Social Welfare & Health",
            fee = "FREE",
            processingTime = "Same Day",
            description = "Issued to low-income residents of Barangay Onse to avail of medical, hospital, educational scholarship, DSWD, or legal assistance.",
            requirements = listOf(
                "Barangay ID or Voter's Certification",
                "Hospital Bill, Medical Abstract, or School Assessment Slip"
            )
        ),
        BarangayServiceItem(
            id = "SRV-04",
            code = "FIRST_TIME_JOBSEEKER",
            icon = "🎓",
            badge = "FREE • R.A. 11261",
            title = "First-Time Jobseeker Certificate",
            category = "Youth & Employment Aid",
            fee = "FREE (R.A. 11261)",
            processingTime = "Same Day",
            description = "Waives government pre-employment document fees (NBI, Police Clearance, Birth Certificate) under Republic Act No. 11261 for entry-level job applicants.",
            requirements = listOf(
                "Signed Barangay Oath of Undertaking (R.A. 11261 Form)",
                "Valid School ID, Diploma, or PSA Birth Certificate",
                "At least 6 months residency in Barangay Onse"
            )
        ),
        BarangayServiceItem(
            id = "SRV-05",
            code = "BUSINESS_CLEARANCE",
            icon = "🏢",
            badge = "COMMERCIAL PERMIT",
            title = "Barangay Business Clearance",
            category = "Commerce & Permits",
            fee = "₱250.00",
            processingTime = "2 Business Days",
            description = "Required annual commercial clearance for stores, sari-sari stores, and business establishments operating within Barangay Onse.",
            requirements = listOf(
                "DTI Business Name or SEC Registration Certificate",
                "Contract of Lease or Proof of Property Ownership",
                "Previous Barangay Business Clearance (for renewals)"
            )
        ),
        BarangayServiceItem(
            id = "SRV-06",
            code = "SOLO_PARENT_CERT",
            icon = "❤️",
            badge = "R.A. 11861 AID",
            title = "Solo Parent Residency Endorsement",
            category = "Social Welfare & Health",
            fee = "FREE",
            processingTime = "1 Business Day",
            description = "Barangay certification endorsing solo parents to the San Juan City CSWDD for Solo Parent ID issuance under R.A. 11861.",
            requirements = listOf(
                "Valid Government ID with Barangay Onse address",
                "PSA Birth Certificate of dependent child/children",
                "Sworn Affidavit of Solo Parent status"
            )
        )
    )

    val officialsList = listOf(
        OfficialItem("Hon. Roberto B. Alba", "Barangay Chairman", "Executive & Peace and Order", "0917-888-0011", "Barangay Council"),
        OfficialItem("Elena V. Gutierrez", "Barangay Treasurer", "Finance, Budget & Appropriations", "0917-888-0029", "Barangay Council"),
        OfficialItem("Maria Elena C. Gomez", "Barangay Secretary", "Secretariat & Administrative Records", "0917-888-0030", "Barangay Council"),
        OfficialItem("Hon. Danilo A. Florano", "Barangay Kagawad", "Committee on Public Works", "0917-888-0012", "Barangay Council"),
        OfficialItem("Hon. Zenaida C. Casao", "Barangay Kagawad", "Committee on Health & Sanitation", "0917-888-0013", "Barangay Council"),
        OfficialItem("Hon. Ryan Lopez Lorbes", "Barangay Kagawad", "Committee on Cleanliness & Environment", "0917-888-0014", "Barangay Council"),
        OfficialItem("Hon. John Mark Cortez Daradal", "Barangay Kagawad", "Committee on Ways and Means", "0917-888-0015", "Barangay Council"),
        OfficialItem("Hon. Federico Soller Deniega", "Barangay Kagawad", "Committee on Peace and Order", "0917-888-0016", "Barangay Council"),
        OfficialItem("Hon. Miguel Arguelles Zamora Jr.", "Barangay Kagawad", "Committee on Education", "0917-888-0017", "Barangay Council"),
        OfficialItem("Hon. Rafael Lasin Borjal Jr.", "Barangay Kagawad", "Committee on Transportation & Traffic", "0917-888-0018", "Barangay Council"),
        OfficialItem("Hon. John Michael D. Permato", "SK Chairperson", "Youth Leadership & Sports", "0917-888-0019", "Sangguniang Kabataan (SK)"),
        OfficialItem("Michaelito Bongalos", "SK Treasurer", "Youth Budget & Appropriations", "0917-888-0020", "Sangguniang Kabataan (SK)"),
        OfficialItem("Jonathan D. Sorio", "SK Secretary", "Youth Records & Secretariat", "0917-888-0021", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Abigail A. Reyes", "SK Kagawad", "Committee on Health & Nutrition", "0917-888-0022", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Ethan Jetter D.G. Garcia", "SK Kagawad", "Committee on Education & Culture", "0917-888-0023", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Alexis Adrianne R. Luciano", "SK Kagawad", "Committee on Digital Arts & Innovation", "0917-888-0024", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Sherric Q. Pantaleon", "SK Kagawad", "Committee on Sports Development", "0917-888-0025", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Sherwin Reyes", "SK Kagawad", "Committee on Environmental Protection", "0917-888-0026", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Ian Jeffrey L. Cadiang", "SK Kagawad", "Committee on Anti-Drug Abuse Youth Campaign", "0917-888-0027", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Joshua D. Munsayac", "SK Kagawad", "Committee on Disaster Preparedness", "0917-888-0028", "Sangguniang Kabataan (SK)")
    )

    val transparencyDocs = listOf(
        TransparencyItem("FDB-2026-01", "CY 2026 Annual Barangay Budget & Appropriations Ordinance", "Financial Budget", "Annual", "2026", "2.4 MB PDF", "BARANGAY"),
        TransparencyItem("FDB-2026-02", "Q2 2026 20% Barangay Development Fund (BDF) Utilization Report", "Development Fund", "Q2", "2026", "1.8 MB PDF", "BARANGAY"),
        TransparencyItem("FDB-2026-03", "CY 2026 Annual Procurement Plan (APP) & BAC Bid Resolutions", "Procurement", "Annual", "2026", "3.1 MB PDF", "BARANGAY"),
        TransparencyItem("FDB-2026-04", "Q2 2026 Gender and Development (GAD) Fund Accomplishment Report", "GAD Fund", "Q2", "2026", "1.2 MB PDF", "BARANGAY"),
        TransparencyItem("FDB-2026-05", "SK Annual Barangay Youth Investment Program (ABYIP 2026)", "SK Investment Plan", "Annual", "2026", "2.1 MB PDF", "SK"),
        TransparencyItem("FDB-2026-06", "SK Q2 2026 Youth Development Fund (YDF) Itemized Receipts", "SK Financial", "Q2", "2026", "1.5 MB PDF", "SK"),
        TransparencyItem("FDB-2025-07", "Comprehensive Barangay Youth Development Plan (CBYDP 2024-2026)", "SK Strategic Plan", "Annual", "2025", "4.5 MB PDF", "SK"),
        TransparencyItem("FDB-2025-08", "Notice of Award - Multi-Purpose Hall Rehabilitation Project", "Bids & Awards", "Q4", "2025", "950 KB PDF", "BARANGAY")
    )

    val skPrograms = listOf(
        SkProgramItem(
            "SK-PROG-01",
            "SK Inter-Purok Youth Tournament 2026",
            "Sports & Wellness",
            "ACTIVE",
            "Promote healthy lifestyles, teamwork, and drug-free youth through inter-purok basketball and volleyball leagues.",
            "Every Saturday & Sunday • 2:00 PM - 7:00 PM",
            "₱150,000.00"
        ),
        SkProgramItem(
            "SK-PROG-02",
            "Onse Youth Academic Excellence & Educational Assistance",
            "Education",
            "OPEN FOR APPLICANTS",
            "Provide cash subsidies, school supplies, and digital learning modules for deserving senior high and college students.",
            "Quarterly Application & Distribution",
            "₱250,000.00"
        ),
        SkProgramItem(
            "SK-PROG-03",
            "Katipunan ng Kabataan (KK) Youth Summit",
            "Governance & Leadership",
            "UPCOMING",
            "Engage youth in local governance, participatory budgeting, and anti-drug advocacy (YADAS) workshops.",
            "Onse Multi-Purpose Court",
            "₱85,000.00"
        ),
        SkProgramItem(
            "SK-PROG-04",
            "Digital Arts, Media & Tech Innovation Workshop",
            "Skills & Livelihood",
            "ACTIVE",
            "Free graphic design, video editing, and coding bootcamps for aspiring youth freelancers and digital creators.",
            "Bi-weekly Sessions at the SK Digital Hub",
            "₱120,000.00"
        )
    )

    val barangayEvents = listOf(
        BarangayEventItem(
            "General Barangay Assembly & State of the Barangay Address (SOBA)",
            "BARANGAY ASSEMBLY",
            "September 15, 2026",
            "9:00 AM - 12:00 PM",
            "Barangay Onse Covered Court",
            "Mandatory assembly for all residents of Barangay Onse to discuss local projects, budget utilization, peace and order, and community programs."
        ),
        BarangayEventItem(
            "Free Anti-Rabies Vaccination & Pet Microchipping Drive",
            "HEALTH & SANITATION",
            "September 28, 2026",
            "8:00 AM - 3:00 PM",
            "Barangay Onse Multi-Purpose Hall",
            "Free pet immunization campaign in partnership with the San Juan City Veterinary Office."
        ),
        BarangayEventItem(
            "Community Clean-Up Drive & Dengue Vector Control",
            "ENVIRONMENT",
            "October 12, 2026",
            "6:00 AM - 10:00 AM",
            "Assembly at Barangay Onse Hall",
            "Barangay-wide sanitation initiative and larvicide application to prevent dengue and maintain clean streets."
        )
    )

    // Predefined sample tracking records + newly submitted session requests
    val trackingRecords = mutableListOf(
        TrackingRecord(
            trackingNumber = "ONSE-2026-8891",
            applicantName = "Ma. Teresa Santos",
            contactNumber = "09171234567",
            address = "Purok 2, Lt. Artiaga St., Barangay Onse, San Juan City",
            documentType = "Barangay Clearance",
            purpose = "Local Employment & Bank Account Requirement",
            copies = 2,
            fee = "₱100.00",
            status = "READY FOR PICKUP",
            filedDate = "Nov 25, 2026 • 10:15 AM",
            remarks = "Signed by Punong Barangay Roberto B. Alba. Please claim at Desk Window 2 with 1 Valid Government ID."
        ),
        TrackingRecord(
            trackingNumber = "ONSE-2026-0001",
            applicantName = "Juan Dela Cruz",
            contactNumber = "09171234567",
            address = "42 Ibuna Street, Barangay Onse, San Juan City",
            documentType = "Barangay Clearance",
            purpose = "Pre-Employment Requirement",
            copies = 1,
            fee = "₱50.00",
            status = "READY FOR PICKUP",
            filedDate = "Nov 25, 2026 • 02:40 PM",
            remarks = "Approved and stamped with Official Barangay Seal. Ready for release at Window 2."
        ),
        TrackingRecord(
            trackingNumber = "ONSE-2026-0002",
            applicantName = "Maria Clara Santos",
            contactNumber = "09187654321",
            address = "18 J. Arellano Street, Barangay Onse, San Juan City",
            documentType = "Certificate of Indigency",
            purpose = "Medical Assistance at San Juan Medical Center",
            copies = 1,
            fee = "FREE",
            status = "PROCESSING",
            filedDate = "Nov 26, 2026 • 09:00 AM",
            remarks = "Step 2 of 4: Desk Officer Verification in progress (cross-referencing voter precinct registry)."
        ),
        TrackingRecord(
            trackingNumber = "ONSE-2026-0003",
            applicantName = "Joshua Lim",
            contactNumber = "09951112233",
            address = "105 J.V. Panganiban St., Barangay Onse, San Juan City",
            documentType = "First-Time Jobseeker Certificate",
            purpose = "Pre-Employment NBI & Police Clearance Fee Waiver (R.A. 11261)",
            copies = 1,
            fee = "FREE (R.A. 11261)",
            status = "COMPLETED",
            filedDate = "Nov 20, 2026 • 02:30 PM",
            remarks = "Step 4 of 4: Claimed by applicant at Barangay Onse Hall."
        )
    )

    fun findServiceById(id: String?): BarangayServiceItem {
        return servicesList.find { it.id == id || it.code.equals(id, true) } ?: servicesList.first()
    }

    fun findTrackingByCode(code: String): TrackingRecord? {
        val clean = code.trim().uppercase()
        return trackingRecords.find { it.trackingNumber.uppercase() == clean }
    }

    fun generateNextTrackingCode(): String {
        val nextNum = 8891 + trackingRecords.size
        return String.format("ONSE-2026-%04d", nextNum)
    }
}
