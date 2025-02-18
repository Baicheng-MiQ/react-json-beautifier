import { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';
import iconNodes from 'lucide-static/icon-nodes.json';
import Fuse from 'fuse.js';

// Cache for Levenshtein distance calculations
const levenshteinCache = new Map<string, number>();
const iconNamesCache = new Map<string, string>();

// Common synonyms and related terms for better matching
const synonymMap: Record<string, string[]> = {
  'id': ['identification', 'number', 'hash', 'fingerprint'],
  'name': ['person', 'user'],
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
  'labour': ['political', 'party', 'vote'],
  'song': ['music', 'audio', 'song', 'track', 'album', 'playlist'],
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
  const stopWords = new Set(['and', 'or', 'the', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'about', 'than', 'a', 'an', 'as', 'but', 'if', 'or', 'because', 'is', 'has', 'hasn\'t', 'wasn\'t', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'some', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
  const words = normalizeString(label)
    .split(' ')
    .filter(word => !stopWords.has(word) && word.length > 1);

  const expanded = new Set<string>(words);
  
  words.forEach(word => {
    if (synonymMap[word]) {
      synonymMap[word].forEach(synonym => expanded.add(synonym));
    }
  });
  return Array.from(expanded);
}

// Initialize Fuse instance with icon names
const iconNames = Object.keys(iconNodes);
const fuseInstance = new Fuse(iconNames.map(name => name.replace(/-/g, ' ')), {
  includeScore: true,
  threshold: 0.5,
  distance: 100,
  minMatchCharLength: 2,
});

// Cache for icon lookups
const iconCache = new Map<string, LucideIcon>();

export const getLabelIcon = (label: string): LucideIcon => {
  if (iconCache.has(label)) {
    return iconCache.get(label)!;
  }

  const searchTerms = expandTerms(label);
  
  // Try exact matches first
  const exactMatch = iconNames.find(name => 
    searchTerms.some(term => name.includes(term))
  );
  
  if (exactMatch) {
    const icon = (icons as unknown as { [key: string]: LucideIcon })[kebabToPascalCase(exactMatch)];
    iconCache.set(label, icon);
    return icon;
  }

  // Use Fuse.js for fuzzy searching
  const searchResults = fuseInstance.search(label);
  if (searchResults.length > 0 && searchResults[0].score! < 0.4) {
    const bestMatch = searchResults[0].item;
    const icon = (icons as unknown as { [key: string]: LucideIcon })[kebabToPascalCase(bestMatch)];
    iconCache.set(label, icon);
    return icon;
  }

  return icons.MoreHorizontal;
};