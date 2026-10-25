import { CategoryRule } from '../types/finance';

export const DEFAULT_RULES: CategoryRule[] = [
  // Income Rules
  {
    id: 'rule-inc-salary',
    pattern: 'PAYROLL|DIRECT DEP|EMPLOYER|SALARY|GUSTO|ADP|WORKDAY',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Income',
    targetSubcategory: 'Salary',
    targetType: 'income',
    priority: 100,
    enabled: true
  },
  {
    id: 'rule-inc-freelance',
    pattern: 'UPWORK|STRIPE TRANSFER|INVOICE|CONSULTING|CLIENT|PAYPAL *TRANSFER',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Income',
    targetSubcategory: 'Freelance / Consulting',
    targetType: 'income',
    priority: 95,
    enabled: true
  },
  {
    id: 'rule-inc-dividend',
    pattern: 'DIVIDEND|FIDELITY BROKERAGE|VANGUARD DIST|SCHWAB DIV|INTEREST PAYMENT',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Income',
    targetSubcategory: 'Dividends / Investments',
    targetType: 'income',
    priority: 90,
    enabled: true
  },

  // Housing
  {
    id: 'rule-rent',
    pattern: 'RENT|LANDLORD|AVALON|EQUITY RESIDENTIAL|LEASING|MORTGAGE|CHASE HOME LOAN',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Housing',
    targetSubcategory: 'Rent / Mortgage',
    targetType: 'expense',
    priority: 85,
    enabled: true
  },
  {
    id: 'rule-renter-ins',
    pattern: 'LEMONADE|STATE FARM INS|GEICO RENTER|ALLSTATE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Housing',
    targetSubcategory: 'Renter Insurance',
    targetType: 'expense',
    priority: 80,
    enabled: true
  },

  // Food & Dining
  {
    id: 'rule-groceries',
    pattern: 'WHOLE FOODS|TRADER JOE|SAFEWAY|KROGER|HEB|ALDI|WEGMANS|COSTCO WHSE|SPROUTS|PUBLIX|TARGET GROCERY',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Food & Dining',
    targetSubcategory: 'Groceries',
    targetType: 'expense',
    priority: 75,
    enabled: true
  },
  {
    id: 'rule-coffee',
    pattern: 'STARBUCKS|PEETS|BLUE BOTTLE|DUNKIN|PHILZ|COFFEE|ESPRESSO|BAKERY|CAFE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Food & Dining',
    targetSubcategory: 'Coffee & Bakeries',
    targetType: 'expense',
    priority: 72,
    enabled: true
  },
  {
    id: 'rule-delivery',
    pattern: 'DOORDASH|UBER *EATS|GRUBHUB|POSTMATES|INSTACART|CAVIAR',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Food & Dining',
    targetSubcategory: 'Food Delivery',
    targetType: 'expense',
    priority: 74,
    enabled: true
  },
  {
    id: 'rule-restaurants',
    pattern: 'CHIPOTLE|SWEETGREEN|SHAKE SHACK|RESTAURANT|BISTRO|PIZZERIA|SUSHI|TAQUERIA|DINER|RAMEN|TRATTORIA',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Food & Dining',
    targetSubcategory: 'Restaurants',
    targetType: 'expense',
    priority: 70,
    enabled: true
  },

  // Utilities
  {
    id: 'rule-electric',
    pattern: 'CON EDISON|PG&E|EVERSOURCE|DUKE ENERGY|NATIONAL GRID|ELECTRIC|POWER & LIGHT',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Utilities',
    targetSubcategory: 'Electricity',
    targetType: 'expense',
    priority: 65,
    enabled: true
  },
  {
    id: 'rule-internet',
    pattern: 'COMCAST|XFINITY|VERIZON FIOS|AT&T FIBER|SPECTRUM|CHARTER|GOOGLE FIBER|STARLINK',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Utilities',
    targetSubcategory: 'Internet / Wifi',
    targetType: 'expense',
    priority: 66,
    enabled: true
  },
  {
    id: 'rule-phone',
    pattern: 'T-MOBILE|VERIZON WIRELESS|ATT*BILL|MINT MOBILE|GOOGLE FI|VISIBLE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Utilities',
    targetSubcategory: 'Mobile Phone',
    targetType: 'expense',
    priority: 67,
    enabled: true
  },

  // Transportation
  {
    id: 'rule-rideshare',
    pattern: 'UBER *TRIP|UBER *RIDE|LYFT *RIDE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Transportation',
    targetSubcategory: 'Rideshare (Uber/Lyft)',
    targetType: 'expense',
    priority: 64,
    enabled: true
  },
  {
    id: 'rule-transit',
    pattern: 'MTA|METRO|BART|CLIPPER|SUBWAY|CALTRAIN|MBTA|TRANSIT',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Transportation',
    targetSubcategory: 'Public Transit',
    targetType: 'expense',
    priority: 63,
    enabled: true
  },
  {
    id: 'rule-gas',
    pattern: 'CHEVRON|SHELL OIL|EXXONMOBIL|BP GAS|MOBIL|SUNOCO|76 GAS|VALERO',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Transportation',
    targetSubcategory: 'Gas & Fuel',
    targetType: 'expense',
    priority: 62,
    enabled: true
  },

  // Entertainment & Subscriptions
  {
    id: 'rule-streaming',
    pattern: 'NETFLIX|HULU|DISNEY\\+|HBO MAX|MAX\\.COM|PARAMOUNT|PEACOCK|APPLE TV',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Entertainment & Subscriptions',
    targetSubcategory: 'Streaming Services',
    targetType: 'expense',
    priority: 60,
    enabled: true
  },
  {
    id: 'rule-music',
    pattern: 'SPOTIFY|APPLE MUSIC|TIDAL|YOUTUBE PREMIUM|AUDIBLE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Entertainment & Subscriptions',
    targetSubcategory: 'Music & Podcasts',
    targetType: 'expense',
    priority: 59,
    enabled: true
  },
  {
    id: 'rule-software',
    pattern: 'GITHUB|OPENAI|CHATGPT|CLAUDE|NOTION|DROPBOX|ICLOUD|GOOGLE STORAGE|1PASSWORD|FIGMA|JETBRAINS',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Entertainment & Subscriptions',
    targetSubcategory: 'Software Subscriptions',
    targetType: 'expense',
    priority: 58,
    enabled: true
  },
  {
    id: 'rule-gaming',
    pattern: 'STEAM|PLAYSTATION|XBOX|NINTENDO|BLIZZARD|RIOT GAMES|EPIC GAMES',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Entertainment & Subscriptions',
    targetSubcategory: 'Gaming',
    targetType: 'expense',
    priority: 57,
    enabled: true
  },

  // Shopping & Goods
  {
    id: 'rule-amazon',
    pattern: 'AMAZON|AMZN|PRIME VIDEO RETAIL|AMAZON MKTPLACE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Shopping & Goods',
    targetSubcategory: 'Amazon / General Goods',
    targetType: 'expense',
    priority: 50,
    enabled: true
  },
  {
    id: 'rule-electronics',
    pattern: 'APPLE STORE|BEST BUY|MICRO CENTER|B&H PHOTO|NEWEGG',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Shopping & Goods',
    targetSubcategory: 'Electronics',
    targetType: 'expense',
    priority: 52,
    enabled: true
  },
  {
    id: 'rule-clothing',
    pattern: 'ZARA|UNIQLO|H&M|NORDSTROM|NIKE|LULULEMON|GAP|REI CO-OP|ASOS',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Shopping & Goods',
    targetSubcategory: 'Clothing & Apparel',
    targetType: 'expense',
    priority: 51,
    enabled: true
  },

  // Healthcare & Wellness
  {
    id: 'rule-gym',
    pattern: 'EQUINOX|PLANET FITNESS|CRUNCH|ORANGETHEORY|YOGA|CROSSFIT|CLASS PASS|GYM',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Healthcare & Wellness',
    targetSubcategory: 'Gym & Fitness',
    targetType: 'expense',
    priority: 45,
    enabled: true
  },
  {
    id: 'rule-pharmacy',
    pattern: 'CVS PHARMACY|WALGREENS|RITE AID|DUANE READE|CAPSULE PHARM',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Healthcare & Wellness',
    targetSubcategory: 'Pharmacy & Medicine',
    targetType: 'expense',
    priority: 46,
    enabled: true
  },

  // Savings / Transfers
  {
    id: 'rule-investments',
    pattern: 'VANGUARD BUY|ROBINHOOD|FIDELITY TRANS|SCHWAB INVESTMENT|BETTERMENT|WEALTHFRONT|COINBASE',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Savings & Investments',
    targetSubcategory: 'Brokerage Investments',
    targetType: 'transfer',
    priority: 88,
    enabled: true
  },
  {
    id: 'rule-savings-hysa',
    pattern: 'MARCUS BY GOLDMAN|ALLY BANK|CAPITAL ONE 360 SAVINGS|HYSA|SAVINGS TRANSFER',
    isRegex: true,
    matchField: 'description',
    targetCategory: 'Savings & Investments',
    targetSubcategory: 'High-Yield Savings',
    targetType: 'transfer',
    priority: 87,
    enabled: true
  }
];
