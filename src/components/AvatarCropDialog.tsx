import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, User, RotateCcw, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
};

export const AvatarCropDialog = ({ open, onOpenChange, imageSrc, onCropComplete }: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsProcessing(false);
    onOpenChange(false);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-gray-200 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Adjust Your Avatar</div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Crop and position your profile picture
                </div>
              </div>
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-gray-600">
            <p className="text-sm leading-relaxed">
              Drag to reposition and adjust the zoom to get the perfect crop for your profile picture.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        {/* Cropper Container */}
        <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            classes={{
              containerClassName: "rounded-xl",
              mediaClassName: "rounded-xl",
              cropAreaClassName: "rounded-full border-2 border-white shadow-lg"
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-gray-500" />
                Zoom Level
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetCrop}
            className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Original
          </Button>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2 text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
              <p>
                <strong>Pro tip:</strong> Drag the image to position your face in the center, then adjust zoom for the perfect crop.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isProcessing || !croppedAreaPixels}
            className={cn(
              "flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200",
              "shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Save Avatar
              </div>
            )}
          </Button>
        </DialogFooter>

        {/* Best Practices */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              Avatar Best Practices
            </h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Center your face in the circle for best results</li>
              <li>Use a clear, well-lit photo</li>
              <li>Ensure good contrast with the background</li>
              <li>Square images work best for profile pictures</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};