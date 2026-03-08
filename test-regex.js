const t1 = '110 SW 2,4 7S M 60659 57797';
const t2 = '110 2,2 TD EDICIÓN DE COLECCIÓN 71655 68624 66262';
console.log('t1 matches digit+space+digit:', /^\d+\s+\d+[,\.]\d/.test(t1));
console.log('t2 matches digit+space+digit:', /^\d+\s+\d+[,\.]\d/.test(t2));
// t1 is '110 SW ...' - SW is letters, so the second pattern doesn't match
// Need a pattern like: starts with digits, then anything
console.log('t1 starts with 3-digit number:', /^\d{3}\s/.test(t1));
console.log('t2 starts with 3-digit number:', /^\d{3}\s/.test(t2));
