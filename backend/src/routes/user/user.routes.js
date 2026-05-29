const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/user.controller');

// TODO: Nên thêm middleware kiểm tra quyền Admin ở đây
// const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
// router.use(verifyToken, isAdmin);

router.get('/stats', userController.getStats);
router.get('/roles', userController.getRoles);
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/reset-password', userController.resetPassword);

module.exports = router;
