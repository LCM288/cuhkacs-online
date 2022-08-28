export type I18nString = {
  [lang: string]: string;
};

export type DisplayOptions = { color: string; isLight: boolean };

export type Faculty = {
  code: string;
  names: I18nString[];
  labels: I18nString[];
  display: DisplayOptions;
};

declare const defaultExports: {
  faculties: Faculty[];
};

export default defaultExports;
