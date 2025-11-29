// ============================================================================
// lib/config/table-params.ts
// Table parameter parsing (Next.js + nuqs/server)
// ============================================================================

import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '@/lib/config/constants'

// ============================================================================
// 🧩 Base Table Params (shared across all tables)
// ============================================================================
const baseParams = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortBy: parseAsString.withDefault(DEFAULT_SORT_BY),
  sortOrder: parseAsString.withDefault(DEFAULT_SORT_ORDER),
  filter: parseAsString.withDefault(''),
} as const

// ============================================================================
// 🏗️ Factory Function (for extensibility)
// ============================================================================
export function createTableParamsCache(additionalParams?: Record<string, any>) {
  return createSearchParamsCache({
    ...baseParams,
    ...additionalParams,
  })
}

export type TableSearchParams<T extends ReturnType<typeof createTableParamsCache>> = Awaited<
  ReturnType<T['parse']>
>

// ============================================================================
// 👤 Users Table Params (aligned with Swagger /users endpoint)
// ============================================================================
// /users supports: page, pageSize, sortBy, sortOrder, search, status,
// orgLevelID, teamID, jobCategoryID, designationID, startDate, endDate
export const usersSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  status: parseAsString,
  orgLevelID: parseAsString,
  teamID: parseAsString,
  jobCategoryID: parseAsString,
  designationID: parseAsString,
  startDate: parseAsString,
  endDate: parseAsString,
})

export type UsersSearchParams = Awaited<ReturnType<typeof usersSearchParamsCache.parse>>

// ============================================================================
// 🏢 Org Levels Table Params
// ============================================================================
export const orgLevelsSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  type: parseAsString, // e.g., company, division, department, unit, section
  parentID: parseAsString,
  isActive: parseAsString,
})

export type OrgLevelsSearchParams = Awaited<ReturnType<typeof orgLevelsSearchParamsCache.parse>>

// ============================================================================
// 🧑‍💼 Roles / Job Categories / Designations Table Params
// ============================================================================
export const rolesSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  jobCategoryID: parseAsString,
  isActive: parseAsString,
})

export type RolesSearchParams = Awaited<ReturnType<typeof rolesSearchParamsCache.parse>>

// ============================================================================
// 🧩 Role Requests Table Params
// ============================================================================
export const roleRequestsSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  status: parseAsString,
  userID: parseAsString,
})

export type RoleRequestsSearchParams = Awaited<
  ReturnType<typeof roleRequestsSearchParamsCache.parse>
>

// ============================================================================
// 🏥 Patients Table Params
// ============================================================================
export const patientsSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  ward: parseAsString,
  team: parseAsString,
  startDate: parseAsString,
  endDate: parseAsString,
})

export type PatientsSearchParams = Awaited<ReturnType<typeof patientsSearchParamsCache.parse>>

// ============================================================================
// 👥 Teams Table Params
// ============================================================================
export const teamsSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  grade: parseAsString, // consultant, junior1, junior2
  hasConsultant: parseAsString, // true, false
})

export type TeamsSearchParams = Awaited<ReturnType<typeof teamsSearchParamsCache.parse>>

// ============================================================================
// 👨‍⚕️ Doctors Table Params
// ============================================================================
export const doctorsSearchParamsCache = createSearchParamsCache({
  ...baseParams,
  grade: parseAsString, // consultant, junior1, junior2
  teamId: parseAsString, // team id or 'assigned'/'unassigned'
})

export type DoctorsSearchParams = Awaited<ReturnType<typeof doctorsSearchParamsCache.parse>>

// ============================================================================
// 🧠 Helper Exports
// ============================================================================
export const tableParamCaches = {
  users: usersSearchParamsCache,
  orgLevels: orgLevelsSearchParamsCache,
  roles: rolesSearchParamsCache,
  roleRequests: roleRequestsSearchParamsCache,
  patients: patientsSearchParamsCache,
  teams: teamsSearchParamsCache,
}
