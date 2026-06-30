import { CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '@/lib/r2/admin'

interface UploadResponse {
  success: boolean
  key: string
  url: string
}

export async function uploadFileToR2(file: File, folder: string = 'articles'): Promise<UploadResponse> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
    const fileKey = `${folder}/${uniqueFileName}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const r2Url = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    return {
      success: true,
      key: fileKey, 
      url: `${r2Url}/${fileKey}`
    }
  } catch (error) {
    console.error('R2 Upload Error:', error)
    throw new Error('Failed to upload file to Cloudflare R2')
  }
}

export async function getStorageTree(prefix: string = '') {
  try {
    const cleanPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Prefix: cleanPrefix,
      Delimiter: '/',
    })

    const response = await s3Client.send(command)

    const subFolders = response.CommonPrefixes?.map((p) => {
      const fullPath = p.Prefix || ''
      const parts = fullPath.replace(cleanPrefix, '').split('/')
      return {
        name: parts[0],
        path: fullPath
      }
    }).filter(f => f.name !== '') || []

    const files = response.Contents
      ?.filter((file) => file.Key !== cleanPrefix)
      .map((file) => {
        const key = file.Key || ''
        const ext = key.split('.').pop()?.toLowerCase() || ''
        
        let type = 'file'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) type = 'image'
        if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) type = 'video'

        const r2Url = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
        return {
          key,
          name: key.split('/').pop() || '',
          size: file.Size || 0,
          lastModified: file.LastModified,
          type,
          url: `${r2Url}/${key}`
        }
      }) || []

    return { subFolders, files }
  } catch (error) {
    console.error('R2 List Tree Error:', error)
    throw new Error('Failed to fetch storage data')
  }
}

export async function deleteFileFromR2(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: key,
    })

    await s3Client.send(command)
    return { success: true, message: 'File deleted successfully' }
  } catch (error) {
    console.error('R2 Delete Error:', error)
    throw new Error('Failed to delete file from Cloudflare R2')
  }
}

export async function copyFileInR2(fromKey: string, toKey: string) {
  const command = new CopyObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    CopySource: `${process.env.R2_BUCKET_NAME}/${fromKey}`,
    Key: toKey
  })

  await s3Client.send(command)
  return { success: true, fromKey, toKey }
}

export async function moveFileInR2(fromKey: string, toKey: string) {
  await copyFileInR2(fromKey, toKey)
  await deleteFileFromR2(fromKey)
  return { success: true, fromKey, toKey }
}

export async function createFolderInR2(folderName: string, parentPrefix: string = ''): Promise<{ success: boolean; key: string }> {
  try {
    const cleanParent = parentPrefix && !parentPrefix.endsWith('/') ? `${parentPrefix}/` : parentPrefix;
    const folderKey = `${cleanParent}${folderName}/`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: folderKey,
      Body: '',
    });

    await s3Client.send(command);

    return {
      success: true,
      key: folderKey
    };
  } catch (error) {
    console.error('R2 Create Folder Error:', error);
    throw new Error('Failed to create folder on Cloudflare R2');
  }
}
