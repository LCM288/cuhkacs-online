export type I18nString = {
  [lang: string]: string;
};

export type Faculty = {
  code: string;
  names: I18nString[];
  labels: I18nString[];
};

declare const defaultExports: {
  faculties: Faculty[];
};

export default defaultExports;
