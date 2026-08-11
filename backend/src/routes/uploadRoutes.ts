import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { AppError, ErrorCode } from '../utils/AppError';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file provided', 400, ErrorCode.VALIDATION_ERROR);
    }
    
    // Default bucket
    const bucket = req.body.bucket || 'hotel-gallery';
    const folder = req.body.folder || 'general';
    
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw new AppError(`Upload failed: ${error.message}`, 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        bucket
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
