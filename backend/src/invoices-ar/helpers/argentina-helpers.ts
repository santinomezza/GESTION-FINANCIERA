export function validarCUIT(cuit: string | null | undefined): boolean {
    if (!cuit) return false;
    const cleanCuit = cuit.toString().replace(/[-\s]/g, '');
    if (!/^\d{11}$/.test(cleanCuit)) return false;
    const digits = cleanCuit.split('').map(Number);
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * multipliers[i];
    }
    const remainder = sum % 11;
    let verificationDigit = remainder === 0 || remainder === 1 ? remainder : 11 - remainder;
    if (remainder === 0 && digits[10] === 0 && cleanCuit.startsWith('20')) return true;
    if (remainder === 1 && digits[10] === 0 && cleanCuit.startsWith('23')) return true;
    if (remainder === 1 && digits[10] === 1 && cleanCuit.startsWith('27')) return true;
    return verificationDigit === digits[10];
}

export function clasificarComprobante(numeroTicket: string | null | undefined): string | null {
    if (!numeroTicket) return null;
    const match = numeroTicket.match(/^(\d+)-(\d+)$/);
    if (!match) return null;
    const firstSegment = parseInt(match[1], 10);
    const typeMap: Record<number, string> = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'NDA',
        5: 'NDB',
        6: 'ND',
        7: 'NC',
        8: 'NCA',
        9: 'NCB',
        10: 'NCE',
        11: 'FAC',
        12: 'FEC',
        13: 'FAR',
        14: 'FER',
        15: 'FAR',
        16: 'FER',
        17: 'FPR',
        18: 'FMR',
        19: 'FMR',
        20: 'FMR',
    };
    return typeMap[firstSegment] || null;
}

export function parsearFechaArg(fechaStr: string | null | undefined): string | null {
    if (!fechaStr) return null;
    const regex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
    const match = fechaStr.match(regex);
    if (!match) return null;
    const [, day, month, year] = match;
    const yearNum = year.length === 2 ? parseInt(year, 10) + 2000 : parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) return null;
    return `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

export function parseNum(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    const str = val.toString().trim();
    if (!str) return 0;
    const hasCommaDecimal = /,\d{1,2}$/.test(str);
    const hasDotThousands = /\.\d{3}/.test(str);
    let numStr: string;
    if (hasCommaDecimal && hasDotThousands) {
        numStr = str.replace(/\./g, '').replace(',', '.');
    } else if (hasCommaDecimal) {
        numStr = str.replace(',', '.');
    } else {
        numStr = str.replace(/\./g, '');
    }
    const result = parseFloat(numStr);
    return isNaN(result) ? 0 : result;
}