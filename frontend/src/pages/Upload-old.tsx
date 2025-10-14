import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, CloudUpload, Zap, Shield, Database } from 'lucide-react';
import { creditReportApi } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

interface UploadResult {
  success: boolean;
  message: string;
  reportId?: string;
  reportNumber?: string;
}

const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.xml')) {
      setResult({
        success: false,
        message: 'Please select an XML file (.xml extension)'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setResult({
        success: false,
        message: 'File size must be less than 10MB'
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const response = await creditReportApi.uploadXMLFile(file);
      
      if (response.success) {
        setResult({
          success: true,
          message: response.message || 'File uploaded and processed successfully!',
          reportId: response.data?.reportId,
          reportNumber: response.data?.reportNumber
        });
        setFile(null);
      } else {
        setResult({
          success: false,
          message: response.message || response.error || 'Upload failed'
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.message) {
        setResult({
          success: false,
          message: error.response.data.message
        });
      } else if (error.response?.data?.error) {
        setResult({
          success: false,
          message: error.response.data.error
        });
      } else {
        setResult({
          success: false,
          message: 'Network error. Please check your connection and try again.'
        });
      }
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
            <div className="space-y-2">
              <input
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Select XML File
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600"
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
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Process XML File
                </button>
                <button
                  onClick={removeFile}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Loading State */}
            {uploading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing XML file...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments depending on file size
                </p>
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <div className={`rounded-lg p-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3" />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Upload Successful!' : 'Upload Failed'}
              </h3>
              <p className={`mt-1 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              
              {result.success && result.reportNumber && (
                <div className="mt-4 space-y-2">
                  <p className="text-green-700">
                    <strong>Report Number:</strong> {result.reportNumber}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => window.location.href = `/reports/${result.reportId}`}
                      className="text-green-700 hover:text-green-800 font-medium"
                    >
                      View Report →
                    </button>
                    <button
                      onClick={resetUpload}
                      className="text-green-700 hover:text-green-800 font-medium"
                    >
                      Upload Another
                    </button>
                  </div>
                </div>
              )}

              {!result.success && (
                <button
                  onClick={resetUpload}
                  className="mt-4 text-red-700 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Instructions */}
      <Card className="border-accent">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Upload Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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