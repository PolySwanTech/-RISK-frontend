export interface UploadedFile {
  id: string;
  filename: string;
  objectKey: string;
  contentType: string;
  size: number;
  etag: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  isNew?: boolean;
}
