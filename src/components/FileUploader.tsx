/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { Document } from '../types';

interface FileUploaderProps {
  id: string;
  documents: Document[];
  onUpload: (file: { name: string; size: string; type: string }) => void;
  onDelete: (id: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  id,
  documents,
  onUpload,
  onDelete
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
    const allowedExtensions = ['PDF', 'DOCX', 'DOC', 'PPT', 'PPTX'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`Invalid file format. Please upload PDF, DOCX, or PPT documents.`);
      return;
    }

    // Standardize file size representation
    let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    if (file.size > 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    onUpload({
      name: file.name,
      size: sizeStr,
      type: fileExtension
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return <Lucide.FileText className="w-5 h-5 text-rose-500" />;
      case 'PPTX':
      case 'PPT':
        return <Lucide.Presentation className="w-5 h-5 text-amber-500" />;
      case 'DOCX':
      case 'DOC':
        return <Lucide.FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <Lucide.File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileBg = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return 'bg-rose-50';
      case 'PPTX':
      case 'PPT':
        return 'bg-amber-50';
      case 'DOCX':
      case 'DOC':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
          isDragActive 
            ? 'border-[#2563FF] bg-blue-50/20' 
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.ppt,.pptx"
          onChange={handleChange}
        />
        
        <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          <Lucide.UploadCloud className="w-8 h-8 animate-bounce" style={{ animationDuration: isDragActive ? '1s' : '3s' }} />
        </div>

        <h5 className="text-sm font-bold text-gray-800">
          Drag and drop your strategic document here, or <span className="text-[#2563FF] underline">browse files</span>
        </h5>
        
        <p className="mt-1 text-xs text-gray-400 max-w-xs">
          Supported file formats: PDF, DOCX, PPT, PPTX. Size limit: 25MB.
        </p>
      </div>

      {/* File List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Attached Documents ({documents.length})
        </h5>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 border border-gray-100 rounded-xl bg-white flex flex-col items-center justify-center">
            <Lucide.Files className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-500">No documents uploaded</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Upload brief sheets, quarterly reports, or alignment pitches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-150 rounded-lg hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${getFileBg(doc.type)}`}>
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-4">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="p-1 text-gray-400 hover:text-[#091540] hover:bg-slate-50 rounded"
                    title="Download File"
                  >
                    <Lucide.Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete File"
                  >
                    <Lucide.X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
