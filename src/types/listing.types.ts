export type ListingStatus = 'draft' | 'active' | 'paused' | 'sold' | 'expired' | 'removed'
export type ListingCondition = 'new' | 'like_new' | 'very_good' | 'good' | 'fair' | 'for_parts'

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  very_good: 'Muy bueno',
  good: 'Bueno',
  fair: 'Regular',
  for_parts: 'Para repuestos',
}

export interface Listing {
  id: string
  user_id: string
  category_id: number
  title: string
  description: string
  price: number
  accepts_offers: boolean
  condition: ListingCondition
  status: ListingStatus
  city: string
  neighborhood?: string
  is_featured: boolean
  featured_until?: string
  is_urgent: boolean
  view_count: number
  contact_count: number
  favorite_count: number
  slug: string
  ai_generated: boolean
  ai_price_min?: number
  ai_price_max?: number
  fraud_score: number
  expires_at: string
  created_at: string
  updated_at: string
}

export interface ListingWithMeta extends Listing {
  username: string
  seller_rating: number
  seller_verified: boolean
  seller_is_pro: boolean
  category_name: string
  category_slug: string
  category_icon: string
  cover_image?: string
}

export interface AIListingData {
  title: string
  description: string
  category: string
  condition: ListingCondition
  price_min: number
  price_max: number
  confidence: number
}
