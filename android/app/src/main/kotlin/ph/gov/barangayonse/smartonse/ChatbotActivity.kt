package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * SCREEN 10: ChatbotActivity — OnseBot AI Assistant (24/7 Barangay Onse Virtual Desk)
 *
 * Reproduces the `BarangayAiAssistant.tsx` floating AI chatbot from the SmartOnse Capstone 2
 * website using predefined sample knowledge-base responses (no external API/database required).
 * Includes:
 *  - Predefined quick-question chips matching the website ("Requirements sa Barangay Clearance?",
 *    "Libre ba ang Certificate of Indigency?", "Sino ang Barangay Captain at SK?", etc.)
 *  - Chat message input validation & instant intelligent replies
 *  - Quick Explicit Intent shortcut buttons to Request Portal or Document Tracker
 */
class ChatbotActivity : AppCompatActivity() {

    private lateinit var chatContainer: LinearLayout
    private lateinit var chatScrollView: ScrollView
    private lateinit var etChatInput: EditText

    private val quickPrompts = listOf(
        "Requirements sa Barangay Clearance?",
        "Libre ba ang Certificate of Indigency?",
        "Sino ang Barangay Captain at SK?",
        "Paano mag-track ng request?",
        "First-Time Jobseeker (R.A. 11261)?",
        "Emergency Hotlines sa Onse?",
        "Where is Barangay Onse Hall located?"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chatbot)

        findViewById<Button>(R.id.btnChatBack).setOnClickListener { finish() }
        chatContainer = findViewById(R.id.containerChatMessages)
        chatScrollView = findViewById(R.id.scrollChatMessages)
        etChatInput = findViewById(R.id.etChatMessageInput)
        val btnSend = findViewById<Button>(R.id.btnChatSend)
        val containerChips = findViewById<LinearLayout>(R.id.containerQuickQuestionChips)

        // Initial Greeting Message (Exact match with website BarangayAiAssistant.tsx)
        appendChatBubble(
            isBot = true,
            text = "Mabuhay! 👋 Ako si OnseBot, ang 24/7 Virtual Desk Assistant ng Barangay Onse, San Juan City.\n\nAno ang maitutulong ko tungkol sa mga serbisyo, clearances, tracking code, o opisyal ng Barangay Onse?"
        )

        // Populate Quick Question Chips
        for (question in quickPrompts) {
            val chip = Button(this).apply {
                text = question
                isAllCaps = false
                textSize = 11.5f
                setTextColor(0xFF800000.toInt())
                setBackgroundResource(R.drawable.bg_pill_maroon)
                setPadding(32, 12, 32, 12)
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    marginEnd = 16
                }
                layoutParams = params
                setOnClickListener {
                    handleUserQuestion(question)
                }
            }
            containerChips.addView(chip)
        }

        // Send Button with Input Validation
        btnSend.setOnClickListener {
            val msg = etChatInput.text.toString().trim()
            if (msg.isEmpty()) {
                etChatInput.error = "Please type a question for OnseBot"
                return@setOnClickListener
            }
            etChatInput.text.clear()
            handleUserQuestion(msg)
        }
    }

    private fun handleUserQuestion(question: String) {
        appendChatBubble(isBot = false, text = question)
        SmartOnseApiClient.askOnseBotBackend(question) { liveReply ->
            val reply = liveReply ?: generatePredefinedReply(question)
            appendChatBubble(isBot = true, text = reply)
        }
    }

    private fun generatePredefinedReply(q: String): String {
        val lower = q.lowercase()
        return when {
            lower.contains("clearance") && !lower.contains("business") ->
                "📄 **Barangay Clearance**\n• **Fee:** ₱50.00\n• **Processing Time:** 24 Hours (1 Business Day)\n• **Requirements:**\n  1. Valid Government ID o School ID na may litrato\n  2. Proof of Residency (Utility bill / Lease contract)\n  3. Community Tax Certificate (Cedula)\n\nMaaari kang mag-apply online sa **Request Portal** tab!"

            lower.contains("indigency") || lower.contains("libre") ->
                "🤝 **Certificate of Indigency**\n• **Fee:** LIBRE / FREE (Walang bayad)\n• **Turnaround:** Same Day Release\n• **Requirements:**\n  1. Barangay ID o Voter's Certification\n  2. Referral Slip, Medical Abstract, o School Assessment\n\nIto ay para sa medical, educational, DSWD, o financial assistance."

            lower.contains("jobseeker") || lower.contains("11261") ->
                "🎓 **First-Time Jobseeker Certificate (R.A. 11261)**\n• **Fee:** 100% FREE under Republic Act No. 11261\n• **Turnaround:** Same Day\n• **Requirements:**\n  1. Nilagdaang Barangay Oath of Undertaking\n  2. Valid School ID, Diploma, o PSA Birth Certificate\n  3. Katunayan ng 6+ buwang paninirahan sa Barangay Onse."

            lower.contains("captain") || lower.contains("chairman") || lower.contains("opisyal") || lower.contains("official") || lower.contains("sk") ->
                "🏛️ **Barangay Onse & SK Council (2023–2026)**\n• **Punong Barangay:** Hon. Roberto B. Alba\n• **Barangay Secretary:** Maria Elena C. Gomez\n• **Barangay Treasurer:** Elena V. Gutierrez\n• **SK Chairperson:** Hon. John Michael D. Permato\n\nBuksan ang **About & Officials** screen upang makita ang buong listahan ng 20 opisyal at kanilang committee!"

            lower.contains("track") || lower.contains("status") || lower.contains("code") ->
                "🔍 **Paano Mag-Track ng Document Request:**\n1. Buksan ang **Track** tab sa ibaba.\n2. Ilagay ang iyong Tracking Number (halimbawa: `ONSE-2026-8891` o `ONSE-2026-0001`).\n3. Makikita mo ang 4-Step Verification Status mula *Pending* hanggang *Ready for Pickup* sa Window 2."

            lower.contains("hotline") || lower.contains("emergency") || lower.contains("contact") || lower.contains("tawag") ->
                "🚨 **24/7 Emergency Hotlines (Barangay Onse & San Juan City):**\n• **San Juan CDRRMO Rescue:** (02) 8722-9837\n• **Barangay Onse Duty Desk:** (02) 8123-4567 / 0917-888-0011\n• **San Juan PNP Police:** (02) 8724-2509\n• **San Juan BFP Fire Station:** (02) 8723-9371"

            lower.contains("where") || lower.contains("located") || lower.contains("address") || lower.contains("hall") || lower.contains("oras") ->
                "📍 **Barangay Onse Hall Location & Office Hours:**\n• **Address:** Ibuna corner P. Guevarra Street, Barangay Onse, San Juan City\n• **Office Hours:** Lunes hanggang Biyernes, 8:00 AM – 5:00 PM\n• **Email:** info@onse.gov.ph | DPO: privacy@onse.gov.ph"

            lower.contains("business") ->
                "🏢 **Barangay Business Clearance**\n• **Fee:** ₱250.00\n• **Processing Time:** 2 Business Days\n• **Requirements:** DTI/SEC Registration, Contract of Lease, at Sanitary/Fire Safety clearance."

            else ->
                "Salamat sa iyong tanong tungkol sa **\"$q\"**! 💡\n\nSa **SmartOnse Mobile App**, maaari kang:\n1. Mag-apply ng **Barangay Clearance, Residency, Indigency, Jobseeker, o Business Permit** sa **Request** tab.\n2. Mag-check ng pickup status gamit ang tracking code (`ONSE-2026-8891`) sa **Track** tab.\n3. Tumawag sa Barangay Onse Desk sa **(02) 8123-4567**."
        }
    }

    private fun appendChatBubble(isBot: Boolean, text: String) {
        val timeStr = SimpleDateFormat("hh:mm a", Locale.US).format(Date())
        val wrapper = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = if (isBot) Gravity.START else Gravity.END
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = 20
            }
            layoutParams = params
        }

        val senderLabel = TextView(this).apply {
            this.text = if (isBot) "🤖 OnseBot AI • $timeStr" else "You • $timeStr"
            textSize = 10f
            setTextColor(0xFF64748B.toInt())
            setPadding(8, 0, 8, 6)
        }

        val bubble = TextView(this).apply {
            this.text = text.replace("**", "")
            textSize = 13f
            setLineSpacing(6f, 1.0f)
            setTextColor(if (isBot) 0xFF0F172A.toInt() else 0xFFFFFFFF.toInt())
            setBackgroundResource(
                if (isBot) R.drawable.bg_chat_bot_bubble else R.drawable.bg_chat_user_bubble
            )
            setPadding(36, 26, 36, 26)
            maxWidth = (resources.displayMetrics.widthPixels * 0.82).toInt()
        }

        wrapper.addView(senderLabel)
        wrapper.addView(bubble)
        chatContainer.addView(wrapper)

        chatScrollView.post {
            chatScrollView.fullScroll(ScrollView.FOCUS_DOWN)
        }
    }
}
