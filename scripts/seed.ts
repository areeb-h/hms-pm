import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:sqlite.db',
  ...(process.env.DATABASE_AUTH_TOKEN && { authToken: process.env.DATABASE_AUTH_TOKEN }),
})
const db = drizzle(client, { schema })

const { ward, team, doctor, teamConsultant, patient } = schema

async function seed() {
  console.log('🌱 Seeding database...')

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
  await db.insert(patient).values(patients)

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - ${wards.length} wards`)
  console.log(`   - ${teams.length} teams`)
  console.log(`   - ${doctors.length} doctors`)
  console.log(`   - ${teamConsultants.length} team consultants`)
  console.log(`   - ${patients.length} patients`)
}

seed().catch(console.error)
