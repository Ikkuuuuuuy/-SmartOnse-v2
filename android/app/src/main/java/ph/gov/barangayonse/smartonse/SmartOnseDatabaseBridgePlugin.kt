package ph.gov.barangayonse.smartonse

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.BufferedReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * SmartOnseDatabaseBridgePlugin (Kotlin)
 *
 * Native Kotlin Repository & Capacitor Bridge that communicates directly with the
 * SmartOnse v2 Next.js + Prisma PostgreSQL API endpoints:
 *  - GET  /api/services       (Live Barangay certificates & e-services from PostgreSQL)
 *  - GET  /api/documents      (Real-time tracking of DocumentRequest records in PostgreSQL)
 *  - POST /api/documents      (Create new DocumentRequest in PostgreSQL)
 *  - GET  /api/transparency   (Full Public Disclosure board documents from PostgreSQL)
 */
@CapacitorPlugin(name = "SmartOnseDatabaseBridge")
class SmartOnseDatabaseBridgePlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private fun getBaseServerUrl(): String {
        return bridge?.serverUrl?.trimEnd('/') ?: "https://smartonse-v2.vercel.app"
    }

    @PluginMethod
    fun checkDatabaseHealth(call: PluginCall) {
        scope.launch {
            try {
                val endpoint = "${getBaseServerUrl()}/api/services"
                val response = executeGetRequest(endpoint)
                val json = JSONObject(response)
                val ret = JSObject().apply {
                    put("connected", json.optBoolean("success", false))
                    put("serverUrl", getBaseServerUrl())
                    put("engine", "Kotlin Coroutines + Prisma PostgreSQL")
                    put("certificatesCount", json.optJSONArray("certificates")?.length() ?: 0)
                }
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Database connection check failed: ${e.localizedMessage}", e)
            }
        }
    }

    @PluginMethod
    fun trackDocumentInDatabase(call: PluginCall) {
        val trackingNumber = call.getString("trackingNumber")?.trim()
        if (trackingNumber.isNullOrEmpty()) {
            call.reject("trackingNumber is required")
            return
        }

        scope.launch {
            try {
                val endpoint = "${getBaseServerUrl()}/api/documents?trackingNumber=$trackingNumber"
                val response = executeGetRequest(endpoint)
                call.resolve(JSObject(response))
            } catch (e: Exception) {
                call.reject("Failed to query document tracking number: ${e.localizedMessage}", e)
            }
        }
    }

    @PluginMethod
    fun submitDocumentRequest(call: PluginCall) {
        val payload = call.data
        scope.launch {
            try {
                val endpoint = "${getBaseServerUrl()}/api/documents"
                val response = executePostRequest(endpoint, payload.toString())
                call.resolve(JSObject(response))
            } catch (e: Exception) {
                call.reject("Failed to submit document request: ${e.localizedMessage}", e)
            }
        }
    }

    private fun executeGetRequest(urlString: String): String {
        val conn = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10_000
            readTimeout = 10_000
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "SmartOnseAndroidKotlin/2.0")
        }
        return conn.inputStream.bufferedReader().use(BufferedReader::readText)
    }

    private fun executePostRequest(urlString: String, jsonBody: String): String {
        val conn = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 12_000
            readTimeout = 12_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "SmartOnseAndroidKotlin/2.0")
        }
        OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use { writer ->
            writer.write(jsonBody)
            writer.flush()
        }
        return conn.inputStream.bufferedReader().use(BufferedReader::readText)
    }
}
