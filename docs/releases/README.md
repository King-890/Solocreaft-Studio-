# APK Releases

Place your built APK files here.

## How to add APK:

1. Build your APK using:
   ```bash
   eas build --platform android --profile preview
   ```

2. Download the APK from the build link

3. Rename it to `app.apk`

4. Place it in this folder

5. Commit and push to GitHub

## File naming:

- `app.apk` - Latest version (for download page)
- `app-v1.0.0.apk` - Versioned backup
- `app-v1.1.0.apk` - Next version

Keep old versions for rollback if needed.
