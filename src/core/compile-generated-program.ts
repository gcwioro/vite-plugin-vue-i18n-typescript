import path from 'node:path';
import ts from 'typescript';

export interface CompileGeneratedProgramInput {
  runtimeSource: string;
  messagesSource: string;
  compilerOptions?: ts.CompilerOptions;
}

export interface CompileGeneratedProgramOutput {
  runtimeJs: string;
  runtimeDts: string;
}

const RUNTIME_FILE = '/virtual/runtime.ts';
const MESSAGES_FILE = '/virtual/messages.ts';

const DEFAULT_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  esModuleInterop: true,
  skipLibCheck: true,
  declaration: true,
  emitDeclarationOnly: false,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
  jsx: ts.JsxEmit.Preserve,
  types: ['vite/client'],
};

export function compileGeneratedProgram(
  input: CompileGeneratedProgramInput,
): CompileGeneratedProgramOutput {
  const options: ts.CompilerOptions = {
    ...DEFAULT_OPTIONS,
    ...input.compilerOptions,
  };

  const files = new Map<string, string>([
    [RUNTIME_FILE, input.runtimeSource],
    [MESSAGES_FILE, input.messagesSource],
  ]);

  const host = ts.createCompilerHost(options, true);
  const defaultGetSourceFile = host.getSourceFile.bind(host);
  const defaultReadFile = host.readFile?.bind(host);
  const defaultFileExists = host.fileExists?.bind(host);
  const defaultDirectoryExists = host.directoryExists?.bind(host) ?? ts.sys.directoryExists;
  const defaultGetDirectories = host.getDirectories?.bind(host) ?? ts.sys.getDirectories;
  const defaultRealpath = host.realpath?.bind(host) ?? ts.sys.realpath;
  const defaultCurrentDirectory = host.getCurrentDirectory?.bind(host) ?? ts.sys.getCurrentDirectory;

  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const source = files.get(fileName);
    if (source !== undefined) {
      return ts.createSourceFile(fileName, source, languageVersion, true, ts.ScriptKind.TS);
    }
    return defaultGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  host.readFile = (fileName) => {
    const source = files.get(fileName);
    if (source !== undefined) {
      return source;
    }
    return defaultReadFile ? defaultReadFile(fileName) : undefined;
  };

  host.fileExists = (fileName) => {
    if (files.has(fileName)) {
      return true;
    }
    return defaultFileExists ? defaultFileExists(fileName) : false;
  };

  const resolutionHost: ts.ModuleResolutionHost = {
    fileExists: (fileName) => host.fileExists?.(fileName) ?? ts.sys.fileExists(fileName),
    readFile: (fileName) => host.readFile?.(fileName) ?? ts.sys.readFile(fileName),
    directoryExists: defaultDirectoryExists,
    getCurrentDirectory: defaultCurrentDirectory,
    getDirectories: defaultGetDirectories,
    realpath: defaultRealpath,
  };

  host.resolveModuleNames = (moduleNames, containingFile) => {
    return moduleNames.map((moduleName) => {
      if (moduleName === './messages') {
        return {
          resolvedFileName: MESSAGES_FILE,
          extension: ts.Extension.Ts,
          isExternalLibraryImport: false,
        } satisfies ts.ResolvedModuleFull;
      }

      const resolved = ts.resolveModuleName(moduleName, containingFile, options, resolutionHost);
      if (resolved.resolvedModule) {
        return resolved.resolvedModule;
      }

      const fallback = ts.resolveModuleName(
        moduleName,
        path.join(process.cwd(), 'index.ts'),
        options,
        resolutionHost,
      );

      return fallback.resolvedModule;
    });
  };

  let runtimeJs = '';
  let runtimeDts = '';

  const program = ts.createProgram({
    rootNames: [RUNTIME_FILE, MESSAGES_FILE],
    options,
    host,
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    const formatted = diagnostics.map((diag) => {
      const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      if (diag.file) {
        const {line, character} = diag.file.getLineAndCharacterOfPosition(diag.start ?? 0);
        return `${diag.file.fileName}(${line + 1},${character + 1}): ${message}`;
      }
      return message;
    });
    throw new Error(`Failed to compile generated program:\n${formatted.join('\n')}`);
  }

  program.emit(undefined, (fileName, text) => {
    if (fileName.endsWith('messages.js') || fileName.endsWith('messages.d.ts')) {
      return;
    }

    if (fileName.endsWith('.d.ts')) {
      runtimeDts = text;
      return;
    }

    if (fileName.endsWith('.js')) {
      runtimeJs = text;
    }
  });

  if (!runtimeJs) {
    throw new Error('Runtime JavaScript output was not produced.');
  }

  if (!runtimeDts) {
    throw new Error('Runtime declaration output was not produced.');
  }

  return {runtimeJs, runtimeDts};
}
