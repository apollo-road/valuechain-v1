export type ActivityInsight = {
  name: string;
  directCost: number;
  laborCost: number;
};

export type ProjectEvaluationInput = {
  marginPercent: number;
  activities: ActivityInsight[];
};

export function evaluateProject(projectData: ProjectEvaluationInput): string[] {
  const suggestions: string[] = [];
  const { marginPercent, activities } = projectData;

  const totalDirect = activities.reduce((sum, a) => sum + a.directCost, 0);
  const totalLabor = activities.reduce((sum, a) => sum + a.laborCost, 0);

  if (marginPercent < 15) {
    suggestions.push("Critical margin: consider repricing or reducing scope.");
  } else if (marginPercent < 30) {
    suggestions.push("Margin is moderate: optimize high-cost tasks before next proposal.");
  } else {
    suggestions.push("Healthy margin: replicate this delivery pattern on future projects.");
  }

  if (totalDirect > 0) {
    const largest = activities
      .map((a) => ({ ...a, pct: (a.directCost / totalDirect) * 100 }))
      .sort((a, b) => b.pct - a.pct)[0];

    if (largest && largest.pct > 35) {
      suggestions.push(`${largest.name} drives ${largest.pct.toFixed(1)}% of direct cost; review workflow efficiency.`);
    }

    const laborPct = (totalLabor / totalDirect) * 100;
    if (laborPct > 60) {
      suggestions.push(`Labor is ${laborPct.toFixed(1)}% of direct costs; automate repeatable steps or adjust rates.`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("No immediate cost risks detected.");
  }

  return suggestions;
}
