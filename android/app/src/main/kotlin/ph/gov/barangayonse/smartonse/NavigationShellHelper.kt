package ph.gov.barangayonse.smartonse

import android.app.Activity
import android.content.Intent
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog

/**
 * NavigationShellHelper.kt
 *
 * Powers:
 *  1. Clean Top Header Bar (Barangay Onse Seal + SMARTONSE + Hamburger Menu `☰`)
 *  2. Hamburger Account & Resident Action Menu (`☰` -> Track Document, Request Certificate,
 *     My Profile, 1-Click Role Switcher, Sign Out)
 *  3. Persistent 5-Tab Bottom Navigation Bar (Fits 100% on screen with no horizontal scrolling!):
 *     - Home
 *     - About (Merged About Barangay Onse + Barangay Officials & SK Officials)
 *     - Services (E-Services Catalog, Request & Details)
 *     - Transparency (Merged COA Disclosure + SK Programs + Brgy Events)
 *     - Contact (24/7 Emergency Hotlines & Barangay Hall Contact)
 */
object NavigationShellHelper {

    private data class BottomNavTab(
        val key: String,
        val containerId: Int,
        val iconId: Int,
        val labelId: Int,
        val indicatorId: Int
    )

    fun setupPersistentShell(
        activity: Activity,
        activeBottomTab: String,
        activeTopLink: String
    ) {
        // Resolve which of the 5 Bottom Bar tabs should be highlighted
        val resolvedActiveTab = when {
            activeBottomTab.equals("TRACK", true) || activeTopLink.equals("TRACK", true) -> "TRACK"
            activeTopLink.equals("ABOUT", true) || activeTopLink.equals("OFFICIALS", true) || activeTopLink.equals("CONTACT", true) || activeBottomTab.equals("ABOUT", true) || activeBottomTab.equals("CONTACT", true) -> "ABOUT"
            activeTopLink.equals("TRANSPARENCY", true) || activeTopLink.equals("SK", true) || activeTopLink.equals("EVENTS", true) || activeBottomTab.equals("DISCLOSURE", true) -> "TRANSPARENCY"
            activeBottomTab.equals("SERVICES", true) || activeTopLink.equals("SERVICES", true) || activeBottomTab.equals("REQUEST", true) -> "SERVICES"
            else -> "HOME"
        }

        // 1. Top Seal Click -> Home
        activity.findViewById<ImageView?>(R.id.ivBarangaySeal)?.setOnClickListener {
            if (activity !is MainActivity) {
                navigateWithExplicitIntent(activity, MainActivity::class.java)
            } else {
                Toast.makeText(activity, "SmartOnse • Barangay Onse Digital E-Governance", Toast.LENGTH_SHORT).show()
            }
        }

        // 2. Hamburger Menu Button (`☰`) -> Profile, Role Switcher, Sign Out
        activity.findViewById<ImageView?>(R.id.btnNavbarAccount)?.setOnClickListener {
            showHamburgerAccountDrawer(activity)
        }

        // 3. Persistent 5-Tab Bottom Bar (Home | About | Services | Transparency | Track)
        val bottomTabs = listOf(
            BottomNavTab("HOME", R.id.bottomNavHome, R.id.ivNavHome, R.id.tvNavHome, R.id.indNavHome),
            BottomNavTab("ABOUT", R.id.bottomNavAbout, R.id.ivNavAbout, R.id.tvNavAbout, R.id.indNavAbout),
            BottomNavTab("SERVICES", R.id.bottomNavServices, R.id.ivNavServices, R.id.tvNavServices, R.id.indNavServices),
            BottomNavTab("TRANSPARENCY", R.id.bottomNavTransparency, R.id.ivNavTransparency, R.id.tvNavTransparency, R.id.indNavTransparency),
            BottomNavTab("TRACK", R.id.bottomNavTrack, R.id.ivNavTrack, R.id.tvNavTrack, R.id.indNavTrack)
        )

        val activeColor = 0xFF9C2007.toInt()
        val inactiveColor = 0xFF64748B.toInt()

        for (tab in bottomTabs) {
            val container = activity.findViewById<LinearLayout?>(tab.containerId)
            val icon = activity.findViewById<ImageView?>(tab.iconId)
            val label = activity.findViewById<TextView?>(tab.labelId)
            val indicator = activity.findViewById<View?>(tab.indicatorId)

            val isSelected = tab.key.equals(resolvedActiveTab, ignoreCase = true)
            icon?.setColorFilter(if (isSelected) activeColor else inactiveColor)
            label?.setTextColor(if (isSelected) activeColor else inactiveColor)
            indicator?.visibility = if (isSelected) View.VISIBLE else View.INVISIBLE

            container?.setOnClickListener {
                when (tab.key) {
                    "HOME" -> navigateWithExplicitIntent(activity, MainActivity::class.java)
                    "ABOUT" -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "ABOUT")
                    "SERVICES" -> navigateWithExplicitIntent(activity, ServicesActivity::class.java)
                    "TRANSPARENCY" -> navigateWithExplicitIntent(activity, TransparencySkActivity::class.java, "EXTRA_TAB" to "TRANSPARENCY")
                    "TRACK" -> navigateWithExplicitIntent(activity, TrackDocumentActivity::class.java)
                }
            }
        }

        // 4. Floating OnseBot AI Chatbot Button
        activity.findViewById<FrameLayout?>(R.id.fabOnseBotChatbot)?.setOnClickListener {
            if (activity !is ChatbotActivity) {
                activity.startActivity(Intent(activity, ChatbotActivity::class.java))
            }
        }
    }

    private fun navigateWithExplicitIntent(
        activity: Activity,
        targetClass: Class<*>,
        extra: Pair<String, String>? = null
    ) {
        if (activity::class.java == targetClass && extra == null) return
        val intent = Intent(activity, targetClass).apply {
            flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            if (extra != null) {
                putExtra(extra.first, extra.second)
            }
        }
        activity.startActivity(intent)
        activity.overridePendingTransition(0, 0)
    }

    fun showHamburgerAccountDrawer(activity: Activity) {
        val dialog = android.app.Dialog(activity)
        dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE)
        val view = android.view.LayoutInflater.from(activity).inflate(R.layout.dialog_hamburger_menu, null)
        dialog.setContentView(view)
        dialog.window?.apply {
            setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT))
            val params = attributes
            params.gravity = android.view.Gravity.TOP or android.view.Gravity.END
            params.x = 24
            params.y = 140
            attributes = params
        }

        val tvRoleBadge = view.findViewById<TextView>(R.id.tvMenuUserRoleBadge)
        val tvUserName = view.findViewById<TextView>(R.id.tvMenuUserName)
        val tvUserEmail = view.findViewById<TextView>(R.id.tvMenuUserEmail)
        val btnProfile = view.findViewById< android.widget.Button>(R.id.btnMenuProfile)
        val btnSwitchRole = view.findViewById<android.widget.Button>(R.id.btnMenuSwitchRole)
        val btnSignOut = view.findViewById<android.widget.Button>(R.id.btnMenuSignOut)

        if (SampleDataRepository.isLoggedIn) {
            tvRoleBadge.text = SampleDataRepository.currentUserRole.uppercase()
            tvUserName.text = SampleDataRepository.currentUserName
            tvUserEmail.text = SampleDataRepository.currentUserEmail
            btnProfile.text = "👤 My Resident Profile & Account"
            btnSignOut.visibility = View.VISIBLE
        } else {
            tvRoleBadge.text = "GUEST CITIZEN"
            tvUserName.text = "Not Signed In"
            tvUserEmail.text = "Tap below to sign in to SmartOnse"
            btnProfile.text = "🔐 Sign In to Resident / Staff Portal"
            btnSignOut.visibility = View.GONE
        }

        btnProfile.setOnClickListener {
            dialog.dismiss()
            activity.startActivity(Intent(activity, LoginActivity::class.java))
        }

        btnSwitchRole.setOnClickListener {
            dialog.dismiss()
            activity.startActivity(Intent(activity, LoginActivity::class.java))
        }

        btnSignOut.setOnClickListener {
            dialog.dismiss()
            SampleDataRepository.isLoggedIn = false
            Toast.makeText(activity, "Signed out of SmartOnse.", Toast.LENGTH_SHORT).show()
            activity.recreate()
        }

        dialog.show()
    }
}
