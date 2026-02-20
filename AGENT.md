# AGENT.md — SYNQ Video CLI for AI Agents

This document explains how to use the SYNQ Video CLI as an AI agent.

## Overview

The `synq` CLI provides video upload, live streaming, and playback management via the SYNQ Video API.

## Prerequisites

```bash
synq config set --api-key <key>
```

## All Commands

### Config

```bash
synq config set --api-key <key>
synq config set --base-url <url>
synq config show
```

### Video Management

```bash
synq video create --title "Title"                    # Create video
synq video details <video-id>                        # Get video info
synq video upload <video-id>                         # Get upload params
synq video update <video-id> --title "New Title"     # Update metadata
synq video query --filter '{"state":"ready"}'        # Query videos
```

### Live Streaming

```bash
synq stream --title "Live Event"                     # Create stream
synq stream --json                                   # Returns stream_url & playback_url
```

### Uploader Widget

```bash
synq uploader <video-id>                             # Get embeddable widget URL
```

## Workflows

### Upload Workflow

1. Create video: `synq video create --title "Title" --json`
2. Get upload params: `synq video upload <video-id> --json`
3. Upload file using returned S3 parameters
4. Check status: `synq video details <video-id>`

### Streaming Workflow

1. Create stream: `synq stream --title "Title" --json`
2. Use `stream_url` in broadcasting software (OBS, etc.)
3. Share `playback_url` with viewers

## Tips for Agents

1. Always use `--json` for programmatic access
2. Parse video_id from create responses to use in subsequent commands
3. Upload parameters include S3 bucket details
4. Stream URLs are for RTMP broadcasting
5. Playback URLs are for viewers
