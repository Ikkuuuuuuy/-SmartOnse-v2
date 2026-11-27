package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 1: MainActivity — 100% Native Kotlin SmartOnse Mobile Home Page
 *
 * Reproduces the exact SmartOnse Capstone 2 Website Mobile View using 100% native
 * Android UI components (ImageView, TextView, EditText, Button, CardView) and
 * Explicit Intents between all 10 screens.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var tvHeroAccountBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvHeroAccountBtn = findViewById(R.id.btnHeroLoginPortal)

        // Hero Section CTAs (Exact match with website Hero buttons)
        findViewById<Button>(R.id.btnHeroRequest).setOnClickListener {
            val intent = Intent(this, RequestFormActivity::class.java).apply {
                putExtra("EXTRA_SERVICE_ID", "SRV-01")
                putExtra("EXTRA_SERVICE_TITLE", "Barangay Clearance")
            }
            startActivity(intent)
        }

        findViewById<Button>(R.id.btnHeroTrack).setOnClickListener {
            startActivity(Intent(this, TrackDocumentActivity::class.java))
        }

        tvHeroAccountBtn.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        // Hero Inline Quick Tracking Search Bar (Exact match with website Hero Search Bar)
        val etHeroTrackInput = findViewById<EditText>(R.id.etHeroTrackingSearch)
        val btnHeroTrackSearch = findViewById<Button>(R.id.btnHeroTrackingSubmit)

        btnHeroTrackSearch.setOnClickListener {
            val code = etHeroTrackInput.text.toString().trim()
            val intent = Intent(this, TrackDocumentActivity::class.java).apply {
                putExtra("EXTRA_TRACKING_CODE", if (code.isNotEmpty()) code else "ONSE-2026-8891")
            }
            startActivity(intent)
        }

        // 6 Module Cards Grid (Explicit Intents to all website pages)
        findViewById<CardView>(R.id.cardNavServices).setOnClickListener {
            startActivity(Intent(this, ServicesActivity::class.java))
        }
        findViewById<CardView>(R.id.cardNavRequest).setOnClickListener {
            startActivity(Intent(this, RequestFormActivity::class.java))
        }
        findViewById<CardView>(R.id.cardNavTrack).setOnClickListener {
            startActivity(Intent(this, TrackDocumentActivity::class.java))
        }
        findViewById<CardView>(R.id.cardNavOfficials).setOnClickListener {
            startActivity(Intent(this, AboutOfficialsActivity::class.java))
        }
        findViewById<CardView>(R.id.cardNavTransparencySk).setOnClickListener {
            startActivity(Intent(this, TransparencySkActivity::class.java))
        }
        findViewById<CardView>(R.id.cardNavLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        // Featured Popular Certificates on Home Screen
        findViewById<CardView>(R.id.cardFeaturedClearance).setOnClickListener {
            openServiceDetail("SRV-01")
        }
        findViewById<CardView>(R.id.cardFeaturedIndigency).setOnClickListener {
            openServiceDetail("SRV-03")
        }
        findViewById<CardView>(R.id.cardFeaturedJobseeker).setOnClickListener {
            openServiceDetail("SRV-04")
        }

        findViewById<Button>(R.id.btnViewAllServices).setOnClickListener {
            startActivity(Intent(this, ServicesActivity::class.java))
        }

        // Sample Active Application Preview Card
        findViewById<CardView>(R.id.cardSampleTracking).setOnClickListener {
            val intent = Intent(this, TrackDocumentActivity::class.java).apply {
                putExtra("EXTRA_TRACKING_CODE", "ONSE-2026-8891")
            }
            startActivity(intent)
        }

        // Setup Persistent Top Website Nav Strip + Persistent Bottom Bar (Highlights HOME) + Hamburger Account Drawer
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "HOME",
            activeTopLink = "HOME"
        )

        refreshUserSessionUI()
    }

    override fun onResume() {
        super.onResume()
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "HOME",
            activeTopLink = "HOME"
        )
        refreshUserSessionUI()
    }

    private fun refreshUserSessionUI() {
        if (SampleDataRepository.isLoggedIn) {
            val firstName = SampleDataRepository.currentUserName.split(" ").firstOrNull() ?: "Resident"
            tvHeroAccountBtn.text = "$firstName →"
        } else {
            tvHeroAccountBtn.text = "LOG IN"
        }
    }

    private fun openServiceDetail(serviceId: String) {
        val intent = Intent(this, ServiceDetailActivity::class.java).apply {
            putExtra("EXTRA_SERVICE_ID", serviceId)
        }
        startActivity(intent)
    }
}
