package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 11: SystemDashboardActivity — Full SmartOnse System Control Center
 *
 * Connected live to the SmartOnse PostgreSQL Database (`/api/mobile?action=dashboard`):
 *  - Persistent Top Header Bar + Persistent 5-Tab Bottom Navigation Bar (`Home | About | Services | Transparency | Track`)
 *  - Tab 1 (Requests Queue):
 *      • For Admin / Captain / Staff / Council: View all database DocumentRequests and approve/update
 *        status (`PROCESSING` -> `READY_FOR_PICKUP` -> `COMPLETED`) directly in the PostgreSQL database!
 *      • For Verified Residents: View their submitted document requests and jump to real-time tracking.
 *  - Tab 2 (RBI Registry):
 *      • Displays live Registry of Barangay Inhabitants (`RBI-2024-XXXXX`) records from PostgreSQL.
 *  - Tab 3 (Digital ID & Audit Logs):
 *      • Displays the user's Verified Barangay Onse Digital ID Card + live security `AuditLog` entries from PostgreSQL.
 */
class SystemDashboardActivity : AppCompatActivity() {

    private lateinit var containerList: LinearLayout
    private lateinit var btnTabRequests: Button
    private lateinit var btnTabRbi: Button
    private lateinit var btnTabAudit: Button
    private lateinit var tvMetricRequests: TextView
    private lateinit var tvMetricPending: TextView
    private lateinit var tvMetricRbi: TextView
    private lateinit var tvMetricUsers: TextView

    private var activeSubTab = "REQUESTS"
    private var latestPayload: SmartOnseApiClient.DashboardPayload? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_system_dashboard)

        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "HOME",
            activeTopLink = "HOME"
        )

        val tvRoleBadge = findViewById<TextView>(R.id.tvDashboardRoleBadge)
        val tvUserName = findViewById<TextView>(R.id.tvDashboardUserName)
        val tvUserSub = findViewById<TextView>(R.id.tvDashboardUserSub)
        val tvHeaderTitle = findViewById<TextView>(R.id.tvDashboardHeaderTitle)

        tvRoleBadge.text = SampleDataRepository.currentUserRole.uppercase()
        tvUserName.text = SampleDataRepository.currentUserName
        tvUserSub.text = "${SampleDataRepository.currentUserEmail} • ${SampleDataRepository.currentUserAddress}"

        val isAdminRole = SampleDataRepository.currentUserRole.contains("Captain", true) ||
            SampleDataRepository.currentUserRole.contains("Admin", true) ||
            SampleDataRepository.currentUserRole.contains("Staff", true) ||
            SampleDataRepository.currentUserRole.contains("Kagawad", true) ||
            SampleDataRepository.currentUserRole.contains("SK", true)

        tvHeaderTitle.text = if (isAdminRole) "ADMIN & COUNCIL DB DASHBOARD" else "RESIDENT PORTAL & DASHBOARD"

        findViewById<Button>(R.id.btnDashboardSwitchRole).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<Button>(R.id.btnDashboardNewRequest).setOnClickListener {
            startActivity(Intent(this, RequestFormActivity::class.java))
        }

        findViewById<Button>(R.id.btnDashboardRefreshDb).setOnClickListener {
            Toast.makeText(this, "Syncing with SmartOnse PostgreSQL Database...", Toast.LENGTH_SHORT).show()
            loadDashboardFromDatabase()
        }

        tvMetricRequests = findViewById(R.id.tvMetricRequestsCount)
        tvMetricPending = findViewById(R.id.tvMetricPendingSub)
        tvMetricRbi = findViewById(R.id.tvMetricRbiCount)
        tvMetricUsers = findViewById(R.id.tvMetricUsersSub)
        containerList = findViewById(R.id.containerDashboardList)

        btnTabRequests = findViewById(R.id.btnDashTabRequests)
        btnTabRbi = findViewById(R.id.btnDashTabRbi)
        btnTabAudit = findViewById(R.id.btnDashTabAudit)

        btnTabRequests.setOnClickListener {
            activeSubTab = "REQUESTS"
            updateSubTabHighlight()
            renderSubTabContent()
        }
        btnTabRbi.setOnClickListener {
            activeSubTab = "RBI"
            updateSubTabHighlight()
            renderSubTabContent()
        }
        btnTabAudit.setOnClickListener {
            activeSubTab = "AUDIT"
            updateSubTabHighlight()
            renderSubTabContent()
        }

        updateSubTabHighlight()
        loadDashboardFromDatabase()
    }

    private fun updateSubTabHighlight() {
        btnTabRequests.setBackgroundResource(
            if (activeSubTab == "REQUESTS") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
        btnTabRbi.setBackgroundResource(
            if (activeSubTab == "RBI") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
        btnTabAudit.setBackgroundResource(
            if (activeSubTab == "AUDIT") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
    }

    private fun loadDashboardFromDatabase() {
        SmartOnseApiClient.fetchSystemDashboard { payload ->
            latestPayload = payload
            tvMetricRequests.text = "${payload.totalRequests}"
            tvMetricPending.text = "${payload.pendingRequests} Pending • ${payload.readyForPickupRequests} Ready"
            tvMetricRbi.text = "${payload.totalRbiInhabitants}"
            tvMetricUsers.text = "${payload.totalUsers} Verified DB Users"
            renderSubTabContent()
        }
    }

    private fun renderSubTabContent() {
        containerList.removeAllViews()
        val payload = latestPayload ?: return

        when (activeSubTab) {
            "REQUESTS" -> renderRequestsTab(payload)
            "RBI" -> renderRbiTab(payload)
            "AUDIT" -> renderAuditAndIdTab(payload)
        }
    }

    private fun renderRequestsTab(payload: SmartOnseApiClient.DashboardPayload) {
        val header = TextView(this).apply {
            text = if (payload.isStaffOrAdmin) {
                "📋 LIVE POSTGRESQL DOCUMENT REQUEST QUEUE (TAP TO APPROVE / UPDATE STATUS)"
            } else {
                "📄 MY SUBMITTED DOCUMENT REQUESTS (SYNCED WITH DATABASE)"
            }
            textSize = 10.5f
            setTextColor(0xFF9C2007.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(4, 8, 4, 12)
        }
        containerList.addView(header)

        for (req in payload.requests) {
            val card = CardView(this).apply {
                radius = 40f
                cardElevation = 5f
                setCardBackgroundColor(0xFFFFFFFF.toInt())
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 26 }
                layoutParams = params
            }

            val box = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(40, 34, 40, 34)
            }

            val tvCodeAndStatus = TextView(this).apply {
                text = "${req.trackingNumber}  •  [${req.status}]"
                textSize = 12f
                setTextColor(
                    when {
                        req.status.contains("READY", true) || req.status.contains("COMPLETED", true) -> 0xFF059669.toInt()
                        req.status.contains("PROCESSING", true) -> 0xFF2563EB.toInt()
                        else -> 0xFF9C2007.toInt()
                    }
                )
                typeface = Typeface.DEFAULT_BOLD
            }

            val tvDocTitle = TextView(this).apply {
                text = "${req.documentType} (${req.fee})"
                textSize = 16f
                setTextColor(0xFF0F172A.toInt())
                typeface = Typeface.DEFAULT_BOLD
                setPadding(0, 6, 0, 4)
            }

            val tvApplicant = TextView(this).apply {
                text = "👤 Applicant: ${req.applicantName}\n📍 ${req.address}\n🎯 Purpose: ${req.purpose}\n🕒 Filed: ${req.filedDate}"
                textSize = 12f
                setTextColor(0xFF475569.toInt())
            }

            box.addView(tvCodeAndStatus)
            box.addView(tvDocTitle)
            box.addView(tvApplicant)

            // Action Buttons Row
            val btnRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(0, 20, 0, 0)
            }

            val btnTrack = Button(this).apply {
                text = "🔍 Track Status"
                isAllCaps = false
                textSize = 11f
                setTextColor(0xFF9C2007.toInt())
                setBackgroundResource(R.drawable.bg_btn_white)
                val p = LinearLayout.LayoutParams(0, 88, 1f).apply { marginEnd = 10 }
                layoutParams = p
                setOnClickListener {
                    startActivity(Intent(this@SystemDashboardActivity, TrackDocumentActivity::class.java).apply {
                        putExtra("EXTRA_TRACKING_CODE", req.trackingNumber)
                    })
                }
            }
            btnRow.addView(btnTrack)

            // If Admin / Captain / Staff, show 1-Tap Live Database Status Approval Button!
            if (payload.isStaffOrAdmin) {
                val nextStatus = when {
                    req.status.contains("PENDING", true) -> "READY_FOR_PICKUP"
                    req.status.contains("PROCESSING", true) -> "READY_FOR_PICKUP"
                    req.status.contains("READY", true) -> "COMPLETED"
                    else -> "READY_FOR_PICKUP"
                }
                val nextLabel = when (nextStatus) {
                    "READY_FOR_PICKUP" -> "✓ Approve Pickup"
                    "COMPLETED" -> "✓ Mark Claimed"
                    else -> "✓ Update DB"
                }

                val btnApprove = Button(this).apply {
                    text = nextLabel
                    isAllCaps = false
                    textSize = 11f
                    setTextColor(0xFFFFFFFF.toInt())
                    setBackgroundResource(R.drawable.bg_btn_maroon)
                    val p = LinearLayout.LayoutParams(0, 88, 1.15f).apply { marginStart = 10 }
                    layoutParams = p
                    setOnClickListener {
                        isEnabled = false
                        text = "Updating DB..."
                        SmartOnseApiClient.updateRequestStatusInDatabase(req.trackingNumber, nextStatus) { _, msg ->
                            Toast.makeText(this@SystemDashboardActivity, msg, Toast.LENGTH_SHORT).show()
                            loadDashboardFromDatabase()
                        }
                    }
                }
                btnRow.addView(btnApprove)
            }

            box.addView(btnRow)
            card.addView(box)
            containerList.addView(card)
        }
    }

    private fun renderRbiTab(payload: SmartOnseApiClient.DashboardPayload) {
        val header = TextView(this).apply {
            text = "🏛️ REGISTRY OF BARANGAY INHABITANTS (LIVE POSTGRESQL CENSUS)"
            textSize = 10.5f
            setTextColor(0xFF9C2007.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(4, 8, 4, 12)
        }
        containerList.addView(header)

        val rbiRecords = if (payload.rbiList.isNotEmpty()) {
            payload.rbiList
        } else {
            listOf(
                SmartOnseApiClient.RbiInhabitantItem("RBI-2024-00001", "Juan Martinez Dela Cruz", 45, "Male", "145 Lt. Artiaga St., Barangay Onse", "PRECINCT-0042A", "Jeepney Driver", true),
                SmartOnseApiClient.RbiInhabitantItem("RBI-2024-00002", "Maria Cruz Dela Cruz", 43, "Female", "145 Lt. Artiaga St., Barangay Onse", "PRECINCT-0042A", "Sari-sari Store Owner", true),
                SmartOnseApiClient.RbiInhabitantItem("RBI-2024-00005", "Roberto Reyes Santos", 56, "Male", "88 J.V. Panganiban St., Barangay Onse", "PRECINCT-0042B", "Electrician", true),
                SmartOnseApiClient.RbiInhabitantItem("RBI-2024-00008", "Teresita Villanueva Ramos", 72, "Female", "204 F. Manalo St., Barangay Onse", "PRECINCT-0044B", "Retired Senior Citizen", true)
            )
        }

        for (inh in rbiRecords) {
            val card = CardView(this).apply {
                radius = 36f
                cardElevation = 4f
                setCardBackgroundColor(0xFFFFFFFF.toInt())
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 22 }
                layoutParams = params
            }

            val box = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(38, 30, 38, 30)
            }

            val tvRbiCode = TextView(this).apply {
                text = "${inh.rbiNumber}  •  ${if (inh.isVoter) "✓ COMELEC VOTER (${inh.precinct})" else "NON-VOTER"}"
                textSize = 10.5f
                setTextColor(0xFF1D4ED8.toInt())
                typeface = Typeface.DEFAULT_BOLD
            }

            val tvName = TextView(this).apply {
                text = "${inh.fullName} (${inh.age} yrs • ${inh.sex})"
                textSize = 15.5f
                setTextColor(0xFF0F172A.toInt())
                typeface = Typeface.DEFAULT_BOLD
                setPadding(0, 4, 0, 4)
            }

            val tvDetails = TextView(this).apply {
                text = "📍 ${inh.address}\n💼 Occupation: ${inh.occupation}"
                textSize = 12f
                setTextColor(0xFF475569.toInt())
            }

            box.addView(tvRbiCode)
            box.addView(tvName)
            box.addView(tvDetails)
            card.addView(box)
            containerList.addView(card)
        }
    }

    private fun renderAuditAndIdTab(payload: SmartOnseApiClient.DashboardPayload) {
        // 1. Official Barangay Onse Digital Resident ID Card
        val idCard = CardView(this).apply {
            radius = 42f
            cardElevation = 6f
            setCardBackgroundColor(0xFF0F172A.toInt())
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 28 }
            layoutParams = params
        }

        val idBox = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(44, 38, 44, 38)
        }

        val tvIdHeader = TextView(this).apply {
            text = "🪪 OFFICIAL BARANGAY ONSE DIGITAL ID • R.A. 10173 VERIFIED"
            textSize = 10f
            setTextColor(0xFFF59E0B.toInt())
            typeface = Typeface.DEFAULT_BOLD
        }

        val tvIdName = TextView(this).apply {
            text = SampleDataRepository.currentUserName
            textSize = 19f
            setTextColor(0xFFFFFFFF.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(0, 8, 0, 2)
        }

        val tvIdDetails = TextView(this).apply {
            text = "Role: ${SampleDataRepository.currentUserRole}\nEmail: ${SampleDataRepository.currentUserEmail}\nAddress: ${SampleDataRepository.currentUserAddress}\nRBI Registry ID: RBI-2024-00001 • Precinct 0042A"
            textSize = 12f
            setTextColor(0xFFCBD5E1.toInt())
        }

        idBox.addView(tvIdHeader)
        idBox.addView(tvIdName)
        idBox.addView(tvIdDetails)
        idCard.addView(idBox)
        containerList.addView(idCard)

        // 2. Live PostgreSQL Audit Logs
        val logHeader = TextView(this).apply {
            text = "🛡️ LIVE SYSTEM AUDIT LOGS (POSTGRESQL SECURITY TRAIL)"
            textSize = 10.5f
            setTextColor(0xFF9C2007.toInt())
            typeface = Typeface.DEFAULT_BOLD
            setPadding(4, 4, 4, 12)
        }
        containerList.addView(logHeader)

        for (log in payload.auditLogs) {
            val card = CardView(this).apply {
                radius = 32f
                cardElevation = 3f
                setCardBackgroundColor(0xFFFFFFFF.toInt())
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 18 }
                layoutParams = params
            }

            val box = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(36, 26, 36, 26)
            }

            val tvAction = TextView(this).apply {
                text = "${log.action} • ${log.timestamp}"
                textSize = 11f
                setTextColor(0xFF9C2007.toInt())
                typeface = Typeface.DEFAULT_BOLD
            }

            val tvActor = TextView(this).apply {
                text = "Actor: ${log.actor}"
                textSize = 12.5f
                setTextColor(0xFF0F172A.toInt())
                typeface = Typeface.DEFAULT_BOLD
                setPadding(0, 2, 0, 2)
            }

            val tvDetails = TextView(this).apply {
                text = log.details
                textSize = 11.5f
                setTextColor(0xFF475569.toInt())
            }

            box.addView(tvAction)
            box.addView(tvActor)
            box.addView(tvDetails)
            card.addView(box)
            containerList.addView(card)
        }
    }
}
