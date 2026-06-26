import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Heading1, Heading2, Heading3, Type } from 'lucide-react';

interface AutoExpandingRichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export const AutoExpandingRichTextEditor: React.FC<AutoExpandingRichTextEditorProps> = ({
  name,
  defaultValue = '',
  placeholder = 'Describe your description...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);

  const [activeBlock, setActiveBlock] = useState('p');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Sync incoming defaultValue (e.g. from database load)
  useEffect(() => {
    if (editorRef.current && defaultValue !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue;
      setHtml(defaultValue);
    }
  }, [defaultValue]);

  const handleInput = () => {
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
  };

  const updateStates = () => {
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;

    // Only sync from caret selection if there is actual content.
    // If empty, we keep the staged states clicked by the user.
    if (editor.textContent && editor.textContent.trim() !== '') {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));

      let block = 'p';
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let parent: HTMLElement | null = selection.getRangeAt(0).startContainer.parentElement;
          while (parent && parent !== editor) {
            const tag = parent.tagName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3'].includes(tag)) {
              block = tag;
              break;
            }
            parent = parent.parentElement;
          }
        }
      } catch (e) {
        // silent fallback
      }
      setActiveBlock(block);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const events = ['keyup', 'mouseup', 'click', 'input', 'focus', 'blur'];
    const handler = () => {
      handleInput();
      updateStates();
    };

    events.forEach(event => {
      editor.addEventListener(event, handler);
    });

    return () => {
      events.forEach(event => {
        editor.removeEventListener(event, handler);
      });
    };
  }, []);

  const applyFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const handleBlockClick = (tag: string) => {
    setActiveBlock(tag);
    applyFormat('formatBlock', tag);
  };

  const handleInlineClick = (command: string, stateSetter: React.Dispatch<React.SetStateAction<boolean>>, currentState: boolean) => {
    stateSetter(!currentState);
    applyFormat(command);
  };

  return (
    <div className="relative border border-zinc-200 bg-white transition-all focus-within:border-black">
      {/* Rich Formatting Toolbar - ALWAYS VISIBLE with Two Ordered Rows */}
      <div className="flex flex-col gap-2 p-3 bg-zinc-50 border-b border-zinc-200 select-none">
        
        {/* Top Row: Block Formats (Normal, H1, H2, H3) - Exactly One Active */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => handleBlockClick('p')}
            className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 rounded-none ${
              activeBlock === 'p'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Normal text"
          >
            <Type className="w-3.5 h-3.5" /> Normal
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockClick('h1')}
            className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 rounded-none ${
              activeBlock === 'h1'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" /> H1
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockClick('h2')}
            className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 rounded-none ${
              activeBlock === 'h2'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" /> H2
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockClick('h3')}
            className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 rounded-none ${
              activeBlock === 'h3'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" /> H3
          </button>
        </div>

        {/* Bottom Row: Inline Formats (Bold, Italic, Underline) - Independent Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInlineClick('bold', setIsBold, isBold)}
            className={`px-3 py-1.5 text-[11px] font-black border transition-all flex items-center gap-1.5 rounded-none ${
              isBold
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Bold (B)"
          >
            <Bold className="w-3.5 h-3.5" /> Bold (B)
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInlineClick('italic', setIsItalic, isItalic)}
            className={`px-3 py-1.5 text-[11px] font-black border transition-all flex items-center gap-1.5 rounded-none italic ${
              isItalic
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Italic (I)"
          >
            <Italic className="w-3.5 h-3.5" /> Italic (I)
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInlineClick('underline', setIsUnderline, isUnderline)}
            className={`px-3 py-1.5 text-[11px] font-black border transition-all flex items-center gap-1.5 rounded-none underline ${
              isUnderline
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Underline (U)"
          >
            <Underline className="w-3.5 h-3.5" /> Underline (U)
          </button>
        </div>
      </div>

      {/* Editor Surface Wrapper */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full px-4 py-4 min-h-[220px] outline-none text-sm font-semibold leading-relaxed text-zinc-950 [&_p]:font-semibold [&_p]:text-zinc-950 [&_p]:mb-2 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-black [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-lg [&_h3]:font-black [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          style={{ height: 'auto' }}
        />

        {/* Elegant overlay placeholder with same padding as the writing canvas */}
        {!html && (
          <div className="absolute top-4 left-4 text-zinc-400 text-sm pointer-events-none select-none font-medium">
            {placeholder}
          </div>
        )}
      </div>

      {/* Hidden element for Form submission integration */}
      <textarea
        name={name}
        value={html}
        onChange={() => {}} // Dummy to suppress react warning
        className="hidden"
      />
    </div>
  );
};

interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  defaultValue?: string;
}

export const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({
  name,
  defaultValue = '',
  className = '',
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState(defaultValue);

  useEffect(() => {
    setVal(defaultValue);
  }, [defaultValue]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
    const timer = setTimeout(adjustHeight, 50);
    return () => clearTimeout(timer);
  }, [val]);

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        if (props.onChange) {
          props.onChange(e);
        }
      }}
      rows={1}
      className={`w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black text-xs font-bold resize-none overflow-hidden transition-all focus:bg-white ${className}`}
      style={{ height: 'auto', minHeight: '44px' }}
      {...props}
    />
  );
};
