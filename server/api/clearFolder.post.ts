// api/clear-public-folder.ts

import fs from 'fs';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async () => {
  try {
    // Define the path to the public folder
    const publicFolderPath = 'public'; // Adjust this path as needed

    // Get the list of files in the public folder
    const files = fs.readdirSync(publicFolderPath);

    // Iterate over the files and delete them
    for (const file of files) {
      const filePath = `${publicFolderPath}/${file}`;
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    return {
      statusCode: 200,
      data: 'Public folder cleared successfully',
    };
  } catch (error) {
    console.error('Error clearing public folder:', error);
    return createError({
      statusCode: 500,
      data: 'An error occurred while clearing the public folder',
    });
  }
});
