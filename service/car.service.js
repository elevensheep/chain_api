const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Car = require('../models/tb_car.model');
const User = require('../models/tb_user.model');
const Counter = require('../models/tb_counter.model');
const authenticateToken = require('../middleware/auth'); // JWT 인증 미들웨어

// 🔸 multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // 반드시 uploads 폴더가 존재해야 함
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 예: 1627382938473.jpg
    }
});
const upload = multer({ storage });

// 🔹 차량 등록 라우터
router.post('/register', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const {
            car_model,
            car_year,
            price,
            description,
            type,
            manufacturer
        } = req.body;

        const seller_id = req.user.id; // JWT에서 추출된 사용자 ID

        // 판매자 존재 확인
        const seller = await User.findById(seller_id);
        if (!seller) {
            return res.status(404).json({ error: '판매자 정보가 존재하지 않습니다.' });
        }

        // 🔸 차량 번호 자동 증가
        let counter = await Counter.findOneAndUpdate(
            { name: 'car_number' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const generatedCarNumber = String(counter.seq).padStart(7, '0');

        // 🔸 이미지 처리
        let images = [];
        if (req.file) {
            images.push(req.file.filename);
        }

        // 🔸 차량 객체 생성
        const newCar = new Car({
            seller_id,
            car_model,
            car_year,
            car_number: generatedCarNumber,
            price,
            images,
            description,
            type,
            manufacturer,
            is_sold: false
        });

        await newCar.save();

        res.status(201).json({
            message: '차량 등록 성공',
            car_id: newCar._id,
            car_number: generatedCarNumber
        });
    } catch (err) {
        console.error('🚨 차량 등록 에러:', err);
        res.status(500).json({ error: '차량 등록 실패', detail: err.message });
    }
});

// ✅ [추가] 내 차량 목록 조회 라우터
router.get('/mycars', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const cars = await Car.find({ seller_id: userId });

        res.json({ cars });
    } catch (err) {
        res.status(500).json({ error: '차량 조회 실패', detail: err.message });
    }
});

module.exports = router;
