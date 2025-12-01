import * as FileSystem from 'expo-file-system/legacy';

export const RECORDINGS_DIR = FileSystem.documentDirectory + 'recordings/';

export const ensureDirExists = async (dir) => {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
        console.log("Directory doesn't exist, creating...", dir);
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
};

export const moveRecordingToPermanentStorage = async (uri) => {
    try {
        await ensureDirExists(RECORDINGS_DIR);
        const filename = uri.split('/').pop();
        const newUri = RECORDINGS_DIR + filename;

        await FileSystem.moveAsync({
            from: uri,
            to: newUri
        });

        console.log('File moved to:', newUri);
        return newUri;
    } catch (error) {
        console.error('Error moving file:', error);
        return uri; // Return original if move fails
    }
};
