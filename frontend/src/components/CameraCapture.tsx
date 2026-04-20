import { useRef, useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture = ({ isOpen, onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Stop stream when closed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error('Camera error:', err);
        setError(err.message || 'Failed to access camera. Please check permissions.');
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Take a Photo</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative bg-black aspect-square overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-white text-sm">Accessing camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-10">
              <div className="text-center px-4">
                <p className="text-white text-sm font-medium mb-3">{error}</p>
                <Button onClick={onClose} variant="outline" size="sm" className="bg-white">
                  Close
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Capture crosshair */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 border-2 border-white/50 rounded-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 border-2 border-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading || !!error}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCapture}
            className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            disabled={isLoading || !!error}
          >
            <Camera className="w-4 h-4" />
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
