const data = require('./Autos-versions.json');

// Show all brands and their models
for (const [brand, models] of Object.entries(data)) {
  console.log(`\n=== ${brand} (${Object.keys(models).length} models) ===`);
  for (const [model, versions] of Object.entries(models)) {
    console.log(`  ${model} (${versions.length} versions)`);
    // Show first 2 versions as sample
    if (versions.length > 0) {
      console.log(`    e.g.: ${versions[0]}`);
      if (versions.length > 1) console.log(`          ${versions[1]}`);
    }
  }
}
