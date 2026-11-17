import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import {
  MoviePageResponse,
  MovieQueryParams,
  ProducerWinIntervalsResponse,
  StudiosWithWinCountResponse,
  WinnersByYearResponse,
  YearsWithMultipleWinnersResponse,
} from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://challenge.outsera.tech/api/movies';

  getMovies(query: MovieQueryParams = {}): Observable<MoviePageResponse> {
    let params = new HttpParams()
      .set('page', query.page ?? 0)
      .set('size', query.size ?? 15);

    if (query.winner !== undefined) {
      params = params.set('winner', query.winner);
    }

    if (query.year !== undefined) {
      params = params.set('year', query.year);
    }

    return this.http
      .get<MoviePageResponse>(this.baseUrl, { params })
      .pipe(catchError(this.handleError('buscar filmes')));
  }

  getYearsWithMultipleWinners(): Observable<YearsWithMultipleWinnersResponse> {
    return this.http
      .get<YearsWithMultipleWinnersResponse>(`${this.baseUrl}/yearsWithMultipleWinners`)
      .pipe(catchError(this.handleError('buscar anos com múltiplos vencedores')));
  }

  getStudiosWithWinCount(): Observable<StudiosWithWinCountResponse> {
    return this.http
      .get<StudiosWithWinCountResponse>(`${this.baseUrl}/studiosWithWinCount`)
      .pipe(catchError(this.handleError('buscar estúdios com vitórias')));
  }

  getProducerWinIntervals(): Observable<ProducerWinIntervalsResponse> {
    return this.http
      .get<ProducerWinIntervalsResponse>(
        `${this.baseUrl}/maxMinWinIntervalForProducers`,
      )
      .pipe(catchError(this.handleError('buscar intervalos de vitórias dos produtores')));
  }

  getWinnersByYear(year: number): Observable<WinnersByYearResponse> {
    const params = new HttpParams().set('year', year);

    return this.http
      .get<WinnersByYearResponse>(`${this.baseUrl}/winnersByYear`, { params })
      .pipe(catchError(this.handleError('buscar vencedores por ano')));
  }

  private handleError(context: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`Não foi possível ${context}.`, error);
      return throwError(() => error);
    };
  }
}
