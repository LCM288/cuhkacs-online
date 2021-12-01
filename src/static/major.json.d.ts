export type Major = {
  code: string;
  englishName: string;
  chineseName: string;
  faculties: string[];
};

declare const defaultExports: {
  majors: Major[];
};

export default defaultExports;
