export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string[];
  producers: string[];
  winner: boolean;
}

export interface SortMetadata {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableMetadata {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortMetadata;
  unpaged: boolean;
}

export interface MoviePageResponse {
  content: Movie[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableMetadata;
  size: number;
  sort: SortMetadata;
  totalElements: number;
  totalPages: number;
}

export interface YearWithMultipleWinners {
  winnerCount: number;
  year: number;
}

export interface YearsWithMultipleWinnersResponse {
  years: YearWithMultipleWinners[];
}

export interface StudioWinCount {
  name: string;
  winCount: number;
}

export interface StudiosWithWinCountResponse {
  studios: StudioWinCount[];
}

export interface ProducerWinInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface ProducerWinIntervalsResponse {
  min: ProducerWinInterval[];
  max: ProducerWinInterval[];
}

export interface WinnersByYearResponse {
  value: Movie[];
  Count: number;
}

export interface MovieQueryParams {
  page?: number;
  size?: number;
  winner?: boolean;
  year?: number;
}
