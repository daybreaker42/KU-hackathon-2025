import { ApiProperty } from '@nestjs/swagger';

export class MultipleImageUploadResponseDto {
  @ApiProperty({
    description: '업로드된 이미지 URL 배열',
    type: [String],
    example: [
      'https://bucket-name.s3.amazonaws.com/plants/uuid-filename1.jpg',
      'https://bucket-name.s3.amazonaws.com/plants/uuid-filename2.jpg',
    ],
  })
  imageUrls: string[];
}

export class ImageDeleteRequestDto {
  @ApiProperty({
    description: '삭제할 이미지 URL',
    example: 'https://bucket-name.s3.amazonaws.com/plants/uuid-filename.jpg',
  })
  imageUrl: string;
}
