import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  type?: string;
};

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  function AutoResizeTextarea({ onChange, style, value, type: _type, ...props }, forwardedRef) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;

        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    useLayoutEffect(() => {
      if (!textareaRef.current) {
        return;
      }

      resizeTextarea(textareaRef.current);
    }, [value]);

    return (
      <textarea
        {...props}
        ref={setRefs}
        value={value}
        rows={1}
        style={style}
        onChange={(event) => {
          resizeTextarea(event.currentTarget);
          onChange?.(event);
        }}
      />
    );
  },
);

function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "0px";
  element.style.height = `${element.scrollHeight}px`;
}
