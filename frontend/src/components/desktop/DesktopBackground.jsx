import React, { useEffect, useRef } from 'react';

const DesktopBackground = () => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const lastFrameRef = useRef(0);
    const fpsSamples = [];
    let adaptiveStarCount = 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", {
            alpha: false,
            desynchronized: true,
        });

        let width, height, dpr;

        // -------------------------------
        // ⭐ Configuration (Adaptive)
        // -------------------------------
        const CONFIG = {
            MAX_STARS: 220,
            MIN_STARS: 80,
            FOG_COUNT: 10,
            SHOOTING_STARS: 2,
            TARGET_FPS: 48,
        };

        adaptiveStarCount = CONFIG.MAX_STARS;

        // -------------------------------
        // ⭐ Cached Fog Sprite
        // -------------------------------
        const fogCanvas = document.createElement("canvas");
        fogCanvas.width = 200;
        fogCanvas.height = 200;
        const fogCtx = fogCanvas.getContext("2d");

        fogCtx.fillStyle = "rgba(23,55,60,0.14)";
        fogCtx.filter = "blur(26px)";
        fogCtx.beginPath();
        fogCtx.arc(100, 100, 70, 0, Math.PI * 2);
        fogCtx.fill();

        // -------------------------------
        // ⭐ Particle Stores
        // -------------------------------
        const stars = [];
        const fogs = [];
        const meteors = [];

        const rand = (a, b) => Math.random() * (b - a) + a;

        // -------------------------------
        // ⭐ Star Class (Fast)
        // -------------------------------
        class Star {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = rand(1, 2);
                this.speedY = rand(0.06, 0.18);
                this.alpha = rand(0.15, 0.35);
            }

            update() {
                this.y -= this.speedY;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
            }
        }

        // -------------------------------
        // ⭐ Fog (Uses pre-blurred sprite)
        // -------------------------------
        class Fog {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = rand(0, width);
                this.y = rand(height * 0.6, height + 150);
                this.speedY = rand(0.02, 0.05);
                this.alpha = rand(0.06, 0.12);
                this.scale = rand(1.2, 2.0);
            }

            update() {
                this.y -= this.speedY;
                if (this.y < -200) this.reset();
            }
        }

        // -------------------------------
        // ⭐ Meteor (Shooting Star)
        // -------------------------------
        class Meteor {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = rand(0, width);
                this.y = rand(0, height * 0.35);
                this.speed = rand(10, 16);
                this.length = rand(180, 260);
                this.angle = rand(25, 55) * Math.PI / 180;
                this.dx = Math.cos(this.angle) * this.speed;
                this.dy = Math.sin(this.angle) * this.speed;
                this.opacity = 0;
                this.trigger = Date.now() + rand(2000, 7000);
                this.active = false;
            }

            update() {
                const now = Date.now();
                if (now < this.trigger) return;

                if (!this.active) this.active = true;

                if (this.opacity < 1) this.opacity += 0.04;

                this.x += this.dx;
                this.y += this.dy;

                if (
                    this.x < -200 || this.x > width + 200 ||
                    this.y < -200 || this.y > height + 200
                ) {
                    this.reset();
                }
            }
        }

        // -------------------------------
        // ⭐ Resize
        // -------------------------------
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 1.2);

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            ctx.scale(dpr, dpr);

            stars.length = 0;
            for (let i = 0; i < adaptiveStarCount; i++) stars.push(new Star());

            fogs.length = 0;
            for (let i = 0; i < CONFIG.FOG_COUNT; i++) fogs.push(new Fog());

            meteors.length = 0;
            for (let i = 0; i < CONFIG.SHOOTING_STARS; i++) meteors.push(new Meteor());
        };

        resize();
        window.addEventListener("resize", resize);

        // -------------------------------
        // ⭐ Main Render Loop
        // -------------------------------
        const render = (t) => {
            requestRef.current = requestAnimationFrame(render);

            const delta = t - lastFrameRef.current;
            if (delta < 1000 / CONFIG.TARGET_FPS) return;
            lastFrameRef.current = t;

            ctx.fillStyle = "#03070C";
            ctx.fillRect(0, 0, width, height);

            // -------------------
            // Fog Layer
            // -------------------
            fogs.forEach((f) => {
                f.update();
                ctx.globalAlpha = f.alpha;
                ctx.drawImage(
                    fogCanvas,
                    f.x - 100 * f.scale,
                    f.y - 100 * f.scale,
                    200 * f.scale,
                    200 * f.scale
                );
            });
            ctx.globalAlpha = 1;

            // -------------------
            // Stars (batched points)
            // -------------------
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.beginPath();
            stars.forEach((s) => {
                s.update();
                ctx.rect(s.x, s.y, s.size, s.size);
            });
            ctx.fill();

            // -------------------
            // Meteors
            // -------------------
            meteors.forEach((m) => {
                m.update();

                if (!m.active) return;

                const grad = ctx.createLinearGradient(
                    m.x, m.y,
                    m.x - Math.cos(m.angle) * m.length,
                    m.y - Math.sin(m.angle) * m.length
                );
                grad.addColorStop(0, `rgba(255,150,80,${m.opacity})`);
                grad.addColorStop(1, "rgba(255,150,80,0)");

                ctx.strokeStyle = grad;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(
                    m.x - Math.cos(m.angle) * m.length,
                    m.y - Math.sin(m.angle) * m.length
                );
                ctx.stroke();
            });

            // -------------------
            // Adaptive Performance
            // -------------------
            const fps = 1000 / delta;
            fpsSamples.push(fps);
            if (fpsSamples.length > 15) fpsSamples.shift();

            const avg = fpsSamples.reduce((a, b) => a + b) / fpsSamples.length;

            if (avg < 40 && adaptiveStarCount > CONFIG.MIN_STARS) {
                adaptiveStarCount -= 10;
                resize();
            }
        };

        render();

        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                background: "#03070C",
            }}
        />
    );
};

export default DesktopBackground;
