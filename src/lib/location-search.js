'use strict';

function normalizeText(value = '') {
  return String(value).trim().toLowerCase();
}

function filterLocationSuggestions(locations = [], query = '', maxResults = 5) {
  const normalizedQuery = normalizeText(query);

  if (!Array.isArray(locations) || locations.length === 0) {
    return [];
  }

  if (!normalizedQuery) {
    return locations.slice(0, maxResults);
  }

  return locations
    .filter((location) => {
      const name = normalizeText(location?.name || '');
      const id = normalizeText(location?.id || '');
      return name.includes(normalizedQuery) || id.includes(normalizedQuery);
    })
    .slice(0, maxResults);
}

module.exports = {
  filterLocationSuggestions,
  normalizeText
};
