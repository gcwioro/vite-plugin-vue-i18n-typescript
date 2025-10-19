import path from 'node:path'
import ts from 'typescript'

export interface CompileGeneratedModuleOptions {
  sources: Record<string, string>;
  compilerOptions?: ts.CompilerOptions;
  virtualRoot?: string;
}

export interface CompileGeneratedModuleResult {
  js: Record<string, string>;
  dts: Record<string, string>;
}

export function compileGeneratedModule(options: CompileGeneratedModuleOptions): CompileGeneratedModuleResult {
  const {
    sources,
    compilerOptions,
    virtualRoot = path.join(process.cwd(), '.vue-i18n-types-virtual'),
  } = options

  const normalizedRoot = path.posix.normalize(virtualRoot).replace(/\\/g, '/')
  const entries = Object.entries(sources)
  if (entries.length === 0) {
    return {js: {}, dts: {}}
  }

  const sourceFiles = new Map<string, string>()
  for (const [fileName, content] of entries) {
    const normalized = path.posix.join(normalizedRoot, fileName)
    sourceFiles.set(normalized, content)
  }

  const defaultCompilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    declaration: true,
    declarationMap: false,
    sourceMap: false,
    importHelpers: false,
    esModuleInterop: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    moduleDetection: ts.ModuleDetectionKind.Force,
    skipLibCheck: true,
    strict: true,
    jsx: ts.JsxEmit.Preserve,
  }

  const finalOptions: ts.CompilerOptions = {
    ...defaultCompilerOptions,
    ...compilerOptions,
  }

  const fileNames = Array.from(sourceFiles.keys())

  const outputs = new Map<string, string>()

  const compilerHost = ts.createCompilerHost(finalOptions, true)
  const defaultReadFile = compilerHost.readFile
  const defaultFileExists = compilerHost.fileExists
  const defaultGetSourceFile = compilerHost.getSourceFile.bind(compilerHost)
  compilerHost.getSourceFile = (fileName, languageVersion) => {
    const normalized = path.posix.normalize(fileName)
    const source = sourceFiles.get(normalized)
      ?? (normalized.endsWith('.js')
        ? sourceFiles.get(normalized.slice(0, -3) + '.ts')
        : undefined)
      ?? (!path.extname(normalized)
        ? sourceFiles.get(`${normalized}.ts`)
        : undefined)
    if (source !== undefined) {
      let effectiveName = normalized
      if (!sourceFiles.has(normalized)) {
        effectiveName = normalized.endsWith('.js')
          ? normalized.slice(0, -3) + '.ts'
          : `${normalized}.ts`
      }
      return ts.createSourceFile(effectiveName, source, languageVersion, true)
    }
    return defaultGetSourceFile(fileName, languageVersion)
  }

  compilerHost.readFile = (fileName) => {
    const normalized = path.posix.normalize(fileName)
    const source = sourceFiles.get(normalized)
      ?? (normalized.endsWith('.js')
        ? sourceFiles.get(normalized.slice(0, -3) + '.ts')
        : undefined)
      ?? (!path.extname(normalized)
        ? sourceFiles.get(`${normalized}.ts`)
        : undefined)
    if (source !== undefined) {
      return source
    }
    return defaultReadFile ? defaultReadFile(fileName) : undefined
  }

  compilerHost.fileExists = (fileName) => {
    const normalized = path.posix.normalize(fileName)
    if (
      sourceFiles.has(normalized)
      || (normalized.endsWith('.js') && sourceFiles.has(normalized.slice(0, -3) + '.ts'))
      || (!path.extname(normalized) && sourceFiles.has(`${normalized}.ts`))
    ) {
      return true
    }
    return defaultFileExists(fileName)
  }

  compilerHost.writeFile = (fileName, text) => {
    outputs.set(path.posix.normalize(fileName), text)
  }

  // Preserve module resolution helpers to ensure virtual files are discoverable
  const moduleResolutionHost: ts.ModuleResolutionHost = {
    fileExists: (fileName) => compilerHost.fileExists(fileName),
    readFile: (fileName) => compilerHost.readFile(fileName),
    realpath: compilerHost.realpath?.bind(compilerHost),
    directoryExists: compilerHost.directoryExists?.bind(compilerHost),
    getDirectories: compilerHost.getDirectories?.bind(compilerHost),
  }

  const resolveModule = (specifier: string, containingFile: string) => {
    const result = ts.resolveModuleName(specifier, containingFile, finalOptions, moduleResolutionHost)
    return result.resolvedModule
  }

  const defaultResolveModuleNames = compilerHost.resolveModuleNames?.bind(compilerHost)
  const defaultResolveModuleNameLiterals = compilerHost.resolveModuleNameLiterals?.bind(compilerHost)

  compilerHost.resolveModuleNames = (moduleNames, containingFile, ...rest) => {
    return moduleNames.map((moduleName) => {
      const direct = resolveModule(moduleName, containingFile)
      if (direct) {
        return direct
      }

      const manual = resolveFromVirtualSources(moduleName, containingFile)
      if (manual) {
        return manual
      }

      if (!/\.[a-z]+$/i.test(moduleName)) {
        const withTs = resolveModule(`${moduleName}.ts`, containingFile)
        if (withTs) {
          return withTs
        }
      }

      if (moduleName.endsWith('.js')) {
        const alt = resolveModule(moduleName.slice(0, -3) + '.ts', containingFile)
        if (alt) {
          return alt
        }
      }

      return defaultResolveModuleNames
        ? defaultResolveModuleNames([moduleName], containingFile, ...rest)[0]
        : undefined
    })
  }

  compilerHost.resolveModuleNameLiterals = (moduleNames, containingFile, ...rest) => {
    return moduleNames.map((moduleName) => {
      const text = moduleName.text
      const direct = ts.resolveModuleName(text, containingFile, finalOptions, moduleResolutionHost)
      if (direct.resolvedModule) {
        return direct
      }

      const manual = resolveFromVirtualSources(text, containingFile)
      if (manual) {
        return {
          resolvedModule: manual,
          failedLookupLocations: [],
          isExternalLibraryImport: false,
        }
      }

      if (!/\.[a-z]+$/i.test(text)) {
        const withTs = ts.resolveModuleName(`${text}.ts`, containingFile, finalOptions, moduleResolutionHost)
        if (withTs.resolvedModule) {
          return withTs
        }
      }

      if (text.endsWith('.js')) {
        const alt = ts.resolveModuleName(text.slice(0, -3) + '.ts', containingFile, finalOptions, moduleResolutionHost)
        if (alt.resolvedModule) {
          return alt
        }
      }

      return defaultResolveModuleNameLiterals
        ? defaultResolveModuleNameLiterals([moduleName], containingFile, ...rest)[0]
        : direct
    })
  }

  function resolveFromVirtualSources(specifier: string, containingFile: string): ts.ResolvedModuleFull | undefined {
    if (!specifier.startsWith('.')) {
      return undefined
    }

    const containingDir = path.posix.dirname(path.posix.normalize(containingFile))
    const joined = path.posix.normalize(path.posix.join(containingDir, specifier))

    const candidates = [joined]
    if (!joined.endsWith('.ts')) {
      candidates.push(`${joined}.ts`)
    }
    if (joined.endsWith('.js')) {
      candidates.push(joined.slice(0, -3) + '.ts')
    }

    for (const candidate of candidates) {
      if (sourceFiles.has(candidate)) {
        return {
          resolvedFileName: candidate,
          extension: ts.Extension.Ts,
          isExternalLibraryImport: false,
          packageId: undefined,
        }
      }
    }

    return undefined
  }

  const program = ts.createProgram(fileNames, finalOptions, compilerHost)
  const emitResult = program.emit()

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)
  if (diagnostics.length > 0) {
    const messages = diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('\n')
    throw new Error(`Failed to compile generated modules:\n${messages}`)
  }

  const js: Record<string, string> = {}
  const dts: Record<string, string> = {}

  for (const [fileName, content] of outputs) {
    if (fileName.endsWith('.d.ts')) {
      const key = path.posix.relative(normalizedRoot, fileName)
      dts[key] = content
    } else if (fileName.endsWith('.js')) {
      const key = path.posix.relative(normalizedRoot, fileName)
      js[key] = content
    }
  }

  return {js, dts}
}
