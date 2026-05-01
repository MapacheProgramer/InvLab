import { supabase } from '../lib/supabaseClient'

export async function getMyCompany(userId) {
  const { data, error } = await supabase
    .from('company_members')
    .select(`
      id,
      role,
      company_id,
      companies (
        id,
        name,
        owner_id
      )
    `)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) throw error

  if (!data) return null

  return {
    membershipId: data.id,
    role: data.role,
    companyId: data.company_id,
    company: data.companies,
  }
}

export async function createCompanyForUser({ userId, companyName }) {
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      owner_id: userId,
    })
    .select()
    .single()

  if (companyError) throw companyError

  const { error: memberError } = await supabase
    .from('company_members')
    .insert({
      company_id: company.id,
      user_id: userId,
      role: 'owner',
    })

  if (memberError) throw memberError

  return {
    companyId: company.id,
    company,
    role: 'owner',
  }
}

export async function getOrCreateCompany(user) {
  if (!user?.id) return null

  const existing = await getMyCompany(user.id)

  if (existing) return existing

  const companyName =
    user.user_metadata?.full_name
      ? `Empresa de ${user.user_metadata.full_name}`
      : `Empresa de ${user.email}`

  return await createCompanyForUser({
    userId: user.id,
    companyName,
  })
}