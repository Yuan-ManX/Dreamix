#!/usr/bin/env python3
"""
Media Processing System Usage Example
This script demonstrates how to use the Dreamix media processing system
"""

import asyncio
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import tempfile


async def create_sample_images(output_dir: str, num_images: int = 5) -> list:
    """Create sample test images"""
    image_paths = []
    os.makedirs(output_dir, exist_ok=True)
    
    for i in range(num_images):
        img = Image.new('RGB', (400, 300), color=f'#{i*30:02x}{i*50:02x}{i*70:02x}')
        draw = ImageDraw.Draw(img)
        
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
        except:
            font = ImageFont.load_default()
        
        text = f"Frame {i+1}"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        x = (400 - text_width) / 2
        y = (300 - text_height) / 2
        draw.text((x, y), text, fill='white', font=font)
        
        image_path = os.path.join(output_dir, f"frame_{i+1}.png")
        img.save(image_path)
        image_paths.append(image_path)
        print(f"Created test image: {image_path}")
    
    return image_paths


def example_media_file_usage():
    """Example of using MediaFile class"""
    print("\n=== MediaFile Example ===")
    from app.core.media import MediaFile
    
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        temp_img_path = f.name
    
    img = Image.new('RGB', (100, 100), color='red')
    img.save(temp_img_path)
    
    try:
        media = MediaFile(temp_img_path)
        print(f"Media type: {media.media_type.value}")
        print(f"Media info: {media.get_info()}")
    finally:
        os.unlink(temp_img_path)


def example_media_storage_usage():
    """Example of using MediaStorage class"""
    print("\n=== MediaStorage Example ===")
    from app.core.media import MediaStorage, get_media_storage
    
    storage = get_media_storage()
    print(f"Storage path: {storage.storage_path}")
    
    media_files = storage.list_media_files()
    print(f"Number of media files in storage: {len(media_files)}")


def example_video_composition():
    """Example of using VideoComposer"""
    print("\n=== VideoComposer Example ===")
    from app.core.media import VideoComposer
    
    temp_dir = tempfile.mkdtemp()
    try:
        image_paths = asyncio.run(create_sample_images(temp_dir, 3))
        output_video = os.path.join(temp_dir, "output.mp4")
        
        print(f"Creating video from {len(image_paths)} images...")
        VideoComposer.create_video_from_images(
            image_paths=image_paths,
            output_path=output_video,
            fps=2
        )
        
        print(f"Video created: {output_video}")
        print(f"Video file size: {os.path.getsize(output_video)} bytes")
        
    except Exception as e:
        print(f"Video composition example error: {e}")
        print("Note: FFmpeg must be installed for video composition.")
    finally:
        import shutil
        shutil.rmtree(temp_dir)


def example_api_endpoints():
    """Example API endpoints overview"""
    print("\n=== API Endpoints Example ===")
    print("""
Available Media API Endpoints:
  POST /api/v1/media/upload - Upload a media file
  GET  /api/v1/media/list - List all media files
  GET  /api/v1/media/{filename} - Get media file info
  DELETE /api/v1/media/{filename} - Delete a media file
  POST /api/v1/media/compose-video - Compose video from images
    """)


def main():
    """Run all examples"""
    print("="*60)
    print("Dreamix Media Processing System - Usage Examples")
    print("="*60)
    
    try:
        example_media_file_usage()
        example_media_storage_usage()
        example_api_endpoints()
        
        print("\n" + "="*60)
        print("Examples completed!")
        print("="*60)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    main()
