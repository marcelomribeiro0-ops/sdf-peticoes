"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

type Props = {
  contentHtml: string;
  onChange: (html: string) => void;
};

export function RichEditor({ contentHtml, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: contentHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[60vh] focus:outline-none px-6 py-5 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && contentHtml !== editor.getHTML()) {
      editor.commands.setContent(contentHtml, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHtml]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
      <Toolbar editor={editor} />
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const Btn = ({
    on,
    active,
    title,
    children,
  }: {
    on: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={on}
      title={title}
      className={`h-8 min-w-8 rounded px-2 text-sm font-medium transition ${
        active
          ? "bg-ink-900 text-white"
          : "text-ink-700 hover:bg-ink-100"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-200 bg-ink-50 px-2 py-1.5">
      <Btn
        title="Negrito (Ctrl+B)"
        on={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <span className="font-bold">B</span>
      </Btn>
      <Btn
        title="Itálico (Ctrl+I)"
        on={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <span className="italic">I</span>
      </Btn>
      <Btn
        title="Sublinhado (Ctrl+U)"
        on={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        <span className="underline">U</span>
      </Btn>
      <span className="mx-1 h-5 w-px bg-ink-300" />
      <Btn
        title="Título 1"
        on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        H1
      </Btn>
      <Btn
        title="Título 2"
        on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </Btn>
      <Btn
        title="Título 3"
        on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </Btn>
      <span className="mx-1 h-5 w-px bg-ink-300" />
      <Btn
        title="Lista com marcadores"
        on={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        • Lista
      </Btn>
      <Btn
        title="Lista numerada"
        on={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        1. Lista
      </Btn>
      <Btn
        title="Citação"
        on={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        “ ”
      </Btn>
      <span className="mx-1 h-5 w-px bg-ink-300" />
      <Btn
        title="Desfazer (Ctrl+Z)"
        on={() => editor.chain().focus().undo().run()}
      >
        ↶
      </Btn>
      <Btn
        title="Refazer (Ctrl+Shift+Z)"
        on={() => editor.chain().focus().redo().run()}
      >
        ↷
      </Btn>
    </div>
  );
}
