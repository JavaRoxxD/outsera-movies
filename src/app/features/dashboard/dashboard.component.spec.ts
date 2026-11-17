import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

const API_URL = 'https://challenge.outsera.tech/api/movies';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne(`${API_URL}/yearsWithMultipleWinners`)
      .flush({ years: [{ year: 1986, winnerCount: 2 }] });
    httpTestingController
      .expectOne(`${API_URL}/studiosWithWinCount`)
      .flush({
        studios: [
          { name: 'Studio Delta', winCount: 4 },
          { name: 'Studio Alpha', winCount: 12 },
          { name: 'Studio Gamma', winCount: 5 },
          { name: 'Studio Beta', winCount: 9 },
        ],
      });
    httpTestingController
      .expectOne(`${API_URL}/maxMinWinIntervalForProducers`)
      .flush({
        min: [
          {
            producer: 'Producer Min',
            interval: 1,
            previousWin: 1990,
            followingWin: 1991,
          },
        ],
        max: [
          {
            producer: 'Producer Max',
            interval: 13,
            previousWin: 2002,
            followingWin: 2015,
          },
        ],
      });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('renders the dashboard data and sorts studios before limiting to three', () => {
    const dashboard = fixture.nativeElement as HTMLElement;
    const studioRows = Array.from(
      dashboard.querySelectorAll('.studio-card tbody tr'),
    ).map((row) => row.textContent?.trim());

    expect(dashboard.querySelector('.dashboard-grid')?.children.length).toBe(4);
    expect(dashboard.textContent).toContain('1986');
    expect(dashboard.textContent).toContain('Producer Max');
    expect(dashboard.textContent).toContain('Producer Min');
    expect(studioRows).toEqual([
      'Studio Alpha12',
      'Studio Beta9',
      'Studio Gamma5',
    ]);
  });

  it('searches winners by year and renders the result columns', () => {
    const dashboard = fixture.nativeElement as HTMLElement;
    const input = dashboard.querySelector('#winner-year') as HTMLInputElement;
    input.value = '2018';
    const form = dashboard.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    httpTestingController
      .expectOne(
        (request) =>
          request.url === `${API_URL}/winnersByYear` &&
          request.params.get('year') === '2018',
      )
      .flush({
        value: [
          {
            id: 197,
            year: 2018,
            title: 'Holmes & Watson',
            studios: ['Columbia Pictures'],
            producers: ['Adam McKay'],
            winner: true,
          },
        ],
        Count: 1,
      });
    fixture.detectChanges();

    const table = dashboard.querySelector('.dashboard-card:last-child table');
    const headings = Array.from(table?.querySelectorAll('th') ?? []).map((heading) =>
      heading.textContent?.trim(),
    );
    expect(headings).toEqual(['Id', 'Year', 'Title']);
    expect(table?.textContent).toContain('Holmes & Watson');
  });

  it('shows an empty state before searching and when no winners are found', () => {
    const dashboard = fixture.nativeElement as HTMLElement;
    expect(dashboard.textContent).toContain('Search for a year to see its winning movies.');

    const input = dashboard.querySelector('#winner-year') as HTMLInputElement;
    input.value = '1900';
    const form = dashboard.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    httpTestingController
      .expectOne(
        (request) =>
          request.url === `${API_URL}/winnersByYear` &&
          request.params.get('year') === '1900',
      )
      .flush({ value: [], Count: 0 });
    fixture.detectChanges();

    expect(dashboard.textContent).toContain('No winners found for the year 1900.');
  });
});
