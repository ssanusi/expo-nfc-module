import { requireNativeView } from 'expo';
import type * as React from 'react';

import type { ExpoNfcModuleViewProps } from './ExpoNfcModule.types';

const NativeView: React.ComponentType<ExpoNfcModuleViewProps> =
  requireNativeView('ExpoNfcModule');

export default function ExpoNfcModuleView(props: Readonly<ExpoNfcModuleViewProps>) {
  return <NativeView {...props} />;
}
