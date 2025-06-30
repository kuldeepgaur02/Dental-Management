// File utility functions for handling file uploads and conversions

export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return imageTypes.includes(file.type);
};

export const isPdfFile = (file) => {
  return file.type === 'application/pdf';
};

export const isAllowedFileType = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const createFileObject = async (file) => {
  try {
    const base64 = await convertFileToBase64(file);
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      url: base64,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to process file');
  }
};

export const downloadFile = (fileData, filename) => {
  try {
    const link = document.createElement('a');
    link.href = fileData.url;
    link.download = filename || fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) {
    return 'Image';
  } else if (fileType === 'application/pdf') {
    return 'FileText';
  } else if (fileType.startsWith('text/')) {
    return 'FileText';
  } else if (fileType.includes('word')) {
    return 'FileText';
  } else {
    return 'File';
  }
};

export const createBlobUrl = (base64Data) => {
  try {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating blob URL:', error);
    return null;
  }
};