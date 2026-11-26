package ph.gov.barangayonse.smartonse

/**
 * SampleDataRepository.kt
 *
 * Predefined static sample data based on the SmartOnse Capstone 2 Website
 * (Barangay Onse, San Juan City Digital E-Governance Portal).
 *
 * Per Final Group Project Guidelines:
 * - No external database connection is required; all services, officials,
 *   statistics, and tracking records are stored in predefined Kotlin data classes
 *   and in-memory lists to demonstrate the application's UI and logic offline.
 */
data class BarangayServiceItem(
    val id: String,
    val code: String,
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

object SampleDataRepository {

    val barangayStats = listOf(
        Triple("3,824", "Population", "Registered Residents"),
        Triple("1,250", "Registered Voters", "COMELEC Precincts"),
        Triple("412", "Active Businesses", "Local Establishments"),
        Triple("6", "E-Services", "Online Certificates")
    )

    val servicesList = listOf(
        BarangayServiceItem(
            id = "SRV-01",
            code = "BRGY_CLEARANCE",
            title = "Barangay Clearance",
            category = "General Issuance",
            fee = "₱50.00",
            processingTime = "1 Business Day",
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
            title = "Certificate of Residency",
            category = "Civil Verification",
            fee = "₱30.00",
            processingTime = "1 Business Day",
            description = "Official document certifying that the applicant is a bonafide resident of Barangay Onse, San Juan City.",
            requirements = listOf(
                "Valid ID showing Barangay Onse residential address",
                "Minimum of 6 months residency verification"
            )
        ),
        BarangayServiceItem(
            id = "SRV-03",
            code = "CERT_INDIGENCY",
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
            title = "First-Time Jobseeker Certificate",
            category = "Youth & Employment Aid",
            fee = "FREE (R.A. 11261)",
            processingTime = "Same Day",
            description = "Waives government pre-employment document fees (NBI, Police Clearance, Birth Certificate) under Republic Act No. 11261 for first-time job applicants.",
            requirements = listOf(
                "Signed Barangay Oath of Undertaking (R.A. 11261 Form)",
                "Valid School ID, Diploma, or PSA Birth Certificate",
                "At least 6 months residency in Barangay Onse"
            )
        ),
        BarangayServiceItem(
            id = "SRV-05",
            code = "BUSINESS_CLEARANCE",
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
        OfficialItem("Hon. Abigail A. Reyes", "SK Kagawad", "Committee on Health & Nutrition", "0917-888-0022", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Ethan Jetter D.G. Garcia", "SK Kagawad", "Committee on Education & Culture", "0917-888-0023", "Sangguniang Kabataan (SK)"),
        OfficialItem("Hon. Alexis Adrianne R. Luciano", "SK Kagawad", "Committee on Digital Arts & Innovation", "0917-888-0024", "Sangguniang Kabataan (SK)")
    )

    // Predefined sample tracking records + newly submitted session requests
    val trackingRecords = mutableListOf(
        TrackingRecord(
            trackingNumber = "ONSE-2026-0001",
            applicantName = "Juan Dela Cruz",
            contactNumber = "09171234567",
            address = "42 Ibuna Street, Barangay Onse, San Juan City",
            documentType = "Barangay Clearance",
            purpose = "Local Employment Requirement",
            copies = 2,
            fee = "₱100.00",
            status = "READY FOR PICKUP",
            filedDate = "Nov 25, 2026 • 10:15 AM",
            remarks = "Approved and signed by Punong Barangay Roberto B. Alba. Please bring 1 valid ID to Window 1."
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
            remarks = "Currently undergoing verification by Barangay Secretariat."
        ),
        TrackingRecord(
            trackingNumber = "ONSE-2026-0003",
            applicantName = "Kevin R. Bautista",
            contactNumber = "09951112233",
            address = "105 Hoover Street, Barangay Onse, San Juan City",
            documentType = "First-Time Jobseeker Certificate",
            purpose = "Pre-Employment NBI & Police Clearance Fee Waiver (R.A. 11261)",
            copies = 1,
            fee = "FREE (R.A. 11261)",
            status = "COMPLETED",
            filedDate = "Nov 20, 2026 • 02:30 PM",
            remarks = "Claimed by applicant at Barangay Onse Hall."
        )
    )

    fun findServiceById(id: String?): BarangayServiceItem {
        return servicesList.find { it.id == id } ?: servicesList.first()
    }

    fun findTrackingByCode(code: String): TrackingRecord? {
        val clean = code.trim().uppercase()
        return trackingRecords.find { it.trackingNumber.uppercase() == clean }
    }

    fun generateNextTrackingCode(): String {
        val nextNum = trackingRecords.size + 1
        return String.format("ONSE-2026-%04d", nextNum)
    }
}
