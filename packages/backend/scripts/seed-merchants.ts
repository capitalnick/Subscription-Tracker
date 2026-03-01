import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

interface MerchantPlan {
  id: string;
  label: string;
  tier_rank: number;
  amounts_aud: number[];
  max_users: number | null;
  plan_type: string;
  features: string[];
  is_active: boolean;
}

interface MerchantSeed {
  canonical_name: string;
  slug: string;
  category: string;
  common_descriptors: string[];
  website_url: string;
  logo_letter: string;
  logo_color: string;
  logo_url?: string;
  known_plans?: MerchantPlan[];
}

const merchants: MerchantSeed[] = [
  // ── STREAMING VIDEO ──
  {
    canonical_name: 'Netflix', slug: 'netflix', category: 'STREAMING_VIDEO',
    common_descriptors: ['NETFLIX.COM', 'NETFLIX', 'NETFLIX AU', 'NFLX'],
    website_url: 'https://www.netflix.com', logo_letter: 'N', logo_color: '#E50914',
    known_plans: [
      { id: 'netflix-standard-ads', label: 'Standard with Ads', tier_rank: 1, amounts_aud: [7.99], max_users: 2, plan_type: 'INDIVIDUAL', features: ['1080p', 'Ads'], is_active: true },
      { id: 'netflix-standard', label: 'Standard', tier_rank: 2, amounts_aud: [18.99], max_users: 2, plan_type: 'INDIVIDUAL', features: ['1080p', 'Downloads', 'No ads'], is_active: true },
      { id: 'netflix-premium', label: 'Premium', tier_rank: 3, amounts_aud: [25.99], max_users: 4, plan_type: 'FAMILY', features: ['4K', 'HDR', 'Downloads', '4 screens'], is_active: true },
    ],
  },
  {
    canonical_name: 'Stan', slug: 'stan', category: 'STREAMING_VIDEO',
    common_descriptors: ['STAN ENTERTAINMENT', 'STAN.COM.AU'],
    website_url: 'https://www.stan.com.au', logo_letter: 'S', logo_color: '#0072CE',
    known_plans: [
      { id: 'stan-basic', label: 'Basic', tier_rank: 1, amounts_aud: [12.00], max_users: 1, plan_type: 'INDIVIDUAL', features: ['SD', '1 screen'], is_active: true },
      { id: 'stan-standard', label: 'Standard', tier_rank: 2, amounts_aud: [16.00], max_users: 3, plan_type: 'INDIVIDUAL', features: ['HD', '3 screens'], is_active: true },
      { id: 'stan-premium', label: 'Premium', tier_rank: 3, amounts_aud: [21.00], max_users: 4, plan_type: 'FAMILY', features: ['4K', 'HDR', '4 screens'], is_active: true },
    ],
  },
  {
    canonical_name: 'Disney+', slug: 'disney-plus', category: 'STREAMING_VIDEO',
    common_descriptors: ['DISNEY PLUS', 'DISNEYPLUS', 'DISNEY+'],
    website_url: 'https://www.disneyplus.com', logo_letter: 'D', logo_color: '#113CCF',
    known_plans: [
      { id: 'disney-standard', label: 'Standard', tier_rank: 1, amounts_aud: [13.99], max_users: 2, plan_type: 'INDIVIDUAL', features: ['1080p', '2 screens'], is_active: true },
      { id: 'disney-premium', label: 'Premium', tier_rank: 2, amounts_aud: [17.99], max_users: 4, plan_type: 'FAMILY', features: ['4K', 'HDR', '4 screens', 'Dolby Atmos'], is_active: true },
    ],
  },
  {
    canonical_name: 'Kayo Sports', slug: 'kayo-sports', category: 'STREAMING_VIDEO',
    common_descriptors: ['KAYO', 'KAYO SPORTS', 'KAYOSPORTS'],
    website_url: 'https://kayosports.com.au', logo_letter: 'K', logo_color: '#00C853',
  },
  {
    canonical_name: 'Binge', slug: 'binge', category: 'STREAMING_VIDEO',
    common_descriptors: ['BINGE', 'BINGE.COM.AU'],
    website_url: 'https://binge.com.au', logo_letter: 'B', logo_color: '#000000',
  },
  {
    canonical_name: 'Amazon Prime Video', slug: 'amazon-prime-video', category: 'STREAMING_VIDEO',
    common_descriptors: ['AMAZON PRIME VIDEO', 'PRIME VIDEO'],
    website_url: 'https://www.primevideo.com', logo_letter: 'A', logo_color: '#00A8E1',
  },
  {
    canonical_name: 'Paramount+', slug: 'paramount-plus', category: 'STREAMING_VIDEO',
    common_descriptors: ['PARAMOUNT PLUS', 'PARAMOUNT+'],
    website_url: 'https://www.paramountplus.com', logo_letter: 'P', logo_color: '#0064FF',
  },
  {
    canonical_name: 'Hayu', slug: 'hayu', category: 'STREAMING_VIDEO',
    common_descriptors: ['HAYU', 'HAYU.COM'],
    website_url: 'https://www.hayu.com', logo_letter: 'H', logo_color: '#FF69B4',
  },
  {
    canonical_name: 'Foxtel', slug: 'foxtel', category: 'STREAMING_VIDEO',
    common_descriptors: ['FOXTEL', 'FOXTEL NOW', 'FOXTEL GO'],
    website_url: 'https://www.foxtel.com.au', logo_letter: 'F', logo_color: '#FF6600',
  },
  {
    canonical_name: 'Crunchyroll', slug: 'crunchyroll', category: 'STREAMING_VIDEO',
    common_descriptors: ['CRUNCHYROLL', 'CRUNCHYROLL.COM'],
    website_url: 'https://www.crunchyroll.com', logo_letter: 'C', logo_color: '#F47521',
  },
  {
    canonical_name: 'YouTube Premium', slug: 'youtube-premium', category: 'STREAMING_VIDEO',
    common_descriptors: ['YOUTUBE PREMIUM', 'GOOGLE*YOUTUBE', 'YOUTUBE.COM'],
    website_url: 'https://www.youtube.com', logo_letter: 'Y', logo_color: '#FF0000',
    known_plans: [
      { id: 'yt-premium-individual', label: 'Individual', tier_rank: 1, amounts_aud: [16.99], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Ad-free', 'Background play', 'Downloads'], is_active: true },
      { id: 'yt-premium-family', label: 'Family', tier_rank: 2, amounts_aud: [25.99], max_users: 6, plan_type: 'FAMILY', features: ['Ad-free', 'Up to 6 members'], is_active: true },
      { id: 'yt-premium-student', label: 'Student', tier_rank: 3, amounts_aud: [8.49], max_users: 1, plan_type: 'STUDENT', features: ['Ad-free', 'Student discount'], is_active: true },
    ],
  },
  {
    canonical_name: 'Apple TV+', slug: 'apple-tv-plus', category: 'STREAMING_VIDEO',
    common_descriptors: ['APPLE TV', 'APPLE.COM/BILL'],
    website_url: 'https://tv.apple.com', logo_letter: 'A', logo_color: '#000000',
  },

  // ── STREAMING MUSIC ──
  {
    canonical_name: 'Spotify', slug: 'spotify', category: 'STREAMING_MUSIC',
    common_descriptors: ['SPOTIFY', 'SPOTIFY AB', 'SPOTIFY PREMIUM'],
    website_url: 'https://www.spotify.com', logo_letter: 'S', logo_color: '#1DB954',
    known_plans: [
      { id: 'spotify-individual', label: 'Individual', tier_rank: 1, amounts_aud: [12.99], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Ad-free', 'Downloads', 'High quality'], is_active: true },
      { id: 'spotify-duo', label: 'Duo', tier_rank: 2, amounts_aud: [16.99], max_users: 2, plan_type: 'DUO', features: ['2 accounts', 'Duo Mix'], is_active: true },
      { id: 'spotify-family', label: 'Family', tier_rank: 3, amounts_aud: [20.99], max_users: 6, plan_type: 'FAMILY', features: ['6 accounts', 'Parental controls'], is_active: true },
      { id: 'spotify-student', label: 'Student', tier_rank: 4, amounts_aud: [6.99], max_users: 1, plan_type: 'STUDENT', features: ['Student discount'], is_active: true },
    ],
  },
  {
    canonical_name: 'Apple Music', slug: 'apple-music', category: 'STREAMING_MUSIC',
    common_descriptors: ['APPLE MUSIC', 'APPLE.COM/BILL'],
    website_url: 'https://music.apple.com', logo_letter: 'A', logo_color: '#FA233B',
    known_plans: [
      { id: 'apple-music-individual', label: 'Individual', tier_rank: 1, amounts_aud: [12.99], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Lossless', 'Spatial Audio'], is_active: true },
      { id: 'apple-music-family', label: 'Family', tier_rank: 2, amounts_aud: [21.99], max_users: 6, plan_type: 'FAMILY', features: ['6 accounts', 'Lossless'], is_active: true },
      { id: 'apple-music-student', label: 'Student', tier_rank: 3, amounts_aud: [6.99], max_users: 1, plan_type: 'STUDENT', features: ['Student discount'], is_active: true },
    ],
  },
  {
    canonical_name: 'YouTube Music', slug: 'youtube-music', category: 'STREAMING_MUSIC',
    common_descriptors: ['YOUTUBE MUSIC', 'GOOGLE*YOUTUBEMUSIC'],
    website_url: 'https://music.youtube.com', logo_letter: 'Y', logo_color: '#FF0000',
  },
  {
    canonical_name: 'Tidal', slug: 'tidal', category: 'STREAMING_MUSIC',
    common_descriptors: ['TIDAL', 'TIDAL.COM'],
    website_url: 'https://tidal.com', logo_letter: 'T', logo_color: '#000000',
  },
  {
    canonical_name: 'Amazon Music', slug: 'amazon-music', category: 'STREAMING_MUSIC',
    common_descriptors: ['AMAZON MUSIC', 'AMZN MUSIC'],
    website_url: 'https://music.amazon.com', logo_letter: 'A', logo_color: '#25D1DA',
  },

  // ── SOFTWARE TOOLS ──
  {
    canonical_name: 'Adobe Creative Cloud', slug: 'adobe-creative-cloud', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['ADOBE', 'ADOBE SYSTEMS', 'ADOBE CREATIVE', 'ADOBE CC'],
    website_url: 'https://www.adobe.com', logo_letter: 'A', logo_color: '#FF0000',
    known_plans: [
      { id: 'adobe-photography', label: 'Photography', tier_rank: 1, amounts_aud: [14.29], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Photoshop', 'Lightroom', '20GB'], is_active: true },
      { id: 'adobe-single-app', label: 'Single App', tier_rank: 2, amounts_aud: [33.49], max_users: 1, plan_type: 'INDIVIDUAL', features: ['One CC app', '100GB'], is_active: true },
      { id: 'adobe-all-apps', label: 'All Apps', tier_rank: 3, amounts_aud: [86.49], max_users: 1, plan_type: 'INDIVIDUAL', features: ['All CC apps', '100GB'], is_active: true },
    ],
  },
  {
    canonical_name: 'Canva', slug: 'canva', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['CANVA', 'CANVA PTY', 'CANVA.COM'],
    website_url: 'https://www.canva.com', logo_letter: 'C', logo_color: '#00C4CC',
    known_plans: [
      { id: 'canva-pro', label: 'Pro', tier_rank: 1, amounts_aud: [20.00], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Brand Kit', 'Premium templates'], is_active: true },
      { id: 'canva-teams', label: 'Teams', tier_rank: 2, amounts_aud: [40.00], max_users: null, plan_type: 'BUSINESS', features: ['Team folders', 'Brand controls'], is_active: true },
    ],
  },
  {
    canonical_name: 'Figma', slug: 'figma', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['FIGMA', 'FIGMA INC'],
    website_url: 'https://www.figma.com', logo_letter: 'F', logo_color: '#F24E1E',
  },
  {
    canonical_name: '1Password', slug: '1password', category: 'VPN_SECURITY',
    common_descriptors: ['1PASSWORD', 'AGILEBITS'],
    website_url: 'https://1password.com', logo_letter: '1', logo_color: '#0094F5',
  },
  {
    canonical_name: 'LastPass', slug: 'lastpass', category: 'VPN_SECURITY',
    common_descriptors: ['LASTPASS', 'LASTPASS.COM'],
    website_url: 'https://www.lastpass.com', logo_letter: 'L', logo_color: '#D32D27',
  },

  // ── PRODUCTIVITY ──
  {
    canonical_name: 'Microsoft 365', slug: 'microsoft-365', category: 'PRODUCTIVITY',
    common_descriptors: ['MICROSOFT', 'MICROSOFT 365', 'MICROSOFT*OFFICE', 'MS 365'],
    website_url: 'https://www.microsoft.com', logo_letter: 'M', logo_color: '#0078D4',
    known_plans: [
      { id: 'ms365-personal', label: 'Personal', tier_rank: 1, amounts_aud: [11.00], max_users: 1, plan_type: 'INDIVIDUAL', features: ['1TB OneDrive', 'Office apps'], is_active: true },
      { id: 'ms365-family', label: 'Family', tier_rank: 2, amounts_aud: [16.00], max_users: 6, plan_type: 'FAMILY', features: ['6TB total', '6 users', 'Office apps'], is_active: true },
    ],
  },
  {
    canonical_name: 'Notion', slug: 'notion', category: 'PRODUCTIVITY',
    common_descriptors: ['NOTION', 'NOTION LABS', 'NOTION.SO'],
    website_url: 'https://www.notion.so', logo_letter: 'N', logo_color: '#000000',
  },
  {
    canonical_name: 'Todoist', slug: 'todoist', category: 'PRODUCTIVITY',
    common_descriptors: ['TODOIST', 'DOIST'],
    website_url: 'https://todoist.com', logo_letter: 'T', logo_color: '#E44332',
  },
  {
    canonical_name: 'Evernote', slug: 'evernote', category: 'PRODUCTIVITY',
    common_descriptors: ['EVERNOTE', 'EVERNOTE CORP'],
    website_url: 'https://evernote.com', logo_letter: 'E', logo_color: '#00A82D',
  },
  {
    canonical_name: 'Grammarly', slug: 'grammarly', category: 'PRODUCTIVITY',
    common_descriptors: ['GRAMMARLY', 'GRAMMARLY INC'],
    website_url: 'https://www.grammarly.com', logo_letter: 'G', logo_color: '#15C39A',
  },

  // ── COMMUNICATION ──
  {
    canonical_name: 'Slack', slug: 'slack', category: 'COMMUNICATION',
    common_descriptors: ['SLACK', 'SLACK TECHNOLOGIES'],
    website_url: 'https://slack.com', logo_letter: 'S', logo_color: '#4A154B',
  },
  {
    canonical_name: 'Zoom', slug: 'zoom', category: 'COMMUNICATION',
    common_descriptors: ['ZOOM', 'ZOOM.US', 'ZOOM VIDEO'],
    website_url: 'https://zoom.us', logo_letter: 'Z', logo_color: '#2D8CFF',
  },

  // ── CLOUD STORAGE ──
  {
    canonical_name: 'iCloud+', slug: 'icloud-plus', category: 'CLOUD_STORAGE',
    common_descriptors: ['ICLOUD', 'APPLE.COM/BILL', 'APPLE ICLOUD'],
    website_url: 'https://www.icloud.com', logo_letter: 'i', logo_color: '#3693F5',
    known_plans: [
      { id: 'icloud-50gb', label: '50GB', tier_rank: 1, amounts_aud: [1.49], max_users: 1, plan_type: 'INDIVIDUAL', features: ['50GB storage'], is_active: true },
      { id: 'icloud-200gb', label: '200GB', tier_rank: 2, amounts_aud: [4.49], max_users: 6, plan_type: 'FAMILY', features: ['200GB storage', 'Family Sharing'], is_active: true },
      { id: 'icloud-2tb', label: '2TB', tier_rank: 3, amounts_aud: [14.99], max_users: 6, plan_type: 'FAMILY', features: ['2TB storage', 'Family Sharing'], is_active: true },
      { id: 'icloud-6tb', label: '6TB', tier_rank: 4, amounts_aud: [44.99], max_users: 6, plan_type: 'FAMILY', features: ['6TB storage'], is_active: true },
      { id: 'icloud-12tb', label: '12TB', tier_rank: 5, amounts_aud: [89.99], max_users: 6, plan_type: 'FAMILY', features: ['12TB storage'], is_active: true },
    ],
  },
  {
    canonical_name: 'Google One', slug: 'google-one', category: 'CLOUD_STORAGE',
    common_descriptors: ['GOOGLE ONE', 'GOOGLE*ONE', 'GOOGLE STORAGE'],
    website_url: 'https://one.google.com', logo_letter: 'G', logo_color: '#4285F4',
  },
  {
    canonical_name: 'Dropbox', slug: 'dropbox', category: 'CLOUD_STORAGE',
    common_descriptors: ['DROPBOX', 'DROPBOX INC'],
    website_url: 'https://www.dropbox.com', logo_letter: 'D', logo_color: '#0061FF',
    known_plans: [
      { id: 'dropbox-plus', label: 'Plus', tier_rank: 1, amounts_aud: [17.49], max_users: 1, plan_type: 'INDIVIDUAL', features: ['2TB', 'Smart Sync'], is_active: true },
      { id: 'dropbox-professional', label: 'Professional', tier_rank: 2, amounts_aud: [32.49], max_users: 1, plan_type: 'INDIVIDUAL', features: ['3TB', 'Advanced sharing'], is_active: true },
      { id: 'dropbox-business', label: 'Business', tier_rank: 3, amounts_aud: [22.00], max_users: null, plan_type: 'BUSINESS', features: ['Per user', 'Admin controls'], is_active: true },
    ],
  },
  {
    canonical_name: 'OneDrive', slug: 'onedrive', category: 'CLOUD_STORAGE',
    common_descriptors: ['ONEDRIVE', 'MICROSOFT ONEDRIVE'],
    website_url: 'https://onedrive.live.com', logo_letter: 'O', logo_color: '#0078D4',
  },

  // ── SOFTWARE_TOOLS (AI/Tech) ──
  {
    canonical_name: 'ChatGPT Plus', slug: 'chatgpt-plus', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['OPENAI', 'CHATGPT', 'OPENAI.COM'],
    website_url: 'https://chat.openai.com', logo_letter: 'C', logo_color: '#10A37F',
  },
  {
    canonical_name: 'Claude Pro', slug: 'claude-pro', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['ANTHROPIC', 'CLAUDE', 'CLAUDE.AI'],
    website_url: 'https://claude.ai', logo_letter: 'C', logo_color: '#D4A574',
  },
  {
    canonical_name: 'GitHub', slug: 'github', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['GITHUB', 'GITHUB INC'],
    website_url: 'https://github.com', logo_letter: 'G', logo_color: '#181717',
  },
  {
    canonical_name: 'Copilot', slug: 'github-copilot', category: 'SOFTWARE_TOOLS',
    common_descriptors: ['GITHUB COPILOT', 'COPILOT'],
    website_url: 'https://github.com/features/copilot', logo_letter: 'C', logo_color: '#000000',
  },

  // ── INTERNET & PHONE ──
  {
    canonical_name: 'Telstra', slug: 'telstra', category: 'INTERNET_PHONE',
    common_descriptors: ['TELSTRA', 'TELSTRA CORP', 'TELSTRA MOBILE'],
    website_url: 'https://www.telstra.com.au', logo_letter: 'T', logo_color: '#0057AD',
  },
  {
    canonical_name: 'Optus', slug: 'optus', category: 'INTERNET_PHONE',
    common_descriptors: ['OPTUS', 'SINGTEL OPTUS', 'OPTUS MOBILE'],
    website_url: 'https://www.optus.com.au', logo_letter: 'O', logo_color: '#1F3353',
  },
  {
    canonical_name: 'Vodafone', slug: 'vodafone', category: 'INTERNET_PHONE',
    common_descriptors: ['VODAFONE', 'VODAFONE AU', 'TPG VODAFONE'],
    website_url: 'https://www.vodafone.com.au', logo_letter: 'V', logo_color: '#E60000',
  },
  {
    canonical_name: 'Belong', slug: 'belong', category: 'INTERNET_PHONE',
    common_descriptors: ['BELONG', 'BELONG.COM.AU'],
    website_url: 'https://www.belong.com.au', logo_letter: 'B', logo_color: '#FF6B00',
  },
  {
    canonical_name: 'Boost Mobile', slug: 'boost-mobile', category: 'INTERNET_PHONE',
    common_descriptors: ['BOOST MOBILE', 'BOOST'],
    website_url: 'https://www.boost.com.au', logo_letter: 'B', logo_color: '#FF6900',
  },
  {
    canonical_name: 'Amaysim', slug: 'amaysim', category: 'INTERNET_PHONE',
    common_descriptors: ['AMAYSIM', 'AMAYSIM.COM.AU'],
    website_url: 'https://www.amaysim.com.au', logo_letter: 'A', logo_color: '#FF6900',
  },
  {
    canonical_name: 'Felix Mobile', slug: 'felix-mobile', category: 'INTERNET_PHONE',
    common_descriptors: ['FELIX MOBILE', 'FELIX'],
    website_url: 'https://www.felix.com.au', logo_letter: 'F', logo_color: '#6C5CE7',
  },
  {
    canonical_name: 'Aussie Broadband', slug: 'aussie-broadband', category: 'INTERNET_PHONE',
    common_descriptors: ['AUSSIE BROADBAND', 'ABB', 'AUSSIE BB'],
    website_url: 'https://www.aussiebroadband.com.au', logo_letter: 'A', logo_color: '#EB5B28',
  },
  {
    canonical_name: 'Superloop', slug: 'superloop', category: 'INTERNET_PHONE',
    common_descriptors: ['SUPERLOOP', 'SUPERLOOP.COM'],
    website_url: 'https://www.superloop.com', logo_letter: 'S', logo_color: '#5B2D90',
  },

  // ── NEWS & MAGAZINES ──
  {
    canonical_name: 'The Australian', slug: 'the-australian', category: 'NEWS_MAGAZINES',
    common_descriptors: ['THE AUSTRALIAN', 'NEWSCORP', 'NEWS DIGITAL'],
    website_url: 'https://www.theaustralian.com.au', logo_letter: 'T', logo_color: '#002B5C',
  },
  {
    canonical_name: 'Sydney Morning Herald', slug: 'smh', category: 'NEWS_MAGAZINES',
    common_descriptors: ['SMH', 'NINE DIGITAL', 'SYDNEY MORNING HERALD'],
    website_url: 'https://www.smh.com.au', logo_letter: 'S', logo_color: '#062F4F',
  },
  {
    canonical_name: 'The Age', slug: 'the-age', category: 'NEWS_MAGAZINES',
    common_descriptors: ['THE AGE', 'NINE DIGITAL'],
    website_url: 'https://www.theage.com.au', logo_letter: 'A', logo_color: '#062F4F',
  },
  {
    canonical_name: 'ABC News', slug: 'abc-news', category: 'NEWS_MAGAZINES',
    common_descriptors: ['ABC', 'ABC DIGITAL'],
    website_url: 'https://www.abc.net.au', logo_letter: 'A', logo_color: '#000000',
  },
  {
    canonical_name: 'The Guardian', slug: 'the-guardian', category: 'NEWS_MAGAZINES',
    common_descriptors: ['GUARDIAN', 'GUARDIAN NEWS'],
    website_url: 'https://www.theguardian.com', logo_letter: 'G', logo_color: '#052962',
  },
  {
    canonical_name: 'Crikey', slug: 'crikey', category: 'NEWS_MAGAZINES',
    common_descriptors: ['CRIKEY', 'PRIVATE MEDIA'],
    website_url: 'https://www.crikey.com.au', logo_letter: 'C', logo_color: '#F7941D',
  },
  {
    canonical_name: 'The Saturday Paper', slug: 'saturday-paper', category: 'NEWS_MAGAZINES',
    common_descriptors: ['SATURDAY PAPER', 'SCHWARTZ MEDIA'],
    website_url: 'https://www.thesaturdaypaper.com.au', logo_letter: 'S', logo_color: '#000000',
  },

  // ── GAMING ──
  {
    canonical_name: 'Xbox Game Pass', slug: 'xbox-game-pass', category: 'GAMING',
    common_descriptors: ['XBOX', 'MICROSOFT XBOX', 'GAME PASS'],
    website_url: 'https://www.xbox.com', logo_letter: 'X', logo_color: '#107C10',
  },
  {
    canonical_name: 'PlayStation Plus', slug: 'playstation-plus', category: 'GAMING',
    common_descriptors: ['PLAYSTATION', 'SONY PLAYSTATION', 'PS PLUS'],
    website_url: 'https://www.playstation.com', logo_letter: 'P', logo_color: '#003087',
  },
  {
    canonical_name: 'Nintendo Switch Online', slug: 'nintendo-switch-online', category: 'GAMING',
    common_descriptors: ['NINTENDO', 'NINTENDO SWITCH'],
    website_url: 'https://www.nintendo.com.au', logo_letter: 'N', logo_color: '#E60012',
  },
  {
    canonical_name: 'EA Play', slug: 'ea-play', category: 'GAMING',
    common_descriptors: ['EA PLAY', 'ELECTRONIC ARTS'],
    website_url: 'https://www.ea.com', logo_letter: 'E', logo_color: '#000000',
  },
  {
    canonical_name: 'Steam', slug: 'steam', category: 'GAMING',
    common_descriptors: ['STEAM', 'VALVE', 'STEAMGAMES'],
    website_url: 'https://store.steampowered.com', logo_letter: 'S', logo_color: '#171A21',
  },

  // ── FITNESS ──
  {
    canonical_name: 'Headspace', slug: 'headspace', category: 'FITNESS',
    common_descriptors: ['HEADSPACE', 'HEADSPACE.COM'],
    website_url: 'https://www.headspace.com', logo_letter: 'H', logo_color: '#F47D31',
  },
  {
    canonical_name: 'Calm', slug: 'calm', category: 'FITNESS',
    common_descriptors: ['CALM', 'CALM.COM'],
    website_url: 'https://www.calm.com', logo_letter: 'C', logo_color: '#3B7AD9',
  },
  {
    canonical_name: 'Strava', slug: 'strava', category: 'FITNESS',
    common_descriptors: ['STRAVA', 'STRAVA INC'],
    website_url: 'https://www.strava.com', logo_letter: 'S', logo_color: '#FC4C02',
  },
  {
    canonical_name: 'Fitbit Premium', slug: 'fitbit-premium', category: 'FITNESS',
    common_descriptors: ['FITBIT', 'GOOGLE*FITBIT'],
    website_url: 'https://www.fitbit.com', logo_letter: 'F', logo_color: '#00B0B9',
  },
  {
    canonical_name: 'Peloton', slug: 'peloton', category: 'FITNESS',
    common_descriptors: ['PELOTON', 'ONEPELOTON'],
    website_url: 'https://www.onepeloton.com', logo_letter: 'P', logo_color: '#000000',
  },
  {
    canonical_name: 'Apple Fitness+', slug: 'apple-fitness-plus', category: 'FITNESS',
    common_descriptors: ['APPLE FITNESS', 'APPLE.COM/BILL'],
    website_url: 'https://www.apple.com/apple-fitness-plus', logo_letter: 'A', logo_color: '#FA2D55',
  },
  {
    canonical_name: 'Noom', slug: 'noom', category: 'FITNESS',
    common_descriptors: ['NOOM', 'NOOM INC'],
    website_url: 'https://www.noom.com', logo_letter: 'N', logo_color: '#F5A623',
  },
  {
    canonical_name: 'Anytime Fitness', slug: 'anytime-fitness', category: 'FITNESS',
    common_descriptors: ['ANYTIME FITNESS', 'AF MEMBERSHIP'],
    website_url: 'https://www.anytimefitness.com.au', logo_letter: 'A', logo_color: '#7B2D8E',
  },
  {
    canonical_name: 'Fitness First', slug: 'fitness-first', category: 'FITNESS',
    common_descriptors: ['FITNESS FIRST'],
    website_url: 'https://www.fitnessfirst.com.au', logo_letter: 'F', logo_color: '#E31837',
  },
  {
    canonical_name: 'F45 Training', slug: 'f45-training', category: 'FITNESS',
    common_descriptors: ['F45', 'F45 TRAINING'],
    website_url: 'https://f45training.com.au', logo_letter: 'F', logo_color: '#FF6B35',
  },

  // ── EDUCATION ──
  {
    canonical_name: 'Duolingo', slug: 'duolingo', category: 'EDUCATION',
    common_descriptors: ['DUOLINGO', 'DUOLINGO INC'],
    website_url: 'https://www.duolingo.com', logo_letter: 'D', logo_color: '#58CC02',
  },
  {
    canonical_name: 'Skillshare', slug: 'skillshare', category: 'EDUCATION',
    common_descriptors: ['SKILLSHARE', 'SKILLSHARE INC'],
    website_url: 'https://www.skillshare.com', logo_letter: 'S', logo_color: '#00FF84',
  },
  {
    canonical_name: 'MasterClass', slug: 'masterclass', category: 'EDUCATION',
    common_descriptors: ['MASTERCLASS', 'MASTERCLASS INC'],
    website_url: 'https://www.masterclass.com', logo_letter: 'M', logo_color: '#000000',
  },
  {
    canonical_name: 'Coursera', slug: 'coursera', category: 'EDUCATION',
    common_descriptors: ['COURSERA', 'COURSERA INC'],
    website_url: 'https://www.coursera.org', logo_letter: 'C', logo_color: '#0056D2',
  },
  {
    canonical_name: 'LinkedIn Learning', slug: 'linkedin-learning', category: 'EDUCATION',
    common_descriptors: ['LINKEDIN', 'LINKEDIN LEARNING', 'LINKEDIN PREMIUM'],
    website_url: 'https://www.linkedin.com/learning', logo_letter: 'L', logo_color: '#0077B5',
  },
  {
    canonical_name: 'Audible', slug: 'audible', category: 'EDUCATION',
    common_descriptors: ['AUDIBLE', 'AUDIBLE.COM.AU', 'AMZN AUDIBLE'],
    website_url: 'https://www.audible.com.au', logo_letter: 'A', logo_color: '#FF9900',
  },
  {
    canonical_name: 'Kindle Unlimited', slug: 'kindle-unlimited', category: 'EDUCATION',
    common_descriptors: ['KINDLE', 'AMAZON KINDLE', 'KINDLE UNLIMITED'],
    website_url: 'https://www.amazon.com.au/kindle-dbs/hz/subscribe/ku', logo_letter: 'K', logo_color: '#FF9900',
  },
  {
    canonical_name: 'Blinkist', slug: 'blinkist', category: 'EDUCATION',
    common_descriptors: ['BLINKIST', 'BLINKS LABS'],
    website_url: 'https://www.blinkist.com', logo_letter: 'B', logo_color: '#2ECE60',
  },

  // ── PRIME MEMBERSHIPS ──
  {
    canonical_name: 'Amazon Prime', slug: 'amazon-prime', category: 'PRIME_MEMBERSHIPS',
    common_descriptors: ['AMAZON PRIME', 'AMZN PRIME', 'AMAZON.COM.AU'],
    website_url: 'https://www.amazon.com.au', logo_letter: 'A', logo_color: '#FF9900',
    known_plans: [
      { id: 'amazon-prime-standard', label: 'Standard', tier_rank: 1, amounts_aud: [9.99], max_users: 1, plan_type: 'INDIVIDUAL', features: ['Free delivery', 'Prime Video', 'Prime Reading'], is_active: true },
    ],
  },
  {
    canonical_name: 'eBay Plus', slug: 'ebay-plus', category: 'PRIME_MEMBERSHIPS',
    common_descriptors: ['EBAY PLUS', 'EBAY', 'EBAY.COM.AU'],
    website_url: 'https://www.ebay.com.au', logo_letter: 'E', logo_color: '#E53238',
  },
  {
    canonical_name: 'Woolworths Everyday Extra', slug: 'woolworths-everyday-extra', category: 'PRIME_MEMBERSHIPS',
    common_descriptors: ['WOOLWORTHS', 'EVERYDAY EXTRA', 'WOW EXTRA'],
    website_url: 'https://www.woolworths.com.au', logo_letter: 'W', logo_color: '#125831',
  },
  {
    canonical_name: 'Coles Plus', slug: 'coles-plus', category: 'PRIME_MEMBERSHIPS',
    common_descriptors: ['COLES PLUS', 'COLES'],
    website_url: 'https://www.coles.com.au', logo_letter: 'C', logo_color: '#E01A22',
  },

  // ── FOOD DELIVERY ──
  {
    canonical_name: 'Uber One', slug: 'uber-one', category: 'FOOD_DELIVERY',
    common_descriptors: ['UBER ONE', 'UBER', 'UBER*SUBSCRIPTION'],
    website_url: 'https://www.uber.com', logo_letter: 'U', logo_color: '#000000',
  },
  {
    canonical_name: 'DoorDash DashPass', slug: 'doordash-dashpass', category: 'FOOD_DELIVERY',
    common_descriptors: ['DOORDASH', 'DASHPASS'],
    website_url: 'https://www.doordash.com', logo_letter: 'D', logo_color: '#FF3008',
  },
  {
    canonical_name: 'Menulog', slug: 'menulog', category: 'FOOD_DELIVERY',
    common_descriptors: ['MENULOG', 'MENULOG.COM.AU'],
    website_url: 'https://www.menulog.com.au', logo_letter: 'M', logo_color: '#FF8000',
  },

  // ── FINANCE & INVESTING ──
  {
    canonical_name: 'Sharesight', slug: 'sharesight', category: 'FINANCE_INVEST',
    common_descriptors: ['SHARESIGHT', 'SHARESIGHT.COM'],
    website_url: 'https://www.sharesight.com', logo_letter: 'S', logo_color: '#4C6EF5',
  },
  {
    canonical_name: 'YNAB', slug: 'ynab', category: 'FINANCE_INVEST',
    common_descriptors: ['YNAB', 'YOU NEED A BUDGET'],
    website_url: 'https://www.ynab.com', logo_letter: 'Y', logo_color: '#85C3E9',
  },
  {
    canonical_name: 'Pocketsmith', slug: 'pocketsmith', category: 'FINANCE_INVEST',
    common_descriptors: ['POCKETSMITH'],
    website_url: 'https://www.pocketsmith.com', logo_letter: 'P', logo_color: '#3AAFA9',
  },

  // ── VPN & SECURITY ──
  {
    canonical_name: 'NordVPN', slug: 'nordvpn', category: 'VPN_SECURITY',
    common_descriptors: ['NORDVPN', 'NORD SECURITY'],
    website_url: 'https://nordvpn.com', logo_letter: 'N', logo_color: '#4687FF',
    known_plans: [
      { id: 'nord-standard-1yr', label: 'Standard (1 year)', tier_rank: 1, amounts_aud: [7.49], max_users: 6, plan_type: 'INDIVIDUAL', features: ['VPN', '6 devices'], is_active: true },
      { id: 'nord-plus-1yr', label: 'Plus (1 year)', tier_rank: 2, amounts_aud: [8.99], max_users: 6, plan_type: 'INDIVIDUAL', features: ['VPN', 'Password Manager', 'Data Breach Scanner'], is_active: true },
      { id: 'nord-ultimate-1yr', label: 'Ultimate (1 year)', tier_rank: 3, amounts_aud: [11.49], max_users: 6, plan_type: 'INDIVIDUAL', features: ['VPN', 'Password Manager', 'Cyber Insurance'], is_active: true },
    ],
  },
  {
    canonical_name: 'ExpressVPN', slug: 'expressvpn', category: 'VPN_SECURITY',
    common_descriptors: ['EXPRESSVPN', 'EXPRESS VPN'],
    website_url: 'https://www.expressvpn.com', logo_letter: 'E', logo_color: '#DA3940',
  },
  {
    canonical_name: 'Surfshark', slug: 'surfshark', category: 'VPN_SECURITY',
    common_descriptors: ['SURFSHARK', 'SURFSHARK.COM'],
    website_url: 'https://surfshark.com', logo_letter: 'S', logo_color: '#178DEF',
  },
  {
    canonical_name: 'Norton', slug: 'norton', category: 'VPN_SECURITY',
    common_descriptors: ['NORTON', 'NORTONLIFELOCK', 'NORTON 360'],
    website_url: 'https://www.norton.com', logo_letter: 'N', logo_color: '#FFC300',
  },
  {
    canonical_name: 'Bitdefender', slug: 'bitdefender', category: 'VPN_SECURITY',
    common_descriptors: ['BITDEFENDER'],
    website_url: 'https://www.bitdefender.com', logo_letter: 'B', logo_color: '#ED1C24',
  },

  // ── UTILITIES HOME (Insurance, etc.) ──
  {
    canonical_name: 'NRMA', slug: 'nrma', category: 'UTILITIES_HOME',
    common_descriptors: ['NRMA', 'NRMA INSURANCE'],
    website_url: 'https://www.nrma.com.au', logo_letter: 'N', logo_color: '#003478',
  },
  {
    canonical_name: 'RACV', slug: 'racv', category: 'UTILITIES_HOME',
    common_descriptors: ['RACV', 'RACV LTD'],
    website_url: 'https://www.racv.com.au', logo_letter: 'R', logo_color: '#003DA5',
  },
  {
    canonical_name: 'Medibank', slug: 'medibank', category: 'FITNESS',
    common_descriptors: ['MEDIBANK', 'MEDIBANK PRIVATE'],
    website_url: 'https://www.medibank.com.au', logo_letter: 'M', logo_color: '#003DA5',
  },
  {
    canonical_name: 'Bupa', slug: 'bupa', category: 'FITNESS',
    common_descriptors: ['BUPA', 'BUPA HEALTH'],
    website_url: 'https://www.bupa.com.au', logo_letter: 'B', logo_color: '#0083C0',
  },
  {
    canonical_name: 'HBF', slug: 'hbf', category: 'FITNESS',
    common_descriptors: ['HBF', 'HBF HEALTH'],
    website_url: 'https://www.hbf.com.au', logo_letter: 'H', logo_color: '#00A3E0',
  },
  {
    canonical_name: 'NIB', slug: 'nib', category: 'FITNESS',
    common_descriptors: ['NIB', 'NIB HEALTH'],
    website_url: 'https://www.nib.com.au', logo_letter: 'N', logo_color: '#78BE20',
  },
  {
    canonical_name: 'HCF', slug: 'hcf', category: 'FITNESS',
    common_descriptors: ['HCF', 'HCF HEALTH'],
    website_url: 'https://www.hcf.com.au', logo_letter: 'H', logo_color: '#E31837',
  },
];

async function seed() {
  console.log(`Seeding ${merchants.length} merchants...`);

  // Upsert in batches of 20
  const batchSize = 20;
  let inserted = 0;

  for (let i = 0; i < merchants.length; i += batchSize) {
    const batch = merchants.slice(i, i + batchSize);
    const batchWithIds = batch.map((m) => ({ id: randomUUID(), ...m }));
    const { data, error } = await db
      .from('merchants')
      .upsert(batchWithIds, { onConflict: 'slug' })
      .select('id');

    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      process.exit(1);
    }

    inserted += data?.length ?? batch.length;
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} merchants`);
  }

  console.log(`Done! Seeded ${inserted} merchants.`);

  // Verify
  const { count } = await db
    .from('merchants')
    .select('*', { count: 'exact', head: true });

  console.log(`Total merchants in DB: ${count}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
