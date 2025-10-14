import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, CloudUpload, Zap, Shield, Database } from 'lucide-react';
import { creditReportApi } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface UploadResult {
  success: boolean;
  message: string;
  reportId?: string;
  reportNumber?: string;
}

interface UploadPageProps {
  onUploadSuccess?: () => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'text/xml' || selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        const errorMsg = 'Please select a valid XML file';
        setResult({
          success: false,
          message: errorMsg
        });
        toast.error(errorMsg);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'text/xml' || selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        const errorMsg = 'Please select a valid XML file';
        setResult({
          success: false,
          message: errorMsg
        });
        toast.error(errorMsg);
      }
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const response = await creditReportApi.uploadXMLFile(file);
      
      if (response.success) {
        const successMessage = response.message || 'File uploaded and processed successfully!';
        setResult({
          success: true,
          message: successMessage,
          reportId: response.data?.id,
          reportNumber: response.data?.reportNumber
        });
        
        toast.success(successMessage, {
          duration: 3000,
        });
        
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 2000);
        }
      } else {
        const errorMessage = response.error || response.message || 'Upload failed';
        setResult({
          success: false,
          message: errorMessage
        });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      // Handle specific HTTP status codes
      if (error.response?.status === 409) {
        const responseData = error.response.data;
        if (responseData?.reportId) {
          errorMessage = `Report already exists! A credit report with number ${responseData.message?.match(/\d+/)?.[0] || 'this ID'} was already processed. Report ID: ${responseData.reportId}`;
          toast.error('Duplicate Report Detected', {
            duration: 5000,
          });
          toast('You can view the existing report in the Reports section', {
            icon: '📋',
            duration: 4000,
          });
        } else {
          errorMessage = responseData?.message || 'This report has already been processed';
          toast.error('Duplicate Report', {
            duration: 4000,
          });
        }
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        errorMessage = error.response.data?.message || 'Invalid request. Please check your file and try again.';
        toast.error('Upload Error', {
          duration: 4000,
        });
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        toast.error('Server Error', {
          duration: 4000,
        });
      } else {
        toast.error('Upload Failed', {
          duration: 4000,
        });
      }
      
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <CloudUpload className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Upload Credit Report
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Securely process Experian XML files with advanced analytics
            </p>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Secure Processing</h3>
              <p className="text-xs text-muted-foreground">End-to-end encryption</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 hover:border-green-500/40 transition-all">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Fast Analysis</h3>
              <p className="text-xs text-muted-foreground">Instant processing</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="p-4 text-center">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Data Insights</h3>
              <p className="text-xs text-muted-foreground">Comprehensive reports</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Upload Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          {!file ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group",
                dragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Upload className={cn(
                  "mx-auto h-16 w-16 mb-6 transition-all duration-300",
                  dragActive ? "text-primary animate-bounce" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Drop your XML file here, or click to browse
              </h3>
              <p className="text-muted-foreground mb-8">
                Supports XML files up to 10MB. Only Experian credit report format accepted.
              </p>
              
              {/* Enhanced File Format Info */}
              <div className="bg-accent/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>XML Format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Experian Only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Max 10MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-200 inline-block font-medium hover:scale-105 active:scale-95"
                >
                  Choose XML File
                </label>
                <p className="text-xs text-muted-foreground">
                  Or drag and drop your file above
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Preview */}
              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Upload Button */}
              {!uploading && !result?.success && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={uploadFile}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium hover:scale-105 active:scale-95"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Process XML File
                  </button>
                  <button
                    onClick={removeFile}
                    className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Loading State */}
              {uploading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Processing your XML file...</p>
                  <div className="mt-4 w-full bg-accent rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full animate-pulse-slow w-3/4"></div>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className={cn(
                  "p-6 rounded-lg border",
                  result.success 
                    ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                )}>
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">
                        {result.success ? 'Upload Successful!' : 'Upload Failed'}
                      </h4>
                      <p className="text-sm mb-4">{result.message}</p>
                      
                      {result.success && result.reportNumber && (
                        <p className="text-sm font-medium mb-4">
                          <strong>Report Number:</strong> {result.reportNumber}
                        </p>
                      )}
                      
                      <div className="flex space-x-4">
                        {result.success ? (
                          <>
                            <button
                              onClick={() => onUploadSuccess?.()}
                              className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium underline"
                            >
                              View Report →
                            </button>
                            <button
                              onClick={resetUpload}
                              className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium underline"
                            >
                              Upload Another
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={resetUpload}
                            className="text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium underline"
                          >
                            Try Again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Instructions */}
      <Card className="border-accent">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Upload Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">File Requirements</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>XML format only (.xml)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Experian INProfileResponse structure</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Data Extracted</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Personal details & PAN</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Credit score & rating</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Account information & balances</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;