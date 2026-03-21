import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'E5k9L2pQ8vX4nJ6mR1wT7yU3iO0zA2sD4fG5hH8jK9lZ1xC3vB5nM7qW9eR0tY2u';
const ENCRYPTION_DISABLED = process.env.NEXT_PUBLIC_ENCRYPTION_DISABLED === 'true';

export const encrypt = (data: any): string => {
    if (!data) return '';

    // Skip encryption if disabled
    if (ENCRYPTION_DISABLED) {
        console.log('🔓 Encryption disabled - returning plaintext');
        return typeof data === 'object' ? JSON.stringify(data) : String(data);
    }

    try {
        const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return '';
    }
};

export const decrypt = (ciphertext: string): any => {
    if (!ciphertext) return null;

    // Skip decryption if disabled
    if (ENCRYPTION_DISABLED) {
        console.log('🔓 Decryption disabled - returning as-is');
        try {
            return JSON.parse(ciphertext);
        } catch {
            return ciphertext;
        }
    }

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return ciphertext;

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};
