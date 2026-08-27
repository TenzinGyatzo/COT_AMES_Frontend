/**
 * Store de Pinia para autenticación (operativo | admin_tenant | admin_sistema)
 */

import { defineStore } from 'pinia';
import type {
  ConfidentialityAgreementSection,
  LoginResponse,
  AmesRole,
  User,
} from '../types/backend';
import httpClient from '../services/http';
import { getTenants } from '../services/admin-api.service';
import {
  acceptConfidentiality,
  getConfidentialityStatus,
} from '../services/confidentiality-api.service';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  /** Tenant activo para admin_sistema (header X-Tenant-Id). Selector UI: Story 1.7. */
  activeTenantId: string | null;
  ndaStatusKnown: boolean;
  ndaRequired: boolean;
  ndaAccepted: boolean;
  ndaCurrentVersion: string;
  ndaAgreementText: string;
  ndaFooterConsent: string;
  ndaIntro: string;
  ndaSections: ConfidentialityAgreementSection[];
  ndaDeclaration: string;
}

const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_USER = 'auth_user';
const STORAGE_KEY_TENANT = 'auth_active_tenant_id';

const AMES_ROLES: AmesRole[] = [
  'operativo',
  'admin_tenant',
  'admin_sistema',
];

function isAmesRole(rol: unknown): rol is AmesRole {
  return typeof rol === 'string' && (AMES_ROLES as string[]).includes(rol);
}

/** Normaliza mensajes Nest/Axios para mostrarlos en UI. */
export function extractAuthErrorMessage(error: any): string {
  const raw = error?.response?.data?.message;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(String).join('. ');
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw;
  }
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
  }
  if (error?.response?.status === 401) {
    return 'Credenciales inválidas';
  }
  if (error?.response?.status) {
    return `Error del servidor (${error.response.status})`;
  }
  return 'No se pudo iniciar sesión. Intente de nuevo.';
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    isLoading: false,
    error: null,
    activeTenantId: null,
    ndaStatusKnown: false,
    ndaRequired: false,
    ndaAccepted: false,
    ndaCurrentVersion: '',
    ndaAgreementText: '',
    ndaFooterConsent: '',
    ndaIntro: '',
    ndaSections: [],
    ndaDeclaration: '',
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.accessToken;
    },

    currentUser(): User | null {
      return this.user;
    },

    /** Usuario autenticado con rol de producto (cualquier rol AD-11). */
    isAmesUser(): boolean {
      return isAmesRole(this.user?.rol);
    },

    isAdminSistema(): boolean {
      return this.user?.rol === 'admin_sistema';
    },

    isAdminTenant(): boolean {
      return this.user?.rol === 'admin_tenant';
    },

    /** @deprecated Prefer isAmesUser / isAdminSistema. Alias: cualquier usuario autenticado de producto. */
    isAdmin(): boolean {
      return this.isAmesUser;
    },

    showConfidentialityGate(): boolean {
      return this.ndaStatusKnown && this.ndaRequired && !this.ndaAccepted;
    },

    canLoadSensitiveData(): boolean {
      return this.isAuthenticated && this.ndaStatusKnown && this.ndaAccepted;
    },
  },

  actions: {
    setActiveTenantId(tenantId: string | null): void {
      this.activeTenantId = tenantId;
      if (tenantId) {
        localStorage.setItem(STORAGE_KEY_TENANT, tenantId);
      } else {
        localStorage.removeItem(STORAGE_KEY_TENANT);
      }
    },

    /**
     * Tras login / restore admin: asegura activeTenantId válido.
     * Revalida el persistido contra GET /tenants (existe).
     * Story 4.3 / AD-14: conserva tenant inactivo (soporte); si no hay match,
     * toma el primer tenant activo.
     * GET /tenants no exige X-Tenant-Id.
     */
    async ensureAdminTenantContext(): Promise<void> {
      if (this.user?.rol !== 'admin_sistema') {
        this.setActiveTenantId(null);
        return;
      }

      if (!this.ndaAccepted) {
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY_TENANT)?.trim() || null;

      try {
        const tenants = await getTenants();
        const known = tenants.filter((t) => t._id);

        if (stored && known.some((t) => t._id === stored)) {
          this.setActiveTenantId(stored);
          return;
        }

        const active = known.filter((t) => t.activo !== false);
        const first = active[0];
        if (first?._id) {
          this.setActiveTenantId(first._id);
        } else {
          this.setActiveTenantId(null);
        }
      } catch {
        // Smoke: listados fallarán sin header; no tumbar el login.
        // Mantener stored vía setActiveTenantId (memoria + localStorage alineados).
        this.setActiveTenantId(stored);
      }
    },

    async _handleLoginResponse(response: LoginResponse): Promise<void> {
      const user = response.user;
      if (!user || !isAmesRole(user.rol)) {
        this.logout();
        const err: any = new Error('Acceso no autorizado');
        err.response = {
          data: {
            message:
              'Solo personal autorizado puede iniciar sesión',
          },
        };
        throw err;
      }

      // Alinear tipoUsuario al rol (BE los emite iguales)
      user.tipoUsuario = user.rol;

      this.accessToken = response.access_token;
      this.user = user;

      localStorage.setItem(STORAGE_KEY_TOKEN, this.accessToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));

      await this.refreshConfidentialityStatus();
      if (this.ndaAccepted) {
        await this.ensureAdminTenantContext();
      }
    },

    async login(email: string, password: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.post<LoginResponse>('/auth/login', {
          email,
          password,
        });

        await this._handleLoginResponse(response.data);
      } catch (error: any) {
        this.error = extractAuthErrorMessage(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout(): void {
      this.accessToken = null;
      this.user = null;
      this.error = null;
      this.activeTenantId = null;
      this.resetConfidentialityState();

      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TENANT);
    },

    /**
     * Restaura sesión desde localStorage.
     * Para admin_sistema, revalida/asigna tenant antes de resolver
     * (el caller debe await antes de montar o navegar a admin).
     */
    async loadFromStorage(): Promise<void> {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEY_USER);

      if (!token || !userStr) {
        return;
      }

      try {
        const parsedUser = JSON.parse(userStr);

        const hasBasicFields =
          parsedUser &&
          typeof parsedUser._id === 'string' &&
          typeof parsedUser.email === 'string' &&
          isAmesRole(parsedUser.rol);

        if (!hasBasicFields) {
          this.logout();
          return;
        }

        parsedUser.tipoUsuario = parsedUser.rol;
        this.accessToken = token;
        this.user = parsedUser;

        if (parsedUser.rol === 'admin_sistema') {
          this.activeTenantId = localStorage.getItem(STORAGE_KEY_TENANT);
        } else {
          this.setActiveTenantId(null);
        }

        await this.refreshConfidentialityStatus();
        if (this.ndaAccepted) {
          await this.ensureAdminTenantContext();
        }
      } catch {
        this.logout();
      }
    },

    resetConfidentialityState(): void {
      this.ndaStatusKnown = false;
      this.ndaRequired = false;
      this.ndaAccepted = false;
      this.ndaCurrentVersion = '';
      this.ndaAgreementText = '';
      this.ndaFooterConsent = '';
      this.ndaIntro = '';
      this.ndaSections = [];
      this.ndaDeclaration = '';
    },

    async refreshConfidentialityStatus(): Promise<void> {
      if (!this.accessToken) {
        this.resetConfidentialityState();
        return;
      }
      try {
        const status = await getConfidentialityStatus();
        this.ndaRequired = status.required;
        this.ndaAccepted = status.accepted;
        this.ndaCurrentVersion = status.currentVersion;
        this.ndaAgreementText = status.agreementText ?? '';
        this.ndaFooterConsent = status.footerConsent ?? '';
        this.ndaIntro = status.intro ?? '';
        this.ndaSections = status.sections ?? [];
        this.ndaDeclaration = status.declaration ?? '';
        this.ndaStatusKnown = true;
      } catch {
        if (!this.ndaAccepted) {
          this.ndaRequired = true;
          this.ndaAccepted = false;
          this.ndaStatusKnown = true;
        }
      }
    },

    markConfidentialityRequired(): void {
      if (this.ndaAccepted) {
        void this.refreshConfidentialityStatus();
        return;
      }
      this.ndaRequired = true;
      this.ndaAccepted = false;
      this.ndaStatusKnown = true;
      void this.refreshConfidentialityStatus();
    },

    async acceptConfidentialityAgreement(): Promise<void> {
      await acceptConfidentiality(this.ndaCurrentVersion || undefined);
      this.ndaAccepted = true;
      this.ndaRequired = true;
      this.ndaStatusKnown = true;
      await this.refreshConfidentialityStatus();
      if (this.ndaAccepted) {
        await this.ensureAdminTenantContext();
      }
    },
  },
});
