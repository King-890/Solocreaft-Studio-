const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Hermes engine for better performance
config.transformer = {
    ...config.transformer,
    minifierConfig: {
        keep_classnames: true,
        keep_fnames: true,
        mangle: {
            keep_classnames: true,
            keep_fnames: true,
        },
    },
};

// Optimize asset handling
config.resolver = {
    ...config.resolver,
    assetExts: [
        ...config.resolver.assetExts,
        'mp4',
        'webm',
        'mov',
    ],
};

module.exports = config;
