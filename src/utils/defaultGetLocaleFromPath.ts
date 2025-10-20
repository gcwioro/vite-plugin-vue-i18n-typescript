import path from "node:path";

export function defaultGetLocaleFromPath(filePath: string): string | null {

  // example path: src/locales/Asdf.vue.en.json -> en
  // example path: src/locales/en.json -> en
  const fileName = path.basename(filePath); // Get the file name from the path
  const parts = fileName.split('.')
  // last part is json
  if (parts.length < 2 || parts[parts.length - 1] !== 'json') {
    return null; // Not a JSON file
  }
  return parts?.[parts.length - 2] ?? null; // Return the locale code (second to last part)


}
