import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useResponsive } from '../utils/responsive';

/**
 * A standard container for all instruments that handles auto-resizing
 * and provides responsive context to its children.
 */
const InstrumentContainer = ({ children, style }) => {
    const { isLandscape, isPhone, SCREEN_WIDTH, SCREEN_HEIGHT } = useResponsive();

    const isMobilePortrait = isPhone && !isLandscape;

    return (
        <View style={[styles.outer, isMobilePortrait && styles.outerMobile]}>
            <ScrollView 
                contentContainerStyle={[
                    styles.content, 
                    isLandscape ? styles.landscapeContent : styles.portraitContent,
                    style
                ]}
                horizontal={isLandscape}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={isPhone} // Only scroll if on phone where space is tight
            >
                {children}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    outerMobile: {
        // Extra padding for mobile if needed
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    landscapeContent: {
        flexDirection: 'row',
        minWidth: '100%',
    },
    portraitContent: {
        flexDirection: 'column',
        minHeight: '100%',
    }
});

export default InstrumentContainer;
