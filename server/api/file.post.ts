import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient()

let key = "Naitik";
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);
key = crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32);

const encrypt = async (buffer: Buffer | crypto.BinaryLike) => {
    const cipher =  crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return encrypted;
}

// const decrypt = (encrypted) => {
//     const iv = encrypted.slice(0, 16);
//     encrypted = encrypted.slice(16);
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
//     const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//     return decrypted;
// }

export default defineEventHandler(async (event) => {
    try {
        const files = await readMultipartFormData(event);
        if(!files){
            return createError({
                statusCode: 404,
                data: "File is invalid"
            })
        }
        if (!Array.isArray(files)) {
            throw new Error("Files must be an array");
        }
        const uploadedFilePaths: string[] = [];
        const fileDataArray : string[] = [];
        files.forEach(async (file) => {
            const encryptedData = await encrypt(file.data);
            // const filePath = path.join(process.cwd(), 'public', file.filename as string);
            const filePath = path.join('public', file.filename as string);
            
            // fs.writeFileSync(filePath, encryptedData);
            // const fileData = file.data.toString('base64');
            fs.writeFileSync(filePath, file.data);
            uploadedFilePaths.push(file.filename as string);
            const data = await prisma.file.create({
                data: {
                    name: file.filename as string,
                    fileData:  Buffer.from(encryptedData, 'base64'),
                    // fileData:  Buffer.from(file.data, 'base64'),
                    // fileData: fileData,
                    // updatedAt: new Date(),
                }
            })
            console.log("File uploaded successfully");
            console.log("uploadedFilePaths");
            console.log(uploadedFilePaths);
            // fileDataArray.push(fileData);
        })
        // console.log("File data array"+  fileDataArray[0].slice(0, 50));
        return uploadedFilePaths;
    } catch(error){
        return createError(
            {
                statusCode: 500,
                data:"Something went wrong with server"
            }
        )
    }
})