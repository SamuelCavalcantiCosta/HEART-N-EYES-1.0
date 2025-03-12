// server.js - Main backend server for HEART'N'EYES cloud infrastructure

// Environment variables - would be in .env file in production
process.env.JWT_SECRET = 'your-jwt-secret-key-here';
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET = 'heartneyes-recordings';
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const ffmpeg = require('fluent-ffmpeg');
const ytapi = require('youtube-api');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/heartneyes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define database models
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String, // In production: would be hashed
  apiKey: String,
  createdAt: Date,
  subscriptionTier: String,
  storageUsed: Number,
  streamQuota: Number
});

const Stream = mongoose.model('Stream', {
  userId: String,
  streamId: String,
  title: String,
  description: String,
  platform: String,
  startTime: Date,
  endTime: Date,
  duration: Number,
  viewCount: Number,
  status: String,
  url: String,
  thumbnailUrl: String
});

const Recording = mongoose.model('Recording', {
  userId: String,
  recordingId: String,
  title: String,
  description: String,
  createdAt: Date,
  duration: Number,
  fileSize: Number,
  storageLocation: String,
  isPublic: Boolean,
  viewCount: Number,
  shareUrl: String
});

// Initialize AWS services
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();
const mediaconvert = new AWS.MediaConvert();

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password, // In production: would be hashed
      apiKey: uuidv4(),
      createdAt: new Date(),
      subscriptionTier: 'free',
      storageUsed: 0,
      streamQuota: 10
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username,
        email,
        subscriptionTier: newUser.subscriptionTier
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password (simplified - would use bcrypt in production)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email,
        subscriptionTier: user.subscriptionTier
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Streaming endpoints
app.post('/api/stream/create', authenticateJWT, async (req, res) => {
  try {
    const { title, description, platform } = req.body;
    const userId = req.user.id;
    
    // Check stream quota
    const user = await User.findById(userId);
    if (user.streamQuota <= 0) {
      return res.status(403).json({ error: 'Stream quota exceeded' });
    }
    
    // Create stream record
    const streamId = uuidv4();
    const stream = new Stream({
      userId,
      streamId,
      title: title || 'Untitled Stream',
      description: description || '',
      platform: platform || 'custom',
      startTime: new Date(),
      status: 'initializing',
    });
    
    await stream.save();
    
    // Initialize streaming configuration based on platform
    let streamUrl;
    let streamKey;
    
    switch (platform) {
      case 'youtube':
        // In a real app: Integrate with YouTube Live API
        // This would use ytapi to create a live broadcast
        streamUrl = `https://example.com/stream/${streamId}`;
        streamKey = uuidv4();
        break;
        
      case 'twitch':
        // In a real app: Integrate with Twitch API
        streamUrl = `https://example.com/stream/${streamId}`;
        streamKey = uuidv4();
        break;
        
      case 'custom':
      default:
        // Use our own streaming infrastructure
        streamUrl = `https://stream.heartneyes.example/${streamId}`;
        streamKey = uuidv4();
    }
    
    // Update stream with URL
    stream.url = streamUrl;
    await stream.save();
    
    // Decrement user's stream quota
    user.streamQuota -= 1;
    await user.save();
    
    res.status(201).json({
      message: 'Stream created successfully',
      streamId,
      streamUrl,
      streamKey
    });
  } catch (error) {
    console.error('Stream creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/stream/end', authenticateJWT, async (req, res) => {
  try {
    const { streamId } = req.body;
    const userId = req.user.id;
    
    // Find stream
    const stream = await Stream.findOne({ streamId, userId });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Update stream record
    stream.endTime = new Date();
    stream.duration = (stream.endTime - stream.startTime) / 1000; // in seconds
    stream.status = 'completed';
    await stream.save();
    
    // Process and archive stream recording if needed
    // This would be handled by background workers in a real app
    
    res.json({
      message: 'Stream ended successfully',
      streamId,
      duration: stream.duration
    });
  } catch (error) {
    console.error('Stream end error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Recording endpoints
app.post('/api/recording/upload', authenticateJWT, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    
    // Generate pre-signed S3 URL for direct upload
    const recordingId = uuidv4();
    const key = `recordings/${userId}/${recordingId}.mp4`;
    
    const s3Params = {
      Bucket: 'heartneyes-recordings',
      Key: key,
      ContentType: 'video/mp4',
      Expires: 3600 // URL expires in 1 hour
    };
    
    const uploadUrl = s3.getSignedUrl('putObject', s3Params);
    
    // Create recording entry in database
    const recording = new Recording({
      userId,
      recordingId,
      title: title || 'Untitled Recording',
      description: description || '',
      createdAt: new Date(),
      storageLocation: key,
      isPublic: false,
      viewCount: 0
    });
    
    await recording.save();
    
    res.json({
      message: 'Upload URL generated',
      recordingId,
      uploadUrl
    });
  } catch (error) {
    console.error('Recording upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/recording/process', authenticateJWT, async (req, res) => {
  try {
    const { recordingId } = req.body;
    const userId = req.user.id;
    
    // Find recording
    const recording = await Recording.findOne({ recordingId, userId });
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Start transcoding job for the recording
    // This would use MediaConvert in a real app to generate various quality levels
    
    // Update recording status
    recording.status = 'processing';
    await recording.save();
    
    res.json({
      message: 'Recording processing started',
      recordingId
    });
  } catch (error) {
    console.error('Recording processing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// WebSocket handlers for real-time communication
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Authenticate connection
  ws.isAuthenticated = false;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle authentication
      if (data.type === 'auth') {
        // Verify token
        jwt.verify(data.token, process.env.JWT_SECRET, (err, user) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'error', error: 'Authentication failed' }));
            return;
          }
          
          ws.isAuthenticated = true;
          ws.userId = user.id;
          ws.send(JSON.stringify({ type: 'auth_success' }));
        });
        return;
      }
      
      // Require authentication for all other message types
      if (!ws.isAuthenticated) {
        ws.send(JSON.stringify({ type: 'error', error: 'Not authenticated' }));
        return;
      }
      
      // Handle video chunks for streaming
      if (data.type === 'video_chunk') {
        // This would integrate with media server in a real app
        // For now, we acknowledge receipt
        ws.send(JSON.stringify({ 
          type: 'chunk_received', 
          chunkId: data.chunkId 
        }));
      }
      
      // Handle stream commands
      if (data.type === 'stream_command') {
        // Handle commands like pause, resume, etc.
        ws.send(JSON.stringify({ 
          type: 'command_processed', 
          command: data.command 
        }));
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Perform cleanup if needed
  });
});