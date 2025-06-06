const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/tb_user.model');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000', // React 앱 주소로 제한 (필요시 수정)
  credentials: true,
}));
app.use(express.json()); // JSON 요청 바디 파싱

// MongoDB 연결
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MongoDB 연결 문자열이 .env에 설정되어 있지 않습니다.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 라우터 연결
const userservice = require('./service/user.service'); // ✅ 올바른 경로
const oauthservice = require('./service/genesis.service');

const carroutes = require('./routes/car.routes');
const walletrouter = require('./routes/wallet.route');
const carListService = require('./service/carList.service');

app.use('/api/users', userservice);
app.use('/oauth', oauthservice);

app.use('/api/car', carroutes);        // ✅ 새로 만든 car.routes.js 라우터 (겹치지 않으면 둘 다 사용 가능)
app.use('/api/wallet', walletrouter);
app.use('/uploads', express.static('uploads')); // 이미지 정적 경로

app.use('/api/carlist', carListService);

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
