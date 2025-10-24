import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, CloudUpload, CheckCircle, AlertCircle } from "lucide-react";
import { useFileUpload } from "@/hooks/useFiles";
import { cn } from "@/lib/utils";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId: string;
  taskTitle: string;
}

const FileUploadDialog = ({
  open,
  onOpenChange,
  projectId,
  taskId,
  taskTitle,
}: FileUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadFile, isUploading } = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setUploadProgress(0);

    uploadFile({
      uploadData: {
        file: selectedFile,
        projectId,
        taskId,
      },
      onProgress: (progress) => {
        setUploadProgress(progress);
      }
    }, {
      onSuccess: () => {
        // Reset form and close dialog after a short delay to show completion
        setTimeout(() => {
          setSelectedFile(null);
          setUploadProgress(0);
          onOpenChange(false);
        }, 500);
      },
      onError: () => {
        setUploadProgress(0);
      }
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const fileType = file.type.split('/')[0];
    
    if (fileType === 'image') return '🖼️';
    if (fileType === 'video') return '🎬';
    if (fileType === 'audio') return '🎵';
    if (extension === 'pdf') return '📄';
    if (['doc', 'docx'].includes(extension || '')) return '📝';
    if (['xls', 'xlsx'].includes(extension || '')) return '📊';
    if (['zip', 'rar'].includes(extension || '')) return '📦';
    return '📎';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-gray-200 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CloudUpload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Upload File</div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Add files to your task
                </div>
              </div>
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-gray-600 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700">{taskTitle}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Upload documents, images, or any files related to this task. Maximum file size: 50MB.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-gray-700 font-medium">Choose File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer group">
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Click to browse files</p>
                    <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                  </div>
                  <p className="text-xs text-gray-400">Supports all file types up to 50MB</p>
                </div>
              </label>
            </div>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="space-y-3">
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                isUploading 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-white border-gray-200 shadow-sm"
              )}>
                <div className="text-2xl">{getFileIcon(selectedFile)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Uploading...
                    </span>
                    <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress 
                    value={uploadProgress} 
                    className="h-2 bg-gray-200"
                  />
                  {uploadProgress === 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Upload complete! Closing...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={cn(
                "flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200",
                "shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-4 h-4" />
                  Upload File
                </div>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p>Uploaded files will be visible to all project members and can be downloaded from the project files section.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;