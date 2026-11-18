import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit mutating operations (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const user = req.user;
          const resourceType = req.baseUrl?.split('/').pop() || 'Resource';
          const resourceId = data?.id || req.params?.id || crypto.randomUUID();

          await this.prisma.auditLog.create({
            data: {
              actorType: user ? 'USER' : 'SYSTEM_AGENT',
              actorId: user?.id || null,
              action: `${method}_${resourceType.toUpperCase()}`,
              resourceType,
              resourceId,
              beforeJson: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
              afterJson: data ? JSON.parse(JSON.stringify(data)) : null,
              ipHash,
            },
          });
        } catch (err) {
          // Failure to write audit should not crash the primary transaction, but should log
          console.error('AuditInterceptor error:', err);
        }
      })
    );
  }
}

