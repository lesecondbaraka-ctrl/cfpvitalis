import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-vc-bg font-sans text-[#1B1D1F] relative">
      <!-- MOBILE BACKDROP OVERLAY -->
      @if (showNav && isMobileMenuOpen) {
        <div
          (click)="toggleMobileMenu(false)"
          class="fixed inset-0 bg-[#1B1D1F]/60 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        ></div>
      }

      @if (showNav) {
        <aside
          class="fixed md:static inset-y-0 left-0 w-64 text-white flex flex-col shadow-2xl md:shadow-xl z-40 flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0"
          [class.-translate-x-full]="!isMobileMenuOpen"
          [class.translate-x-0]="isMobileMenuOpen"
          style="background-color: var(--color-vc-dark, #124F80);"
        >
          <!-- Logo & Brand Header -->
          <div class="p-5 border-b border-white/10 bg-black/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img 
                  src="assets/logo-vitalis.png" 
                  alt="Logo Vitalis Center EUP" 
                  width="160"
                  height="40"
                  class="h-10 w-auto object-contain bg-white/95 p-1 rounded-xs shadow-xs"
                />
                <div>
                  <h2 class="text-sm font-bold tracking-tight text-white font-heading leading-tight">VITALIS CENTER</h2>
                  <span class="text-[10px] tracking-wider uppercase font-semibold text-[#F0791E]">Espace Personnel & Staff</span>
                </div>
              </div>

              <!-- Close Button on Mobile -->
              <button
                (click)="toggleMobileMenu(false)"
                class="md:hidden w-8 h-8 rounded-xs bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div class="mt-2 text-[10px] text-white/70 leading-tight">
              Aut Foct N°CFP 00095/MIN-FP/DG-FP/KMG/JPU/2026
            </div>

            @if (auth.currentUser) {
              <div class="mt-3 p-2.5 rounded-xs bg-white/10 border border-white/15 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-[#1C75BC] text-white font-bold flex items-center justify-center text-xs border border-white/30 shrink-0">
                  {{ auth.currentUser.prenom.charAt(0) }}{{ auth.currentUser.nom.charAt(0) }}
                </div>
                <div class="overflow-hidden">
                  <p class="text-xs font-semibold text-white truncate leading-tight">{{ auth.currentUser.prenom }} {{ auth.currentUser.nom }}</p>
                  <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded-xs bg-white/20 text-white text-[9px] font-bold uppercase">{{ auth.currentUser.role }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 p-3 space-y-1 overflow-y-auto font-['Public_Sans',sans-serif]">
            
            <!-- ========================================================================= -->
            <!-- 1. ESPACE ADMINISTRATEUR CENTRAL (DIRECTION GÉNÉRALE NATIONALE)          -->
            <!-- ========================================================================= -->
            @if (auth.hasRole('ADMIN_CENTRE')) {
              <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                🏛️ Direction & Gouvernance
              </div>

              <a 
                routerLink="/admin/analytics" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Indicateurs & Stats Nationales</span>
              </a>

              <a 
                routerLink="/admin/etablissements" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Réseau des Établissements</span>
              </a>

              <a 
                routerLink="/admin/utilisateurs" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Gestion des Utilisateurs</span>
              </a>

              <a 
                routerLink="/admin/admissions" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Admissions & Doléances</span>
              </a>

              <a 
                routerLink="/admin/accueil" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>CMS & Portail Public</span>
              </a>

              <div class="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                🎓 Supervision Pédagogique
              </div>

              <a 
                routerLink="/formations" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Programmes & Formations</span>
              </a>

              <a 
                routerLink="/seances" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Planning & Emploi du temps</span>
              </a>

              <a 
                routerLink="/personnel/assiduite" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Registre d'Assiduité</span>
              </a>
            }

            <!-- ========================================================================= -->
            <!-- 2. ESPACE DIRECTEUR D'ÉTABLISSEMENT SATELLITE (ADMIN_ETABLISSEMENT)       -->
            <!-- ========================================================================= -->
            @if (auth.hasRole('ADMIN_ETABLISSEMENT')) {
              <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                🏢 Administration Établissement
              </div>

              <a 
                routerLink="/admin-etab/dashboard" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span>Tableau de bord Antenne</span>
              </a>

              <a 
                routerLink="/admin-etab/utilisateurs" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Utilisateurs de l'Établissement</span>
              </a>

              <a
                routerLink="/admin-etab/sessions-admission"
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs"
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Sessions & Candidatures</span>
              </a>

              <div class="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                🎓 Pédagogie & Évaluations
              </div>

              <a 
                routerLink="/formations" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Formations</span>
              </a>

              <a 
                routerLink="/seances" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Emploi du temps</span>
              </a>

              <a 
                routerLink="/notes" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Notes & Bulletins</span>
              </a>

              <a 
                routerLink="/devoirs/noter" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Devoirs à corriger</span>
              </a>

              <a 
                routerLink="/personnel/assiduite" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Assiduité & Présences</span>
              </a>
            }

            <!-- ========================================================================= -->
            <!-- 3. ESPACE FORMATEUR                                                       -->
            <!-- ========================================================================= -->
            @if (auth.hasRole('FORMATEUR')) {
              <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                🎓 Espace Pédagogique
              </div>

              <a 
                routerLink="/dashboard" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Tableau de bord</span>
              </a>

              <a 
                routerLink="/formations" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Mes Formations & Cours</span>
              </a>

              <a 
                routerLink="/seances" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Séances & Émargement</span>
              </a>

              <a 
                routerLink="/notes" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Saisie des Évaluations</span>
              </a>

              <a 
                routerLink="/devoirs/noter" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Correction des Devoirs</span>
              </a>
            }

            <!-- ========================================================================= -->
            <!-- 4. ESPACE PERSONNEL ADMINISTRATIF                                         -->
            <!-- ========================================================================= -->
            @if (auth.hasRole('PERSONNEL_ADMINISTRATIF')) {
              <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">
                📋 Scolarité & Secrétariat
              </div>

              <a 
                routerLink="/dashboard" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Tableau de bord</span>
              </a>

              <a
                routerLink="/admin-etab/sessions-admission"
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs"
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Enrôlement & Candidatures</span>
              </a>

              <a 
                routerLink="/personnel/assiduite" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Assiduité & Feuilles d'émargement</span>
              </a>

              <a 
                routerLink="/seances" 
                (click)="toggleMobileMenu(false)"
                routerLinkActive="bg-white/15 text-white font-bold border-l-4 border-[#F0791E] shadow-xs" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-[#E7F1FA] hover:bg-white/10 hover:text-white transition-all group"
              >
                <svg class="w-4 h-4 shrink-0 text-[#93C5FD] group-hover:text-[#F0791E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Planning des Séances</span>
              </a>
            }
          </nav>

          <!-- Logout Button -->
          <div class="p-3 border-t border-white/10 bg-black/10">
            <button
              (click)="auth.logout()"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium text-red-200 hover:bg-red-900/30 hover:text-red-100 transition-all cursor-pointer"
            >
              <svg class="w-4 h-4 text-[#ED1C24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      }

      <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <!-- Top bar with mobile hamburger button if showNav is true -->
        @if (showNav) {
          <div class="md:hidden bg-white border-b border-[#D7DBDE] px-4 py-2.5 flex items-center justify-between">
            <button
              (click)="toggleMobileMenu()"
              class="p-2 rounded-xs border border-[#D7DBDE] hover:bg-[#E7F1FA] text-[#124F80] transition-colors cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="text-xs font-bold text-[#124F80]">Vitalis Center EUP</span>
          </div>
        }

        <main class="flex-1 overflow-auto">
          <ng-content />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @Input() showNav = true;
  isMobileMenuOpen = false;
  private sub: Subscription | null = null;

  constructor(
    public auth: AuthService,
    private notifications: NotificationsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.sub = this.notifications.messages().subscribe({
      next: (msg) => {
        if (msg && typeof msg === 'object' && msg.type?.startsWith('ADMISSION_')) {
          if (this.auth.hasAnyRole(['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'PERSONNEL_ADMINISTRATIF'])) {
            const icon = msg.type === 'ADMISSION_NEW_CANDIDATURE' ? '📋 ' : msg.type === 'ADMISSION_CONFIRMED' ? '🎉 ' : '📢 ';
            this.toast.info(`${icon}${msg.message || 'Activité sur les admissions réseau'}`);
          }
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMobileMenu(open?: boolean) {
    this.isMobileMenuOpen = open !== undefined ? open : !this.isMobileMenuOpen;
  }
}
