/**
 * Firebase Error Handling Tests
 * Tests error parsing and user-friendly messages
 */

import { describe, it, expect } from '@jest/globals';

/**
 * Helper functions - copied from firebase service
 */
const handleFirestoreError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const fbError = error as { code: string; message?: string };
    const errorMap: Record<string, string> = {
      'permission-denied': 'Você não tem permissão para acessar isso.',
      'not-found': 'Documento não encontrado.',
      'already-exists': 'Este documento já existe.',
      'resource-exhausted': 'Limite de requisições excedido.',
      'failed-precondition': 'Pré-condição falhou.',
      'unavailable': 'Serviço indisponível no momento.',
      'internal': 'Erro interno do servidor.',
      'unauthenticated': 'Você precisa estar autenticado.',
    };
    return errorMap[fbError.code] || fbError.message || 'Erro ao acessar dados';
  }
  return error instanceof Error ? error.message : 'Erro desconhecido';
};

const handleAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const authError = error as { code: string; message?: string };
    const errorMap: Record<string, string> = {
      'auth/popup-blocked': 'Pop-up foi bloqueado. Permita pop-ups no navegador.',
      'auth/popup-closed-by-user': 'Pop-up foi fechado.',
      'auth/cancelled-popup-request': 'Autenticação foi cancelada.',
      'auth/operation-not-allowed': 'Operação não permitida.',
      'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
      'auth/account-exists-with-different-credential': 'Conta já existe com outro provedor.',
      'auth/invalid-email': 'Email inválido.',
      'auth/user-disabled': 'Usuário desabilitado.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    return errorMap[authError.code] || authError.message || 'Erro na autenticação';
  }
  return error instanceof Error ? error.message : 'Erro desconhecido';
};

describe('Firebase Error Handling', () => {
  describe('handleFirestoreError', () => {
    it('should translate permission-denied errors', () => {
      const result = handleFirestoreError({ code: 'permission-denied' });
      expect(result).toBe('Você não tem permissão para acessar isso.');
    });

    it('should translate not-found errors', () => {
      const result = handleFirestoreError({ code: 'not-found' });
      expect(result).toBe('Documento não encontrado.');
    });

    it('should translate unavailable errors', () => {
      const result = handleFirestoreError({ code: 'unavailable' });
      expect(result).toBe('Serviço indisponível no momento.');
    });

    it('should handle Error instances', () => {
      const error = new Error('Custom error message');
      const result = handleFirestoreError(error);
      expect(result).toBe('Custom error message');
    });

    it('should handle unknown errors', () => {
      const result = handleFirestoreError('string error');
      expect(result).toBe('Erro desconhecido');
    });

    it('should use custom message if code not found', () => {
      const result = handleFirestoreError({
        code: 'unknown-code',
        message: 'Custom message',
      });
      expect(result).toBe('Custom message');
    });
  });

  describe('handleAuthError', () => {
    it('should translate auth/popup-blocked errors', () => {
      const result = handleAuthError({ code: 'auth/popup-blocked' });
      expect(result).toBe('Pop-up foi bloqueado. Permita pop-ups no navegador.');
    });

    it('should translate auth/invalid-email errors', () => {
      const result = handleAuthError({ code: 'auth/invalid-email' });
      expect(result).toBe('Email inválido.');
    });

    it('should translate auth/wrong-password errors', () => {
      const result = handleAuthError({ code: 'auth/wrong-password' });
      expect(result).toBe('Senha incorreta.');
    });

    it('should translate auth/too-many-requests errors', () => {
      const result = handleAuthError({ code: 'auth/too-many-requests' });
      expect(result).toBe('Muitas tentativas. Tente novamente mais tarde.');
    });

    it('should handle network errors', () => {
      const result = handleAuthError({ code: 'auth/network-request-failed' });
      expect(result).toBe('Erro de rede. Verifique sua conexão.');
    });

    it('should translate all common auth errors', () => {
      const commonErrors = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/operation-not-allowed',
        'auth/account-exists-with-different-credential',
        'auth/user-disabled',
        'auth/user-not-found',
      ];

      commonErrors.forEach(errorCode => {
        const result = handleAuthError({ code: errorCode });
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should return generic message for unknown auth codes', () => {
      const result = handleAuthError({ code: 'auth/unknown-error' });
      expect(result).toBe('Erro na autenticação');
    });
  });

  describe('Error consistency', () => {
    it('should provide user-friendly messages', () => {
      const firestoreError = handleFirestoreError({ code: 'unavailable' });
      const authError = handleAuthError({ code: 'auth/network-request-failed' });

      expect(firestoreError).toContain('Serviço');
      expect(authError).toContain('Erro de rede');
    });

    it('should never return undefined', () => {
      expect(handleFirestoreError(undefined)).toBeDefined();
      expect(handleAuthError(undefined)).toBeDefined();
      expect(handleFirestoreError(null)).toBeDefined();
      expect(handleAuthError(null)).toBeDefined();
    });

    it('should always return strings', () => {
      const errors = [
        handleFirestoreError({ code: 'unavailable' }),
        handleAuthError({ code: 'auth/invalid-email' }),
        handleFirestoreError(new Error('test')),
        handleAuthError(new Error('test')),
      ];

      errors.forEach(error => {
        expect(typeof error).toBe('string');
      });
    });
  });
});
