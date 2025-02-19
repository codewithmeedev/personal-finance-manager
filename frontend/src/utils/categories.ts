// src/utils/categories.ts

export interface CategoryOption {
    label: string;
    value: string;
    color: string;
  }
  
  // A fixed list of categories with one color each
  export const CATEGORY_OPTIONS: CategoryOption[] = [
    { label: "Food", value: "food", color: "#FF6384" },
    { label: "Salary", value: "salary", color: "#36A2EB" },
    { label: "Rent", value: "rent", color: "#FF9F40" },
    { label: "Shopping", value: "shopping", color: "#FFCE56" },
    { label: "Entertainment", value: "entertainment", color: "#4BC0C0" },
    { label: "Transport", value: "transport", color: "#9966FF" },
    { label: "Utilities", value: "utilities", color: "#C9CBCF" },
    { label: "Other", value: "other", color: "#999999" },
  ];
  
  // Build a color map for the chart logic, keyed by category value
  export const categoryColorMap: Record<string, string> = CATEGORY_OPTIONS.reduce(
    (acc, cat) => {
      acc[cat.value] = cat.color;
      return acc;
    },
    {} as Record<string, string>
  );
  