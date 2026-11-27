package ph.gov.barangayonse.smartonse

import android.os.Handler
import android.os.Looper
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.concurrent.Executors

/**
 * SmartOnseApiClient.kt
 *
 * Connects the Native Kotlin Android App to the live SmartOnse v2 PostgreSQL Database
 * (via `https://smartonse-v2.vercel.app/api/mobile` and `/api/chatbot`) with automatic
 * offline fallback to `SampleDataRepository` so the app works smoothly both online and offline.
 */
object SmartOnseApiClient {

    const val BASE_URL = "https://smartonse-v2.vercel.app"
    private val executor = Executors.newCachedThreadPool()
    private val mainHandler = Handler(Looper.getMainLooper())

    data class DashboardPayload(
        val isStaffOrAdmin: Boolean,
        val totalUsers: Int,
        val totalRbiInhabitants: Int,
        val totalRequests: Int,
        val pendingRequests: Int,
        val readyForPickupRequests: Int,
        val requests: List<TrackingRecord>,
        val rbiList: List<RbiInhabitantItem>,
        val auditLogs: List<AuditLogItem>
    )

    data class RbiInhabitantItem(
        val rbiNumber: String,
        val fullName: String,
        val age: Int,
        val sex: String,
        val address: String,
        val precinct: String,
        val occupation: String,
        val isVoter: Boolean
    )

    data class AuditLogItem(
        val action: String,
        val actor: String,
        val details: String,
        val timestamp: String
    )

    /**
     * 1. Live Database Sync (Officials, Services, Transparency, SK Programs, Events, Recent Tracking Records)
     */
    fun syncFromDatabase(onComplete: ((Boolean) -> Unit)? = null) {
        executor.execute {
            var success = false
            try {
                val jsonStr = httpGet("$BASE_URL/api/mobile?action=sync")
                val root = JSONObject(jsonStr)
                if (root.optBoolean("success", false)) {
                    // Sync recent document requests from PostgreSQL into SampleDataRepository.trackingRecords
                    val reqArr = root.optJSONArray("recentRequests") ?: JSONArray()
                    for (i in 0 until reqArr.length()) {
                        val obj = reqArr.getJSONObject(i)
                        val trackingNum = obj.optString("trackingNumber", "")
                        if (trackingNum.isNotEmpty()) {
                            val record = TrackingRecord(
                                trackingNumber = trackingNum,
                                applicantName = obj.optString("applicantName", "Barangay Onse Resident"),
                                contactNumber = obj.optString("contactNumber", "09171234567"),
                                address = obj.optString("address", "Barangay Onse, San Juan City"),
                                documentType = obj.optString("documentType", "Barangay Clearance"),
                                purpose = obj.optString("purpose", "Official Requirement"),
                                copies = obj.optInt("copies", 1),
                                fee = obj.optString("fee", "₱50.00"),
                                status = obj.optString("status", "PENDING"),
                                filedDate = obj.optString("filedDate", "Synced from DB"),
                                remarks = obj.optString("remarks", "Synced with SmartOnse PostgreSQL Database.")
                            )
                            val existingIdx = SampleDataRepository.trackingRecords.indexOfFirst {
                                it.trackingNumber.equals(trackingNum, ignoreCase = true)
                            }
                            if (existingIdx >= 0) {
                                SampleDataRepository.trackingRecords[existingIdx] = record
                            } else {
                                SampleDataRepository.trackingRecords.add(0, record)
                            }
                        }
                    }
                    SampleDataRepository.isDatabaseConnected = true
                    success = true
                }
            } catch (_: Exception) {
                success = false
            }
            mainHandler.post {
                onComplete?.invoke(success)
            }
        }
    }

    /**
     * 2. Submit New Certificate Request directly to PostgreSQL Database
     */
    fun submitRequestToDatabase(
        fullName: String,
        contactNumber: String,
        address: String,
        documentType: String,
        purpose: String,
        copies: Int,
        email: String,
        onResult: (Boolean, TrackingRecord?, String?) -> Unit
    ) {
        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("action", "submit_request")
                    put("fullName", fullName)
                    put("contactNumber", contactNumber)
                    put("address", address)
                    put("documentType", documentType)
                    put("purpose", purpose)
                    put("copies", copies)
                    put("email", email)
                }
                val respStr = httpPost("$BASE_URL/api/mobile", payload.toString())
                val root = JSONObject(respStr)
                if (root.optBoolean("success", false)) {
                    val trackingNumber = root.optString("trackingNumber", SampleDataRepository.generateNextTrackingCode())
                    val docName = root.optString("documentType", documentType)
                    val feeDisplay = root.optString("feeDisplay", "₱50.00")
                    val status = root.optString("status", "PENDING")
                    val filedDate = root.optString("filedDate", "Just Now • Live DB")
                    val remarks = root.optString(
                        "remarks",
                        "Saved to SmartOnse PostgreSQL Database. Step 1 of 4: Pending Desk Officer Verification."
                    )
                    val record = TrackingRecord(
                        trackingNumber = trackingNumber,
                        applicantName = fullName,
                        contactNumber = contactNumber,
                        address = address,
                        documentType = docName,
                        purpose = purpose,
                        copies = copies,
                        fee = feeDisplay,
                        status = status,
                        filedDate = filedDate,
                        remarks = remarks
                    )
                    SampleDataRepository.trackingRecords.add(0, record)
                    SampleDataRepository.isDatabaseConnected = true
                    mainHandler.post { onResult(true, record, null) }
                    return@execute
                } else {
                    val err = root.optString("error", "Database submission error")
                    mainHandler.post { onResult(false, null, err) }
                    return@execute
                }
            } catch (e: Exception) {
                mainHandler.post { onResult(false, null, e.message) }
            }
        }
    }

    /**
     * 3. Live Tracking Lookup from PostgreSQL Database
     */
    fun trackDocumentFromDatabase(
        trackingCode: String,
        onResult: (TrackingRecord?) -> Unit
    ) {
        executor.execute {
            var foundRecord: TrackingRecord? = null
            try {
                val encoded = URLEncoder.encode(trackingCode.trim().uppercase(), "UTF-8")
                val jsonStr = httpGet("$BASE_URL/api/mobile?action=track&code=$encoded")
                val root = JSONObject(jsonStr)
                if (root.optBoolean("success", false)) {
                    val obj = root.getJSONObject("record")
                    foundRecord = TrackingRecord(
                        trackingNumber = obj.optString("trackingNumber", trackingCode.uppercase()),
                        applicantName = obj.optString("applicantName", "Barangay Onse Citizen"),
                        contactNumber = obj.optString("contactNumber", "0917-123-4567"),
                        address = obj.optString("address", "Barangay Onse, San Juan City"),
                        documentType = obj.optString("documentType", "Barangay Certificate"),
                        purpose = obj.optString("purpose", "Official Requirement"),
                        copies = obj.optInt("copies", 1),
                        fee = obj.optString("fee", "₱50.00"),
                        status = obj.optString("status", "PENDING"),
                        filedDate = obj.optString("filedDate", "Live Database Record"),
                        remarks = obj.optString("remarks", "Verified in SmartOnse PostgreSQL Database.")
                    )
                    val idx = SampleDataRepository.trackingRecords.indexOfFirst {
                        it.trackingNumber.equals(foundRecord.trackingNumber, ignoreCase = true)
                    }
                    if (idx >= 0) {
                        SampleDataRepository.trackingRecords[idx] = foundRecord
                    } else {
                        SampleDataRepository.trackingRecords.add(0, foundRecord)
                    }
                    SampleDataRepository.isDatabaseConnected = true
                }
            } catch (_: Exception) {
                foundRecord = SampleDataRepository.findTrackingByCode(trackingCode)
            }
            if (foundRecord == null) {
                foundRecord = SampleDataRepository.findTrackingByCode(trackingCode)
            }
            mainHandler.post {
                onResult(foundRecord)
            }
        }
    }

    /**
     * 4. Authenticate Resident / Staff / Admin against Live PostgreSQL Database
     */
    fun loginWithDatabase(
        emailOrPhone: String,
        password: String,
        onResult: (Boolean, String?) -> Unit
    ) {
        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("action", "login")
                    put("email", emailOrPhone)
                    put("password", password)
                }
                val respStr = httpPost("$BASE_URL/api/mobile", payload.toString())
                val root = JSONObject(respStr)
                if (root.optBoolean("success", false)) {
                    val user = root.getJSONObject("user")
                    SampleDataRepository.currentUserName = user.optString("name", "Barangay Onse User")
                    SampleDataRepository.currentUserEmail = user.optString("email", emailOrPhone)
                    SampleDataRepository.currentUserRole = user.optString("roleTitle", "Verified Resident")
                    SampleDataRepository.currentUserRawRole = user.optString("role", "resident")
                    SampleDataRepository.currentUserAddress = user.optString("address", "Barangay Onse, San Juan City")
                    SampleDataRepository.currentUserPhone = user.optString("phone", "09171234567")
                    SampleDataRepository.isLoggedIn = true
                    SampleDataRepository.isDatabaseConnected = true
                    mainHandler.post { onResult(true, null) }
                    return@execute
                } else {
                    val err = root.optString("error", "Invalid credentials")
                    mainHandler.post { onResult(false, err) }
                    return@execute
                }
            } catch (e: Exception) {
                mainHandler.post { onResult(false, e.message) }
            }
        }
    }

    /**
     * 5. 1-Click Demo Role Switch synced with PostgreSQL Database + AuditLog
     */
    fun demoLoginWithDatabase(
        roleId: String,
        onResult: (Boolean) -> Unit
    ) {
        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("action", "demo_login")
                    put("roleId", roleId)
                }
                val respStr = httpPost("$BASE_URL/api/mobile", payload.toString())
                val root = JSONObject(respStr)
                if (root.optBoolean("success", false)) {
                    val user = root.getJSONObject("user")
                    SampleDataRepository.currentUserName = user.optString("name", SampleDataRepository.currentUserName)
                    SampleDataRepository.currentUserEmail = user.optString("email", SampleDataRepository.currentUserEmail)
                    SampleDataRepository.currentUserRole = user.optString("roleTitle", SampleDataRepository.currentUserRole)
                    SampleDataRepository.currentUserRawRole = user.optString("role", roleId)
                    SampleDataRepository.currentUserAddress = user.optString("address", "Barangay Onse, San Juan City")
                    SampleDataRepository.currentUserPhone = user.optString("phone", "09171234567")
                    SampleDataRepository.isLoggedIn = true
                    SampleDataRepository.isDatabaseConnected = true
                    mainHandler.post { onResult(true) }
                    return@execute
                }
            } catch (_: Exception) {
            }
            mainHandler.post { onResult(false) }
        }
    }

    /**
     * 6. Register New Resident Account in Live PostgreSQL Database (with R.A. 10173 ConsentRecord)
     */
    fun registerResidentInDatabase(
        name: String,
        email: String,
        phone: String,
        address: String,
        password: String,
        onResult: (Boolean, String?) -> Unit
    ) {
        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("action", "register")
                    put("name", name)
                    put("email", email)
                    put("phone", phone)
                    put("address", address)
                    put("password", password)
                }
                val respStr = httpPost("$BASE_URL/api/mobile", payload.toString())
                val root = JSONObject(respStr)
                if (root.optBoolean("success", false)) {
                    val user = root.getJSONObject("user")
                    SampleDataRepository.currentUserName = user.optString("name", name)
                    SampleDataRepository.currentUserEmail = user.optString("email", email)
                    SampleDataRepository.currentUserRole = "Verified Resident"
                    SampleDataRepository.currentUserRawRole = "resident"
                    SampleDataRepository.currentUserAddress = address
                    SampleDataRepository.currentUserPhone = phone
                    SampleDataRepository.isLoggedIn = true
                    SampleDataRepository.isDatabaseConnected = true
                    mainHandler.post { onResult(true, null) }
                    return@execute
                } else {
                    mainHandler.post { onResult(false, root.optString("error", "Registration failed")) }
                    return@execute
                }
            } catch (e: Exception) {
                mainHandler.post { onResult(false, e.message) }
            }
        }
    }

    /**
     * 7. Fetch Full System Dashboard (Admin Request Queue, Resident Requests, RBI Registry, Audit Logs)
     */
    fun fetchSystemDashboard(
        onResult: (DashboardPayload) -> Unit
    ) {
        executor.execute {
            try {
                val emailEnc = URLEncoder.encode(SampleDataRepository.currentUserEmail, "UTF-8")
                val roleEnc = URLEncoder.encode(SampleDataRepository.currentUserRole, "UTF-8")
                val jsonStr = httpGet("$BASE_URL/api/mobile?action=dashboard&email=$emailEnc&role=$roleEnc")
                val root = JSONObject(jsonStr)
                if (root.optBoolean("success", false)) {
                    val isStaffOrAdmin = root.optBoolean("isStaffOrAdmin", false)
                    val metrics = root.optJSONObject("metrics") ?: JSONObject()

                    val reqArr = root.optJSONArray("requests") ?: JSONArray()
                    val requests = mutableListOf<TrackingRecord>()
                    for (i in 0 until reqArr.length()) {
                        val r = reqArr.getJSONObject(i)
                        requests.add(
                            TrackingRecord(
                                trackingNumber = r.optString("trackingNumber"),
                                applicantName = r.optString("applicantName"),
                                contactNumber = r.optString("contactNumber"),
                                address = r.optString("address"),
                                documentType = r.optString("documentType"),
                                purpose = r.optString("purpose"),
                                copies = 1,
                                fee = r.optString("fee"),
                                status = r.optString("status"),
                                filedDate = r.optString("filedDate"),
                                remarks = r.optString("remarks")
                            )
                        )
                    }

                    val rbiArr = root.optJSONArray("rbiList") ?: JSONArray()
                    val rbiList = mutableListOf<RbiInhabitantItem>()
                    for (i in 0 until rbiArr.length()) {
                        val inh = rbiArr.getJSONObject(i)
                        rbiList.add(
                            RbiInhabitantItem(
                                rbiNumber = inh.optString("rbiNumber"),
                                fullName = inh.optString("fullName"),
                                age = inh.optInt("age", 30),
                                sex = inh.optString("sex", "Male"),
                                address = inh.optString("address"),
                                precinct = inh.optString("precinct"),
                                occupation = inh.optString("occupation"),
                                isVoter = inh.optBoolean("isVoter", true)
                            )
                        )
                    }

                    val logArr = root.optJSONArray("auditLogs") ?: JSONArray()
                    val auditLogs = mutableListOf<AuditLogItem>()
                    for (i in 0 until logArr.length()) {
                        val l = logArr.getJSONObject(i)
                        auditLogs.add(
                            AuditLogItem(
                                action = l.optString("action"),
                                actor = l.optString("actor"),
                                details = l.optString("details"),
                                timestamp = l.optString("timestamp")
                            )
                        )
                    }

                    SampleDataRepository.isDatabaseConnected = true
                    val payload = DashboardPayload(
                        isStaffOrAdmin = isStaffOrAdmin,
                        totalUsers = metrics.optInt("totalUsers", 38),
                        totalRbiInhabitants = metrics.optInt("totalRbiInhabitants", 34),
                        totalRequests = metrics.optInt("totalRequests", requests.size),
                        pendingRequests = metrics.optInt("pendingRequests", 2),
                        readyForPickupRequests = metrics.optInt("readyForPickupRequests", 2),
                        requests = requests,
                        rbiList = rbiList,
                        auditLogs = auditLogs
                    )
                    mainHandler.post { onResult(payload) }
                    return@execute
                }
            } catch (_: Exception) {
            }

            // Fallback if offline
            val isAdmin = SampleDataRepository.currentUserRole.contains("Captain", true) ||
                SampleDataRepository.currentUserRole.contains("Admin", true) ||
                SampleDataRepository.currentUserRole.contains("Staff", true) ||
                SampleDataRepository.currentUserRole.contains("Kagawad", true) ||
                SampleDataRepository.currentUserRole.contains("SK", true)

            val fallbackPayload = DashboardPayload(
                isStaffOrAdmin = isAdmin,
                totalUsers = 38,
                totalRbiInhabitants = 34,
                totalRequests = SampleDataRepository.trackingRecords.size,
                pendingRequests = SampleDataRepository.trackingRecords.count { it.status.contains("PENDING", true) },
                readyForPickupRequests = SampleDataRepository.trackingRecords.count { it.status.contains("READY", true) },
                requests = SampleDataRepository.trackingRecords,
                rbiList = listOf(
                    RbiInhabitantItem("RBI-2024-00001", "Juan Martinez Dela Cruz", 45, "Male", "145 Lt. Artiaga St., Barangay Onse", "PRECINCT-0042A", "Jeepney Driver", true),
                    RbiInhabitantItem("RBI-2024-00002", "Maria Cruz Dela Cruz", 43, "Female", "145 Lt. Artiaga St., Barangay Onse", "PRECINCT-0042A", "Store Owner", true),
                    RbiInhabitantItem("RBI-2024-00005", "Roberto Reyes Santos", 56, "Male", "88 J.V. Panganiban St., Barangay Onse", "PRECINCT-0042B", "Electrician", true),
                    RbiInhabitantItem("RBI-2024-00008", "Teresita Villanueva Ramos", 72, "Female", "204 F. Manalo St., Barangay Onse", "PRECINCT-0044B", "Senior Citizen", true)
                ),
                auditLogs = listOf(
                    AuditLogItem("SYSTEM_SYNC", SampleDataRepository.currentUserName, "Accessed SmartOnse Full System Dashboard", "Today")
                )
            )
            mainHandler.post { onResult(fallbackPayload) }
        }
    }

    /**
     * 8. Admin / Staff: Update Document Request Status in Live PostgreSQL Database
     */
    fun updateRequestStatusInDatabase(
        trackingNumber: String,
        newStatus: String,
        onResult: (Boolean, String) -> Unit
    ) {
        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("action", "update_request_status")
                    put("trackingNumber", trackingNumber)
                    put("status", newStatus)
                    put("actor", "${SampleDataRepository.currentUserName} (${SampleDataRepository.currentUserRole})")
                }
                val respStr = httpPost("$BASE_URL/api/mobile", payload.toString())
                val root = JSONObject(respStr)
                if (root.optBoolean("success", false)) {
                    val remarks = root.optString("remarks", "Status updated in PostgreSQL database.")
                    val idx = SampleDataRepository.trackingRecords.indexOfFirst {
                        it.trackingNumber.equals(trackingNumber, ignoreCase = true)
                    }
                    if (idx >= 0) {
                        val old = SampleDataRepository.trackingRecords[idx]
                        SampleDataRepository.trackingRecords[idx] = old.copy(
                            status = newStatus.replace("_", " "),
                            remarks = remarks
                        )
                    }
                    mainHandler.post { onResult(true, remarks) }
                    return@execute
                }
            } catch (_: Exception) {
            }
            // Also update in local session
            val idx = SampleDataRepository.trackingRecords.indexOfFirst {
                it.trackingNumber.equals(trackingNumber, ignoreCase = true)
            }
            if (idx >= 0) {
                val old = SampleDataRepository.trackingRecords[idx]
                SampleDataRepository.trackingRecords[idx] = old.copy(status = newStatus.replace("_", " "))
            }
            mainHandler.post { onResult(true, "Updated #$trackingNumber to $newStatus") }
        }
    }

    /**
     * 9. Live OnseBot AI Backend Query (`/api/chatbot`) with Offline Fallback
     */
    fun askOnseBotBackend(
        question: String,
        onResult: (String?) -> Unit
    ) {
        executor.execute {
            var reply: String? = null
            try {
                val payload = JSONObject().apply {
                    put("message", question)
                }
                val respStr = httpPost("$BASE_URL/api/chatbot", payload.toString())
                val root = JSONObject(respStr)
                val serverReply = root.optString("reply", "")
                if (serverReply.isNotBlank()) {
                    reply = serverReply
                }
            } catch (_: Exception) {
                reply = null
            }
            mainHandler.post { onResult(reply) }
        }
    }

    private fun httpGet(urlString: String): String {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 7000
            readTimeout = 7000
            setRequestProperty("Accept", "application/json")
        }
        return try {
            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            BufferedReader(InputStreamReader(stream)).use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }

    private fun httpPost(urlString: String, jsonBody: String): String {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 8000
            readTimeout = 8000
            doOutput = true
            setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            setRequestProperty("Accept", "application/json")
        }
        return try {
            OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use { writer ->
                writer.write(jsonBody)
                writer.flush()
            }
            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            BufferedReader(InputStreamReader(stream)).use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }
}
