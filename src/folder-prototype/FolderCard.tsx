import { useId, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./FolderCard.css";
import devineSymbol from "../shared/assets/images/devine-symbol.png";

export type FolderCardProps = {
  number?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tone?: "light" | "dark" | "violet";
  panelColor?: string;
  className?: string;
  onOpen?: () => void;
  onMain?: () => void;
  onDetail?: () => void;
};

const spring = {
  type: "spring" as const,
  stiffness: 285,
  damping: 29,
  mass: 0.85,
};

export function FolderCard({
  number = "01",
  title,
  description,
  imageUrl,
  tone = "dark",
  panelColor,
  className = "",
  onOpen,
  onMain,
  onDetail,
}: FolderCardProps) {
  const [raised, setRaised] = useState(false);
  const surfaceGradientId = useId();
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0 }
    : spring;

  const style = {
    ...(panelColor
      ? { "--folder-panel": panelColor }
      : {}),
  } as CSSProperties;

  const hasTabs = Boolean(onMain || onDetail);

  return (
    <motion.article
      className={`folder-card folder-card--${tone} ${className}`}
      style={style}
      initial={false}
      animate={raised ? "hover" : "rest"}
      onHoverStart={() => setRaised(true)}
      onHoverEnd={() => setRaised(false)}
      onFocusCapture={() => setRaised(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node
          )
        ) {
          setRaised(false);
        }
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") {
          setRaised((value) => !value);
        }
      }}
      aria-label={`${title} 폴더 카드`}
    >
      {/* 폴더 뒷면 */}
      <div
        className="folder-card__back"
        aria-hidden="true"
      />

      {/* 폴더 안쪽 카드 */}
      <motion.div
        className="folder-card__art"
        variants={{
          rest: {
            y: 0,
            scale: 1,
          },
          hover: {
            y: 0,
            scale: 1,
          },
        }}
        transition={transition}
        aria-hidden="true"
      >
        {imageUrl ? (
          <img
            className="folder-card__image"
            src={imageUrl}
            alt=""
          />
        ) : (
          <div className="folder-card__placeholder"><img src={devineSymbol} alt="" className="folder-card__symbol" /></div>
        )}
      </motion.div>

      {/* 폴더 앞면 */}
      <motion.div
        className="folder-card__front"
        variants={{
          rest: {
            y: 0,
            rotateX: 0,
          },
          hover: {
            y: 0,
            rotateX: 0,
          },
        }}
        transition={transition}
      >
        {/* 폴더 실루엣 SVG */}
        <svg
          className="folder-card__front-svg"
          viewBox="0 0 360 388"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs><linearGradient id={surfaceGradientId} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="var(--folder-surface-light)" /><stop offset="100%" stopColor="var(--folder-panel)" /></linearGradient></defs>
          <motion.path
            variants={{
              rest: { d: 'M0 24 C0 10 10 0 24 0 H111 C126 0 135 11 145 25 C151 33 157 35 170 35 H338 C351 35 360 44 360 57 V367 C360 380 350 388 337 388 H23 C10 388 0 380 0 367 Z' },
              hover: { d: 'M0 164 C0 150 10 140 24 140 H111 C126 140 135 151 145 165 C151 173 157 175 170 175 H338 C351 175 360 184 360 197 V367 C360 380 350 388 337 388 H23 C10 388 0 380 0 367 Z' },
            }}
            transition={transition}
            fill={`url(#${surfaceGradientId})`}
          />
        </svg>

        <div className="folder-card__content">
          <motion.div className="folder-card__topline" variants={{ rest: { y: 0 }, hover: { y: 108 } }} transition={transition}>
            <span className="folder-card__number">
              {number}
            </span>

            {onOpen && (
              <button
                type="button"
                className="folder-card__arrow"
                aria-label={`${title} 열기`}
                onClick={onOpen}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 18 18 6M8 6h10v10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </motion.div>

          <div className="folder-card__bottom">
            <h3 className="folder-card__title">
              {title}
            </h3>

            {description && (
              <p className="folder-card__description">
                {description}
              </p>
            )}

            {hasTabs && (
              <div
                className="folder-card__tabs"
                aria-label="리포트 보기"
              >
                {onMain && (
                  <button
                    type="button"
                    onClick={onMain}
                  >
                    메인
                  </button>
                )}

                {onDetail && (
                  <button
                    type="button"
                    onClick={onDetail}
                  >
                    상세
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
