export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: string[];
}

export interface ParsedFeature {
  name: string;
  description: string;
  tags: string[];
  scenarios: ParsedScenario[];
}

function processTagLine(line: string, pendingTags: string[]): void {
  pendingTags.push(...line.split(/\s+/).filter(t => t.startsWith('@')));
}

function processFeatureLine(line: string, feature: ParsedFeature, pendingTags: string[]): void {
  feature.name = line.replace('Feature:', '').trim();
  feature.tags = [...pendingTags];
  pendingTags.length = 0;
}

function processScenarioLine(
  line: string, 
  feature: ParsedFeature, 
  currentScenario: { name: string; tags: string[]; steps: string[] } | null,
  pendingTags: string[]
): { name: string; tags: string[]; steps: string[] } {
  if (currentScenario) feature.scenarios.push(currentScenario);
  const name = line.replace('Scenario Outline:', '').replace('Scenario:', '').trim();
  const newScenario = { name, tags: [...pendingTags], steps: [] };
  pendingTags.length = 0;
  return newScenario;
}

function isStepLine(line: string): boolean {
  return /^(Given|When|Then|And|But)/.test(line);
}

 
export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split('\n');
  const feature: ParsedFeature = { name: '', description: '', tags: [], scenarios: [] };
  
  let currentScenario: { name: string; tags: string[]; steps: string[] } | null = null;
  let pendingTags: string[] = [];
  let inBackground = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('@')) processTagLine(trimmed, pendingTags);
    else if (trimmed.startsWith('Feature:')) processFeatureLine(trimmed, feature, pendingTags);
    else if (trimmed.startsWith('Background:')) { inBackground = true; pendingTags = []; }
    else if (trimmed.startsWith('Scenario:') || trimmed.startsWith('Scenario Outline:')) { inBackground = false; currentScenario = processScenarioLine(trimmed, feature, currentScenario, pendingTags); }
    else if (currentScenario && !inBackground && isStepLine(trimmed)) currentScenario.steps.push(trimmed);
  }
  
  if (currentScenario) feature.scenarios.push(currentScenario);
  return feature.name ? feature : null;
}
