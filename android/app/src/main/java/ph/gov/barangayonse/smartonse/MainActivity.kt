package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 1: MainActivity (Home Screen / Dashboard)
 *
 * Reproduces the SmartOnse Capstone 2 Website Landing Page & Resident Dashboard
 * using Native Android UI components (ImageView, TextView, Button, CardView)
 * and Explicit Intents to navigate between the 7 screens.
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Header elements
        val ivBarangaySeal = findViewById<ImageView>(R.id.ivBarangaySeal)
        val tvWelcomeTitle = findViewById<TextView>(R.id.tvWelcomeTitle)

        ivBarangaySeal.setOnClickListener {
            Toast.makeText(
                this,
                "SmartOnse v2.0 • Official Digital E-Governance App of Barangay Onse, San Juan City",
                Toast.LENGTH_SHORT
            ).show()
        }

        // Primary CTA Buttons using Explicit Intents
        val btnHeroRequest = findViewById<Button>(R.id.btnHeroRequest)
        val btnHeroTrack = findViewById<Button>(R.id.btnHeroTrack)

        btnHeroRequest.setOnClickListener {
            val intent = Intent(this@MainActivity, RequestFormActivity::class.java).apply {
                putExtra("EXTRA_SERVICE_ID", "SRV-01")
                putExtra("EXTRA_SERVICE_TITLE", "Barangay Clearance")
            }
            startActivity(intent)
        }

        btnHeroTrack.setOnClickListener {
            val intent = Intent(this@MainActivity, TrackDocumentActivity::class.java)
            startActivity(intent)
        }

        // Quick Navigation CardViews (Explicit Intents to 4 Major Modules)
        val cardServices = findViewById<CardView>(R.id.cardNavServices)
        val cardRequestForm = findViewById<CardView>(R.id.cardNavRequest)
        val cardTrackDoc = findViewById<CardView>(R.id.cardNavTrack)
        val cardOfficials = findViewById<CardView>(R.id.cardNavOfficials)

        cardServices.setOnClickListener {
            val intent = Intent(this@MainActivity, ServicesActivity::class.java)
            startActivity(intent)
        }

        cardRequestForm.setOnClickListener {
            val intent = Intent(this@MainActivity, RequestFormActivity::class.java)
            startActivity(intent)
        }

        cardTrackDoc.setOnClickListener {
            val intent = Intent(this@MainActivity, TrackDocumentActivity::class.java)
            startActivity(intent)
        }

        cardOfficials.setOnClickListener {
            val intent = Intent(this@MainActivity, AboutOfficialsActivity::class.java)
            startActivity(intent)
        }

        // Featured Service Shortcut Button
        val btnViewAllServices = findViewById<Button>(R.id.btnViewAllServices)
        btnViewAllServices.setOnClickListener {
            val intent = Intent(this@MainActivity, ServicesActivity::class.java)
            startActivity(intent)
        }

        // Sample Tracking Record Quick Preview Click
        val cardSampleTracking = findViewById<CardView>(R.id.cardSampleTracking)
        cardSampleTracking.setOnClickListener {
            val intent = Intent(this@MainActivity, TrackDocumentActivity::class.java).apply {
                putExtra("EXTRA_TRACKING_CODE", "ONSE-2026-0001")
            }
            startActivity(intent)
        }

        tvWelcomeTitle.text = "Barangay Onse E-Governance"
    }
}
