import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_DURATION = 30; // 30 segundos

export const useFileValidation = () => {
  const [error, setError] = useState<string | null>(null);

  const validateFile = async (file: File): Promise<boolean> => {
    setError(null);

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo es demasiado grande. El tamaño máximo es ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }

    // Validar tipo
    if (!file.type.match(/(image|video)\/.*/)) {
      setError('Solo se permiten archivos de imagen o video');
      return false;
    }

    // Validar duración del video
    if (file.type.startsWith('video/')) {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION) {
        setError(`El video es demasiado largo. La duración máxima es ${MAX_VIDEO_DURATION} segundos`);
        return false;
      }
    }

    return true;
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        reject('Error al cargar el video');
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const compressFile = async (file: File): Promise<Blob> => {
    if (file.type.startsWith('image/')) {
      return file; // Por ahora no comprimimos imágenes
    }

    if (file.type.startsWith('video/')) {
      // Por ahora solo validamos el video
      // TODO: Implementar compresión de video si es necesario
      return file;
    }

    return file;
  };

  return {
    validateFile,
    compressFile,
    error
  };
};