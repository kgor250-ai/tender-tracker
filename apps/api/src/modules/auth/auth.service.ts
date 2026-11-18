import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + '_salt_demo').digest('hex');
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_UNAUTHORIZED',
        message: 'Invalid email or password.',
      });
    }

    const hashedInput = this.hashPassword(passwordPlain);
    if (user.passwordHash !== hashedInput) {
      throw new UnauthorizedException({
        code: 'AUTH_UNAUTHORIZED',
        message: 'Invalid email or password.',
      });
    }

    const roleNames = user.roles.map((r) => r.role.name);
    const payload = { sub: user.id, email: user.email, roles: roleNames };
    const accessToken = this.jwtService.sign(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: roleNames,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    };
  }

  async register(email: string, passwordPlain: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_RESOURCE',
        message: 'An account with this email address already exists.',
      });
    }

    let defaultRole = await this.prisma.role.findUnique({
      where: { name: 'REGISTERED_USER' as any },
    });

    if (!defaultRole) {
      defaultRole = await this.prisma.role.create({
        data: {
          name: 'REGISTERED_USER' as any,
          description: 'Standard public user account',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash: this.hashPassword(passwordPlain),
        roles: {
          create: { roleId: defaultRole.id },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    const roleNames = user.roles.map((r) => r.role.name);
    const payload = { sub: user.id, email: user.email, roles: roleNames };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: roleNames,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    };
  }
}

