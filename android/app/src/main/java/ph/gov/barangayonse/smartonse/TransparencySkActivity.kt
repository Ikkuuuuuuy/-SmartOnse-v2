package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * SCREEN 8: TransparencySkActivity — Full Public Disclosure Board, SK Youth Hub & Events
 *
 * Reproduces the `/transparency`, `/sk-programs`, and `/events` pages of the
 * SmartOnse Capstone 2 website using predefined sample data in SampleDataRepository.
 */
class TransparencySkActivity : AppCompatActivity() {

    private lateinit var containerContent: LinearLayout
    private lateinit var tvSectionSubheader: TextView
    private var activeTab = "TRANSPARENCY"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transparency_sk)

        findViewById<Button>(R.id.btnHubBack).setOnClickListener { finish() }
        containerContent = findViewById(R.id.containerHubList)
        tvSectionSubheader = findViewById(R.id.tvHubSectionInfo)

        activeTab = intent.getStringExtra("EXTRA_TAB") ?: "TRANSPARENCY"

        val btnTabTransparency = findViewById<Button>(R.id.btnTabTransparency)
        val btnTabSkPrograms = findViewById<Button>(R.id.btnTabSkPrograms)
        val btnTabEvents = findViewById<Button>(R.id.btnTabEvents)

        btnTabTransparency.setOnClickListener {
            activeTab = "TRANSPARENCY"
            renderActiveTab()
        }
        btnTabSkPrograms.setOnClickListener {
            activeTab = "SK"
            renderActiveTab()
        }
        btnTabEvents.setOnClickListener {
            activeTab = "EVENTS"
            renderActiveTab()
        }

        renderActiveTab()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        activeTab = intent.getStringExtra("EXTRA_TAB") ?: activeTab
        renderActiveTab()
    }

    private fun renderActiveTab() {
        NavigationShellHelper.setupPersistentShell(
            activity = this,
            activeBottomTab = "DISCLOSURE",
            activeTopLink = activeTab
        )
        containerContent.removeAllViews()
        val inflater = LayoutInflater.from(this)

        when (activeTab) {
            "TRANSPARENCY" -> {
                tvSectionSubheader.text =
                    "COA & DILG Full Public Disclosure Policy (E.O. No. 2, s. 2016) • ${SampleDataRepository.transparencyDocs.size} Certified Documents"

                for (doc in SampleDataRepository.transparencyDocs) {
                    val view = inflater.inflate(R.layout.item_service_card, containerContent, false)
                    view.findViewById<TextView>(R.id.tvServiceCategory).text =
                        "${doc.council} DISCLOSURE • ${doc.code}"
                    view.findViewById<TextView>(R.id.tvServiceFee).text = "${doc.quarter} ${doc.year}"
                    view.findViewById<TextView>(R.id.tvServiceTitle).text = doc.title
                    view.findViewById<TextView>(R.id.tvServiceTime).text =
                        "📄 ${doc.category} • ${doc.fileSize}"
                    view.findViewById<TextView>(R.id.tvServiceDesc).text =
                        "Certified Barangay Onse public financial & procurement disclosure record available for resident inspection."

                    val btnDetails = view.findViewById<Button>(R.id.btnServiceDetails)
                    val btnApply = view.findViewById<Button>(R.id.btnServiceApply)
                    btnDetails.text = "Verify COA Seal"
                    btnApply.text = "Preview PDF"

                    btnDetails.setOnClickListener {
                        Toast.makeText(
                            this,
                            "Verified Public Disclosure Record: ${doc.code} (${doc.title})",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    btnApply.setOnClickListener {
                        Toast.makeText(
                            this,
                            "Opening ${doc.code} (${doc.fileSize}) — Sample Document Preview",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    containerContent.addView(view)
                }
            }

            "SK" -> {
                tvSectionSubheader.text =
                    "Sangguniang Kabataan (SK) Onse Community Hub (R.A. 10742) • ${SampleDataRepository.skPrograms.size} Youth Programs"

                for (prog in SampleDataRepository.skPrograms) {
                    val view = inflater.inflate(R.layout.item_service_card, containerContent, false)
                    view.findViewById<TextView>(R.id.tvServiceCategory).text =
                        "SK PROGRAM • ${prog.category.uppercase()}"
                    view.findViewById<TextView>(R.id.tvServiceFee).text = prog.status
                    view.findViewById<TextView>(R.id.tvServiceTitle).text = prog.title
                    view.findViewById<TextView>(R.id.tvServiceTime).text =
                        "🗓 ${prog.schedule} • Budget: ${prog.budget}"
                    view.findViewById<TextView>(R.id.tvServiceDesc).text = prog.objective

                    val btnDetails = view.findViewById<Button>(R.id.btnServiceDetails)
                    val btnApply = view.findViewById<Button>(R.id.btnServiceApply)
                    btnDetails.text = "Program Info"
                    btnApply.text = "Join Youth Program"

                    btnDetails.setOnClickListener {
                        Toast.makeText(this, "${prog.title} (${prog.schedule})", Toast.LENGTH_SHORT).show()
                    }
                    btnApply.setOnClickListener {
                        Toast.makeText(
                            this,
                            "Registered interest for ${prog.title}! Visit the SK Onse Office for schedule confirmation.",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                    containerContent.addView(view)
                }
            }

            "EVENTS" -> {
                tvSectionSubheader.text =
                    "Barangay Onse Assemblies, Health Drives & Advisories • ${SampleDataRepository.barangayEvents.size} Upcoming Events"

                for (ev in SampleDataRepository.barangayEvents) {
                    val view = inflater.inflate(R.layout.item_service_card, containerContent, false)
                    view.findViewById<TextView>(R.id.tvServiceCategory).text = ev.category
                    view.findViewById<TextView>(R.id.tvServiceFee).text = ev.date
                    view.findViewById<TextView>(R.id.tvServiceTitle).text = ev.title
                    view.findViewById<TextView>(R.id.tvServiceTime).text =
                        "📍 ${ev.location} • ${ev.time}"
                    view.findViewById<TextView>(R.id.tvServiceDesc).text = ev.description

                    val btnDetails = view.findViewById<Button>(R.id.btnServiceDetails)
                    val btnApply = view.findViewById<Button>(R.id.btnServiceApply)
                    btnDetails.text = "Venue Map"
                    btnApply.text = "Save Reminder"

                    btnDetails.setOnClickListener {
                        Toast.makeText(this, "Venue: ${ev.location}", Toast.LENGTH_SHORT).show()
                    }
                    btnApply.setOnClickListener {
                        Toast.makeText(this, "Reminder saved for ${ev.title} on ${ev.date}!", Toast.LENGTH_SHORT).show()
                    }
                    containerContent.addView(view)
                }
            }
        }
    }
}
