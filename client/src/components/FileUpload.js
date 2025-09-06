import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ type, onUploadComplete, accept = "image/*", maxSize = 5 }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size
        const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
        if (file.size > maxSizeBytes) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Validate file type
        const allowedTypes = accept.split(',').map(t => t.trim());
        const isValidType = allowedTypes.some(allowedType => {
            if (allowedType === 'image/*') {
                return file.type.startsWith('image/');
            }
            return file.type === allowedType || file.name.toLowerCase().endsWith(allowedType.replace('*', ''));
        });

        if (!isValidType) {
            setError(`Invalid file type. Allowed: ${accept}`);
            return;
        }

        setError('');
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append(type, file);

        try {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        setUploadedFile({
                            name: file.name,
                            url: response.data.url,
                            size: file.size
                        });
                        onUploadComplete(response.data);
                    } else {
                        setError(response.message || 'Upload failed');
                    }
                } else {
                    setError('Upload failed. Please try again.');
                }
                setUploading(false);
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                setError('Upload failed. Please check your connection.');
                setUploading(false);
            });

            // Send request
            xhr.open('POST', `/api/upload/${type}`);
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadProgress(0);
        setError('');
        onUploadComplete(null);
    };

    return (
        <div className="file-upload">
            {!uploadedFile && (
                <div className="upload-area">
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="file-input"
                        id={`file-${type}`}
                    />
                    <label htmlFor={`file-${type}`} className="upload-label">
                        {uploading ? (
                            <div className="uploading">
                                <div className="upload-spinner"></div>
                                <p>Uploading... {uploadProgress}%</p>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <div className="upload-icon">📁</div>
                                <p>Click to upload or drag and drop</p>
                                <p className="upload-hint">
                                    {accept} (max {maxSize}MB)
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            )}

            {uploadedFile && (
                <div className="uploaded-file">
                    <div className="file-info">
                        <div className="file-icon">✅</div>
                        <div className="file-details">
                            <p className="file-name">{uploadedFile.name}</p>
                            <p className="file-size">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button 
                            className="remove-btn" 
                            onClick={removeFile}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                    {uploadedFile.url && uploadedFile.url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <div className="file-preview">
                            <img 
                                src={uploadedFile.url} 
                                alt="Preview" 
                                className="preview-image"
                            />
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;