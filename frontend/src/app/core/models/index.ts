export type UUID = string;

export interface Etablissement {
  id: string;
  nom: string;
  codeAntenne?: string;
  adresse?: string;
  createdAt?: string;
  _count?: { utilisateurs: number; formations: number };
}

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  etablissementId: string;
  actif?: boolean;
  createdAt?: string;
  etablissement?: { nom: string };
}

export interface Formation {
  id: string;
  titre: string;
  description?: string;
  etablissementId: string;
  modules?: Module[];
  etablissement?: { nom: string };
}

export interface Module {
  id: string;
  titre: string;
  ordre: number;
  coefficient?: number;
  cours?: Cours[];
  evaluations?: Evaluation[];
  _count?: { cours: number };
}

export interface Cours {
  id: string;
  titre: string;
  contenu?: string;
  fileUrl?: string;
  moduleId?: string;
  complete?: boolean;
  module?: { formation?: Formation };
}

export interface Evaluation {
  id: string;
  titre: string;
  noteMaximale?: number;
  moduleId?: string;
  notes?: Note[];
}

export interface Note {
  id: string;
  valeur: number;
  utilisateurId: string;
  evaluationId: string;
}

export interface Certificat {
  id: string;
  numeroSerie: string;
  urlPdfS3: string;
  moyenneGenerale: number;
  dateEmission: string;
  formation?: { titre: string };
}

export interface Seance {
  id: string;
  titreActivite: string;
  typeSession: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  salleOuLien?: string;
  moduleId: string;
  formateur?: { nom: string; prenom: string };
  module?: { formation?: { titre: string } };
  presences?: Presence[];
  _count?: { presences: number };
}

export interface Presence {
  seanceId: string;
  utilisateurId: string;
  statut: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE';
  remarqueJustification?: string;
  utilisateur?: { id: string; nom: string; prenom: string; email: string };
}

export interface KpiGlobal {
  etablissements: number;
  apprenants: number;
  formateurs: number;
  formations: number;
  certificatsEmis: number;
  seancesPlanifiees: number;
}

export interface KpiEtablissement {
  etablissementId: string;
  apprenants: number;
  formations: number;
  certificatsEmis: number;
  tauxAssiduite: number;
  tauxCompletion: number;
  moyenneGenerale: number;
}

export interface ProgressInfo {
  totalCours: number;
  totalObligatoire: number;
  completedObligatoire: number;
  completionRate: number;
}
