import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Eye, Download } from 'lucide-react';
import { 
  convertFileToBase64, 
  formatFileSize, 
  isImageFile, 
  isPdfFile, 
  isAllowedFileType, 
  validateFileSize,
  getFileIcon,
  downloadFile
} from '../../utils/fileUtils';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  maxFiles = 5, 
  maxSizeMB = 5,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  showPreview = true,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const processedFiles = [];

    for (const file of newFiles) {
      if (!isAllowedFileType(file)) {
        alert(`File type not allowed: ${file.name}`);
        continue;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        alert(`File too large: ${file.name}. Maximum size is ${maxSizeMB}MB`);
        continue;
      }

      try {
        const base64 = await convertFileToBase64(file);
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: base64,
          uploadedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        alert(`Error processing file: ${file.name}`);
      }
    }

    onFilesChange([...files, ...processedFiles]);
    setUploading(false);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handlePreview = (file) => {
    if (isImageFile(file) || isPdfFile(file)) {
      window.open(file.url, '_blank');
    }
  };

  const handleDownload = (file) => {
    downloadFile(file, file.name);
  };

  const getFileIconComponent = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    } else {
      return <File size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={openFileDialog}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={uploading}
              >
                Click to upload
              </button>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, PDF up to {maxSizeMB}MB (Max {maxFiles} files)
            </p>
          </div>
          
          {uploading && (
            <div className="text-sm text-blue-600">
              Processing files...
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIconComponent(file.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {(isImageFile(file) || isPdfFile(file)) && showPreview && (
                    <button
                      type="button"
                      onClick={() => handlePreview(file)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;