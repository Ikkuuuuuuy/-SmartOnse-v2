package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * SCREEN 4: RequestFormActivity (Document Request Form with Input Validation & Event Handling)
 *
 * Reproduces the SmartOnse Resident Document Request Portal (`/portal/request`).
 * Demonstrates comprehensive Kotlin input validation:
 *  1. Full Name validation (required, minimum 4 characters)
 *  2. Philippine Mobile Number validation (11 digits starting with 09)
 *  3. Barangay Onse Street Address validation (required, minimum 6 characters)
 *  4. Years of Residency validation (must be numeric, 1 to 100)
 *  5. Purpose of Request validation (required, minimum 5 characters)
 *  6. Number of Copies validation (1 to 5 copies per policy limit)
 *  7. R.A. 10173 Data Privacy Consent CheckBox validation
 */
class RequestFormActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_request_form)

        val btnBack = findViewById<Button>(R.id.btnFormBack)
        btnBack.setOnClickListener { finish() }

        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "REQUEST",
            activeTopLink = "SERVICES"
        )

        val spinnerDocType = findViewById<Spinner>(R.id.spinnerDocumentType)
        val spinnerCivilStatus = findViewById<Spinner>(R.id.spinnerCivilStatus)
        val etFullName = findViewById<EditText>(R.id.etFullName)
        val etContactNumber = findViewById<EditText>(R.id.etContactNumber)
        val etAddress = findViewById<EditText>(R.id.etAddress)
        val etYearsResidency = findViewById<EditText>(R.id.etYearsResidency)
        val etPurpose = findViewById<EditText>(R.id.etPurpose)
        val etCopies = findViewById<EditText>(R.id.etCopies)
        val cbPrivacyConsent = findViewById<CheckBox>(R.id.cbPrivacyConsent)
        val tvValidationError = findViewById<TextView>(R.id.tvValidationError)
        val btnFillSample = findViewById<Button>(R.id.btnFillSampleData)
        val btnClearForm = findViewById<Button>(R.id.btnClearForm)
        val btnSubmit = findViewById<Button>(R.id.btnSubmitRequest)

        // Populate Document Types Spinner from SampleDataRepository
        val serviceTitles = SampleDataRepository.servicesList.map { "${it.title} (${it.fee})" }
        val docAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, serviceTitles)
        spinnerDocType.adapter = docAdapter

        // Preselect service if passed via Explicit Intent
        val preselectedTitle = intent.getStringExtra("EXTRA_SERVICE_TITLE")
        if (!preselectedTitle.isNullOrEmpty()) {
            val matchIndex = SampleDataRepository.servicesList.indexOfFirst {
                it.title.equals(preselectedTitle, ignoreCase = true)
            }
            if (matchIndex >= 0) {
                spinnerDocType.setSelection(matchIndex)
            }
        }

        // Populate Civil Status Spinner
        val civilStatuses = listOf("Single", "Married", "Widowed", "Separated", "Solo Parent")
        val civilAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, civilStatuses)
        spinnerCivilStatus.adapter = civilAdapter

        // Quick Fill Sample Resident Button (Helpful for live classroom demonstration)
        btnFillSample.setOnClickListener {
            etFullName.setText("Maria Angela D. Reyes")
            etContactNumber.setText("09178529631")
            etAddress.setText("24 P. Guevarra St., Barangay Onse, San Juan City")
            etYearsResidency.setText("8")
            etPurpose.setText("Pre-Employment Requirement & Bank Account Opening")
            etCopies.setText("2")
            cbPrivacyConsent.isChecked = true
            tvValidationError.visibility = View.GONE
            Toast.makeText(this, "Sample resident profile loaded!", Toast.LENGTH_SHORT).show()
        }

        // Clear Form Button
        btnClearForm.setOnClickListener {
            etFullName.text.clear()
            etContactNumber.text.clear()
            etAddress.text.clear()
            etYearsResidency.setText("1")
            etPurpose.text.clear()
            etCopies.setText("1")
            cbPrivacyConsent.isChecked = false
            tvValidationError.visibility = View.GONE
        }

        // Submit Button with Input Validation & Explicit Intent Navigation
        btnSubmit.setOnClickListener {
            tvValidationError.visibility = View.GONE

            val fullName = etFullName.text.toString().trim()
            val contact = etContactNumber.text.toString().trim()
            val address = etAddress.text.toString().trim()
            val yearsStr = etYearsResidency.text.toString().trim()
            val purpose = etPurpose.text.toString().trim()
            val copiesStr = etCopies.text.toString().trim()

            // 1. Validate Full Name
            if (fullName.length < 4) {
                etFullName.error = "Please enter your complete full name (at least 4 characters)."
                etFullName.requestFocus()
                showValidationBanner(tvValidationError, "Validation Error: Complete Full Name is required.")
                return@setOnClickListener
            }

            // 2. Validate PH Mobile Number (11 digits starting with 09)
            val cleanDigits = contact.replace(Regex("[^0-9]"), "")
            if (!cleanDigits.matches(Regex("^09\\d{9}$"))) {
                etContactNumber.error = "Enter a valid 11-digit PH mobile number (e.g., 09171234567)."
                etContactNumber.requestFocus()
                showValidationBanner(tvValidationError, "Validation Error: Mobile number must be 11 digits starting with 09.")
                return@setOnClickListener
            }

            // 3. Validate Residential Address
            if (address.length < 6) {
                etAddress.error = "Please provide your house number and street in Barangay Onse."
                etAddress.requestFocus()
                showValidationBanner(tvValidationError, "Validation Error: Complete Barangay Onse street address is required.")
                return@setOnClickListener
            }

            // 4. Validate Years of Residency
            val years = yearsStr.toIntOrNull()
            if (years == null || years < 1 || years > 100) {
                etYearsResidency.error = "Enter valid years of residency (1 to 100)."
                etYearsResidency.requestFocus()
                showValidationBanner(tvValidationError, "Validation Error: Years of residency must be between 1 and 100.")
                return@setOnClickListener
            }

            // 5. Validate Purpose
            if (purpose.length < 5) {
                etPurpose.error = "Please state the specific purpose of your certificate request."
                etPurpose.requestFocus()
                showValidationBanner(tvValidationError, "Validation Error: Please enter a valid purpose (at least 5 characters).")
                return@setOnClickListener
            }

            // 6. Validate Copies (1 to 5 policy cap)
            val copies = copiesStr.toIntOrNull()
            if (copies == null || copies < 1 || copies > 5) {
                etCopies.error = "Policy limit: You may request between 1 and 5 copies."
                etCopies.requestFocus()
                showValidationBanner(tvValidationError, "Policy Limit Error: Maximum of 5 copies allowed per submission.")
                return@setOnClickListener
            }

            // 7. Validate R.A. 10173 Data Privacy Consent CheckBox
            if (!cbPrivacyConsent.isChecked) {
                showValidationBanner(
                    tvValidationError,
                    "Data Privacy Consent Required: Please check the R.A. 10173 Data Privacy consent box before submitting."
                )
                return@setOnClickListener
            }

            // Compute Fee & Submit Live to SmartOnse PostgreSQL Database
            val selectedService = SampleDataRepository.servicesList[spinnerDocType.selectedItemPosition]
            val civilStatus = spinnerCivilStatus.selectedItem.toString()
            val unitFeeNumber = when {
                selectedService.fee.contains("50") -> 50
                selectedService.fee.contains("30") -> 30
                selectedService.fee.contains("250") -> 250
                else -> 0
            }
            val totalFeeDisplay = if (unitFeeNumber == 0) "FREE" else "₱${unitFeeNumber * copies}.00"
            val fullPurpose = "$purpose ($civilStatus • $years yrs residency)"

            btnSubmit.isEnabled = false
            btnSubmit.text = "Saving to SmartOnse Database..."

            SmartOnseApiClient.submitRequestToDatabase(
                fullName = fullName,
                contactNumber = cleanDigits,
                address = address,
                documentType = selectedService.code,
                purpose = fullPurpose,
                copies = copies,
                email = SampleDataRepository.currentUserEmail
            ) { success, dbRecord, _ ->
                btnSubmit.isEnabled = true
                btnSubmit.text = "Submit Certificate Request →"

                val finalRecord = dbRecord ?: run {
                    val fallbackCode = SampleDataRepository.generateNextTrackingCode()
                    val timestamp = SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.US).format(Date())
                    TrackingRecord(
                        trackingNumber = fallbackCode,
                        applicantName = fullName,
                        contactNumber = cleanDigits,
                        address = address,
                        documentType = selectedService.title,
                        purpose = fullPurpose,
                        copies = copies,
                        fee = totalFeeDisplay,
                        status = "PENDING",
                        filedDate = timestamp,
                        remarks = "Submitted via SmartOnse Android App. Pending Barangay Secretariat review."
                    ).also { SampleDataRepository.trackingRecords.add(0, it) }
                }

                if (success) {
                    Toast.makeText(
                        this@RequestFormActivity,
                        "Saved to PostgreSQL Database! Tracking #: ${finalRecord.trackingNumber}",
                        Toast.LENGTH_LONG
                    ).show()
                }

                // Navigate to ConfirmationActivity using Explicit Intent with all details
                val confirmIntent = Intent(this@RequestFormActivity, ConfirmationActivity::class.java).apply {
                    putExtra("EXTRA_TRACKING_NUMBER", finalRecord.trackingNumber)
                    putExtra("EXTRA_APPLICANT_NAME", finalRecord.applicantName)
                    putExtra("EXTRA_CONTACT", finalRecord.contactNumber)
                    putExtra("EXTRA_ADDRESS", finalRecord.address)
                    putExtra("EXTRA_DOC_TYPE", finalRecord.documentType)
                    putExtra("EXTRA_PURPOSE", purpose)
                    putExtra("EXTRA_COPIES", copies)
                    putExtra("EXTRA_FEE", finalRecord.fee)
                    putExtra("EXTRA_FILED_DATE", finalRecord.filedDate)
                }
                startActivity(confirmIntent)
                finish()
            }
        }
    }

    private fun showValidationBanner(banner: TextView, message: String) {
        banner.text = message
        banner.visibility = View.VISIBLE
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
