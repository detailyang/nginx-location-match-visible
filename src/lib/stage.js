export default class Stage {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawCircle(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2*Math.PI, false);
        this.ctx.stroke();
    }

    drawLine(bx, by, ex, ey) {
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();
    }
    
    drawLineWithText(bx, by, ex, ey, text) {
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();
        this.ctx.strokeText(text, (bx+ex)/2, (by+ey)/2);
    }

    drawText(x, y, text) {
        this.ctx.strokeText(text, x, y);
    }
    
    setFont(font) {
        this.ctx.font = font;
    }
    
    setFillStyle(style) {
        this.ctx.fillStyle = style;
    }
    
    setStrokeStyle(style) {
        this.ctx.strokeStyle = style;
    }
    
    clearReact(x, y, w, h) {
        this.ctx.clearRect(0, 0, w, h);
    }
}