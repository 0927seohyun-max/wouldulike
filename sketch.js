let gameState = "start";
let finalPuzzle;
let level = 1;
let targetScore = 500;
let buttonX, buttonY, buttonW, buttonH;
let stars = [];
let nebulaParticles = []; 
let objects = []; 
let particles = []; 
let score = 0;
let lives = 3;
let slicePath = [];
let retryButton = {};

// --- 이미지 및 비디오 변수 ---
let imgEarth, imgJupiter, imgRed, imgBlue, imgP1, imgP2, imgP3, imgP4;
let imgAlien; 
let trashImgs = [];
let planetImgs = [];
let puzzleImgs = [];
let prologueVideo; // 오프닝 비디오 변수

// --- 사운드 변수 ---
let soundSlice; 
let soundWarning;   
let soundSuccess;  // 최종 엔딩 크레딧용 사운드
let soundLevelUp;  // 일반 레벨업(Level 1, 2, 3) 전용 효과음 변수
let soundTyping;    
let soundAlien;    

// 배경음악(BGM) 변수
let bgmTitle;  // 메인 및 스토리 화면용 BGM
let bgmPlay;   // 인게임 플레이용 BGM

// 타이핑 사운드 제어를 위한 변수
let lastTypedCount = 0; 

// --- 화면에 튈 초록 외계 물질 자국들을 저장할 배열 ---
let screenSplats = []; 

// --- 글꼴 변수 ---
let pixelFont; 

function preload() {
  pixelFont = loadFont('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff');

  imgEarth = loadImage('earth.png');
  imgJupiter = loadImage('jupiter.png');
  imgRed = loadImage('red.png');
  imgBlue = loadImage('blue.png');
  
  imgP1 = loadImage('puzzle1.png');
  imgP2 = loadImage('puzzle2.png');
  imgP3 = loadImage('puzzle3.png');
  imgP4 = loadImage('puzzle4.png');
  
  puzzleImgs = [imgP1, imgP2, imgP3, imgP4]; 
  planetImgs = [imgEarth, imgJupiter, imgRed, imgBlue];

  trashImgs = [
    loadImage('trash1.png'),
    loadImage('trash2.png'),
    loadImage('trash3.png')
  ];
  
  finalPuzzle = loadImage('finalPuzzle.png');
  imgAlien = loadImage('alien.png'); 

  soundSlice = loadSound('laser-shot.wav'); 
  soundWarning = loadSound('error.mp3');   
  soundSuccess = loadSound('success.mp3'); 
  soundLevelUp = loadSound('levelup.mp3'); 
  
  soundTyping = loadSound('typing.mp3');   
  soundAlien = loadSound('alien.mp3'); 

  bgmTitle = loadSound('bgmTitle.mp3'); 
  bgmPlay = loadSound('bgmPlay.mp3');

  // 비디오 파일 로드
  prologueVideo = createVideo('prologue.mp4'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateButtonPosition();
  textFont(pixelFont);

  // HTML 기본 비디오 태그가 캔버스 밖에 따로 튀어나와서 중복 렌더링되는 현상 방지
  if (prologueVideo) {
    prologueVideo.hide(); 
  }

  for (let i = 0; i < 220; i++) {
    stars.push({ 
      x: random(width), 
      y: random(height), 
      size: random() < 0.08 ? random(4, 6.5) : random(0.6, 2.8), 
      speed: random(0.08, 0.5),
      brightness: random(80, 255),
      seed: random(1000) 
    });
  }

  let nebulaColors = [
    { r: 0, g: 242, b: 254, a: 8 },   
    { r: 127, g: 0, b: 255, a: 6 },   
    { r: 255, g: 0, b: 128, a: 5 }    
  ];
  
  for (let i = 0; i < 15; i++) {
    nebulaParticles.push({
      x: random(width),
      y: random(height),
      size: random(width * 0.3, width * 0.55), 
      color: random(nebulaColors),
      vx: random(-0.2, 0.2),
      vy: random(-0.1, 0.2)
    });
  }

  background(5, 4, 12);
  drawSpaceBackground();

  if (bgmTitle && bgmTitle.isLoaded() && !bgmTitle.isPlaying()) {
    bgmTitle.loop();
    bgmTitle.setVolume(0.5); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateButtonPosition();
}

function updateButtonPosition() {
  buttonW = 240; buttonH = 65;
  buttonX = width / 2 - buttonW / 2;
  buttonY = height / 2 + 60;
}

function draw() {
  background(5, 4, 12); 
  drawSpaceBackground();

  if (gameState === "start") drawStartScreen();
  else if (gameState === "story") drawStoryScreen();
  else if (gameState === "prologueVideo") drawPrologueVideoScreen(); 
  else if (gameState === "play") drawGame();
  else if (gameState === "levelUp") drawLevelUp();
  else if (gameState === "gameOver") drawGameOver();
  else if (gameState === "endingPuzzle") drawEndingPuzzle();
  else if (gameState === "endingComment") drawEndingComment();
}

function drawSpaceBackground() {
  push();
  noStroke();
  for (let np of nebulaParticles) {
    np.x += np.vx;
    np.y += np.vy;
    
    if (np.x < -np.size) np.x = width + np.size;
    if (np.x > width + np.size) np.x = -np.size;
    if (np.y < -np.size) np.y = height + np.size;
    if (np.y > height + np.size) np.y = -np.size;

    let gradient = drawingContext.createRadialGradient(np.x, np.y, 0, np.x, np.y, np.size * 0.5);
    gradient.addColorStop(0, `rgba(${np.color.r}, ${np.color.g}, ${np.color.b}, ${np.color.a / 100})`);
    gradient.addColorStop(0.5, `rgba(${np.color.r}, ${np.color.g}, ${np.color.b}, ${np.color.a / 250})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    drawingContext.fillStyle = gradient;
    rect(np.x - np.size, np.y - np.size, np.size * 2, np.size * 2);
  }
  pop();

  noStroke();
  for (let star of stars) {
    let twinkle = map(sin(frameCount * 0.04 + star.seed), -1, 1, 0.4, 1.2);
    
    if (star.size > 4) {
      push();
      drawingContext.shadowBlur = 12;
      drawingContext.shadowColor = color(255, 255, 255, star.brightness * 0.6);
      fill(240, 248, 255, star.brightness * twinkle);
      circle(star.x, star.y, star.size * twinkle);
      pop();
    } else {
      fill(255, 255, 255, star.brightness * twinkle); 
      circle(star.x, star.y, star.size);
    }
    
    star.y += star.speed;
    if (star.y > height) { 
      star.y = 0; 
      star.x = random(width); 
    }
  }
}

// 🛠️ [수정 반영] p5.Image/p5.Element 규격 에러를 해결한 비디오 스크린 드로잉 함수
function drawPrologueVideoScreen() {
  background(0); 

  // 에러의 원인이었던 .elt 조작을 빼고 p5.js 미디어 객체 자체를 첫 번째 인자로 안전하게 넘깁니다.
  if (prologueVideo) {
    try {
      if (prologueVideo.elt && prologueVideo.elt.paused) {
        prologueVideo.play();
      }
      image(prologueVideo, 0, 0, width, height);
    } catch (e) {
      console.log("Waiting for video engine...");
    }
  } else {
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(255);
    text("비디오 파이프라인을 구축 중이거나 파일이 누락되었습니다.", width / 2, height / 2);
  }

  // 안내 메시지 레이어 출력
  textAlign(CENTER, CENTER);
  textSize(16);
  let blink = map(sin(frameCount * 0.1), -1, 1, 120, 255);
  drawNeonText("SKIP 영상 건너뛰기 [ Press ENTER ]", width / 2, height - 60, color(0, 242, 254, blink), color(255, blink), 15);
}

function drawNeonText(txt, x, y, glowColor, textColor, blurAmount = 25) {
  push();
  drawingContext.shadowBlur = blurAmount;
  drawingContext.shadowColor = color(glowColor);
  fill(textColor);
  text(txt, x, y);
  pop();
}

/* -------------------- 메인 게임 로직 -------------------- */
function drawGame() {
  if (frameCount % 45 === 0) {
    let rand = random();
    let type = "trash";
    let img = random(trashImgs);
    let size = random(90, 130);

    if (rand < 0.4) {
      type = "planet";
      img = random(planetImgs);
      size = random(110, 140);
    } 
    else if (level >= 2 && rand > 0.85) {
      type = "octopus"; 
      img = imgAlien;   
      size = random(120, 150); 
      
      if (soundAlien && soundAlien.isLoaded()) {
        soundAlien.play();
      }
    }
    
    if (type === "octopus") {
      objects.push({
        x: random(width * 0.3, width * 0.7),
        y: random(height * 0.2, height * 0.6),
        vx: random([-16, -12, 12, 16]), 
        vy: random([-3, -1, 1, 3]),      
        size: size,
        img: img,
        type: type,
        sliced: false,
        timer: 220 
      });
    } else {
      objects.push({
        x: random(100, width - 100),
        y: height,
        vx: random(-2, 2),
        vy: random(-14, -18),
        size: size,
        img: img,
        type: type,
        sliced: false
      });
    }
  }

  slicePath.push({ x: mouseX, y: mouseY });
  if (slicePath.length > 15) slicePath.shift();
  
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 252, 254);
  stroke(0, 252, 254, 220);
  strokeWeight(6); noFill();
  beginShape();
  for (let p of slicePath) { vertex(p.x, p.y); }
  endShape(); 
  pop();

  for (let i = objects.length - 1; i >= 0; i--) {
    let o = objects[i];
    
    if (o.type === "octopus") {
      if (frameCount % 6 === 0) {
        o.vx += random(-5, 5);
        o.vy += random(-1, 1);
      }
      o.vx = constrain(o.vx, -20, 20);
      o.vy = constrain(o.vy, -4, 4);
      if (abs(o.vx) < 8) o.vx = (o.vx < 0) ? -12 : 12;
      
      o.x += o.vx; o.y += o.vy;
      
      if (o.x < o.size/2) { o.x = o.size/2; o.vx *= -1.05; }
      if (o.x > width - o.size/2) { o.x = width - o.size/2; o.vx *= -1.05; }
      if (o.y < o.size/2) { o.y = o.size/2; o.vy *= -1; }
      if (o.y > height - o.size/2) { o.y = height - o.size/2; o.vy *= -1; }
      o.timer--; 
    } else {
      o.x += o.vx; o.y += o.vy; o.vy += 0.3; 
    }

    if (!o.sliced) {
      push();
      imageMode(CENTER);
      translate(o.x, o.y);
      if (o.type === "octopus") {
        if (frameCount % 4 < 2) tint(255, 80, 80); 
        image(o.img, 0, 0, o.size, o.size);
      } else {
        image(o.img, 0, 0, o.size, o.size);
      }
      pop();
      
      let d = dist(mouseX, mouseY, o.x, o.y);
      if (d < o.size / 2) {
        o.sliced = true;
        
        if (o.type === "trash") {
          score += 100;
          if (soundSlice && soundSlice.isLoaded()) soundSlice.play();
          
          let numParticles = floor(random(8, 13));
          for (let p = 0; p < numParticles; p++) {
            particles.push({
              x: o.x, y: o.y,
              vx: random(-5, 5), vy: random(-5, 5),
              img: o.img,
              size: random(20, 35), 
              rotation: random(TWO_PI),
              rotVel: random(-0.1, 0.1),
              alpha: 255,
              scale: 1.0
            });
          }
          for (let s = 0; s < 7; s++) {
            particles.push({
              x: o.x, y: o.y,
              vx: random(-8, 8), vy: random(-8, 8),
              type: "spark",
              size: random(5, 12),
              alpha: 255,
              color: color(0, 242, 254) 
            });
          }
        } else if (o.type === "planet") {
          score = max(0, score - 200);
          lives--;
          background(200, 0, 50, 120); 
          if (soundWarning && soundWarning.isLoaded()) soundWarning.play();
        } else if (o.type === "octopus") {
          score = max(0, score - 50); 
          if (soundWarning && soundWarning.isLoaded()) soundWarning.play();

          for (let s = 0; s < 15; s++) {
            particles.push({
              x: o.x, y: o.y,
              vx: random(-6, 6), vy: random(-6, 6),
              type: "spark",
              size: random(15, 30),
              alpha: 200,
              color: color(255, 0, 128) 
            });
          }
        }
      }
    }

    if (o.type === "octopus") {
      if (o.timer <= 0 || o.sliced) objects.splice(i, 1);
    } else {
      if (o.y > height + 100) {
        if (o.type === "trash" && !o.sliced) lives--;
        objects.splice(i, 1);
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; 
    if (p.type !== "spark") { p.rotation += p.rotVel; p.scale *= 0.96; }
    p.alpha -= 6; 

    if (p.alpha > 0) {
      push(); imageMode(CENTER); translate(p.x, p.y);
      if (p.type === "spark") {
        noStroke(); fill(red(p.color), green(p.color), blue(p.color), p.alpha); circle(0, 0, p.size);
      } else {
        rotate(p.rotation); tint(255, p.alpha); image(p.img, 0, 0, p.size * p.scale, p.size * p.scale);
      }
      pop();
    } else {
      particles.splice(i, 1); 
    }
  }

  textSize(24); textAlign(LEFT, TOP);
  drawNeonText(` SCORE : ${score}`, 25, 25, color(0, 242, 254), color(255), 15);
  drawNeonText(` LIVES : ${'❤️'.repeat(max(0, lives))}`, 25, 60, color(255, 0, 128), color(255), 15);
  
  textSize(16);
  if (level >= 2) {
    drawNeonText("⚠️ EMERGENCY: 에일리언이 왜곡된 시공간 벽면을 튕겨 다닙니다! 주의하세요!", 25, 100, color(255, 40, 100), color(255, 200, 210), 15);
  } else {
    drawNeonText("💡 MISSION: 은하계를 보호하기 위해 우주 쓰레기만 격파하세요.\n쓰레기를 제거하지 못해도 생명이 차감됩니다!", 25, 100, color(127, 0, 255), color(180, 220, 255), 10);
  }

  for (let i = screenSplats.length - 1; i >= 0; i--) {
    let splat = screenSplats[i];
    push(); noStroke();
    drawingContext.shadowBlur = 25; drawingContext.shadowColor = color(red(splat.color), green(splat.color), blue(splat.color), splat.alpha);
    fill(red(splat.color), green(splat.color), blue(splat.color), splat.alpha);
    ellipse(splat.x, splat.y, splat.size, splat.size * 0.85); 
    pop();
    splat.alpha -= 1.5; 
    if (splat.alpha <= 0) screenSplats.splice(i, 1);
  }
  
  if (score >= targetScore) {
    objects = []; particles = []; screenSplats = []; 
    
    if (bgmPlay && bgmPlay.isPlaying()) bgmPlay.stop();

    if (level === 4) { 
      gameState = "endingPuzzle"; 
      frameCount = 0; 
      if (soundSuccess && soundSuccess.isLoaded()) soundSuccess.play();
    } 
    else { 
      gameState = "levelUp"; 
      if (soundLevelUp && soundLevelUp.isLoaded()) soundLevelUp.play();
    }
  }
  
  if (lives <= 0) { 
    gameState = "gameOver"; particles = []; screenSplats = []; 
    if (bgmPlay && bgmPlay.isPlaying()) bgmPlay.stop();
  }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  
  textSize(90); 
  drawNeonText("Would You Like ?", width / 2, height / 2 - 40, color(0, 242, 254), color(255), 35);
  textSize(82);
  drawNeonText("Would You Like ?", width / 2, height / 2 - 40, color(127, 0, 255), color(0, 0, 0, 0), 15);
  
  textSize(16);
  fill(160, 190, 230);
  text("마우스를 이용하여 빠르게 움직이는 우주쓰레기들을 제거하세요.", width / 2, height / 2 + 190);
  
  textSize(18);
  drawNeonText("김소이 · 남서현 · 최명빈", width / 2, height / 2 + 230, color(0, 242, 254), color(200, 240, 255), 10);
  
  let hovering = mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH;
  
  push();
  if (hovering) {
    drawingContext.shadowBlur = 35;
    drawingContext.shadowColor = color(0, 252, 254);
    fill(0, 242, 254, 40);
    stroke(255);
    strokeWeight(2.5);
  } else {
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(127, 0, 255);
    fill(15, 12, 38, 180);
    stroke(127, 0, 255);
    strokeWeight(1.5);
  }
  rect(buttonX, buttonY, buttonW, buttonH, 30);
  pop();
  
  textSize(30);
  if (hovering) {
    drawNeonText("PLAY", width / 2, buttonY + buttonH / 2 - 5, color(255), color(255), 12);
  } else {
    drawNeonText("PLAY", width / 2, buttonY + buttonH / 2 - 5, color(127, 0, 255), color(0, 242, 254), 5);
  }
}

/* -------------------- 스토리 보드 -------------------- */
function drawStoryScreen() {
  rectMode(CORNER);
  push();
  fill(12, 10, 32, 200);
  stroke(0, 242, 254, 100);
  strokeWeight(1.5);
  rect(40, 40, width - 80, height - 120, 20);
  
  noStroke(); fill(0, 242, 254, 40);
  rect(60, 40, 150, 5);
  pop();

  textAlign(LEFT, TOP); 
  textSize(22); 
  drawNeonText("📡 MISSION BRIEFING : 은하 탐사 궤도 진입", 70, 70, color(0, 242, 254), color(0, 242, 254), 10);

  fill(220, 235, 255); 
  textSize(15); 
  textLeading(30);
  let story ="[미션 : 미지의 행성을 향해 전진하라!]\n당신은 새로운 행성을 발견한 천문학자입니다. 탐사선을 보내 행성의 정체를 밝혀내야 합니다.\n\n1. 마우스를 움직이면 광선검이 따라 움직이며, 화면 아래에서 다양한 물체들이 올라옵니다.\n2. 그 중 우주쓰레기는 광선검으로 잘라 점수를 얻을 수 있지만, 행성을 자르면 게임에 불이익이 생기니 주의해야 합니다.\n3. 우주 쓰레기를 자르면 +100점 / 행성을 자르면 -200점 / 외계인 우주선을 건드리면 -50점이 됩니다.\n\n*LEVEL2부터 외계인이 침공합니다! 주의하세요!! \n\n미션을 깰 때마다 행성의 사진 퍼즐을 얻을 수 있습니다!\n지금 바로 도전해서 퍼즐을 완성시켜보세요!";

  let currentChars = floor(frameCount / 1.5); 
  text(story.slice(0, currentChars), 70, 130, width - 140, height - 260);
  
  if (currentChars >= lastTypedCount + 9 && currentChars <= story.length) {
    if (soundTyping && soundTyping.isLoaded()) {
      if (!soundTyping.isPlaying()) {
        soundTyping.play();
      }
    }
    lastTypedCount = currentChars + floor(random(-1, 2)); 
  }
  
  fill(0, 242, 254, 180); 
  textSize(22); textAlign(RIGHT, BOTTOM);
  let blink = map(sin(frameCount * 0.1), -1, 1, 100, 255);
  push(); drawingContext.shadowBlur = 10; drawingContext.shadowColor = color(0, 242, 254, blink);
  fill(255, 255, 255, blink);
  text("START 시작 [ Press ENTER ] ", width - 70, height - 110);
  pop();
}

function drawLevelUp() {
  textAlign(CENTER, CENTER);
  
  textSize(65); 
  drawNeonText(`LEVEL ${level} CLEAR`, width / 2, height / 2 - 180, color(0, 255, 150), color(0, 255, 150), 35);
  
  textSize(24);
  let nextGoal = (level === 1) ? 800 : (level === 2) ? 1000 : (level === 3) ? 2000 : "모든 섹터 워프 완료!";
  let msg = level < 4 ? `NEXT TARGET: ${nextGoal} SCORE` : "당신은 우주 역사상 최고의 천문학자입니다!";
  drawNeonText(msg, width / 2, height / 2 - 120, color(200, 230, 255), color(255), 15);
  
  let puzzleSize = min(width, height) * 0.24; 
  let currentPuzzle = puzzleImgs[level - 1];
  
  push();
  noStroke();
  drawingContext.shadowBlur = 50;
  drawingContext.shadowColor = color(0, 242, 254, 150);
  fill(0, 242, 254, 20);
  circle(width / 2, height / 2 + 20, puzzleSize * 1.2);
  if (currentPuzzle) { 
    imageMode(CENTER); 
    image(currentPuzzle, width / 2, height / 2 + 20, puzzleSize, puzzleSize); 
  }
  pop();
  
  textSize(20);
  drawNeonText("🌌 퍼즐 조각 획득 성공! \n[ Press ENTER ] 다음 Level로 이동", width / 2, height / 2 + 190, color(0, 242, 254), color(200, 240, 255), 10);
}

function drawGameOver() {
  textAlign(CENTER, CENTER);
  
  textSize(70); 
  drawNeonText("Game Over", width / 2, height / 2 - 50, color(255, 0, 80), color(255, 30, 80), 40);
  
  textSize(30); 
  drawNeonText("FINAL SCORE: " + score, width / 2, height / 2 + 25, color(255), color(255), 15);
  
  drawRetryButton(width / 2, height / 2 + 155, 120);
}

function mousePressed() {
  if (gameState === "start" && mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
    gameState = "story";
    frameCount = 0;
    lastTypedCount = 0; 
    
    if (bgmTitle && bgmTitle.isLoaded() && !bgmTitle.isPlaying()) {
      bgmTitle.loop();
    }
  }
  let d = dist(mouseX, mouseY, width / 2, height / 2 + 155); 
  if (gameState === "gameOver" && d < 60) { startNewLevel(level); }
}

// 🛠️ [수정 반영] 비디오 에러 해결 및 안전한 미디어 루프 실행 키 이벤트 핸들러
function keyPressed() {
  // 1. 스토리 화면에서 엔터를 치면 -> 오프닝 비디오 씬으로 변환 및 미디어 가동
  if (gameState === "story" && keyCode === ENTER) { 
    gameState = "prologueVideo";
    frameCount = 0; 
    
    if (prologueVideo) {
      prologueVideo.stop(); 
      prologueVideo.loop(); // 브라우저 자동 재생 차단 무력화를 위해 루프로 스트림 활성화
      prologueVideo.volume(0.6);
    }
  }
  
  // 2. 비디오 화면에서 엔터를 치면 -> 영상을 완벽히 멈추고 끈 뒤 인게임(레벨 1)으로 즉시 강제 진입
  else if (gameState === "prologueVideo" && keyCode === ENTER) {
    if (prologueVideo) {
      prologueVideo.stop();
      prologueVideo.hide(); // 캔버스 뒤에 남아있는 일이 없도록 숨김 처리 고정
    }
    if (bgmTitle && bgmTitle.isPlaying()) {
      bgmTitle.stop(); 
    }
    startNewLevel(1); 
  }
  
  // 3. 레벨업 클리어 화면에서 엔터 시 다음 스태이지 구역으로 이동
  else if (gameState === "levelUp" && keyCode === ENTER && level < 4) { 
    startNewLevel(level + 1); 
  }
}

function startNewLevel(lv){
  level = lv; score = 0; lives = 3; objects = []; particles = []; screenSplats = []; gameState = "play";
  if(level == 1) targetScore = 500;
  else if(level == 2) targetScore = 800;
  else if(level == 3) targetScore = 1000;
  else if(level == 4) targetScore = 2000;

  if (bgmPlay && bgmPlay.isLoaded() && !bgmPlay.isPlaying()) {
    bgmPlay.loop();
    bgmPlay.setVolume(0.4); 
  }
}

function drawRetryButton(x, y, size) {
  push(); translate(x, y); noStroke(); fill(0, 40); circle(4, 4, size);
  fill(0, 242, 254); stroke(255); strokeWeight(4); circle(0, 0, size);
  noStroke(); fill(255, 80); circle(-size * 0.13, -size * 0.13, size * 0.7);
  noFill(); stroke(15, 12, 38); strokeWeight(8); strokeCap(ROUND);
  arc(0, 0, size * 0.5, size * 0.5, radians(50), radians(320));
  let angle = radians(320); let hx = cos(angle) * size * 0.25; let hy = sin(angle) * size * 0.25;
  push(); translate(hx, hy); rotate(angle + radians(90)); fill(15, 12, 38); noStroke();
  triangle(0, -size * 0.09, size * 0.09, size * 0.09, -size * 0.09, size * 0.09);
  pop(); pop();
}

function drawEndingPuzzle() {
  background(5, 4, 12); drawSpaceBackground();
  textAlign(CENTER, CENTER); 
  
  textSize(75); 
  drawNeonText("LEVEL CLEAR!", width / 2, 100, color(0, 242, 254), color(255), 45);
  
  textSize(26); 
  drawNeonText("축하합니다! 완벽한 퍼즐조각이 완성되었습니다.", width / 2, 175, color(127, 0, 255), color(220, 245, 255), 15);
  
  push();
  drawingContext.shadowBlur = 50;
  drawingContext.shadowColor = color(0, 252, 254, 200);
  imageMode(CENTER); let puzzleSize = min(width, height) * 0.45; image(finalPuzzle, width / 2, height / 2 + 35, puzzleSize, puzzleSize);
  pop();
  
  if (frameCount > 240) { gameState = "endingComment"; frameCount = 0; }
}

function drawEndingComment() {
  background(5, 4, 12); drawSpaceBackground();
  textAlign(CENTER, CENTER); 
  textSize(36); 
  drawNeonText("🪐소감", width / 2, height * 0.07, color(0, 242, 254), color(255), 20); 
  
  let startY = height * 0.15; let endY = height * 0.96; let availableHeight = endY - startY; let sectionH = availableHeight / 3; 
  let y1 = startY + sectionH * 0.5; let y2 = startY + sectionH * 1.5; let y3 = startY + sectionH * 2.5;
  
  drawCommentBox(width / 2, y1, "김소이", "팀원과 긴밀히 협력하면서 직접 게임 아키텍처를 빌드해보니 극도의 흥미를 느꼈고 직접 한계에 부딪히는 과정에서 실질적인 알고리즘 배움을 얻었다. 이번 기회를 발판 삼아 JavaScript라는 매력적인 생태계 언어로 한층 더 고도화된 인터랙티브 아트워크를 만들어보고 싶다는 확신이 들었다.");
  drawCommentBox(width / 2, y2, "남서현", "처음에는 단순히 고정된 코드를 작성해나가는 과정이라고만 치부했는데, 직접 게임의 모든 플로우를 통제하고 완성해 보니 무형의 아이디어를 시각화해내는 고유한 재미를 깊게 깨달았다. 예기치 못한 치명적인 오류들을 실시간으로 분쇄하고 기능을 유기적으로 조립해 가는 과정 속에서 엄청난 성취감을 축적할 수 있었고, 전반적인 시각 디자인과 레이아웃 구성까지 복합적으로 고찰하며 몰입도를 극한으로 끌어올렸다. 소통과 협업의 값진 가치를 가슴 깊이 함양할 수 있었던 소중한 여정이었다.");
  drawCommentBox(width / 2, y3, "최명빈", "본 프로젝트를 정밀 제작하면서 P5.js 라이브러리가 내포한 강력한 그래픽 역학 기능을 다채롭게 제어해볼 수 있어서 기술적으로 매우 유의미했다. 캔버스 프레임 위에 우주 이미지를 동적으로 출력하고 물체의 벡터 연산 기반 이동과 유려한 입자 이펙트 효과를 직관적으로 구현해내는 작업 전반이 매우 짜릿했다. 단순한 휘발성 액션 게임을 넘어 명확한 목표 지점과 스토리가 공존하는 시네마틱 게임을 설계했다는 점이 자랑스럽다. 추후 입체 사운드 밸런스를 강화해 빌드를 발전시키고 싶다.");
}

function drawCommentBox(x, y, name, comment) {
  rectMode(CENTER); textAlign(CENTER, CENTER);
  let boxWidth = width * 0.88; let textWidthLimit = boxWidth - 80; 
  let nameSize = max(width * 0.015, 19); 
  let commentSize = max(width * 0.011, 15); 
  textSize(commentSize); textWrap(WORD);
  
  let textH = textHeight(comment, textWidthLimit);
  let boxHeight = min(textH + nameSize + 55, height / 4.1);
  
  push();
  drawingContext.shadowBlur = 20; drawingContext.shadowColor = color(0, 242, 254, 80);
  fill(12, 10, 36, 190); 
  stroke(0, 242, 254, 150); strokeWeight(1.5); rect(x, y, boxWidth, boxHeight, 18);
  
  stroke(127, 0, 255, 100); strokeWeight(1); rect(x, y, boxWidth - 8, boxHeight - 8, 16);
  pop();
  
  drawNeonText(name, x, y - boxHeight / 2 + nameSize + 12, color(0, 242, 254), color(0, 242, 254), 10);
  fill(235, 245, 255); textSize(commentSize); textLeading(commentSize * 1.5); 
  text(comment, x, y + nameSize / 2 + 10, textWidthLimit, boxHeight - nameSize - 35);
}

function textHeight(txt, w) {
  if (!w || w <= 0) w = 1; 
  
  let fontLeading = textLeading(); 
  let lines = txt.split('\n'); 
  let totalLines = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let lineW = textWidth(lines[i]); 
    let calculatedLines = ceil(lineW / w);
    if (isFinite(calculatedLines)) {
      totalLines += calculatedLines || 1;
    } else {
      totalLines += 1;
    }
  }
  return totalLines * fontLeading;
}