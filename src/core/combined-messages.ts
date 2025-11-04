import type {GenerationOptions, JSONObject} from "../types";
import {createVirtualModuleCode, toTypesContent} from "../generation/generator.ts";
import path from "node:path";
import {fnv1a32} from "../utils/hash.ts";
import {detectKeyConflicts, getFinalKeys} from "../utils/json.ts";
import {ensureDir, writeFileAtomic} from "../utils/file.ts";
import {RuntimeMethods, SymbolEnum} from "../generation/treeShakeGenerator.ts";
import pc from "picocolors";

export class CombinedMessages<TLanguages extends string = string, TMessages extends JSONObject = JSONObject> {


  public readonly messagesJsonString: string;
  public readonly keys: string[];
  public readonly baseLocaleMessages: TMessages;
  public readonly languages: TLanguages[];
  public readonly contentId: string;
  public readonly keysId: string;
  public readonly fallbackLocales: Record<string, string[]>;


  public constructor(public messages: Record<TLanguages | string, TMessages>, public config: GenerationOptions) {
    this.messagesJsonString = JSON.stringify(messages);
    const baseLocale = this.config.baseLocale || Object.keys(messages)[0];
    this.keys = getFinalKeys(messages, baseLocale as TLanguages);
    this.baseLocaleMessages = messages?.[baseLocale] ?? Object.values(messages)[0] ?? {} as TMessages;

    const languages = Object.keys(messages);
    this.languages = Array.from(new Set(languages)).sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    ) as TLanguages[];

    this.contentId = fnv1a32(this.messagesJsonString);
    this.keysId = fnv1a32(this.keys.join('|'));
    this.fallbackLocales = CombinedMessages.getFallBackLocales(this.languages);
  }


  get typesOutpath() {
    return path.isAbsolute(this.config.typesPath)
      ? this.config.typesPath
      : path.join(this.config.root, this.config.typesPath);
  }

  get virtualOutPath() {
    return this.config.virtualFilePath
      ? path.isAbsolute(this.config.virtualFilePath)
        ? this.config.virtualFilePath
        : path.join(this.config.root, this.config.virtualFilePath)
      : undefined;
  }

  public languagesTuple(): string {
    return `['${this.languages.join(`', '`)}']`
  }

  public languagesUnion(): string {
    return `'${this.languages.join(`' | '`)}'`
  }

  public async writeTypesFile() {
    await ensureDir(this.typesOutpath);
    this.config.logger.info(`Writing types file to: ${this.typesOutpath}`);
    await writeFileAtomic(this.typesOutpath, this.getTypesContent());
  }

  public async writeVirtualFile() {
    // Write types file
    const filePath = this.virtualOutPath;
    if (!filePath) return;
    await ensureDir(filePath);
    // if (await this.shouldWriteFile(typesPath, typesContent)) {
    this.config.logger.info(`Writing types file to: ${filePath}`);
    await writeFileAtomic(filePath, this.getRuntimeContent());

  }

  public static getFallBackLocales(langs: string[]) {
    return langs.reduce((acc, locale) => {
      acc[locale] = [locale, locale === 'en' ? undefined : 'en', locale === 'de' ? undefined : 'de'].filter(a => a !== undefined);
      if (locale === 'en') acc[locale] = [...acc[locale], 'en-US'];
      return acc;
    }, {} as Record<string, string[]>);
  }

  public getRuntimeContent() {

    return this.getRuntimeMethods().toFileContent()
  }

  private _runtimeMethodsCache: RuntimeMethods | null = null;

  public getRuntimeMethods(): RuntimeMethods {
    if (this._runtimeMethodsCache) return this._runtimeMethodsCache;
    this._runtimeMethodsCache = createVirtualModuleCode(this);
    return this._runtimeMethodsCache;
  }

  public loadVirtualModuleCode(moduleToResolve: string | SymbolEnum) {
    const code = this.getRuntimeMethods()
    if (moduleToResolve === "") {
      this.config.logger.info(`📄 [${pc.green('load')}] Generated dev code for virtual module: ${moduleToResolve}`);
      return code.toFileContent()
    }

    const methodCode = code.getFileContentFor(moduleToResolve);
    this.config.logger.info(`📄 [${pc.green('load')}] Loading virtual sub-module: ${pc.yellow(moduleToResolve)}, length: ${methodCode.length}`);
    return methodCode;

  }

  public async writeFiles() {
    const startWrite = performance.now();
    await Promise.all([this.writeTypesFile(), this.writeVirtualFile()]);
    const writeDuration = Math.round(performance.now() - startWrite);
    this.config.logger.debug(`Generation took: ${writeDuration}ms`);
  }

  public getTypesContent() {
    const params = Object.assign({}, {
      combinedMessages: this,

      config: this.config,

    })
    return toTypesContent(params)
  }

  /**
   * Validate messages and log conflicts
   */
  public validateMessages(): void {
    const conflicts = detectKeyConflicts(this.messages);
    if (conflicts.length > 0) {
      this.config.logger.error('⚠️  Conflicting translation keys detected:', {
        timestamp: true,
      });
      for (const conflict of conflicts) {
        this.config.logger.error(`   ${conflict}`, {timestamp: true});
      }
    }
  }

}
