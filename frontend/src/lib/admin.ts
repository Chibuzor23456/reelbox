import { api } from './api'

export interface AdminDashboard {
  users: Record<string, number>
  channels: Record<string, number>
  vod: Record<string, number>
  epg_programme_count: number
  active_users_today: number
  recent_users: { id: string; name: string; email: string; status: string; created_at: string }[]
  most_watched: { item_type: string; item_id: string; watch_count: number }[]
  playlist_status: { status: string; total_items: number; last_full_run_at: string | null } | null
  vod_status: { status: string; total_items: number; last_full_run_at: string | null } | null
  epg_status: { status: string; total_items: number; last_full_run_at: string | null } | null
}

export function getDashboard() {
  return api.get<AdminDashboard>('/admin/dashboard')
}

export interface AdminInvitation {
  id: string
  email: string
  name: string | null
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expires_at: string
  created_at: string
  accepted_at: string | null
}

export function listInvitations() {
  return api.get<{ invitations: AdminInvitation[] }>('/admin/invitations')
}

export function createInvitation(email: string, name: string) {
  return api.post<{ email: string; invite_link: string; expires_at: string; email_sent: boolean }>(
    '/admin/invitations',
    { email, name },
  )
}

export function resendInvitation(id: string) {
  return api.post<{ email: string; invite_link: string; expires_at: string; email_sent: boolean }>(
    '/admin/invitations/resend',
    { id },
  )
}

export function revokeInvitation(id: string) {
  return api.post<{ status: string }>('/admin/invitations/revoke', { id })
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'suspended' | 'deleted'
  created_at: string
}

export function listUsers(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return api.get<{ users: AdminUser[] }>(`/admin/users${qs}`)
}

export function updateUser(id: string, fields: { status?: string; role?: string }) {
  return api.post<{ status: string }>('/admin/users/update', { id, ...fields })
}

export function forceLogoutUser(id: string) {
  return api.post<{ status: string; sessions_revoked: number }>('/admin/users/force-logout', { id })
}

export function resetUserPassword(id: string) {
  return api.post<{ email: string; temporary_password: string; email_sent: boolean }>(
    '/admin/users/reset-password',
    { id },
  )
}

export interface AdminChannel {
  id: string
  name: string
  logo_url: string | null
  country: string | null
  category: string | null
  playback_mode: 'direct' | 'relay'
  status: 'active' | 'unavailable' | 'disabled'
  last_checked_at: string | null
}

export function listAdminChannels(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return api.get<{ channels: AdminChannel[] }>(`/admin/channels${qs}`)
}

export function updateChannelStatus(id: string, status: string) {
  return api.post<{ status: string }>('/admin/channels', { id, status })
}

export interface AdminVodItem {
  id: string
  type: 'movie' | 'series'
  title: string
  poster_url: string | null
  year: number | null
  genre: string | null
  source_identifier: string
  status: 'active' | 'unavailable' | 'disabled'
}

export function listAdminVod(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return api.get<{ items: AdminVodItem[] }>(`/admin/vod${qs}`)
}

export function updateVodStatus(id: string, status: string) {
  return api.post<{ status: string }>('/admin/vod', { id, status })
}

export interface AuditLogEntry {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  result: string
  metadata: string | null
  created_at: string
  admin_name: string | null
  admin_email: string | null
}

export function listAuditLog() {
  return api.get<{ entries: AuditLogEntry[] }>('/admin/audit-log')
}
