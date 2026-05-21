"use client";

import React, { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      alphaSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;

        const colors = ["#00f0ff", "#7000ff", "#ff007a", "#ffffff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.4 + 0.15;
        this.alphaSpeed = (Math.random() - 0.5) * 0.005;
      }

      update(driftX: number, driftY: number) {
        this.x += this.speedX + driftX * 0.05;
        this.y += this.speedY + driftY * 0.05;

        this.alpha += this.alphaSpeed;
        if (this.alpha > 0.8 || this.alpha < 0.1) {
          this.alphaSpeed = -this.alphaSpeed;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.globalAlpha = this.alpha;
        context.shadowBlur = 6;
        context.shadowColor = this.color;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    const particleCount = Math.min(120, Math.floor((width * height) / 12000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const glowX = ((mouse.x + 1) / 2) * width;
      const glowY = ((mouse.y + 1) / 2) * height;
      const gradient = ctx.createRadialGradient(glowX, glowY, 50, glowX, glowY, 400);
      gradient.addColorStop(0, "rgba(112, 0, 255, 0.05)");
      gradient.addColorStop(0.5, "rgba(0, 240, 255, 0.02)");
      gradient.addColorStop(1, "rgba(5, 5, 16, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const driftX = -mouse.x * 2;
      const driftY = -mouse.y * 2;

      particles.forEach((particle) => {
        particle.update(driftX, driftY);
        particle.draw(ctx);
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(112, 0, 255, 0.04)";
            ctx.lineWidth = 0.5 * (1 - dist / 100);
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ backgroundColor: "#050510" }}
    />
  );
}
