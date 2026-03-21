import styles from "./FloatingShapes.module.css";

// Translated 1-to-1 from VoicePrep's Tailwind positions
// Diamonds get an extra 45deg on top of their rot value
const SHAPES = [
  // ── TOP ROW ──
  { type: "outline", w: 128, h: 128, top: "5%", left: "2.8%", rot: 12 },
  { type: "orangeLight", w: 80, h: 80, top: "10%", left: "33%", rot: -6 },
  { type: "diamondOutline", w: 112, h: 112, top: "8%", left: "75%", rot: 0 },
  { type: "orangeLight", w: 96, h: 96, top: "16%", left: "88%", rot: -12 },

  // ── MIDDLE ROW ──
  { type: "orangeLight", w: 64, h: 64, top: "33%", left: "5.5%", rot: 12 },
  { type: "outline", w: 80, h: 80, top: "48%", left: "12%", rot: -3 },
  { type: "orangeLight", w: 64, h: 64, top: "33%", left: "80%", rot: 0 },
  { type: "outline", w: 96, h: 96, top: "50%", left: "88%", rot: 6 },

  // ── BOTTOM ROW ──
  { type: "outline", w: 112, h: 112, top: "78%", left: "4.4%", rot: -12 },
  { type: "diamondOrange", w: 56, h: 56, top: "85%", left: "22%", rot: 0 },
  { type: "orangeLight", w: 96, h: 96, top: "88%", left: "87%", rot: -6 },
  { type: "outline", w: 80, h: 80, top: "76%", left: "60%", rot: 12 },

  // ── SMALL ACCENTS ──
  { type: "orangeLight", w: 48, h: 48, top: "68%", left: "6%", rot: 30 },
  { type: "outline", w: 56, h: 56, top: "64%", left: "0.7%", rot: -20 },
  { type: "orangeLight", w: 72, h: 72, top: "20%", left: "66%", rot: 15 },
];

const DIAMOND_TYPES = new Set(["diamondOutline", "diamondOrange"]);

export default function FloatingShapes() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {SHAPES.map((s, i) => {
        const isDiamond = DIAMOND_TYPES.has(s.type);
        // Diamonds: base 45deg + any extra rotation; squares: just the rotation
        const rotation = isDiamond ? 45 + s.rot : s.rot;
        const cssClass = s.type.charAt(0).toUpperCase() + s.type.slice(1);

        return (
          <div
            key={i}
            className={`${styles.shape} ${styles[s.type]}`}
            style={{
              width: s.w,
              height: s.h,
              top: s.top,
              left: s.left,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}