export const ProxyReader = {
    address: '0x7ea9Ee21077F84339eDa9C80048ec6db678642B1',
    abi: [
        {
            constant: true,
            inputs: [
                { internalType: 'string', name: 'key', type: 'string' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'get',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [
                { internalType: 'string[]', name: 'keys', type: 'string[]' },
                { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            name: 'getMany',
            outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ],
};
