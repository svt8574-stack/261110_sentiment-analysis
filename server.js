/**
 * 로컬 개발용 경량 개발 서버
 * 
 * Vercel CLI 로그인 없이도 로컬에서 바로:
 * 1. 정적 HTML, CSS, JS 제공
 * 2. .env 환경변수를 자동으로 불러와 /api/analyze 서버리스 함수 연결
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import analyzeHandler from './api/analyze.js';

// .env 파일 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. /api/analyze 엔드포인트 요청 처리
  if (pathname === '/api/analyze') {
    // Express / Vercel 호환 Response helper 주입
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
    res.json = function(data) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(data));
      return this;
    };

    // Body 파싱
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        if (rawBody && req.headers['content-type']?.includes('application/json')) {
          req.body = JSON.parse(rawBody);
        } else {
          req.body = {};
        }
      } catch (e) {
        req.body = {};
      }

      try {
        await analyzeHandler(req, res);
      } catch (err) {
        console.error('API Error:', err);
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: '문제가 발생했습니다. 다시 시도해 주세요.' } }));
        }
      }
    });
    return;
  }

  // 2. 정적 파일 서비스 (index.html, CSS, JS 등)
  let filePath = pathname === '/' ? path.join(__dirname, 'index.html') : path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  온도 (ONDO) 로컬 개발 서버가 실행되었습니다!`);
  console.log(`  접속 주소: http://localhost:${PORT}`);
  console.log(`  종료하려면 터미널에서 Ctrl + C 를 누르세요.`);
  console.log(`==================================================\n`);
});

