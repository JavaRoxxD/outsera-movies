import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Movie, MoviePageResponse, SortMetadata } from '../../core/models/movie.model';
import { MovieListComponent } from './movie-list.component';

const API_URL = 'https://challenge.outsera.tech/api/movies';
const PAGE_SIZE = 15;
const SORT: SortMetadata = { empty: true, sorted: false, unsorted: true };

function createMovie(id: number, year: number, winner: boolean): Movie {
  return {
    id,
    year,
    title: `Movie ${id}`,
    studios: ['Studio'],
    producers: ['Producer'],
    winner,
  };
}

function createPageResponse(
  page: number,
  content: Movie[],
  totalPages: number,
  totalElements: number,
): MoviePageResponse {
  return {
    content,
    empty: content.length === 0,
    first: page === 0,
    last: page >= totalPages - 1,
    number: page,
    numberOfElements: content.length,
    pageable: {
      offset: page * PAGE_SIZE,
      pageNumber: page,
      pageSize: PAGE_SIZE,
      paged: true,
      sort: SORT,
      unpaged: false,
    },
    size: PAGE_SIZE,
    sort: SORT,
    totalElements,
    totalPages,
  };
}

describe('MovieListComponent', () => {
  let fixture: ComponentFixture<MovieListComponent>;
  let component: MovieListComponent;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '0' &&
          request.params.get('size') === '15',
      )
      .flush(createPageResponse(0, [createMovie(1, 1980, true)], 3, 35));
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the first server page and displays required columns and winner status', () => {
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const headings = Array.from(table.querySelectorAll('thead th')).map(
      (heading) =>
        heading.querySelector('label')?.textContent?.trim() ??
        heading.textContent?.trim(),
    );

    expect(headings).toEqual(['ID', 'Year', 'Title', 'Winner?']);
    expect(table.textContent).toContain('Movie 1');
    expect(table.textContent).toContain('Yes');
    expect(component.totalElements()).toBe(35);
    expect(component.totalPages()).toBe(3);
  });

  it('paginates on the server and combines year and winner filters from page zero', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const table = root.querySelector('table');
    const tableHeader = table?.querySelector('thead');
    const pagination = root.querySelector('.pagination');

    component.goToNextPage();
    fixture.detectChanges();

    expect(root.querySelector('table')).toBe(table);
    expect(table?.querySelector('thead')).toBe(tableHeader);
    expect(root.querySelector('.pagination')).toBe(pagination);
    expect(root.querySelectorAll('tbody .skeleton-row')).toHaveLength(15);

    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '1' &&
          request.params.get('size') === '15',
      )
      .flush(createPageResponse(1, [createMovie(2, 1981, false)], 3, 35));
    fixture.detectChanges();
    expect(component.page()).toBe(1);
    expect(root.querySelector('table')).toBe(table);
    expect(table?.querySelector('thead')).toBe(tableHeader);
    expect(root.querySelector('.pagination')).toBe(pagination);

    component.goToPreviousPage();
    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '0' &&
          request.params.get('size') === '15',
      )
      .flush(createPageResponse(0, [createMovie(1, 1980, true)], 3, 35));
    fixture.detectChanges();

    component.onYearChanged('2018');
    httpTestingController.expectNone((request) => request.url === API_URL);
    await new Promise((resolve) => setTimeout(resolve, 350));

    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '0' &&
          request.params.get('year') === '2018' &&
          request.params.get('winner') === null,
      )
      .flush(createPageResponse(0, [createMovie(3, 2018, false)], 1, 1));
    fixture.detectChanges();

    component.onWinnerChanged('false');
    httpTestingController
      .expectOne(
        (request) =>
          request.url === API_URL &&
          request.params.get('page') === '0' &&
          request.params.get('year') === '2018' &&
          request.params.get('winner') === 'false',
      )
      .flush(createPageResponse(0, [], 0, 0));
    fixture.detectChanges();

    expect(component.page()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain(
      'No movies found for the selected filters.',
    );
  });
});
