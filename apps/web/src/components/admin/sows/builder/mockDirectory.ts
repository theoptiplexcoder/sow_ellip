// Static placeholder datasets for enterprise lookup fields. These stand in
// for a future directory/CRM API — the builder is UI-only for now.

export const MOCK_DIRECTORY: Record<string, string[]> = {
  employeeLookup: ['Avery Chen', 'Priya Nair', 'Jordan Lee', 'Sam Ortiz', 'Riley Kim'],
  clientLookup: ['Northwind Traders', 'Globex Corp', 'Initech', 'Umbrella Group', 'Acme Co'],
  department: ['Engineering', 'Consulting', 'Sales', 'Finance', 'Operations'],
  organization: ['Acme Holdings', 'Northwind Traders', 'Globex Corp'],
  vendor: ['Contoso Supplies', 'Fabrikam Services', 'Wingtip Toys'],
  project: ['Website Revamp', 'Data Migration', 'Cloud Migration', 'Support Retainer'],
};

export function directoryOptions(lookupType: string): string[] {
  return MOCK_DIRECTORY[lookupType] ?? [];
}
