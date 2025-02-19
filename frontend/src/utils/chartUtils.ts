// src/utils/chartUtils.ts

import { categoryColorMap } from "./categories";

export function mapToDoughnutData(categoryMap: Map<string, number>) {
  const labels = Array.from(categoryMap.keys());
  const values = Array.from(categoryMap.values());

  // For each category in labels, pick its color from categoryColorMap
  // If not found, use a fallback color
  const fallbackColor = "#aaaaaa";
  const backgroundColor = labels.map(
    (cat) => categoryColorMap[cat] || fallbackColor
  );

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
      },
    ],
  };
}
