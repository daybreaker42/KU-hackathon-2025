import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from '../external-api/s3.service';

@Injectable()
export class ImageService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadSingleImage(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    this.validateImageFile(file);
    return await this.s3Service.uploadImage(file, folder);
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'plants',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    if (files.length > 10) {
      throw new BadRequestException('한 번에 최대 10개의 이미지만 업로드할 수 있습니다.');
    }

    // 모든 파일 유효성 검사
    files.forEach((file) => this.validateImageFile(file));

    // 병렬로 업로드
    const uploadPromises = files.map((file) => this.s3Service.uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      throw new BadRequestException('이미지 URL이 필요합니다.');
    }

    return await this.s3Service.deleteImage(imageUrl);
  }

  private validateImageFile(file: Express.Multer.File): void {
    // 파일 크기 검사 (50MB 제한)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('이미지 파일 크기는 50MB를 초과할 수 없습니다.');
    }

    // 파일 타입 검사
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원되는 이미지 형식: JPEG, JPG, PNG, WebP');
    }
  }
}
