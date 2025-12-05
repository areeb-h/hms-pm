import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:sqlite.db',
  ...(process.env.DATABASE_AUTH_TOKEN && { authToken: process.env.DATABASE_AUTH_TOKEN }),
})
const db = drizzle(client, { schema })

const { ward, team, doctor, teamConsultant, patient, treatmentRecord, auditLog, user } = schema

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await db.delete(auditLog)
  await db.delete(treatmentRecord)
  await db.delete(patient)
  await db.delete(teamConsultant)
  await db.delete(doctor)
  await db.delete(team)
  await db.delete(ward)
  await db.delete(user)
  console.log('✅ Existing data cleared')

  // Seed users (hardcoded for demo)
  const users = [
    {
      email: 'admin@hospital.com',
      password: 'admin123', // In production, hash with bcrypt
      name: 'Admin User',
      role: 'admin' as const,
    },
    {
      email: 'superadmin@hospital.com',
      password: 'super123', // In production, hash with bcrypt
      name: 'Super Admin',
      role: 'superadmin' as const,
    },
    {
      email: 'john.admin@hospital.com',
      password: 'john123', // In production, hash with bcrypt
      name: 'John Administrator',
      role: 'admin' as const,
    },
  ]

  console.log('👤 Seeding users...')
  const insertedUsers = await db.insert(user).values(users).returning()
  console.log('✅ Users seeded')

  // Seed wards
  const wards = [
    { name: 'Male Ward A', genderType: 'male', capacity: 20 },
    { name: 'Male Ward B', genderType: 'male', capacity: 15 },
    { name: 'Female Ward A', genderType: 'female', capacity: 18 },
    { name: 'Female Ward B', genderType: 'female', capacity: 12 },
    { name: 'Mixed Ward', genderType: 'mixed', capacity: 10 },
  ]

  console.log('🏥 Seeding wards...')
  const insertedWards = await db.insert(ward).values(wards).returning()

  // Seed teams
  const teams = [
    { code: 'CARD', name: 'Cardiology' },
    { code: 'NEUR', name: 'Neurology' },
    { code: 'ORTH', name: 'Orthopedics' },
    { code: 'SURG', name: 'General Surgery' },
    { code: 'MED', name: 'Internal Medicine' },
  ]

  console.log('👥 Seeding teams...')
  const insertedTeams = await db.insert(team).values(teams).returning()

  // Seed doctors
  const doctors = [
    // Cardiology
    { name: 'Dr. Sarah Johnson', grade: 'consultant', teamId: insertedTeams[0].id },
    { name: 'Dr. Michael Chen', grade: 'junior1', teamId: insertedTeams[0].id },
    { name: 'Dr. Emily Davis', grade: 'junior2', teamId: insertedTeams[0].id },

    // Neurology
    { name: 'Dr. Robert Wilson', grade: 'consultant', teamId: insertedTeams[1].id },
    { name: 'Dr. Lisa Brown', grade: 'junior1', teamId: insertedTeams[1].id },

    // Orthopedics
    { name: 'Dr. James Miller', grade: 'consultant', teamId: insertedTeams[2].id },
    { name: 'Dr. Patricia Garcia', grade: 'junior1', teamId: insertedTeams[2].id },
    { name: 'Dr. David Lee', grade: 'junior2', teamId: insertedTeams[2].id },

    // General Surgery
    { name: 'Dr. Jennifer Taylor', grade: 'consultant', teamId: insertedTeams[3].id },
    { name: 'Dr. Christopher Anderson', grade: 'junior1', teamId: insertedTeams[3].id },

    // Internal Medicine
    { name: 'Dr. Maria Rodriguez', grade: 'consultant', teamId: insertedTeams[4].id },
    { name: 'Dr. Kevin Thompson', grade: 'junior1', teamId: insertedTeams[4].id },
    { name: 'Dr. Amanda White', grade: 'junior2', teamId: insertedTeams[4].id },
  ]

  console.log('👨‍⚕️ Seeding doctors...')
  const insertedDoctors = await db.insert(doctor).values(doctors).returning()

  // Seed team consultants (linking consultants to teams)
  const consultants = insertedDoctors.filter(d => d.grade === 'consultant')
  const teamConsultants = consultants.map((doc, index) => ({
    teamId: insertedTeams[index % insertedTeams.length].id,
    doctorId: doc.id,
  }))

  console.log('🔗 Seeding team consultants...')
  await db.insert(teamConsultant).values(teamConsultants)

  // Seed patients
  const patients = [
    // Male patients
    {
      name: 'John Smith',
      dob: '1985-03-15',
      gender: 'male',
      wardId: insertedWards[0].id,
      teamId: insertedTeams[0].id,
    },
    {
      name: 'Robert Johnson',
      dob: '1978-07-22',
      gender: 'male',
      wardId: insertedWards[0].id,
      teamId: insertedTeams[2].id,
    },
    {
      name: 'Michael Brown',
      dob: '1990-11-08',
      gender: 'male',
      wardId: insertedWards[1].id,
      teamId: insertedTeams[3].id,
    },
    {
      name: 'William Davis',
      dob: '1965-05-30',
      gender: 'male',
      wardId: insertedWards[1].id,
      teamId: insertedTeams[4].id,
    },
    {
      name: 'David Wilson',
      dob: '1982-09-14',
      gender: 'male',
      wardId: insertedWards[0].id,
      teamId: insertedTeams[1].id,
    },

    // Female patients
    {
      name: 'Mary Garcia',
      dob: '1975-12-03',
      gender: 'female',
      wardId: insertedWards[2].id,
      teamId: insertedTeams[0].id,
    },
    {
      name: 'Jennifer Miller',
      dob: '1988-04-18',
      gender: 'female',
      wardId: insertedWards[2].id,
      teamId: insertedTeams[1].id,
    },
    {
      name: 'Linda Anderson',
      dob: '1968-08-25',
      gender: 'female',
      wardId: insertedWards[3].id,
      teamId: insertedTeams[2].id,
    },
    {
      name: 'Patricia Taylor',
      dob: '1992-01-10',
      gender: 'female',
      wardId: insertedWards[3].id,
      teamId: insertedTeams[3].id,
    },
    {
      name: 'Susan Thomas',
      dob: '1970-06-07',
      gender: 'female',
      wardId: insertedWards[2].id,
      teamId: insertedTeams[4].id,
    },

    // Mixed ward patients
    {
      name: 'James Jackson',
      dob: '1980-02-28',
      gender: 'male',
      wardId: insertedWards[4].id,
      teamId: insertedTeams[0].id,
    },
    {
      name: 'Barbara White',
      dob: '1973-10-12',
      gender: 'female',
      wardId: insertedWards[4].id,
      teamId: insertedTeams[1].id,
    },
    {
      name: 'Richard Harris',
      dob: '1960-07-19',
      gender: 'male',
      wardId: insertedWards[4].id,
      teamId: insertedTeams[2].id,
    },
    {
      name: 'Margaret Martin',
      dob: '1985-03-05',
      gender: 'female',
      wardId: insertedWards[4].id,
      teamId: insertedTeams[3].id,
    },
    {
      name: 'Charles Thompson',
      dob: '1977-11-23',
      gender: 'male',
      wardId: insertedWards[4].id,
      teamId: insertedTeams[4].id,
    },
  ]

  console.log('🏥 Seeding patients...')
  const insertedPatients = await db.insert(patient).values(patients).returning()

  // Seed audit logs for patient admissions
  console.log('📋 Seeding audit logs for patient admissions...')
  const admissionAuditLogs = insertedPatients.map((p, index) => ({
    action: 'admit_patient',
    entityType: 'patient',
    entityId: p.id,
    userId: insertedUsers[index % 2 === 0 ? 0 : 2].id, // Alternate between admin and john.admin
    details: JSON.stringify({
      patientName: p.name,
      patientGender: p.gender,
      patientDob: p.dob,
      wardId: p.wardId,
      wardName: insertedWards.find(w => w.id === p.wardId)?.name,
      teamId: p.teamId,
      teamName: insertedTeams.find(t => t.id === p.teamId)?.name,
      admissionDate: p.admissionDate,
    }),
    timestamp: new Date(p.admissionDate).toISOString(),
  }))
  await db.insert(auditLog).values(admissionAuditLogs)

  // Seed treatment records
  console.log('💊 Seeding treatment records...')
  const treatmentRecords = [
    // Treatments for John Doe (Patient 1) by Cardiology team
    {
      patientId: insertedPatients[0].id,
      doctorId: insertedDoctors[0].id, // Dr. Sarah Johnson (Consultant Cardiologist)
      description: 'ECG monitoring and cardiac assessment',
      notes: 'Patient stable, normal sinus rhythm observed',
      treatmentDate: new Date('2024-01-15T09:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[0].id,
      doctorId: insertedDoctors[1].id, // Dr. Michael Chen (Junior Doctor)
      description: 'Blood pressure medication adjustment',
      notes: 'Increased dosage of beta-blockers, monitor for side effects',
      treatmentDate: new Date('2024-01-16T14:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[0].id,
      doctorId: insertedDoctors[0].id,
      description: 'Follow-up cardiac consultation',
      notes: 'Patient responding well to treatment, continue current regimen',
      treatmentDate: new Date('2024-01-18T10:00:00').toISOString(),
    },

    // Treatments for Jane Smith (Patient 2) by Neurology team
    {
      patientId: insertedPatients[1].id,
      doctorId: insertedDoctors[3].id, // Dr. Emily Rodriguez (Consultant Neurologist)
      description: 'Neurological examination and reflex testing',
      notes: 'Mild peripheral neuropathy detected, further tests recommended',
      treatmentDate: new Date('2024-01-15T11:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[1].id,
      doctorId: insertedDoctors[4].id, // Dr. David Kumar (Junior Doctor)
      description: 'Nerve conduction study',
      notes: 'Results consistent with diabetic neuropathy',
      treatmentDate: new Date('2024-01-17T13:30:00').toISOString(),
    },

    // Treatments for Robert Wilson (Patient 3) by Orthopedics team
    {
      patientId: insertedPatients[2].id,
      doctorId: insertedDoctors[6].id, // Dr. Amanda Foster (Consultant Orthopedic Surgeon)
      description: 'Post-operative wound inspection',
      notes: 'Surgical site healing well, no signs of infection',
      treatmentDate: new Date('2024-01-14T08:45:00').toISOString(),
    },
    {
      patientId: insertedPatients[2].id,
      doctorId: insertedDoctors[7].id, // Dr. James Mitchell (Junior Doctor)
      description: 'Physical therapy session',
      notes: 'Range of motion improving, continue daily exercises',
      treatmentDate: new Date('2024-01-16T15:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[2].id,
      doctorId: insertedDoctors[6].id,
      description: 'X-ray review and mobility assessment',
      notes: 'Bone healing progressing as expected, cleared for weight-bearing',
      treatmentDate: new Date('2024-01-19T09:15:00').toISOString(),
    },

    // Treatments for William Brown (Patient 4) by General Surgery team
    {
      patientId: insertedPatients[3].id,
      doctorId: insertedDoctors[9].id, // Dr. Rachel Adams (Consultant General Surgeon)
      description: 'Pre-operative assessment',
      notes: 'Patient cleared for surgery, all vitals stable',
      treatmentDate: new Date('2024-01-13T14:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[3].id,
      doctorId: insertedDoctors[9].id,
      description: 'Appendectomy procedure',
      notes: 'Laparoscopic appendectomy completed successfully, minimal complications',
      treatmentDate: new Date('2024-01-14T10:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[3].id,
      doctorId: insertedDoctors[10].id, // Dr. Thomas Lee (Junior Doctor)
      description: 'Post-operative monitoring',
      notes: 'Patient recovering well, pain managed with prescribed medication',
      treatmentDate: new Date('2024-01-15T16:00:00').toISOString(),
    },

    // Treatments for Mary Davis (Patient 5) by Internal Medicine team
    {
      patientId: insertedPatients[4].id,
      doctorId: insertedDoctors[12].id, // Dr. Daniel Park (Consultant Internist)
      description: 'Comprehensive metabolic panel review',
      notes: 'Elevated glucose levels, initiated diabetes management protocol',
      treatmentDate: new Date('2024-01-15T10:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[4].id,
      doctorId: insertedDoctors[12].id,
      description: 'Diabetes education and insulin training',
      notes: 'Patient educated on insulin administration and glucose monitoring',
      treatmentDate: new Date('2024-01-17T14:30:00').toISOString(),
    },

    // Additional treatments for other patients
    {
      patientId: insertedPatients[5].id, // Michael Johnson
      doctorId: insertedDoctors[1].id,
      description: 'Routine cardiac monitoring',
      notes: 'No significant changes, continue current treatment plan',
      treatmentDate: new Date('2024-01-16T09:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[6].id, // Jennifer Miller
      doctorId: insertedDoctors[4].id,
      description: 'Headache assessment and CT scan review',
      notes: 'No structural abnormalities found, prescribed migraine medication',
      treatmentDate: new Date('2024-01-17T11:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[7].id, // Linda Anderson
      doctorId: insertedDoctors[7].id,
      description: 'Joint pain evaluation',
      notes: 'Arthritis symptoms managed with anti-inflammatory medication',
      treatmentDate: new Date('2024-01-15T13:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[8].id, // Patricia Taylor
      doctorId: insertedDoctors[10].id,
      description: 'Abdominal pain investigation',
      notes: 'Ultrasound ordered, advised clear liquid diet temporarily',
      treatmentDate: new Date('2024-01-16T10:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[9].id, // Susan Thomas
      doctorId: insertedDoctors[12].id,
      description: 'Hypertension management',
      notes: 'Blood pressure controlled with current medication, continue monitoring',
      treatmentDate: new Date('2024-01-18T08:30:00').toISOString(),
    },
    {
      patientId: insertedPatients[10].id, // James Jackson
      doctorId: insertedDoctors[2].id, // Dr. Lisa Williams (Junior Doctor - Cardiology)
      description: 'Chest pain evaluation',
      notes: 'Cardiac enzymes normal, likely musculoskeletal origin',
      treatmentDate: new Date('2024-01-17T15:00:00').toISOString(),
    },
    {
      patientId: insertedPatients[11].id, // Barbara White
      doctorId: insertedDoctors[5].id, // Dr. Jennifer Scott (Junior Doctor - Neurology)
      description: 'Dizziness and balance assessment',
      notes: 'Inner ear examination normal, prescribed vestibular exercises',
      treatmentDate: new Date('2024-01-16T11:00:00').toISOString(),
    },
  ]

  await db.insert(treatmentRecord).values(treatmentRecords)

  // Seed audit logs for treatments
  console.log('📋 Seeding audit logs for treatments...')
  const insertedTreatments = await db.select().from(treatmentRecord)
  const treatmentAuditLogs = await Promise.all(
    insertedTreatments.map(async (tr, index) => {
      const patientInfo = insertedPatients.find(p => p.id === tr.patientId)
      const doctorInfo = insertedDoctors.find(d => d.id === tr.doctorId)
      const teamInfo = insertedTeams.find(t => t.id === patientInfo?.teamId)
      return {
        action: 'record_treatment',
        entityType: 'treatment',
        entityId: tr.id,
        userId: insertedUsers[index % 3].id, // Rotate through all 3 users
        details: JSON.stringify({
          treatmentId: tr.id,
          patientId: tr.patientId,
          patientName: patientInfo?.name,
          doctorId: tr.doctorId,
          doctorName: doctorInfo?.name,
          doctorGrade: doctorInfo?.grade,
          teamName: teamInfo?.name,
          description: tr.description,
          notes: tr.notes,
          treatmentDate: tr.treatmentDate,
        }),
        timestamp: tr.treatmentDate,
      }
    })
  )
  await db.insert(auditLog).values(treatmentAuditLogs)

  // Seed additional audit logs for various system actions
  console.log('📋 Seeding additional audit logs...')
  const additionalAuditLogs = [
    {
      action: 'create_ward',
      entityType: 'ward',
      entityId: insertedWards[0].id,
      userId: insertedUsers[1].id, // superadmin
      details: JSON.stringify({
        wardId: insertedWards[0].id,
        wardName: insertedWards[0].name,
        genderType: insertedWards[0].genderType,
        capacity: insertedWards[0].capacity,
      }),
      timestamp: new Date('2024-01-01T08:00:00').toISOString(),
    },
    {
      action: 'create_team',
      entityType: 'team',
      entityId: insertedTeams[0].id,
      userId: insertedUsers[1].id, // superadmin
      details: JSON.stringify({
        teamId: insertedTeams[0].id,
        teamCode: insertedTeams[0].code,
        teamName: insertedTeams[0].name,
      }),
      timestamp: new Date('2024-01-01T09:00:00').toISOString(),
    },
    {
      action: 'create_doctor',
      entityType: 'doctor',
      entityId: insertedDoctors[0].id,
      userId: insertedUsers[0].id, // admin
      details: JSON.stringify({
        doctorId: insertedDoctors[0].id,
        doctorName: insertedDoctors[0].name,
        teamId: insertedDoctors[0].teamId,
        teamName: insertedTeams.find(t => t.id === insertedDoctors[0].teamId)?.name,
        grade: insertedDoctors[0].grade,
      }),
      timestamp: new Date('2024-01-02T10:00:00').toISOString(),
    },
    {
      action: 'assign_consultant',
      entityType: 'team',
      entityId: insertedTeams[0].id,
      userId: insertedUsers[0].id, // admin
      details: JSON.stringify({
        teamId: insertedTeams[0].id,
        teamName: insertedTeams[0].name,
        consultantId: insertedDoctors[0].id,
        consultantName: insertedDoctors[0].name,
      }),
      timestamp: new Date('2024-01-02T11:00:00').toISOString(),
    },
  ]
  await db.insert(auditLog).values(additionalAuditLogs)

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - ${users.length} users`)
  console.log(`   - ${wards.length} wards`)
  console.log(`   - ${teams.length} teams`)
  console.log(`   - ${doctors.length} doctors`)
  console.log(`   - ${teamConsultants.length} team consultants`)
  console.log(`   - ${patients.length} patients`)
  console.log(`   - ${treatmentRecords.length} treatment records`)
  console.log(
    `   - ${
      admissionAuditLogs.length + treatmentAuditLogs.length + additionalAuditLogs.length
    } audit log entries`
  )
  console.log(`\n👤 Test Users:`)
  console.log(`   - ${insertedUsers[0].email} (${insertedUsers[0].role}) - password: admin123`)
  console.log(`   - ${insertedUsers[1].email} (${insertedUsers[1].role}) - password: super123`)
  console.log(`   - ${insertedUsers[2].email} (${insertedUsers[2].role}) - password: john123`)
}

seed().catch(console.error)
