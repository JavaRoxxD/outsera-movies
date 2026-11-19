import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subject,
  catchError,
  finalize,
  switchMap,
  tap,
  timeout,
} from 'rxjs';
import {
  Movie,
  ProducerWinInterval,
  StudioWinCount,
  YearWithMultipleWinners,
} from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly movieService = inject(MovieService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly winnerSearches = new Subject<number | null>();
  private readonly requestTimeoutMs = 15_000;

  readonly years = signal<YearWithMultipleWinners[]>([]);
  readonly yearsLoading = signal(true);
  readonly yearsError = signal<string | null>(null);

  readonly studios = signal<StudioWinCount[]>([]);
  readonly topStudios = computed(() =>
    this.studios()
      .slice()
      .sort((first, second) => second.winCount - first.winCount)
      .slice(0, 3),
  );
  readonly studiosLoading = signal(true);
  readonly studiosError = signal<string | null>(null);

  readonly maximumIntervals = signal<ProducerWinInterval[]>([]);
  readonly minimumIntervals = signal<ProducerWinInterval[]>([]);
  readonly intervalsLoading = signal(true);
  readonly intervalsError = signal<string | null>(null);

  readonly winnersByYear = signal<Movie[]>([]);
  readonly winnersLoading = signal(false);
  readonly winnersError = signal<string | null>(null);
  readonly winnerSearchSubmitted = signal(false);
  readonly searchedYear = signal<number | null>(null);

  ngOnInit(): void {
    this.loadYears();
    this.loadStudios();
    this.loadProducerIntervals();
    this.listenForWinnerSearches();
  }

  searchWinners(event: Event, yearInput: string): void {
    event.preventDefault();
    const year = Number(yearInput);

    if (!yearInput.trim() || !Number.isInteger(year) || year <= 0) {
      this.winnerSearchSubmitted.set(true);
      this.winnersError.set('Enter a valid year.');
      this.winnersLoading.set(false);
      this.winnerSearches.next(null);
      return;
    }

    this.winnerSearchSubmitted.set(true);
    this.searchedYear.set(year);
    this.winnersError.set(null);
    this.winnerSearches.next(year);
  }

  private loadYears(): void {
    this.movieService
      .getYearsWithMultipleWinners()
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.yearsLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.years.set(response.years);
        },
        error: () => {
          this.yearsError.set('Unable to load years with multiple winners.');
        },
      });
  }

  private loadStudios(): void {
    this.movieService
      .getStudiosWithWinCount()
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.studiosLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.studios.set(response.studios);
        },
        error: () => {
          this.studiosError.set('Unable to load studios with winners.');
        },
      });
  }

  private loadProducerIntervals(): void {
    this.movieService
      .getProducerWinIntervals()
      .pipe(
        timeout({ first: this.requestTimeoutMs }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.intervalsLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.maximumIntervals.set(response.max);
          this.minimumIntervals.set(response.min);
        },
        error: () => {
          this.intervalsError.set('Unable to load producer win intervals.');
        },
      });
  }

  private listenForWinnerSearches(): void {
    this.winnerSearches
      .pipe(
        switchMap((year) => {
          if (year === null) {
            this.winnersLoading.set(false);
            return EMPTY;
          }

          this.winnersLoading.set(true);
          this.winnersError.set(null);
          this.winnersByYear.set([]);

          return this.movieService.getWinnersByYear(year).pipe(
            timeout({ first: this.requestTimeoutMs }),
            tap((movies) => this.winnersByYear.set(movies)),
            catchError(() => {
              this.winnersError.set('Unable to load winners for this year.');
              return EMPTY;
            }),
            finalize(() => this.winnersLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
