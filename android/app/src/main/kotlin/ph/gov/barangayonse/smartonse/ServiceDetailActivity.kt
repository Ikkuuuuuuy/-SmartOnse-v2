package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * SCREEN 3: ServiceDetailActivity (Details Screen for a Selected Barangay Service)
 *
 * Receives the selected Service ID via Explicit Intent extras and displays
 * complete service requirements, processing fee, turnaround time, and an
 * Explicit Intent button to launch the RequestFormActivity for that service.
 */
class ServiceDetailActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_service_detail)

        val serviceId = intent.getStringExtra("EXTRA_SERVICE_ID")
        val service = SampleDataRepository.findServiceById(serviceId)

        val btnBack = findViewById<Button>(R.id.btnDetailBack)
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "SERVICES",
            activeTopLink = "SERVICES"
        )
        val tvCategory = findViewById<TextView>(R.id.tvDetailCategory)
        val tvTitle = findViewById<TextView>(R.id.tvDetailTitle)
        val tvCode = findViewById<TextView>(R.id.tvDetailCode)
        val tvFee = findViewById<TextView>(R.id.tvDetailFee)
        val tvProcessingTime = findViewById<TextView>(R.id.tvDetailTime)
        val tvDescription = findViewById<TextView>(R.id.tvDetailDescription)
        val tvRequirements = findViewById<TextView>(R.id.tvDetailRequirements)
        val btnProceedRequest = findViewById<Button>(R.id.btnProceedToRequest)

        btnBack.setOnClickListener { finish() }

        tvCategory.text = service.category.uppercase()
        tvTitle.text = service.title
        tvCode.text = "Document Code: ${service.code}"
        tvFee.text = service.fee
        tvProcessingTime.text = service.processingTime
        tvDescription.text = service.description

        val formattedRequirements = service.requirements.mapIndexed { index, req ->
            "${index + 1}. $req"
        }.joinToString("\n\n")
        tvRequirements.text = formattedRequirements

        btnProceedRequest.setOnClickListener {
            val requestIntent = Intent(this@ServiceDetailActivity, RequestFormActivity::class.java).apply {
                putExtra("EXTRA_SERVICE_ID", service.id)
                putExtra("EXTRA_SERVICE_TITLE", service.title)
            }
            startActivity(requestIntent)
        }
    }
}
