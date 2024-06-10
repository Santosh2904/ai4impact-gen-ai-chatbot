// Import necessary modules from AWS SDK for S3 interaction
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const URL_EXPIRATION_SECONDS = 300;

// Main Lambda entry point
export const handler = async (event) => {
  return await getUploadURL(event); // Call the helper function
};

// Helper function to generate a presigned upload URL for S3
const getUploadURL = async function (event) {
  const body = JSON.parse(event.body); // Parse the incoming request body
  const fileName = body.fileName; // Retrieve the file name
  const folderPath = body.folderPath || ''; // Retrieve the folder path // <-- Added this line
  const fileType = body.fileType; // Retrieve the file type

  const s3Params = { // Parameters for S3 PutObjectCommand
    Bucket: process.env.BUCKET, // S3 bucket name for environment
    Key: `${folderPath}${fileName}`, // S3 object key (folder path + filename) // <-- Modified this line
    ContentType: fileType, // MIME type of the file
  };

  const s3 = new S3Client({ region: 'us-east-1' }); // Initialize S3 client
  const command = new PutObjectCommand(s3Params); // Create PutObjectCommand with given params

  try {
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRATION_SECONDS, // Set URL expiration time
    });
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ signedUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to generate signed URL' }),
    };
  }
};
