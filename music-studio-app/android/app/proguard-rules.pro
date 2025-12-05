# Add this file to enable ProGuard rules for your app
# This will be used automatically in production builds

# Keep application classes
-keep class com.ujstudios.solocraft.** { *; }

# Keep React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }

# Keep audio libraries
-keep class expo.modules.av.** { *; }
-keep class expo.modules.audio.** { *; }

# Keep navigation
-keep class com.reactnavigation.** { *; }

# Keep Supabase
-keep class io.supabase.** { *; }

# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
