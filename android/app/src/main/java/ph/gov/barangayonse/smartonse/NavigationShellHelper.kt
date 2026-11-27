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
 * Powers the persistent SmartOnse Top Navbar + Scrollable Website Nav Strip
 * (HOME | ABOUT | OFFICIALS | SERVICES | TRANSPARENCY | ANNOUNCEMENTS/EVENTS | SK PROGRAMS | CONTACT),
 * the Persistent 5-Tab Bottom Navigation Bar (which stays visible on every screen and highlights
 * the active tab in #9C2007 Maroon!), the Floating OnseBot AI Robot Button, and the Hamburger
 * Account/Portal Drawer (Request Certificate, Track Document, Profile, 1-Click Role Switcher, Sign Out).
 */
object NavigationShellHelper {

    fun setupPersistentShell(
        activity: Activity,
        activeBottomTab: String, // "HOME", "SERVICES", "REQUEST", "TRACK", "DISCLOSURE"
        activeTopLink: String    // "HOME", "ABOUT", "OFFICIALS", "SERVICES", "TRANSPARENCY", "EVENTS", "SK", "CONTACT"
    ) {
        // 1. Top Seal Click
        activity.findViewById<ImageView?>(R.id.ivBarangaySeal)?.setOnClickListener {
            if (activity !is MainActivity) {
                navigateWithExplicitIntent(activity, MainActivity::class.java)
            } else {
                Toast.makeText(activity, "SmartOnse • Barangay Onse Digital E-Governance", Toast.LENGTH_SHORT).show()
            }
        }

        // 2. Hamburger Menu Button (`☰`) -> Account, Profile, Tracking, Request, Role Switcher, Sign Out
        activity.findViewById<ImageView?>(R.id.btnNavbarAccount)?.setOnClickListener {
            showHamburgerAccountDrawer(activity)
        }

        // 3. Top Website Nav Links Strip (HOME | ABOUT | OFFICIALS | SERVICES | TRANSPARENCY | EVENTS | SK | CONTACT)
        val topNavMap = mapOf(
            "HOME" to (activity.findViewById<TextView?>(R.id.topNavHome) to activity.findViewById<View?>(R.id.topIndHome)),
            "ABOUT" to (activity.findViewById<TextView?>(R.id.topNavAbout) to activity.findViewById<View?>(R.id.topIndAbout)),
            "OFFICIALS" to (activity.findViewById<TextView?>(R.id.topNavOfficials) to activity.findViewById<View?>(R.id.topIndOfficials)),
            "SERVICES" to (activity.findViewById<TextView?>(R.id.topNavServices) to activity.findViewById<View?>(R.id.topIndServices)),
            "TRANSPARENCY" to (activity.findViewById<TextView?>(R.id.topNavTransparency) to activity.findViewById<View?>(R.id.topIndTransparency)),
            "EVENTS" to (activity.findViewById<TextView?>(R.id.topNavEvents) to activity.findViewById<View?>(R.id.topIndEvents)),
            "SK" to (activity.findViewById<TextView?>(R.id.topNavSk) to activity.findViewById<View?>(R.id.topIndSk)),
            "CONTACT" to (activity.findViewById<TextView?>(R.id.topNavContact) to activity.findViewById<View?>(R.id.topIndContact))
        )

        topNavMap.forEach { (key, pair) ->
            val (tv, indicator) = pair
            val isActive = key.equals(activeTopLink, ignoreCase = true)
            tv?.setTextColor(if (isActive) 0xFFFFCCCC.toInt() else 0xDDFFFFFF.toInt())
            indicator?.visibility = if (isActive) View.VISIBLE else View.INVISIBLE

            tv?.setOnClickListener {
                when (key) {
                    "HOME" -> navigateWithExplicitIntent(activity, MainActivity::class.java)
                    "ABOUT" -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "ABOUT")
                    "OFFICIALS" -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "OFFICIALS")
                    "SERVICES" -> navigateWithExplicitIntent(activity, ServicesActivity::class.java)
                    "TRANSPARENCY" -> navigateWithExplicitIntent(activity, TransparencySkActivity::class.java, "EXTRA_TAB" to "TRANSPARENCY")
                    "EVENTS" -> navigateWithExplicitIntent(activity, TransparencySkActivity::class.java, "EXTRA_TAB" to "EVENTS")
                    "SK" -> navigateWithExplicitIntent(activity, TransparencySkActivity::class.java, "EXTRA_TAB" to "SK")
                    "CONTACT" -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "CONTACT")
                }
            }
        }

        // 4. Persistent Bottom Navigation Bar (Highlights the currently active screen!)
        val bottomTabs = listOf(
            Triple("HOME", R.id.navTabHome, R.id.ivBottomHome to R.id.tvBottomHome),
            Triple("SERVICES", R.id.navTabServices, R.id.ivBottomServices to R.id.tvBottomServices),
            Triple("REQUEST", R.id.navTabRequest, R.id.ivBottomRequest to R.id.tvBottomRequest),
            Triple("TRACK", R.id.navTabTrack, R.id.ivBottomTrack to R.id.tvBottomTrack),
            Triple("DISCLOSURE", R.id.navTabMore, R.id.ivBottomMore to R.id.tvBottomMore)
        )

        val activeColor = 0xFF9C2007.toInt()
        val inactiveColor = 0xFF64748B.toInt()

        for ((tabKey, containerId, viewsPair) in bottomTabs) {
            val container = activity.findViewById<LinearLayout?>(containerId)
            val icon = activity.findViewById<ImageView?>(viewsPair.first)
            val label = activity.findViewById<TextView?>(viewsPair.second)

            val isSelected = tabKey.equals(activeBottomTab, ignoreCase = true)
            icon?.setColorFilter(if (isSelected) activeColor else inactiveColor)
            label?.setTextColor(if (isSelected) activeColor else inactiveColor)

            container?.setOnClickListener {
                when (tabKey) {
                    "HOME" -> navigateWithExplicitIntent(activity, MainActivity::class.java)
                    "SERVICES" -> navigateWithExplicitIntent(activity, ServicesActivity::class.java)
                    "REQUEST" -> navigateWithExplicitIntent(activity, RequestFormActivity::class.java)
                    "TRACK" -> navigateWithExplicitIntent(activity, TrackDocumentActivity::class.java)
                    "DISCLOSURE" -> navigateWithExplicitIntent(activity, TransparencySkActivity::class.java, "EXTRA_TAB" to "TRANSPARENCY")
                }
            }
        }

        // 5. Floating OnseBot AI Chatbot Button
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
        val statusHeader = if (SampleDataRepository.isLoggedIn) {
            "👤 ${SampleDataRepository.currentUserName}\n${SampleDataRepository.currentUserRole} (${SampleDataRepository.currentUserEmail})"
        } else {
            "👤 Guest Citizen (Not Signed In)"
        }

        val items = if (SampleDataRepository.isLoggedIn) {
            arrayOf(
                "My Resident Profile & Account (${SampleDataRepository.currentUserName})",
                "Request Barangay Certificate Online",
                "Track My Document Request Status",
                "Switch Demo Role (Captain / Staff / Kagawad / SK / Resident)",
                "Ask OnseBot AI Virtual Desk (24/7)",
                "Emergency Hotlines & Barangay Hall Contact",
                "Sign Out of SmartOnse"
            )
        } else {
            arrayOf(
                "Sign In / Register Resident Account",
                "Request Barangay Certificate Online",
                "Track Document Request Status",
                "Switch Demo Role (1-Click Capstone Login)",
                "Ask OnseBot AI Virtual Desk (24/7)",
                "Emergency Hotlines & Barangay Hall Contact"
            )
        }

        AlertDialog.Builder(activity)
            .setTitle(statusHeader)
            .setItems(items) { _, which ->
                if (SampleDataRepository.isLoggedIn) {
                    when (which) {
                        0 -> activity.startActivity(Intent(activity, LoginActivity::class.java))
                        1 -> navigateWithExplicitIntent(activity, RequestFormActivity::class.java)
                        2 -> navigateWithExplicitIntent(activity, TrackDocumentActivity::class.java)
                        3 -> activity.startActivity(Intent(activity, LoginActivity::class.java))
                        4 -> activity.startActivity(Intent(activity, ChatbotActivity::class.java))
                        5 -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "CONTACT")
                        6 -> {
                            SampleDataRepository.isLoggedIn = false
                            Toast.makeText(activity, "Signed out successfully.", Toast.LENGTH_SHORT).show()
                            activity.recreate()
                        }
                    }
                } else {
                    when (which) {
                        0 -> activity.startActivity(Intent(activity, LoginActivity::class.java))
                        1 -> navigateWithExplicitIntent(activity, RequestFormActivity::class.java)
                        2 -> navigateWithExplicitIntent(activity, TrackDocumentActivity::class.java)
                        3 -> activity.startActivity(Intent(activity, LoginActivity::class.java))
                        4 -> activity.startActivity(Intent(activity, ChatbotActivity::class.java))
                        5 -> navigateWithExplicitIntent(activity, AboutOfficialsActivity::class.java, "EXTRA_SECTION" to "CONTACT")
                    }
                }
            }
            .setNegativeButton("Close", null)
            .show()
    }
}
