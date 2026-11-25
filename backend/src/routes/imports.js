const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/importsController');
const { authenticate, authorize } = require('../middleware/auth');

const receiveFile = express.raw({ type: 'application/octet-stream', limit: '10mb' });
function handleUploadError(err, req, res, next) {
    if (err.status === 413 || err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Максимальний розмір файлу — 10 МБ.' });
    }
    next(err);
}

router.post('/preview', authenticate, authorize('Admin'), receiveFile, handleUploadError, ctrl.preview);
router.post('/confirm', authenticate, authorize('Admin'), receiveFile, handleUploadError, ctrl.commit);

module.exports = router;
