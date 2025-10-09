import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET!;

export const encryptData = (text: string): string => {
  try {
    // Generate random IV for each encryption
    const iv = CryptoJS.lib.WordArray.random(16);

    // Encrypt using AES in CBC mode
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    // Combine IV and ciphertext for storage
    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = (encryptedText: string): string => {
  try {
    // Parse the combined data
    const combined = CryptoJS.enc.Base64.parse(encryptedText);

    // Extract IV and ciphertext
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4), combined.sigBytes - 16);

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext }),
      SECRET_KEY,
      {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};
