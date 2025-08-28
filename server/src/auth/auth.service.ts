import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const { name, email, password } = createUserDto;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // 사용자 생성
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // JWT 토큰 생성
      const payload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('사용자 생성에 실패했습니다.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // JWT 토큰 생성
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_img || '',
      },
    };
  }

  async validateUser(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
  }
}
