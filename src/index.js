import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  createVideo,
  getUploadParams,
  getVideoDetails,
  updateVideo,
  queryVideos,
  createStream,
  getUploaderWidget
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('API key not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  synq config set --api-key YOUR_API_KEY'));
    console.log('\nGet your API key at: https://www.synq.fm/');
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('synq')
  .description(chalk.bold('SYNQ Video CLI') + ' - Video upload and playback from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'SYNQ API key')
  .option('--base-url <url>', 'API base URL')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API key set');
    }
    if (options.baseUrl) {
      setConfig('baseUrl', options.baseUrl);
      printSuccess('Base URL set');
    }
    if (!options.apiKey && !options.baseUrl) {
      printError('No options provided. Use --api-key or --base-url');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    const baseUrl = getConfig('baseUrl');
    console.log(chalk.bold('\nSYNQ Video CLI Configuration\n'));
    console.log('API Key:  ', apiKey ? chalk.green(apiKey.substring(0, 8) + '...') : chalk.red('not set'));
    console.log('Base URL: ', chalk.green(baseUrl || 'https://api.synq.fm/v1'));
    console.log('');
  });

// ============================================================
// VIDEO
// ============================================================

const videoCmd = program.command('video').description('Manage videos');

videoCmd
  .command('create')
  .description('Create a new video')
  .option('--title <title>', 'Video title')
  .option('--description <desc>', 'Video description')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();

    try {
      const metadata = {};
      if (options.title) metadata.title = options.title;
      if (options.description) metadata.description = options.description;

      const data = await withSpinner('Creating video...', () => createVideo(metadata));

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nVideo Created\n'));
      console.log(`Video ID:  ${chalk.cyan(data.video_id || data.id)}`);
      if (data.title) console.log(`Title:     ${data.title}`);
      console.log('');
      printSuccess('Video created successfully');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

videoCmd
  .command('details <video-id>')
  .description('Get video details')
  .option('--json', 'Output as JSON')
  .action(async (videoId, options) => {
    requireAuth();

    try {
      const data = await withSpinner(`Fetching details for ${videoId}...`, () =>
        getVideoDetails(videoId)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nVideo Details\n'));
      console.log(`ID:          ${chalk.cyan(data.video_id || videoId)}`);
      if (data.title) console.log(`Title:       ${data.title}`);
      if (data.state) console.log(`State:       ${chalk.yellow(data.state)}`);
      if (data.created_at) console.log(`Created:     ${data.created_at}`);
      if (data.playback_url) console.log(`Playback:    ${chalk.green(data.playback_url)}`);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

videoCmd
  .command('upload <video-id>')
  .description('Get upload parameters for a video')
  .option('--json', 'Output as JSON')
  .action(async (videoId, options) => {
    requireAuth();

    try {
      const data = await withSpinner(`Getting upload params for ${videoId}...`, () =>
        getUploadParams(videoId)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nUpload Parameters\n'));
      console.log(`Video ID:    ${chalk.cyan(videoId)}`);
      if (data.upload_url) console.log(`Upload URL:  ${chalk.green(data.upload_url)}`);
      if (data.action) console.log(`Action:      ${data.action}`);
      console.log('');
      printSuccess('Use these parameters to upload your video file');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

videoCmd
  .command('update <video-id>')
  .description('Update video metadata')
  .option('--title <title>', 'New title')
  .option('--description <desc>', 'New description')
  .option('--json', 'Output as JSON')
  .action(async (videoId, options) => {
    requireAuth();

    try {
      const metadata = {};
      if (options.title) metadata.title = options.title;
      if (options.description) metadata.description = options.description;

      if (Object.keys(metadata).length === 0) {
        printError('No metadata provided. Use --title or --description');
        process.exit(1);
      }

      const data = await withSpinner(`Updating video ${videoId}...`, () =>
        updateVideo(videoId, metadata)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      printSuccess(`Video ${videoId} updated successfully`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

videoCmd
  .command('query')
  .description('Query videos')
  .option('--filter <json>', 'Filter as JSON string')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();

    try {
      let filter = {};
      if (options.filter) {
        try {
          filter = JSON.parse(options.filter);
        } catch (e) {
          printError('Invalid JSON filter');
          process.exit(1);
        }
      }

      const data = await withSpinner('Querying videos...', () => queryVideos(filter));

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nVideo Query Results\n'));
      const videos = data.videos || data.results || [];

      if (videos.length === 0) {
        console.log(chalk.yellow('No videos found.'));
        return;
      }

      videos.forEach(video => {
        console.log(`${chalk.cyan('•')} ${video.video_id || video.id} - ${video.title || 'Untitled'}`);
      });

      console.log(chalk.dim(`\n${videos.length} video(s) found`));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// STREAM
// ============================================================

program
  .command('stream')
  .description('Create a live stream')
  .option('--title <title>', 'Stream title')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();

    try {
      const metadata = {};
      if (options.title) metadata.title = options.title;

      const data = await withSpinner('Creating stream...', () => createStream(metadata));

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nLive Stream Created\n'));
      console.log(`Video ID:     ${chalk.cyan(data.video_id || data.id)}`);
      if (data.stream_url) console.log(`Stream URL:   ${chalk.yellow(data.stream_url)}`);
      if (data.playback_url) console.log(`Playback URL: ${chalk.green(data.playback_url)}`);
      console.log('');
      printSuccess('Stream to the Stream URL, viewers use the Playback URL');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// UPLOADER
// ============================================================

program
  .command('uploader <video-id>')
  .description('Get uploader widget URL')
  .option('--json', 'Output as JSON')
  .action(async (videoId, options) => {
    requireAuth();

    try {
      const data = await withSpinner(`Getting uploader widget for ${videoId}...`, () =>
        getUploaderWidget(videoId)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nUploader Widget\n'));
      console.log(`Video ID:     ${chalk.cyan(videoId)}`);
      if (data.uploader_url) console.log(`Widget URL:   ${chalk.green(data.uploader_url)}`);
      console.log('');
      printSuccess('Embed this URL for user uploads');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
