export type CollegeCode =
  | "CC"
  | "NA"
  | "UC"
  | "SC"
  | "WYS"
  | "WS"
  | "SH"
  | "MC"
  | "CW"
  | "NO";

export type College = {
  code: CollegeCode;
  englishName: string;
  chineseName: string;
};

declare const defaultExports: {
  colleges: College[];
};

export default defaultExports;
