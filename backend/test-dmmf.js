const { Prisma } = require('@prisma/client');
const fs = require('fs');

console.log('DMMF:', JSON.stringify(Prisma.dmmf.datamodel, null, 2));
fs.writeFileSync('dmmf.json', JSON.stringify(Prisma.dmmf, null, 2));
console.log('Written dmmf.json');
