import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, Loader2 } from 'lucide-react';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dtuxyk6hq';
const CLOUDINARY_UPLOAD_PRESET = 'nhs_tutoring';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileUpload = ({ onFilesChange, disabled = false }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return Image;
        if (type === 'application/pdf') return FileText;
        return File;
    };

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            return `${file.name} exceeds 5MB limit`;
        }
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        if (!allowedTypes.includes(file.type)) {
            return `${file.name} is not a supported file type`;
        }
        return null;
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'study-materials');

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        name: file.name,
                        url: response.secure_url,
                        type: file.type,
                        size: file.size,
                        publicId: response.public_id
                    });
                } else {
                    reject(new Error('Upload failed'));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);
            xhr.send(formData);
        });
    };

    const handleFiles = async (selectedFiles) => {
        setError('');

        if (files.length + selectedFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed`);
            return;
        }

        const validFiles = [];
        for (const file of selectedFiles) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            validFiles.push(file);
        }

        setUploading(true);
        try {
            const uploadPromises = validFiles.map(file => uploadFile(file));
            const uploadedFiles = await Promise.all(uploadPromises);

            const newFiles = [...files, ...uploadedFiles];
            setFiles(newFiles);
            onFilesChange(newFiles);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (disabled || uploading) return;
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleInputChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
        e.target.value = '';
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !disabled && !uploading && inputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                    transition-all duration-200
                    ${disabled || uploading
                        ? 'border-white/10 bg-white/5 cursor-not-allowed'
                        : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                    }
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    onChange={handleInputChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt"
                    disabled={disabled || uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 size={24} className="text-purple-400 animate-spin" />
                        <span className="text-white/70 text-sm">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <Upload size={24} className="text-white/50" />
                        <span className="text-white/70 text-sm">
                            Drop files here or click to upload
                        </span>
                        <span className="text-white/40 text-xs">
                            PDF, images, docs • Max 5MB each • Up to {MAX_FILES} files
                        </span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}

            {/* Uploaded Files List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => {
                        const IconComponent = getFileIcon(file.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                            >
                                <IconComponent size={18} className="text-blue-400 flex-shrink-0" />
                                <span className="text-white/80 text-sm truncate flex-1">
                                    {file.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-red-400 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
