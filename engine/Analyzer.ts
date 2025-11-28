import ts from 'typescript';
import { glob } from 'glob';
import { AnalyzerConfig } from './AnalyzerConfig';
import { Component, ContextApp, Prop, Hook } from './Types';
import path from 'path';
import { createHash } from 'crypto';

interface ComponentMetadata {
  id: string;
  path: string;
  name: string;
  props: Prop[];
  hooks: Hook[];
  translations: string[];
  childrenIds: string[];
  parentIds: string[];
  sourceFile: ts.SourceFile;
  node: ts.FunctionDeclaration | ts.VariableDeclaration;
  imports: Map<string, string>; // component name -> import source
  cssImports: string[]; // CSS files imported by this component
  jsxElements: Array<{
    tagName: string;
    isConditional: boolean;
    isDynamic: boolean;
    isLazy: boolean;
  }>;
}

export class Analyzer {
  private program!: ts.Program;
  private checker!: ts.TypeChecker;
  private componentMap = new Map<string, ComponentMetadata>();
  private config: Required<AnalyzerConfig>;

  constructor(config: AnalyzerConfig) {
    this.config = {
      rootPath: config.rootPath,
      entryPoints: config.entryPoints || ['App.tsx', 'index.tsx', 'main.tsx'],
      analysisLevel: config.analysisLevel || 'fast',
      ignore: config.ignore || ['**/*.test.tsx', '**/*.spec.tsx', '**/*.stories.tsx', '**/node_modules/**'],
      tsConfigPath: config.tsConfigPath || '',
      appName: config.appName || path.basename(path.resolve(config.rootPath)),
    };
  }

  /**
   * Main analysis method
   */
  async analyze(): Promise<ContextApp> {
    console.time('Analysis completed in');

    // Step 1: Find all component files
    const files = await this.findComponentFiles();
    console.log(`Found ${files.length} component files`);

    // Step 2: Create TypeScript program
    this.createProgram(files);

    // Step 3: Extract all components
    console.log('Extracting components...');
    for (const sourceFile of this.program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile && sourceFile.fileName.includes(this.config.rootPath)) {
        this.extractComponents(sourceFile);
      }
    }
    console.log(`Found ${this.componentMap.size} components`);

    // Step 4: Build component tree (parent-child relationships)
    console.log('Building component tree...');
    this.buildComponentTree();

    // Step 5: Build flat component map and translation index
    console.log('Building output structure...');
    const components: Record<string, Component> = {};
    const translations: Record<string, string[]> = {};

    for (const component of this.componentMap.values()) {
      // Add component to flat map
      components[component.id] = {
        id: component.id,
        path: component.path,
        name: component.name,
        props: component.props,
        hooks: component.hooks,
        translations: component.translations,
        childrenIds: component.childrenIds,
        parentIds: component.parentIds,
        cssImports: component.cssImports,
      };

      // Build translation reverse index
      for (const translationKey of component.translations) {
        if (!translations[translationKey]) {
          translations[translationKey] = [];
        }
        translations[translationKey].push(component.id);
      }
    }

    // Find root components (those with no parents)
    const rootComponents = Array.from(this.componentMap.values())
      .filter(c => c.parentIds.length === 0)
      .map(c => c.id);

    console.timeEnd('Analysis completed in');

    return {
      name: this.config.appName,
      components,
      rootComponents,
      translations,
    };
  }

  /**
   * Find all TypeScript/TSX files to analyze
   */
  private async findComponentFiles(): Promise<string[]> {
    const patterns = [
      `${this.config.rootPath}/**/*.tsx`,
      `${this.config.rootPath}/**/*.ts`,
    ];

    const allFiles: string[] = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        ignore: this.config.ignore,
        absolute: true,
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  /**
   * Create TypeScript program for analysis
   */
  private createProgram(files: string[]): void {
    let compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
    };

    // Load tsconfig if provided
    if (this.config.tsConfigPath) {
      const configFile = ts.readConfigFile(this.config.tsConfigPath, ts.sys.readFile);
      if (!configFile.error) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(this.config.tsConfigPath)
        );
        compilerOptions = parsedConfig.options;
      }
    }

    this.program = ts.createProgram({
      rootNames: files,
      options: compilerOptions,
    });

    this.checker = this.program.getTypeChecker();
  }

  /**
   * Extract components from a source file
   */
  private extractComponents(sourceFile: ts.SourceFile): void {
    // First, extract imports
    const imports = this.extractImports(sourceFile);
    const cssImports = this.extractCSSImports(sourceFile);

    const visit = (node: ts.Node) => {
      // Function declarations: function MyComponent() {}
      if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text;
        if (this.isComponentName(name)) {
          this.createComponent(sourceFile, node, name, imports, cssImports);
        }
      }

      // Variable declarations: const MyComponent = () => {}
      if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name)) {
            const name = declaration.name.text;
            if (this.isComponentName(name) && declaration.initializer) {
              if (
                ts.isArrowFunction(declaration.initializer) ||
                ts.isFunctionExpression(declaration.initializer)
              ) {
                this.createComponent(sourceFile, declaration, name, imports, cssImports);
              }
              // Handle HOCs: const MyComponent = memo(() => {})
              if (ts.isCallExpression(declaration.initializer)) {
                const unwrapped = this.unwrapHOC(declaration.initializer);
                if (unwrapped) {
                  this.createComponent(sourceFile, declaration, name, imports, cssImports);
                }
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  /**
   * Extract imports from a source file
   */
  private extractImports(sourceFile: ts.SourceFile): Map<string, string> {
    const imports = new Map<string, string>();

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

        if (node.importClause) {
          // Default import: import App from './App'
          if (node.importClause.name) {
            const name = node.importClause.name.text;
            if (this.isComponentName(name)) {
              imports.set(name, moduleSpecifier);
            }
          }

          // Named imports: import { MainPage, ContactPage } from './components'
          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              for (const element of node.importClause.namedBindings.elements) {
                const name = element.name.text;
                if (this.isComponentName(name)) {
                  imports.set(name, moduleSpecifier);
                }
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return imports;
  }

  /**
   * Extract CSS imports from a source file
   * Detects: import './styles.css', import "./component.css"
   */
  private extractCSSImports(sourceFile: ts.SourceFile): string[] {
    const cssImports: string[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

        // Check if it's a CSS file import (side-effect import)
        if (moduleSpecifier.endsWith('.css')) {
          // Resolve relative to source file
          const sourceDir = path.dirname(sourceFile.fileName);
          const resolvedPath = path.resolve(sourceDir, moduleSpecifier);
          cssImports.push(resolvedPath);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return cssImports;
  }

  /**
   * Generate a unique ID for a component
   * Uses relative path from rootPath for portability across different machines
   */
  private generateComponentId(name: string, filePath: string): string {
    // Use relative path from rootPath for portable hashes
    const relativePath = path.relative(this.config.rootPath, filePath);
    // Normalize to use forward slashes for cross-platform consistency
    const normalizedPath = relativePath.split(path.sep).join('/');
    const hash = createHash('md5').update(normalizedPath).digest('hex').substring(0, 8);
    return `${name}_${hash}`;
  }

  /**
   * Create a component metadata object
   */
  private createComponent(
    sourceFile: ts.SourceFile,
    node: ts.FunctionDeclaration | ts.VariableDeclaration,
    name: string,
    imports: Map<string, string>,
    cssImports: string[]
  ): void {
    const id = this.generateComponentId(name, sourceFile.fileName);

    const component: ComponentMetadata = {
      id,
      path: sourceFile.fileName,
      name,
      props: this.extractProps(node),
      hooks: this.extractHooks(node),
      translations: this.extractTranslations(node),
      childrenIds: [],
      parentIds: [],
      sourceFile,
      node,
      imports,
      cssImports,
      jsxElements: this.extractJSXElements(node),
    };

    this.componentMap.set(id, component);
  }

  /**
   * Extract props from a component node
   */
  private extractProps(node: ts.FunctionDeclaration | ts.VariableDeclaration): Prop[] {
    const props: Prop[] = [];

    let functionNode: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | null = null;

    if (ts.isFunctionDeclaration(node)) {
      functionNode = node;
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        functionNode = node.initializer;
      } else if (ts.isCallExpression(node.initializer)) {
        // Handle HOCs
        const unwrapped = this.unwrapHOC(node.initializer);
        if (unwrapped && (ts.isArrowFunction(unwrapped) || ts.isFunctionExpression(unwrapped))) {
          functionNode = unwrapped;
        }
      }
    }

    if (!functionNode || !functionNode.parameters || functionNode.parameters.length === 0) {
      return props;
    }

    const propsParam = functionNode.parameters[0];

    // Destructured props: ({ title, email }) => {}
    if (ts.isObjectBindingPattern(propsParam.name)) {
      for (const element of propsParam.name.elements) {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          props.push({
            name: element.name.text,
            type: element.type ? element.type.getText() : 'any',
          });
        }
      }
    } else {
      // Regular props: (props: Props) => {}
      const type = this.checker.getTypeAtLocation(propsParam);
      for (const prop of type.getProperties()) {
        const propType = this.checker.getTypeOfSymbolAtLocation(prop, propsParam);
        props.push({
          name: prop.getName(),
          type: this.checker.typeToString(propType),
        });
      }
    }

    return props;
  }

  /**
   * Extract hooks from a component node
   */
  private extractHooks(node: ts.FunctionDeclaration | ts.VariableDeclaration): Hook[] {
    const hooks: Hook[] = [];
    const seen = new Set<string>(); // Avoid duplicates

    let functionNode: ts.Node = node;

    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        functionNode = node.initializer;
      } else if (ts.isCallExpression(node.initializer)) {
        const unwrapped = this.unwrapHOC(node.initializer);
        if (unwrapped) {
          functionNode = unwrapped;
        }
      }
    }

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const name = node.expression.text;
        if (name.startsWith('use') && !seen.has(name)) {
          seen.add(name);
          const type = this.checker.typeToString(this.checker.getTypeAtLocation(node));
          hooks.push({ name, type });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(functionNode);
    return hooks;
  }

  /**
   * Extract translation keys from intl.formatMessage calls
   */
  private extractTranslations(node: ts.FunctionDeclaration | ts.VariableDeclaration): string[] {
    const translations: string[] = [];
    const seen = new Set<string>();

    let functionNode: ts.Node = node;

    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        functionNode = node.initializer;
      } else if (ts.isCallExpression(node.initializer)) {
        const unwrapped = this.unwrapHOC(node.initializer);
        if (unwrapped) {
          functionNode = unwrapped;
        }
      }
    }

    const visit = (node: ts.Node) => {
      // Look for intl.formatMessage({ id: "key" })
      if (ts.isCallExpression(node)) {
        const expr = node.expression;

        // Check if it's a property access (intl.formatMessage)
        if (ts.isPropertyAccessExpression(expr)) {
          const methodName = expr.name.text;

          // Look for formatMessage calls
          if (methodName === 'formatMessage' && node.arguments.length > 0) {
            const arg = node.arguments[0];

            // Check if argument is an object literal { id: "key" }
            if (ts.isObjectLiteralExpression(arg)) {
              for (const prop of arg.properties) {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                  if (prop.name.text === 'id' && ts.isStringLiteral(prop.initializer)) {
                    const key = prop.initializer.text;
                    if (!seen.has(key)) {
                      seen.add(key);
                      translations.push(key);
                    }
                  }
                }
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(functionNode);
    return translations;
  }

  /**
   * Extract JSX elements from a component
   */
  private extractJSXElements(
    node: ts.FunctionDeclaration | ts.VariableDeclaration
  ): Array<{ tagName: string; isConditional: boolean; isDynamic: boolean; isLazy: boolean }> {
    const jsxElements: Array<{ tagName: string; isConditional: boolean; isDynamic: boolean; isLazy: boolean }> = [];

    let functionNode: ts.Node = node;

    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        functionNode = node.initializer;
      } else if (ts.isCallExpression(node.initializer)) {
        const unwrapped = this.unwrapHOC(node.initializer);
        if (unwrapped) {
          functionNode = unwrapped;
        }
      }
    }

    const visit = (node: ts.Node, isConditional = false, isDynamic = false) => {
      // Check if we're inside a conditional block
      const inConditional = isConditional ||
        ts.isIfStatement(node) ||
        ts.isConditionalExpression(node) ||
        ts.isSwitchStatement(node);

      // Check if we're in a dynamic context (map, function call, etc.)
      const inDynamic = isDynamic ||
        (ts.isCallExpression(node) && node.expression.getText().includes('map'));

      if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
        const tagName = node.tagName.getText();
        if (this.isComponentName(tagName)) {
          jsxElements.push({
            tagName,
            isConditional: inConditional,
            isDynamic: inDynamic,
            isLazy: this.isLazyComponent(node),
          });
        }
      }

      ts.forEachChild(node, (child) => visit(child, inConditional, inDynamic));
    };

    visit(functionNode);
    return jsxElements;
  }

  /**
   * Build parent-child relationships using IDs
   */
  private buildComponentTree(): void {
    // First, create a name-to-id map for quick lookups
    const nameToIds = new Map<string, string[]>();
    for (const component of this.componentMap.values()) {
      if (!nameToIds.has(component.name)) {
        nameToIds.set(component.name, []);
      }
      nameToIds.get(component.name)!.push(component.id);
    }

    // Build relationships
    for (const component of this.componentMap.values()) {
      for (const jsx of component.jsxElements) {
        const childIds = nameToIds.get(jsx.tagName);

        if (childIds) {
          for (const childId of childIds) {
            // Add child to this component (if not already added)
            if (!component.childrenIds.includes(childId)) {
              component.childrenIds.push(childId);
            }

            // Add this component as parent of child
            const childComponent = this.componentMap.get(childId);
            if (childComponent && !childComponent.parentIds.includes(component.id)) {
              childComponent.parentIds.push(component.id);
            }
          }
        }
      }
    }
  }

  /**
   * Check if a name looks like a component (starts with uppercase)
   */
  private isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
  }

  /**
   * Unwrap common HOC patterns (memo, forwardRef, etc.)
   */
  private unwrapHOC(node: ts.CallExpression): ts.Node | null {
    const expr = node.expression;
    if (ts.isIdentifier(expr)) {
      const name = expr.text;
      // Common HOCs
      if (['memo', 'forwardRef', 'observer'].includes(name)) {
        return node.arguments[0] || null;
      }
    }
    return null;
  }

  /**
   * Check if a JSX element is a lazy component
   */
  private isLazyComponent(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement): boolean {
    // This is a simplified check - in reality, you'd need to track
    // which components were created with React.lazy
    return false;
  }
}
