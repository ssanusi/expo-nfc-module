// Reexport the native module. On web, it will be resolved to DigistoneNfcModule.web.ts
// and on native platforms to DigistoneNfcModule.ts
export { default } from './DigistoneNfcModule';
export { default as DigistoneNfcModuleView } from './DigistoneNfcModuleView';
export * from  './DigistoneNfcModule.types';
