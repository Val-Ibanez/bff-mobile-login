import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklistedTokens = new Set<string>();

  /**
   * Agregar token a la blacklist
   * @param token - Token JWT a blacklistear
   * @param reason - Razón del blacklist
   */
  addToBlacklist(token: string, reason: string) {
    this.blacklistedTokens.add(token);
    this.logger.warn(`Token blacklisted: ${reason}`);
  }

  /**
   * Verificar si un token está en la blacklist
   * @param token - Token JWT a verificar
   * @returns true si está blacklisteado
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remover token de la blacklist
   * @param token - Token JWT a remover
   */
  removeFromBlacklist(token: string) {
    this.blacklistedTokens.delete(token);
    this.logger.log(`Token removed from blacklist`);
  }

  /**
   * Obtener tamaño de la blacklist
   * @returns Número de tokens blacklisteados
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }

  /**
   * Limpiar blacklist (útil para testing)
   */
  clearBlacklist() {
    this.blacklistedTokens.clear();
    this.logger.log('Blacklist cleared');
  }

  /**
   * Obtener estadísticas de la blacklist
   */
  getBlacklistStats() {
    return {
      size: this.blacklistedTokens.size,
      tokens: Array.from(this.blacklistedTokens).slice(0, 10), // Solo primeros 10 para privacidad
    };
  }
}
