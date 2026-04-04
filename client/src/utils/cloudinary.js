/**
 * Transform a Cloudinary URL to serve an optimized version.
 *
 * @param {string} url      - Original Cloudinary URL
 * @param {object} options
 *   @param {number} width  - Target width in pixels
 *   @param {number} quality - Image quality 1-100 (auto = let Cloudinary decide)
 *   @param {string} format  - 'auto' lets Cloudinary pick webp/avif for modern browsers
 */
export function cloudinaryOptimize(url, { width = 400, quality = "auto", format = "auto" } = {}) {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Cloudinary URL structure:
    // https://res.cloudinary.com/<cloud>/image/upload/<transformations>/<public_id>
    // We insert the transformation string after /upload/

    const transformation = `w_${width},q_${quality},f_${format},c_fill`;
    return url.replace("/upload/", `/upload/${transformation}/`);
}