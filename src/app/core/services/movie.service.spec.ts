import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Movie, MoviePageResponse, SortMetadata } from '../models/movie.model';
import { MovieService } from './movie.service';

const API_URL = 'https://challenge.outsera.tech/api/movies';
const SORT: SortMetadata = { empty: true, sorted: false, unsorted: true };

function createMovie(id: number): Movie {
  return {
    id,
    year: 2018,
    title: `Movie ${id}`,
    studios: ['Studio'],
    producers: ['Producer'],
    winner: true,
  };
}

function createPageResponse(page: number): MoviePageResponse {
  return {
    content: [],
    empty: true,
    first: page === 0,
    last: true,
    number: page,
    numberOfElements: 0,
    pageable: {
      offset: page * 15,
      pageNumber: page,
      pageSize: 15,
      paged: true,
      sort: SORT,
      unpaged: false,
    },
    size: 15,
    sort: SORT,
    totalElements: 0,
    totalPages: 0,
  };
}

describe('MovieService', () => {
  let service: MovieService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('requests the default server page', () => {
    service.getMovies().subscribe();

    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '0' &&
          request.params.get('size') === '15' &&
          request.params.get('year') === null &&
          request.params.get('winner') === null,
      )
      .flush(createPageResponse(0));
  });

  it('maps pagination and includes false winner and year filters', () => {
    service.getMovies({ page: 2, size: 10, year: 2018, winner: false }).subscribe();

    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '2' &&
          request.params.get('size') === '10' &&
          request.params.get('year') === '2018' &&
          request.params.get('winner') === 'false',
      )
      .flush(createPageResponse(2));
  });

  it('maps each dashboard endpoint and the requested winner year', () => {
    service.getYearsWithMultipleWinners().subscribe();
    service.getStudiosWithWinCount().subscribe();
    service.getProducerWinIntervals().subscribe();
    service.getWinnersByYear(2018).subscribe();

    httpTestingController
      .expectOne(`${API_URL}/yearsWithMultipleWinners`)
      .flush({ years: [] });
    httpTestingController
      .expectOne(`${API_URL}/studiosWithWinCount`)
      .flush({ studios: [] });
    httpTestingController
      .expectOne(`${API_URL}/maxMinWinIntervalForProducers`)
      .flush({ min: [], max: [] });
    httpTestingController
      .expectOne(
        (request) =>
          request.url === `${API_URL}/winnersByYear` &&
          request.params.get('year') === '2018',
      )
      .flush({ value: [], Count: 0 });
  });

  it('normalizes arrays, envelopes, a single movie, and null to Movie arrays', () => {
    const results: Movie[][] = [];
    service.getWinnersByYear(2018).subscribe((movies) => results.push(movies));
    service.getWinnersByYear(2019).subscribe((movies) => results.push(movies));
    service.getWinnersByYear(2020).subscribe((movies) => results.push(movies));
    service.getWinnersByYear(2021).subscribe((movies) => results.push(movies));

    httpTestingController
      .expectOne((request) => request.params.get('year') === '2018')
      .flush([createMovie(1), createMovie(2)]);
    httpTestingController
      .expectOne((request) => request.params.get('year') === '2019')
      .flush({ value: [createMovie(3)], Count: 1 });
    httpTestingController
      .expectOne((request) => request.params.get('year') === '2020')
      .flush(createMovie(4));
    httpTestingController
      .expectOne((request) => request.params.get('year') === '2021')
      .flush(null);

    expect(results).toEqual([
      [createMovie(1), createMovie(2)],
      [createMovie(3)],
      [createMovie(4)],
      [],
    ]);
  });
});
