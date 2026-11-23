package ph.gov.barangayonse.smartonse

import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebSettings
import androidx.core.view.WindowCompat
import com.getcapacitor.BridgeActivity

/**
 * MainActivity (Kotlin) — Primary Android Studio Entry Point for SmartOnse v2
 * Barangay Onse Digital E-Governance Mobile Application (San Juan City)
 *
 * Connects directly to the SmartOnse v2 Next.js 15 & PostgreSQL/Prisma backend,
 * preserving JWT (jose) HttpOnly session cookies, RBAC, and native Android hardware bridges.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(SmartOnseDatabaseBridgePlugin::class.java)
        super.onCreate(savedInstanceState)

        // Ensure edge-to-edge system bar compatibility
        WindowCompat.setDecorFitsSystemWindows(window, true)

        // Enable persistent First-Party & Third-Party JWT Session Cookies for PostgreSQL API auth
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        bridge?.webView?.let { webView ->
            cookieManager.setAcceptThirdPartyCookies(webView, true)
            webView.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                userAgentString = "$userAgentString SmartOnseAndroidKotlin/2.0"
            }
        }
    }
}
