# Recipe Images

This folder contains your custom recipe images that will be displayed in the app.

## Image Naming Convention

Images should be named based on the recipe ID they correspond to:

- `recipe-1.jpg` - For recipe with ID 1
- `recipe-2.jpg` - For recipe with ID 2
- etc.

## Recommended Image Specs

- **Recipe Card Images**: 500px × 300px (16:9 ratio)
- **Recipe Detail Images**: 1200px × 800px (3:2 ratio)
- **Format**: JPG or JPEG (preferred for photos)
- **File Size**: Keep under 200KB for optimal performance

## Adding New Images

1. Find the recipe ID in your database or by checking the URL when viewing a recipe detail (the number after `/recipes/`)
2. Name your image file as `recipe-{ID}.jpg` (replace {ID} with the actual recipe ID)
3. Place the file in this directory
4. Refresh your browser to see the updated images

If an image isn't found for a recipe, the app will automatically use placeholder images from Unsplash based on the recipe title.

## How it Works

The app will look for a local image with the naming pattern `recipe-{ID}.jpg` first. If it doesn't find one, it will fall back to the recipe's `imageUrl` field in the database (if present), or finally generate a placeholder image using Unsplash.