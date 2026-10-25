import { Transaction } from '../types/finance';

// Helper to generate a realistic multi-month dataset
export const generateSampleTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  let idCounter = 1;

  // Let's create transactions across 6 months: Nov 2025 - Apr 2026 (or May 2026 - Oct 2026)
  const months = [
    { year: 2026, month: 5, days: 31, label: '2026-05' },
    { year: 2026, month: 6, days: 30, label: '2026-06' },
    { year: 2026, month: 7, days: 31, label: '2026-07' },
    { year: 2026, month: 8, days: 31, label: '2026-08' },
    { year: 2026, month: 9, days: 30, label: '2026-09' },
    { year: 2026, month: 10, days: 31, label: '2026-10' },
  ];

  months.forEach(({ year, month, label }) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const mStr = pad(month);

    // 1. Income: Bi-weekly Salary
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-01`,
      description: 'ACME CORP PAYROLL DIRECT DEP',
      amount: 4250.00,
      type: 'income',
      category: 'Income',
      subcategory: 'Salary',
      account: 'Checking *4821'
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-15`,
      description: 'ACME CORP PAYROLL DIRECT DEP',
      amount: 4250.00,
      type: 'income',
      category: 'Income',
      subcategory: 'Salary',
      account: 'Checking *4821'
    });

    // Freelance consulting (some variation)
    const freelanceAmt = 1200 + (month % 3) * 350;
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-20`,
      description: 'STRIPE TRANSFER - CLIENT CONSULTING',
      amount: freelanceAmt,
      type: 'income',
      category: 'Income',
      subcategory: 'Freelance / Consulting',
      account: 'Checking *4821'
    });

    // Monthly dividends/interest
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-28`,
      description: 'VANGUARD DIST & INTEREST PAYMENT',
      amount: 114.50 + (month * 4.2),
      type: 'income',
      category: 'Income',
      subcategory: 'Dividends / Investments',
      account: 'Brokerage *1092'
    });

    // 2. Fixed Recurring Housing & Utilities
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-01`,
      description: 'AVALON APARTMENTS ONLINE RENT',
      amount: 2450.00,
      type: 'expense',
      category: 'Housing',
      subcategory: 'Rent / Mortgage',
      account: 'Checking *4821',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-03`,
      description: 'LEMONADE RENTER INSURANCE',
      amount: 18.50,
      type: 'expense',
      category: 'Housing',
      subcategory: 'Renter Insurance',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-10`,
      description: 'VERIZON FIOS INTERNET BILL',
      amount: 79.99,
      type: 'expense',
      category: 'Utilities',
      subcategory: 'Internet / Wifi',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-14`,
      description: 'CON EDISON ELECTRIC & GAS',
      amount: 118.40 + (month % 2 === 0 ? 25 : -15),
      type: 'expense',
      category: 'Utilities',
      subcategory: 'Electricity',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-18`,
      description: 'T-MOBILE WIRELESS AUTO-PAY',
      amount: 75.00,
      type: 'expense',
      category: 'Utilities',
      subcategory: 'Mobile Phone',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    // 3. Subscriptions (Perfect for recurring detector test!)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-02`,
      description: 'OPENAI *CHATGPT SUBSCRIPTION',
      amount: 20.00,
      type: 'expense',
      category: 'Entertainment & Subscriptions',
      subcategory: 'Software Subscriptions',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-08`,
      description: 'SPOTIFY PREMIUM FAMILY',
      amount: 16.99,
      type: 'expense',
      category: 'Entertainment & Subscriptions',
      subcategory: 'Music & Podcasts',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-12`,
      description: 'APPLE ICLOUD STORAGE PLAN',
      amount: 2.99,
      type: 'expense',
      category: 'Entertainment & Subscriptions',
      subcategory: 'Software Subscriptions',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-15`,
      description: 'NETFLIX.COM MONTHLY PLAN',
      amount: 22.99,
      type: 'expense',
      category: 'Entertainment & Subscriptions',
      subcategory: 'Streaming Services',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-22`,
      description: 'GITHUB COPILOT SUBSCRIPTION',
      amount: 10.00,
      type: 'expense',
      category: 'Entertainment & Subscriptions',
      subcategory: 'Software Subscriptions',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-01`,
      description: 'EQUINOX FITNESS CLUB DUES',
      amount: 235.00,
      type: 'expense',
      category: 'Healthcare & Wellness',
      subcategory: 'Gym & Fitness',
      account: 'Credit Card *9012',
      isRecurring: true
    });

    // 4. Food & Dining (Weekly groceries, coffee, dinners)
    [4, 11, 18, 25].forEach((day) => {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: day % 2 === 0 ? 'TRADER JOES #512' : 'WHOLE FOODS MARKET',
        amount: Number((135 + (day * 1.7)).toFixed(2)),
        type: 'expense',
        category: 'Food & Dining',
        subcategory: 'Groceries',
        account: 'Credit Card *9012'
      });
    });

    // Coffee runs
    [2, 6, 9, 13, 16, 21, 24, 27].forEach((day) => {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: day % 2 === 0 ? 'STARBUCKS STORE 1042' : 'BLUE BOTTLE COFFEE',
        amount: Number((6.75 + (day % 3) * 2.1).toFixed(2)),
        type: 'expense',
        category: 'Food & Dining',
        subcategory: 'Coffee & Bakeries',
        account: 'Credit Card *9012'
      });
    });

    // Dining & Takeout
    [5, 12, 19, 26].forEach((day, idx) => {
      const places = [
        { desc: 'SWEETGREEN METRO', sub: 'Restaurants', amt: 18.75 },
        { desc: 'CHIPOTLE ONLINE ORDER', sub: 'Fast Food', amt: 16.40 },
        { desc: 'DOORDASH *RAMEN LAB', sub: 'Food Delivery', amt: 38.50 },
        { desc: 'OSTERIA TRATTORIA BISTRO', sub: 'Restaurants', amt: 84.20 }
      ];
      const p = places[idx % places.length];
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: p.desc,
        amount: p.amt,
        type: 'expense',
        category: 'Food & Dining',
        subcategory: p.sub,
        account: 'Credit Card *9012'
      });
    });

    // 5. Transportation
    [3, 10, 17, 24].forEach((day) => {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: 'MTA METROCARD VENDING',
        amount: 34.00,
        type: 'expense',
        category: 'Transportation',
        subcategory: 'Public Transit',
        account: 'Credit Card *9012'
      });
    });

    [7, 21].forEach((day) => {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: 'UBER *TRIP RIDE',
        amount: Number((24.50 + (day % 5) * 4).toFixed(2)),
        type: 'expense',
        category: 'Transportation',
        subcategory: 'Rideshare (Uber/Lyft)',
        account: 'Credit Card *9012'
      });
    });

    // 6. Shopping & Personal
    [9, 23].forEach((day) => {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-${pad(day)}`,
        description: 'AMAZON.COM*RETAIL ORDER',
        amount: Number((42.50 + (day * 2.1)).toFixed(2)),
        type: 'expense',
        category: 'Shopping & Goods',
        subcategory: 'Amazon / General Goods',
        account: 'Credit Card *9012'
      });
    });

    // Occasional clothing / electronics
    if (month % 2 === 0) {
      transactions.push({
        id: `tx-${idCounter++}`,
        date: `${year}-${mStr}-17`,
        description: 'UNIQLO SOHO NEW YORK',
        amount: 114.80,
        type: 'expense',
        category: 'Shopping & Goods',
        subcategory: 'Clothing & Apparel',
        account: 'Credit Card *9012'
      });
    }

    // Pharmacy
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-20`,
      description: 'CVS PHARMACY STORE #882',
      amount: 32.40,
      type: 'expense',
      category: 'Healthcare & Wellness',
      subcategory: 'Pharmacy & Medicine',
      account: 'Credit Card *9012'
    });

    // 7. Savings & Investments (Transfers / Retained Wealth)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-05`,
      description: 'VANGUARD BUY ROTH IRA VTSAX',
      amount: 583.33,
      type: 'transfer',
      category: 'Savings & Investments',
      subcategory: 'Roth IRA',
      account: 'Checking *4821'
    });

    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${year}-${mStr}-16`,
      description: 'MARCUS BY GOLDMAN HYSA TRANSFER',
      amount: 1850.00,
      type: 'transfer',
      category: 'Savings & Investments',
      subcategory: 'High-Yield Savings',
      account: 'Checking *4821'
    });
  });

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

export const SAMPLE_TRANSACTIONS: Transaction[] = generateSampleTransactions();
