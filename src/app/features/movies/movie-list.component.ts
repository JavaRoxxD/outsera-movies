import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';

interface MovieFilters {
  year: number | null;
  winner: boolean | null;
}

interface MovieListRequest extends MovieFilters {
  page: number;
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  styleUrl: './movie-list.component.scss',
  templateUrl: './movie-list.component.html',
})
export class MovieListComponent implements OnInit {
  private readonly movieService = inject(MovieService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly yearFilterChanges = new Subject<number | null>();
  private readonly winnerFilterChanges = new Subject<boolean | null>();
  private readonly pageChanges = new Subject<number>();

  readonly movies = signal<Movie[]>([]);
  readonly loadingRows = Array.from({ length: 15 }, (_, index) => index);
  readonly page = signal(0);
  readonly pageSize = 15;
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly yearFilter = signal<number | null>(null);
  readonly winnerFilter = signal<boolean | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const yearRequests = this.yearFilterChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map((year) => this.createRequest(0, year, this.winnerFilter())),
    );
    const winnerRequests = this.winnerFilterChanges.pipe(
      distinctUntilChanged(),
      map((winner) => this.createRequest(0, this.yearFilter(), winner)),
    );
    const pageRequests = this.pageChanges.pipe(
      distinctUntilChanged(),
      map((page) => this.createRequest(page, this.yearFilter(), this.winnerFilter())),
    );

    merge(
      of(this.createRequest(0, null, null)),
      yearRequests,
      winnerRequests,
      pageRequests,
    )
      .pipe(
        distinctUntilChanged(
          (previous, current) =>
            previous.page === current.page &&
            previous.year === current.year &&
            previous.winner === current.winner,
        ),
        switchMap((request) => {
          this.page.set(request.page);
          this.loading.set(true);
          this.error.set(null);

          return this.movieService
            .getMovies({
              page: request.page,
              size: this.pageSize,
              ...(request.year !== null ? { year: request.year } : {}),
              ...(request.winner !== null ? { winner: request.winner } : {}),
            })
            .pipe(
              tap((response) => {
                this.movies.set(response.content);
                this.page.set(response.number);
                this.totalElements.set(response.totalElements);
                this.totalPages.set(response.totalPages);
              }),
              catchError(() => {
                this.error.set('Unable to load movies. Please try again.');
                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onYearChanged(value: string): void {
    const year = Number(value);
    const normalizedYear =
      value.trim() && Number.isInteger(year) && year > 0 ? year : null;

    this.yearFilter.set(normalizedYear);
    this.page.set(0);
    this.yearFilterChanges.next(normalizedYear);
  }

  onWinnerChanged(value: string): void {
    const winner = value === 'true' ? true : value === 'false' ? false : null;

    this.winnerFilter.set(winner);
    this.page.set(0);
    this.winnerFilterChanges.next(winner);
  }

  goToPreviousPage(): void {
    if (this.page() > 0 && !this.loading()) {
      this.pageChanges.next(this.page() - 1);
    }
  }

  goToNextPage(): void {
    if (this.page() + 1 < this.totalPages() && !this.loading()) {
      this.pageChanges.next(this.page() + 1);
    }
  }

  private createRequest(
    page: number,
    year: number | null,
    winner: boolean | null,
  ): MovieListRequest {
    return { page, year, winner };
  }
}
