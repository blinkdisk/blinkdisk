export type CodeStatsFile = {
  path: string;
  language: string;
  lines: number;
  characters: number;
};

export type CodeStatsRepository = {
  provider: "github" | "gitlab";
  owner: string;
  name: string;
};
