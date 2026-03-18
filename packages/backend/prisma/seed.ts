import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MerchantSeed {
  canonicalName: string;
  slug: string;
  category: string;
  commonDescriptors: string[];
  websiteUrl: string | null;
  logoLetter: string;
  logoColor: string;
  commonAmounts?: number[];
}

const merchants: MerchantSeed[] = [
  // Entertainment - Streaming
  { canonicalName: 'Netflix', slug: 'netflix', category: 'Entertainment', commonDescriptors: ['NETFLIX.COM', 'NETFLIX', 'NETFLIX AU'], websiteUrl: 'https://www.netflix.com', logoLetter: 'N', logoColor: '#E50914', commonAmounts: [7.99, 18.99, 25.99] },
  { canonicalName: 'Stan', slug: 'stan', category: 'Entertainment', commonDescriptors: ['STAN ENTERTAINMENT', 'STAN.COM.AU'], websiteUrl: 'https://www.stan.com.au', logoLetter: 'S', logoColor: '#0072CE', commonAmounts: [12.00, 17.00, 21.00] },
  { canonicalName: 'Disney+', slug: 'disney-plus', category: 'Entertainment', commonDescriptors: ['DISNEY PLUS', 'DISNEYPLUS', 'DISNEY+'], websiteUrl: 'https://www.disneyplus.com', logoLetter: 'D', logoColor: '#113CCF', commonAmounts: [13.99, 17.99] },
  { canonicalName: 'Kayo Sports', slug: 'kayo-sports', category: 'Entertainment', commonDescriptors: ['KAYO', 'KAYO SPORTS', 'KAYOSPORTS'], websiteUrl: 'https://kayosports.com.au', logoLetter: 'K', logoColor: '#00C853' },
  { canonicalName: 'Binge', slug: 'binge', category: 'Entertainment', commonDescriptors: ['BINGE', 'BINGE.COM.AU'], websiteUrl: 'https://binge.com.au', logoLetter: 'B', logoColor: '#000000' },
  { canonicalName: 'Amazon Prime Video', slug: 'amazon-prime-video', category: 'Entertainment', commonDescriptors: ['AMAZON PRIME', 'PRIME VIDEO', 'AMZN PRIME'], websiteUrl: 'https://www.primevideo.com', logoLetter: 'A', logoColor: '#00A8E1' },
  { canonicalName: 'Paramount+', slug: 'paramount-plus', category: 'Entertainment', commonDescriptors: ['PARAMOUNT PLUS', 'PARAMOUNT+'], websiteUrl: 'https://www.paramountplus.com', logoLetter: 'P', logoColor: '#0064FF' },
  { canonicalName: 'Hayu', slug: 'hayu', category: 'Entertainment', commonDescriptors: ['HAYU', 'HAYU.COM'], websiteUrl: 'https://www.hayu.com', logoLetter: 'H', logoColor: '#FF69B4' },
  { canonicalName: 'Foxtel', slug: 'foxtel', category: 'Entertainment', commonDescriptors: ['FOXTEL', 'FOXTEL NOW', 'FOXTEL GO'], websiteUrl: 'https://www.foxtel.com.au', logoLetter: 'F', logoColor: '#FF6600' },
  { canonicalName: 'Crunchyroll', slug: 'crunchyroll', category: 'Entertainment', commonDescriptors: ['CRUNCHYROLL', 'CRUNCHYROLL.COM'], websiteUrl: 'https://www.crunchyroll.com', logoLetter: 'C', logoColor: '#F47521' },
  { canonicalName: 'YouTube Premium', slug: 'youtube-premium', category: 'Entertainment', commonDescriptors: ['YOUTUBE PREMIUM', 'GOOGLE*YOUTUBE', 'YOUTUBE.COM'], websiteUrl: 'https://www.youtube.com', logoLetter: 'Y', logoColor: '#FF0000' },
  { canonicalName: 'Apple TV+', slug: 'apple-tv-plus', category: 'Entertainment', commonDescriptors: ['APPLE TV', 'APPLE.COM/BILL'], websiteUrl: 'https://tv.apple.com', logoLetter: 'A', logoColor: '#000000' },

  // Music
  { canonicalName: 'Spotify', slug: 'spotify', category: 'Music', commonDescriptors: ['SPOTIFY', 'SPOTIFY AB', 'SPOTIFY PREMIUM'], websiteUrl: 'https://www.spotify.com', logoLetter: 'S', logoColor: '#1DB954', commonAmounts: [12.99, 13.99, 20.99] },
  { canonicalName: 'Apple Music', slug: 'apple-music', category: 'Music', commonDescriptors: ['APPLE MUSIC', 'APPLE.COM/BILL'], websiteUrl: 'https://music.apple.com', logoLetter: 'A', logoColor: '#FA233B' },
  { canonicalName: 'YouTube Music', slug: 'youtube-music', category: 'Music', commonDescriptors: ['YOUTUBE MUSIC', 'GOOGLE*YOUTUBEMUSIC'], websiteUrl: 'https://music.youtube.com', logoLetter: 'Y', logoColor: '#FF0000' },
  { canonicalName: 'Tidal', slug: 'tidal', category: 'Music', commonDescriptors: ['TIDAL', 'TIDAL.COM'], websiteUrl: 'https://tidal.com', logoLetter: 'T', logoColor: '#000000' },
  { canonicalName: 'Amazon Music', slug: 'amazon-music', category: 'Music', commonDescriptors: ['AMAZON MUSIC', 'AMZN MUSIC'], websiteUrl: 'https://music.amazon.com', logoLetter: 'A', logoColor: '#25D1DA' },

  // Productivity
  { canonicalName: 'Adobe Creative Cloud', slug: 'adobe-creative-cloud', category: 'Productivity', commonDescriptors: ['ADOBE', 'ADOBE SYSTEMS', 'ADOBE CREATIVE', 'ADOBE CC'], websiteUrl: 'https://www.adobe.com', logoLetter: 'A', logoColor: '#FF0000' },
  { canonicalName: 'Microsoft 365', slug: 'microsoft-365', category: 'Productivity', commonDescriptors: ['MICROSOFT', 'MICROSOFT 365', 'MICROSOFT*OFFICE', 'MS 365'], websiteUrl: 'https://www.microsoft.com', logoLetter: 'M', logoColor: '#0078D4', commonAmounts: [9.00, 12.00, 16.00] },
  { canonicalName: 'Canva', slug: 'canva', category: 'Productivity', commonDescriptors: ['CANVA', 'CANVA PTY', 'CANVA.COM'], websiteUrl: 'https://www.canva.com', logoLetter: 'C', logoColor: '#00C4CC', commonAmounts: [19.99] },
  { canonicalName: 'Notion', slug: 'notion', category: 'Productivity', commonDescriptors: ['NOTION', 'NOTION LABS', 'NOTION.SO'], websiteUrl: 'https://www.notion.so', logoLetter: 'N', logoColor: '#000000' },
  { canonicalName: 'Figma', slug: 'figma', category: 'Productivity', commonDescriptors: ['FIGMA', 'FIGMA INC'], websiteUrl: 'https://www.figma.com', logoLetter: 'F', logoColor: '#F24E1E' },
  { canonicalName: 'Slack', slug: 'slack', category: 'Productivity', commonDescriptors: ['SLACK', 'SLACK TECHNOLOGIES'], websiteUrl: 'https://slack.com', logoLetter: 'S', logoColor: '#4A154B' },
  { canonicalName: 'Zoom', slug: 'zoom', category: 'Productivity', commonDescriptors: ['ZOOM', 'ZOOM.US', 'ZOOM VIDEO'], websiteUrl: 'https://zoom.us', logoLetter: 'Z', logoColor: '#2D8CFF' },
  { canonicalName: 'Dropbox', slug: 'dropbox', category: 'Productivity', commonDescriptors: ['DROPBOX', 'DROPBOX INC'], websiteUrl: 'https://www.dropbox.com', logoLetter: 'D', logoColor: '#0061FF' },
  { canonicalName: 'Grammarly', slug: 'grammarly', category: 'Productivity', commonDescriptors: ['GRAMMARLY', 'GRAMMARLY INC'], websiteUrl: 'https://www.grammarly.com', logoLetter: 'G', logoColor: '#15C39A' },
  { canonicalName: '1Password', slug: '1password', category: 'Productivity', commonDescriptors: ['1PASSWORD', 'AGILEBITS'], websiteUrl: 'https://1password.com', logoLetter: '1', logoColor: '#0094F5' },
  { canonicalName: 'LastPass', slug: 'lastpass', category: 'Productivity', commonDescriptors: ['LASTPASS', 'LASTPASS.COM'], websiteUrl: 'https://www.lastpass.com', logoLetter: 'L', logoColor: '#D32D27' },
  { canonicalName: 'Evernote', slug: 'evernote', category: 'Productivity', commonDescriptors: ['EVERNOTE', 'EVERNOTE CORP'], websiteUrl: 'https://evernote.com', logoLetter: 'E', logoColor: '#00A82D' },
  { canonicalName: 'Todoist', slug: 'todoist', category: 'Productivity', commonDescriptors: ['TODOIST', 'DOIST'], websiteUrl: 'https://todoist.com', logoLetter: 'T', logoColor: '#E44332' },

  // Cloud Storage
  { canonicalName: 'iCloud+', slug: 'icloud-plus', category: 'Cloud', commonDescriptors: ['ICLOUD', 'APPLE.COM/BILL', 'APPLE ICLOUD'], websiteUrl: 'https://www.icloud.com', logoLetter: 'i', logoColor: '#3693F5' },
  { canonicalName: 'Google One', slug: 'google-one', category: 'Cloud', commonDescriptors: ['GOOGLE ONE', 'GOOGLE*ONE', 'GOOGLE STORAGE'], websiteUrl: 'https://one.google.com', logoLetter: 'G', logoColor: '#4285F4' },
  { canonicalName: 'OneDrive', slug: 'onedrive', category: 'Cloud', commonDescriptors: ['ONEDRIVE', 'MICROSOFT ONEDRIVE'], websiteUrl: 'https://onedrive.live.com', logoLetter: 'O', logoColor: '#0078D4' },

  // AI / Tech
  { canonicalName: 'ChatGPT Plus', slug: 'chatgpt-plus', category: 'Productivity', commonDescriptors: ['OPENAI', 'CHATGPT', 'OPENAI.COM'], websiteUrl: 'https://chat.openai.com', logoLetter: 'C', logoColor: '#10A37F', commonAmounts: [30.00] },
  { canonicalName: 'Claude Pro', slug: 'claude-pro', category: 'Productivity', commonDescriptors: ['ANTHROPIC', 'CLAUDE', 'CLAUDE.AI'], websiteUrl: 'https://claude.ai', logoLetter: 'C', logoColor: '#D4A574', commonAmounts: [30.00] },
  { canonicalName: 'GitHub', slug: 'github', category: 'Productivity', commonDescriptors: ['GITHUB', 'GITHUB INC'], websiteUrl: 'https://github.com', logoLetter: 'G', logoColor: '#181717' },
  { canonicalName: 'Copilot', slug: 'github-copilot', category: 'Productivity', commonDescriptors: ['GITHUB COPILOT', 'COPILOT'], websiteUrl: 'https://github.com/features/copilot', logoLetter: 'C', logoColor: '#000000' },

  // Telecom (AU)
  { canonicalName: 'Telstra', slug: 'telstra', category: 'Utilities', commonDescriptors: ['TELSTRA', 'TELSTRA CORP', 'TELSTRA MOBILE'], websiteUrl: 'https://www.telstra.com.au', logoLetter: 'T', logoColor: '#0057AD' },
  { canonicalName: 'Optus', slug: 'optus', category: 'Utilities', commonDescriptors: ['OPTUS', 'SINGTEL OPTUS', 'OPTUS MOBILE'], websiteUrl: 'https://www.optus.com.au', logoLetter: 'O', logoColor: '#1F3353' },
  { canonicalName: 'Vodafone', slug: 'vodafone', category: 'Utilities', commonDescriptors: ['VODAFONE', 'VODAFONE AU', 'TPG VODAFONE'], websiteUrl: 'https://www.vodafone.com.au', logoLetter: 'V', logoColor: '#E60000' },
  { canonicalName: 'Belong', slug: 'belong', category: 'Utilities', commonDescriptors: ['BELONG', 'BELONG.COM.AU'], websiteUrl: 'https://www.belong.com.au', logoLetter: 'B', logoColor: '#FF6B00' },
  { canonicalName: 'Boost Mobile', slug: 'boost-mobile', category: 'Utilities', commonDescriptors: ['BOOST MOBILE', 'BOOST'], websiteUrl: 'https://www.boost.com.au', logoLetter: 'B', logoColor: '#FF6900' },
  { canonicalName: 'Amaysim', slug: 'amaysim', category: 'Utilities', commonDescriptors: ['AMAYSIM', 'AMAYSIM.COM.AU'], websiteUrl: 'https://www.amaysim.com.au', logoLetter: 'A', logoColor: '#FF6900' },
  { canonicalName: 'Felix Mobile', slug: 'felix-mobile', category: 'Utilities', commonDescriptors: ['FELIX MOBILE', 'FELIX'], websiteUrl: 'https://www.felix.com.au', logoLetter: 'F', logoColor: '#6C5CE7' },

  // Internet (AU)
  { canonicalName: 'Aussie Broadband', slug: 'aussie-broadband', category: 'Utilities', commonDescriptors: ['AUSSIE BROADBAND', 'ABB', 'AUSSIE BB'], websiteUrl: 'https://www.aussiebroadband.com.au', logoLetter: 'A', logoColor: '#EB5B28' },
  { canonicalName: 'Superloop', slug: 'superloop', category: 'Utilities', commonDescriptors: ['SUPERLOOP', 'SUPERLOOP.COM'], websiteUrl: 'https://www.superloop.com', logoLetter: 'S', logoColor: '#5B2D90' },

  // News / Media
  { canonicalName: 'The Australian', slug: 'the-australian', category: 'News', commonDescriptors: ['THE AUSTRALIAN', 'NEWSCORP', 'NEWS DIGITAL'], websiteUrl: 'https://www.theaustralian.com.au', logoLetter: 'T', logoColor: '#002B5C' },
  { canonicalName: 'Sydney Morning Herald', slug: 'smh', category: 'News', commonDescriptors: ['SMH', 'NINE DIGITAL', 'SYDNEY MORNING HERALD'], websiteUrl: 'https://www.smh.com.au', logoLetter: 'S', logoColor: '#062F4F' },
  { canonicalName: 'The Age', slug: 'the-age', category: 'News', commonDescriptors: ['THE AGE', 'NINE DIGITAL'], websiteUrl: 'https://www.theage.com.au', logoLetter: 'A', logoColor: '#062F4F' },
  { canonicalName: 'ABC News', slug: 'abc-news', category: 'News', commonDescriptors: ['ABC', 'ABC DIGITAL'], websiteUrl: 'https://www.abc.net.au', logoLetter: 'A', logoColor: '#000000' },
  { canonicalName: 'The Guardian', slug: 'the-guardian', category: 'News', commonDescriptors: ['GUARDIAN', 'GUARDIAN NEWS'], websiteUrl: 'https://www.theguardian.com', logoLetter: 'G', logoColor: '#052962' },
  { canonicalName: 'Crikey', slug: 'crikey', category: 'News', commonDescriptors: ['CRIKEY', 'PRIVATE MEDIA'], websiteUrl: 'https://www.crikey.com.au', logoLetter: 'C', logoColor: '#F7941D' },
  { canonicalName: 'The Saturday Paper', slug: 'saturday-paper', category: 'News', commonDescriptors: ['SATURDAY PAPER', 'SCHWARTZ MEDIA'], websiteUrl: 'https://www.thesaturdaypaper.com.au', logoLetter: 'S', logoColor: '#000000' },

  // Gaming
  { canonicalName: 'Xbox Game Pass', slug: 'xbox-game-pass', category: 'Gaming', commonDescriptors: ['XBOX', 'MICROSOFT XBOX', 'GAME PASS'], websiteUrl: 'https://www.xbox.com', logoLetter: 'X', logoColor: '#107C10' },
  { canonicalName: 'PlayStation Plus', slug: 'playstation-plus', category: 'Gaming', commonDescriptors: ['PLAYSTATION', 'SONY PLAYSTATION', 'PS PLUS'], websiteUrl: 'https://www.playstation.com', logoLetter: 'P', logoColor: '#003087' },
  { canonicalName: 'Nintendo Switch Online', slug: 'nintendo-switch-online', category: 'Gaming', commonDescriptors: ['NINTENDO', 'NINTENDO SWITCH'], websiteUrl: 'https://www.nintendo.com.au', logoLetter: 'N', logoColor: '#E60012' },
  { canonicalName: 'EA Play', slug: 'ea-play', category: 'Gaming', commonDescriptors: ['EA PLAY', 'ELECTRONIC ARTS'], websiteUrl: 'https://www.ea.com', logoLetter: 'E', logoColor: '#000000' },
  { canonicalName: 'Steam', slug: 'steam', category: 'Gaming', commonDescriptors: ['STEAM', 'VALVE', 'STEAMGAMES'], websiteUrl: 'https://store.steampowered.com', logoLetter: 'S', logoColor: '#171A21' },

  // Health & Fitness
  { canonicalName: 'Headspace', slug: 'headspace', category: 'Health', commonDescriptors: ['HEADSPACE', 'HEADSPACE.COM'], websiteUrl: 'https://www.headspace.com', logoLetter: 'H', logoColor: '#F47D31' },
  { canonicalName: 'Calm', slug: 'calm', category: 'Health', commonDescriptors: ['CALM', 'CALM.COM'], websiteUrl: 'https://www.calm.com', logoLetter: 'C', logoColor: '#3B7AD9' },
  { canonicalName: 'Strava', slug: 'strava', category: 'Health', commonDescriptors: ['STRAVA', 'STRAVA INC'], websiteUrl: 'https://www.strava.com', logoLetter: 'S', logoColor: '#FC4C02' },
  { canonicalName: 'Fitbit Premium', slug: 'fitbit-premium', category: 'Health', commonDescriptors: ['FITBIT', 'GOOGLE*FITBIT'], websiteUrl: 'https://www.fitbit.com', logoLetter: 'F', logoColor: '#00B0B9' },
  { canonicalName: 'Peloton', slug: 'peloton', category: 'Health', commonDescriptors: ['PELOTON', 'ONEPELOTON'], websiteUrl: 'https://www.onepeloton.com', logoLetter: 'P', logoColor: '#000000' },
  { canonicalName: 'Apple Fitness+', slug: 'apple-fitness-plus', category: 'Health', commonDescriptors: ['APPLE FITNESS', 'APPLE.COM/BILL'], websiteUrl: 'https://www.apple.com/apple-fitness-plus', logoLetter: 'A', logoColor: '#FA2D55' },
  { canonicalName: 'Noom', slug: 'noom', category: 'Health', commonDescriptors: ['NOOM', 'NOOM INC'], websiteUrl: 'https://www.noom.com', logoLetter: 'N', logoColor: '#F5A623' },

  // Education
  { canonicalName: 'Duolingo', slug: 'duolingo', category: 'Education', commonDescriptors: ['DUOLINGO', 'DUOLINGO INC'], websiteUrl: 'https://www.duolingo.com', logoLetter: 'D', logoColor: '#58CC02' },
  { canonicalName: 'Skillshare', slug: 'skillshare', category: 'Education', commonDescriptors: ['SKILLSHARE', 'SKILLSHARE INC'], websiteUrl: 'https://www.skillshare.com', logoLetter: 'S', logoColor: '#00FF84' },
  { canonicalName: 'MasterClass', slug: 'masterclass', category: 'Education', commonDescriptors: ['MASTERCLASS', 'MASTERCLASS INC'], websiteUrl: 'https://www.masterclass.com', logoLetter: 'M', logoColor: '#000000' },
  { canonicalName: 'Coursera', slug: 'coursera', category: 'Education', commonDescriptors: ['COURSERA', 'COURSERA INC'], websiteUrl: 'https://www.coursera.org', logoLetter: 'C', logoColor: '#0056D2' },
  { canonicalName: 'LinkedIn Learning', slug: 'linkedin-learning', category: 'Education', commonDescriptors: ['LINKEDIN', 'LINKEDIN LEARNING', 'LINKEDIN PREMIUM'], websiteUrl: 'https://www.linkedin.com/learning', logoLetter: 'L', logoColor: '#0077B5' },
  { canonicalName: 'Audible', slug: 'audible', category: 'Education', commonDescriptors: ['AUDIBLE', 'AUDIBLE.COM.AU', 'AMZN AUDIBLE'], websiteUrl: 'https://www.audible.com.au', logoLetter: 'A', logoColor: '#FF9900' },
  { canonicalName: 'Kindle Unlimited', slug: 'kindle-unlimited', category: 'Education', commonDescriptors: ['KINDLE', 'AMAZON KINDLE', 'KINDLE UNLIMITED'], websiteUrl: 'https://www.amazon.com.au/kindle-dbs/hz/subscribe/ku', logoLetter: 'K', logoColor: '#FF9900' },
  { canonicalName: 'Blinkist', slug: 'blinkist', category: 'Education', commonDescriptors: ['BLINKIST', 'BLINKS LABS'], websiteUrl: 'https://www.blinkist.com', logoLetter: 'B', logoColor: '#2ECE60' },

  // Shopping / Delivery
  { canonicalName: 'Amazon Prime', slug: 'amazon-prime', category: 'Shopping', commonDescriptors: ['AMAZON PRIME', 'AMZN PRIME', 'AMAZON.COM.AU'], websiteUrl: 'https://www.amazon.com.au', logoLetter: 'A', logoColor: '#FF9900' },
  { canonicalName: 'eBay Plus', slug: 'ebay-plus', category: 'Shopping', commonDescriptors: ['EBAY PLUS', 'EBAY', 'EBAY.COM.AU'], websiteUrl: 'https://www.ebay.com.au', logoLetter: 'E', logoColor: '#E53238' },
  { canonicalName: 'Uber One', slug: 'uber-one', category: 'Shopping', commonDescriptors: ['UBER ONE', 'UBER', 'UBER*SUBSCRIPTION'], websiteUrl: 'https://www.uber.com', logoLetter: 'U', logoColor: '#000000' },
  { canonicalName: 'DoorDash DashPass', slug: 'doordash-dashpass', category: 'Shopping', commonDescriptors: ['DOORDASH', 'DASHPASS'], websiteUrl: 'https://www.doordash.com', logoLetter: 'D', logoColor: '#FF3008' },
  { canonicalName: 'Menulog', slug: 'menulog', category: 'Shopping', commonDescriptors: ['MENULOG', 'MENULOG.COM.AU'], websiteUrl: 'https://www.menulog.com.au', logoLetter: 'M', logoColor: '#FF8000' },

  // Finance
  { canonicalName: 'Sharesight', slug: 'sharesight', category: 'Finance', commonDescriptors: ['SHARESIGHT', 'SHARESIGHT.COM'], websiteUrl: 'https://www.sharesight.com', logoLetter: 'S', logoColor: '#4C6EF5' },
  { canonicalName: 'YNAB', slug: 'ynab', category: 'Finance', commonDescriptors: ['YNAB', 'YOU NEED A BUDGET'], websiteUrl: 'https://www.ynab.com', logoLetter: 'Y', logoColor: '#85C3E9' },
  { canonicalName: 'Pocketsmith', slug: 'pocketsmith', category: 'Finance', commonDescriptors: ['POCKETSMITH'], websiteUrl: 'https://www.pocketsmith.com', logoLetter: 'P', logoColor: '#3AAFA9' },

  // VPN / Security
  { canonicalName: 'NordVPN', slug: 'nordvpn', category: 'Utilities', commonDescriptors: ['NORDVPN', 'NORD SECURITY'], websiteUrl: 'https://nordvpn.com', logoLetter: 'N', logoColor: '#4687FF' },
  { canonicalName: 'ExpressVPN', slug: 'expressvpn', category: 'Utilities', commonDescriptors: ['EXPRESSVPN', 'EXPRESS VPN'], websiteUrl: 'https://www.expressvpn.com', logoLetter: 'E', logoColor: '#DA3940' },
  { canonicalName: 'Surfshark', slug: 'surfshark', category: 'Utilities', commonDescriptors: ['SURFSHARK', 'SURFSHARK.COM'], websiteUrl: 'https://surfshark.com', logoLetter: 'S', logoColor: '#178DEF' },
  { canonicalName: 'Norton', slug: 'norton', category: 'Utilities', commonDescriptors: ['NORTON', 'NORTONLIFELOCK', 'NORTON 360'], websiteUrl: 'https://www.norton.com', logoLetter: 'N', logoColor: '#FFC300' },
  { canonicalName: 'Bitdefender', slug: 'bitdefender', category: 'Utilities', commonDescriptors: ['BITDEFENDER'], websiteUrl: 'https://www.bitdefender.com', logoLetter: 'B', logoColor: '#ED1C24' },

  // Misc AU
  { canonicalName: 'Woolworths Everyday Extra', slug: 'woolworths-everyday-extra', category: 'Shopping', commonDescriptors: ['WOOLWORTHS', 'EVERYDAY EXTRA', 'WOW EXTRA'], websiteUrl: 'https://www.woolworths.com.au', logoLetter: 'W', logoColor: '#125831' },
  { canonicalName: 'Coles Plus', slug: 'coles-plus', category: 'Shopping', commonDescriptors: ['COLES PLUS', 'COLES'], websiteUrl: 'https://www.coles.com.au', logoLetter: 'C', logoColor: '#E01A22' },
  { canonicalName: 'NRMA', slug: 'nrma', category: 'Utilities', commonDescriptors: ['NRMA', 'NRMA INSURANCE'], websiteUrl: 'https://www.nrma.com.au', logoLetter: 'N', logoColor: '#003478' },
  { canonicalName: 'RACV', slug: 'racv', category: 'Utilities', commonDescriptors: ['RACV', 'RACV LTD'], websiteUrl: 'https://www.racv.com.au', logoLetter: 'R', logoColor: '#003DA5' },
  { canonicalName: 'Medibank', slug: 'medibank', category: 'Health', commonDescriptors: ['MEDIBANK', 'MEDIBANK PRIVATE'], websiteUrl: 'https://www.medibank.com.au', logoLetter: 'M', logoColor: '#003DA5' },
  { canonicalName: 'Bupa', slug: 'bupa', category: 'Health', commonDescriptors: ['BUPA', 'BUPA HEALTH'], websiteUrl: 'https://www.bupa.com.au', logoLetter: 'B', logoColor: '#0083C0' },
  { canonicalName: 'HBF', slug: 'hbf', category: 'Health', commonDescriptors: ['HBF', 'HBF HEALTH'], websiteUrl: 'https://www.hbf.com.au', logoLetter: 'H', logoColor: '#00A3E0' },
  { canonicalName: 'NIB', slug: 'nib', category: 'Health', commonDescriptors: ['NIB', 'NIB HEALTH'], websiteUrl: 'https://www.nib.com.au', logoLetter: 'N', logoColor: '#78BE20' },
  { canonicalName: 'HCF', slug: 'hcf', category: 'Health', commonDescriptors: ['HCF', 'HCF HEALTH'], websiteUrl: 'https://www.hcf.com.au', logoLetter: 'H', logoColor: '#E31837' },
  { canonicalName: 'Anytime Fitness', slug: 'anytime-fitness', category: 'Health', commonDescriptors: ['ANYTIME FITNESS', 'AF MEMBERSHIP'], websiteUrl: 'https://www.anytimefitness.com.au', logoLetter: 'A', logoColor: '#7B2D8E' },
  { canonicalName: 'Fitness First', slug: 'fitness-first', category: 'Health', commonDescriptors: ['FITNESS FIRST'], websiteUrl: 'https://www.fitnessfirst.com.au', logoLetter: 'F', logoColor: '#E31837' },
  { canonicalName: 'F45 Training', slug: 'f45-training', category: 'Health', commonDescriptors: ['F45', 'F45 TRAINING'], websiteUrl: 'https://f45training.com.au', logoLetter: 'F', logoColor: '#FF6B35' },
];

async function main() {
  console.log('Seeding merchants...');

  for (const merchant of merchants) {
    await prisma.merchant.upsert({
      where: { slug: merchant.slug },
      update: merchant,
      create: merchant,
    });
  }

  console.log(`Seeded ${merchants.length} merchants`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
