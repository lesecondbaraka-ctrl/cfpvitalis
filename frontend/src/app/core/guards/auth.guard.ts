import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const checkAuth = (): boolean => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

const checkRole = (roles: string[]): boolean => {
  if (!checkAuth()) return false;
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.hasAnyRole(roles)) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const authGuard: CanActivateFn = () => checkAuth();

export const adminCentreGuard: CanActivateFn = () => checkRole(['ADMIN_CENTRE']);

export const adminEtabGuard: CanActivateFn = () => checkRole(['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT']);

export const formateurGuard: CanActivateFn = () =>
  checkRole(['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'FORMATEUR']);

export const apprenantGuard: CanActivateFn = () => checkRole(['APPRENANT']);

export const personnelAdminGuard: CanActivateFn = () =>
  checkRole(['PERSONNEL_ADMINISTRATIF', 'ADMIN_ETABLISSEMENT', 'ADMIN_CENTRE']);

export const staffGuard: CanActivateFn = () =>
  checkRole(['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'FORMATEUR', 'PERSONNEL_ADMINISTRATIF']);
