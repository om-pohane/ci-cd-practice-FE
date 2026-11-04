import type { FallingItem, Particle, StageConfig } from '../types/diwali'

export class PixelRenderer {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private time = 0

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
  }

  public resize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  // --- 1. Background Environment Rendering ---
  public renderBackground(stage: StageConfig) {
    const { ctx, width, height } = this
    this.time += 0.03

    // Wall Gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.76)
    wallGrad.addColorStop(0, stage.themeColor)
    wallGrad.addColorStop(1, '#0e0417')
    ctx.fillStyle = wallGrad
    ctx.fillRect(0, 0, width, height * 0.76)

    // Floor
    const floorY = height * 0.76
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height)
    floorGrad.addColorStop(0, stage.floorColor)
    floorGrad.addColorStop(1, '#08010f')
    ctx.fillStyle = floorGrad
    ctx.fillRect(0, floorY, width, height - floorY)

    // Decorative Wall Molding line
    ctx.strokeStyle = stage.accentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, floorY)
    ctx.lineTo(width, floorY)
    ctx.stroke()

    // Floor Baseboard
    ctx.fillStyle = '#1b072b'
    ctx.fillRect(0, floorY - 6, width, 6)

    // Stage Specific Background Details
    this.renderStageProps(stage)

    // Marigold Garland & Toran at Top
    this.renderToran(stage.accentColor)

    // Floor Rangoli in Center
    this.renderRangoli(width / 2, floorY + (height - floorY) * 0.45, stage.accentColor)
  }

  // Stage Specific Furniture & Props
  private renderStageProps(stage: StageConfig) {
    const { ctx, width, height } = this
    const floorY = height * 0.76

    if (stage.id === 'LIVING_ROOM') {
      // Living Room Sofa on the left
      ctx.fillStyle = '#4a154b'
      ctx.fillRect(width * 0.05, floorY - 45, 75, 45)
      ctx.fillStyle = '#6b206c'
      ctx.fillRect(width * 0.05, floorY - 60, 75, 18) // Backrest
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(width * 0.07, floorY - 35, 20, 16) // Cushion 1
      ctx.fillRect(width * 0.14, floorY - 35, 20, 16) // Cushion 2

      // Wall Frame with Shubh Deepavali
      ctx.fillStyle = '#ffaa00'
      ctx.fillRect(width * 0.75, height * 0.16, 60, 42)
      ctx.fillStyle = '#1a0826'
      ctx.fillRect(width * 0.75 + 3, height * 0.16 + 3, 54, 36)
      ctx.fillStyle = '#ffdd55'
      ctx.font = '10px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('🪔', width * 0.75 + 30, height * 0.16 + 25)
    } else if (stage.id === 'KITCHEN') {
      // Kitchen Shelves
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(width * 0.1, height * 0.28, width * 0.8, 6)
      ctx.fillRect(width * 0.1, height * 0.44, width * 0.8, 6)

      // Brass Containers (Dabbas)
      for (let i = 0; i < 5; i++) {
        const bx = width * 0.18 + i * (width * 0.15)
        ctx.fillStyle = '#d4af37'
        ctx.fillRect(bx, height * 0.28 - 20, 18, 20)
        ctx.fillStyle = '#c59b27'
        ctx.fillRect(bx - 2, height * 0.28 - 23, 22, 4) // Lid
      }
    } else if (stage.id === 'BEDROOM') {
      // Fairy Light String
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height * 0.2)
      for (let x = 0; x <= width; x += 25) {
        const y = height * 0.2 + Math.sin(x * 0.05 + this.time) * 10
        ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Hanging Fairy Light Bulbs
      const bulbColors = ['#ff0055', '#ffcc00', '#00ffcc', '#ff9900', '#bb00ff']
      for (let x = 12; x < width; x += 30) {
        const y = height * 0.2 + Math.sin(x * 0.05 + this.time) * 10 + 6
        const cIdx = Math.floor(x / 30) % bulbColors.length
        ctx.fillStyle = bulbColors[cIdx]
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (stage.id === 'MAIN_ENTRANCE') {
      // Grand Entrance Arch Pillars
      ctx.fillStyle = '#661a4f'
      ctx.fillRect(width * 0.02, height * 0.1, 24, floorY - height * 0.1)
      ctx.fillRect(width * 0.98 - 24, height * 0.1, 24, floorY - height * 0.1)

      // Hanging Brass Bells
      ;[width * 0.2, width * 0.5, width * 0.8].forEach((bx) => {
        ctx.strokeStyle = '#c59b27'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(bx, 0)
        ctx.lineTo(bx, height * 0.18)
        ctx.stroke()

        ctx.fillStyle = '#ffd700'
        ctx.beginPath()
        ctx.arc(bx, height * 0.18 + 8, 8, 0, Math.PI)
        ctx.fill()
      })
    }
  }

  // Toran Marigold Garland
  private renderToran(accentColor: string) {
    const { ctx, width } = this
    const count = 9
    const step = width / count

    // Curved string
    ctx.strokeStyle = '#2d5a27'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 10)
    for (let i = 0; i <= count; i++) {
      const x = i * step
      ctx.quadraticCurveTo(x - step / 2, 26, x, 10)
    }
    ctx.stroke()

    // Mango leaves & marigold flowers
    for (let i = 0; i < count; i++) {
      const cx = i * step + step / 2
      const cy = 20 + Math.sin(this.time * 2 + i) * 1.5

      // Flower
      ctx.fillStyle = i % 2 === 0 ? '#ff8800' : '#ffd700'
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fill()

      // Little Center
      ctx.fillStyle = accentColor
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Indian Rangoli Center on Floor
  private renderRangoli(cx: number, cy: number, color: string) {
    const { ctx } = this
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, 0.45) // Perspective compression for floor

    // Central Flower
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, 0, 36, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ff2a70'
    ctx.beginPath()
    ctx.arc(0, 0, 26, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, 14, 0, Math.PI * 2)
    ctx.fill()

    // Petals
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const px = Math.cos(angle) * 44
      const py = Math.sin(angle) * 44
      ctx.beginPath()
      ctx.arc(px, py, 7, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  }

  // --- 2. Player Character Rendering (16-Bit Kid with Broom) ---
  public renderPlayer(
    x: number,
    facing: 'left' | 'right',
    isSpeedBoost: boolean,
    isSlowed: boolean,
    isHurt: boolean,
    name: string
  ) {
    const { ctx, height } = this
    const floorY = height * 0.76
    const py = floorY - 4

    ctx.save()
    ctx.translate(x, py)
    if (facing === 'left') {
      ctx.scale(-1, 1)
    }

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.beginPath()
    ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2)
    ctx.fill()

    // Speed Boost Aura
    if (isSpeedBoost) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, -32, 28, 0, Math.PI * 2)
      ctx.stroke()

      // Lightning sparkles
      ctx.fillStyle = '#ffd700'
      for (let i = 0; i < 3; i++) {
        const sx = Math.sin(this.time * 5 + i * 2) * 24
        const sy = -32 + Math.cos(this.time * 5 + i * 2) * 24
        ctx.fillRect(sx, sy, 3, 3)
      }
    }

    // Hurt Red Flash
    if (isHurt) {
      ctx.fillStyle = 'rgba(255, 40, 40, 0.4)'
      ctx.beginPath()
      ctx.arc(0, -32, 26, 0, Math.PI * 2)
      ctx.fill()
    }

    // Legs (Run animation cycle based on time)
    const legOffset = Math.sin(this.time * (isSpeedBoost ? 22 : isSlowed ? 8 : 14)) * 6
    ctx.fillStyle = '#f5f5f5' // White Kurta Pajama legs
    ctx.fillRect(-7, -12, 5, 12 + legOffset)
    ctx.fillRect(2, -12, 5, 12 - legOffset)

    // Little Brown Indian Mojari Shoes
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(-8, legOffset, 7, 4)
    ctx.fillRect(1, -legOffset, 7, 4)

    // Body (Festive Maroon/Saffron Kurta)
    ctx.fillStyle = isHurt ? '#ff3b30' : '#d63031'
    ctx.fillRect(-9, -36, 18, 24)

    // Golden Nehru Jacket / Kurta Trim
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(-2, -36, 4, 24)

    // Arms
    ctx.fillStyle = '#fbc531'
    ctx.fillRect(-12, -34, 4, 14)
    ctx.fillRect(8, -34, 4, 14)

    // Head (Skin tone)
    ctx.fillStyle = '#f5cd79'
    ctx.beginPath()
    ctx.arc(0, -44, 11, 0, Math.PI * 2)
    ctx.fill()

    // Red Tilak on forehead
    ctx.fillStyle = '#e84118'
    ctx.fillRect(-1, -49, 2, 4)

    // Cute Dark Hair
    ctx.fillStyle = '#1e272e'
    ctx.beginPath()
    ctx.arc(0, -47, 11, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-11, -48, 4, 6)

    // Eyes
    ctx.fillStyle = '#1e272e'
    if (isHurt) {
      // Dizzy 'X' eyes
      ctx.font = '8px monospace'
      ctx.fillText('x', 2, -42)
    } else {
      ctx.fillRect(2, -45, 2, 3)
      ctx.fillRect(6, -45, 2, 3)
    }

    // Traditional Phool Jhadu (Indian Broom) in Right Hand
    const broomSweepAngle = Math.sin(this.time * (isSpeedBoost ? 24 : 15)) * 0.35
    ctx.save()
    ctx.translate(11, -26)
    ctx.rotate(broomSweepAngle)

    // Broom Bamboo Handle
    ctx.fillStyle = '#a0522d'
    ctx.fillRect(-2, -18, 4, 26)

    // Broom Natural Straw Bristles (Spreads at bottom)
    ctx.fillStyle = '#e1b12c'
    ctx.beginPath()
    ctx.moveTo(-2, 8)
    ctx.lineTo(2, 8)
    ctx.lineTo(9, 28)
    ctx.lineTo(-9, 28)
    ctx.closePath()
    ctx.fill()

    // Bristle binding ring
    ctx.fillStyle = '#c23616'
    ctx.fillRect(-3, 8, 6, 3)

    ctx.restore() // End broom

    // Slow Sticky Syrup indicator at feet
    if (isSlowed) {
      ctx.fillStyle = 'rgba(255, 170, 0, 0.7)'
      ctx.fillRect(-14, 2, 28, 4)
    }

    ctx.restore() // End player transform

    // Player Name Tag
    ctx.save()
    ctx.fillStyle = 'rgba(26, 9, 51, 0.85)'
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 1
    const tagWidth = Math.max(50, name.length * 8 + 14)
    ctx.beginPath()
    ctx.roundRect(x - tagWidth / 2, py - 68, tagWidth, 16, 4)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px "Outfit", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name || 'Player', x, py - 56)
    ctx.restore()
  }

  // --- 3. Falling Items Rendering ---
  public renderFallingItem(item: FallingItem) {
    const { ctx, width, height } = this
    const screenX = (item.x / 100) * width
    const screenY = (item.y / 100) * height

    ctx.save()
    ctx.translate(screenX, screenY)
    ctx.rotate(item.rotation)

    switch (item.type) {
      case 'DUST':
        this.drawDustBunny()
        break
      case 'SPIDERWEB':
        this.drawSpiderweb()
        break
      case 'GOLD_COIN':
        this.drawGoldCoin()
        break
      case 'KAJU_KATLI':
        this.drawKajuKatli()
        break
      case 'DIYA':
        this.drawDiya()
        break
      case 'CHAPPAL':
        this.drawChappal()
        break
      case 'SOAN_PAPDI':
        this.drawSoanPapdi()
        break
      case 'SHARMA_JI':
        this.drawSharmaJi(item)
        break
    }

    ctx.restore()

    // Hazard Incoming Warning at Top of Screen
    if (item.isHazard && item.y < 8) {
      ctx.save()
      ctx.fillStyle = '#ff3b30'
      ctx.font = 'bold 12px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      const pulse = Math.sin(this.time * 15) > 0 ? '⚠️' : '❗'
      ctx.fillText(pulse, screenX, 36)
      ctx.restore()
    }
  }

  // Item 1: Dust Bunny
  private drawDustBunny() {
    const { ctx } = this
    ctx.fillStyle = '#7f8c8d'
    // Fluffy cluster
    ctx.beginPath()
    ctx.arc(0, 0, 11, 0, Math.PI * 2)
    ctx.arc(-7, -4, 7, 0, Math.PI * 2)
    ctx.arc(7, -3, 8, 0, Math.PI * 2)
    ctx.arc(-4, 6, 7, 0, Math.PI * 2)
    ctx.arc(5, 5, 8, 0, Math.PI * 2)
    ctx.fill()

    // Cute blinking eyes
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-4, -2, 3, 4)
    ctx.fillRect(2, -2, 3, 4)
    ctx.fillStyle = '#2c3e50'
    ctx.fillRect(-3, -1, 2, 2)
    ctx.fillRect(3, -1, 2, 2)
  }

  // Item 2: Spiderweb
  private drawSpiderweb() {
    const { ctx } = this
    ctx.strokeStyle = 'rgba(236, 240, 241, 0.85)'
    ctx.lineWidth = 1.5

    // Radiating spokes
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16)
      ctx.stroke()
    }

    // Rings
    ;[6, 11, 16].forEach((r) => {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
    })
  }

  // Item 3: Lakshmi Gold Coin
  private drawGoldCoin() {
    const { ctx } = this
    const spin = Math.cos(this.time * 6)
    ctx.scale(Math.abs(spin) * 0.7 + 0.3, 1)

    // Outer Gold rim
    ctx.fillStyle = '#f1c40f'
    ctx.beginPath()
    ctx.arc(0, 0, 13, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f39c12'
    ctx.beginPath()
    ctx.arc(0, 0, 10, 0, Math.PI * 2)
    ctx.fill()

    // Center Rupee / Star
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('₹', 0, 1)
  }

  // Item 4: Kaju Katli (Silver Foil Diamond)
  private drawKajuKatli() {
    const { ctx } = this
    // Diamond shape
    ctx.fillStyle = '#ecf0f1' // Cream cashew dough
    ctx.beginPath()
    ctx.moveTo(0, -14)
    ctx.lineTo(16, 0)
    ctx.lineTo(0, 14)
    ctx.lineTo(-16, 0)
    ctx.closePath()
    ctx.fill()

    // Shimmering Silver Foil (Varak)
    ctx.fillStyle = '#bdc3c7'
    ctx.beginPath()
    ctx.moveTo(-5, -6)
    ctx.lineTo(10, -2)
    ctx.lineTo(4, 9)
    ctx.lineTo(-8, 3)
    ctx.closePath()
    ctx.fill()

    // Sparkle Glint
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(3, -6, 2, 2)
    ctx.fillRect(-6, 4, 2, 2)
  }

  // Item 5: Terracotta Clay Diya
  private drawDiya() {
    const { ctx } = this
    // Clay base
    ctx.fillStyle = '#d35400'
    ctx.beginPath()
    ctx.ellipse(0, 5, 14, 7, 0, 0, Math.PI)
    ctx.fill()

    ctx.fillStyle = '#ba4a00'
    ctx.fillRect(-10, 3, 20, 3)

    // Flickering Flame
    const flicker = Math.sin(this.time * 18) * 2
    ctx.fillStyle = '#f39c12'
    ctx.beginPath()
    ctx.moveTo(-5, 3)
    ctx.quadraticCurveTo(0, -16 + flicker, 0, -16 + flicker)
    ctx.quadraticCurveTo(5, 3, 5, 3)
    ctx.closePath()
    ctx.fill()

    // Inner bright yellow flame
    ctx.fillStyle = '#f1c40f'
    ctx.beginPath()
    ctx.moveTo(-2, 3)
    ctx.quadraticCurveTo(0, -11 + flicker, 0, -11 + flicker)
    ctx.quadraticCurveTo(2, 3, 2, 3)
    ctx.closePath()
    ctx.fill()

    // Warm radial glow halo
    const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 24)
    glow.addColorStop(0, 'rgba(255, 200, 0, 0.4)')
    glow.addColorStop(1, 'rgba(255, 100, 0, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, -6, 24, 0, Math.PI * 2)
    ctx.fill()
  }

  // Hazard 1: Flying Hawaii Chappal
  private drawChappal() {
    const { ctx } = this
    // Blue/Brown rubber slipper sole
    ctx.fillStyle = '#2980b9'
    ctx.beginPath()
    ctx.roundRect(-8, -16, 16, 32, 6)
    ctx.fill()

    // Inner white cushioned sole
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(-6, -14, 12, 28, 4)
    ctx.fill()

    // V-strap
    ctx.strokeStyle = '#c0392b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -6)
    ctx.lineTo(-6, 4)
    ctx.moveTo(0, -6)
    ctx.lineTo(6, 4)
    ctx.stroke()

    // Central toe knob
    ctx.fillStyle = '#1e272e'
    ctx.beginPath()
    ctx.arc(0, -6, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Hazard 2: Soan Papdi Re-gifted Box
  private drawSoanPapdi() {
    const { ctx } = this
    // Golden-Yellow Mithai Box
    ctx.fillStyle = '#f1c40f'
    ctx.fillRect(-15, -12, 30, 24)
    ctx.strokeStyle = '#d68910'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-15, -12, 30, 24)

    // Red Festive Ribbon Cross
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(-15, -3, 30, 6)
    ctx.fillRect(-3, -12, 6, 24)

    // "RE-GIFTED" funny sticker
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 6px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SOAN', 0, -6)
    ctx.fillText('PAPDI', 0, 6)
  }

  // Hazard 3: Sharma Ji Ka Beta (Zigzagging Rival)
  private drawSharmaJi(item: FallingItem) {
    const { ctx } = this
    const bob = Math.sin((item.timeAlive || 0) * 10) * 2

    // Kid in nerdy specs & tie
    ctx.fillStyle = '#3498db'
    ctx.fillRect(-9, -20 + bob, 18, 20) // Blue school uniform

    ctx.fillStyle = '#f5cd79'
    ctx.beginPath()
    ctx.arc(0, -28 + bob, 8, 0, Math.PI * 2) // Head
    ctx.fill()

    // Big nerd glasses
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-6, -30 + bob, 4, 4)
    ctx.strokeRect(2, -30 + bob, 4, 4)

    // HUGE REPORT CARD WAVING ("99%")
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(8, -32 + bob, 18, 24)
    ctx.strokeStyle = '#27ae60'
    ctx.strokeRect(8, -32 + bob, 18, 24)

    ctx.fillStyle = '#c0392b'
    ctx.font = 'bold 7px monospace'
    ctx.fillText('99%', 12, -22 + bob)
    ctx.fillStyle = '#27ae60'
    ctx.font = '5px monospace'
    ctx.fillText('CBSE', 11, -14 + bob)
  }

  // --- 4. Particles Rendering ---
  public renderParticles(particles: Particle[]) {
    const { ctx } = this
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color

      if (p.shape === 'star') {
        ctx.translate(p.x, p.y)
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
  }
}
