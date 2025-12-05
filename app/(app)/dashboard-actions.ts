'use server'

import { db } from '@/db/drizzle'
import { doctor, patient, team, treatmentRecord, ward } from '@/db/schema'
import { count, eq, isNull, sql } from 'drizzle-orm'

export async function getDashboardStats() {
  // Total patients (active - not discharged)
  const totalPatientsResult = await db
    .select({ count: count() })
    .from(patient)
    .where(isNull(patient.dischargedAt))

  // Total wards
  const totalWardsResult = await db.select({ count: count() }).from(ward)

  // Total teams
  const totalTeamsResult = await db.select({ count: count() }).from(team)

  // Total doctors
  const totalDoctorsResult = await db.select({ count: count() }).from(doctor)

  // Recent patients (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentPatientsResult = await db
    .select({ count: count() })
    .from(patient)
    .where(sql`${patient.createdAt} >= ${sevenDaysAgo.toISOString()}`)

  // Recent treatments (last 7 days)
  const recentTreatmentsResult = await db
    .select({ count: count() })
    .from(treatmentRecord)
    .where(sql`${treatmentRecord.createdAt} >= ${sevenDaysAgo.toISOString()}`)

  // Ward occupancy
  const wardOccupancy = await db
    .select({
      wardId: patient.wardId,
      wardName: ward.name,
      capacity: ward.capacity,
      patientCount: count(patient.id),
    })
    .from(patient)
    .leftJoin(ward, eq(patient.wardId, ward.id))
    .where(isNull(patient.dischargedAt))
    .groupBy(patient.wardId, ward.name, ward.capacity)

  // Gender distribution
  const genderStats = await db
    .select({
      gender: patient.gender,
      count: count(),
    })
    .from(patient)
    .where(isNull(patient.dischargedAt))
    .groupBy(patient.gender)

  return {
    totalPatients: totalPatientsResult[0]?.count ?? 0,
    totalWards: totalWardsResult[0]?.count ?? 0,
    totalTeams: totalTeamsResult[0]?.count ?? 0,
    totalDoctors: totalDoctorsResult[0]?.count ?? 0,
    recentPatients: recentPatientsResult[0]?.count ?? 0,
    recentTreatments: recentTreatmentsResult[0]?.count ?? 0,
    wardOccupancy,
    genderStats,
  }
}

export async function getRecentActivity() {
  // Recent patient admissions
  const recentAdmissions = await db
    .select({
      id: patient.id,
      name: patient.name,
      createdAt: patient.createdAt,
      wardName: ward.name,
    })
    .from(patient)
    .leftJoin(ward, eq(patient.wardId, ward.id))
    .where(isNull(patient.dischargedAt))
    .orderBy(sql`${patient.createdAt} DESC`)
    .limit(5)

  // Recent treatments
  const recentTreatments = await db
    .select({
      id: treatmentRecord.id,
      patientName: patient.name,
      doctorName: doctor.name,
      createdAt: treatmentRecord.createdAt,
    })
    .from(treatmentRecord)
    .leftJoin(patient, eq(treatmentRecord.patientId, patient.id))
    .leftJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
    .orderBy(sql`${treatmentRecord.createdAt} DESC`)
    .limit(5)

  return {
    recentAdmissions,
    recentTreatments,
  }
}
