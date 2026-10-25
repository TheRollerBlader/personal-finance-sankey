import { CategoryDefinition } from '../types/finance';

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  // Income
  {
    id: 'income',
    name: 'Income',
    type: 'income',
    color: '#10B981', // Emerald
    subcategories: ['Salary', 'Freelance / Consulting', 'Dividends / Investments', 'Bonus', 'Rental Income', 'Reimbursements', 'Other Income']
  },
  // Expenses
  {
    id: 'housing',
    name: 'Housing',
    type: 'expense',
    color: '#6366F1', // Indigo
    subcategories: ['Rent / Mortgage', 'Property Tax', 'Home Maintenance', 'Renter Insurance', 'Furniture & Decor']
  },
  {
    id: 'food',
    name: 'Food & Dining',
    type: 'expense',
    color: '#F59E0B', // Amber
    subcategories: ['Groceries', 'Restaurants', 'Coffee & Bakeries', 'Fast Food', 'Food Delivery', 'Bars & Nightlife']
  },
  {
    id: 'utilities',
    name: 'Utilities',
    type: 'expense',
    color: '#8B5CF6', // Purple
    subcategories: ['Electricity', 'Water & Sewer', 'Natural Gas', 'Internet / Wifi', 'Mobile Phone', 'Trash & Recycling']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    type: 'expense',
    color: '#EC4899', // Pink
    subcategories: ['Public Transit', 'Rideshare (Uber/Lyft)', 'Gas & Fuel', 'Car Insurance', 'Parking & Tolls', 'Vehicle Maintenance']
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Subscriptions',
    type: 'expense',
    color: '#14B8A6', // Teal
    subcategories: ['Streaming Services', 'Music & Podcasts', 'Gaming', 'Concerts & Events', 'Movies & Theater', 'Software Subscriptions']
  },
  {
    id: 'shopping',
    name: 'Shopping & Goods',
    type: 'expense',
    color: '#F97316', // Orange
    subcategories: ['Electronics', 'Clothing & Apparel', 'Home Goods', 'Amazon / General Goods', 'Books & Media', 'Hobbies']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    type: 'expense',
    color: '#EF4444', // Red
    subcategories: ['Pharmacy & Medicine', 'Doctor & Specialist', 'Dental', 'Vision', 'Gym & Fitness', 'Therapy & Mental Health']
  },
  {
    id: 'personal',
    name: 'Personal & Professional',
    type: 'expense',
    color: '#84CC16', // Lime
    subcategories: ['Education & Courses', 'Gifts & Donations', 'Personal Care / Salon', 'Pet Supplies & Vet', 'Childcare', 'Travel & Lodging']
  },
  {
    id: 'financial',
    name: 'Financial & Fees',
    type: 'expense',
    color: '#64748B', // Slate
    subcategories: ['Bank Fees', 'Interest Paid', 'Advisory Fees', 'Legal / Accounting']
  },
  // Savings / Transfers
  {
    id: 'savings',
    name: 'Savings & Investments',
    type: 'transfer',
    color: '#06B6D4', // Cyan
    subcategories: ['High-Yield Savings', 'Emergency Fund', 'Roth IRA', 'Brokerage Investments', 'Crypto', '401(k) Contribution']
  }
];

export const CATEGORY_COLOR_MAP: Record<string, string> = DEFAULT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.name] = cat.color;
  return acc;
}, {} as Record<string, string>);

// Add fallback colors
CATEGORY_COLOR_MAP['Savings'] = '#06B6D4';
CATEGORY_COLOR_MAP['Net Savings'] = '#06B6D4';
CATEGORY_COLOR_MAP['Budget Deficit'] = '#E11D48';
CATEGORY_COLOR_MAP['Uncategorized'] = '#94A3B8';
