import { requireNativeView } from 'expo';
import * as React from 'react';

import { DigistoneNfcModuleViewProps } from './DigistoneNfcModule.types';

const NativeView: React.ComponentType<DigistoneNfcModuleViewProps> =
  requireNativeView('DigistoneNfcModule');

export default function DigistoneNfcModuleView(props: DigistoneNfcModuleViewProps) {
  return <NativeView {...props} />;
}
