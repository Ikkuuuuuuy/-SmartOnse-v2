package ph.gov.barangayonse.smartonse

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * SCREEN 9: LoginActivity — Resident & Barangay Staff Sign-In Portal
 *
 * Reproduces the `/login` page of the SmartOnse Capstone 2 Website, including:
 *  - Email / Mobile Phone & Password input validation
 *  - Security CheckBox verification
 *  - 1-Click Demo Role Switcher (Resident, Barangay Captain, Desk Staff, Kagawad, SK Chairman)
 *    matching the exact demo accounts on the SmartOnse website!
 */
class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        findViewById<Button>(R.id.btnLoginBack).setOnClickListener { finish() }

        val tvCurrentStatus = findViewById<TextView>(R.id.tvCurrentSessionBadge)
        val etEmailOrPhone = findViewById<EditText>(R.id.etLoginIdentifier)
        val etPassword = findViewById<EditText>(R.id.etLoginPassword)
        val cbHumanVerify = findViewById<CheckBox>(R.id.cbLoginCaptcha)
        val tvLoginError = findViewById<TextView>(R.id.tvLoginError)
        val btnSignIn = findViewById<Button>(R.id.btnSignInSubmit)
        val btnSignOut = findViewById<Button>(R.id.btnSignOutSession)
        val containerDemoRoles = findViewById<LinearLayout>(R.id.containerDemoRoleButtons)

        fun updateHeader() {
            if (SampleDataRepository.isLoggedIn) {
                tvCurrentStatus.text =
                    "Signed in as: ${SampleDataRepository.currentUserName} (${SampleDataRepository.currentUserRole})"
                btnSignOut.visibility = View.VISIBLE
            } else {
                tvCurrentStatus.text = "Currently browsing as Guest Citizen"
                btnSignOut.visibility = View.GONE
            }
        }
        updateHeader()

        btnSignOut.setOnClickListener {
            SampleDataRepository.isLoggedIn = false
            updateHeader()
            Toast.makeText(this, "Signed out of SmartOnse session.", Toast.LENGTH_SHORT).show()
        }

        // Standard Login Form with Input Validation
        btnSignIn.setOnClickListener {
            tvLoginError.visibility = View.GONE
            val identifier = etEmailOrPhone.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (identifier.length < 5) {
                etEmailOrPhone.error = "Enter a valid email address or 11-digit mobile number"
                etEmailOrPhone.requestFocus()
                tvLoginError.text = "Validation Error: Please enter your registered email or mobile number."
                tvLoginError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (password.length < 6) {
                etPassword.error = "Password must be at least 6 characters"
                etPassword.requestFocus()
                tvLoginError.text = "Validation Error: Password must be at least 6 characters long."
                tvLoginError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (!cbHumanVerify.isChecked) {
                tvLoginError.text = "Security Verification Required: Please check 'I am a verified resident / human'."
                tvLoginError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            val matchedDemo = SampleDataRepository.demoAccounts.find {
                it.email.equals(identifier, ignoreCase = true)
            }

            SampleDataRepository.isLoggedIn = true
            SampleDataRepository.currentUserName = matchedDemo?.fullName ?: "Juan Dela Cruz"
            SampleDataRepository.currentUserRole = matchedDemo?.roleTitle ?: "Verified Resident"
            SampleDataRepository.currentUserEmail = identifier

            Toast.makeText(
                this,
                "Welcome back, ${SampleDataRepository.currentUserName}!",
                Toast.LENGTH_SHORT
            ).show()

            startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            })
            finish()
        }

        // 1-Click Demo Role Switcher Buttons (Matches Website's 1-Click Demo Roles)
        val inflater = LayoutInflater.from(this)
        for (demo in SampleDataRepository.demoAccounts) {
            val btn = inflater.inflate(R.layout.item_tracking_chip, containerDemoRoles, false) as Button
            btn.text = "${demo.badge} • ${demo.fullName} (${demo.email})"
            btn.setOnClickListener {
                SampleDataRepository.isLoggedIn = true
                SampleDataRepository.currentUserName = demo.fullName
                SampleDataRepository.currentUserRole = demo.roleTitle
                SampleDataRepository.currentUserEmail = demo.email

                Toast.makeText(
                    this,
                    "Switched to ${demo.roleTitle}: ${demo.fullName}",
                    Toast.LENGTH_SHORT
                ).show()

                startActivity(Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                })
                finish()
            }
            containerDemoRoles.addView(btn)
        }
    }
}
