const data = require('./Autos-versions.json');
console.log('TOYOTA models:', Object.keys(data['TOYOTA']).join(', '));
console.log('\nVW UP!:', data['VOLKSWAGEN']['UP!']);
console.log('\nFORD KA:', data['FORD']['KA']);
console.log('\nRAM models:', Object.keys(data['RAM']));
console.log('\nRAM 1500:', data['RAM']['1500 PICK - UP']);
