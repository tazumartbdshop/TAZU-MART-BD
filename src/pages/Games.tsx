import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Trophy, Coins, RotateCcw, 
  Settings, Home, Skull, Map,
  ChevronRight, Target, Swords, Clock,
  Play, X, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

// --- GAME CONSTANTS ---
const WORLD_SIZE = 4000;
const INITIAL_SNAKE_LENGTH = 20;
const SEGMENT_DISTANCE = 6;
const FOOD_COUNT = 400;
const AI_COUNT = 20;

interface GameConfig {
  settings: {
    gameName: string;
    tagline: string;
    turboSpeed: number;
    snakeAcceleration: number;
    spawnRate: number;
    reviveCount: number;
    soundEnabled: boolean;
    hapticEnabled: boolean;
    activeThemeIds: string[];
  };
  themes: {
    id: string;
    name: string;
    head: string;
    tail: string;
    primary: string;
    secondary: string;
    glow: string;
    pattern: string;
  }[];
  reviveAd: {
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    duration: number;
    skipTime: number;
  };
}

type Point = { x: number; y: number };

interface Snake {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  body: Point[];
  angle: number;
  targetAngle: number;
  speed: number;
  isBoosting: boolean;
  score: number;
  kills: number;
  isDead: boolean;
  isAI: boolean;
  pulseOffset: number;
  coins: number;
}

interface Food {
  x: number;
  y: number;
  value: number;
  color: string;
  glowColor: string;
  size: number;
  pulse: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function Games() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER' | 'LOADING' | 'CUSTOMIZE' | 'REVIVE_AD'>('MENU');
  const [player, setPlayer] = useState<Snake | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [coins, setCoins] = useState(1250);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number, id: string}[]>([]);
  const [isDeathTransitioning, setIsDeathTransitioning] = useState(false);
  const [deathStats, setDeathStats] = useState({ length: 0, kills: 0, rank: 0, coins: 0 });
  const [screenShake, setScreenShake] = useState(0);
  const [timeScale, setTimeScale] = useState(1.0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [reviveCount, setReviveCount] = useState(0);
  const [isShielded, setIsShielded] = useState(false);
  const [lastSnakeState, setLastSnakeState] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState(0);
  const [purchasedSkins, setPurchasedSkins] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  useEffect(() => {
    fetch('/api/game-config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setSoundEnabled(data.settings.soundEnabled);
        setVibrationEnabled(data.settings.hapticEnabled);
      });
  }, []);

  const BASE_SPEED = 3.0;
  const BOOST_SPEED = config ? 3.0 * config.settings.turboSpeed : 6.5;

  const SKINS = config?.themes.filter(t => config.settings.activeThemeIds.includes(t.id)) || [
    { name: 'Fire Red', head: '#ff3b3b', tail: '#ff7a00', price: 0 },
    { name: 'Neon Blue', head: '#29b6ff', tail: '#005eff', price: 0 }
  ];
  
  // Control Refs
  const touchRef = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });
  const cameraRef = useRef({ x: 2000, y: 2000, zoom: 1.0 });
  const isBoostActive = useRef(false);
  const requestRef = useRef<number>(null);
  const worldRef = useRef<{ foods: Food[], snakes: Snake[], particles: Particle[] }>({ 
    foods: [], 
    snakes: [], 
    particles: [] 
  });

  // --- INITIALIZATION ---

  const getNeonColor = () => {
    const neons = [
      { name: 'Red', head: '#ff2d2d', body: '#ff7a00', glow: '#ff2d2d' },
      { name: 'Yellow', head: '#ffd500', body: '#ff9900', glow: '#ffd500' },
      { name: 'Green', head: '#32ff5e', body: '#00ff41', glow: '#32ff5e' },
      { name: 'Blue', head: '#29b6ff', body: '#005eff', glow: '#29b6ff' },
      { name: 'Purple', head: '#c23cff', body: '#9333ea', glow: '#c23cff' },
      { name: 'Rainbow', head: '#ff00ff', body: '#00ffff', glow: '#ffffff' },
    ];
    const theme = neons[Math.floor(Math.random() * neons.length)];
    return theme;
  };

  const createSnake = (id: string, name: string, isAI: boolean): Snake => {
    const startX = Math.random() * (WORLD_SIZE - 600) + 300;
    const startY = Math.random() * (WORLD_SIZE - 600) + 300;
    const body: Point[] = [];
    const angle = Math.random() * Math.PI * 2;
    
    let headColor = '';
    let glowColor = '';

    if (!isAI) {
      const skin = SKINS[selectedSkin] || SKINS[0];
      headColor = skin.head;
      glowColor = headColor;
    } else {
      const theme = getNeonColor();
      headColor = theme.head;
      glowColor = theme.glow;
    }
    
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      body.push({ 
        x: startX - Math.cos(angle) * i * SEGMENT_DISTANCE, 
        y: startY - Math.sin(angle) * i * SEGMENT_DISTANCE 
      });
    }
    return {
      id, name, 
      color: headColor,
      glowColor: glowColor,
      body,
      angle,
      targetAngle: angle,
      speed: BASE_SPEED,
      isBoosting: false,
      score: INITIAL_SNAKE_LENGTH,
      kills: 0,
      isDead: false,
      isAI,
      pulseOffset: Math.random() * Math.PI * 2,
      coins: 0
    };
  };

  const spawnFood = (count: number, nearX?: number, nearY?: number, isDeathFood = false) => {
    const newFoods: Food[] = [];
    const neons = [
      { c: '#00f2ff', g: '#00f2ff' }, 
      { c: '#7000ff', g: '#7000ff' }, 
      { c: '#00ff41', g: '#00ff41' }, 
      { c: '#fffb00', g: '#fffb00' },
      { c: '#ff0040', g: '#ff0040' }
    ];
    
    for (let i = 0; i < count; i++) {
      const radius = isDeathFood ? Math.random() * 120 : 0;
      const angle = Math.random() * Math.PI * 2;
      const neon = neons[Math.floor(Math.random() * neons.length)];
      
      newFoods.push({
        x: nearX !== undefined ? (nearX + Math.cos(angle) * radius) : Math.random() * WORLD_SIZE,
        y: nearY !== undefined ? (nearY + Math.sin(angle) * radius) : Math.random() * WORLD_SIZE,
        value: isDeathFood ? 4 : 1,
        color: neon.c,
        glowColor: neon.g,
        size: isDeathFood ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2
      });
    }
    return newFoods;
  };

  const spawnParticles = (count: number, x: number, y: number, color: string) => {
    const p: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const v = 2 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      p.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1.0,
        maxLife: 1.0,
        color,
        size: 2 + Math.random() * 4
      });
    }
    return p;
  };

  const initGame = () => {
    setGameState('LOADING');
    setLoadingProgress(0);
    setReviveCount(0); // Reset revives
    setIsShielded(false);
    setLastSnakeState(null);
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 7.5;
      });
    }, 50);

    setTimeout(() => {
      const newPlayer = createSnake('player', 'You', false);
      const newBots = Array.from({ length: AI_COUNT }, (_, i) => 
        createSnake(`bot-${i}`, [`Venom`, `Cobra`, `Python`, `Naga`, `Mamba`, `Titan`, `Shadow`, `Wraith`, `Neon`][i % 9] + ` ${i + 1}`, true)
      );
      const initialFood = spawnFood(FOOD_COUNT);
      
      setPlayer(newPlayer);
      worldRef.current = { foods: initialFood, snakes: [newPlayer, ...newBots], particles: [] };
      cameraRef.current = { x: newPlayer.body[0].x, y: newPlayer.body[0].y };
      setIsDeathTransitioning(false);
      setTimeScale(1.0);
      setScreenShake(0);
      setGameState('PLAYING');
    }, 1200);
  };

  const triggerDeathSequence = (snake: Snake) => {
    if (snake.id === 'player') {
      setIsDeathTransitioning(true);
      setTimeScale(0.2);
      setScreenShake(20);
      
      const rank = worldRef.current.snakes
        .sort((a, b) => b.score - a.score)
        .findIndex(s => s.id === 'player') + 1;
      
      setDeathStats({
        length: snake.score,
        kills: snake.kills,
        rank: rank,
        coins: Math.floor(snake.score / 10) + (snake.kills * 50)
      });

      // Save for revive
      setLastSnakeState({
        name: snake.name,
        color: snake.color,
        glowColor: snake.glowColor,
        body: [...snake.body], // Clone body
        angle: snake.angle,
        targetAngle: snake.targetAngle,
        speed: snake.speed,
        kills: snake.kills,
        coins: snake.coins
      });

      // Cinematic delay before showing UI
      setTimeout(() => {
        setGameState('GAMEOVER');
      }, 1500);
    }
  };

  const handleRevive = () => {
    if (reviveCount >= (config?.settings.reviveCount || 1) || !lastSnakeState) return;
    setGameState('REVIVE_AD');
  };

  const finalizeRevive = () => {
    // Restore Snake
    const revivedSnake: Snake = {
      id: 'player',
      name: lastSnakeState.name,
      color: lastSnakeState.color,
      glowColor: lastSnakeState.glowColor,
      body: lastSnakeState.body,
      angle: lastSnakeState.angle,
      targetAngle: lastSnakeState.targetAngle,
      speed: lastSnakeState.speed,
      isBoosting: false,
      score: lastSnakeState.body.length,
      kills: lastSnakeState.kills,
      isDead: false,
      isAI: false,
      pulseOffset: Math.random() * Math.PI * 2,
      coins: lastSnakeState.coins
    };

    // Eliminate old dead player snake if exists
    worldRef.current.snakes = worldRef.current.snakes.filter(s => s.id !== 'player');

    // Re-inject into world
    worldRef.current.snakes.unshift(revivedSnake);
    setPlayer(revivedSnake);
    cameraRef.current = { x: revivedSnake.body[0].x, y: revivedSnake.body[0].y };
    
    setReviveCount(prev => prev + 1);
    setIsShielded(true);
    setTimeScale(1.0);
    setIsDeathTransitioning(false);
    setGameState('PLAYING');

    // End shield after 3s
    setTimeout(() => setIsShielded(false), 3000);
  };

  // --- GAME LOOP ---

  const update = useCallback(() => {
    if (gameState === 'MENU') {
      // Background animation for menu
      const currentSnakes = worldRef.current.snakes;
      if (currentSnakes.length === 0) {
        // Init background world for menu
        const initialSnakes = Array.from({ length: 8 }, (_, i) => createSnake(`bg-bot-${i}`, '', true));
        worldRef.current.snakes = initialSnakes;
        worldRef.current.foods = spawnFood(100);
      }
      
      currentSnakes.forEach(snake => {
        if (Math.random() < 0.01) snake.targetAngle += (Math.random() - 0.5) * 1.0;
        let diff = snake.targetAngle - snake.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        snake.angle += diff * 0.05;
        
        const head = snake.body[0];
        snake.body.unshift({
          x: head.x + Math.cos(snake.angle) * BASE_SPEED,
          y: head.y + Math.sin(snake.angle) * BASE_SPEED
        });
        snake.body.pop();

        // Wrap around for background snakes
        if (head.x < -100) head.x = WORLD_SIZE + 100;
        if (head.x > WORLD_SIZE + 100) head.x = -100;
        if (head.y < -100) head.y = WORLD_SIZE + 100;
        if (head.y > WORLD_SIZE + 100) head.y = -100;
      });

      draw();
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    if (gameState !== 'PLAYING') return;

    const currentSnakes = worldRef.current.snakes;
    const currentFoods = worldRef.current.foods;
    const currentParticles = worldRef.current.particles;
    const playerSnake = currentSnakes.find(s => s.id === 'player');

    if (!playerSnake) return;

    // 1. Particle Logic
    if (screenShake > 0) setScreenShake(prev => Math.max(0, prev - 1));

    for (let i = currentParticles.length - 1; i >= 0; i--) {
      const p = currentParticles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 0.02 * timeScale;
      if (p.life <= 0) currentParticles.splice(i, 1);
    }

    // 2. Snake Movement & Logic
    currentSnakes.forEach((snake) => {
      if (snake.isDead) return;
      // Input / AI Decision
      if (snake.id === 'player') {
        if (touchRef.current.active) {
          const dx = touchRef.current.currentX - touchRef.current.startX;
          const dy = touchRef.current.currentY - touchRef.current.startY;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            snake.targetAngle = Math.atan2(dy, dx);
          }
        }
        snake.isBoosting = isBoostActive.current && snake.body.length > 8;
      } else {
        // Advanced AI
        if (Math.random() < 0.02) {
           snake.targetAngle += (Math.random() - 0.5) * 1.5;
        }
        
        // Wall avoidance
        const head = snake.body[0];
        const margin = 400;
        if (head.x < margin) snake.targetAngle = 0;
        if (head.x > WORLD_SIZE - margin) snake.targetAngle = Math.PI;
        if (head.y < margin) snake.targetAngle = Math.PI / 2;
        if (head.y > WORLD_SIZE - margin) snake.targetAngle = -Math.PI / 2;

        snake.isBoosting = Math.random() < 0.005;
      }

      // Smooth rotate head
      let angleDiff = snake.targetAngle - snake.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      snake.angle += angleDiff * 0.15;

      snake.speed = snake.isBoosting ? BOOST_SPEED : BASE_SPEED;

      // Update Head Position
      const oldHead = snake.body[0];
      const newHead = {
        x: oldHead.x + Math.cos(snake.angle) * snake.speed * timeScale,
        y: oldHead.y + Math.sin(snake.angle) * snake.speed * timeScale
      };

      // Unshift head
      snake.body.unshift(newHead);
      
      // Length management
      if (snake.isBoosting) {
        if (Math.random() < 0.2) {
          snake.body.pop(); 
          if (Math.random() < 0.5) {
            currentParticles.push(...spawnParticles(1, snake.body[snake.body.length-1].x, snake.body[snake.body.length-1].y, snake.color));
          }
        }
        snake.body.pop(); 
      } else {
        snake.body.pop();
      }

      snake.score = snake.body.length;
    });

    // 3. Food Collision
    currentSnakes.forEach(snake => {
      const head = snake.body[0];
      for (let i = currentFoods.length - 1; i >= 0; i--) {
        const f = currentFoods[i];
        const distSq = (head.x - f.x)**2 + (head.y - f.y)**2;
        if (distSq < 1200) { 
          for (let g = 0; g < f.value; g++) {
            snake.body.push({ ...snake.body[snake.body.length - 1] });
          }
          currentParticles.push(...spawnParticles(3, f.x, f.y, f.color));
          currentFoods.splice(i, 1);
        }
      }
    });

    // Respawn ambient food
    if (currentFoods.length < FOOD_COUNT) {
      currentFoods.push(...spawnFood(5));
    }

    // 4. Collision Detection (Head to Body)
    const deadSnakes: string[] = [];
    currentSnakes.forEach(s1 => {
      const h1 = s1.body[0];
      
      if (h1.x < 0 || h1.x > WORLD_SIZE || h1.y < 0 || h1.y > WORLD_SIZE) {
        deadSnakes.push(s1.id);
        return;
      }

      // If player is shielded, ignore collisions
      if (s1.id === 'player' && isShielded) return;

      currentSnakes.forEach(s2 => {
        // IGNORE SELF-COLLISION (Professional Slither.io Mode)
        if (s1.id === s2.id) return;
        
        // If s2 is player and shielded, s1 can still die if it hits s2's body
        // But if s1 is player and shielded, it won't reach here
        
        for (let i = 0; i < s2.body.length; i++) {
          const seg = s2.body[i];
          const distSq = (h1.x - seg.x)**2 + (h1.y - seg.y)**2;
          if (distSq < 225) { 
            deadSnakes.push(s1.id);
            s2.kills += 1;
            return;
          }
        }
      });
    });

    // Handle deaths
    deadSnakes.forEach(id => {
      const idx = currentSnakes.findIndex(s => s.id === id);
      if (idx !== -1) {
        const snake = currentSnakes[idx];
        if (snake.isDead) return;
        snake.isDead = true;

        const step = Math.ceil(snake.body.length / 15);
        for (let i = 0; i < snake.body.length; i += step) {
          const seg = snake.body[i];
          currentFoods.push(...spawnFood(1, seg.x, seg.y, true));
          currentParticles.push(...spawnParticles(5, seg.x, seg.y, snake.color));
        }
        
        if (id === 'player') {
          triggerDeathSequence(snake);
        } else {
          currentSnakes.splice(idx, 1);
        }
      }
    });

    // Respawn Bots
    if (currentSnakes.filter(s => s.isAI).length < AI_COUNT) {
      currentSnakes.push(createSnake(`bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, `King ${Math.floor(Math.random() * 100)}`, true));
    }

    // Sync state for UI
    if (playerSnake) {
       setPlayer({ ...playerSnake });
       // Dynamically update camera zoom based on speed
       const targetZoom = playerSnake.isBoosting ? 0.85 : 1.0;
       cameraRef.current.zoom += (targetZoom - cameraRef.current.zoom) * 0.05;
    }
    
    setLeaderboard(
      currentSnakes
        .map(s => ({ name: s.name, score: s.score, id: s.id }))
        .sort((a,b) => b.score - a.score)
        .slice(0, 10)
    );

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameState]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Smooth Camera Follow
    const playerSnake = worldRef.current.snakes.find(s => s.id === 'player');
    if (playerSnake && gameState === 'PLAYING') {
      const targetX = playerSnake.body[0].x;
      const targetY = playerSnake.body[0].y;
      cameraRef.current.x += (targetX - cameraRef.current.x) * 0.1;
      cameraRef.current.y += (targetY - cameraRef.current.y) * 0.1;
    } else if (gameState === 'MENU' && worldRef.current.snakes.length > 0) {
      // Slow pan in menu
      cameraRef.current.x = WORLD_SIZE / 2 + Math.sin(Date.now() / 5000) * 200;
      cameraRef.current.y = WORLD_SIZE / 2 + Math.cos(Date.now() / 5000) * 200;
    }

    const camX = cameraRef.current.x;
    const camY = cameraRef.current.y;
    const zoom = cameraRef.current.zoom;

    ctx.save();
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Apply Zoom
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    // --- RENDER BACKGROUND ---
    ctx.fillStyle = '#0c0c12'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Stars/Particles in background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 50; i++) {
       const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
       const y = (Math.cos(i * 543.21) * 0.5 + 0.5) * canvas.height;
       ctx.beginPath();
       ctx.arc(x, y, 0.5, 0, Math.PI * 2);
       ctx.fill();
    }

    const offsetX = -camX + centerX;
    const offsetY = -camY + centerY;

    // Soft Grid Overlay (Modern Dot Grid)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const dotGap = 60;
    const startX = Math.floor((camX - centerX / zoom) / dotGap) * dotGap;
    const endX = startX + canvas.width / zoom + dotGap * 2;
    const startY = Math.floor((camY - centerY / zoom) / dotGap) * dotGap;
    const endY = startY + canvas.height / zoom + dotGap * 2;

    for (let x = startX; x < endX; x += dotGap) {
      for (let y = startY; y < endY; y += dotGap) {
        ctx.beginPath();
        const dx = x - camX + centerX;
        const dy = y - camY + centerY;
        ctx.arc(dx, dy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // World Boundary - Minimal Neon Glow
    ctx.strokeStyle = 'rgba(255, 0, 64, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, WORLD_SIZE, WORLD_SIZE);

    // Optimized Render: Filter objects by viewport
    const viewPadding = 100;
    const viewLeft = camX - centerX - viewPadding;
    const viewRight = camX + centerX + viewPadding;
    const viewTop = camY - centerY - viewPadding;
    const viewBottom = camY + centerY + viewPadding;

    // Draw Particles
    worldRef.current.particles.forEach(p => {
       if (p.x < viewLeft || p.x > viewRight || p.y < viewTop || p.y > viewBottom) return;
       const sx = p.x - camX + centerX;
       const sy = p.y - camY + centerY;
       ctx.globalAlpha = p.life;
       ctx.fillStyle = p.color;
       ctx.beginPath();
       ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
       ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Food
    worldRef.current.foods.forEach(f => {
      if (f.x < viewLeft || f.x > viewRight || f.y < viewTop || f.y > viewBottom) return;
      const sx = f.x - camX + centerX;
      const sy = f.y - camY + centerY;
      
      f.pulse += 0.05 * timeScale;
      const sizePulse = f.size * (1 + Math.sin(f.pulse) * 0.2);
        
      // Only glow big foods for performance
      if (f.value > 2) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = f.glowColor;
      }
      
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(sx, sy, sizePulse, 0, Math.PI * 2);
      ctx.fill();
      
      if (f.value > 2) ctx.shadowBlur = 0;
    });

    // Draw Snakes
    worldRef.current.snakes.forEach(snake => {
      const isPlayer = snake.id === 'player';
      snake.pulseOffset += 0.1 * timeScale;
 
      // Render segments from tail to head
      const totalSegs = snake.body.length;
      for (let i = totalSegs - 1; i >= 0; i--) {
        const seg = snake.body[i];
        if (seg.x < viewLeft - 20 || seg.x > viewRight + 20 || seg.y < viewTop - 20 || seg.y > viewBottom + 20) continue;
        
        const sx = seg.x - camX + centerX;
        const sy = seg.y - camY + centerY;
        
        // Head is slightly larger than body
        let size = i === 0 ? 18 : 14; 
        
        // Body tapering towards tail
        if (i > totalSegs - 12) {
          size *= (1 - (i - (totalSegs - 12)) / 15);
        }
        
        // Add breathing animation to segments
        const breathe = Math.sin(snake.pulseOffset + i * 0.3) * (isPlayer ? 1.5 : 1.0);
        size += (isPlayer && isShielded) ? Math.abs(Math.sin(Date.now()/100))*5 : breathe;
        
        if (snake.isBoosting) size *= 1.1;

        const themeItem = config?.themes.find(t => t.head === snake.color || t.primary === snake.color);
        const theme = themeItem ? { head: themeItem.head, tail: themeItem.tail, pattern: themeItem.pattern } : { head: snake.color, tail: snake.color, pattern: 'Solid' };
        
        // 1. Glossy Rendering
        ctx.shadowBlur = i === 0 ? 15 : 4;
        ctx.shadowColor = theme.head;
        
        // Segmented shading: slightly offset dark circle for depth
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(sx, sy + 3, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Main Body Part with local segment gradient for better lighting
        const bodyGrad = ctx.createLinearGradient(sx - size, sy - size, sx + size, sy + size);
        bodyGrad.addColorStop(0, theme.head);
        bodyGrad.addColorStop(1, theme.tail);
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        // Pattern overlays
        if (theme.pattern === 'Stripes') {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx - size, sy); ctx.lineTo(sx + size, sy); ctx.stroke();
        } else if (theme.pattern === 'Electric') {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let k=0; k<5; k++) {
            ctx.lineTo(sx + (Math.random()-0.5)*size*2, sy + (Math.random()-0.5)*size*2);
          }
          ctx.stroke();
        } else if (theme.pattern === 'Dots') {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath(); ctx.arc(sx, sy, size/3, 0, Math.PI*2); ctx.fill();
        }

        // segmented highlight - subtle border between segments
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glossy top highlight
        const gloss = ctx.createRadialGradient(sx - size/3, sy - size/3, 1, sx, sy, size);
        gloss.addColorStop(0, 'rgba(255,255,255,0.3)');
        gloss.addColorStop(1, 'transparent');
        ctx.fillStyle = gloss;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        if (i === 0) { // Head
          // Eyes follow direction and blink
          const blink = Math.sin(Date.now() / 200) > 0.98;
          ctx.fillStyle = blink ? 'transparent' : '#fff';
          
          const eOffset = 10;
          const eSize = 4.5; // size: 8px requested. radius 4.

          const eX1 = sx + Math.cos(snake.angle + 0.6) * eOffset;
          const eY1 = sy + Math.sin(snake.angle + 0.6) * eOffset;
          const eX2 = sx + Math.cos(snake.angle - 0.6) * eOffset;
          const eY2 = sy + Math.sin(snake.angle - 0.6) * eOffset;
          
          ctx.beginPath(); ctx.arc(eX1, eY1, eSize, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(eX2, eY2, eSize, 0, Math.PI*2); ctx.fill();
          
          if (!blink) {
            ctx.fillStyle = '#000';
            const pupilOff = 1.5;
            ctx.beginPath(); ctx.arc(eX1 + Math.cos(snake.angle)*pupilOff, eY1 + Math.sin(snake.angle)*pupilOff, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(eX2 + Math.cos(snake.angle)*pupilOff, eY2 + Math.sin(snake.angle)*pupilOff, 2, 0, Math.PI*2); ctx.fill();
          }

          if (isPlayer || (snake.name && !snake.id.includes('bg'))) {
            ctx.fillStyle = isPlayer ? '#fff' : 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(snake.name, sx, sy - 35);
          }
        }
      }
    });

    ctx.restore();
    
    // 5. Draw Dynamic Invisible Joystick (Screen Space)
    if (touchRef.current.active && gameState === 'PLAYING') {
      const { startX, startY, currentX, currentY } = touchRef.current;
      
      // Outer ring
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(startX, startY, 40, 0, Math.PI * 2);
      ctx.stroke();
      
      // Center dot
      ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 242, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Current position indicator
      const dx = currentX - startX;
      const dy = currentY - startY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const limit = 40;
      const ratio = dist > limit ? limit / dist : 1;
      
      ctx.fillStyle = 'rgba(0, 242, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(startX + dx * ratio, startY + dy * ratio, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // --- HANDLERS ---

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setViewport({ width: clientWidth, height: clientHeight });
        if (canvasRef.current) {
          canvasRef.current.width = clientWidth;
          canvasRef.current.height = clientHeight;
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, update]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== 'PLAYING') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Check if clicking turbo zone (bottom right) - actually instruction says bottom-left now
    // Let's use a ref specifically for the turbo button bypass
    const turboBtn = document.getElementById('turbo-button');
    if (turboBtn && turboBtn.contains(e.target as Node)) return;

    touchRef.current = {
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      active: true
    };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchRef.current.active) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    touchRef.current.currentX = clientX;
    touchRef.current.currentY = clientY;
  };

  const handleTouchEnd = () => {
    touchRef.current.active = false;
  };

  const buySkin = (index: number) => {
    setSelectedSkin(index);
  };

  return (
    <div className="bg-[#050505] h-[100dvh] text-white font-sans overflow-hidden flex flex-col select-none touch-none">
      {/* 1. Optimized Header */}
      <header className="pt-4 pb-2 flex items-center justify-between absolute top-0 w-full z-[100] px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
            <Home className="w-5 h-5 text-white/40 group-hover:text-white" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-0.5">{config?.settings.gameName || 'TAZU ARENA'}</h1>
            <p className="text-[20px] font-black uppercase tracking-tight italic">{config?.settings.tagline || 'SNAKE ULTRA'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. HUD Stats - Premium Card (Removed old position) */}

      {/* 3. Global Leaderboard - Neon Styled */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-28 right-8 z-40 pointer-events-none hidden lg:block">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-6 rounded-[32px] w-64 shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Leaderboard</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[8px] font-bold text-white/30 uppercase">LIVE</span>
              </div>
            </div>
            <div className="space-y-3.5">
              {leaderboard.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={cn(
                      "text-[10px] font-black",
                      i < 3 ? "text-cyan-400" : "text-white/20"
                    )}>{i+1}.</span>
                    <span className={cn(
                      "text-[11px] font-bold truncate uppercase tracking-tight transition-colors",
                      s.id === 'player' ? "text-cyan-400" : "text-white/60"
                    )}>{s.name}</span>
                  </div>
                  <span className="text-[11px] font-black font-mono text-white/80">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Game Canvas Arena */}
      <main 
        ref={containerRef} 
        className="flex-1 relative" 
        style={{ background: 'linear-gradient(180deg, #050505 0%, #090909 35%, #0c0c12 100%)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* 4.1 Compact Modern HUD - Refined Top Bar */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-20 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Length</span>
                  <span className="text-[14px] font-black font-mono leading-none">{player?.score || 0}</span>
               </div>
               <div className="w-[1px] h-6 bg-white/5" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-red-500/50 uppercase tracking-widest">Kills</span>
                  <span className="text-[14px] font-black font-mono text-red-500 leading-none">{player?.kills || 0}</span>
               </div>
            </div>
            
            {/* Minimal Mobile Leaderboard Indicator */}
            <div className="lg:hidden flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
               <Trophy className="w-3 h-3 text-cyan-400" />
               <span className="text-[12px] font-black font-mono">#{deathStats.rank || 1}</span>
            </div>
          </div>
        )}

        {/* 4.2 Turbo Button - Bottom Left Glassmorphism */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-10 left-10 z-50">
            <button 
              id="turbo-button"
              onMouseDown={() => isBoostActive.current = true}
              onMouseUp={() => isBoostActive.current = false}
              onTouchStart={() => isBoostActive.current = true}
              onTouchEnd={() => isBoostActive.current = false}
              className={cn(
                "w-[56px] h-[56px] rounded-2xl flex items-center justify-center transition-all duration-200",
                "bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                "group active:scale-90",
                isBoostActive.current ? "border-cyan-400/50 bg-cyan-400/10" : "hover:bg-white/5"
              )}
            >
              <Zap className={cn(
                "w-6 h-6 transition-colors",
                isBoostActive.current ? "text-cyan-400 fill-cyan-400" : "text-white/40"
              )} />
              
              {/* Neon Ring Glow */}
              <div className={cn(
                "absolute inset-0 rounded-2xl border-2 border-cyan-400/20 transition-opacity",
                isBoostActive.current ? "opacity-100 animate-pulse" : "opacity-0"
              )} />
            </button>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/20 uppercase tracking-widest">Nitro</span>
          </div>
        )}
        <AnimatePresence>
          {gameState === 'REVIVE_AD' && (
            <ReviveAdOverlay 
              config={config!} 
              onComplete={finalizeRevive} 
              onClose={() => setGameState('GAMEOVER')} 
            />
          )}

          {gameState === 'MENU' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-0 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #050505 0%, #090909 35%, #0c0c12 100%)'
              }}
            >
              {/* Soft Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="w-full max-w-sm px-6 flex flex-col items-center relative z-10 pt-20">
                {/* Branding System */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-10"
                >
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-[6px] mb-4">NATIVE NEON SURVIVAL PROTOCOL</p>
                  
                  <div className="relative inline-block">
                    <h2 className="text-[64px] font-black italic tracking-tighter uppercase leading-none text-white text-center">
                      {config?.settings.gameName.split(' ')[0]}<br />{config?.settings.gameName.split(' ')[1] || 'ULTRA'}
                    </h2>
                  </div>
                </motion.div>
                
                {/* Main Action Buttons - Slimmer & Cleaner */}
                <div className="space-y-3 w-full mb-10">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={initGame}
                    className="w-full h-[54px] bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-black uppercase text-[15px] tracking-[4px] flex items-center justify-center gap-3 shadow-lg shadow-red-500/10"
                  >
                    START GAME
                  </motion.button>
                  
                  <button className="w-full h-[54px] bg-white/5 border border-white/5 text-white/70 rounded-xl font-bold uppercase text-[13px] tracking-[2px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    CONTINUE SESSION
                  </button>

                  <button 
                    onClick={() => setGameState('CUSTOMIZE')}
                    className="w-full h-[54px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold uppercase text-[13px] tracking-[2px] flex items-center justify-center gap-3 shadow-lg shadow-purple-500/10"
                  >
                    SNAKE CUSTOMIZATION
                  </button>

                  <button className="w-full h-[54px] bg-white/5 border border-white/5 text-white/70 rounded-xl font-bold uppercase text-[13px] tracking-[2px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    LEADERBOARD
                  </button>
                </div>

                {/* Bottom Panels - Compact */}
                <div className="grid grid-cols-2 gap-3 w-full">
                   <div className="bg-white/[0.03] h-16 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Global High</p>
                      <p className="text-[18px] font-black font-mono">14,250</p>
                   </div>
                   <div className="bg-white/[0.03] h-16 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Your Points</p>
                      <p className="text-[18px] font-black font-mono">{coins}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'CUSTOMIZE' && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="absolute inset-0 z-[110] bg-[#050505] flex flex-col p-6 pt-24"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                 <button 
                  onClick={() => setGameState('MENU')}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                 >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                 </button>
                 <h2 className="text-xl font-black uppercase tracking-widest">CUSTOMIZE SNAKE</h2>
                 <div className="w-10" />
              </div>

              {/* Preview Area */}
              <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
                 <div className="absolute inset-0 bg-radial from-cyan-500/5 to-transparent blur-3xl" />
                 
                 {/* Dummy Snake Animation */}
                 <div className="relative w-full h-40 flex items-center justify-center gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [0, -20, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                        className="w-10 h-10 rounded-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${SKINS[selectedSkin]?.head || '#fff'}, ${SKINS[selectedSkin]?.tail || '#555'})`,
                          boxShadow: `0 0 20px ${SKINS[selectedSkin]?.head || '#fff'}40`,
                          opacity: 1 - (i * 0.1)
                        }}
                      >
                         {i === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center gap-1.5 translate-y-[-2px]">
                               <div className="w-1.5 h-1.5 bg-white rounded-full" />
                               <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                         )}
                      </motion.div>
                    ))}
                 </div>
                 
                 <div className="mt-12 text-center">
                    <p className="text-[12px] font-black text-white/40 uppercase tracking-[4px]">Preview Status</p>
                    <p className="text-2xl font-black italic text-white uppercase tracking-tight">{SKINS[selectedSkin]?.name || 'SELECTOR'}</p>
                 </div>
              </div>

              {/* Skin Grid */}
              <div className="h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-3">
                    {SKINS.map((skin, i) => {
                      const isPurchased = purchasedSkins.includes(i);
                      const isSelected = selectedSkin === i;
                      
                      return (
                        <button
                          key={i}
                          onClick={() => buySkin(i)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 relative overflow-hidden",
                            isSelected 
                                ? "bg-white/10 border-white/20 shadow-[0_10px_20px_rgba(255,255,255,0.05)]" 
                                : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                          )}
                        >
                           <div 
                              className="w-10 h-10 rounded-xl"
                              style={{ 
                                background: `linear-gradient(135deg, ${skin.head}, ${skin.tail})`,
                                boxShadow: isSelected ? `0 0 15px ${skin.head}60` : 'none'
                              }}
                           />
                           <div className="text-center">
                              <p className="text-[10px] font-bold text-white uppercase tracking-tight truncate w-24">
                                {skin.name}
                              </p>
                              {!isPurchased && (
                                <div className="flex items-center justify-center gap-1 mt-1 text-cyan-400">
                                   <Coins className="w-3 h-3" />
                                   <span className="text-[10px] font-black">{skin.price}</span>
                                </div>
                              )}
                              {isPurchased && (
                                <p className="text-[9px] font-bold text-white/30 uppercase mt-1">
                                  {isSelected ? 'SELECTED' : 'OWNED'}
                                </p>
                              )}
                           </div>

                           {/* Selection Ring */}
                           {isSelected && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                           )}
                        </button>
                      );
                    })}
                 </div>
              </div>
            </motion.div>
          )}

          {gameState === 'LOADING' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-[#020408]"
            >
              <div className="text-center space-y-8 w-full max-w-xs">
                <div className="relative w-32 h-32 mx-auto">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-4 border-r-4 border-cyan-400 rounded-full shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                   />
                   <div className="absolute inset-4 bg-white/5 rounded-full flex items-center justify-center">
                     <Skull className="w-10 h-10 text-cyan-400/40" />
                   </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.6em] text-cyan-400">Loading Arena</h3>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,242,255,1)]"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                    Optimizing neural links...<br />
                    Stabilizing world segments...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-0"
              style={{
                background: 'linear-gradient(180deg, #050505 0%, #090909 35%, #0c0c12 100%)'
              }}
            >
              {/* Immersive Layout - No Popup Container */}
              <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
                
                {/* Header Section */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-[42px] font-black text-white uppercase tracking-[2px] leading-tight mb-2">
                    SESSION OVER
                  </h2>
                  <p className="text-[11px] text-white/40 font-black uppercase tracking-[4px]">
                    MATCH ENDED • STATS SAVED
                  </p>
                </motion.div>

                {/* STATS GRID - 4 COMPACT CARDS */}
                <div className="grid grid-cols-2 gap-[14px] w-full mb-12">
                  {[
                    { id: 1, label: 'TOTAL SCORE', value: deathStats.length, color: 'text-white' },
                    { id: 2, label: 'MAX SCORE', value: '14,250', color: 'text-cyan-400' },
                    { id: 3, label: 'TOTAL KILLS', value: deathStats.kills, color: 'text-[#ff3b3b]' },
                    { id: 4, label: 'ARENA RANK', value: `#${deathStats.rank}`, color: 'text-[#9333ea]' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (i * 0.05) }}
                      className="bg-[#0f0f12] border border-white/5 rounded-[16px] p-4 flex flex-col gap-1"
                    >
                       <span className="text-[10px] font-bold text-white/20 uppercase tracking-[2px] leading-none">{stat.label}</span>
                       <span className={cn("text-[24px] font-black leading-none tabular-nums", stat.color)}>{stat.value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-[14px] w-full">
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={initGame}
                    className="w-full h-[58px] bg-gradient-to-r from-[#ff3b3b] to-[#ff7a00] text-white rounded-[18px] font-extrabold uppercase text-[18px] tracking-[4px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-[0_10px_40px_rgba(255,59,59,0.2)]"
                  >
                    <RotateCcw className="w-5 h-5" /> PLAY AGAIN
                  </motion.button>
                  
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    onClick={handleRevive}
                    disabled={reviveCount >= 1}
                    className={cn(
                      "w-full h-[58px] rounded-[18px] font-bold uppercase text-[15px] tracking-[2px] flex items-center justify-center gap-4 transition-all",
                      reviveCount >= 1 
                        ? "bg-white/5 border border-white/5 text-white/10 cursor-not-allowed" 
                        : "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg shadow-purple-900/20 active:scale-[1.02] active:scale-[0.97]"
                    )}
                  >
                    <Play className="w-5 h-5 fill-current" /> 
                    {reviveCount >= 1 ? 'REVIVE USED' : 'REVIVE WITH AD'}
                  </motion.button>

                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => navigate('/')}
                    className="w-full h-[58px] bg-[#111111] border border-white/[0.08] text-white/75 rounded-[18px] font-bold uppercase text-[15px] tracking-[2px] flex items-center justify-center gap-3 hover:bg-[#151515] transition-all active:scale-[0.97]"
                  >
                    <Home className="w-4 h-4" /> BACK HOME
                  </motion.button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ReviveAdOverlay({ config, onComplete, onClose }: { config: GameConfig, onComplete: () => void, onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(config.reviveAd.duration);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= (config.reviveAd.duration - config.reviveAd.skipTime)) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center"
    >
      <div className="absolute top-10 right-10 flex items-center gap-4 z-50">
        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 font-black text-xl tabular-nums">
          {timeLeft}s
        </div>
        {canSkip && (
          <button 
            onClick={onComplete}
            className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
          >
            SKIP AD <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="w-full h-full relative">
         <video 
           ref={videoRef}
           src={config.reviveAd.videoUrl} 
           autoPlay 
           className="w-full h-full object-cover" 
           onEnded={onComplete}
         />
         
         <div className="absolute bottom-10 left-10 right-10">
            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/40 mb-2">SPONSORED PROTOCOL</h3>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">{config.reviveAd.title}</h2>
         </div>
      </div>
    </motion.div>
  );
}
