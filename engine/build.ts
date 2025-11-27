#!/usr/bin/env bun

import { Analyzer } from './Analyzer';
import { AnalyzerConfig } from './AnalyzerConfig';
import { writeFile } from 'fs/promises';
import path from 'path';

// Default configuration
const defaultConfig: AnalyzerConfig = {
  rootPath: path.join(process.cwd(), 'example'),
  entryPoints: ['App.tsx'],
  analysisLevel: 'fast',
  ignore: [
    '**/*.test.tsx',
    '**/*.spec.tsx',
    '**/*.stories.tsx',
    '**/node_modules/**',
  ],
  appName: 'Example App',
};

async function main() {
  try {
    console.log('Starting application analysis...\n');

    // Create analyzer
    const analyzer = new Analyzer(defaultConfig);

    // Run analysis
    const contextApp = await analyzer.analyze();

    // Write output to context.json
    const outputPath = path.join(process.cwd(), 'context.json');
    await writeFile(outputPath, JSON.stringify(contextApp, null, 2));

    console.log(`\nContext file generated: ${outputPath}`);
    console.log(`Found ${contextApp.rootComponents.length} root component(s)`);

    // Display summary
    const totalComponents = Object.keys(contextApp.components).length;
    const totalTranslations = Object.keys(contextApp.translations).length;

    console.log(`Total components: ${totalComponents}`);
    console.log(`Total translation keys: ${totalTranslations}`);

  } catch (error) {
    console.error('Error during analysis:', error);
    process.exit(1);
  }
}

main();
