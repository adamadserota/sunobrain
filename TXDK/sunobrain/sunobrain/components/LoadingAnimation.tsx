/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import { useEffect, useState } from "react";

const BURSTS = [
    "RIFF!",
    "TWANG!",
    "BOOM!",
    "WAIL!",
    "THUMP!",
    "CRASH!",
    "ZING!",
    "BLARE!",
];

const STATUS_LINES = [
    "Composing lyrics",
    "Tuning styles",
    "Mapping phonetics",
    "Weighing semantics",
    "Mixing the chorus",
    "Dropping the bridge",
];

const spinSlow = keyframes({
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
});

const spinReverse = keyframes({
    "0%": { transform: "rotate(360deg)" },
    "100%": { transform: "rotate(0deg)" },
});

const popIn = keyframes({
    "0%": { transform: "scale(0.5) rotate(-12deg)", opacity: 0 },
    "30%": { transform: "scale(1.15) rotate(-8deg)", opacity: 1 },
    "60%": { transform: "scale(0.95) rotate(-8deg)", opacity: 1 },
    "100%": { transform: "scale(1) rotate(-8deg)", opacity: 1 },
});

const wobble = keyframes({
    "0%, 100%": { transform: "rotate(-8deg)" },
    "50%": { transform: "rotate(-4deg)" },
});

const pulseRing = keyframes({
    "0%": { transform: "scale(0.9)", opacity: 1 },
    "100%": { transform: "scale(1.4)", opacity: 0 },
});

const containerStyle = css({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 36,
    padding: 48,
    overflow: "hidden",
});

// Halftone dot backdrop (XIII signature)
const halftoneStyle = css({
    position: "absolute",
    inset: 0,
    backgroundImage:
        "radial-gradient(circle, rgba(212,175,55,0.12) 1px, transparent 1.5px)",
    backgroundSize: "14px 14px",
    opacity: 0.9,
    pointerEvents: "none",
    maskImage:
        "radial-gradient(ellipse at center, black 0%, black 40%, transparent 75%)",
    WebkitMaskImage:
        "radial-gradient(ellipse at center, black 0%, black 40%, transparent 75%)",
});

// Motion lines radiating from center
const motionLinesStyle = css({
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: "50%",
    backgroundImage: `repeating-conic-gradient(
        from 0deg,
        transparent 0deg,
        transparent 8deg,
        rgba(212,175,55,0.18) 8deg,
        rgba(212,175,55,0.18) 9deg
    )`,
    maskImage: "radial-gradient(circle, transparent 34%, black 38%, black 60%, transparent 70%)",
    WebkitMaskImage:
        "radial-gradient(circle, transparent 34%, black 38%, black 60%, transparent 70%)",
    animation: `${spinSlow} 18s linear infinite`,
    pointerEvents: "none",
});

const burstWrapStyle = css({
    position: "relative",
    width: 260,
    height: 260,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

// Spiky yellow starburst (SVG-less, using CSS)
const burstShapeStyle = css({
    position: "absolute",
    inset: 0,
    background: "#F0C040",
    clipPath:
        "polygon(50% 0%, 58% 18%, 78% 8%, 72% 30%, 96% 28%, 78% 46%, 100% 54%, 78% 62%, 94% 80%, 72% 72%, 76% 96%, 58% 80%, 50% 100%, 42% 80%, 24% 96%, 28% 72%, 6% 80%, 22% 62%, 0% 54%, 22% 46%, 4% 28%, 28% 30%, 22% 8%, 42% 18%)",
    boxShadow: "0 0 30px rgba(212,175,55,0.45)",
    animation: `${wobble} 0.35s ease-in-out infinite`,
});

const burstBorderStyle = css({
    position: "absolute",
    inset: 8,
    background: "transparent",
    border: "3px solid #020617",
    clipPath:
        "polygon(50% 0%, 58% 18%, 78% 8%, 72% 30%, 96% 28%, 78% 46%, 100% 54%, 78% 62%, 94% 80%, 72% 72%, 76% 96%, 58% 80%, 50% 100%, 42% 80%, 24% 96%, 28% 72%, 6% 80%, 22% 62%, 0% 54%, 22% 46%, 4% 28%, 28% 30%, 22% 8%, 42% 18%)",
});

const burstTextStyle = css({
    position: "relative",
    fontFamily: "'Bangers', cursive",
    fontSize: 56,
    letterSpacing: "2px",
    color: "#020617",
    textShadow: "3px 3px 0 rgba(0,0,0,0.15)",
    transform: "rotate(-8deg)",
    animation: `${popIn} 0.45s ease-out both`,
    userSelect: "none",
});

const outerRingStyle = css({
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    border: "3px solid rgba(212,175,55,0.6)",
    animation: `${pulseRing} 1.8s ease-out infinite`,
});

const innerRingStyle = css({
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    border: "2px solid rgba(212,175,55,0.4)",
    animation: `${pulseRing} 1.8s ease-out infinite 0.9s`,
});

const rotatingFrameStyle = css({
    position: "absolute",
    width: 360,
    height: 360,
    animation: `${spinReverse} 22s linear infinite`,
    pointerEvents: "none",
});

const cornerPipStyle = (top: number | string | null, right: number | string | null, bottom: number | string | null, left: number | string | null) =>
    css({
        position: "absolute",
        width: 14,
        height: 14,
        top: top ?? undefined,
        right: right ?? undefined,
        bottom: bottom ?? undefined,
        left: left ?? undefined,
        background: "#D4AF37",
        border: "2px solid #020617",
        transform: "rotate(45deg)",
    });

const statusStyle = css({
    position: "relative",
    fontFamily: "'Bangers', cursive",
    fontSize: 24,
    letterSpacing: "3px",
    color: "#F0C040",
    textTransform: "uppercase",
    textShadow: "2px 2px 0 rgba(0,0,0,0.6)",
});

const subStatusStyle = css({
    position: "relative",
    fontFamily: "var(--fui-font)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "var(--fui-text-muted)",
    marginTop: -24,
});

export function LoadingAnimation() {
    const [burstIndex, setBurstIndex] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const burstTimer = setInterval(() => {
            setBurstIndex((i) => (i + 1) % BURSTS.length);
        }, 900);
        const statusTimer = setInterval(() => {
            setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
        }, 1600);
        return () => {
            clearInterval(burstTimer);
            clearInterval(statusTimer);
        };
    }, []);

    return (
        <div css={containerStyle}>
            <div css={halftoneStyle} />
            <div css={motionLinesStyle} />
            <div css={burstWrapStyle}>
                <div css={outerRingStyle} />
                <div css={innerRingStyle} />
                <div css={rotatingFrameStyle}>
                    <div css={cornerPipStyle(0, null, null, "50%")} style={{ transform: "translateX(-50%) rotate(45deg)" }} />
                    <div css={cornerPipStyle(null, 0, "50%", null)} style={{ transform: "translateY(50%) rotate(45deg)" }} />
                    <div css={cornerPipStyle(null, null, 0, "50%")} style={{ transform: "translateX(-50%) rotate(45deg)" }} />
                    <div css={cornerPipStyle("50%", null, null, 0)} style={{ transform: "translateY(-50%) rotate(45deg)" }} />
                </div>
                <div css={burstShapeStyle} />
                <div css={burstBorderStyle} />
                <div css={burstTextStyle} key={burstIndex}>
                    {BURSTS[burstIndex]}
                </div>
            </div>
            <div css={statusStyle}>{STATUS_LINES[statusIndex]}…</div>
            <div css={subStatusStyle}>Suno v5.5 production in progress</div>
        </div>
    );
}
