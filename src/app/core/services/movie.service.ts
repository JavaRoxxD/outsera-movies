import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Movie,
  MoviePageResponse,
  MovieQueryParams,
  ProducerWinIntervalsResponse,
  StudiosWithWinCountResponse,
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

  getWinnersByYear(year: number): Observable<Movie[]> {
    const params = new HttpParams().set('year', year);

    return this.http
      .get<unknown>(`${this.baseUrl}/winnersByYear`, { params })
      .pipe(
        map((response) => normalizeWinnersByYearResponse(response)),
        catchError(this.handleError('buscar vencedores por ano')),
      );
  }

  private handleError(context: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`Não foi possível ${context}.`, error);
      return throwError(() => error);
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMovie(value: unknown): value is Movie {
  return (
    isRecord(value) &&
    typeof value['id'] === 'number' &&
    typeof value['year'] === 'number' &&
    typeof value['title'] === 'string' &&
    typeof value['winner'] === 'boolean' &&
    Array.isArray(value['studios']) &&
    value['studios'].every((studio: unknown) => typeof studio === 'string') &&
    Array.isArray(value['producers']) &&
    value['producers'].every((producer: unknown) => typeof producer === 'string')
  );
}

function normalizeWinnersByYearResponse(response: unknown): Movie[] {
  if (Array.isArray(response)) {
    return response.filter(isMovie);
  }

  if (!isRecord(response)) {
    return [];
  }

  const envelopeValue = response['value'];
  if (Array.isArray(envelopeValue)) {
    return envelopeValue.filter(isMovie);
  }

  return isMovie(response) ? [response] : [];
}
