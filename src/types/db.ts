export type Member = {
  sid: string;
  name: {
    chi?: string;
    eng: string;
  };
  gender?: string;
  dob?: string;
  email?: string;
  phone?: string;
  studentStatus: {
    college: string;
    major: string;
    entryDate: string;
    gradDate: string;
  };
  memberStatus?: {
    since: number;
    lastRenewed: number;
    until: number;
  };
  createdAt: number;
  updatedAt: number;
};

export type Executive = {
  sid: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
};

export type Message = {
  message: string;
  updatedAt: number;
};
