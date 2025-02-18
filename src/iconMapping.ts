import { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';
import iconNodes from 'lucide-static/icon-nodes.json';

const levenshteinCache = new Map<string, number>();
const iconNamesCache = new Map<string, string>();

const synonymMap: Record<string, string[]> = {
  'id': ['identification', 'number', 'hash', 'fingerprint'],
  'timestamp': ['time', 'date', 'calendar', 'clock'],
  'age': ['years', 'birthday', 'birth', 'baby'],
  'gender': ['sex', 'male', 'female', 'user'],
  'education': ['school', 'degree', 'graduation', 'academic', 'book'],
  'income': ['money', 'salary', 'cash', 'dollar', 'currency', 'banknote'],
  'location': ['place', 'address', 'city', 'map', 'pin'],
  'political': ['government', 'vote', 'party', 'ballot'],
  'affiliation': ['membership', 'group', 'association'],
  'support': ['vote', 'backing', 'help'],
  'identification': ['identity', 'id', 'profile'],
  'party': ['group', 'political', 'vote'],
  'liberal': ['political', 'party', 'vote'],
  'labour': ['political', 'party', 'vote']
};

function normalizeString(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function expandTerms(label: string): string[] {
  const stopWords = new Set(['and', 'or', 'the', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'about', 'than', 'a', 'an']);
  const words = normalizeString(label)
    .split(' ')
    .filter(word => !stopWords.has(word) && word.length > 1);

  const expanded = new Set<string>(words);
  
  words.forEach(word => {
    if (synonymMap[word]) {
      synonymMap[word].forEach(synonym => expanded.add(synonym));
    }
  });
  
  words.forEach((word, i) => {
    if (i < words.length - 1 && !stopWords.has(words[i + 1])) {
      expanded.add(word + words[i + 1]);
    }
  });
  
  return Array.from(expanded);
}

function levenshteinDistance(a: string, b: string): number {
  const cacheKey = `${a}:${b}`;
  if (levenshteinCache.has(cacheKey)) {
    return levenshteinCache.get(cacheKey)!;
  }

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const result = matrix[b.length][a.length];
  levenshteinCache.set(cacheKey, result);
  return result;
}

function findClosestLevenshtein(label: string, iconNames: string[]): string {
  const cacheKey = label;
  if (iconNamesCache.has(cacheKey)) {
    return iconNamesCache.get(cacheKey)!;
  }

  const normalizedLabel = label
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
  
  const closest = iconNames.reduce((closest, current) => {
    const currentNormalized = current.replace(/-/g, '').toLowerCase();
    const distance = levenshteinDistance(normalizedLabel, currentNormalized);
    return distance < closest.distance ? { name: current, distance } : closest;
  }, { name: '', distance: Infinity });

  const threshold = Math.ceil(
    Math.max(normalizedLabel.length, closest.name.replace(/-/g, '').length) * 0.5
  );

  const result = closest.distance <= threshold ? closest.name : '';
  iconNamesCache.set(cacheKey, result);
  return result;
}

export const getLabelIcon = (label: string): LucideIcon => {
  const searchTerms = expandTerms(label);
  const iconNames = Object.keys(iconNodes);
  
  const scores = iconNames.map(name => {
    const normalizedName = name.replace(/-/g, '');
    let score = 0;
    
    searchTerms.forEach(term => {
      if (normalizedName.includes(term)) score += 1;
      if (name.split('-').some(part => part === term)) score += 2;
    });
    
    return { name, score };
  });
  
  const bestMatch = scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (bestMatch) {
    const pascalName = kebabToPascalCase(bestMatch.name);
    return (icons as unknown as { [key: string]: LucideIcon })[pascalName] || icons.MoreHorizontal;
  }

  const closestName = findClosestLevenshtein(normalizeString(label), iconNames);
  if (closestName) {
    const pascalName = kebabToPascalCase(closestName);
    return (icons as unknown as { [key: string]: LucideIcon })[pascalName] || icons.MoreHorizontal;
  }

  return icons.MoreHorizontal;
}; 