import { NativeModule, requireNativeModule } from 'expo';

import { DigistoneNfcModuleEvents } from './DigistoneNfcModule.types';

declare class DigistoneNfcModule extends NativeModule<DigistoneNfcModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DigistoneNfcModule>('DigistoneNfcModule');
