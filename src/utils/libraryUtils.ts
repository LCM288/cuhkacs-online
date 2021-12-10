export type SeriesKey = string;
export type LocationKey = string;
export type BookKey = string;
export type BorrowKey = string;

export type LibrarySeries = {
  title: string;
  author: string;
  locationCount: number;
  locations: Record<LocationKey, true>;
  volumeCount: number;
  borrowCount: number;
  keywordCount: number;
  createdAt: number;
  updatedAt: number;
};

export type LibraryBook = {
  seriesId: SeriesKey;
  volumn: string;
  language: string;
  status: "on-loan" | "on-shelf" | "lost" | "deleted";
  location: LocationKey;
  borrowCount: number;
  isbn: string;
  createdAt: number;
  updatedAt: number;
};

export type LibraryLocation = {
  seriesCount: number;
  bookCount: number;
  createdAt: number;
  updatedAt: number;
};

export type LibraryBorrow = {
  sid: string;
  seriesId: SeriesKey;
  bookId: BookKey;
  borrowTime: number;
  dueDate: string;
  renewCount: number;
  returnTime: number;
  createdAt: number;
  updatedAt: number;
};

export type LibraryKeyword = {
  seriesCount: number;
  series: Record<SeriesKey, true>;
  createdAt: number;
  updatedAt: number;
};

export type LibraryMemberBorrowing = {
  borrowCount: number;
  borrows: Record<BorrowKey, true>;
  currentBorrowCount: number;
  currentBorrows: Record<BorrowKey, true>;
  updatedAt: number;
};
