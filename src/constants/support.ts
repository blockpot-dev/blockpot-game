import { SOCIAL_MEDIA } from '@/constants/social-media'

// Player support channel. Telegram is the only staffed contact channel today
// (BLO-752); reuse these app-wide instead of inlining "contact support" copy.
export const SUPPORT_URL: string = SOCIAL_MEDIA.find((s) => s.name === 'Telegram')?.url ?? 'https://t.me/playblockpot'
export const SUPPORT_EMAIL = 'support@blockpot.com'
export const SUPPORT_LINK_LABEL = 'Contact support'
