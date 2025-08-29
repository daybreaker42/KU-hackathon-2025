import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucketName: string;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('AWS credentials or S3 bucket name not provided in environment variables');
    }

    this.bucketName = bucketName;
    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
      region: process.env.AWS_REGION || 'ap-northeast-2',
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'plants'): Promise<string> {
    const key = `${folder}/${uuid()}-${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const key = imageUrl.split('/').slice(-2).join('/'); // Extract key from URL

    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      throw new Error(`이미지 삭제에 실패했습니다: ${error.message}`);
    }
  }
}
