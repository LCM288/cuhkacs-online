export type SeriesKey = string;
export type LocationKey = string;
export type BookKey = string;
export type BorrowKey = string;

export type LibrarySeries = {
  title: string;
  author: string;
  locations?: Record<LocationKey, number>;
  bookCount: number;
  borrowCount: number;
  keywordCount: number;
  createdAt: number;
  updatedAt: number;
};

export type LibraryBook = {
  seriesId: SeriesKey;
  volume: string;
  language: string;
  status: "on-loan" | "on-shelf" | "lost" | "deleted";
  location: LocationKey;
  borrowCount: number;
  isbn: string;
  createdAt: number;
  updatedAt: number;
};

export type LibraryLocation = {
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
  updatedAt: number;
};

export type LibraryMemberBorrowing = {
  borrowCount: number;
  borrows: Record<BorrowKey, true>;
  currentBorrowCount: number;
  currentBorrows: Record<BorrowKey, true>;
  updatedAt: number;
};

export const lengthLimits = {
  series: {
    title: 127,
    author: 127,
  },
  books: {
    volume: 15,
    language: 31,
    isbn: 16,
  },
  location: 16,
  keyword: 128,
};

/*
 * Verify and convert ISBN to its 13 digit format.
 * Return null if invalid.
 */
export const getISBN = (str: string): string | null => {
  if (str.length === 10) {
    {
      let checkSum10 = 0;
      for (let i = 0; i < 10; i++) {
        checkSum10 += (i + 1) * parseInt(str[i]);
      }
      if (checkSum10 % 11 !== 0) {
        return null;
      }
    }
    {
      let checkSum13 = 9 + 7 * 3 + 8;
      for (let i = 0; i < 9; i++) {
        checkSum13 += (i % 2 === 0 ? 3 : 1) * parseInt(str[i]);
      }
      let r = 10 - (checkSum13 % 10);
      r %= 10;
      return `${978}${str.substring(0, 9)}${r}`;
    }
  }
  if (str.length === 13) {
    // annoying @typescript-eslint/no-redeclare false positive here
    let checkSum13b = 0;
    for (let i = 0; i < 12; i++) {
      checkSum13b += (i % 2 === 0 ? 1 : 3) * parseInt(str[i]);
    }
    let rb = 10 - (checkSum13b % 10);
    rb %= 10;
    if (str[12] !== `${rb}`) {
      return null;
    }
    return str;
  }
  return null;
};

export const encodeLocation = (location: string): string => {
  return location.replaceAll(".", "_");
};

export const decodeLocation = (location: string): string => {
  return location.replaceAll("_", ".");
};
