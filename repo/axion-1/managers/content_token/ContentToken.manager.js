const { secretbox, randomBytes } = require("tweetnacl");
const {
    decodeUTF8,
    encodeUTF8,
    encodeBase64,
    decodeBase64
} = require("tweetnacl-util");

module.exports = class ContentToken {
    constructor({ config }) {
        if (!config?.dotEnv?.NACL_SECRET) {
            throw new Error('NACL_SECRET is required in configuration');
        }
        // Validate the secret key format during initialization
        try {
            const keyUint8Array = decodeBase64(config.dotEnv.NACL_SECRET);
            if (keyUint8Array.length !== secretbox.keyLength) {
                throw new Error(`Key must be ${secretbox.keyLength} bytes long`);
            }
        } catch (error) {
            throw new Error('Invalid NACL_SECRET format: Must be base64 encoded');
        }
        this.nacl_secret = config.dotEnv.NACL_SECRET;
    }

    _newNonce() {
        return randomBytes(secretbox.nonceLength);
    }

    encrypt(json) {
        try {
            if (!json || typeof json !== 'object') {
                throw new Error('Data to encrypt must be a valid object');
            }

            const keyUint8Array = this._getKeyArray();
            const nonce = this._newNonce();
            const messageUint8 = this._convertMessageToUint8(json);
            const box = this._createEncryptedBox(messageUint8, nonce, keyUint8Array);
            const fullMessage = this._combineNonceAndBox(nonce, box);

            return encodeBase64(fullMessage);
        } catch (error) {
            console.error('Encryption error:', error.message);
            throw new Error(`Failed to encrypt data: ${error.message}`);
        }
    }

    decrypt(messageWithNonce) {
        try {
            if (!messageWithNonce || typeof messageWithNonce !== 'string') {
                throw new Error('Encrypted message must be a non-empty string');
            }

            const keyUint8Array = this._getKeyArray();
            const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);

            if (messageWithNonceAsUint8Array.length <= secretbox.nonceLength) {
                throw new Error('Invalid encrypted message length');
            }

            const { nonce, message } = this._extractNonceAndMessage(messageWithNonceAsUint8Array);
            const decrypted = this._decryptMessage(message, nonce, keyUint8Array);
            return this._parseDecryptedMessage(decrypted);
        } catch (error) {
            console.error('Decryption error:', error.message);
            return false;
        }
    }

    _getKeyArray() {
        try {
            const keyUint8Array = decodeBase64(this.nacl_secret);
            if (keyUint8Array.length !== secretbox.keyLength) {
                throw new Error(`Invalid key length. Expected ${secretbox.keyLength} bytes`);
            }
            return keyUint8Array;
        } catch (error) {
            throw new Error(`Invalid encryption key: ${error.message}`);
        }
    }

    _convertMessageToUint8(json) {
        try {
            const jsonString = JSON.stringify(json);
            if (!jsonString) {
                throw new Error('Failed to stringify JSON');
            }
            return decodeUTF8(jsonString);
        } catch (error) {
            throw new Error(`Failed to convert message to Uint8Array: ${error.message}`);
        }
    }

    _createEncryptedBox(message, nonce, key) {
        const box = secretbox(message, nonce, key);
        if (!box) {
            throw new Error('Encryption failed');
        }
        return box;
    }

    _combineNonceAndBox(nonce, box) {
        try {
            const fullMessage = new Uint8Array(nonce.length + box.length);
            fullMessage.set(nonce);
            fullMessage.set(box, nonce.length);
            return fullMessage;
        } catch (error) {
            throw new Error(`Failed to combine nonce and box: ${error.message}`);
        }
    }

    _extractNonceAndMessage(messageWithNonce) {
        try {
            if (messageWithNonce.length <= secretbox.nonceLength) {
                throw new Error('Message too short');
            }
            const nonce = messageWithNonce.slice(0, secretbox.nonceLength);
            const message = messageWithNonce.slice(secretbox.nonceLength);
            return { nonce, message };
        } catch (error) {
            throw new Error(`Failed to extract nonce and message: ${error.message}`);
        }
    }

    _decryptMessage(message, nonce, key) {
        const decrypted = secretbox.open(message, nonce, key);
        if (!decrypted) {
            throw new Error('Could not decrypt message');
        }
        return decrypted;
    }

    _parseDecryptedMessage(decrypted) {
        try {
            const decryptedMessage = encodeUTF8(decrypted);
            const parsed = JSON.parse(decryptedMessage);
            if (!parsed) {
                throw new Error('Parsed result is null or undefined');
            }
            return parsed;
        } catch (error) {
            throw new Error(`Failed to parse decrypted message: ${error.message}`);
        }
    }
};
