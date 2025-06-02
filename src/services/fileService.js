

/*
####################################################################
# fileService.js
####################################################################
*/
// src/services/fileService.js
import api from './api';

const fileService = {
    // POST /file/media
    uploadFile: async (file) => { // file: { uri, fileName, mimeType }
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.fileName || `upload-${Date.now()}.${file.uri.split('.').pop()}`,
            type: file.mimeType || 'application/octet-stream', // Ensure correct MIME type
        });
        try {
            const response = await api.post('/file/media', formData);
            return response; // ApiResponse<FileResponse { originalFileName, url }>
        } catch (error) {
            console.error('Upload file failed:', error.message || error);
            throw error;
        }
    },

    // GET /file/media/download/{fileName} - This returns the actual file resource
    // For mobile, usually you just need the URL to display an image or for a WebView.
    getDownloadUrl: (fileName) => {
        // Simply constructs the URL based on API base and path
        return `${api.defaults.baseURL}/file/media/download/${fileName}`;
    },

    // DELETE /file/media/{fileName}
    deleteFile: async (fileName) => {
        try {
            const response = await api.delete(`/file/media/${fileName}`);
            // Backend returns void, API spec does not specify response body, assume success if no error
            return { status: 200, message: "File deleted successfully", result: null, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error(`Delete file ${fileName} failed:`, error.message || error);
            throw error;
        }
    },
};
export default fileService;