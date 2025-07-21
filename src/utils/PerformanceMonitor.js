class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            fps: 0,
            memoryUsage: 0
        };
    }

    // Add FPS monitoring
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkFPS = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime > 1000) {
                this.metrics.fps = frameCount;
                if (frameCount < 55) { // Below 55 FPS
                    this.optimizeAnimations();
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(checkFPS);
        };
        requestAnimationFrame(checkFPS);
    }

    // Add memory leak detection
    checkMemoryUsage() {
        if (performance.memory) {
            const usage = performance.memory.usedJSHeapSize;
            if (usage > 100 * 1024 * 1024) { // Over 100MB
                this.cleanupUnusedResources();
            }
        }
    }
} 