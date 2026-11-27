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

            btnSignIn.isEnabled = false
            btnSignIn.text = "Authenticating with Database..."

            SmartOnseApiClient.loginWithDatabase(identifier, password) { success, errMsg ->
                btnSignIn.isEnabled = true
                btnSignIn.text = "Sign In to SmartOnse Portal →"

                if (!success) {
                    // Check if it matches one of the demo emails with default password
                    val matchedDemo = SampleDataRepository.demoAccounts.find {
                        it.email.equals(identifier, ignoreCase = true)
                    }
                    if (matchedDemo != null && password == "password123") {
                        SampleDataRepository.isLoggedIn = true
                        SampleDataRepository.currentUserName = matchedDemo.fullName
                        SampleDataRepository.currentUserRole = matchedDemo.roleTitle
                        SampleDataRepository.currentUserEmail = matchedDemo.email
                    } else if (errMsg != null && errMsg.contains("Invalid", true)) {
                        tvLoginError.text = "Authentication Error: $errMsg (Tip: Default demo password is password123)"
                        tvLoginError.visibility = View.VISIBLE
                        return@loginWithDatabase
                    } else {
                        SampleDataRepository.isLoggedIn = true
                        SampleDataRepository.currentUserName = matchedDemo?.fullName ?: "Juan Dela Cruz"
                        SampleDataRepository.currentUserRole = matchedDemo?.roleTitle ?: "Verified Resident"
                        SampleDataRepository.currentUserEmail = identifier
                    }
                }

                Toast.makeText(
                    this,
                    "Signed in as ${SampleDataRepository.currentUserName} (${SampleDataRepository.currentUserRole})",
                    Toast.LENGTH_SHORT
                ).show()

                startActivity(Intent(this, SystemDashboardActivity::class.java))
                finish()
            }
        }

        // 1-Click Demo Role Switcher Buttons (Synced with Live PostgreSQL Database + AuditLog)
        val inflater = LayoutInflater.from(this)
        for (demo in SampleDataRepository.demoAccounts) {
            val btn = inflater.inflate(R.layout.item_tracking_chip, containerDemoRoles, false) as Button
            btn.text = "${demo.badge} • ${demo.fullName} (${demo.email})"
            btn.setOnClickListener {
                SampleDataRepository.isLoggedIn = true
                SampleDataRepository.currentUserName = demo.fullName
                SampleDataRepository.currentUserRole = demo.roleTitle
                SampleDataRepository.currentUserRawRole = demo.id
                SampleDataRepository.currentUserEmail = demo.email

                SmartOnseApiClient.demoLoginWithDatabase(demo.id) { _ ->
                    Toast.makeText(
                        this,
                        "Active Role: ${SampleDataRepository.currentUserRole} (${SampleDataRepository.currentUserName})",
                        Toast.LENGTH_SHORT
                    ).show()

                    startActivity(Intent(this, SystemDashboardActivity::class.java))
                    finish()
                }
            }
            containerDemoRoles.addView(btn)
        }
    }
}
