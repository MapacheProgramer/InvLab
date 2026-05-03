import { supabase } from '../lib/supabaseClient'

export async function getCompanyMembers(companyId) {
  const { data: members, error: membersError } = await supabase
    .from('company_members')
    .select('id, role, user_id, company_id, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (membersError) throw membersError

  if (!members || members.length === 0) {
    return []
  }

  const userIds = members.map((m) => m.user_id)

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  if (profilesError) throw profilesError

  return members.map((member) => {
    const profile = profiles?.find((p) => p.id === member.user_id)

    return {
      ...member,
      profiles: profile || {
        id: member.user_id,
        full_name: 'Sin nombre',
        email: 'Sin correo',
      },
    }
  })
}

export async function addMemberByEmail({ companyId, email, role }) {
  const cleanEmail = email.trim().toLowerCase()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (profileError) throw profileError

  if (!profile) {
    throw new Error('No existe un usuario registrado con ese correo')
  }

  const { data, error } = await supabase
    .from('company_members')
    .insert({
      company_id: companyId,
      user_id: profile.id,
      role,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateMemberRole({ memberId, role }) {
  const { error } = await supabase
    .from('company_members')
    .update({ role })
    .eq('id', memberId)

  if (error) throw error
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from('company_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}