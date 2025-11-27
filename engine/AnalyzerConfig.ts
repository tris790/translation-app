export type AnalysisLevel = 'fast' | 'detailed';

export interface AnalyzerConfig {
  /**
   * Root path of the application to analyze
   */
  rootPath: string;

  /**
   * Entry point files (e.g., ['App.tsx', 'index.tsx'])
   * If not specified, will auto-detect common entry points
   */
  entryPoints?: string[];

  /**
   * Analysis level - 'fast' for basic analysis, 'detailed' for deep analysis
   * @default 'fast'
   */
  analysisLevel?: AnalysisLevel;

  /**
   * Glob patterns to ignore (e.g., ['**\/*.test.tsx', '**\/*.spec.tsx'])
   */
  ignore?: string[];

  /**
   * Path to tsconfig.json (optional)
   * If not provided, will use default TypeScript compiler options
   */
  tsConfigPath?: string;

  /**
   * Application name
   * If not provided, will use the directory name
   */
  appName?: string;
}
