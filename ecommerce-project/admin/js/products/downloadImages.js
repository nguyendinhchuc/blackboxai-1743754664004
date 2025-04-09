export async function downloadImages(imageUrls) {
    const downloadPromises = imageUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to download image: ' + url);
        
        const blob = await response.blob();
        const imageName = url.split('/').pop(); // Extract image name from URL
        const filePath = `ecommerce-project/admin/images/${imageName}`;
        
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return filePath; // Return the path where the image is saved
    });

    return Promise.all(downloadPromises);
}

// Example usage
// downloadImages(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);