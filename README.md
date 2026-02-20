![Banner](https://raw.githubusercontent.com/ktmcp-cli/synq/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# SYNQ Video CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with SYNQ.

A production-ready command-line interface for [SYNQ Video API](https://www.synq.fm/) — manage video uploads, live streaming, and playback directly from your terminal.

## Features

- **Video Upload** — Create videos and get upload parameters
- **Live Streaming** — Generate RTMP stream URLs and playback links
- **Video Management** — Update metadata, query videos, get details
- **Uploader Widgets** — Generate embeddable upload widget URLs
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk

## Installation

```bash
npm install -g @ktmcp-cli/synq
```

## Quick Start

```bash
# Configure API key
synq config set --api-key YOUR_API_KEY

# Create a new video
synq video create --title "My Video"

# Get upload parameters
synq video upload <video-id>

# Create a live stream
synq stream --title "Live Event"

# Get video details
synq video details <video-id>
```

## Commands

### Config

```bash
synq config set --api-key <key>
synq config set --base-url <url>
synq config show
```

### Video

```bash
synq video create --title "Title" --description "Description"
synq video details <video-id>
synq video upload <video-id>
synq video update <video-id> --title "New Title"
synq video query --filter '{"state":"ready"}'
```

### Stream

```bash
synq stream --title "Live Stream"
synq stream --json
```

### Uploader

```bash
synq uploader <video-id>
synq uploader <video-id> --json
```

## Workflow Examples

### Upload Workflow

```bash
# 1. Create video
VIDEO_ID=$(synq video create --title "My Upload" --json | jq -r '.video_id')

# 2. Get upload parameters
synq video upload $VIDEO_ID --json

# 3. Upload file using the returned parameters (use curl, aws-cli, etc.)

# 4. Check status
synq video details $VIDEO_ID
```

### Live Streaming

```bash
# Create stream
synq stream --title "My Live Event" --json

# Returns:
# - stream_url: Use this in OBS/streaming software
# - playback_url: Share this with viewers
```

### Query Videos

```bash
# Query all videos
synq video query --json

# Filter by state (if API supports)
synq video query --filter '{"state":"ready"}' --json
```

## JSON Output

All commands support `--json` for structured output:

```bash
synq video create --title "Test" --json | jq '.video_id'
synq video details $VIDEO_ID --json | jq '.playback_url'
synq stream --json | jq '{stream: .stream_url, playback: .playback_url}'
```

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.
