export interface Customization {
    GenerateLocalStartupMoviesThumbnails(param0: number): Promise<number>;
    GetDownloadedStartupMovies(param0: string): Promise<StartupMovie[]>;
    GetLocalStartupMovies(): Promise<StartupMovie[]>;
}
export interface StartupMovie {
    strMovieURL: string;
}
