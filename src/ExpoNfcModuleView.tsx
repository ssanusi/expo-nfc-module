import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoNfcModuleViewProps } from './ExpoNfcModule.types';

const NativeView: React.ComponentType<ExpoNfcModuleViewProps> =
  requireNativeView('DigistoneNfcModule');

export default function ExpoNfcModuleView(props: ExpoNfcModuleViewProps) {
  return <NativeView {...props} />;
}
