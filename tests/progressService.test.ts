import { describe, expect, it } from 'vitest';
import { ProgressService } from '../src/core/progressService';

describe('ProgressService - Códigos de 6 Dígitos y Roles', () => {
  it('genera códigos únicos de 6 dígitos para perfiles', () => {
    const service = new ProgressService();
    const profiles = [
      { id: '1', name: 'Ana', accessCode: '123456', avatar: '🐰', ageGroup: 'inicial' as const, createdAt: 1 },
    ];
    const code = service.generateUniqueCode(profiles);
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
    expect(code).not.toBe('123456');
  });

  it('valida contraseña de administrador', async () => {
    const service = new ProgressService();
    const valid = await service.verifyAdminPassword('admin');
    expect(valid).toBe(true);

    const validAlt = await service.verifyAdminPassword('admin123');
    expect(validAlt).toBe(true);

    const invalid = await service.verifyAdminPassword('wrongpass');
    expect(invalid).toBe(false);
  });
});
