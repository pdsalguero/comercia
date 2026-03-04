export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  rating: number
  total_sales: number
  total_reviews: number
  is_verified: boolean
  is_pro: boolean
  created_at: string
  updated_at: string
}
