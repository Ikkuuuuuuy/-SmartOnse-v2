package ph.gov.barangayonse.smartonse

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {
    @Test
    fun sampleRepository_hasPredefinedServicesAndOfficials() {
        assertTrue(SampleDataRepository.servicesList.isNotEmpty())
        assertEquals(20, SampleDataRepository.officialsList.size)
    }
}
