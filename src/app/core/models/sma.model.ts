// src/app/models/sma-category.model.ts

export interface SmaCategory {
    name: 'ILDC' | 'SC' | 'FC';
    label: string; // La description de la catégorie si elle est définie
}

export interface SmaSubCategory {
    name: string;
    label: string;
    category: SmaCategory;
}

export interface SmaItem {
    id: number;
    name: string; // Le nom de l'énumération (ex: 'INTEREST_INCOME')
    label: string; // Le libellé complet pour l'affichage
    subCategory: SmaSubCategory;
}
const CategorySC: SmaCategory = { name: 'SC', label: 'Service Component' };
const CategoryFC: SmaCategory = { name: 'FC', label: 'Financial Component' };
const CategoryILDC: SmaCategory = { name: 'ILDC', label: 'Interest, Lease and Dividend Component' };


// --- Sous-Catégories ---

// SC Subcategories
const FeeCommissionIncomeSC: SmaSubCategory = { name: 'FEE_COMMISSION_INCOME', label: 'Fee and commission income component', category: CategorySC };
const FeeCommissionExpensesSC: SmaSubCategory = { name: 'FEE_COMMISSION_EXPENSES', label: '(Fee and commission expenses component)', category: CategorySC };
const OtherOperatingIncomeSC: SmaSubCategory = { name: 'OTHER_OPERATING_INCOME', label: 'Other operating income', category: CategorySC };
const OtherOperatingExpensesSC: SmaSubCategory = { name: 'OTHER_OPERATING_EXPENSES', label: '(Other operating expenses)', category: CategorySC };

// FC Subcategories
const TradingBookFC: SmaSubCategory = { name: 'TRADING_BOOK', label: 'Net profit or (-)loss applicable to trading book', category: CategoryFC };
const BankingBookFC: SmaSubCategory = { name: 'BANKING_BOOK', label: 'Net profit or (-)loss applicable to banking book', category: CategoryFC };

// ILDC Subcategories
const InterestIncomeILDC: SmaSubCategory = { name: 'INTEREST_INCOME_COMPONENT', label: 'Interest Income (including from leased assets (Financial & Operating))', category: CategoryILDC };
const InterestExpensesILDC: SmaSubCategory = { name: 'INTEREST_EXPENSES_COMPONENT', label: '(Interest expenses (including from leased assets (Financial&Operating)))', category: CategoryILDC };
const AssetComponentILDC: SmaSubCategory = { name: 'ASSET_COMPONENT', label: 'Asset component', category: CategoryILDC };
const DividendComponentILDC: SmaSubCategory = { name: 'DIVIDEND_COMPONENT', label: 'Dividend component', category: CategoryILDC };


// --- Ensemble complet des SmaItems (L'équivalent de SmaItemEnum) ---

export const SmaItemData: SmaItem[] = [
    // ILDC - INTEREST_INCOME_COMPONENT
    { id: 1, name: 'INTEREST_INCOME', label: 'Interest Income', subCategory: InterestIncomeILDC },
    { id: 2, name: 'INCOME_FROM_LEASED_ASSETS', label: 'Income from leased assets...', subCategory: InterestIncomeILDC },
    { id: 3, name: 'PROFITS_FROM_LEASED_ASSETS', label: 'Profits from leased assets...', subCategory: InterestIncomeILDC },

    // ILDC - INTEREST_EXPENSES_COMPONENT
    { id: 4, name: 'INTEREST_EXPENSES', label: '(Interest expenses)', subCategory: InterestExpensesILDC },
    { id: 5, name: 'EXPENSES_FROM_LEASED_ASSETS', label: '(Expenses from operating leased assets...)', subCategory: InterestExpensesILDC },
    { id: 6, name: 'LOSSES_FROM_LEASED_ASSETS', label: '(Losses from operating leased assets)', subCategory: InterestExpensesILDC },

    // ILDC - ASSET_COMPONENT
    { id: 7, name: 'CASH_BALANCES', label: 'Cash balances...', subCategory: AssetComponentILDC },
    { id: 8, name: 'DEBT_SECURITIES', label: 'Debt securities', subCategory: AssetComponentILDC },
    { id: 9, name: 'LOANS_AND_ADVANCES', label: 'Loans and advances', subCategory: AssetComponentILDC },
    { id: 10, name: 'DERIVATIVES', label: 'Derivatives', subCategory: AssetComponentILDC },
    { id: 11, name: 'ASSETS_SUBJECT_TO_LEASES', label: 'Assets subject to leases', subCategory: AssetComponentILDC },

    // ILDC - DIVIDEND_COMPONENT
    { id: 12, name: 'DIVIDEND_INCOME', label: 'Dividend income', subCategory: DividendComponentILDC },

    // SC - OTHER_OPERATING_INCOME
    { id: 13, name: 'OTHER_OPERATING_INCOME_IPS', label: 'Other operating income from IPS', subCategory: OtherOperatingIncomeSC },
    { id: 14, name: 'PROFIT_NON_CURRENT_ASSETS', label: 'Profit from non-current assets...', subCategory: OtherOperatingIncomeSC },
    { id: 15, name: 'OTHER_OPERATING_INCOME', label: 'Other', subCategory: OtherOperatingIncomeSC },

    // SC - OTHER_OPERATING_EXPENSES
    { id: 16, name: 'OTHER_OPERATING_EXPENSES_IPS', label: '(Other operating expenses from IPS)', subCategory: OtherOperatingExpensesSC },
    { id: 17, name: 'LOSSES_FROM_OPERATIONAL_RISK', label: '(Total losses... operational risk)', subCategory: OtherOperatingExpensesSC },
    { id: 18, name: 'LOSSES_NON_CURRENT_ASSETS', label: '(Losses from non-current assets...)', subCategory: OtherOperatingExpensesSC },
    { id: 19, name: 'OTHER_EXPENSES', label: '(Other)', subCategory: OtherOperatingExpensesSC },

    // SC - FEE_COMMISSION_INCOME
    { id: 20, name: 'FEE_COMMISSION_INCOME', label: 'Fee and commission income', subCategory: FeeCommissionIncomeSC },

    // SC - FEE_COMMISSION_EXPENSES
    { id: 21, name: 'FEE_COMMISSION_EXPENSES', label: '(Fee and commission expenses)', subCategory: FeeCommissionExpensesSC },

    // FC - TRADING_BOOK
    { id: 22, name: 'TRADING_BOOK_PROFIT', label: 'Gains or losses held for trading', subCategory: TradingBookFC },
    { id: 23, name: 'TRADING_BOOK_HEDGE', label: 'Trading book - hedge accounting', subCategory: TradingBookFC },
    { id: 24, name: 'TRADING_BOOK_EXCHANGE', label: 'Trading book - exchange differences', subCategory: TradingBookFC },

    // FC - BANKING_BOOK
    { id: 25, name: 'BANKING_BOOK_DERECOGNITION', label: 'Derecognition of financial assets', subCategory: BankingBookFC },
    { id: 26, name: 'BANKING_BOOK_NON_TRADING_FAIR_VALUE', label: 'Non-trading financial assets', subCategory: BankingBookFC },
    { id: 27, name: 'BANKING_BOOK_FAIR_VALUE_DESIGNATED', label: 'Designated at fair value', subCategory: BankingBookFC },
    { id: 28, name: 'BANKING_BOOK_HEDGE', label: 'Banking book - hedge accounting', subCategory: BankingBookFC },
    { id: 29, name: 'BANKING_BOOK_EXCHANGE', label: 'Banking book - exchange differences', subCategory: BankingBookFC },
];