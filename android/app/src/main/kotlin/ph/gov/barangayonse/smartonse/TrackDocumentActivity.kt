package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 6: TrackDocumentActivity (Document Status Tracker with Sample Data Lookup)
 *
 * Reproduces the SmartOnse `/track` page.
 * Validates the tracking number input, searches the predefined + session records
 * in SampleDataRepository, and displays the status card or a helpful error message.
 */
class TrackDocumentActivity : AppCompatActivity() {

    private lateinit var etTrackingCode: EditText
    private lateinit var cardResult: CardView
    private lateinit var tvErrorBanner: TextView
    private lateinit var tvResultCode: TextView
    private lateinit var tvResultStatus: TextView
    private lateinit var tvResultDocType: TextView
    private lateinit var tvResultApplicant: TextView
    private lateinit var tvResultDate: TextView
    private lateinit var tvResultFee: TextView
    private lateinit var tvResultPurpose: TextView
    private lateinit var tvResultRemarks: TextView
    private lateinit var containerSampleList: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_track_document)

        val btnBack = findViewById<Button>(R.id.btnTrackBack)
        btnBack.setOnClickListener { finish() }

        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "TRACK",
            activeTopLink = "SERVICES"
        )

        etTrackingCode = findViewById(R.id.etTrackingInput)
        val btnSearch = findViewById<Button>(R.id.btnSearchTracking)
        cardResult = findViewById(R.id.cardTrackingResult)
        tvErrorBanner = findViewById(R.id.tvTrackError)

        tvResultCode = findViewById(R.id.tvTrackResultCode)
        tvResultStatus = findViewById(R.id.tvTrackResultStatus)
        tvResultDocType = findViewById(R.id.tvTrackResultDocType)
        tvResultApplicant = findViewById(R.id.tvTrackResultApplicant)
        tvResultDate = findViewById(R.id.tvTrackResultDate)
        tvResultFee = findViewById(R.id.tvTrackResultFee)
        tvResultPurpose = findViewById(R.id.tvTrackResultPurpose)
        tvResultRemarks = findViewById(R.id.tvTrackResultRemarks)
        containerSampleList = findViewById(R.id.containerSampleTrackingCodes)

        val btnNewRequest = findViewById<Button>(R.id.btnTrackNewRequest)
        btnNewRequest.setOnClickListener {
            startActivity(Intent(this, RequestFormActivity::class.java))
        }

        btnSearch.setOnClickListener {
            val code = etTrackingCode.text.toString().trim()
            if (code.isEmpty()) {
                etTrackingCode.error = "Please enter a tracking number (e.g., ONSE-2026-0001)"
                tvErrorBanner.text = "Input Error: Please enter a valid SmartOnse tracking code."
                tvErrorBanner.visibility = View.VISIBLE
                cardResult.visibility = View.GONE
                return@setOnClickListener
            }
            lookupTrackingCode(code)
        }

        renderSampleCodesList()

        // Sync latest tracking records from PostgreSQL database in background
        SmartOnseApiClient.syncFromDatabase { synced ->
            if (synced) {
                renderSampleCodesList()
            }
        }

        // If launched with an EXTRA_TRACKING_CODE, automatically display it
        val initialCode = intent.getStringExtra("EXTRA_TRACKING_CODE")
        if (!initialCode.isNullOrEmpty()) {
            etTrackingCode.setText(initialCode)
            lookupTrackingCode(initialCode)
        } else {
            // Default showcase first sample record
            val firstCode = SampleDataRepository.trackingRecords.first().trackingNumber
            etTrackingCode.setText(firstCode)
            lookupTrackingCode(firstCode)
        }
    }

    private fun lookupTrackingCode(code: String) {
        // First show immediate local match if present, then query live PostgreSQL database
        val localMatch = SampleDataRepository.findTrackingByCode(code)
        if (localMatch != null) {
            displayTrackingRecord(localMatch)
        }

        SmartOnseApiClient.trackDocumentFromDatabase(code) { record ->
            if (record == null) {
                cardResult.visibility = View.GONE
                tvErrorBanner.text = "No record found in SmartOnse Database for \"${code.uppercase()}\". Tap any tracking number below to test."
                tvErrorBanner.visibility = View.VISIBLE
                Toast.makeText(this, "Tracking number not found", Toast.LENGTH_SHORT).show()
                return@trackDocumentFromDatabase
            }
            displayTrackingRecord(record)
            renderSampleCodesList()
        }
    }

    private fun displayTrackingRecord(record: TrackingRecord) {
        tvErrorBanner.visibility = View.GONE
        cardResult.visibility = View.VISIBLE

        tvResultCode.text = record.trackingNumber
        tvResultStatus.text = record.status
        tvResultDocType.text = "${record.documentType} (${record.copies}x)"
        tvResultApplicant.text = record.applicantName
        tvResultDate.text = record.filedDate
        tvResultFee.text = record.fee
        tvResultPurpose.text = record.purpose
        tvResultRemarks.text = record.remarks
    }

    private fun renderSampleCodesList() {
        containerSampleList.removeAllViews()
        val inflater = LayoutInflater.from(this)

        for (rec in SampleDataRepository.trackingRecords) {
            val chipButton = inflater.inflate(R.layout.item_tracking_chip, containerSampleList, false) as Button
            chipButton.text = "${rec.trackingNumber} • ${rec.applicantName} (${rec.status})"
            chipButton.setOnClickListener {
                etTrackingCode.setText(rec.trackingNumber)
                lookupTrackingCode(rec.trackingNumber)
            }
            containerSampleList.addView(chipButton)
        }
    }
}
