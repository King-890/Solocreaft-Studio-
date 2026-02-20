import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AudioPlaybackService from '../services/AudioPlaybackService';
import { SCREEN_WIDTH, sc } from '../utils/responsive';

export default function Visualizer({ trackId, type = 'bars', color = '#03dac6', height = sc(60), width = '100%' }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Match internal resolution to display size for sharpness
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = (typeof width === 'number' ? width : SCREEN_WIDTH);
        const logicalHeight = height;
        const renderWidth = logicalWidth * dpr;
        const renderHeight = logicalHeight * dpr;
        
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        ctx.scale(dpr, dpr);

        const draw = () => {
            const data = AudioPlaybackService.getFrequencyData();
            
            // PERFORMANCE: Sample data for activity check instead of full array iteration
            let hasActivity = false;
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i += 8) {
                    if (data[i] > 10) { // Threshold for actual audio
                        hasActivity = true;
                        break;
                    }
                }
            }

            if (!hasActivity) {
                ctx.clearRect(0, 0, logicalWidth, logicalHeight);
                animationRef.current = requestAnimationFrame(draw);
                return;
            }

            ctx.clearRect(0, 0, logicalWidth, logicalHeight);

            // PERFORMANCE: Draw fewer points (64 for bars, 128 for waveform)
            const step = Math.floor(data.length / (type === 'bars' ? 64 : 128));

            if (type === 'bars') {
                const barWidth = (renderWidth / dpr / 64) * 0.8;
                let x = 0;

                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, '#bb86fc');
                ctx.fillStyle = gradient;

                for (let i = 0; i < 64; i++) {
                    const dataIndex = i * step;
                    const barHeight = (data[dataIndex] / 255) * height;
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                    x += barWidth + (renderWidth / dpr / 64) * 0.2;
                }
            } else if (type === 'waveform') {
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = color;
                ctx.beginPath();

                const points = 128;
                const sliceWidth = (renderWidth / dpr) / points;
                let x = 0;

                for (let i = 0; i < points; i++) {
                    const dataIndex = i * step;
                    const v = data[dataIndex] / 128.0;
                    const y = (v * height) / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                ctx.lineTo(renderWidth / dpr, height / 2);
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [trackId, type, color, height, width]);

    if (Platform.OS !== 'web') return null;

    return (
        <View style={[styles.container, { height, width }]}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
});
