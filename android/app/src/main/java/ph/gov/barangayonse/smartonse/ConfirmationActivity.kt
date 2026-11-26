package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * SCREEN 5: ConfirmationActivity (Confirmation / Official Receipt Result Screen)
 *
 * Receives the submitted form data via Explicit Intent extras, displays the
 * generated tracking number (e.g., ONSE-2026-0004), fee breakdown, and provides
 * Explicit Intent buttons to immediately track the request or return to the Home Dashboard.
 */
class ConfirmationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_confirmation)

        val trackingNumber = intent.getStringExtra("EXTRA_TRACKING_NUMBER") ?: "ONSE-2026-0004"
        val applicantName = intent.getStringExtra("EXTRA_APPLICANT_NAME") ?: "Resident Applicant"
        val contact = intent.getStringExtra("EXTRA_CONTACT") ?: "09170000000"
        val address = intent.getStringExtra("EXTRA_ADDRESS") ?: "Barangay Onse, San Juan City"
        val docType = intent.getStringExtra("EXTRA_DOC_TYPE") ?: "Barangay Clearance"
        val purpose = intent.getStringExtra("EXTRA_PURPOSE") ?: "General Requirement"
        val copies = intent.getIntExtra("EXTRA_COPIES", 1)
        val totalFee = intent.getStringExtra("EXTRA_FEE") ?: "₱50.00"
        val filedDate = intent.getStringExtra("EXTRA_FILED_DATE") ?: "Nov 26, 2026"

        findViewById<TextView>(R.id.tvConfirmTrackingCode).text = trackingNumber
        findViewById<TextView>(R.id.tvConfirmDocType).text = "$docType ($copies ${if (copies == 1) "Copy" else "Copies"})"
        findViewById<TextView>(R.id.tvConfirmApplicant).text = applicantName
        findViewById<TextView>(R.id.tvConfirmContact).text = contact
        findViewById<TextView>(R.id.tvConfirmAddress).text = address
        findViewById<TextView>(R.id.tvConfirmPurpose).text = purpose
        findViewById<TextView>(R.id.tvConfirmFee).text = totalFee
        findViewById<TextView>(R.id.tvConfirmDate).text = filedDate

        val btnTrackNow = findViewById<Button>(R.id.btnConfirmTrackNow)
        val btnReturnHome = findViewById<Button>(R.id.btnConfirmReturnHome)

        btnTrackNow.setOnClickListener {
            val trackIntent = Intent(this@ConfirmationActivity, TrackDocumentActivity::class.java).apply {
                putExtra("EXTRA_TRACKING_CODE", trackingNumber)
            }
            startActivity(trackIntent)
            finish()
        }

        btnReturnHome.setOnClickListener {
            val homeIntent = Intent(this@ConfirmationActivity, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(homeIntent)
            finish()
        }
    }
}
