import { EventEmitter, requireNativeModule } from 'expo-modules-core';
import type { NfcErrorEventPayload, NfcTagDiscoveredEventPayload, NfcTagWrittenEventPayload, ExpoNfcModuleEvents } from './ExpoNfcModule.types';

// Load the native module
const ExpoNfcModule = requireNativeModule('DigistoneNfcModule');

// Create an event emitter to handle NFC events
const emitter = new EventEmitter<ExpoNfcModuleEvents>(ExpoNfcModule);

/**
 * Check if NFC is available on the device
 * @returns Promise<boolean> - true if NFC is available, false otherwise
 */
export function isNfcAvailable(): Promise<boolean> {
  return ExpoNfcModule.isNfcAvailable();
}

/**
 * Start scanning for NFC tags
 * @returns Promise<void>
 */
export function startNfcScan(): Promise<void> {
  return ExpoNfcModule.startNfcScan();
}

/**
 * Stop scanning for NFC tags
 * @returns Promise<void>
 */
export function stopNfcScan(): Promise<void> {
  return ExpoNfcModule.stopNfcScan();
}

/**
 * Write a URL to an NFC tag
 * @param url - The URL to write to the tag
 * @returns Promise<void>
 */
export function writeUrlToTag(url: string): Promise<void> {
  return ExpoNfcModule.writeUrlToTag(url);
}

/**
 * Cancel writing to an NFC tag
 * @returns Promise<void>
 */
export function cancelWriteToTag(): Promise<void> {
  return ExpoNfcModule.cancelWriteToTag();
}

/**
 * Add a listener for when an NFC tag is discovered
 * @param listener - The callback function to call when a tag is discovered
 * @returns EventSubscription - A subscription that can be used to remove the listener
 */
export function addNfcTagDiscoveredListener(listener: (event: NfcTagDiscoveredEventPayload) => void) {
  return emitter.addListener('onNfcTagDiscovered', listener);
}

/**
 * Add a listener for when an NFC tag is written
 * @param listener - The callback function to call when a tag is written
 * @returns EventSubscription - A subscription that can be used to remove the listener
 */
export function addNfcTagWrittenListener(listener: (event: NfcTagWrittenEventPayload) => void) {
  return emitter.addListener('onNfcTagWritten', listener);
}

/**
 * Add a listener for NFC errors
 * @param listener - The callback function to call when an error occurs
 * @returns EventSubscription - A subscription that can be used to remove the listener
 */
export function addNfcErrorListener(listener: (event: NfcErrorEventPayload) => void) {
  return emitter.addListener('onNfcError', listener);
}

export default {
  isNfcAvailable,
  startNfcScan,
  stopNfcScan,
  writeUrlToTag,
  cancelWriteToTag,
  addNfcTagDiscoveredListener,
  addNfcTagWrittenListener,
  addNfcErrorListener,
};
