const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Car = require('../models/tb_car.model');
const carService = require('../service/car.service');

router.get('/mycars', authenticateToken, async (req, res) => {
  try {
    const seller_id = req.user.id;  // JWT 미들웨어에서 추출된 유저 ID

    const cars = await Car.find({ seller_id }).sort({ created_at: -1 });

    res.json({ cars });
  } catch (error) {
    console.error('차량 목록 조회 오류:', error);
    res.status(500).json({ error: '차량 목록을 불러오는 데 실패했습니다.' });
  }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const carId = req.params.id;
    const userId = req.user.id;

    const deleted = await carService.deleteCarById(carId, userId);

    if (!deleted) {
      return res.status(404).json({ message: '삭제할 차량을 찾을 수 없습니다.' });
    }

    res.json({ message: '차량이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('🚨 차량 삭제 오류:', error);
    res.status(500).json({ message: '차량 삭제 중 서버 오류 발생' });
  }
});


module.exports = router;
