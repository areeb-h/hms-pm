import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDoctors, getPatients, recordTreatment } from './actions'

export default async function TreatmentPage() {
  const patients = await getPatients()
  const doctors = await getDoctors()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Treatments</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Record Treatment</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={recordTreatment} className="space-y-4">
            <div>
              <label htmlFor="patientId">Patient</label>
              <select id="patientId" name="patientId" className="border rounded p-2">
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doctorId">Doctor</label>
              <select id="doctorId" name="doctorId" className="border rounded p-2">
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Record Treatment</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
