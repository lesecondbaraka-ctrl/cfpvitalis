import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quiz {
  id: string;
  titre: string;
  moduleId: string;
  dureeMinutes?: number;
  questions?: QuestionQuiz[];
  _count?: { questions: number; tentatives: number };
}

export interface QuestionQuiz {
  id: string;
  enonce: string;
  ordre: number;
  options: { text: string; correct?: boolean }[];
}

export interface TentativeQuiz {
  id: string;
  score: number;
  datePassage: string;
  quiz?: { titre: string; module?: { formation?: { titre: string } } };
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private url = `${environment.apiUrl}/quiz`;

  constructor(private http: HttpClient) {}

  getByModule(moduleId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.url}/module/${moduleId}`);
  }

  getOne(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.url}/${id}`);
  }

  create(moduleId: string, data: { titre: string; dureeMinutes?: number; questions: { enonce: string; options: { text: string; correct: boolean }[] }[] }): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.url}/module/${moduleId}`, data);
  }

  submit(quizId: string, reponses: { questionId: string; selectedIndex: number }[]): Observable<TentativeQuiz> {
    return this.http.post<TentativeQuiz>(`${this.url}/${quizId}/submit`, { reponses });
  }

  mesTentatives(): Observable<TentativeQuiz[]> {
    return this.http.get<TentativeQuiz[]>(`${this.url}/mes/tentatives`);
  }
}
