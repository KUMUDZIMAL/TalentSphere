"use client";
import React, { useState, useRef, ChangeEvent } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';

interface PortfolioElement {
  id: string;
  type: 'image' | 'text';
  content: string; // For image: URL (Base64 or hosted URL); for text: the text content.
  x: number;
  y: number;
  width: number;
  height: number;
}

const initialElements: PortfolioElement[] = [
  {
    id: '1',
    type: 'image',
    content: '/actor.jpg', // Adjust path or URL as needed.
    x: 50,
    y: 50,
    width: 200,
    height: 150,
  },
  {
    id: '2',
    type: 'text',
    content: 'Your caption here',
    x: 300,
    y: 100,
    width: 200,
    height: 50,
  },
];

export const PortfolioEditor: React.FC = () => {
  const [elements, setElements] = useState<PortfolioElement[]>(initialElements);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const updateElement = (id: string, data: Partial<PortfolioElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...data } : el))
    );
  };

  const addTextElement = () => {
    const newElement: PortfolioElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      width: 150,
      height: 50,
    };
    setElements((prev) => [...prev, newElement]);
  };

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const newElement: PortfolioElement = {
          id: Date.now().toString(),
          type: 'image',
          content: result,
          x: 100,
          y: 100,
          width: 200,
          height: 150,
        };
        setElements((prev) => [...prev, newElement]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save portfolio state to backend (e.g., MongoDB)
  const handleSavePortfolio = async () => {
    try {
      const response = await fetch('/api/savePortfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements }),
      });
      if (response.ok) {
        alert('Portfolio saved successfully!');
      } else {
        const data = await response.json();
        alert('Failed to save portfolio: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      alert('Error saving portfolio.');
    }
  };

  // Download portfolio as PDF (opens a new window without file inputs and buttons)
  const handleDownloadPortfolio = () => {
    try {
      if (!editorRef.current) {
        throw new Error('Editor content not found');
      }
      // Clone the editor node
      const clone = editorRef.current.cloneNode(true) as HTMLElement;
      // Remove any file input elements from the clone
      clone.querySelectorAll('input[type="file"]').forEach((el) => el.remove());
      // Remove any elements marked with the 'no-print' class (like button containers)
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());
      const content = clone.innerHTML;
      
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open new window');
      }
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>My Portfolio</title>
            <style>
              body { margin: 0; padding: 20px; }
              .portfolio-container { position: relative; width: 100%; min-height: 100vh; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <div class="portfolio-container">
              ${content}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Error downloading portfolio:', error);
      alert('Error downloading portfolio: ' + (error instanceof Error ? error.message : error));
    }
  };

  return (
    <div className="relative w-full h-screen border border-dashed" ref={editorRef}>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) =>
            updateElement(el.id, {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            })
          }
          bounds="parent"
        >
          {el.type === 'image' ? (
            <img
              src={el.content}
              alt="Portfolio"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateElement(el.id, { content: e.currentTarget.innerText })
              }
              className="w-full h-full p-2 border border-gray-300 bg-white"
            >
              {el.content}
            </div>
          )}
        </Rnd>
      ))}

      {/* Button container with no-print class to exclude from print/download */}
      <div className="absolute bottom-4 left-4 flex gap-2 no-print">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleAddImageClick}
        >
          Add Image
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={addTextElement}
        >
          Add Text
        </button>
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded"
          onClick={handleSavePortfolio}
        >
          Save Portfolio
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded"
          onClick={handleDownloadPortfolio}
        >
          Download Portfolio
        </button>
      </div>
    </div>
  );
};
