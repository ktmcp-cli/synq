import axios from 'axios';
import { getConfig } from './config.js';

function getBaseURL() {
  return getConfig('baseUrl') || 'https://api.synq.fm/v1';
}

function getApiKey() {
  const apiKey = getConfig('apiKey');
  if (!apiKey) {
    throw new Error('API key not configured. Run: synq config set --api-key YOUR_KEY');
  }
  return apiKey;
}

async function request(endpoint, data = {}) {
  const baseURL = getBaseURL();
  const apiKey = getApiKey();

  try {
    const response = await axios.post(`${baseURL}${endpoint}`, {
      api_key: apiKey,
      ...data
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(`API Error: ${error.response.data.message}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================
// Video Operations
// ============================================================

/**
 * Create a new video
 */
export async function createVideo(metadata = {}) {
  return await request('/video/create', metadata);
}

/**
 * Get upload parameters for a video
 */
export async function getUploadParams(videoId) {
  return await request('/video/upload', { video_id: videoId });
}

/**
 * Get video details
 */
export async function getVideoDetails(videoId) {
  return await request('/video/details', { video_id: videoId });
}

/**
 * Update video metadata
 */
export async function updateVideo(videoId, metadata = {}) {
  return await request('/video/update', {
    video_id: videoId,
    source: metadata
  });
}

/**
 * Query videos
 */
export async function queryVideos(filter = {}) {
  return await request('/video/query', { filter });
}

/**
 * Create a stream
 */
export async function createStream(metadata = {}) {
  return await request('/video/stream', metadata);
}

/**
 * Get uploader widget URL
 */
export async function getUploaderWidget(videoId) {
  return await request('/video/uploader', { video_id: videoId });
}
