# Expo NFC Module Config Plugin

This config plugin automatically configures your Expo app with the necessary settings for NFC functionality on both iOS and Android platforms.

## What this plugin does

### iOS Configuration
- Adds `NFCReaderUsageDescription` to Info.plist
- Adds NFC reader session formats (NDEF and TAG) to Info.plist
- Configures Near Field Communication Tag Reading capability in Xcode

### Android Configuration
- Adds NFC permission to AndroidManifest.xml
- Adds NFC hardware feature requirement to AndroidManifest.xml (set as optional)

## Requirements

- Expo SDK 46 or higher
- For iOS: iPhone 7 or newer running iOS 13+
- For Android: Device with NFC hardware
- Development or production build (won't work in Expo Go)

## Usage

This plugin is automatically applied when you install the `expo-nfc-module` package in your Expo project.

### Manual Configuration

If you need to customize the NFC configuration, you can manually configure the plugin in your app.json/app.config.js:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-nfc-module",
        {
          // Optional: Custom configuration options
          "iosNfcDescription": "Custom NFC usage description"
        }
      ]
    ]
  }
}
```

## Important Notes

- NFC functionality requires a development or production build and won't work in Expo Go
- NFC only works on physical devices with NFC capabilities (not simulators/emulators)
- For iOS, you need an Apple Developer account with NFC entitlements
- For Android, NFC must be enabled in device settings

## Troubleshooting

If you encounter issues with NFC functionality:

1. Ensure your device has NFC hardware
2. For iOS, verify you have the proper entitlements in your Apple Developer account
3. For Android, check that NFC is enabled in device settings
4. Verify you're running a development or production build, not Expo Go
