import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // R2 public access URL, e.g., https://pub-xxx.r2.dev

function ensureR2Config() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error("Missing R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL environment variables.");
  }
}

function createR2Client() {
  ensureR2Config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!
    }
  });
}


export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  ensureR2Config();
  const client = createR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );

  const publicUrl = R2_PUBLIC_URL!.endsWith("/") ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
  return `${publicUrl}${key}`;
}


export async function deleteFromR2(key: string): Promise<void> {
  ensureR2Config();
  const client = createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key
    })
  );
}


export async function* listR2Objects(prefix?: string) {
  ensureR2Config();
  const client = createR2Client();
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME!,
      Prefix: prefix,
      ContinuationToken: continuationToken
    });

    const response = await client.send(command);

    if (response.Contents) {
      yield response.Contents.map((item) => ({
        key: item.Key!,
        lastModified: item.LastModified!,
        size: item.Size || 0
      }));
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
}
