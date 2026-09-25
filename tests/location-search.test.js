'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { filterLocationSuggestions } = require('../src/lib/location-search');

test('location suggestions return matching segment names from partial input', () => {
  const locations = [
    { id: 'broadway-5th', name: 'Broadway & 5th St' },
    { id: 'elm-roundabout', name: 'Elm St Roundabout' },
    { id: 'main-st-oak-ave', name: 'Main St & Oak Ave Intersection' },
    { id: 'riverside-pkwy', name: 'Riverside Pkwy & 12th St' }
  ];

  const results = filterLocationSuggestions(locations, '5th');
  assert.deepEqual(results.map((item) => item.id), ['broadway-5th']);

  const multiple = filterLocationSuggestions(locations, 'st');
  assert.ok(multiple.length >= 2);
  assert.ok(multiple.some((item) => item.id === 'elm-roundabout'));
  assert.ok(multiple.some((item) => item.id === 'riverside-pkwy'));
});
