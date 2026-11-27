package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
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

        // Top Navbar Seal & Mobile Hamburger Menu (`☰`)
        findViewById<ImageView>(R.id.ivBarangaySeal).setOnClickListener {
            Toast.makeText(
                this,
                "SmartOnse v2.0 • Barangay Onse Digital E-Governance Portal (San Juan City)",
                Toast.LENGTH_SHORT
            ).show()
        }

        // Hamburger Menu (`☰`) opens a native mobile navigation menu matching Navbar.tsx
        findViewById<ImageView>(R.id.btnNavbarAccount).setOnClickListener {
            showMobileNavigationMenu()
        }

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

        // Persistent Bottom Navigation Bar (5 Mobile App Tabs)
        findViewById<LinearLayout>(R.id.navTabHome).setOnClickListener {
            Toast.makeText(this, "Home Dashboard", Toast.LENGTH_SHORT).show()
        }
        findViewById<LinearLayout>(R.id.navTabServices).setOnClickListener {
            startActivity(Intent(this, ServicesActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.navTabRequest).setOnClickListener {
            startActivity(Intent(this, RequestFormActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.navTabTrack).setOnClickListener {
            startActivity(Intent(this, TrackDocumentActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.navTabMore).setOnClickListener {
            startActivity(Intent(this, TransparencySkActivity::class.java))
        }

        // Floating OnseBot AI Assistant Button (Explicit Intent to ChatbotActivity)
        findViewById<FrameLayout>(R.id.fabOnseBotChatbot).setOnClickListener {
            startActivity(Intent(this, ChatbotActivity::class.java))
        }

        refreshUserSessionUI()
    }

    override fun onResume() {
        super.onResume()
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

    private fun showMobileNavigationMenu() {
        val menuItems = arrayOf(
            "🏠 Home Dashboard",
            "📄 Barangay Services & Clearances",
            "✍️ Request Certificate Online",
            "🔍 Track Application Status",
            "📊 Transparency, SK Programs & Events",
            "🏛️ About & Barangay Officials (20)",
            "🤖 Ask OnseBot AI Assistant (24/7)",
            "🔐 Account & 1-Click Role Switcher (${SampleDataRepository.currentUserName})"
        )

        AlertDialog.Builder(this)
            .setTitle("SMARTONSE • Navigation Menu")
            .setItems(menuItems) { _, which ->
                when (which) {
                    1 -> startActivity(Intent(this, ServicesActivity::class.java))
                    2 -> startActivity(Intent(this, RequestFormActivity::class.java))
                    3 -> startActivity(Intent(this, TrackDocumentActivity::class.java))
                    4 -> startActivity(Intent(this, TransparencySkActivity::class.java))
                    5 -> startActivity(Intent(this, AboutOfficialsActivity::class.java))
                    6 -> startActivity(Intent(this, ChatbotActivity::class.java))
                    7 -> startActivity(Intent(this, LoginActivity::class.java))
                }
            }
            .setNegativeButton("Close", null)
            .show()
    }

    private fun openServiceDetail(serviceId: String) {
        val intent = Intent(this, ServiceDetailActivity::class.java).apply {
            putExtra("EXTRA_SERVICE_ID", serviceId)
        }
        startActivity(intent)
    }
}
