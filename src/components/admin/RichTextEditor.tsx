import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
const DraggableImage = Image.extend({ draggable: true });
import Placeholder from "@tiptap/extension-placeholder";
import { uploadImage } from "@/lib/cloudinary";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: "swamy/blog" | "swamy/properties";
};

export function RichTextEditor({ value, onChange, placeholder = "Write something…", folder = "swamy/blog" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      DraggableImage,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none min-h-[240px] focus:outline-none px-3 py-3 text-[14px]",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="rounded-lg border border-slate-200 p-3 text-[13px] text-slate-500 dark:border-slate-800">Loading editor…</div>;
  }

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-[12px] font-medium transition ${
      active ? "bg-[#1E3A5F] text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  const onImageClick = () => fileRef.current?.click();
  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const res = await uploadImage(file, folder);
      editor.chain().focus().setImage({ src: res.url }).run();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/60">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>“ ”</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))}>{"</>"}</button>
        <button type="button" onClick={setLink} className={btn(editor.isActive("link"))}>Link</button>
        <button type="button" onClick={onImageClick} className={btn(false)}>Image</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
