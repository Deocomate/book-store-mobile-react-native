

/*
####################################################################
# blogService.js
####################################################################
*/
// src/services/blogService.js
import api from './api';

const blogService = {
    // GET /blog
    getAllBlogs: async (filter = {}, pageIndex = 1, pageSize = 10) => {
        const params = {
            ...filter,
            pageIndex: pageIndex > 0 ? pageIndex : 1, // API from example seems 1-based
            pageSize,
        };
        try {
            const response = await api.get('/blog/', { params });
            // axios_response_example shows pageIndex starting from 1 for blogs
            // Ensure backend BlogServiceImpl page is 0-indexed: page = pageIndex - 1
            // Or if backend is 1-indexed for this specific endpoint, keep as is.
            // Assuming example is correct and this specific endpoint uses 1-based for request.
            return response; // ApiResponse<PageResponse<BlogResponse>>
        } catch (error) {
            console.error('Get all blogs failed:', error.message || error);
            throw error;
        }
    },

    // GET /blog/{id}
    getBlogById: async (blogId) => {
        try {
            const response = await api.get(`/blog/${blogId}`);
            return response; // ApiResponse<BlogResponse>
        } catch (error) {
            console.error(`Get blog ${blogId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /blog
    createBlog: async (blogData, thumbnailFile) => {
        // blogData: { title, content, priority, categoryId }
        const formData = new FormData();
        formData.append('blog', JSON.stringify(blogData));
        formData.append('thumbnail', {
            uri: thumbnailFile.uri,
            name: thumbnailFile.fileName || `thumbnail-${Date.now()}.${thumbnailFile.uri.split('.').pop()}`,
            type: thumbnailFile.mimeType || 'image/jpeg',
        });
        try {
            const response = await api.post('/blog', formData);
            return response; // ApiResponse<BlogResponse>
        } catch (error) {
            console.error('Create blog failed:', error.message || error);
            throw error;
        }
    },

    // PUT /blog/{id}
    updateBlog: async (blogId, blogData, thumbnailFile = null) => {
        const formData = new FormData();
        formData.append('blog', JSON.stringify(blogData));
        if (thumbnailFile) {
            formData.append('thumbnail', {
                uri: thumbnailFile.uri,
                name: thumbnailFile.fileName || `thumb-update-${Date.now()}.${thumbnailFile.uri.split('.').pop()}`,
                type: thumbnailFile.mimeType || 'image/jpeg',
            });
        }
        try {
            const response = await api.put(`/blog/${blogId}`, formData);
            return response; // ApiResponse<BlogResponse>
        } catch (error) {
            console.error(`Update blog ${blogId} failed:`, error.message || error);
            throw error;
        }
    },

    // DELETE /blog/{id}
    deleteBlog: async (blogId) => {
        try {
            const response = await api.delete(`/blog/${blogId}`);
            return response; // ApiResponse<Void>
        } catch (error) {
            console.error(`Delete blog ${blogId} failed:`, error.message || error);
            throw error;
        }
    },

    // GET /blog/category
    getAllBlogCategories: async () => {
        try {
            const response = await api.get('/blog/category');
            return response; // ApiResponse<List<CategoryResponse>>
        } catch (error) {
            console.error('Get all blog categories failed:', error.message || error);
            throw error;
        }
    },

    // POST /blog/file/media - This seems redundant if createBlog handles upload.
    // But if needed for other purposes:
    uploadBlogMedia: async (mediaFile) => {
        const formData = new FormData();
        formData.append('file', {
            uri: mediaFile.uri,
            name: mediaFile.fileName || `blog-media-${Date.now()}.${mediaFile.uri.split('.').pop()}`,
            type: mediaFile.mimeType || 'application/octet-stream',
        });
        try {
            // Note: The path in api_endpoints.txt is /blog/file/media
            // The FeignClient in blog-service for FileServiceClientRepository has /file/media
            // The gateway route for file-service is /file/**, and for blog-service is /blog/**
            // If this call is intended for the FileService THROUGH the blog-service's FeignClient,
            // the path called from frontend should be /blog/file/media
            // If it's intended for the FileService directly (but prefixed by blog in gateway for some reason)
            // it still would be /blog/file/media via gateway.
            // The backend blog-service has FileServiceClientRepository with @FeignClient(name = "file-service", url = "${app.file-service.url}")
            // and methods like @PostMapping(value = "/file/media" ...).
            // This means blog-service internally calls file-service at file-service's /file/media.
            // The frontend API Gateway path for blog-service is /api/v1/blog.
            // So, POST /api/v1/blog/file/media is correct if blog-service itself exposes /file/media.
            // Based on `api_endpoints.txt` `POST blog/file/media` -> this implies a path *within* the blog service context.
            const response = await api.post('/blog/file/media', formData);
            return response; // ApiResponse<FileResponse>
        } catch (error) {
            console.error('Upload blog media failed:', error.message || error);
            throw error;
        }
    },

    // DELETE /blog/file/media/{fileName}
    deleteBlogMedia: async (fileName) => {
        try {
            const response = await api.delete(`/blog/file/media/${fileName}`);
            return response; // ApiResponse<FileResponse>
        } catch (error) {
            console.error(`Delete blog media ${fileName} failed:`, error.message || error);
            throw error;
        }
    },
};
export default blogService;