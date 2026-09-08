import { GitHubService, GitHubFileItem } from '../github/githubService';
import { ASTParser } from './astParser';
import { NormalizedGraphModel } from '../../core/graph/NormalizedGraphModel';
import { RepositoryRef, AnalysisProgress, SupportedLanguage } from '../../core/types/graph';

export type ProgressCallback = (progress: AnalysisProgress) => void;

export class DependencyAnalyzer {
  private static MAX_FILES_TO_ANALYZE = 100; // Limit for Phase 1 browser performance

  /**
   * Main entrypoint to analyze a public GitHub repository.
   */
  public static async analyzeRepository(
    urlInput: string,
    onProgress?: ProgressCallback
  ): Promise<NormalizedGraphModel> {
    const startTime = performance.now();

    // Step 1: Validate GitHub URL
    onProgress?.({
      step: 'validating',
      message: 'Validating GitHub URL...',
      percentage: 10,
    });
    const repoRef = GitHubService.parseUrl(urlInput);

    // Step 2: Fetch Repository File Tree
    onProgress?.({
      step: 'fetching_tree',
      message: `Connecting to GitHub API for ${repoRef.owner}/${repoRef.repo}...`,
      percentage: 25,
    });
    const { files: rawFiles, defaultBranch } = await GitHubService.fetchRepositoryTree(repoRef);
    repoRef.branch = defaultBranch;

    // Filter supported source files (.ts, .tsx, .js, .jsx)
    const supportedFiles: GitHubFileItem[] = rawFiles.filter((item) => {
      if (item.type !== 'blob' || !item.path) return false;
      const lower = item.path.toLowerCase();
      // Skip node_modules, dist, build, coverage, lockfiles, minified files
      if (
        lower.includes('node_modules/') ||
        lower.includes('dist/') ||
        lower.includes('build/') ||
        lower.includes('.min.js') ||
        lower.includes('.d.ts') ||
        lower.includes('bundle.js')
      ) {
        return false;
      }
      return (
        lower.endsWith('.ts') ||
        lower.endsWith('.tsx') ||
        lower.endsWith('.js') ||
        lower.endsWith('.jsx')
      );
    });

    if (supportedFiles.length === 0) {
      throw new Error(
        `No supported JavaScript or TypeScript source files (.js, .jsx, .ts, .tsx) were found in ${repoRef.owner}/${repoRef.repo}.`
      );
    }

    // Limit files to avoid hitting browser network limits
    const filesToAnalyze = supportedFiles.slice(0, this.MAX_FILES_TO_ANALYZE);
    const availablePathsSet = new Set<string>(supportedFiles.map((f) => f.path));

    // Initialize Normalized Graph Model
    const model = new NormalizedGraphModel(repoRef, {
      totalFilesDiscovered: rawFiles.length,
      totalFilesAnalyzed: 0,
      totalFilesSkipped: 0,
      languagesCount: {
        typescript: 0,
        javascript: 0,
        tsx: 0,
        jsx: 0,
        json: 0,
        unknown: 0,
      },
    });

    // Step 3: Create initial file nodes
    const langStats: Record<SupportedLanguage, number> = {
      typescript: 0,
      javascript: 0,
      tsx: 0,
      jsx: 0,
      json: 0,
      unknown: 0,
    };

    for (const fileItem of filesToAnalyze) {
      const language = ASTParser.detectLanguage(fileItem.path);
      langStats[language] = (langStats[language] || 0) + 1;

      const pathSegments = fileItem.path.split('/');
      const fileName = pathSegments[pathSegments.length - 1];
      const isEntrypoint =
        fileName.startsWith('index.') ||
        fileName.startsWith('main.') ||
        fileName.startsWith('App.') ||
        fileName.startsWith('app.');

      model.addNode({
        id: fileItem.path,
        name: fileName,
        path: fileItem.path,
        type: 'file',
        language,
        sizeBytes: fileItem.size,
        importsCount: 0,
        importedByCount: 0,
        depth: pathSegments.length - 1,
        isEntrypoint,
      });
    }

    // Step 4: Fetch source files & Parse ASTs in batches
    onProgress?.({
      step: 'fetching_sources',
      message: `Fetching & analyzing ASTs for ${filesToAnalyze.length} source files...`,
      currentCount: 0,
      totalCount: filesToAnalyze.length,
      percentage: 40,
    });

    let analyzedCount = 0;
    let skippedCount = 0;
    let totalImportsFound = 0;
    const skippedFilesList: Array<{ path: string; reason: string }> = [];

    // Fetch and parse files concurrently in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < filesToAnalyze.length; i += BATCH_SIZE) {
      const batch = filesToAnalyze.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (fileItem) => {
          try {
            const code = await GitHubService.fetchFileContent(repoRef, fileItem.path, defaultBranch);
            const parseResult = ASTParser.parseSource(fileItem.path, code);

            if (parseResult.error) {
              skippedCount++;
              skippedFilesList.push({ path: fileItem.path, reason: parseResult.error });
            } else {
              analyzedCount++;
              totalImportsFound += parseResult.imports.length;

              // Store raw imports on node
              const node = model.getNode(fileItem.path);
              if (node) {
                node.rawImports = parseResult.imports.map((i) => i.source);
              }

              // Step 5: Resolve imports to target files and create graph edges
              for (const imp of parseResult.imports) {
                const resolvedTarget = ASTParser.resolveImportPath(
                  imp.source,
                  fileItem.path,
                  availablePathsSet
                );

                if (resolvedTarget && model.hasNode(resolvedTarget)) {
                  model.addEdge({
                    id: `${fileItem.path}->${resolvedTarget}`,
                    source: fileItem.path,
                    target: resolvedTarget,
                    type: 'imports',
                    importedSymbols: imp.importedSymbols,
                    isDynamic: imp.isDynamic,
                  });
                }
              }
            }
          } catch (err: unknown) {
            skippedCount++;
            const reason = err instanceof Error ? err.message : 'Fetch failed';
            skippedFilesList.push({ path: fileItem.path, reason });
          }
        })
      );

      const progressPct = 40 + Math.floor(((i + batch.length) / filesToAnalyze.length) * 45);
      onProgress?.({
        step: 'parsing_ast',
        message: `Parsed ${Math.min(i + BATCH_SIZE, filesToAnalyze.length)} of ${filesToAnalyze.length} files...`,
        currentCount: Math.min(i + BATCH_SIZE, filesToAnalyze.length),
        totalCount: filesToAnalyze.length,
        percentage: progressPct,
      });
    }

    // Step 6: Finalize Graph Metrics
    onProgress?.({
      step: 'building_graph',
      message: 'Building normalized dependency graph & computing metrics...',
      percentage: 95,
    });

    const endTime = performance.now();
    model.setStats({
      totalFilesDiscovered: rawFiles.length,
      totalFilesAnalyzed: analyzedCount,
      totalFilesSkipped: skippedCount,
      totalImportsFound,
      totalEdgesCreated: model.getAllEdges().length,
      durationMs: Math.round(endTime - startTime),
      languagesCount: langStats,
      skippedFiles: skippedFilesList,
    });

    onProgress?.({
      step: 'complete',
      message: 'Graph generated successfully!',
      percentage: 100,
    });

    return model;
  }
}
