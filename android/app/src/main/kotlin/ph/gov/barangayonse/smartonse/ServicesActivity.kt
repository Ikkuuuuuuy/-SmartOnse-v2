package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

/**
 * SCREEN 2: ServicesActivity (E-Services Catalog + Search & Category Filter)
 *
 * Displays the predefined list of Barangay Onse Certificates & Clearances.
 * Implements real-time search filtering (EditText) and Category filter buttons,
 * and uses Explicit Intents to open ServiceDetailActivity or RequestFormActivity.
 */
class ServicesActivity : AppCompatActivity() {

    private lateinit var containerServices: LinearLayout
    private lateinit var etSearchServices: EditText
    private lateinit var tvResultsCount: TextView
    private var selectedCategory: String = "ALL"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_services)

        val btnBackHome = findViewById<Button>(R.id.btnBackHome)
        btnBackHome.setOnClickListener { finish() }

        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "SERVICES",
            activeTopLink = "SERVICES"
        )

        containerServices = findViewById(R.id.containerServicesList)
        etSearchServices = findViewById(R.id.etSearchServices)
        tvResultsCount = findViewById(R.id.tvServicesCount)

        // Category Filter Buttons
        val btnCatAll = findViewById<Button>(R.id.btnCatAll)
        val btnCatGeneral = findViewById<Button>(R.id.btnCatGeneral)
        val btnCatWelfare = findViewById<Button>(R.id.btnCatWelfare)
        val btnCatBusiness = findViewById<Button>(R.id.btnCatBusiness)

        val categoryButtons = listOf(
            btnCatAll to "ALL",
            btnCatGeneral to "General",
            btnCatWelfare to "Welfare",
            btnCatBusiness to "Commerce"
        )

        categoryButtons.forEach { (btn, categoryKey) ->
            btn.setOnClickListener {
                selectedCategory = categoryKey
                categoryButtons.forEach { (otherBtn, otherKey) ->
                    otherBtn.setBackgroundResource(
                        if (otherKey == selectedCategory) R.drawable.bg_btn_maroon else R.drawable.bg_btn_dark
                    )
                }
                renderServicesList(etSearchServices.text.toString())
            }
        }

        // Search input event handling
        etSearchServices.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                renderServicesList(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        renderServicesList("")
    }

    private fun renderServicesList(query: String) {
        containerServices.removeAllViews()
        val cleanQuery = query.trim().lowercase()

        val filtered = SampleDataRepository.servicesList.filter { item ->
            val matchesCategory = when (selectedCategory) {
                "General" -> item.category.contains("General", true) || item.category.contains("Civil", true)
                "Welfare" -> item.category.contains("Welfare", true) || item.category.contains("Youth", true)
                "Commerce" -> item.category.contains("Commerce", true)
                else -> true
            }
            val matchesQuery = cleanQuery.isEmpty() ||
                item.title.lowercase().contains(cleanQuery) ||
                item.description.lowercase().contains(cleanQuery) ||
                item.category.lowercase().contains(cleanQuery)

            matchesCategory && matchesQuery
        }

        tvResultsCount.text = "Showing ${filtered.size} of ${SampleDataRepository.servicesList.size} Barangay Services"

        val inflater = LayoutInflater.from(this)
        for (service in filtered) {
            val itemView = inflater.inflate(R.layout.item_service_card, containerServices, false)

            val tvTitle = itemView.findViewById<TextView>(R.id.tvServiceTitle)
            val tvCategory = itemView.findViewById<TextView>(R.id.tvServiceCategory)
            val tvFee = itemView.findViewById<TextView>(R.id.tvServiceFee)
            val tvTime = itemView.findViewById<TextView>(R.id.tvServiceTime)
            val tvDesc = itemView.findViewById<TextView>(R.id.tvServiceDesc)
            val btnDetails = itemView.findViewById<Button>(R.id.btnServiceDetails)
            val btnApply = itemView.findViewById<Button>(R.id.btnServiceApply)
            val cardRoot = itemView.findViewById<CardView>(R.id.cardServiceItem)

            tvTitle.text = service.title
            tvCategory.text = service.category
            tvFee.text = "Fee: ${service.fee}"
            tvTime.text = "⏱ ${service.processingTime}"
            tvDesc.text = service.description

            val openDetailsAction = {
                val intent = Intent(this@ServicesActivity, ServiceDetailActivity::class.java).apply {
                    putExtra("EXTRA_SERVICE_ID", service.id)
                }
                startActivity(intent)
            }

            cardRoot.setOnClickListener { openDetailsAction() }
            btnDetails.setOnClickListener { openDetailsAction() }

            btnApply.setOnClickListener {
                val intent = Intent(this@ServicesActivity, RequestFormActivity::class.java).apply {
                    putExtra("EXTRA_SERVICE_ID", service.id)
                    putExtra("EXTRA_SERVICE_TITLE", service.title)
                }
                startActivity(intent)
            }

            containerServices.addView(itemView)
        }
    }
}
