# Expo NFC Module

A cross-platform NFC module for Expo and React Native that enables reading and writing URL links to NFC tags on both iOS and Android devices.

## Features

- Check NFC availability on the device
- Read NFC tags and extract data
- Write URL links to NFC tags
- Handle both NDEF formatted and unformatted tags
- Comprehensive event system for tag discovery, writing success, and error handling
- Full TypeScript support

## Installation

### Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects:

```bash
npx expo install expo-nfc-module
```

### Installation in bare React Native projects

For bare React Native projects, ensure you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

```bash
npm install expo-nfc-module
```

### Automatic Configuration (Expo Config Plugin)

As of version 0.2.2, this module includes an Expo Config Plugin that automatically configures your project for NFC functionality on both iOS and Android. The plugin handles all the necessary configuration steps when you build your app.

**No manual configuration is required for Expo projects!**

The config plugin automatically:

- For iOS:
  - Adds NFCReaderUsageDescription to Info.plist
  - Adds NFC reader session formats (NDEF and TAG) to Info.plist
  - Configures Near Field Communication Tag Reading capability

- For Android:
  - Adds NFC permission to AndroidManifest.xml
  - Adds NFC hardware feature requirement

### Manual Configuration (if needed)

If you're not using the Expo Config Plugin system, you can manually configure your project:

#### Configure for Android

Add the following permissions to your `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

#### Configure for iOS

Follow these steps to configure your iOS project:

1. Run `npx pod-install` after installing the npm package.

2. Add the following to your `Info.plist` file:

```xml
<key>NFCReaderUsageDescription</key>
<string>This app needs access to NFC to read and write NFC tags</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
  <string>NDEF</string>
  <string>TAG</string>
</array>
```

3. Enable the Near Field Communication Tag Reading capability in your Xcode project.

## API Reference

### Checking NFC Availability

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Check if NFC is available on the device
const isAvailable = await ExpoNfcModule.isNfcAvailable();
console.log(`NFC available: ${isAvailable}`);
```

### Reading NFC Tags

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Start scanning for NFC tags
await ExpoNfcModule.startNfcScan();

// Add a listener for when an NFC tag is discovered
const subscription = ExpoNfcModule.addNfcTagDiscoveredListener((event) => {
  console.log('Tag discovered:', event.id);
  console.log('Tech types:', event.techTypes);
  console.log('Data:', event.data);
});

// Stop scanning for NFC tags when done
await ExpoNfcModule.stopNfcScan();

// Remove the listener when no longer needed
subscription.remove();
```

### Writing URLs to NFC Tags

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Add a listener for when a URL is successfully written to an NFC tag
const writeSubscription = ExpoNfcModule.addNfcTagWrittenListener((event) => {
  console.log(`Successfully wrote URL ${event.url} to tag ${event.id}`);
});

// Write a URL to an NFC tag
await ExpoNfcModule.writeUrlToTag('https://example.com');

// Cancel writing to a tag if needed
await ExpoNfcModule.cancelWriteToTag();

// Remove the listener when no longer needed
writeSubscription.remove();
```

### Error Handling

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Add a listener for NFC errors
const errorSubscription = ExpoNfcModule.addNfcErrorListener((error) => {
  console.error(`NFC Error: ${error.code} - ${error.message}`);
});

// Remove the listener when no longer needed
errorSubscription.remove();
```

## Event Types

### NfcTagDiscoveredEventPayload

```typescript
type NfcTagDiscoveredEventPayload = {
  id: string;        // Unique identifier for the NFC tag
  techTypes: string[]; // Array of technology types supported by the tag
  data?: string;     // Optional data content of the tag
};
```

### NfcTagWrittenEventPayload

```typescript
type NfcTagWrittenEventPayload = {
  id: string;  // Unique identifier for the NFC tag
  url: string; // The URL that was written to the tag
};
```

### NfcErrorEventPayload

```typescript
type NfcErrorEventPayload = {
  code: string;    // Error code
  message: string; // Error message
};
```

## Platform-Specific Notes

### iOS

- NFC functionality requires iPhone 7 or newer running iOS 13+
- The app must be in the foreground to use NFC
- iOS will show a system dialog for NFC operations
- Requires an Apple Developer account with NFC entitlements

### Android

- Device must have NFC hardware
- NFC must be enabled in the device settings
- For optimal user experience, instruct users to hold the tag against the back of their device

### Important Requirements

- NFC functionality requires a development or production build (won't work in Expo Go)
- Only works on physical devices with NFC capabilities (not simulators/emulators)

## Example

A complete example application is available in the `example` directory of this repository.

## Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).
