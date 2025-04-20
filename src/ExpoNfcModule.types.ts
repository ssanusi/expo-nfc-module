import type { StyleProp, ViewStyle } from 'react-native';

/**
 * NFC Tag discovery event payload
 */
export type NfcTagDiscoveredEventPayload = {
  id: string;
  techTypes: string[];
  data?: string;
};

/**
 * NFC Tag written event payload
 */
export type NfcTagWrittenEventPayload = {
  id: string;
  url: string;
};

/**
 * NFC Error event payload
 */
export type NfcErrorEventPayload = {
  code: string;
  message: string;
};

/**
 * All events emitted by the NFC module
 */
export type ExpoNfcModuleEvents = {
  onNfcTagDiscovered: (params: NfcTagDiscoveredEventPayload) => void;
  onNfcTagWritten: (params: NfcTagWrittenEventPayload) => void;
  onNfcError: (params: NfcErrorEventPayload) => void;
};

/**
 * View props for NFC module
 */
export type ExpoNfcModuleViewProps = {
  style?: StyleProp<ViewStyle>;
  url?: string;
  onLoad?: (event: { nativeEvent: { url: string } }) => void;
};
