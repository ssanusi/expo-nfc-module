import { EventEmitter } from 'expo-modules-core';
import type { NfcErrorEventPayload, ExpoNfcModuleEvents } from './ExpoNfcModule.types';

/**
 * Web implementation of the NFC module
 * Note: Web browsers have limited NFC support, so most functions will return errors
 */
class ExpoNfcModule extends EventEmitter<ExpoNfcModuleEvents> {
  constructor() {
    super(null as any);
  }

  /**
   * Check if NFC is available on the device
   * On web, this checks if the Web NFC API is available
   */
  async isNfcAvailable(): Promise<boolean> {
    // Check if the Web NFC API is available
    return 'NDEFReader' in window;
  }

  /**
   * Start scanning for NFC tags
   * On web, this will emit an error as scanning is not fully supported
   */
  async startNfcScan(): Promise<void> {
    const errorPayload: NfcErrorEventPayload = {
      code: 'web_unsupported',
      message: 'NFC scanning is not fully supported in web browsers'
    };
    this.emit('onNfcError', errorPayload);
  }

  /**
   * Stop scanning for NFC tags
   * On web, this is a no-op
   */
  async stopNfcScan(): Promise<void> {
    // No-op on web
  }

  /**
   * Write a URL to an NFC tag
   * On web, this will emit an error as writing is not fully supported
   */
  async writeUrlToTag(url: string): Promise<void> {
    const errorPayload: NfcErrorEventPayload = {
      code: 'web_unsupported',
      message: 'NFC writing is not fully supported in web browsers'
    };
    this.emit('onNfcError', errorPayload);
  }

  /**
   * Cancel writing to an NFC tag
   * On web, this is a no-op
   */
  async cancelWriteToTag(): Promise<void> {
    // No-op on web
  }
}

export default new ExpoNfcModule();
