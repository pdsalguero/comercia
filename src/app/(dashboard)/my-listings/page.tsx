import { redirect } from 'next/navigation'

export default async function MyListingsLegacyPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  redirect(view ? `/dashboard/my-listings?view=${view}` : '/dashboard/my-listings')
}
