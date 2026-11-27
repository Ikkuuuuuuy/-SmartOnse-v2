package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 7: AboutOfficialsActivity (Merged About Barangay Onse + Barangay Officials & SK Officials)
 *
 * Reproduces the `/about` and `/officials` pages of the SmartOnse Capstone 2 website:
 *  - Dynamically highlights the active filter button (`All (20)` | `Brgy Council` | `SK Council`)
 *    in #9C2007 Maroon while inactive buttons are #0F172A Dark Navy!
 *  - Separates Sangguniang Barangay (Presiding: Hon. Roberto B. Alba) and Sangguniang Kabataan
 *    (Presiding: Hon. John Michael D. Permato) just like `OfficialsClient.tsx` on the website!
 *  - Displays each official's real circular portrait photo (`off_chairman`, `off_dan`, `off_permato`, etc.),
 *    rank role pill badge, designation, committee, and phone hotline pill!
 */
class AboutOfficialsActivity : AppCompatActivity() {

    private lateinit var containerOfficials: LinearLayout
    private lateinit var btnFilterAll: Button
    private lateinit var btnFilterBrgy: Button
    private lateinit var btnFilterSk: Button
    private var currentFilter = "ALL"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_about_officials)

        val btnBack = findViewById<Button>(R.id.btnOfficialsBack)
        btnBack.setOnClickListener { finish() }

        val section = intent.getStringExtra("EXTRA_SECTION") ?: "ABOUT"
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = if (section.equals("CONTACT", true)) "CONTACT" else "ABOUT",
            activeTopLink = section
        )

        containerOfficials = findViewById(R.id.containerOfficialsList)

        btnFilterAll = findViewById(R.id.btnFilterAllOfficials)
        btnFilterBrgy = findViewById(R.id.btnFilterBrgyCouncil)
        btnFilterSk = findViewById(R.id.btnFilterSkCouncil)

        btnFilterAll.setOnClickListener {
            currentFilter = "ALL"
            updateFilterButtonsHighlight()
            renderOfficials()
        }
        btnFilterBrgy.setOnClickListener {
            currentFilter = "Barangay Council"
            updateFilterButtonsHighlight()
            renderOfficials()
        }
        btnFilterSk.setOnClickListener {
            currentFilter = "Sangguniang Kabataan (SK)"
            updateFilterButtonsHighlight()
            renderOfficials()
        }

        updateFilterButtonsHighlight()
        renderOfficials()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val section = intent.getStringExtra("EXTRA_SECTION") ?: "ABOUT"
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = if (section.equals("CONTACT", true)) "CONTACT" else "ABOUT",
            activeTopLink = section
        )
        updateFilterButtonsHighlight()
        renderOfficials()
    }

    private fun updateFilterButtonsHighlight() {
        btnFilterAll.setBackgroundResource(
            if (currentFilter == "ALL") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
        btnFilterBrgy.setBackgroundResource(
            if (currentFilter == "Barangay Council") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
        btnFilterSk.setBackgroundResource(
            if (currentFilter == "Sangguniang Kabataan (SK)") R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
        )
    }

    private fun renderOfficials() {
        containerOfficials.removeAllViews()
        val inflater = LayoutInflater.from(this)

        val brgyList = SampleDataRepository.officialsList.filter {
            it.council.equals("Barangay Council", ignoreCase = true)
        }
        val skList = SampleDataRepository.officialsList.filter {
            it.council.equals("Sangguniang Kabataan (SK)", ignoreCase = true)
        }

        // 1. SANGGUNIANG BARANGAY SECTION (Matches OfficialsClient.tsx #barangay-council)
        if (currentFilter == "ALL" || currentFilter == "Barangay Council") {
            addCouncilSectionHeader(
                badge = "🏛️ SANGGUNIANG BARANGAY",
                title = "BARANGAY COUNCIL OFFICIALS",
                presiding = "Presiding: Hon. Roberto B. Alba",
                isSk = false
            )
            for (official in brgyList) {
                addOfficialCardView(inflater, official, isSk = false)
            }
        }

        // 2. SANGGUNIANG KABATAAN SECTION (Matches OfficialsClient.tsx #sk-council)
        if (currentFilter == "ALL" || currentFilter == "Sangguniang Kabataan (SK)") {
            addCouncilSectionHeader(
                badge = "✨ SANGGUNIANG KABATAAN",
                title = "SK YOUTH COUNCIL OFFICIALS",
                presiding = "Presiding: Hon. John Michael D. Permato",
                isSk = true
            )
            for (official in skList) {
                addOfficialCardView(inflater, official, isSk = true)
            }
        }
    }

    private fun addCouncilSectionHeader(badge: String, title: String, presiding: String, isSk: Boolean) {
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(4, 24, 4, 16)
        }

        val tvBadge = TextView(this).apply {
            text = badge
            textSize = 10.5f
            setTextColor(if (isSk) 0xFF2563EB.toInt() else 0xFF9C2007.toInt())
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }

        val tvTitle = TextView(this).apply {
            text = title
            textSize = 18f
            setTextColor(0xFF0F172A.toInt())
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }

        val tvPresiding = TextView(this).apply {
            text = presiding
            textSize = 11.5f
            setTextColor(0xFF64748B.toInt())
        }

        headerLayout.addView(tvBadge)
        headerLayout.addView(tvTitle)
        headerLayout.addView(tvPresiding)
        containerOfficials.addView(headerLayout)
    }

    private fun addOfficialCardView(inflater: LayoutInflater, official: OfficialItem, isSk: Boolean) {
        val view = inflater.inflate(R.layout.item_official_card, containerOfficials, false)

        val ivPhoto = view.findViewById<ImageView>(R.id.ivOfficialPhoto)
        val cardBorder = view.findViewById<CardView>(R.id.cardOfficialPhotoBorder)
        val tvBadge = view.findViewById<TextView>(R.id.tvOfficialCouncil)
        val tvName = view.findViewById<TextView>(R.id.tvOfficialName)
        val tvPosition = view.findViewById<TextView>(R.id.tvOfficialPosition)
        val tvCommittee = view.findViewById<TextView>(R.id.tvOfficialCommittee)
        val tvContact = view.findViewById<TextView>(R.id.tvOfficialContact)

        // Load real portrait drawable from res/drawable/
        val resId = resources.getIdentifier(official.avatarResName, "drawable", packageName)
        if (resId != 0) {
            ivPhoto.setImageResource(resId)
            if (official.avatarResName == "barangay_seal") {
                ivPhoto.scaleType = ImageView.ScaleType.FIT_CENTER
                ivPhoto.setPadding(12, 12, 12, 12)
            } else {
                ivPhoto.scaleType = ImageView.ScaleType.CENTER_CROP
                ivPhoto.setPadding(0, 0, 0, 0)
            }
        } else {
            ivPhoto.setImageResource(R.drawable.barangay_seal)
        }

        val isLeader = official.position.contains("Punong", true) ||
            official.position.contains("Captain", true) ||
            official.position.contains("Chairperson", true)

        // Frame border color & role pill styling matching OfficialCard.tsx
        when {
            isLeader -> {
                cardBorder.setCardBackgroundColor(0xFFF59E0B.toInt()) // Gold ring for Captain & SK Chair
                tvBadge.text = if (isSk) "★ SK CHAIRPERSON" else "★ PUNONG BARANGAY"
                tvBadge.setBackgroundResource(R.drawable.bg_pill_amber)
                tvBadge.setTextColor(0xFF92400E.toInt())
            }
            official.position.contains("Treasurer", true) -> {
                cardBorder.setCardBackgroundColor(0xFF10B981.toInt()) // Emerald ring
                tvBadge.text = if (isSk) "SK TREASURER" else "BARANGAY TREASURER"
                tvBadge.setBackgroundResource(R.drawable.bg_pill_emerald)
                tvBadge.setTextColor(0xFF065F46.toInt())
            }
            official.position.contains("Secretary", true) -> {
                cardBorder.setCardBackgroundColor(0xFF6366F1.toInt()) // Indigo ring
                tvBadge.text = if (isSk) "SK SECRETARY" else "BARANGAY SECRETARY"
                tvBadge.setBackgroundResource(R.drawable.bg_pill_white_badge)
                tvBadge.setTextColor(0xFF3730A3.toInt())
            }
            isSk -> {
                cardBorder.setCardBackgroundColor(0xFF3B82F6.toInt()) // Blue ring for SK Kagawad
                tvBadge.text = "SK KAGAWAD"
                tvBadge.setBackgroundResource(R.drawable.bg_pill_white_badge)
                tvBadge.setTextColor(0xFF1D4ED8.toInt())
            }
            else -> {
                cardBorder.setCardBackgroundColor(0xFF9C2007.toInt()) // Maroon ring for Brgy Kagawad
                tvBadge.text = "BARANGAY KAGAWAD"
                tvBadge.setBackgroundResource(R.drawable.bg_pill_maroon)
                tvBadge.setTextColor(0xFF9C2007.toInt())
            }
        }

        tvName.text = official.name
        tvPosition.text = official.position
        tvPosition.setTextColor(if (isSk) 0xFF2563EB.toInt() else 0xFF9C2007.toInt())
        tvCommittee.text = official.committee
        tvContact.text = "📞 ${official.contact}"

        view.setOnClickListener {
            Toast.makeText(
                this,
                "${official.name} • ${official.position} (${official.committee})",
                Toast.LENGTH_SHORT
            ).show()
        }
        containerOfficials.addView(view)
    }
}
