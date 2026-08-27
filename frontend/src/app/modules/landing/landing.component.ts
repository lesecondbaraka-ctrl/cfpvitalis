import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LandingService } from '../../core/services/landing.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import {
  LandingPageSettings,
  LandingPageSection,
  LandingPageTemoignage,
  LandingPageActualite,
  PublicLandingData,
} from '../../core/models';

export interface FormationDisplayItem {
  id: string;
  titre: string;
  categorie: 'tech' | 'gestion' | 'technique';
  categorieNom: string;
  description: string;
  duree: string;
  modulesCount: number;
  badgeClass: string;
  debouches: string;
  prochaineSession: string;
  prerequis: string;
}

export interface FaqDisplayItem {
  question: string;
  reponse: string;
  ouvert: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col bg-white text-[#1B1D1F] font-['Public_Sans',sans-serif] overflow-x-hidden w-full relative">
      
      <!-- 1. TOPBAR INSTITUTIONNELLE GOUVERNEMENTALE (COMPACTE & SOBRE) -->
      <div class="bg-[#124F80] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#0D3859] w-full">
        <div class="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div class="flex items-center gap-2 font-medium min-w-0">
            <span class="inline-block w-2 h-2 rounded-full bg-[#2AA9A0] shrink-0 animate-pulse-glow"></span>
            <span class="truncate">
              {{ settings.topbarTexte }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-[#C6D2E3] shrink-0 text-[11px]">
            <a href="#verifier" class="hover:text-white transition-colors flex items-center gap-1.5 font-medium group">
              <svg class="w-3.5 h-3.5 text-[#F0791E] shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="whitespace-nowrap">Vérifier un certificat</span>
            </a>
            <span class="opacity-30 hidden sm:inline">|</span>
            <span class="text-[#2AA9A0] font-semibold hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-[#2AA9A0] shrink-0"></span>
              Aut. {{ settings.heroNumeroAgrement }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. NAVBAR OFFICIELLE (FLUIDE, RESPONSIVE & SANS DÉBORDEMENT) -->
      <header class="border-b border-[#D7DBDE] bg-white/95 backdrop-blur-md py-2.5 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-xs transition-all w-full">
        <div class="max-w-[1600px] mx-auto flex items-center justify-between gap-3 lg:gap-4">
          
          <!-- Logo & Marque Vitalis Center EUP + Logo Ministère de Tutelle -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <a routerLink="/" class="flex items-center gap-2 sm:gap-2.5 group shrink-0" title="Vitalis Center EUP">
              <img 
                src="assets/logo-vitalis.png" 
                alt="Logo Vitalis Center EUP"
                class="h-9 sm:h-10 2xl:h-11 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <div class="flex flex-col justify-center">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm sm:text-base font-extrabold tracking-tight text-[#124F80] uppercase leading-none">
                    Vitalis Center
                  </span>
                  <span class="px-1 py-0.2 bg-[#FDECDD] text-[#F0791E] font-extrabold text-[9px] sm:text-[10px] rounded tracking-wide border border-[#F0791E]/30 shimmer-badge">
                    EUP
                  </span>
                </div>
                <div class="hidden 2xl:block text-[10px] text-[#4B5157] font-medium leading-tight mt-0.5 whitespace-nowrap">
                  Centre de Formation Professionnelle & Technique
                </div>
              </div>
            </a>

            <!-- Logo Ministère -->
            <div class="hidden sm:flex items-center pl-2 sm:pl-3 border-l border-[#D7DBDE] shrink-0">
              <img 
                src="assets/logo-ministere.png" 
                alt="Ministère de la Formation Professionnelle - RDC" 
                class="h-8 sm:h-9 2xl:h-10 w-auto object-contain shrink-0 transition-transform hover:scale-105"
                title="Tutelle Institutionnelle : Ministère de la Formation Professionnelle - RDC"
              />
            </div>
          </div>

          <!-- Navigation Desktop Adaptative (Ajustement fluide selon la résolution) -->
          <nav class="hidden xl:flex items-center gap-1 2xl:gap-2.5 text-[11.5px] 2xl:text-xs font-semibold text-[#1B1D1F] shrink min-w-0">
            <a href="#accueil" class="text-[#1C75BC] hover:text-[#124F80] transition-colors py-1.5 px-2 rounded hover:bg-[#E7F1FA]/50 whitespace-nowrap">Accueil</a>
            <a href="#avantages" class="hidden 2xl:inline-block text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Pourquoi Vitalis</a>
            <a href="#formations" class="text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Formations</a>
            <a href="#pedagogie" class="hidden 2xl:inline-block text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Pédagogie</a>
            <a href="#admission" class="text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Admission</a>
            <a href="#ecosysteme" class="hidden 2xl:inline-block text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Écosystème</a>
            <a href="#actualites" class="text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Actualités</a>
            <a href="#verifier" class="text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Vérification</a>
            <a href="#faq" class="hidden 2xl:inline-block text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">FAQ</a>
            <a href="#contact" class="text-[#4B5157] hover:text-[#1C75BC] transition-colors py-1.5 px-2 rounded hover:bg-[#F5F6F7] whitespace-nowrap">Contact</a>
          </nav>

          <!-- Actions Utilisateur & Mobile Toggle -->
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
            @if (auth.isAuthenticated) {
              <a routerLink="/dashboard" class="btn btn-primary text-xs py-2 px-3 sm:px-3.5 shadow-xs font-bold whitespace-nowrap hover:scale-102 transition-transform flex items-center gap-1.5 shrink-0">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Mon Espace Agent</span>
              </a>
            } @else {
              <a routerLink="/login" class="btn btn-primary text-xs py-2 px-3 sm:px-3.5 font-bold shadow-xs whitespace-nowrap hover:scale-102 transition-transform flex items-center gap-1.5 shrink-0">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Connexion / Espace</span>
              </a>
            }

            <!-- Mobile / Tablet Hamburger Button (Visible sous xl:) -->
            <button 
              (click)="toggleMobileMenu()" 
              type="button" 
              class="xl:hidden p-2 text-[#124F80] hover:bg-[#F5F6F7] rounded-xs border border-[#D7DBDE] transition-colors flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Menu de navigation"
            >
              <svg *ngIf="!mobileMenuOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="mobileMenuOpen" class="w-5 h-5 text-[#ED1C24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu Mobile & Tablette Déroulant -->
        <div *ngIf="mobileMenuOpen" class="xl:hidden bg-white border-t border-[#D7DBDE] mt-2 pt-3 pb-3 space-y-1 text-xs font-semibold animate-fade-in-up">
          <div class="px-3 pb-2 mb-2 border-b border-[#EDEFF2] flex items-center justify-between">
            <span class="text-[11px] uppercase font-bold text-[#124F80]">Navigation Principale</span>
            <span class="text-[10px] text-[#2AA9A0] font-bold">Vitalis Center EUP</span>
          </div>
          <a (click)="closeMobileMenu()" href="#accueil" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#E7F1FA] text-[#1C75BC]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#1C75BC]"></span>
            <span>Accueil</span>
          </a>
          <a (click)="closeMobileMenu()" href="#avantages" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Pourquoi Vitalis</span>
          </a>
          <a (click)="closeMobileMenu()" href="#formations" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Formations certifiantes</span>
          </a>
          <a (click)="closeMobileMenu()" href="#pedagogie" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Méthode pédagogique (APC)</span>
          </a>
          <a (click)="closeMobileMenu()" href="#admission" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Processus d'admission</span>
          </a>
          <a (click)="closeMobileMenu()" href="#ecosysteme" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Écosystème & Partenariats</span>
          </a>
          <a (click)="closeMobileMenu()" href="#actualites" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Actualités & Vie du Centre</span>
          </a>
          <a (click)="closeMobileMenu()" href="#verifier" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Vérification de certificat</span>
          </a>
          <a (click)="closeMobileMenu()" href="#faq" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Questions fréquentes</span>
          </a>
          <a (click)="closeMobileMenu()" href="#contact" class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#4B5157]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4B5157]"></span>
            <span>Contact & Orientation</span>
          </a>
          
          <div class="pt-2 mt-2 border-t border-[#EDEFF2] px-3">
            <a (click)="closeMobileMenu()" routerLink="/login" class="w-full btn btn-primary text-xs py-2 px-4 text-center block shadow-xs font-bold">
              Connexion / Mon Espace
            </a>
          </div>
        </div>
      </header>

      <!-- 3. SECTION HERO -->
      <section id="accueil" class="py-16 px-4 sm:px-6 bg-gradient-to-b from-[#E7F1FA]/70 via-[#E7F1FA]/30 to-white border-b border-[#D7DBDE] relative overflow-hidden">
        
        <!-- Éléments de fond décoratifs subtils -->
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-[#1C75BC]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 bottom-0 w-80 h-80 bg-[#F0791E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          
          <!-- Texte & Proposition de valeur -->
          <div class="lg:col-span-7 animate-fade-in-up">
            
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E7F1FA] border border-[#1C75BC]/30 text-[#1C75BC] text-xs font-semibold rounded mb-4 shadow-2xs shimmer-badge">
              <span class="inline-block w-2 h-2 rounded-full bg-[#1C75BC] animate-pulse-glow"></span>
              <span>Autorisation Ministérielle : {{ settings.heroNumeroAgrement }}</span>
            </div>

            <h1 class="text-4xl lg:text-5xl font-extrabold text-[#1B1D1F] leading-tight tracking-tight">
              {{ settings.heroTitre }}
            </h1>

            <div class="barre grande my-4"></div>

            <p class="text-sm sm:text-base text-[#4B5157] max-w-xl leading-relaxed mt-4">
              {{ settings.heroSousTitre }}
            </p>

            <div class="flex flex-wrap gap-3 mt-8">
              <a href="#formations" class="btn bg-[#F0791E] hover:bg-[#d6610b] text-white py-2.5 px-5 shadow-sm font-semibold text-xs sm:text-sm hover:translate-y-[-2px] transition-transform">
                Consulter les formations
              </a>
              <a routerLink="/login" class="btn btn-secondary py-2.5 px-5 shadow-xs text-xs sm:text-sm hover:translate-y-[-2px] transition-transform">
                Espace Candidat & Inscriptions
              </a>
              <a href="#verifier" class="btn btn-ghost py-2.5 px-4 border border-[#D7DBDE] text-xs sm:text-sm hover:border-[#1C75BC] hover:text-[#1C75BC] transition-colors">
                Vérifier un certificat
              </a>
            </div>

            <!-- Preuves d'assurance sous les boutons -->
            <div class="mt-8 pt-6 border-t border-[#D7DBDE] flex flex-wrap gap-5 text-xs text-[#4B5157]">
              <div class="flex items-center gap-1.5 hover:text-[#1B1D1F] transition-colors">
                <svg class="w-4 h-4 text-[#276B44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Certificat officiel infalsifiable</span>
              </div>
              <div class="flex items-center gap-1.5 hover:text-[#1B1D1F] transition-colors">
                <svg class="w-4 h-4 text-[#276B44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Ateliers pratiques & Projets concrets</span>
              </div>
              <div class="flex items-center gap-1.5 hover:text-[#1B1D1F] transition-colors">
                <svg class="w-4 h-4 text-[#276B44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Immersion professionnelle active</span>
              </div>
            </div>

          </div>

          <!-- Hero Widget Institutionnel -->
          <div class="lg:col-span-5">
            <div class="relative pt-3">
              <div class="absolute top-0 right-4 z-20 bg-[#F0791E] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xs shadow-sm animate-pulse-glow-or">
                Organisme Agréé
              </div>
              
              <div 
                (mousemove)="onMouseMoveHeroWidget($event)" 
                (mouseleave)="onMouseLeaveHeroWidget()"
                [style.transform]="heroWidgetTransform"
                class="bg-white border-2 border-[#1C75BC] p-6 shadow-lg rounded-xs relative transition-transform duration-200 ease-out will-change-transform shimmer-badge"
              >
                <div class="flex items-center justify-around gap-4 mb-4 border-b border-[#D7DBDE] pb-4">
                  <img 
                    src="assets/logo-vitalis.png" 
                    alt="Vitalis Center EUP"
                    width="160"
                    height="64"
                    class="h-16 w-auto object-contain transition-transform hover:scale-105"
                  />
                  <div class="h-10 border-r-2 border-[#D7DBDE]"></div>
                  <img 
                    src="assets/logo-ministere.png" 
                    alt="Ministère de la Formation Professionnelle - RDC" 
                    class="h-16 w-auto object-contain transition-transform hover:scale-105"
                  />
                </div>

                <div class="space-y-2.5 text-xs">
                  <div class="flex justify-between py-1 border-b border-[#F5F6F7]">
                    <span class="text-[#4B5157]">Établissement :</span>
                    <span class="font-bold text-[#1C75BC]">Vitalis Center EUP</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#F5F6F7]">
                    <span class="text-[#4B5157]">Statut Juridique :</span>
                    <span class="font-bold text-[#1B1D1F]">Établissement d'Utilité Publique</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#F5F6F7]">
                    <span class="text-[#4B5157]">Agrément Officiel :</span>
                    <span class="font-mono text-[#ED1C24] font-bold bg-[#FDE6E6] px-1.5 py-0.5 rounded">{{ settings.heroNumeroAgrement }}</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#F5F6F7]">
                    <span class="text-[#4B5157]">Pédagogie :</span>
                    <span class="font-semibold text-[#1B1D1F]">Approche par Compétences (APC)</span>
                  </div>
                  <div class="flex justify-between py-1 items-center">
                    <span class="text-[#4B5157]">Sécurité Documentaire :</span>
                    <span class="inline-flex items-center gap-1 font-semibold text-[#276B44] bg-[#E7F1EA] px-2 py-0.5 rounded text-[11px]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#276B44] animate-pulse-glow"></span>
                      QR Code & Filigrane Numérique
                    </span>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-[#D7DBDE] text-[11px] text-center text-[#4B5157] flex items-center justify-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#2AA9A0]"></span>
                  République Démocratique du Congo · Ministère de la Formation Professionnelle
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- 4. SECTION CHIFFRES CLÉS / IMPACT AVEC ANIMATION DE DÉCOMPTE (COUNT-UP) -->
      <section id="impact-stats" #statsSection class="py-12 bg-white border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-0">
            
            <div class="p-6 text-center border-b border-r border-[#D7DBDE] lg:border-b-0 hover:bg-[#F5F6F7] transition-colors">
              <div class="text-3xl sm:text-4xl font-extrabold text-[#124F80]">
                {{ laureatsDisplay }}+
              </div>
              <div class="text-xs sm:text-sm font-bold text-[#1B1D1F] mt-1">Lauréats Certifiés</div>
              <div class="text-[11px] text-[#4B5157] mt-0.5">Sur l'ensemble du territoire</div>
            </div>

            <div class="p-6 text-center border-b border-[#D7DBDE] lg:border-b-0 lg:border-r hover:bg-[#F5F6F7] transition-colors">
              <div class="text-3xl sm:text-4xl font-extrabold text-[#F0791E]">
                {{ tauxReussiteDisplay }} %
              </div>
              <div class="text-xs sm:text-sm font-bold text-[#1B1D1F] mt-1">Taux de Réussite</div>
              <div class="text-[11px] text-[#4B5157] mt-0.5">Évaluation continue et rigoureuse</div>
            </div>

            <div class="p-6 text-center lg:border-r border-[#D7DBDE] hover:bg-[#F5F6F7] transition-colors">
              <div class="text-3xl sm:text-4xl font-extrabold text-[#276B44]">
                {{ filieresDisplay }}+
              </div>
              <div class="text-xs sm:text-sm font-bold text-[#1B1D1F] mt-1">Filières Métiers</div>
              <div class="text-[11px] text-[#4B5157] mt-0.5">Tech, Gestion & Technique</div>
            </div>

            <div class="p-6 text-center hover:bg-[#F5F6F7] transition-colors">
              <div class="text-3xl sm:text-4xl font-extrabold text-[#1C75BC]">
                {{ titresVerifDisplay }} %
              </div>
              <div class="text-xs sm:text-sm font-bold text-[#1B1D1F] mt-1">Titres Vérifiables</div>
              <div class="text-[11px] text-[#4B5157] mt-0.5">Authentification numérique instantanée</div>
            </div>

          </div>
        </div>
      </section>

      <!-- 5. SECTION POURQUOI CHOISIR VITALIS CENTER ? -->
      <section id="avantages" class="py-14 px-4 sm:px-6 bg-[#F5F6F7] border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center mb-10">
            <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Garanties d'Excellence</div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Pourquoi choisir Vitalis Center EUP ?</h2>
            <div class="barre grande mx-auto mt-3"></div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div *ngFor="let av of avantagesList" class="card bg-white shadow-xs card-interactive border-t-4" [style.border-top-color]="av.couleur || '#1C75BC'">
              <div class="label flex items-center gap-1.5" [style.color]="av.couleur || '#1C75BC'">
                <span class="w-1.5 h-1.5 rounded-full" [style.background-color]="av.couleur || '#1C75BC'"></span>
                {{ av.sousTitre || 'Garantie' }}
              </div>
              <h3 class="text-base font-bold text-[#1B1D1F] mb-2">{{ av.titre }}</h3>
              <p class="text-xs text-[#4B5157] leading-relaxed">
                {{ av.description }}
              </p>
            </div>

          </div>
        </div>
      </section>

      <!-- 6. SECTION CATALOGUE DES FORMATIONS CERTIFIANTES -->
      <section id="formations" class="py-14 px-4 sm:px-6 bg-white border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Offre de Formation</div>
              <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Formations Certifiantes</h2>
              <div class="barre mt-2"></div>
            </div>
            
            <!-- Barre de Recherche Textuelle & Filtres par catégorie -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="rechercheMotCle" 
                  (ngModelChange)="filtrerFormations()"
                  placeholder="Rechercher une formation..." 
                  class="px-3.5 py-1.5 text-xs bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs w-full sm:w-56 focus:outline-none focus:border-[#1C75BC] focus:bg-white transition-colors"
                />
                <span *ngIf="rechercheMotCle" (click)="resetRecherche()" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#4B5157] cursor-pointer hover:text-[#ED1C24]">✕</span>
              </div>

              <div class="flex flex-wrap gap-1.5">
                <button 
                  (click)="filtrerCategorie('toutes')"
                  [class.bg-[#1C75BC]]="categorieActive === 'toutes'"
                  [class.text-white]="categorieActive === 'toutes'"
                  [class.shadow-xs]="categorieActive === 'toutes'"
                  [class.bg-[#F5F6F7]]="categorieActive !== 'toutes'"
                  [class.text-[#4B5157]]="categorieActive !== 'toutes'"
                  class="px-3 py-1.5 rounded-xs text-xs font-semibold border border-[#D7DBDE] transition-all hover:border-[#1C75BC] cursor-pointer"
                >
                  Toutes
                </button>
                <button 
                  (click)="filtrerCategorie('tech')"
                  [class.bg-[#1C75BC]]="categorieActive === 'tech'"
                  [class.text-white]="categorieActive === 'tech'"
                  [class.shadow-xs]="categorieActive === 'tech'"
                  [class.bg-[#F5F6F7]]="categorieActive !== 'tech'"
                  [class.text-[#4B5157]]="categorieActive !== 'tech'"
                  class="px-3 py-1.5 rounded-xs text-xs font-semibold border border-[#D7DBDE] transition-all hover:border-[#1C75BC] cursor-pointer"
                >
                  Tech
                </button>
                <button 
                  (click)="filtrerCategorie('gestion')"
                  [class.bg-[#1C75BC]]="categorieActive === 'gestion'"
                  [class.text-white]="categorieActive === 'gestion'"
                  [class.shadow-xs]="categorieActive === 'gestion'"
                  [class.bg-[#F5F6F7]]="categorieActive !== 'gestion'"
                  [class.text-[#4B5157]]="categorieActive !== 'gestion'"
                  class="px-3 py-1.5 rounded-xs text-xs font-semibold border border-[#D7DBDE] transition-all hover:border-[#1C75BC] cursor-pointer"
                >
                  Gestion
                </button>
                <button 
                  (click)="filtrerCategorie('technique')"
                  [class.bg-[#1C75BC]]="categorieActive === 'technique'"
                  [class.text-white]="categorieActive === 'technique'"
                  [class.shadow-xs]="categorieActive === 'technique'"
                  [class.bg-[#F5F6F7]]="categorieActive !== 'technique'"
                  [class.text-[#4B5157]]="categorieActive !== 'technique'"
                  class="px-3 py-1.5 rounded-xs text-xs font-semibold border border-[#D7DBDE] transition-all hover:border-[#1C75BC] cursor-pointer"
                >
                  Technique
                </button>
              </div>
            </div>
          </div>

          <!-- Message si aucun résultat -->
          <div *ngIf="formationsFiltrees.length === 0" class="p-8 text-center bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-xs text-[#4B5157] animate-fade-in-up">
            Aucune formation ne correspond à votre recherche. <button (click)="resetRecherche()" class="text-[#1C75BC] underline font-semibold ml-1 cursor-pointer">Réinitialiser les filtres</button>
          </div>

          <!-- Grille des Formations -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div *ngFor="let formation of formationsFiltrees" class="bg-white border border-[#D7DBDE] overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#1C75BC] card-interactive">
              <div>
                <div class="h-1.5" [ngClass]="{
                  'bg-[#1C75BC]': formation.categorie === 'tech',
                  'bg-[#F0791E]': formation.categorie === 'gestion',
                  'bg-[#276B44]': formation.categorie === 'technique'
                }"></div>
                
                <div class="p-5">
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span [ngClass]="formation.badgeClass" class="tag">
                      {{ formation.categorieNom }}
                    </span>
                    <span class="text-[10px] font-semibold text-[#276B44] bg-[#E7F1EA] px-2 py-0.5 rounded flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#276B44] animate-pulse-glow"></span>
                      Session ouverte
                    </span>
                  </div>

                  <h3 class="text-base font-bold text-[#1B1D1F] mt-1 leading-snug">
                    {{ formation.titre }}
                  </h3>
                  
                  <p class="text-xs text-[#4B5157] my-3 leading-relaxed">
                    {{ formation.description }}
                  </p>
                  
                  <div class="space-y-2 text-xs text-[#4B5157] pt-3 border-t border-[#F5F6F7]">
                    <div class="flex justify-between">
                      <span>Volume horaire :</span>
                      <span class="font-semibold text-[#1B1D1F]">{{ formation.duree }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Structure :</span>
                      <span class="font-semibold text-[#1B1D1F]">{{ formation.modulesCount }} Modules certifiants</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Débouchés :</span>
                      <span class="font-semibold text-[#1C75BC] truncate max-w-[170px]" [title]="formation.debouches">{{ formation.debouches }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-5 pt-0 bg-white">
                <a routerLink="/login" class="w-full btn btn-secondary text-xs py-2 px-4 shadow-2xs text-center block hover:bg-[#1C75BC] hover:text-white transition-colors">
                  Postuler à cette session
                </a>
              </div>
            </div>

          </div>

          <div class="mt-8 p-4 bg-[#E7F1FA] border-l-4 border-[#1C75BC] text-xs text-[#124F80] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-r-xs">
            <div>
              <strong>{{ settings.formationsSurMesureTitre }}</strong>
              <span> — {{ settings.formationsSurMesureDescription }}</span>
            </div>
            <a href="#contact" class="btn btn-primary text-xs py-1.5 px-4 shrink-0 hover:scale-102 transition-transform">
              Contacter le pôle entreprises
            </a>
          </div>

        </div>
      </section>

      <!-- 7. SECTION PÉDAGOGIE & ATELIERS PRATIQUES -->
      <section id="pedagogie" class="py-14 px-4 sm:px-6 bg-[#F5F6F7] border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center mb-10">
            <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Excellence Pédagogique</div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">L'Approche par Compétences (APC)</h2>
            <div class="barre grande mx-auto mt-3"></div>
            <p class="text-xs sm:text-sm text-[#4B5157] max-w-2xl mx-auto mt-3">
              Un modèle d'apprentissage reconnu à l'international qui privilégie la pratique sur cas réels et l'autonomie opérationnelle.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            
            <div *ngFor="let ped of pedagogieList" class="card bg-white shadow-xs card-interactive border-t-2" [style.border-top-color]="ped.couleur || '#1C75BC'">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xs font-extrabold text-lg leading-none" [style.background-color]="(ped.couleur || '#1C75BC') + '18'" [style.color]="ped.couleur || '#1C75BC'">
                  {{ ped.icone || '—' }}
                </div>
                <span class="text-[11px] font-semibold text-[#4B5157] bg-[#E7F1FA] px-2 py-0.5 rounded mt-1">{{ ped.sousTitre || 'Standard' }}</span>
              </div>
              <h3 class="text-sm font-bold text-[#1B1D1F] mb-1">{{ ped.titre }}</h3>
              <p class="text-xs text-[#4B5157] leading-relaxed">
                {{ ped.description }}
              </p>
            </div>

          </div>

        </div>
      </section>

      <!-- 8. SECTION PROCESSUS D'ADMISSION -->
      <section id="admission" class="py-14 px-4 sm:px-6 bg-white border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center mb-10">
            <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Parcours d'Inscription</div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Processus d'Admission en 4 Étapes</h2>
            <div class="barre grande mx-auto mt-3"></div>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
            
            <div 
              *ngFor="let adm of admissionList; let i = index"
              (click)="setActiveStep(i + 1)"
              [class.border-[#1C75BC]]="activeStep === (i + 1)"
              [class.shadow-md]="activeStep === (i + 1)"
              [class.bg-white]="activeStep === (i + 1)"
              class="card bg-[#F5F6F7] shadow-xs card-interactive cursor-pointer border-2 transition-all"
            >
              <div class="w-8 h-8 rounded-xs text-white flex items-center justify-center font-bold text-sm mb-3 shadow-xs" [style.background-color]="adm.couleur || '#1C75BC'">
                {{ i + 1 }}
              </div>
              <h3 class="text-sm font-bold text-[#1B1D1F] mb-1">{{ adm.titre }}</h3>
              <p class="text-xs text-[#4B5157] leading-relaxed">
                {{ adm.description }}
              </p>
            </div>

          </div>

          <div class="text-center mt-8">
            <a routerLink="/candidature" class="btn btn-primary text-xs py-2.5 px-6 shadow-sm font-semibold hover:scale-102 transition-transform">
              Accéder aux candidatures
            </a>
          </div>

        </div>
      </section>

      <!-- 9. SECTION ÉCOSYSTÈME PROFESSIONNEL & DÉBOUCHÉS -->
      <section id="ecosysteme" class="py-14 px-4 sm:px-6 bg-[#F5F6F7] border-b border-[#D7DBDE] overflow-hidden">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Écosystème & Insertion Professionnelle</div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Secteurs Métiers & Partenaires Économiques</h2>
            <div class="barre grande mx-auto mt-3"></div>
            <p class="text-xs sm:text-sm text-[#4B5157] mt-3 max-w-2xl mx-auto leading-relaxed">
              Des cursus alignés sur les besoins réels des entreprises et institutions publiques en RDC, garantissant l'insertion active et des débouchés qualifiés pour nos diplômés.
            </p>
          </div>

          <!-- Grille des secteurs majeurs d'insertion -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div *ngFor="let sec of secteursList" class="card bg-white border border-[#D7DBDE] hover:border-[#1C75BC] p-4.5 flex items-start gap-3.5 transition-all shadow-2xs card-interactive">
              <div class="w-10 h-10 rounded-xs bg-[#E7F1FA] text-[#124F80] flex items-center justify-center shrink-0 border border-[#1C75BC]/20 font-bold">
                <svg class="w-5 h-5 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] uppercase tracking-wider font-bold text-[#F0791E]">{{ sec.sousTitre }}</div>
                <h3 class="text-sm font-bold text-[#1B1D1F] mt-0.5 truncate">{{ sec.titre }}</h3>
                <p class="text-xs text-[#4B5157] mt-1 leading-relaxed line-clamp-2">
                  {{ sec.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Marquee animé en continu -->
          <div class="bg-white border border-[#D7DBDE] rounded-xs p-3 shadow-2xs">
            <div class="text-[11px] uppercase font-bold text-center text-[#4B5157] mb-2 tracking-wider">
              Déploiement Opérationnel & Insertion Territoriale Continue
            </div>
            <div class="marquee-container py-1">
              <div class="marquee-content" aria-hidden="false">
                <div *ngFor="let sec of secteursList" class="px-4 py-2 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs font-semibold text-xs text-[#124F80] shrink-0 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#1C75BC]"></span>
                  <span>{{ sec.titre }}</span>
                </div>
                <!-- Duplicat pour défilement infini sans saut -->
                <div *ngFor="let sec of secteursList" class="px-4 py-2 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs font-semibold text-xs text-[#124F80] shrink-0 flex items-center gap-2" aria-hidden="true">
                  <span class="w-2 h-2 rounded-full bg-[#1C75BC]"></span>
                  <span>{{ sec.titre }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- 10. SECTION ACTUALITÉS & ÉVÉNEMENTS DU CENTRE VITALIS (ANIMATION HARVARD / UNESCO STYLE) -->
      <section id="actualites" class="py-16 px-4 sm:px-6 bg-[#FAFBFC] border-b border-[#D7DBDE] relative">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C75BC]/10 text-[#1C75BC] text-xs font-bold uppercase tracking-wider rounded-2xs mb-2">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>Vie Institutionnelle & Événements</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Actualités & Vie du Centre Vitalis</h2>
            <p class="text-xs sm:text-sm text-[#4B5157] max-w-2xl mx-auto mt-2">
              Découvrez les dernières innovations pédagogiques, cérémonies officielles, partenariats stratégiques et annonces de notre établissement.
            </p>
            <div class="barre grande mx-auto mt-3"></div>
          </div>

          <!-- BANDEAU FLASH INFO DYNAMIQUE "EN DIRECT DU CENTRE" -->
          <div class="mb-8 bg-[#124F80] text-white rounded-xs p-2.5 sm:p-3 shadow-md flex items-center gap-3 overflow-hidden border border-[#1C75BC]">
            <div class="shrink-0 flex items-center gap-2 px-2.5 py-1 bg-[#ED1C24] text-white text-[11px] font-black uppercase tracking-wider rounded-2xs shadow-xs animate-pulse">
              <span class="w-2 h-2 rounded-full bg-white"></span>
              <span>FLASH INFO</span>
            </div>
            
            <div class="marquee-container flex-1 overflow-hidden">
              <div class="marquee-content flex items-center gap-8 text-xs font-semibold">
                <div *ngFor="let act of actualitesActives" class="flex items-center gap-2 shrink-0 cursor-pointer hover:text-[#F0791E] transition-colors" (click)="openArticleModal(act)">
                  <span class="px-1.5 py-0.5 rounded-2xs text-[10px] uppercase font-bold text-white shadow-xs" [style.background-color]="getCategorieBadgeColor(act.categorie, act.badgeCouleur)">{{ getCategorieLabel(act.categorie) }}</span>
                  <span class="text-white hover:underline">{{ act.titre }}</span>
                  <span class="text-[#F0791E] text-[10px]">· {{ act.datePublication | date:'dd/MM' }}</span>
                  <span class="text-slate-400">·</span>
                </div>
                <!-- Duplication pour défilement infini sans coupure -->
                <div *ngFor="let act of actualitesActives" class="flex items-center gap-2 shrink-0 cursor-pointer hover:text-[#F0791E] transition-colors" (click)="openArticleModal(act)" aria-hidden="true">
                  <span class="px-1.5 py-0.5 rounded-2xs text-[10px] uppercase font-bold text-white shadow-xs" [style.background-color]="getCategorieBadgeColor(act.categorie, act.badgeCouleur)">{{ getCategorieLabel(act.categorie) }}</span>
                  <span class="text-white hover:underline">{{ act.titre }}</span>
                  <span class="text-[#F0791E] text-[10px]">· {{ act.datePublication | date:'dd/MM' }}</span>
                  <span class="text-slate-400">·</span>
                </div>
              </div>
            </div>
          </div>

          <!-- GRAND STAGE HARVARD / UNESCO : HERO SLIDER + VOLET SYNCHRONISÉ -->
          <div 
            *ngIf="activeSlide" 
            class="mb-12 bg-white rounded-xs border border-[#D7DBDE] shadow-md overflow-hidden grid lg:grid-cols-12 gap-0"
            (mouseenter)="pauseSlider()"
            (mouseleave)="resumeSlider()"
          >
            
            <!-- CÔTÉ GAUCHE (7 COLONNES) : ARTICLE EN VEDETTE ANIMÉ -->
            <div class="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#D7DBDE]">
              
              <!-- Image Haute Définition avec Zoom Ken Burns et Overlay -->
              <div class="relative bg-slate-950 overflow-hidden h-64 sm:h-80 lg:h-96 group">
                <img 
                  [src]="getMediaUrl(activeSlide.imageUrl) || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop'" 
                  [alt]="activeSlide.titre"
                  class="w-full h-full object-cover ken-burns-anim transition-all duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                <!-- Badges flottants -->
                <div class="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span 
                    class="px-2.5 py-1 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-2xs shadow-md flex items-center gap-1.5"
                    [style.background-color]="getCategorieBadgeColor(activeSlide.categorie, activeSlide.badgeCouleur)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>{{ getCategorieLabel(activeSlide.categorie) }}</span>
                  </span>
                  <span *ngIf="activeSlide.aLaUne" class="px-2.5 py-1 bg-[#ED1C24] text-white text-[11px] font-black uppercase tracking-wider rounded-2xs shadow-md flex items-center gap-1">
                    <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span>À LA UNE</span>
                  </span>
                </div>

                <!-- Indicateur Vidéo -->
                <div *ngIf="activeSlide.videoUrl" class="absolute top-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold rounded-2xs flex items-center gap-1.5 shadow-md">
                  <svg class="w-3.5 h-3.5 text-[#F0791E]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>Vidéo Officielle</span>
                </div>

                <!-- Titre et métadonnées en superposition basse sur image -->
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <div class="flex items-center gap-2 text-[11px] text-slate-200 mb-1.5 font-medium">
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {{ activeSlide.datePublication | date:'dd MMMM yyyy' }}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {{ activeSlide.auteur || 'Direction Vitalis' }}
                    </span>
                  </div>
                  <h3 
                    class="text-base sm:text-xl font-extrabold text-white leading-tight hover:text-[#F0791E] transition-colors cursor-pointer drop-shadow-md line-clamp-2"
                    (click)="openArticleModal(activeSlide)"
                  >
                    {{ activeSlide.titre }}
                  </h3>
                </div>
              </div>

              <!-- Contenu Texte & Barre de Contrôle du Slider -->
              <div class="p-5 sm:p-6 bg-white flex flex-col justify-between flex-1">
                <p class="text-xs sm:text-sm text-[#4B5157] leading-relaxed line-clamp-3 mb-6 animate-slide-crossfade">
                  {{ activeSlide.chapeau || activeSlide.contenu }}
                </p>

                <!-- Barre d'outils et contrôles du slider -->
                <div class="pt-4 border-t border-[#EDEFF2] flex flex-wrap items-center justify-between gap-3">
                  
                  <!-- Navigation ‹ [01 / 04] › -->
                  <div class="flex items-center gap-2">
                    <button 
                      type="button" 
                      (click)="prevSlide()" 
                      class="w-8 h-8 rounded-xs border border-[#D7DBDE] hover:border-[#1C75BC] hover:bg-[#E7F1FA] text-[#124F80] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                      title="Actualité précédente"
                    >
                      ‹
                    </button>
                    
                    <span class="text-xs font-mono font-bold text-[#124F80] px-2 py-1 bg-[#F5F6F7] rounded-xs border border-[#D7DBDE]">
                      {{ (currentSlideIndex + 1) < 10 ? '0' + (currentSlideIndex + 1) : (currentSlideIndex + 1) }} / {{ actualitesActives.length < 10 ? '0' + actualitesActives.length : actualitesActives.length }}
                    </span>

                    <button 
                      type="button" 
                      (click)="nextSlide()" 
                      class="w-8 h-8 rounded-xs border border-[#D7DBDE] hover:border-[#1C75BC] hover:bg-[#E7F1FA] text-[#124F80] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                      title="Actualité suivante"
                    >
                      ›
                    </button>

                    <!-- Indicateur Pause / Lecture auto -->
                    <span class="text-[11px] text-slate-400 font-medium ml-1 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="isSliderPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'"></span>
                      {{ isSliderPaused ? 'En pause' : 'Défilement auto' }}
                    </span>
                  </div>

                  <!-- Bouton Lire l'article complet -->
                  <button 
                    type="button" 
                    (click)="openArticleModal(activeSlide)"
                    class="btn btn-primary text-xs py-2 px-5 font-bold shadow-xs hover:scale-102 transition-transform cursor-pointer flex items-center gap-2"
                  >
                    <span>Lire l'article complet</span>
                    <span>→</span>
                  </button>

                </div>

              </div>

            </div>

            <!-- CÔTÉ DROIT (5 COLONNES) : VOLET SYNCHRONISÉ (PLAYLIST D'ACTUALITÉS) -->
            <div class="lg:col-span-5 bg-[#F9FAFB] flex flex-col justify-between">
              
              <!-- En-tête du Volet -->
              <div class="p-4 border-b border-[#D7DBDE] bg-white flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#124F80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <h4 class="text-xs font-black uppercase tracking-wider text-[#124F80]">
                    Dépêches & Articles Récents
                  </h4>
                </div>
                <span class="text-[11px] font-bold text-[#F0791E] bg-[#FDECDD] px-2 py-0.5 rounded-2xs">
                  {{ actualitesActives.length }} actualités
                </span>
              </div>

              <!-- Liste interactive des actualités -->
              <div class="divide-y divide-[#EDEFF2] flex-1 overflow-y-auto max-h-[480px]">
                <div 
                  *ngFor="let item of actualitesActives; let idx = index"
                  (click)="goToSlide(idx)"
                  class="p-3.5 transition-all cursor-pointer relative group flex items-start gap-3"
                  [ngClass]="idx === (currentSlideIndex % actualitesActives.length) ? 'bg-white shadow-xs border-l-4 border-l-[#1C75BC]' : 'hover:bg-white/80 opacity-80 hover:opacity-100'"
                >
                  <!-- Numéro d'ordre -->
                  <span 
                    class="text-xs font-mono font-black shrink-0 w-6 h-6 rounded-2xs flex items-center justify-center transition-colors"
                    [ngClass]="idx === (currentSlideIndex % actualitesActives.length) ? 'bg-[#1C75BC] text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-[#E7F1FA] group-hover:text-[#1C75BC]'"
                  >
                    {{ idx + 1 }}
                  </span>

                  <!-- Miniature -->
                  <img 
                    [src]="getMediaUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=300&auto=format&fit=crop'" 
                    [alt]="item.titre"
                    class="w-14 h-14 object-cover rounded-2xs shrink-0 border border-slate-200"
                  />

                  <!-- Infos texte -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-0.5">
                      <span class="font-bold text-[#1C75BC] uppercase">{{ getCategorieLabel(item.categorie) }}</span>
                      <span>·</span>
                      <span>{{ item.datePublication | date:'dd/MM' }}</span>
                      <span *ngIf="item.aLaUne" class="text-[#ED1C24] font-bold">★</span>
                    </div>

                    <h5 
                      class="text-xs font-bold text-[#1B1D1F] line-clamp-2 leading-snug group-hover:text-[#1C75BC] transition-colors"
                    >
                      {{ item.titre }}
                    </h5>

                    <!-- Barre de progression linéaire sur l'élément actif -->
                    <div 
                      *ngIf="idx === (currentSlideIndex % actualitesActives.length)" 
                      class="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden"
                    >
                      <div 
                        class="h-full bg-gradient-to-r from-[#1C75BC] to-[#F0791E] news-progress-bar"
                        [style.width.%]="sliderProgress"
                      ></div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Pied de volet -->
              <div class="p-3 bg-white border-t border-[#D7DBDE] text-center">
                <span class="text-[11px] text-[#4B5157] font-medium">
                  Cliquez sur un article pour le visionner immédiatement
                </span>
              </div>

            </div>

          </div>

          <!-- FILTRES DE CATÉGORIES & EXPLORATION COMPLÈTE -->
          <div class="pt-6 border-t border-[#EDEFF2]">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h3 class="text-lg font-bold text-[#1B1D1F]">Explorer toutes les publications par rubrique</h3>
                <p class="text-xs text-[#4B5157]">Filtrez selon vos centres d'intérêt pédagogiques et institutionnels.</p>
              </div>

              <!-- Filtres de Catégories d'Actualités -->
              <div class="flex items-center flex-wrap gap-2">
                <button 
                  type="button" 
                  (click)="selectedCategorieActualite = 'TOUS'"
                  class="px-3.5 py-1.5 rounded-2xs text-xs font-bold transition-all cursor-pointer"
                  [ngClass]="selectedCategorieActualite === 'TOUS' ? 'bg-[#1C75BC] text-white shadow-xs' : 'bg-white text-[#4B5157] border border-[#D7DBDE] hover:bg-[#F5F6F7]'"
                >
                  Toutes ({{ actualitesList.length }})
                </button>
                <button 
                  *ngFor="let cat of categoriesDisponibles"
                  type="button" 
                  (click)="selectedCategorieActualite = cat.id"
                  class="px-3.5 py-1.5 rounded-2xs text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="selectedCategorieActualite === cat.id ? 'bg-[#1C75BC] text-white shadow-xs' : 'bg-white text-[#4B5157] border border-[#D7DBDE] hover:bg-[#F5F6F7]'"
                >
                  <span>{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Grille des Actualités Récentes -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                *ngFor="let act of actualitesFiltrees" 
                class="bg-white rounded-xs border border-[#D7DBDE] hover:border-[#1C75BC] hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group card-interactive"
              >
                <div>
                  <!-- Image miniature -->
                  <div class="relative h-44 bg-slate-100 overflow-hidden">
                    <img 
                      [src]="getMediaUrl(act.imageUrl) || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop'" 
                      [alt]="act.titre"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div class="absolute top-3 left-3">
                      <span 
                        class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-2xs text-white shadow-xs"
                        [style.background-color]="getCategorieBadgeColor(act.categorie, act.badgeCouleur)"
                      >
                        {{ getCategorieLabel(act.categorie) }}
                      </span>
                    </div>

                    <div *ngIf="act.aLaUne" class="absolute top-3 right-3 px-2 py-0.5 bg-[#ED1C24] text-white text-[10px] font-bold uppercase rounded-2xs shadow-xs flex items-center gap-1">
                      <span>★</span>
                      <span>À la une</span>
                    </div>
                  </div>

                  <!-- Corps de la carte -->
                  <div class="p-5">
                    <div class="flex items-center gap-2 text-[11px] text-[#71767C] mb-2 font-medium">
                      <span>📅 {{ act.datePublication | date:'dd/MM/yyyy' }}</span>
                      <span>•</span>
                      <span class="truncate max-w-[120px]">{{ act.auteur || 'Vitalis Center' }}</span>
                    </div>

                    <h3 
                      class="text-sm font-bold text-[#1B1D1F] leading-snug line-clamp-2 mb-2 group-hover:text-[#1C75BC] transition-colors cursor-pointer"
                      (click)="openArticleModal(act)"
                    >
                      {{ act.titre }}
                    </h3>

                    <p class="text-xs text-[#4B5157] line-clamp-3 leading-relaxed mb-4">
                      {{ act.chapeau || act.contenu }}
                    </p>
                  </div>
                </div>

                <!-- Pied de carte -->
                <div class="px-5 pb-5 pt-0">
                  <button 
                    type="button" 
                    (click)="openArticleModal(act)"
                    class="w-full py-2 px-3 bg-[#F5F6F7] hover:bg-[#E7F1FA] text-[#1C75BC] font-bold text-xs rounded-2xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Consulter les détails</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            </div>

            <!-- Message si aucune actualité dans la catégorie -->
            <div *ngIf="actualitesFiltrees.length === 0" class="text-center py-12 bg-white border border-[#D7DBDE] rounded-xs">
              <div class="text-sm font-bold text-[#1B1D1F]">Aucune actualité dans cette rubrique pour le moment</div>
              <p class="text-xs text-[#4B5157] mt-1">Revenez bientôt ou sélectionnez « Toutes ».</p>
            </div>
          </div>

        </div>
      </section>

      <!-- MODAL LECTURE INTÉGRALE D'UNE ACTUALITÉ -->
      <div *ngIf="selectedArticle" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-xs shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#1C75BC] animate-scale-up">
          
          <!-- En-tête avec image de couverture -->
          <div class="relative h-60 sm:h-72 bg-slate-900 overflow-hidden">
            <img 
              [src]="getMediaUrl(selectedArticle.imageUrl) || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop'" 
              [alt]="selectedArticle.titre"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <button 
              (click)="closeArticleModal()" 
              class="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-[#ED1C24] text-white rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer shadow-md"
            >
              ✕
            </button>

            <div class="absolute bottom-4 left-6 right-6">
              <div class="flex items-center gap-2 mb-2">
                <span 
                  class="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-2xs text-white shadow-xs"
                  [style.background-color]="getCategorieBadgeColor(selectedArticle.categorie, selectedArticle.badgeCouleur)"
                >
                  {{ getCategorieLabel(selectedArticle.categorie) }}
                </span>
                <span *ngIf="selectedArticle.aLaUne" class="px-2.5 py-0.5 bg-[#ED1C24] text-white text-[11px] font-bold uppercase tracking-wider rounded-2xs shadow-xs flex items-center gap-1">
                  <span>★</span>
                  <span>À la une</span>
                </span>
              </div>
              <h2 class="text-lg sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">
                {{ selectedArticle.titre }}
              </h2>
            </div>
          </div>

          <!-- Contenu du Modal -->
          <div class="p-6 sm:p-8 space-y-6">
            
            <!-- Métadonnées Auteur / Date -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EDEFF2] text-xs text-[#4B5157]">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#124F80]">{{ selectedArticle.auteur || 'Vitalis Center EUP' }}</span>
                <span>•</span>
                <span>Publié le {{ selectedArticle.datePublication | date:'dd MMMM yyyy' }}</span>
              </div>
              <div class="text-[11px] font-semibold text-[#1C75BC]">
                République Démocratique du Congo
              </div>
            </div>

            <!-- Chapeau / Résumé percutant -->
            <div *ngIf="selectedArticle.chapeau" class="p-4 bg-[#E7F1FA] border-l-4 border-[#1C75BC] rounded-r-xs text-xs sm:text-sm font-semibold text-[#124F80] leading-relaxed">
              {{ selectedArticle.chapeau }}
            </div>

            <!-- Lecteur Vidéo Haute Définition Intégré -->
            <div *ngIf="selectedArticle.videoUrl" class="space-y-2">
              <div class="rounded-xs overflow-hidden border border-[#D7DBDE] bg-black shadow-md">
                <div class="bg-[#124F80] text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
                  <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-[#ED1C24] animate-ping"></span>
                    <span>Reportage & Document Vidéo Officiel</span>
                  </span>
                  <span class="text-[10px] uppercase font-mono text-[#F0791E] font-bold">
                    {{ isVideoLocal(selectedArticle.videoUrl) ? 'Lecteur Local HD' : 'Lecteur Intégré' }}
                  </span>
                </div>
                
                <!-- Lecteur HTML5 natif pour vidéos locales MP4 / WebM / MOV -->
                <video 
                  *ngIf="isVideoLocal(selectedArticle.videoUrl)" 
                  [src]="getMediaUrl(selectedArticle.videoUrl)" 
                  controls 
                  playsinline 
                  autoplay 
                  class="w-full max-h-[420px] bg-black"
                ></video>

                <!-- Lecteur Iframe adaptatif pour YouTube / Vimeo -->
                <div *ngIf="!isVideoLocal(selectedArticle.videoUrl) && getEmbedUrl(selectedArticle.videoUrl)" class="relative pt-[56.25%] w-full bg-black">
                  <iframe 
                    [src]="getEmbedUrl(selectedArticle.videoUrl)" 
                    class="absolute inset-0 w-full h-full" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                  ></iframe>
                </div>

                <!-- Fallback lien externe si format non reconnu -->
                <div *ngIf="!isVideoLocal(selectedArticle.videoUrl) && !getEmbedUrl(selectedArticle.videoUrl)" class="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <span class="text-xs truncate max-w-md">{{ selectedArticle.videoUrl }}</span>
                  <a [href]="selectedArticle.videoUrl" target="_blank" class="btn btn-primary text-xs py-1.5 px-4 font-bold shrink-0">
                    Ouvrir la vidéo ↗
                  </a>
                </div>
              </div>
            </div>

            <!-- Corps complet de l'article -->
            <div class="text-xs sm:text-sm text-[#333] leading-relaxed whitespace-pre-line space-y-3">
              {{ selectedArticle.contenu || selectedArticle.chapeau }}
            </div>

            <!-- Footer du Modal -->
            <div class="pt-6 border-t border-[#EDEFF2] flex items-center justify-between gap-4">
              <button 
                type="button" 
                (click)="copierLienArticle()" 
                class="btn btn-ghost text-xs py-2 px-3 text-[#1C75BC] font-semibold"
              >
                Copier le titre
              </button>

              <button 
                type="button" 
                (click)="closeArticleModal()" 
                class="btn btn-primary text-xs py-2 px-6 font-bold shadow-xs"
              >
                Fermer
              </button>
            </div>

          </div>

        </div>
      </div>

      <!-- 11. SECTION VÉRIFICATION PUBLIQUE DE CERTIFICAT -->
      <section id="verifier" class="py-14 px-4 sm:px-6 bg-[#124F80] text-white relative overflow-hidden">
        
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 50% 0%, rgba(28,117,188,0.25) 0%, transparent 65%);"></div>

        <div class="max-w-4xl mx-auto text-center relative z-10">
          
          <div class="inline-block px-3.5 py-1 bg-[#F0791E] text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-xs rounded-2xs shimmer-badge animate-pulse-glow-or">
            Vérification Publique
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">{{ settings.verifTitre }}</h2>
          
          <p class="text-xs sm:text-sm text-[#C6D2E3] max-w-xl mx-auto mb-6">
            {{ settings.verifSousTitre }}
          </p>

          <div class="relative max-w-xl mx-auto">
            
            <div *ngIf="isScanning" class="scan-line"></div>

            <form (ngSubmit)="verifierCertificat()" class="flex flex-col sm:flex-row gap-2.5">
              <div class="relative flex-1">
                <input 
                  type="text" 
                  [(ngModel)]="searchCertNumero" 
                  name="searchCertNumero"
                  [placeholder]="'Exemple : ' + (settings.verifExempleNumero || 'CERT-2026-00001')" 
                  class="w-full px-4 py-3 bg-white text-[#1B1D1F] text-xs sm:text-sm rounded-xs focus:outline-none focus:ring-2 focus:ring-[#F0791E] placeholder:text-[#9AA1A8] shadow-md transition-all font-mono"
                  required
                />
              </div>

              <button 
                type="submit" 
                [disabled]="isScanning"
                class="btn bg-[#F0791E] hover:bg-[#d6610b] disabled:opacity-75 text-white border-none py-3 px-6 text-xs sm:text-sm font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-102 transition-transform"
              >
                <span *ngIf="!isScanning">Vérifier l'authenticité</span>
                <span *ngIf="isScanning" class="flex items-center gap-2">
                  <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Vérification en cours...
                </span>
              </button>
            </form>

          </div>
          
          <div class="mt-4 text-xs text-[#C6D2E3] flex items-center justify-center gap-1.5">
            <span>Exemple de certificat de test :</span>
            <button (click)="demoCert(settings.verifExempleNumero || 'CERT-2026-00001')" class="underline hover:text-white font-mono font-medium text-[#FDECDD] ml-1 cursor-pointer">
              {{ settings.verifExempleNumero || 'CERT-2026-00001' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 12. SECTION FAQ INTERACTIVE -->
      <section id="faq" class="py-14 px-4 sm:px-6 bg-[#F5F6F7] border-b border-[#D7DBDE]">
        <div class="max-w-4xl mx-auto">
          
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Aide & Réponses</div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] mt-1">Questions Fréquentes</h2>
            <div class="barre grande mx-auto mt-3"></div>
          </div>

          <div class="space-y-2.5">
            <div *ngFor="let item of faqList; let i = index" class="bg-white border border-[#D7DBDE] overflow-hidden shadow-2xs transition-all rounded-xs" [class.border-[#1C75BC]]="item.ouvert">
              <button 
                (click)="toggleFaq(i)"
                class="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1B1D1F] hover:bg-[#F5F6F7] transition-colors cursor-pointer"
              >
                <span class="flex-1">{{ item.question }}</span>
                <span class="text-[#1C75BC] font-bold text-base w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      [class.bg-[#1C75BC]]="item.ouvert"
                      [class.text-white]="item.ouvert"
                      [class.bg-[#E7F1FA]]="!item.ouvert">
                  {{ item.ouvert ? '−' : '+' }}
                </span>
              </button>
              <div *ngIf="item.ouvert" class="px-4 pb-4 pt-3 text-xs text-[#4B5157] leading-relaxed border-t border-[#E7F1FA] animate-fade-in-up">
                {{ item.reponse }}
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- 13. BANNIÈRE D'ACTION FORTE (CONVERSION & ORIENTATION) -->
      <section class="py-12 px-4 sm:px-6 bg-[#124F80] text-white border-b border-[#0D3859]">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white">{{ settings.ctaTitre }}</h2>
            <p class="text-xs sm:text-sm text-[#C6D2E3] mt-1">{{ settings.ctaSousTitre }}</p>
          </div>
          <div class="flex flex-wrap gap-3 shrink-0">
            <a routerLink="/login" class="btn bg-[#F0791E] hover:bg-[#d6610b] text-white py-2.5 px-5 font-bold text-xs sm:text-sm shadow-sm hover:scale-102 transition-transform">
              Accéder au portail d'admission
            </a>
            <a href="#contact" class="btn btn-secondary py-2.5 px-4 text-xs sm:text-sm hover:scale-102 transition-transform">
              Demander un rappel
            </a>
          </div>
        </div>
      </section>

      <!-- 14. SECTION CONTACT & LOCALISATION -->
      <section id="contact" class="py-14 px-4 sm:px-6 bg-white border-b border-[#D7DBDE]">
        <div class="max-w-7xl mx-auto">
          
          <div class="grid lg:grid-cols-12 gap-8 items-start">
            
            <div class="lg:col-span-5 space-y-4">
              <div>
                <div class="text-xs uppercase tracking-widest text-[#4B5157] font-semibold">Orientation & Accueil</div>
                <h2 class="text-2xl font-bold text-[#1B1D1F] mt-1">Contactez Vitalis Center EUP</h2>
                <div class="barre mt-2"></div>
                <p class="text-xs text-[#4B5157] mt-3 leading-relaxed">
                  Nos conseillers pédagogiques sont à votre disposition pour vous guider dans le choix de votre parcours de formation.
                </p>
              </div>

              <div class="space-y-2.5 text-xs text-[#1B1D1F]">
                <div class="p-3.5 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs card-interactive">
                  <div class="font-bold text-[#124F80]">Siège & Ateliers Techniques</div>
                  <div class="text-[#4B5157] mt-0.5">{{ settings.contactAdresse }}</div>
                </div>

                <div class="p-3.5 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs card-interactive">
                  <div class="font-bold text-[#124F80]">Courriel Institutionnel</div>
                  <div class="text-[#4B5157] mt-0.5">{{ settings.contactEmail }}</div>
                </div>

                <div class="p-3.5 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs card-interactive">
                  <div class="font-bold text-[#124F80]">Horaires du Secrétariat</div>
                  <div class="text-[#4B5157] mt-0.5">{{ settings.contactHoraires }}</div>
                </div>
              </div>
            </div>

            <!-- Formulaire de contact -->
            <div class="lg:col-span-7 card bg-[#F5F6F7] border border-[#D7DBDE] shadow-xs">
              <h3 class="text-sm font-bold text-[#1B1D1F] mb-3">Formulaire de Demande d'Orientation</h3>
              
              <form (ngSubmit)="envoyerContact()" class="space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="field">
                    <label>Nom et Prénom *</label>
                    <input type="text" [(ngModel)]="contactForm.nom" name="nom" placeholder="Ex : Jean Kasongo" required class="bg-white" />
                  </div>
                  <div class="field">
                    <label>Téléphone / WhatsApp *</label>
                    <input type="tel" [(ngModel)]="contactForm.telephone" name="telephone" placeholder="+243 ..." required class="bg-white" />
                  </div>
                </div>

                <div class="field">
                  <label>Filière souhaitée</label>
                  <select [(ngModel)]="contactForm.filiere" name="filiere" class="bg-white">
                    <option value="">Sélectionnez un domaine d'intérêt</option>
                    <option value="Sécurité Informatique & Administration Réseau">Sécurité Informatique & Administration Réseau</option>
                    <option value="Management d'Équipe & Leadership Public">Management d'Équipe & Leadership Public</option>
                    <option value="Gestion des Marchés Publics">Gestion des Marchés Publics</option>
                    <option value="Développement Web & Applications Métier">Développement Web & Applications Métier</option>
                    <option value="Autre">Autre filière / Demande entreprise</option>
                  </select>
                </div>

                <div class="field">
                  <label>Message ou question</label>
                  <textarea rows="3" [(ngModel)]="contactForm.message" name="message" placeholder="Précisez vos objectifs de formation..." class="bg-white w-full p-2.5 border-2 border-[#9AA1A8] rounded-xs font-['Public_Sans']"></textarea>
                </div>

                <button type="submit" [disabled]="submittingContact" class="btn btn-primary text-xs py-2.5 px-6 font-semibold hover:scale-102 transition-transform">
                  {{ submittingContact ? 'Envoi en cours...' : 'Envoyer ma demande' }}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <!-- 15. FOOTER INSTITUTIONNEL CONFORME CHARTE GRAPHIQUE -->
      <footer class="mt-auto bg-white border-t border-[#D7DBDE]">
        <div class="border-t-4 border-[#F0791E] bg-[#F5F6F7] py-8 px-4 sm:px-6">
          <div class="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-[#4B5157]">
            
            <!-- Col 1 : Marque & Agrément -->
            <div>
              <div class="flex items-center gap-3 mb-3">
                <img 
                  src="assets/logo-vitalis.png" 
                  alt="Vitalis Center EUP"
                  width="160"
                  height="64"
                  class="h-16 w-auto object-contain shrink-0"
                />
              </div>
              <p class="leading-relaxed">
                {{ settings.footerDescription }}
              </p>
              <div class="mt-2 font-semibold text-[#1C75BC]">
                Autorisation Officielle {{ settings.heroNumeroAgrement }}
              </div>
            </div>

            <!-- Col 2 : Formations & Liens -->
            <div>
              <div class="font-bold text-[#1B1D1F] text-sm mb-3">Formations</div>
              <ul class="space-y-1.5">
                <li><a href="#formations" class="hover:text-[#1C75BC] transition-colors">Catalogue complet</a></li>
                <li><a href="#admission" class="hover:text-[#1C75BC] transition-colors">Conditions d'admission</a></li>
                <li><a href="#verifier" class="hover:text-[#1C75BC] transition-colors">Vérificateur de certificats</a></li>
                <li><a routerLink="/login" class="hover:text-[#1C75BC] transition-colors">Connexion Espace Agent</a></li>
              </ul>
            </div>

            <!-- Col 3 : Tutelle Institutionnelle -->
            <div>
              <div class="font-bold text-[#1B1D1F] text-sm mb-3">Tutelle & Partenariat</div>
              <div class="mb-3">
                <img 
                  src="assets/logo-ministere.png" 
                  alt="Ministère de la Formation Professionnelle - RDC" 
                  class="h-16 w-auto object-contain transition-transform hover:scale-105"
                />
              </div>
              <p class="leading-relaxed">
                {{ settings.footerTutelleTexte }}
              </p>
            </div>

            <!-- Col 4 : Mentions Légales -->
            <div>
              <div class="font-bold text-[#1B1D1F] text-sm mb-3">Mentions Légales</div>
              <p class="leading-relaxed mb-2 whitespace-pre-line">
                République Démocratique du Congo
                Ministère de la Formation Professionnelle
              </p>
              <div class="text-[11px] text-[#4B5157]">
                {{ settings.footerCopyright }}
              </div>
            </div>

          </div>
        </div>

        <div class="bg-[#124F80] text-white py-2.5 px-4 sm:px-6 text-xs text-center font-medium">
          {{ settings.footerBarreTexte }}
        </div>
      </footer>

    </div>
  `,
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statsSection') statsSection?: ElementRef;

  searchCertNumero: string = '';
  mobileMenuOpen: boolean = false;
  categorieActive: string = 'toutes';
  rechercheMotCle: string = '';
  isScanning: boolean = false;
  activeStep: number = 1;
  submittingContact: boolean = false;

  contactForm = {
    nom: '',
    telephone: '',
    filiere: '',
    message: '',
  };

  // Paramètres globaux (avec valeurs par défaut de secours)
  settings: Partial<LandingPageSettings> = {
    topbarTexte: 'République Démocratique du Congo · Ministère de la Formation Professionnelle',
    heroTitre: 'Vitalis Center, la formation professionnelle reconnue par l\'État',
    heroSousTitre: 'Vitalis Center EUP forme les professionnels, cadres et jeunes talents aux métiers d\'avenir sous la tutelle du Ministère de la Formation Professionnelle. Validation par compétences pratiques, encadrement expert et délivrance de certificats officiels infalsifiables.',
    heroNumeroAgrement: 'N°CFP 00095/MIN-FP/DG-FP/KMG/JPU/2026',
    statsLaureats: 1200,
    statsTauxReussite: 94,
    statsFilieres: 15,
    statsTitresVerif: 100,
    ctaTitre: 'Prêt à développer des compétences certifiées ?',
    ctaSousTitre: 'Les inscriptions pour la session 2026 sont actuellement ouvertes.',
    formationsSurMesureTitre: 'Formations intra-entreprise & sur mesure',
    formationsSurMesureDescription: 'Nous concevons des programmes spécialisés pour les ministères et entreprises publiques et privées.',
    verifTitre: 'Vérifier l\'Authenticité d\'un Certificat',
    verifSousTitre: 'Entrez le numéro de série officiel délivré par Vitalis Center pour vérifier son authenticité en temps réel auprès du registre officiel.',
    verifExempleNumero: 'CERT-2026-00001',
    contactAdresse: 'Kinshasa, République Démocratique du Congo',
    contactEmail: 'contact@vitalis-center.cd',
    contactHoraires: 'Lundi – Vendredi : 08h00 – 16h30 | Samedi : 08h30 – 12h30',
    contactTelephone: '+243 ...',
    footerDescription: 'Vitalis Center EUP (Établissement d\'Utilité Publique) · Centre de formation professionnelle et technique agréé par le Ministère de la Formation Professionnelle de la RDC.',
    footerTutelleTexte: 'Supervision institutionnelle et contrôle de conformité des attestations et certifications nationales.',
    footerCopyright: '© 2026 Vitalis Center EUP. Tous droits réservés.',
    footerBarreTexte: 'Vitalis Center (EUP — Établissement d\'Utilité Publique) · Système de gestion et certification de la formation professionnelle · Édition 2026',
  };

  // Sections
  avantagesList: LandingPageSection[] = [
    { id: '1', typeSection: 'avantage', titre: 'Diplôme Reconnu par l\'État', sousTitre: 'Agrément National', description: 'Formations validées sous la tutelle du Ministère de la Formation Professionnelle pour une insertion professionnelle garantie.', icone: 'diplome', ordre: 1, couleur: '#1C75BC', actif: true },
    { id: '2', typeSection: 'avantage', titre: 'Formateurs Experts de Terrain', sousTitre: 'Corps Pédagogique', description: 'Des professionnels chevronnés transmettant un savoir-faire immédiatement opérationnel en entreprise.', icone: 'formateur', ordre: 2, couleur: '#F0791E', actif: true },
    { id: '3', typeSection: 'avantage', titre: 'Espace Numérique Dédié', sousTitre: 'Digitalisation', description: 'Accès aux supports de cours, devoirs, évaluations et suivi continu des compétences.', icone: 'digital', ordre: 3, couleur: '#124F80', actif: true },
    { id: '4', typeSection: 'avantage', titre: 'Certificats Infalsifiables', sousTitre: 'Anti-Fraude', description: 'Nomenclature séquentielle inaltérable et vérification publique instantanée via QR code.', icone: 'securite', ordre: 4, couleur: '#00A859', actif: true },
  ];

  pedagogieList: LandingPageSection[] = [
    { id: '1', typeSection: 'pedagogie', titre: 'Pratique & Ateliers Concrets', sousTitre: 'Standard TVET', description: 'Exercices en situation réelle, laboratoires techniques et travaux dirigés supervisés par des formateurs certifiés.', icone: '70 %', ordre: 1, couleur: '#1C75BC', actif: true },
    { id: '2', typeSection: 'pedagogie', titre: 'Évaluation Continue & Rigueur', sousTitre: 'Régulation État', description: 'Validation progressive de chaque compétence clé pour assurer une maîtrise parfaite avant la certification d\'État.', icone: '100 %', ordre: 2, couleur: '#F0791E', actif: true },
    { id: '3', typeSection: 'pedagogie', titre: 'Plateforme Digitale Hybride', sousTitre: 'Accès Cloud', description: 'Accès permanent aux ressources de cours, évaluations d\'entraînement et échanges continus avec les formateurs.', icone: '24h / 7j', ordre: 3, couleur: '#124F80', actif: true },
  ];

  admissionList: LandingPageSection[] = [
    { id: '1', typeSection: 'admission', titre: 'Enrôlement en Établissement', sousTitre: 'Étape 01', description: 'Rapprochez-vous de votre centre agréé ou de la Direction Centrale pour l\'ouverture de votre compte officiel.', icone: '01', ordre: 1, couleur: '#1C75BC', actif: true },
    { id: '2', typeSection: 'admission', titre: 'Dépôt des Pièces & Vœux', sousTitre: 'Étape 02', description: 'Connectez-vous sur votre espace sécurisé pour sélectionner votre session et téléverser vos pièces justificatives.', icone: '02', ordre: 2, couleur: '#124F80', actif: true },
    { id: '3', typeSection: 'admission', titre: 'Instruction & Évaluation', sousTitre: 'Étape 03', description: 'Examen des prérequis par la commission centrale avec attribution de note et droit aux explications garanti.', icone: '03', ordre: 3, couleur: '#F0791E', actif: true },
    { id: '4', typeSection: 'admission', titre: 'Admission & Formation', sousTitre: 'Étape 04', description: 'Validation définitive de votre place, activation des accès pédagogiques LMS et démarrage des cours certifiants.', icone: '04', ordre: 4, couleur: '#00A859', actif: true },
  ];

  secteursList: LandingPageSection[] = [
    { id: '1', typeSection: 'secteur', titre: 'Administration Publique & Ministères', sousTitre: 'Fonction Publique & Établissements', description: 'Accompagnement de la modernisation administrative et des projets ministériels.', icone: 'admin', ordre: 1, couleur: '#1C75BC', actif: true },
    { id: '2', typeSection: 'secteur', titre: 'Télécommunications & Sociétés Tech', sousTitre: 'Infrastructures & Systèmes', description: 'Déploiement réseau, cybersécurité opérationnelle, support et maintenance cloud.', icone: 'telecom', ordre: 2, couleur: '#124F80', actif: true },
    { id: '3', typeSection: 'secteur', titre: 'Banques & Institutions Financières', sousTitre: 'Fintech & Conformité', description: 'Gestion de trésorerie, audit, contrôle interne et digitalisation des services bancaires.', icone: 'banque', ordre: 3, couleur: '#F0791E', actif: true },
    { id: '4', typeSection: 'secteur', titre: 'Énergie, Mines & BTP', sousTitre: 'Génie Industriel & Maintenance', description: 'Supervision technique, gestion de chantiers, installations électriques et solaires.', icone: 'energie', ordre: 4, couleur: '#D97706', actif: true },
    { id: '5', typeSection: 'secteur', titre: 'Transport, Logistique & Douanes', sousTitre: 'Supply Chain & Transit', description: 'Coordination logistique, gestion des stocks et procédures douanières agréées.', icone: 'logistique', ordre: 5, couleur: '#059669', actif: true },
    { id: '6', typeSection: 'secteur', titre: 'ONGs & Organisations Internationales', sousTitre: 'Développement & Projets', description: 'Suivi-évaluation de programmes, passation des marchés et gestion administrative.', icone: 'ong', ordre: 6, couleur: '#7C3AED', actif: true },
  ];

  faqList: FaqDisplayItem[] = [
    { question: 'Les formations de Vitalis Center sont-elles reconnues par l\'État congolais ?', reponse: 'Oui, sans équivoque. Vitalis Center est un Établissement d\'Utilité Publique agréé par le Ministère de la Formation Professionnelle sous le numéro officiel CFP 00095/MIN-FP/DG-FP/KMG/JPU/2026. Tous nos certificats confèrent une reconnaissance institutionnelle immédiate.', ouvert: true },
    { question: 'Quel est le mode d\'évaluation pour obtenir la certification ?', reponse: 'Nous appliquons rigoureusement l\'Approche par Compétences (APC) préconisée par les normes nationales et internationales. Chaque apprenant est évalué sur des projets réels, des études de cas et des ateliers pratiques garantissant sa maîtrise technique avant l\'émission du certificat.', ouvert: false },
    { question: 'Comment vérifier l\'authenticité d\'un certificat délivré ?', reponse: 'Chaque certificat comporte un numéro de série unique inaltérable et un QR code officiel. Tout employeur ou institution peut vérifier la validité d\'un titre en quelques secondes sur notre plateforme publique de vérification en ligne.', ouvert: false },
    { question: 'Des sessions en cours du soir ou en ligne sont-elles disponibles ?', reponse: 'Absolument. Nous proposons des créneaux flexibles : sessions intensives en journée, cours du soir pour professionnels en poste, et parcours hybrides combinant e-learning et ateliers présentiels.', ouvert: false },
    { question: 'Vitalis Center propose-t-il des formations sur mesure pour entreprises ?', reponse: 'Oui. Notre pôle Formations Sur Mesure accompagne les ministères, régies financières, ONGs et entreprises privées dans la conception de plans de renforcement de capacités adaptés à leurs enjeux spécifiques.', ouvert: false },
  ];

  // Actualités du Centre
  actualitesList: LandingPageActualite[] = [
    {
      id: '1',
      titre: 'Déploiement National du Système Numérique Vitalis & Registre des Certifications Sécurisées',
      chapeau: 'Vitalis Center EUP officialise la mise en service de sa plateforme LMS et de certification sécurisée avec vérification par QR code et numéro de série infalsifiable.',
      contenu: 'Sous la tutelle du Ministère de la Formation Professionnelle, Vitalis Center franchit une étape historique dans la modernisation des dispositifs d\'apprentissage. La plateforme permet désormais un suivi individualisé des compétences, une évaluation rigoureuse par approche APC, et une authentification publique instantanée des attestations délivrées.',
      categorie: 'INNOVATION',
      badgeCouleur: '#1C75BC',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
      auteur: 'Direction Générale & Innovation',
      aLaUne: true,
      ordre: 1,
      actif: true,
      datePublication: new Date(),
    },
    {
      id: '2',
      titre: 'Lancement Officiel de la Campagne d\'Orientation et d\'Admission — Session 2026',
      chapeau: 'Les inscriptions sont officiellement ouvertes pour les 15 filières d\'excellence professionnelle réparties dans l\'ensemble du réseau national.',
      contenu: 'Les candidats, cadres et professionnels en reconversion peuvent dès maintenant formuler leurs vœux d\'orientation. Les directions pédagogiques de chaque antenne assurent des entretiens d\'admission personnalisés afin d\'orienter chaque profil vers la filière la plus adaptée à ses ambitions.',
      categorie: 'ADMISSIONS',
      badgeCouleur: '#F0791E',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
      auteur: 'Secrétariat Général aux Admissions',
      aLaUne: false,
      ordre: 2,
      actif: true,
      datePublication: new Date(),
    },
    {
      id: '3',
      titre: 'Accords Stratégiques avec les Entreprises Publiques et Privées pour l\'Insertion Immédiate',
      chapeau: 'Signature d\'accords-cadres pour garantir des stages pratiques en entreprise et l\'embauche directe des lauréats certifiés.',
      contenu: 'Dans le cadre de sa mission d\'utilité publique, Vitalis Center a consolidé des partenariats avec les fédérations d\'entreprises et les régies publiques. Ces conventions garantissent des immersions sur le terrain dès le deuxième semestre de formation et des opportunités d\'embauche directe pour les meilleurs apprenants.',
      categorie: 'PARTENARIAT',
      badgeCouleur: '#276B44',
      imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1200&auto=format&fit=crop',
      auteur: 'Direction des Relations Extérieures',
      aLaUne: false,
      ordre: 3,
      actif: true,
      datePublication: new Date(),
    },
    {
      id: '4',
      titre: 'Atelier National sur l\'Approche Pédagogique par Compétences (APC) et Harmonisation Métiers',
      chapeau: 'Formation intensive des formateurs et inspecteurs pédagogiques pour l\'application des référentiels internationaux.',
      contenu: 'Durant 5 jours, l\'ensemble du corps enseignant et des directeurs de filière ont participé au séminaire d\'harmonisation des maquettes de cours et des critères d\'évaluation. Cette standardisation garantit un niveau d\'excellence homogène dans toutes les antennes satellites du pays.',
      categorie: 'PEDAGOGIE',
      badgeCouleur: '#124F80',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
      auteur: 'Inspection Pédagogique Nationale',
      aLaUne: false,
      ordre: 4,
      actif: true,
      datePublication: new Date(),
    },
  ];

  selectedCategorieActualite: string = 'TOUS';
  selectedArticle: LandingPageActualite | null = null;

  // --- ÉTAT DU SLIDER D'ACTUALITÉS ANIMÉ (HARVARD / UNESCO STYLE) ---
  currentSlideIndex: number = 0;
  sliderProgress: number = 0; // 0 to 100%
  isSliderPaused: boolean = false;
  private sliderTimer: any = null;
  private readonly SLIDE_DURATION_MS = 6000;
  private readonly TICK_INTERVAL_MS = 60;

  get actualitesActives(): LandingPageActualite[] {
    return this.actualitesList.filter((a) => a.actif !== false);
  }

  get activeSlide(): LandingPageActualite | undefined {
    const list = this.actualitesActives;
    if (list.length === 0) return undefined;
    return list[this.currentSlideIndex % list.length];
  }

  startSliderLoop(): void {
    this.stopSliderLoop();
    this.sliderTimer = setInterval(() => {
      if (!this.isSliderPaused && this.actualitesActives.length > 1) {
        this.sliderProgress += (this.TICK_INTERVAL_MS / this.SLIDE_DURATION_MS) * 100;
        if (this.sliderProgress >= 100) {
          this.nextSlide();
        }
        this.cdr.markForCheck();
      }
    }, this.TICK_INTERVAL_MS);
  }

  stopSliderLoop(): void {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
      this.sliderTimer = null;
    }
  }

  nextSlide(): void {
    const total = this.actualitesActives.length;
    if (total <= 1) return;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % total;
    this.sliderProgress = 0;
    this.cdr.markForCheck();
  }

  prevSlide(): void {
    const total = this.actualitesActives.length;
    if (total <= 1) return;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + total) % total;
    this.sliderProgress = 0;
    this.cdr.markForCheck();
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.sliderProgress = 0;
    this.cdr.markForCheck();
  }

  pauseSlider(): void {
    this.isSliderPaused = true;
  }

  resumeSlider(): void {
    this.isSliderPaused = false;
  }

  categoriesDisponibles = [
    { id: 'INNOVATION', label: 'Innovation & Tech', icone: '💡' },
    { id: 'ADMISSIONS', label: 'Admissions & Inscriptions', icone: '📬' },
    { id: 'PARTENARIAT', label: 'Partenariats & Insertion', icone: '🤝' },
    { id: 'PEDAGOGIE', label: 'Pédagogie & APC', icone: '📚' },
    { id: 'VIE_DU_CENTRE', label: 'Vie du Centre', icone: '🏛️' },
  ];

  get actualitesFiltrees(): LandingPageActualite[] {
    const list = this.actualitesList.filter((a) => a.actif !== false);
    if (this.selectedCategorieActualite === 'TOUS') {
      return list;
    }
    return list.filter((a) => (a.categorie || '').toUpperCase() === this.selectedCategorieActualite);
  }

  get articleALaUne(): LandingPageActualite | undefined {
    return this.actualitesList.find((a) => a.actif !== false && a.aLaUne) || this.actualitesList.find((a) => a.actif !== false);
  }

  get actualitesFiltreesSansHero(): LandingPageActualite[] {
    const hero = this.articleALaUne;
    if (hero && this.selectedCategorieActualite === 'TOUS') {
      return this.actualitesFiltrees.filter((a) => a.id !== hero.id);
    }
    return this.actualitesFiltrees;
  }

  getCategorieLabel(cat?: string): string {
    if (!cat) return 'Actualité';
    const found = this.categoriesDisponibles.find((c) => c.id === cat.toUpperCase());
    return found ? found.label : cat;
  }

  getCategorieBadgeColor(cat?: string, fallback?: string): string {
    if (fallback && fallback.startsWith('#')) return fallback;
    switch ((cat || '').toUpperCase()) {
      case 'INNOVATION': return '#1C75BC'; // Bleu officiel
      case 'ADMISSIONS': return '#F0791E'; // Or solaire
      case 'PARTENARIAT': return '#276B44'; // Vert succès
      case 'PEDAGOGIE': return '#124F80'; // Bleu foncé
      case 'VIE_DU_CENTRE': return '#2AA9A0'; // Teal
      case 'COMMUNIQUE_OFFICIEL': return '#ED1C24'; // Rouge alerte
      default: return '#1C75BC';
    }
  }

  openArticleModal(item: LandingPageActualite): void {
    this.selectedArticle = item;
  }

  closeArticleModal(): void {
    this.selectedArticle = null;
  }

  copierLienArticle(): void {
    if (!this.selectedArticle) return;
    navigator.clipboard.writeText(this.selectedArticle.titre);
    this.toast.info('Titre de l\'actualité copié dans le presse-papier.');
  }

  temoignagesList: LandingPageTemoignage[] = [];

  // Transform 3D pour le widget Hero
  heroWidgetTransform: string = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

  // Compteurs animés (Count-Up)
  laureatsDisplay: number = 1200;
  tauxReussiteDisplay: number = 94;
  filieresDisplay: number = 15;
  titresVerifDisplay: number = 100;
  private statsObserver?: IntersectionObserver;
  private countUpDone: boolean = false;

  // Formations
  formationsList: FormationDisplayItem[] = [];
  formationsFiltrees: FormationDisplayItem[] = [];

  isVideoLocal(url?: string): boolean {
    if (!url) return false;
    const clean = url.toLowerCase();
    return clean.includes('/uploads/') || clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg');
  }

  getMediaUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
      return `${backendBase}${url}`;
    }
    return url;
  }

  getEmbedUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
        }
      } else if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        const videoId = parts[1]?.split('?')[0];
        if (videoId) {
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
        }
      } else if (url.includes('vimeo.com/')) {
        const parts = url.split('vimeo.com/');
        const videoId = parts[1]?.split('?')[0];
        if (videoId) {
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${videoId}?autoplay=1`);
        }
      }
    } catch (e) {}
    return null;
  }

  private notifSub: Subscription | null = null;

  constructor(
    public auth: AuthService,
    private landingService: LandingService,
    private notifications: NotificationsService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.chargerDonneesLanding();
    this.startSliderLoop();

    this.notifSub = this.notifications.messages().subscribe({
      next: (msg) => {
        if (msg && typeof msg === 'object' && (msg.type === 'ACTUALITE_UPDATE' || msg.type === 'LANDING_UPDATE')) {
          this.chargerDonneesLanding();
        }
      },
    });
  }

  chargerDonneesLanding(): void {
    this.landingService.getPublicLandingData().subscribe({
      next: (data: PublicLandingData) => {
        if (data.settings) {
          this.settings = data.settings;
          this.laureatsDisplay = this.settings.statsLaureats ?? 1200;
          this.tauxReussiteDisplay = this.settings.statsTauxReussite ?? 94;
          this.filieresDisplay = this.settings.statsFilieres ?? 15;
          this.titresVerifDisplay = this.settings.statsTitresVerif ?? 100;
        }

        if (data.sections) {
          this.avantagesList = data.sections.avantages || [];
          this.pedagogieList = data.sections.pedagogie || [];
          this.admissionList = data.sections.admission || [];
          this.secteursList = data.sections.secteurs || [];
          this.faqList = (data.sections.faq || []).map((f, idx) => ({
            question: f.titre,
            reponse: f.description || '',
            ouvert: idx === 0,
          }));
        }

        if (data.actualites && data.actualites.length > 0) {
          this.actualitesList = data.actualites;
          this.startSliderLoop();
        }

        if (data.temoignages && data.temoignages.length > 0) {
          this.temoignagesList = data.temoignages;
        }

        if (data.formations && data.formations.length > 0) {
          this.formationsList = data.formations.map((f) => {
            const titreLower = f.titre.toLowerCase();
            let cat: 'tech' | 'gestion' | 'technique' = 'tech';
            let catNom = 'Informatique & Tech';
            let badge = 'tag info';
            let debouches = 'Professionnel qualifié';

            if (titreLower.includes('gestion') || titreLower.includes('marché') || titreLower.includes('compta') || titreLower.includes('management')) {
              cat = 'gestion';
              catNom = 'Gestion & Management';
              badge = 'tag attente';
              debouches = 'Manager, Gestionnaire, Chef de projet';
            } else if (titreLower.includes('électric') || titreLower.includes('btp') || titreLower.includes('énergie') || titreLower.includes('mécanique')) {
              cat = 'technique';
              catNom = 'Technique & Énergie';
              badge = 'tag valide';
              debouches = 'Technicien Supérieur, Installateur';
            }

            return {
              id: f.id,
              titre: f.titre,
              categorie: cat,
              categorieNom: catNom,
              description: f.description || 'Formation certifiante d\'excellence validée par le Ministère.',
              duree: '40 Heures',
              modulesCount: f.modulesCount || 4,
              badgeClass: badge,
              debouches: debouches,
              prochaineSession: 'Inscriptions ouvertes',
              prerequis: 'Niveau secondaire ou expérience',
            };
          });
        }

        this.filtrerFormations();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Fallback aux données statiques pour la landing page', err);
        this.filtrerFormations();
        this.cdr.markForCheck();
      },
    });
  }

  ngAfterViewInit(): void {
    this.initStatsObserver();
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.stopSliderLoop();
    if (this.statsObserver) {
      this.statsObserver.disconnect();
    }
  }

  private initStatsObserver(): void {
    if (typeof IntersectionObserver === 'undefined' || !this.statsSection) return;

    this.statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.countUpDone) {
            this.countUpDone = true;
            this.runCountUp();
          }
        });
      },
      { threshold: 0.2 }
    );

    this.statsObserver.observe(this.statsSection.nativeElement);
  }

  private runCountUp(): void {
    const duration = 1600;
    const startTime = performance.now();
    const targetLaureats = this.settings.statsLaureats ?? 1200;
    const targetTaux = this.settings.statsTauxReussite ?? 94;
    const targetFilieres = this.settings.statsFilieres ?? 15;
    const targetTitres = this.settings.statsTitresVerif ?? 100;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.laureatsDisplay = Math.floor(easeProgress * targetLaureats);
      this.tauxReussiteDisplay = Math.floor(easeProgress * targetTaux);
      this.filieresDisplay = Math.floor(easeProgress * targetFilieres);
      this.titresVerifDisplay = Math.floor(easeProgress * targetTitres);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.laureatsDisplay = targetLaureats;
        this.tauxReussiteDisplay = targetTaux;
        this.filieresDisplay = targetFilieres;
        this.titresVerifDisplay = targetTitres;
      }
    };

    requestAnimationFrame(animate);
  }

  onMouseMoveHeroWidget(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 6;
    const rotateY = (x / (rect.width / 2)) * 6;

    this.heroWidgetTransform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`;
  }

  onMouseLeaveHeroWidget(): void {
    this.heroWidgetTransform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  setActiveStep(step: number): void {
    this.activeStep = step;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  filtrerCategorie(cat: string): void {
    this.categorieActive = cat;
    this.filtrerFormations();
  }

  filtrerFormations(): void {
    let result = [...this.formationsList];

    if (this.categorieActive !== 'toutes') {
      result = result.filter((f) => f.categorie === this.categorieActive);
    }

    if (this.rechercheMotCle && this.rechercheMotCle.trim()) {
      const q = this.rechercheMotCle.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.titre.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.debouches.toLowerCase().includes(q) ||
          f.categorieNom.toLowerCase().includes(q)
      );
    }

    this.formationsFiltrees = result;
  }

  resetRecherche(): void {
    this.rechercheMotCle = '';
    this.categorieActive = 'toutes';
    this.filtrerFormations();
  }

  toggleFaq(index: number): void {
    this.faqList[index].ouvert = !this.faqList[index].ouvert;
  }

  verifierCertificat(): void {
    if (this.searchCertNumero && this.searchCertNumero.trim()) {
      const num = this.searchCertNumero.trim().toUpperCase();
      this.router.navigate(['/certificats/verifier', num]);
    }
  }

  demoCert(num: string): void {
    this.searchCertNumero = (num || '').trim().toUpperCase();
    this.verifierCertificat();
  }

  envoyerContact(): void {
    if (!this.contactForm.nom || !this.contactForm.telephone) {
      this.toast.error('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    this.submittingContact = true;
    this.landingService.submitContact(this.contactForm).subscribe({
      next: () => {
        this.submittingContact = false;
        this.toast.success('Votre demande d\'information a été transmise avec succès au secrétariat de Vitalis Center.');
        this.contactForm = { nom: '', telephone: '', filiere: '', message: '' };
      },
      error: () => {
        this.submittingContact = false;
        this.toast.error('Erreur lors de l\'envoi de votre demande.');
      },
    });
  }
}
