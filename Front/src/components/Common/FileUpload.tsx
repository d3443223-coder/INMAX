import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import './FileUpload.css';

interface FileUploadProps {
  onFilesSelected: (files: File[], previews: string[]) => void;
  accept?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept = 'image/*,video/*',
  multiple = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const createPreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.match(/(image|video)\/.*/)
      );

      if (multiple) {
        const newFiles = [...files, ...droppedFiles];
        const newPreviews = [...previews, ...droppedFiles.map(createPreview)];
        setFiles(newFiles);
        setPreviews(newPreviews);
        onFilesSelected(newFiles, newPreviews);
      } else if (droppedFiles.length > 0) {
        const newFile = [droppedFiles[0]];
        const newPreview = [createPreview(droppedFiles[0])];
        setFiles(newFile);
        setPreviews(newPreview);
        onFilesSelected(newFile, newPreview);
      }
    },
    [files, multiple, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).filter((file) =>
          file.type.match(/(image|video)\/.*/)
        );

        if (multiple) {
          const newFiles = [...files, ...selectedFiles];
          const newPreviews = [...previews, ...selectedFiles.map(createPreview)];
          setFiles(newFiles);
          setPreviews(newPreviews);
          onFilesSelected(newFiles, newPreviews);
        } else if (selectedFiles.length > 0) {
          const newFile = [selectedFiles[0]];
          const newPreview = [createPreview(selectedFiles[0])];
          setFiles(newFile);
          setPreviews(newPreview);
          onFilesSelected(newFile, newPreview);
        }
      }
    },
    [files, previews, multiple, onFilesSelected]
  );

  const removeFile = useCallback(
    (index: number) => {
      const previewToRevoke = previews[index];
      const newFiles = files.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      setFiles(newFiles);
      setPreviews(newPreviews);
      onFilesSelected(newFiles, newPreviews);

      // Limpiar la URL del preview anterior
      if (previewToRevoke) {
        try {
          URL.revokeObjectURL(previewToRevoke);
        } catch (e) {
          // ignore
        }
      }
    },
    [files, previews, onFilesSelected]
  );

  // Revoke any remaining object URLs on unmount
  useEffect(() => {
    return () => {
      try {
        previews.forEach((p) => URL.revokeObjectURL(p));
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="file-upload-container">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="upload-icon" />
        <p className="upload-text">
          Arrastra y suelta archivos aquí o{' '}
          <label className="browse-label">
            <input
              type="file"
              onChange={handleFileInput}
              accept={accept}
              multiple={multiple}
              className="hidden-input"
            />
            examina
          </label>
        </p>
        <p className="upload-hint">Soporta imágenes y videos</p>
      </div>

      {files.length > 0 && (
        <div className="preview-area">
          {files.map((file, index) => {
            const previewSrc = previews[index];
            return (
              <div key={`${file.name}-${index}`} className="preview-item">
                <div className="preview-content">
                  {file.type.startsWith('image/') && previewSrc ? (
                    <img src={previewSrc} alt={file.name} className="preview-media" />
                  ) : file.type.startsWith('video/') && previewSrc ? (
                    <video src={previewSrc} controls className="preview-media" />
                  ) : null}
                </div>
                <div className="preview-info">
                  <span className="file-name" title={file.name}>{file.name}</span>
                  <button
                    className="remove-button"
                    onClick={() => removeFile(index)}
                    title="Eliminar archivo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;