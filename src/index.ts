// Reexport the native module. On web, it will be resolved to ExpoNfcModule.web.ts
// and on native platforms to ExpoNfcModule.ts
import ExpoNfcModule, {
  isNfcAvailable,
  startNfcScan,
  stopNfcScan,
  writeUrlToTag,
  cancelWriteToTag,
  addNfcTagDiscoveredListener,
  addNfcTagWrittenListener,
  addNfcErrorListener
} from './ExpoNfcModule';

export {
  isNfcAvailable,
  startNfcScan,
  stopNfcScan,
  writeUrlToTag,
  cancelWriteToTag,
  addNfcTagDiscoveredListener,
  addNfcTagWrittenListener,
  addNfcErrorListener
};

export * from './ExpoNfcModule.types';

export default ExpoNfcModule;
