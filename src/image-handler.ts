import fs from 'fs';
import path from 'path';

import { downloadMediaMessage, extensionForMediaMessage, proto } from '@whiskeysockets/baileys';

import { GROUPS_DIR } from './config.js';
import { logger } from './logger.js';

export function isImageMessage(msg: proto.IWebMessageInfo): boolean {
  return !!msg.message?.imageMessage;
}

export interface ImageResult {
  containerPath: string;
  caption: string;
  mimetype: string;
}

export async function downloadAndSaveImage(
  msg: proto.IWebMessageInfo,
  groupFolder: string,
): Promise<ImageResult> {
  const imageMsg = msg.message!.imageMessage!;
  const caption = imageMsg.caption || '';
  const mimetype = imageMsg.mimetype || 'image/jpeg';

  const ext = extensionForMediaMessage(msg.message!);
  const timestamp = Number(msg.messageTimestamp) * 1000;
  const id = msg.key?.id || 'unknown';
  const filename = `img-${timestamp}-${id}.${ext}`;

  const imagesDir = path.join(GROUPS_DIR, groupFolder, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const buffer = await downloadMediaMessage(msg as any, 'buffer', {});
  fs.writeFileSync(path.join(imagesDir, filename), buffer);

  const containerPath = `/workspace/group/images/${filename}`;
  logger.info({ groupFolder, filename }, 'Image saved');

  return { containerPath, caption, mimetype };
}
