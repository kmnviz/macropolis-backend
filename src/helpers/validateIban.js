
const validateIban = (iban) => {
    // Remove any spaces or dashes from the input
    iban = iban.replace(/\s+/g, '').replace(/-/g, '');

    // The pattern for IBAN validation
    const ibanPattern = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

    // Test the input against the pattern
    if (!ibanPattern.test(iban)) {
        return false;
    }

    // Extract the country code and check if it's valid
    const countryCode = iban.substring(0, 2);
    const validCountryCodes = [
        'AL', 'AD', 'AT', 'AZ', 'BH', 'BY', 'BE', 'BA', 'BR', 'BG', 'CR',
        'HR', 'CY', 'CZ', 'DK', 'DO', 'TL', 'EE', 'FO', 'FI', 'FR', 'GE',
        'DE', 'GI', 'GR', 'GL', 'GT', 'GG', 'HU', 'IS', 'IR', 'IQ', 'IE',
        'IM', 'IL', 'IT', 'JE', 'JO', 'KZ', 'XK', 'KW', 'LV', 'LB', 'LI',
        'LT', 'LU', 'MT', 'MR', 'MU', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO',
        'PK', 'PS', 'PL', 'PT', 'QA', 'RO', 'LC', 'SM', 'ST', 'SA', 'RS',
        'SC', 'SK', 'SI', 'ES', 'SE', 'CH', 'TN', 'TR', 'UA', 'AE', 'GB',
        'VA', 'VG', 'XK'
    ];

    if (!validCountryCodes.includes(countryCode)) {
        return false;
    }

    // Perform the IBAN check digits validation
    const ibanCheck = iban.substring(4) + iban.substring(0, 4);
    let ibanDigits = '';

    for (let i = 0; i < ibanCheck.length; i++) {
        const char = ibanCheck.charAt(i);
        ibanDigits += isNaN(char) ? (char.charCodeAt(0) - 55).toString() : char;
    }

    const ibanNumber = BigInt(ibanDigits);
    return ibanNumber % BigInt(97) === BigInt(1);
}

module.exports = validateIban;
