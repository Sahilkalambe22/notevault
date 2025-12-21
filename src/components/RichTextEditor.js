import React, { useEffect, useRef, useState } from "react";

const defaultFormat = {
  bold: false,
  italic: false,
  underline: false,
  ul: false,
  ol: false,
  h3: false,
};

const RichTextEditor = ({
  value,
  onChange,
  minHeight = 420,
  showLabel = false,
}) => {
  const editorRef = useRef(null);
  const [format, setFormat] = useState(defaultFormat);
  const isInternalChange = useRef(false);

  // Sync external value ONLY when not typing
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const updateToolbar = () => {
    try {
      setFormat({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
        h3: document
          .queryCommandValue("formatBlock")
          ?.toLowerCase()
          .includes("h3"),
      });
    } catch {}
  };

  const handleInput = () => {
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    updateToolbar();
  };

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    handleInput();
  };

  return (
    <div>
      <div className="btn-group btn-group-sm mb-2">
        <button className={`btn btn-outline-secondary ${format.bold ? "active" : ""}`} onClick={() => exec("bold")}><b>B</b></button>
        <button className={`btn btn-outline-secondary ${format.italic ? "active" : ""}`} onClick={() => exec("italic")}><i>I</i></button>
        <button className={`btn btn-outline-secondary ${format.underline ? "active" : ""}`} onClick={() => exec("underline")}><u>U</u></button>
        <button className={`btn btn-outline-secondary ${format.ul ? "active" : ""}`} onClick={() => exec("insertUnorderedList")}>• List</button>
        <button className={`btn btn-outline-secondary ${format.ol ? "active" : ""}`} onClick={() => exec("insertOrderedList")}>1. List</button>
        <button className={`btn btn-outline-secondary ${format.h3 ? "active" : ""}`} onClick={() => exec("formatBlock", "h3")}>H3</button>
      </div>

      <div
        ref={editorRef}
        className="form-control" 
        contentEditable
        style={{ minHeight }}
        onInput={handleInput}
        onClick={updateToolbar}
        onKeyUp={updateToolbar}
      />
    </div>
  );
};

export default RichTextEditor;
