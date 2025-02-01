import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
})

export const uploadImageToS3 = async albumImage => {
  const params = {
    Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
    Key: `${Date.now()}_${albumImage.name}`,
    Body: albumImage
  }

  try {
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    return `https://${params.Bucket}.s3.${
      import.meta.env.VITE_AWS_REGION
    }.amazonaws.com/${params.Key}`
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}
