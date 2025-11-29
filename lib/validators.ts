import { z } from 'zod'

export const wardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genderType: z.enum(['male', 'female']),
  capacity: z.number().int().positive('Capacity must be positive'),
})

export const teamSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
})

export const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.enum(['consultant', 'junior1', 'junior2']),
  teamId: z.number().int().positive('Team ID is required').optional(),
})

export const teamConsultantSchema = z.object({
  teamId: z.number().int().positive('Team ID is required'),
  doctorId: z.number().int().positive('Doctor ID is required'),
})

export const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female']),
  wardId: z.number().int().positive('Ward ID is required'),
  teamId: z.number().int().positive('Team ID is required'),
  dischargedAt: z.string().optional(),
})

export const treatmentRecordSchema = z.object({
  patientId: z.number().int().positive('Patient ID is required'),
  doctorId: z.number().int().positive('Doctor ID is required'),
})
