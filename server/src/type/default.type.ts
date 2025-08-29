import { ApiProperty } from '@nestjs/swagger';

export class DefaultHeader {
  @ApiProperty({
    description: '인증 jwt 토큰',
    example: 'Bearer <token>',
  })
  authorization?: string;
}

export class DefaultSuccessResponse {
  @ApiProperty({
    description: '응답 메시지',
    example: '성공',
  })
  message: string;
}

export class DefaultRequest {
  user: {
    id: number;
    email: string;
    name: string;
    // 추가적인 사용자 속성들...
  };
}
