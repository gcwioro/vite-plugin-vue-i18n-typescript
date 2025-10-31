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

  const regex = /^(?=.*(?:^|\.)(?<locale>[a-z]{2}(?:-[A-Z]{2})?(?=\.|$))).*\.json$/
  const regexValid = fileName.match(regex);
  if (!regexValid) {
    return null; // Filename does not contain a valid locale code
  }
  // console.log('defaultGetLocaleFromPath', regexValid?.groups?.locale);
  if (fileName.startsWith('.')) {
    return null;
  }
  let locale = regexValid.groups?.locale;
  return locale && locale?.length > 0 ? locale : null
}
