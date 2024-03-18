import crypto from 'crypto';

const files = ref<FileList | null>(null);
const uploadedFilePaths = ref<string[] | null>(null);
const uploadedFiles = ref<{ filename: string, data: ArrayBuffer }[] | null>(null);

const algorithm = 'aes-256-cbc';
let key = process.env.ENC_KEY; // Use your encryption key here
key = crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32);

const decrypt = (encryptedBuffer: ArrayBuffer, iv: Uint8Array): ArrayBuffer => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted
}
async function decryptFiles() {
    if (uploadedFiles.value) {
        const decryptedFiles:any[] = [];
        uploadedFiles.value.forEach(async (file) => {
            const encryptedBuffer = Buffer.from(file.data);
            const iv = encryptedBuffer.slice(0, 16);
            const decryptedBuffer = decrypt(encryptedBuffer.slice(16), iv);
            decryptedFiles.push({
                filename: file.filename,
                data: decryptedBuffer
            });
        });
        uploadedFiles.value = decryptedFiles;
    }
}