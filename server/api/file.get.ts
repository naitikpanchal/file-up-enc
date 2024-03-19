// import { defineEventHandler, createError } from 'h3';
import path from 'path';
import fs from 'fs/promises'; // Using fs promises API for asynchronous file operations
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

let key = "Naitik";
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);
key = crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32);

const decrypt = (encrypted: any) => {
    const iv = encrypted.slice(0, 16);
    encrypted = encrypted.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted;
}

export default defineEventHandler(async (event) => {
    try {
        // Extract fileId from the query parameters
        const fileId = (event._path as string).split('=')[1];
        const downloadedFilePaths: string[] = [];
        const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];

        // Query the file data from the database using Prisma
        const file = await prisma.file.findUnique({
            where: { id: parseInt(fileId) },
        });

        if (!file) {
            throw new Error('File not found');
        }

        // Define the default filename "document" with the extension from the original filename
        const extension = path.extname(file.name);
        const defaultFileName = `document${extension}`;

        // Define the file path with the default filename
        const filePath = path.join('public', defaultFileName);

        // Decrypt file data
        const decryptedFile = decrypt(file.fileData);
        console.log("FilePArthj "+filePath.toString());
        // Write decrypted file data to the file
        await fs.writeFile(filePath, decryptedFile);

        return {
            body: defaultFileName,
            headers: {
                'Content-Type': 'text/plain',
            },
        };
    } catch (error) {
        console.error('Error:', error);
        return createError({
            statusCode: 500,
            data: 'An error occurred while retrieving file',
        });
    } finally {
        await prisma.$disconnect();
    }
});


// // import { defineEventHandler, createError } from 'h3';
// import path from 'path';
// import fs from 'fs/promises'; // Using fs promises API for asynchronous file operations
// import { PrismaClient } from '@prisma/client';
// import crypto from 'crypto';

// const prisma = new PrismaClient();

// let key = "Naitik";
// const algorithm = "aes-256-cbc";
// const iv = crypto.randomBytes(16);
// key = crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32);
// let file, fileReadData: Buffer;
// const decrypt = (encrypted: any) => {
//     const iv = encrypted.slice(0, 16);
//     encrypted = encrypted.slice(16);
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
//     const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//     return decrypted;
// }

// export default defineEventHandler(async (event) => {
//     try {
//         // Extract fileId from the query parameters
//         const fileId = (event._path as string).split('=')[1];
//         const downloadedFilePaths: string[] = [];
//         const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];
//         const isFileImage = { value: false };
//         // Query the file data from the database using Prisma
//         const file = await prisma.file.findUnique({
//             where: { id: parseInt(fileId) },
//         });

//         if (!file) {
//             throw new Error('File not found');
//         }

//         // Define the file path0
//         // const filePath = path.join(process.cwd(), 'public', file.name as string);
//         const filePath = path.join('public', file.name as string);
//         const extension = filePath.toLowerCase().substring(filePath.lastIndexOf("."));
//         isFileImage.value = imageExtensions.includes(extension);
//         console.log("filePath");
//         console.log(filePath.toString());
//         // Decrypt file data
//         const decryptedFile = decrypt(file.fileData);
//         downloadedFilePaths.push(file.name as string);
//         // Write decrypted file data to the file
//         await fs.writeFile(filePath, decryptedFile);

//         // Read the file asynchronously
//         // const fileReadData = await fs.readFile(filePath);
//         // console.log("Downloaded FOle Path");
//         // console.log(downloadedFilePaths);
//         return {
//             body: file.name,
//             headers: {
//                 'Content-Type': 'text/plain',
//             },
//         };
//         // return filePath;
//     } catch (error) {
//         console.error('Error:', error);
//         return createError({
//             statusCode: 500,
//             data: 'An error occurred while retrieving file',
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// });