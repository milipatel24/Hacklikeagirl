
import React, { useState } from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Smile, Link, Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here..."
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const insertText = (before: string, after: string = '', type?: 'bold' | 'italic' | 'strike') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newStart = start;
    let newEnd = end;

    // Toggle formatting if already present
    if (type === 'bold' && selectedText.startsWith('**') && selectedText.endsWith('**')) {
      // Remove bold
      newText = value.substring(0, start) + selectedText.slice(2, -2) + value.substring(end);
      newEnd = newStart + selectedText.length - 4;
    } else if (type === 'italic' && selectedText.startsWith('*') && selectedText.endsWith('*')) {
      // Remove italic
      newText = value.substring(0, start) + selectedText.slice(1, -1) + value.substring(end);
      newEnd = newStart + selectedText.length - 2;
    } else if (type === 'strike' && selectedText.startsWith('~~') && selectedText.endsWith('~~')) {
      // Remove strikethrough
      newText = value.substring(0, start) + selectedText.slice(2, -2) + value.substring(end);
      newEnd = newStart + selectedText.length - 4;
    } else if (selectedText.length > 0) {
      // Add formatting
      newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newStart = start + before.length;
      newEnd = end + before.length;
    } else {
      // No selection, just insert symbols
      newText = value.substring(0, start) + before + after + value.substring(end);
      newStart = newEnd = start + before.length;
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertText('**', '**', 'bold'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*', 'italic'), tooltip: 'Italic' },
    { icon: Strikethrough, action: () => insertText('~~', '~~', 'strike'), tooltip: 'Strikethrough' },
    { icon: List, action: () => insertText('- '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('1. '), tooltip: 'Numbered List' },
    { icon: Link, action: () => insertText('[Link Text](', ')'), tooltip: 'Insert Link' },
    { icon: Image, action: () => insertText('![Alt Text](', ')'), tooltip: 'Insert Image' },
    { icon: Smile, action: () => insertText('😊'), tooltip: 'Insert Emoji' },
  ];

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.tooltip}
            className="h-8 w-8 p-0"
            type="button"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button
            variant={!showPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(false)}
            type="button"
          >
            Write
          </Button>
          <Button
            variant={showPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(true)}
            type="button"
          >
            Preview
          </Button>
        </div>
      </div>
      
      {showPreview ? (
        <div
          className="p-4 min-h-[200px] prose max-w-none"
          dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
        />
      ) : (
        <Textarea
          id="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] border-0 focus:ring-0 resize-none"
        />
      )}
    </div>
  );
};
