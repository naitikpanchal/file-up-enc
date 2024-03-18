import { defineEventHandler, createError } from 'h3';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        console.log("event", event);
        const { fileId } = JSON.parse(event.body); // Parse the fileId from the event body

        // Query the file data from the database using Prisma
        const file = await prisma.file.findUnique({
            where: { id: parseInt(fileId) }, // Parse fileId to ensure it's a number
        });

        if (!file) {
            throw new Error('File not found');
        }
        else {
            console.log("file found");
        }
        // Define the file path to store the file in the "uploads" folder
        const filePath = path.join(__dirname, 'uploads', file.name);

        console.log("filePath", filePath);
        // Convert the blob data to a Buffer
        // const fileData = Buffer.from(file.fileData, 'base64'); // Decode base64 encoded data

        // Write the Buffer data to a file
        fs.writeFileSync(filePath, fileData);

        console.log(`File "${file.name}" retrieved and saved successfully`);

        return 'File retrieved successfully';
    } catch (error) {
        console.error('Error:', error);
        // Respond with error message
        return createError({
            statusCode: 500,
            data: 'An error occurred while retrieving file',
        });
    }
});


// import fs from 'fs';
// import path from 'path';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Function to retrieve blob data from the database using file ID
// async function retrieveBlobDataById(fileId) {
//   try {
//     // Query the file data from the database using Prisma
//     const file = await prisma.file.findUnique({
//       where: { id: parseInt(fileId) }, // Parse fileId to ensure it's a number
//     });

//     if (!file) {
//       throw new Error('File not found');
//     }

//     // Define the file path to store the file in the "uploads" folder
//     const filePath = path.join(__dirname, 'uploads', file.name);

//     // Convert the blob data to a Buffer
//     const fileData = Buffer.from(file.fileData, 'base64'); // Decode base64 encoded data

//     // Write the Buffer data to a file
//     fs.writeFileSync(filePath, fileData);

//     console.log(`File "${file.name}" retrieved and saved successfully`);
//   } catch (error) {
//     console.error('Error retrieving file:', error);
//   }
// }

// // Export the function to be used in the API endpoint
// export default async function getData(event) {
//   try {
//     // Parse request body to get fileId value from the form
//     const { fileId } = JSON.parse(event.body);

//     // Retrieve file data using fileId
//     await retrieveBlobDataById(fileId);

//     // Respond with success message or any data as needed
//     return 'File retrieved successfully';
//   } catch (error) {
//     console.error('Error:', error);
//     // Respond with error message
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'An error occurred while retrieving file' }),
//     };
//   }
// }
