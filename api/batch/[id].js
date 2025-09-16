// api/batch/[id].js - Handle specific batch requests
export default function handler(req, res) {
    const { id } = req.query;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // Generate batch-specific keys based on ID
        const batchSeed = id ? parseInt(id.replace(/\D/g, ''), 10) || Date.now() : Date.now();
        
        // Use batch ID as seed for consistent but unique keys
        function seededRandom(seed) {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        }
        
        const prefixes = ['BC', 'RV', 'PM', 'EL', 'VP', 'XZ'];
        const hexChars = '0123456789ABCDEF';
        
        function generateBatchKey(type, index) {
            const seed = batchSeed + index;
            const prefix = prefixes[Math.floor(seededRandom(seed) * prefixes.length)];
            const timestamp = (Date.now() + index).toString(16).toUpperCase().slice(-8);
            
            let hash = '';
            for (let i = 0; i < 12; i++) {
                hash += hexChars[Math.floor(seededRandom(seed + i) * hexChars.length)];
            }
            
            return `${prefix}-${hash}-${timestamp}:${type}`;
        }
        
        const batchData = {
            batch_id: id,
            keys_12h: [],
            keys_24h: [],
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        };
        
        // Generate consistent keys for this batch
        for (let i = 0; i < 3; i++) {
            batchData.keys_12h.push({
                key: generateBatchKey('12H', i),
                duration: '12 Hour Access',
                type: 'FREE_12H'
            });
            
            batchData.keys_24h.push({
                key: generateBatchKey('24H', i + 10),
                duration: '24 Hour Access',
                type: 'FREE_24H'
            });
        }
        
        res.setHeader('Cache-Control', 'public, max-age=21600');
        res.status(200).json({
            success: true,
            data: batchData
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Batch generation failed',
            error: error.message
        });
    }
}

