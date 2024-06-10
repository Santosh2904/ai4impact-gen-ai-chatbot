import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  const s3Client = new S3Client();
  const { continuationToken, prefix } = event; // Added prefix parameter
  const s3Bucket = process.env.BUCKET;
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: prefix || '', // Use prefix to handle folder structures
      ContinuationToken: continuationToken,
    });

    const result = await s3Client.send(command);
    
    const files = result.Contents.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    }));

    // Build a hierarchical structure from the result
    const folders = {};
    files.forEach(file => {
      const parts = file.key.split('/');
      let currentLevel = folders;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = index === parts.length - 1 ? file : {};
        }
        currentLevel = currentLevel[part];
      });
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ folders }), // Return folders instead of flat file list
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Get S3 Bucket data failed - Internal Server Error' }),
    };
  }
};
