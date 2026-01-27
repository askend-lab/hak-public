export interface MarkerTag {
  tag: string;
  type: string;
}

export const parsePhoneticMarkers = (text: string): MarkerTag[] => {
  const markers: MarkerTag[] = [];

  if (text.includes('<')) markers.push({ tag: 'kolmas välde', type: 'phonetic' });
  if (text.includes('?')) markers.push({ tag: 'ebareeglipärane rõhk', type: 'phonetic' });
  if (text.includes(']')) markers.push({ tag: 'peenendus', type: 'phonetic' });
  if (text.includes('_')) markers.push({ tag: 'liitsõna piir', type: 'boundary' });

  if (markers.length === 0) {
    markers.push({ tag: 'rõhk esimesel silbil', type: 'default' });
  }

  return markers;
};

export const generatePronunciationExplanation = (uiText: string): string => {
  const explanations: string[] = [];

  const longVowelRegex = /`([a-zõäöüšž])/gi;
  let match;
  while ((match = longVowelRegex.exec(uiText)) !== null) {
    explanations.push(`"${(match[1] ?? '').toUpperCase()}" on pikk`);
  }

  const stressRegex = /´([a-zõäöüšž])/gi;
  while ((match = stressRegex.exec(uiText)) !== null) {
    explanations.push(`Rõhk on "${match[1] ?? ''}" peal`);
  }

  const palatalRegex = /([a-zõäöüšž])'/gi;
  while ((match = palatalRegex.exec(uiText)) !== null) {
    explanations.push(`"${(match[1] ?? '').toUpperCase()}" on pehme hääldusega`);
  }

  if (uiText.includes('+')) {
    explanations.push(`Põhirõhk esimesel osal – häälda seda nagu eraldi sõna`);
  }

  if (explanations.length === 0) {
    return 'Häälda nii, nagu on kirjutatud – aga kuula pikkust ja pehmust';
  }

  return explanations.join('. ');
};
