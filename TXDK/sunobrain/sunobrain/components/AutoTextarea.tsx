import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
    function AutoTextarea({ value, onChange, style, ...rest }, ref) {
        const innerRef = useRef<HTMLTextAreaElement | null>(null);

        const setRefs = (node: HTMLTextAreaElement | null) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        };

        const resize = () => {
            const el = innerRef.current;
            if (!el) return;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        };

        useLayoutEffect(() => {
            resize();
        }, [value]);

        useEffect(() => {
            const onWindowResize = () => resize();
            window.addEventListener("resize", onWindowResize);
            return () => window.removeEventListener("resize", onWindowResize);
        }, []);

        return (
            <textarea
                {...rest}
                ref={setRefs}
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    resize();
                }}
                style={{ ...style, overflow: "hidden", resize: "none" }}
            />
        );
    },
);
