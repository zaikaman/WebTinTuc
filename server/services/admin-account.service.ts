import { unstable_cache } from 'next/cache'
import * as adminAccountRepository from '@/server/repositories/admin-account.repository'

type AccountPayload = {
  email?: string | undefined
  password?: string | undefined
  username?: string | undefined
  display_name?: string | undefined
  role?: string | undefined
}

export const listAdminAccounts = unstable_cache(
  async (options = {}) => {
    return adminAccountRepository.listAdminAccounts(options)
  },
  ['admin-accounts-list'],
  { revalidate: 300, tags: ['admin-accounts'] }
)

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
