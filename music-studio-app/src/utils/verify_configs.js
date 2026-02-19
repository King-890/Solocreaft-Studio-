/**
 * Sanity check script to verify InstrumentConfig integrity.
 * Run with: node src/utils/verify_configs.js
 */

const { INSTRUMENTS } = require('../constants/InstrumentConfig');

const REQUIRED_PROPS = ['id', 'name', 'category'];

let errorCount = 0;

console.log('🔍 Verifying Instrument Configurations...');

Object.entries(INSTRUMENTS).forEach(([key, config]) => {
    REQUIRED_PROPS.forEach(prop => {
        if (!config[prop]) {
            console.error(`❌ [${key}] Missing required property: ${prop}`);
            errorCount++;
        }
    });

    if (config.type === 'chromatic' && (!config.notes || config.notes.length === 0)) {
        console.warn(`⚠️ [${key}] Chromatic instrument has no notes.`);
    }

    if (config.type === 'percussion' && (!config.pads || config.pads.length === 0)) {
        console.warn(`⚠️ [${key}] Percussion instrument has no pads.`);
    }
});

if (errorCount === 0) {
    console.log('✅ All instrument configurations are valid!');
} else {
    console.error(`\n❌ Found ${errorCount} errors in configuration.`);
    process.exit(1);
}
