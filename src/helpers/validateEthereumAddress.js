const validateEthereumAddress = (address) => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        return false;
    }

    const cleanAddress = address.toLowerCase().replace('0x', '');
    const addressHash = Array.from(Buffer.from(cleanAddress, 'hex'));

    let hash = 0;
    for (let i = 0; i < addressHash.length; i++) {
        hash |= addressHash[i];
    }

    return hash !== 0;
}

module.exports = validateEthereumAddress;
