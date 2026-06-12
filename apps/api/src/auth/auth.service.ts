import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'super-secret-techgram-jwt-token-key-2026';

  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, fullName: string, passwordHash: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
        preferences: {
          create: {
            founderModeEnabled: false,
          },
        },
      },
      include: {
        preferences: true,
      },
    });

    const token = this.generateJwt({ id: user.id, email: user.email, name: user.fullName });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
      },
    };
  }

  async login(email: string, passwordHash: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const token = this.generateJwt({ id: user.id, email: user.email, name: user.fullName });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      tier: user.tier,
      preferences: user.preferences,
    };
  }

  // Native crypto based JWT Generator
  private generateJwt(payload: any): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    })).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${encodedPayload}`)
      .digest('base64url');

    return `${header}.${encodedPayload}.${signature}`;
  }

  // Native crypto based JWT Verifier
  verifyJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const verifiedSignature = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== verifiedSignature) return null;

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }

      return decodedPayload;
    } catch {
      return null;
    }
  }
}
