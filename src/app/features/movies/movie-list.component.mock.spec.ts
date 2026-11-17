import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Movie, MoviePageResponse, MovieQueryParams, SortMetadata } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { MovieListComponent } from './movie-list.component';

const SORT: SortMetadata = { empty: true, sorted: false, unsorted: true };

function createPageResponse(year: number, winner: boolean): MoviePageResponse {
  const movie: Movie = {
    id: 1,
    year,
    title: `Movie ${year}`,
    studios: ['Studio'],
    producers: ['Producer'],
    winner,
  };

  return {
    content: [movie],
    empty: false,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 1,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 15,
      paged: true,
      sort: SORT,
      unpaged: false,
    },
    size: 15,
    sort: SORT,
    totalElements: 1,
    totalPages: 1,
  };
}

describe('MovieListComponent with a mocked MovieService', () => {
  let fixture: ComponentFixture<MovieListComponent>;
  let getMovies: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getMovies = vi.fn((query: MovieQueryParams) =>
      of(createPageResponse(query.year ?? 1980, query.winner ?? true)),
    );

    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        {
          provide: MovieService,
          useValue: { getMovies },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    fixture.detectChanges();
  });

  it('renders movies and requests updated data when the filters change', async () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Movie 1980');
    expect(getMovies).toHaveBeenNthCalledWith(1, { page: 0, size: 15 });

    const yearInput = root.querySelector('#year-filter') as HTMLInputElement;
    yearInput.value = '2018';
    yearInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(getMovies).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(getMovies).toHaveBeenNthCalledWith(2, {
      page: 0,
      size: 15,
      year: 2018,
    });
    expect(root.textContent).toContain('Movie 2018');

    const winnerSelect = root.querySelector('#winner-filter') as HTMLSelectElement;
    winnerSelect.value = 'false';
    winnerSelect.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(getMovies).toHaveBeenNthCalledWith(3, {
      page: 0,
      size: 15,
      year: 2018,
      winner: false,
    });
    expect(root.querySelector('.winner-badge')?.textContent?.trim()).toBe('No');
  });
});
