// Vercel Blob storage helper — replaces the old Supabase Storage buckets
// ("visuals", "content-images", "feedback-screenshots"). Files are stored under
// a folder prefix per former bucket so paths stay organized.
import { put, del, list, type PutBlobResult } from "@vercel/blob";

type PutBody = Parameters<typeof put>[1];

/**
 * Upload a file/buffer to Vercel Blob and return its public URL.
 * @param folder  logical folder prefix (former bucket name)
 * @param filename file name within the folder
 * @param data    file contents
 * @param contentType MIME type
 */
export async function uploadBlob(
  folder: string,
  filename: string,
  data: PutBody,
  contentType?: string,
): Promise<PutBlobResult> {
  return put(`${folder}/${filename}`, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
}

export { del as deleteBlob, list as listBlobs };
