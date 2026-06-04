const fs = require('fs');
const path = require('path');

// Import the MENU_DATA by evaluating it or reading it.
// Since MenuData.js is a ES module (uses export const MENU_DATA = ...),
// we can read it and parse it, or we can transform it to CommonJS and require it.
const menuDataPath = 'C:/Users/User/Desktop/sisi/src/MenuData.js';
const content = fs.readFileSync(menuDataPath, 'utf8');

// Convert "export const MENU_DATA =" to "module.exports =" to require it easily in Node
const cjsContent = content.replace('export const MENU_DATA =', 'module.exports =');
const tempFilePath = path.join(__dirname, 'temp_MenuData.cjs');
fs.writeFileSync(tempFilePath, cjsContent, 'utf8');

const MENU_DATA = require(tempFilePath);
fs.unlinkSync(tempFilePath); // Clean up

// Transliteration helper
function slugify(text) {
  // Special overrides
  if (text.toLowerCase() === 'карбонара') return 'carbonara';
  if (text.toLowerCase() === 'лазанья') return 'lasagna';
  if (text.toLowerCase() === 'пепперони') return 'pepperoni';
  if (text.toLowerCase() === '4 сыра') return 'four-cheese';

  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ь': '', 'ъ': ''
  };

  let slug = text.toLowerCase()
    .split('')
    .map(char => cyrillicToLatin[char] !== undefined ? cyrillicToLatin[char] : char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // collapse spaces to hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens

  return slug;
}

// Map frontend categories to Russian names as requested
const categoryMap = {
  'snacks': 'Закуски',
  'salads': 'Салаты',
  'soups': 'Супы',
  'pasta': 'Паста',
  'pizza': 'Пицца на римской лепешке',
  'main-dishes': 'Основные блюда',
  'desserts': 'Десерты',
  'ice-cream': 'Мороженое'
};

const dishes = [];
const categoryStats = {};

// Initialize stats
Object.keys(categoryMap).forEach(key => {
  categoryStats[key] = {
    key: key,
    name: categoryMap[key],
    count: 0
  };
});

let totalDishes = 0;
const emptyDescriptions = [];
const emptyWeights = [];
const slugs = new Set();
const duplicateSlugs = [];
const duplicateNames = [];
const names = new Set();

MENU_DATA.forEach(cat => {
  const catKey = cat.id;
  const catTitle = cat.title;

  cat.items.forEach(item => {
    // Only include visible items if any, but they are all visible as checked.
    if (item.visible === false) return;

    totalDishes++;
    categoryStats[catKey].count++;

    // Generate unique slug
    let baseSlug = slugify(item.name);
    let itemSlug = baseSlug;
    let counter = 1;
    while (slugs.has(itemSlug)) {
      itemSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugs.add(itemSlug);
    if (counter > 1) {
      duplicateSlugs.push({ name: item.name, original: baseSlug, resolved: itemSlug });
    }

    if (names.has(item.name)) {
      duplicateNames.push(item.name);
    }
    names.add(item.name);

    if (!item.description || item.description.trim() === '') {
      emptyDescriptions.push(item.name);
    }

    if (!item.weight || item.weight.trim() === '') {
      emptyWeights.push(item.name);
    }

    dishes.push({
      name: item.name,
      slug: itemSlug,
      weight: item.weight || '',
      description: item.description || '',
      price: item.price,
      image: '', // keep empty
      category: catKey, // using category key (slug)
      sort: item.order,
      status: 'published'
    });
  });
});

// Write CSV
// Helper to escape CSV values
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

const csvHeader = ['name', 'slug', 'weight', 'description', 'price', 'image', 'category', 'sort', 'status'];
const csvRows = dishes.map(d => {
  return [
    escapeCSV(d.name),
    escapeCSV(d.slug),
    escapeCSV(d.weight),
    escapeCSV(d.description),
    escapeCSV(d.price),
    escapeCSV(d.image),
    escapeCSV(d.category),
    escapeCSV(d.sort),
    escapeCSV(d.status)
  ].join(',');
});

const csvContent = [csvHeader.join(','), ...csvRows].join('\r\n'); // Use Windows-style line endings for CSV compatibility

// Write to file
const outputCsvPath = path.join(__dirname, 'dishes_import.csv');
fs.writeFileSync(outputCsvPath, csvContent, 'utf8');

// Print stats/report JSON for debugging
const report = {
  totalDishes,
  categoriesCount: Object.keys(categoryMap).length,
  categoryStats,
  emptyDescriptions,
  emptyWeights,
  duplicateNames,
  duplicateSlugs
};

console.log(JSON.stringify(report, null, 2));
console.log(`CSV file written to: ${outputCsvPath}`);
