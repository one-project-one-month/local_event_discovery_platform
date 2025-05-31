// Myanmar States and Regions with their major towns
export const MYANMAR_LOCATIONS_BY_STATE = {
  'Ayeyarwady Region': ['Pathein', 'Hinthada', 'Myaungmya', 'Labutta', 'Pyapon'],
  'Bago Region': ['Bago', 'Taungoo', 'Pyay', 'Thayarwady'],
  'Chin State': ['Hakha', 'Falam', 'Mindat', 'Matupi'],
  'Kachin State': ['Myitkyina', 'Bhamo', 'Putao', 'Mohnyin'],
  'Kayah State': ['Loikaw', 'Bawlakhe', 'Demoso', 'Shadaw'],
  'Kayin State': ['Hpa-an', 'Myawaddy', 'Kawkareik', 'Thandaung'],
  'Magway Region': ['Magway', 'Pakokku', 'Minbu', 'Thayet'],
  'Mandalay Region': ['Mandalay', 'Pyin Oo Lwin', 'Kyaukse', 'Meiktila', 'Myingyan'],
  'Mon State': ['Mawlamyine', 'Thaton', 'Kyaikto', 'Ye'],
  'Naypyidaw Union Territory': ['Naypyidaw', 'Pyinmana', 'Lewe', 'Tatkon'],
  'Rakhine State': ['Sittwe', 'Mrauk U', 'Kyaukpyu', 'Thandwe'],
  'Sagaing Region': ['Sagaing', 'Monywa', 'Shwebo', 'Kale'],
  'Shan State': ['Taunggyi', 'Lashio', 'Kengtung', 'Nyaungshwe'],
  'Yangon Region': [
    'Yangon',
    'Thanlyin',
    'Hlaingthaya',
    'North Dagon',
    'South Dagon',
    'East Dagon',
    'Insein',
    'Mayangone',
    'Bahan',
    'Kamayut',
    'Kyauktada',
    'Lanmadaw',
    'Latha',
    'Pabedan',
    'Sanchaung',
    'Tamwe',
    'Thingangyun',
    'Mingalar Taung Nyunt',
    'Botahtaung',
    'Pazundaung',
    'Dagon',
    'Yankin',
    'South Okkalapa',
    'North Okkalapa',
    'Thaketa',
    'Dawbon',
    'Kyeemyindaing',
    'Ahlone',
    'Seikkan',
    'Dala',
  ],
} as const;

// Flatten all towns for simple location selection
export const MYANMAR_LOCATIONS = Object.values(
  MYANMAR_LOCATIONS_BY_STATE
).flat() as readonly string[];

export const ALL_LOCATIONS = ['All Locations', ...MYANMAR_LOCATIONS, 'Online'] as const;

// Type for state/region names
export type MyanmarState = keyof typeof MYANMAR_LOCATIONS_BY_STATE;

// Type for town names
export type Location = (typeof MYANMAR_LOCATIONS)[number] | 'Online';

// Type for location filter including 'All Locations'
export type LocationFilter = 'All Locations' | Location;

// Helper function to get towns by state
export const getTownsByState = (state: MyanmarState) => MYANMAR_LOCATIONS_BY_STATE[state];
