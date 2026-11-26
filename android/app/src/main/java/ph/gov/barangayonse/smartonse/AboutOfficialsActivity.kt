package ph.gov.barangayonse.smartonse

import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * SCREEN 7: AboutOfficialsActivity (Barangay Profile, Council & SK Officials Directory)
 *
 * Reproduces the `/about` and `/officials` pages of the SmartOnse Capstone 2 website
 * using predefined data from SampleDataRepository.
 */
class AboutOfficialsActivity : AppCompatActivity() {

    private lateinit var containerOfficials: LinearLayout
    private var currentFilter = "ALL"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_about_officials)

        val btnBack = findViewById<Button>(R.id.btnOfficialsBack)
        btnBack.setOnClickListener { finish() }

        containerOfficials = findViewById(R.id.containerOfficialsList)

        val btnFilterAll = findViewById<Button>(R.id.btnFilterAllOfficials)
        val btnFilterBrgy = findViewById<Button>(R.id.btnFilterBrgyCouncil)
        val btnFilterSk = findViewById<Button>(R.id.btnFilterSkCouncil)

        btnFilterAll.setOnClickListener {
            currentFilter = "ALL"
            renderOfficials()
        }
        btnFilterBrgy.setOnClickListener {
            currentFilter = "Barangay Council"
            renderOfficials()
        }
        btnFilterSk.setOnClickListener {
            currentFilter = "Sangguniang Kabataan (SK)"
            renderOfficials()
        }

        renderOfficials()
    }

    private fun renderOfficials() {
        containerOfficials.removeAllViews()
        val inflater = LayoutInflater.from(this)

        val list = SampleDataRepository.officialsList.filter {
            currentFilter == "ALL" || it.council.equals(currentFilter, ignoreCase = true)
        }

        for (official in list) {
            val view = inflater.inflate(R.layout.item_official_card, containerOfficials, false)
            view.findViewById<TextView>(R.id.tvOfficialName).text = official.name
            view.findViewById<TextView>(R.id.tvOfficialPosition).text = official.position
            view.findViewById<TextView>(R.id.tvOfficialCommittee).text = "Committee: ${official.committee}"
            view.findViewById<TextView>(R.id.tvOfficialCouncil).text = official.council
            view.findViewById<TextView>(R.id.tvOfficialContact).text = "Hotline: ${official.contact}"

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
}
