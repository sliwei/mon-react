/**
 * 阿里云 OSS 上传脚本
 * 将 Vite 编译后的 dist 目录上传到阿里云 OSS
 */

import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OSS 配置
const config = {
  region: process.env.OSS_REGION || 'oss-cn-shenzhen',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
};

// 上传目标路径前缀
const OSS_PREFIX = process.env.OSS_PREFIX || 'code/mon-react/live';

// 本地 dist 目录
const DIST_DIR = path.resolve(__dirname, '../dist');

// 验证必需的环境变量
function validateEnv() {
  const required = ['OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_BUCKET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ 缺少必需的环境变量: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// 递归获取目录下所有文件
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// 根据文件扩展名获取 Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 上传单个文件到 OSS
async function uploadFile(client, localPath, ossPath) {
  try {
    const contentType = getContentType(localPath);
    const result = await client.put(ossPath, localPath, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': localPath.includes('/assets/') 
          ? 'public, max-age=31536000, immutable'  // 静态资源长期缓存
          : 'no-cache',  // HTML 等入口文件不缓存
      },
    });
    console.log(`✅ 上传成功: ${ossPath}`);
    return result;
  } catch (err) {
    console.error(`❌ 上传失败: ${ossPath}`, err.message);
    throw err;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始上传到阿里云 OSS...\n');
  
  validateEnv();

  // 检查 dist 目录是否存在
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ dist 目录不存在，请先运行 build 命令`);
    process.exit(1);
  }

  // 创建 OSS 客户端
  const client = new OSS(config);

  // 获取所有需要上传的文件
  const files = getAllFiles(DIST_DIR);
  
  if (files.length === 0) {
    console.error('❌ dist 目录为空');
    process.exit(1);
  }

  console.log(`📁 找到 ${files.length} 个文件需要上传\n`);

  // 统计
  let successCount = 0;
  let failCount = 0;

  // 上传所有文件
  for (const localPath of files) {
    const relativePath = path.relative(DIST_DIR, localPath);
    const ossPath = `${OSS_PREFIX}/${relativePath}`.replace(/\\/g, '/');
    
    try {
      await uploadFile(client, localPath, ossPath);
      successCount++;
    } catch {
      failCount++;
    }
  }

  console.log(`\n📊 上传完成: ${successCount} 成功, ${failCount} 失败`);
  
  if (failCount > 0) {
    process.exit(1);
  }
  
  console.log(`\n🎉 所有文件已上传到 https://i.bstu.cn/${OSS_PREFIX}/`);
}

main().catch(err => {
  console.error('上传过程中发生错误:', err);
  process.exit(1);
});
