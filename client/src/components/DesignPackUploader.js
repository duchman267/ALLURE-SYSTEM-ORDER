import React, { useState } from 'react';
import './DesignPackUploader.css';

const DesignPackUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.includes('zip')) {
            setError('Please select a ZIP file');
            return;
        }

        // Validate file size (max 50MB for design packs)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setError('File size must be less than 50MB');
            return;
        }

        setError('');
        await uploadDesignPack(file);
    };

    const uploadDesignPack = async (file) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('designPack', file);

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
                        setUploadResult(response.data);
                        if (onUploadComplete) {
                            onUploadComplete(response.data);
                        }
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
            xhr.open('POST', '/api/upload/design-pack');
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    const resetUploader = () => {
        setUploadResult(null);
        setUploadProgress(0);
        setError('');
    };

    return (
        <div className="design-pack-uploader">
            <h3>Upload Design Pack (ZIP)</h3>
            
            {!uploadResult && (
                <div className="upload-area">
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="file-input"
                        id="design-pack-input"
                    />
                    <label htmlFor="design-pack-input" className="upload-label">
                        {uploading ? (
                            <div className="uploading">
                                <div className="upload-spinner"></div>
                                <p>Uploading and extracting... {uploadProgress}%</p>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <div className="upload-icon">📦</div>
                                <p>Click to upload ZIP file containing designs</p>
                                <p className="upload-hint">
                                    Supported: .zip files (max 50MB)<br/>
                                    Will extract: .jpg, .png, .gif, .svg files
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            )}

            {uploadResult && (
                <div className="upload-success">
                    <div className="success-icon">✅</div>
                    <h4>Design Pack Uploaded Successfully!</h4>
                    
                    <div className="upload-details">
                        <p><strong>ZIP File:</strong> {uploadResult.zipFile.originalname}</p>
                        <p><strong>Size:</strong> {(uploadResult.zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Extracted Files:</strong> {uploadResult.totalExtracted} designs</p>
                    </div>

                    <div className="extracted-files">
                        <h5>Extracted Design Files:</h5>
                        <div className="file-grid">
                            {uploadResult.extractedFiles.map((file, index) => (
                                <div key={index} className="file-item">
                                    <img 
                                        src={file.url} 
                                        alt={file.originalName}
                                        className="file-preview"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <p className="file-name">{file.originalName}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="actions">
                        <button className="import-btn" onClick={() => {
                            // TODO: Implement import to database
                            alert('Import to database feature coming soon!');
                        }}>
                            Import to Database
                        </button>
                        <button className="reset-btn" onClick={resetUploader}>
                            Upload Another Pack
                        </button>
                    </div>
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

export default DesignPackUploader;