// src/utils/imageUtils.js (hoặc nơi bạn muốn đặt)
export function dataURIToBlob(dataURI) {
    if (!dataURI || !dataURI.startsWith('data:')) {
        console.error("Invalid dataURI provided to dataURIToBlob");
        return null;
    }
    try {
        // Tách phần base64 và mime type
        const [header, base64Data] = dataURI.split(',');
        if (!header || !base64Data) {
            console.error("Malformed dataURI: could not split header and base64 data.");
            return null;
        }

        const mimeMatch = header.match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) {
            console.error("Malformed dataURI: could not extract mime type.");
            return null;
        }
        const mimeString = mimeMatch[1];

        // Chuyển đổi base64 thành dữ liệu nhị phân
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeString });
    } catch (e) {
        console.error("Error converting data URI to Blob:", e);
        return null;
    }
}