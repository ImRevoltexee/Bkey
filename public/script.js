// public/script.js - Main JavaScript functionality

class BuncheatsKeySystem {
    constructor() {
        this.keys = [];
        this.currentBatch = null;
        this.loadingElement = null;
        this.containerElement = null;
        this.keysListElement = null;
        this.init();
    }
    
    init() {
        this.loadingElement = document.getElementById('loading');
        this.containerElement = document.getElementById('keysContainer');
        this.keysListElement = document.getElementById('keysList');
        
        // Start loading process
        this.loadKeys();
        
        // Set up periodic refresh (every 6 hours)
        setInterval(() => {
            this.refreshKeys();
        }, 6 * 60 * 60 * 1000);
    }
    
    async loadKeys() {
        try {
            this.showLoading();
            
            // Simulate realistic loading time
            await this.sleep(2000);
            
            // Try to load from API first, fallback to client-side generation
            let keysData;
            try {
                const response = await fetch('/api/keys');
                if (response.ok) {
                    const apiData = await response.json();
                    keysData = apiData.data;
                    console.log('Keys loaded from API');
                } else {
                    throw new Error('API failed');
                }
            } catch (error) {
                console.log('API unavailable, generating client-side keys');
                keysData = this.generateClientKeys();
            }
            
            this.keys = [...keysData.keys_12h, ...keysData.keys_24h];
            this.currentBatch = keysData.batch_id;
            
            this.displayKeys();
            this.hideLoading();
            
        } catch (error) {
            console.error('Failed to load keys:', error);
            this.showError('Failed to load keys. Please refresh the page.');
        }
    }
    
    generateClientKeys() {
        const prefixes = ['BC', 'RV', 'PM', 'EL', 'VP', 'XZ'];
        const hexChars = '0123456789ABCDEF';
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        const randomHex = (length) => {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += hexChars[Math.floor(Math.random() * hexChars.length)];
            }
            return result;
        };
        
        const randomBase64 = (length) => {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += base64Chars[Math.floor(Math.random() * base64Chars.length)];
            }
            return result;
        };
        
        const generateHashKey = (type) => {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const timestamp = Date.now().toString(16).toUpperCase().slice(-8);
            
            const formats = [
                () => `${prefix}-${randomHex(12)}-${timestamp}:${type}`,
                () => `${prefix}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(8)}:${type}`,
                () => `${prefix}_${randomBase64(16)}:${type}`,
                () => `${prefix}.${randomHex(8)}.${randomBase64(8)}.${timestamp.slice(-4)}:${type}`,
                () => `${prefix}${randomHex(6)}${randomBase64(6)}${timestamp.slice(-4)}:${type}`
            ];
            
            return formats[Math.floor(Math.random() * formats.length)]();
        };
        
        const keysData = {
            keys_12h: [],
            keys_24h: [],
            batch_id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            generated_at: new Date().toISOString()
        };
        
        // Generate 3 x 12h keys
        for (let i = 0; i < 3; i++) {
            keysData.keys_12h.push({
                key: generateHashKey('12H'),
                duration: '12 Hour Access',
                type: 'FREE_12H'
            });
        }
        
        // Generate 3 x 24h keys
        for (let i = 0; i < 3; i++) {
            keysData.keys_24h.push({
                key: generateHashKey('24H'),
                duration: '24 Hour Access',
                type: 'FREE_24H'
            });
        }
        
        return keysData;
    }
    
    displayKeys() {
        if (!this.keysListElement) return;
        
        let keysHTML = '';
        
        this.keys.forEach((keyData, index) => {
            const keyClass = keyData.type === 'FREE_12H' ? 'key-12h' : 'key-24h';
            const securityIcon = keyData.type === 'FREE_12H' ? '🔒' : '🛡️';
            
            keysHTML += `
                <div class="key-item ${keyClass}" onclick="keySystem.copyKey('${keyData.key}')" data-key="${keyData.key}">
                    <div class="key-text">${securityIcon} ${keyData.key}</div>
                    <div class="key-type">${keyData.duration}</div>
                </div>
            `;
        });
        
        this.keysListElement.innerHTML = keysHTML;
        
        // Add copy buttons animation
        this.addKeyAnimations();
    }
    
    addKeyAnimations() {
        const keyItems = document.querySelectorAll('.key-item');
        keyItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'slideInUp 0.6s ease forwards';
        });
        
        // Add CSS animation if not exists
        if (!document.querySelector('#keyAnimations')) {
            const style = document.createElement('style');
            style.id = 'keyAnimations';
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    copyKey(keyText) {
        navigator.clipboard.writeText(keyText).then(() => {
            this.handleSuccessfulCopy(keyText);
            this.showNotification('🎉 Hash Key Copied!', 'Return to Roblox and paste it in BUNCHEATS key system.');
        }).catch(() => {
            // Fallback for older browsers
            this.fallbackCopy(keyText);
            this.handleSuccessfulCopy(keyText);
            this.showNotification('✅ Hash Key Copied!', keyText);
        });
    }
    
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    
    handleSuccessfulCopy(keyText) {
        const keyElements = document.querySelectorAll('.key-item');
        keyElements.forEach(elem => {
            if (elem.getAttribute('data-key') === keyText) {
                elem.classList.add('copied');
                const keyTextElem = elem.querySelector('.key-text');
                const keyTypeElem = elem.querySelector('.key-type');
                const originalText = keyTextElem.textContent;
                const originalType = keyTypeElem.textContent;
                
                keyTextElem.textContent = '✅ COPIED TO CLIPBOARD!';
                keyTypeElem.textContent = 'Return to Roblox now!';
                
                setTimeout(() => {
                    elem.classList.remove('copied');
                    keyTextElem.textContent = originalText;
                    keyTypeElem.textContent = originalType;
                }, 3000);
            }
        });
    }
    
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.add('active');
        }
        if (this.containerElement) {
            this.containerElement.style.display = 'none';
        }
    }
    
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.remove('active');
        }
        if (this.containerElement) {
            this.containerElement.style.display = 'block';
            this.containerElement.style.animation = 'fadeInUp 0.8s ease';
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `❌ ${message}`;
        
        if (this.containerElement) {
            this.containerElement.insertBefore(errorDiv, this.containerElement.firstChild);
        }
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: 'Segoe UI', sans-serif;
            animation: slideIn 0.5s ease;
            backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">${title}</div>
            <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    
    async refreshKeys() {
        console.log('Refreshing keys...');
        await this.loadKeys();
        this.showNotification('🔄 Keys Refreshed!', 'New secure hash keys have been generated.');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick handlers
function contactDiscord() {
    const username = 'xonzxd';
    const message = `Hi @${username}, I want to purchase BUNCHEATS premium keys!`;
    
    navigator.clipboard.writeText(`@${username}`).then(() => {
        keySystem.showNotification('💬 Discord Info Copied!', `Username: @${username}\n\nMessage them about premium keys!`);
    }).catch(() => {
        keySystem.showNotification('💬 Contact Information', `Discord: @${username}\n\nSend them a message about premium keys!`);
    });
}

// Initialize when DOM is loaded
let keySystem;
document.addEventListener('DOMContentLoaded', function() {
    keySystem = new BuncheatsKeySystem();
    
    // Add notification animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuncheatsKeySystem;
}
