export interface IDatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface IDatabaseConnection {
  authenticate(): Promise<void>;
  sync(options?: ISyncOptions): Promise<void>;
}

export interface ISyncOptions {
  force?: boolean;
  alter?: boolean;
}