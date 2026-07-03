import { Router } from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(getRooms))
  .post(asyncHandler(createRoom));

router.route('/:id')
  .get(asyncHandler(getRoomById))
  .put(asyncHandler(updateRoom))
  .delete(asyncHandler(deleteRoom));

export default router;
