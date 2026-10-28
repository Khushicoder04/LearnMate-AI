
import { useEffect, useRef } from "react";
import "./InteractiveBubbles.css";

const bubbles = Array.from({ length: 60 }, (_, i) => ({  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 61 + 7) % 100,
  size: 6 + ((i * 13) % 19),
  color: ["#22d3ee", "#8b5cf6", "#ec4899", "#3b82f6", "#a855f7"][
    i % 5
  ],
  strength: 0.22 + (i % 4) * 0.09,
}));

export default function InteractiveBubbles() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const items = Array.from(layer.children);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    let frame = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        items.forEach((bubble, index) => {
          const data = bubbles[index];
          const rect = layer.getBoundingClientRect();

          const bubbleX = (data.x / 100) * rect.width;
          const bubbleY = (data.y / 100) * rect.height;

          const dx = bubbleX - (mouseX - rect.left);
          const dy = bubbleY - (mouseY - rect.top);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = 220;

          if (distance < radius && distance > 0) {
            const force = ((radius - distance) / radius) * 65;
            const moveX = (dx / distance) * force;
            const moveY = (dy / distance) * force;

            bubble.style.transform =
              `translate3d(${moveX}px, ${moveY}px, 0)`;
          } else {
            bubble.style.transform = "translate3d(0, 0, 0)";
          }
        });

        frame = 0;
      });
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;

      items.forEach((bubble) => {
        bubble.style.transform = "translate3d(0, 0, 0)";
      });
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleMouseLeave);

      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="interactive-bubbles"
      aria-hidden="true"
    >
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="interactive-bubble"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: bubble.color,
            boxShadow: `0 0 12px ${bubble.color}, 0 0 26px ${bubble.color}88`,
            opacity: 0.45 + bubble.strength,
          }}
        />
      ))}
    </div>
  );
}
