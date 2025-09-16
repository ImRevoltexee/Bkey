// api/keys.js - Server-side key generation
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Hash key generation functions
    const prefixes = ['BC', 'RV', 'PM', 'EL', 'VP', 'XZ'];
    const hexChars = '0123456789ABCDEF';
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    function randomHex(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += hexChars[Math.floor(Math.random() * hexChars.length)];
        }
        return result;
    }
    
    function randomBase64(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += base64Chars[Math.floor(Math.random() * base64Chars.length)];
        }
        return result;
    }
    
    function generateSecureHash(type) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const timestamp = Date.now().toString(16).toUpperCase().slice(-8);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Different secure hash formats
        const formats = [
            () => `${prefix}-${randomHex(12)}-${timestamp}:${type}`,
            () => `${prefix}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(8)}:${type}`,
            () => `${prefix}_${randomBase64(16)}:${type}`,
            () => `${prefix}.${randomHex(8)}.${randomBase64(8)}.${timestamp.slice(-4)}:${type}`,
            () => `${prefix}${randomHex(6)}${randomBase64(6)}${timestamp.slice(-4)}:${type}`,
            () => `${prefix}-${random}-${randomHex(8)}-${timestamp.slice(-6)}:${type}`,
            () => `${prefix}${timestamp}${randomBase64(8)}:${type}`,
        ];
        
        return formats[Math.floor(Math.random() * formats.length)]();
    }
    
    try {
        // Generate hash keys
        const keys = {
            keys_12h: [],
            keys_24h: [],
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
            batch_id: Math.random().toString(36).substring(2, 10).toUpperCase()
        };
        
        // Generate 3 x 12h keys
        for (let i = 0; i < 3; i++) {
            keys.keys_12h.push({
                key: generateSecureHash('12H'),
                duration: '12 Hour Access',
                type: 'FREE_12H',
                expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            });
        }
        
        // Generate 3 x 24h keys
        for (let i = 0; i < 3; i++) {
            keys.keys_24h.push({
                key: generateSecureHash('24H'),
                duration: '24 Hour Access', 
                type: 'FREE_24H',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=21600'); // 6 hours cache
        
        res.status(200).json({
            success: true,
            message: 'Hash keys generated successfully',
            data: keys
        });
        
    } catch (error) {
        console.error('Key generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate keys',
            error: error.message
        });
    }
}

