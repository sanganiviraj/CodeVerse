import * as parser from '@babel/parser';
import { SupportedLanguage } from '../../core/types/graph';

export interface ParsedImport {
  source: string;              // e.g. "./UserService" or "@/components/Button"
  importedSymbols: string[];   // e.g. ["UserService", "default"]
  isDynamic: boolean;          // true if import(...) or require(...)
  line?: number;
}

export interface ParseResult {
  filePath: string;
  language: SupportedLanguage;
  imports: ParsedImport[];
  error?: string;
}

export class ASTParser {
  /**
   * Determine programming language from file extension.
   */
  public static detectLanguage(filePath: string): SupportedLanguage {
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.tsx')) return 'tsx';
    if (lower.endsWith('.ts')) return 'typescript';
    if (lower.endsWith('.jsx')) return 'jsx';
    if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
    if (lower.endsWith('.json')) return 'json';
    return 'unknown';
  }

  /**
   * Parse source code into AST and extract static and dynamic imports.
   */
  public static parseSource(filePath: string, code: string): ParseResult {
    const language = this.detectLanguage(filePath);
    const imports: ParsedImport[] = [];

    // Skip parsing JSON or unknown formats
    if (language === 'json' || language === 'unknown') {
      return { filePath, language, imports };
    }

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: [
          'jsx',
          'typescript',
          'dynamicImport',
          'exportDefaultFrom',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'decorators-legacy',
          'objectRestSpread',
          'optionalChaining',
          'nullishCoalescingOperator',
          'topLevelAwait',
        ],
      });

      // Traverse top-level nodes deterministically
      for (const node of ast.program.body) {
        // 1. Static Import: import x from './y'
        if (node.type === 'ImportDeclaration') {
          const source = node.source.value;
          const importedSymbols: string[] = [];

          for (const spec of node.specifiers) {
            if (spec.type === 'ImportDefaultSpecifier') {
              importedSymbols.push('default');
            } else if (spec.type === 'ImportNamespaceSpecifier') {
              importedSymbols.push('*');
            } else if (spec.type === 'ImportSpecifier') {
              const name = spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value;
              importedSymbols.push(name);
            }
          }

          imports.push({
            source,
            importedSymbols,
            isDynamic: false,
            line: node.loc?.start.line,
          });
        }

        // 2. Export-from: export { x } from './y' or export * from './y'
        else if (node.type === 'ExportNamedDeclaration' && node.source) {
          const source = node.source.value;
          const importedSymbols: string[] = node.specifiers.map((spec) => {
            if (spec.type === 'ExportSpecifier') {
              return spec.local.name;
            }
            return 'export';
          });

          imports.push({
            source,
            importedSymbols,
            isDynamic: false,
            line: node.loc?.start.line,
          });
        } else if (node.type === 'ExportAllDeclaration' && node.source) {
          imports.push({
            source: node.source.value,
            importedSymbols: ['*'],
            isDynamic: false,
            line: node.loc?.start.line,
          });
        }
      }

      // Quick fallback regex for inline require(...) or dynamic import(...) inside function bodies
      const dynamicRequireRegex = /(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      while ((match = dynamicRequireRegex.exec(code)) !== null) {
        const target = match[1];
        // Only push if not already recorded
        if (!imports.some((i) => i.source === target)) {
          imports.push({
            source: target,
            importedSymbols: ['dynamic'],
            isDynamic: true,
          });
        }
      }

      return {
        filePath,
        language,
        imports,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'AST Parsing error';
      return {
        filePath,
        language,
        imports: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Resolve an import specifier (e.g., "../services/AuthService") relative to current file path.
   */
  public static resolveImportPath(
    importSource: string,
    currentFilePath: string,
    availableFilePaths: Set<string>
  ): string | null {
    // Ignore external node_modules imports like 'react', 'lodash', 'vite'
    if (!importSource.startsWith('.') && !importSource.startsWith('/') && !importSource.startsWith('@/')) {
      return null;
    }

    let targetBasePath = importSource;

    // Handle `@/` path alias pointing to `src/` or repository root
    if (importSource.startsWith('@/')) {
      targetBasePath = importSource.replace(/^@\//, 'src/');
    } else if (importSource.startsWith('./') || importSource.startsWith('../')) {
      // Resolve relative to current directory
      const dirParts = currentFilePath.split('/');
      dirParts.pop(); // Remove file name

      const relativeParts = importSource.split('/');
      for (const part of relativeParts) {
        if (part === '.') continue;
        if (part === '..') {
          if (dirParts.length > 0) dirParts.pop();
        } else {
          dirParts.push(part);
        }
      }
      targetBasePath = dirParts.join('/');
    }

    // Clean leading slashes
    targetBasePath = targetBasePath.replace(/^\/+/, '');

    // Attempt exact match first
    if (availableFilePaths.has(targetBasePath)) {
      return targetBasePath;
    }

    // Try common file extensions (.ts, .tsx, .js, .jsx)
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    for (const ext of extensions) {
      const pathWithExt = `${targetBasePath}${ext}`;
      if (availableFilePaths.has(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Try directory index files (/index.ts, /index.tsx, /index.js, /index.jsx)
    for (const ext of extensions) {
      const indexPath = `${targetBasePath}/index${ext}`;
      if (availableFilePaths.has(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }
}
