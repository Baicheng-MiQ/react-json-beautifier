import { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';
import iconNodes from 'lucide-static/icon-nodes.json';
import Fuse from 'fuse.js';

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

// Pre-process stop words once
const stopWords = new Set(['and', 'or', 'the', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'about', 'than', 'a', 'an', 'as', 'but', 'if', 'or', 'because', 'is', 'has', 'hasn\'t', 'wasn\'t', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'some', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);

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

// Cache for expanded terms to avoid re-processing
const termsCache = new Map<string, string[]>();

function expandTerms(label: string): string[] {
  // Use cached results if available
  if (termsCache.has(label)) {
    return termsCache.get(label)!;
  }
  
  const words = normalizeString(label)
    .split(' ')
    .filter(word => !stopWords.has(word) && word.length > 1);

  const expanded = new Set<string>(words);
  
  words.forEach(word => {
    if (synonymMap[word]) {
      synonymMap[word].forEach(synonym => expanded.add(synonym));
    }
  });
  
  const result = Array.from(expanded);
  // Cache the result
  termsCache.set(label, result);
  return result;
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

// Pre-process common icon mappings for faster lookups
const defaultIcon = icons.MoreHorizontal;

// Pre-compute icon components by name for faster lookup
const iconComponentMap = new Map<string, LucideIcon>();
iconNames.forEach(name => {
  const pascalName = kebabToPascalCase(name);
  if ((icons as unknown as { [key: string]: LucideIcon })[pascalName]) {
    iconComponentMap.set(name, (icons as unknown as { [key: string]: LucideIcon })[pascalName]);
  }
});

export const getLabelIcon = (label: string): LucideIcon => {
  // Fast path: cache hit
  if (iconCache.has(label)) {
    return iconCache.get(label)!;
  }

  // For very short labels, just return default icon to avoid processing
  if (label.length < 2) {
    iconCache.set(label, defaultIcon);
    return defaultIcon;
  }

  const searchTerms = expandTerms(label);
  
  // Try exact matches first
  for (const term of searchTerms) {
    for (const name of iconNames) {
      if (name.includes(term)) {
        const icon = iconComponentMap.get(name) || defaultIcon;
        iconCache.set(label, icon);
        return icon;
      }
    }
  }

  // Use Fuse.js for fuzzy searching only if needed
  const searchResults = fuseInstance.search(label);
  if (searchResults.length > 0 && searchResults[0].score! < 0.4) {
    const bestMatch = searchResults[0].item;
    const icon = iconComponentMap.get(bestMatch.replace(/\s/g, '-')) || defaultIcon;
    iconCache.set(label, icon);
    return icon;
  }

  // Default icon as fallback
  iconCache.set(label, defaultIcon);
  return defaultIcon;
};