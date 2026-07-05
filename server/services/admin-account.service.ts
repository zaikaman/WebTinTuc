import * as adminAccountRepository from '@/server/repositories/admin-account.repository'

type AccountPayload = {
  email?: string
  password?: string
  username?: string
  display_name?: string
  role?: string
}

export async function listAdminAccounts(options = {}) {
  return adminAccountRepository.listAdminAccounts(options)
}

export async function getAdminAccountById(id: string) {
  return adminAccountRepository.getAdminAccountById(id)
}

export async function createAdminAccount(data: AccountPayload) {
  return adminAccountRepository.createAdminAccount(data)
}

export async function updateAdminAccount(id: string, data: AccountPayload) {
  return adminAccountRepository.updateAdminAccount(id, data)
}

export async function deleteAdminAccount(id: string) {
  return adminAccountRepository.deleteAdminAccount(id)
}
