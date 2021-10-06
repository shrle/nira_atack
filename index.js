import { Xors } from "./xors.js";

let vm = new Vue({
    el: '#app',
    mounted: function () {
        this.xors = new Xors();
        this.xors.seed(Date.now());
        this.xors.change(100);
        this.app = new PIXI.Application({
            width: this.canvasWidth, height: this.canvasHeigth, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1,
            autoResize: true
        });
        {
            const e = document.querySelector('body').appendChild(this.app.view);
            e.style.width = '99vw';
            e.style.height = 'auto';

        }

        this.container = new PIXI.Container();
        this.playerContainer = new PIXI.Container();
        this.enemysContainer = new PIXI.Container();
        const touchContainer = new PIXI.Container();

        this.touchSpriteLeft = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.touchSpriteLeft.position.set(0, 0);
        this.touchSpriteLeft.width = this.canvasWidth / 2;
        this.touchSpriteLeft.height = this.canvasHeigth;
        this.touchSpriteLeft.interactive = true;
        this.touchSpriteLeft.buttonMode = true;
        this.touchSpriteLeft.on('pointerdown', this.touchLeft.bind(this))
            .on('pointerup', this.unTouchLeft.bind(this))
            .on('pointerupoutside', this.unTouchLeft.bind(this));

        this.touchSpriteRight = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.touchSpriteRight.position.set(this.canvasWidth / 2, 0);
        this.touchSpriteRight.width = this.canvasWidth / 2;
        this.touchSpriteRight.height = this.canvasHeigth;
        this.touchSpriteRight.interactive = true;
        this.touchSpriteRight.buttonMode = true;
        this.touchSpriteRight.on('pointerdown', this.touchRight.bind(this))
            .on('pointerup', this.unTouchRight.bind(this))
            .on('pointerupoutside', this.unTouchRight.bind(this));

        touchContainer.addChild(this.touchSpriteLeft, this.touchSpriteRight);

        this.app.stage.addChild(this.container, this.enemysContainer, this.playerContainer, touchContainer);
        this.app.ticker.add(this.animate);

        this.loadImg();


    },
    data: {
        xors: {},
        canvasWidth: 1280,
        canvasHeigth: 720,
        app: {},// PIXI.Application
        container: {},// PIXI.Container
        playerContainer: {},// PIXI.Container
        enemysContainer: {},// PIXI.Container
        touchSpriteLeft: {},
        touchSpriteRight: {},
        floorY: 600,
        greenSquare: {},
        redSquare: {},
        keyState: { ArrowLeft: false, ArrowRight: false },
        touchState: { left: false, right: false },
        watchKeyState: {},
        fcnt: 0,
        enemys: new Map,
        maxEnemys: 100,

    },
    watch: {
        watchKey: function () {
            this.watchKeyState = { ...this.keyState };
        },
    },
    methods: {
        setKeyEvent: function () {
            window.addEventListener("keydown", (event) => {
                if (event.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }
                this.keyState[event.key] = true;
            });
            window.addEventListener("keyup", (event) => {
                if (event.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }
                this.keyState[event.key] = false;
            });
        },
        loadImg: function () {

            this.app.loader
                .add('wakake-spritesheet', 'img/wakake.json')
                .add('prpr-spritesheet', 'img/prpr.json')
                .load(this.setting);
        },
        createPrpr: function () {

            window.setTimeout(this.createPrpr, this.xors.rangeRand(2000, 2500));
            if (this.enemys.size >= this.maxEnemys) return;

            const createEnemyNum = this.xors.rangeRand(1, 3);
            for (let i = 0; i < createEnemyNum; i++) {

                this.enemys.set(new Prpr(this.xors.rangeRand(100, this.canvasWidth - 100), 0), undefined);
            }
        },
        setting: function () {
            this.createPrpr();

            const wakake = new Wakake(0, this.floorY - 170);


            const graphics = new PIXI.Graphics();
            graphics.lineStyle(2, 0xFFFFFF);
            graphics.moveTo(0, this.floorY);
            graphics.lineTo(this.canvasWidth, this.floorY);

            this.container.addChild(graphics);

            this.setKeyEvent();
        },

        key: function () {

        },

        touchLeft: function () {
            this.touchState.left = true;
        },
        unTouchLeft: function () {
            this.touchState.left = false;
        },

        touchRight: function () {
            this.touchState.right = true;
        },
        unTouchRight: function () {
            this.touchState.right = false;
        },



        collision: function (spriteA, spriteB) {
            const objA = this.spriteToPoints(spriteA);
            const objB = this.spriteToPoints(spriteB);

            return (objA.x1 < objB.x2 &&
                objB.x1 < objA.x2 &&
                objA.y1 < objB.y2 &&
                objB.y1 < objA.y2);
        },
        spriteToPoints: function (sprite) {
            return {
                x1: sprite.x,
                y1: sprite.y,
                x2: sprite.x + sprite.width,
                y2: sprite.y + sprite.height,
            };
        },

        animate: function (delta) {
            this.fcnt++;
            //TODO: KeyInput
            //TODO: moves
            //TODO: collision
        },
    }
});


const backMotionFrame = 10;

class Wakake {
    container = {};
    mainSprite = {};
    leftLeg = {};
    leftLegPos = { x: 198, y: 124 };

    rightLeg = {};
    rightLegPos = { x: 186, y: 136 };

    swing = {};
    swingPos = { x: -178, y: 68 };

    vx = 0;
    direction = "right";
    motionFrame = backMotionFrame;
    niraAtack = null;

    constructor(x, y) {

        this.container = new PIXI.Container();
        this.container.position.set(x, y);
        this.mainSprite = new PIXI.Sprite.from("wakake-body.png");
        this.leftLeg = new PIXI.Sprite.from("wakake-leg.png");
        this.rightLeg = new PIXI.Sprite.from("wakake-leg.png");
        this.swing = new PIXI.Sprite.from("swing.png");
        this.swing.visible = false;
        this.turnToRight();

        this.container.addChild(this.leftLeg, this.mainSprite, this.rightLeg, this.swing);
        vm.playerContainer.addChild(this.container);
        vm.app.ticker.add(() => { this.animate() });

    }

    turnToRight() {
        this.direction = "right";

        this.mainSprite.texture = PIXI.Texture.from('wakake-body.png');
        this.mainSprite.position.set(0, 0);
        this.mainSprite.anchor.x = 0;
        this.mainSprite.scale.x = 1;

        this.leftLeg.basePos = new PIXI.Point(this.leftLegPos.x, this.leftLegPos.y);
        this.leftLeg.position.set(this.leftLegPos.x, this.leftLegPos.y);
        this.leftLeg.anchor.x = 0;
        this.leftLeg.scale.x = 1;
        this.leftLeg.visible = true;


        this.rightLeg.basePos = new PIXI.Point(this.rightLegPos.x, this.rightLegPos.y);
        this.rightLeg.position.set(this.rightLegPos.x, this.rightLegPos.y);
        this.rightLeg.anchor.x = 0;
        this.rightLeg.scale.x = 1;
        this.rightLeg.visible = true;


        this.swing.position.set(this.swingPos.x, this.swingPos.y);
        this.swing.anchor.x = 0;
        this.swing.scale.x = 1;
    }

    turnToLeft() {
        this.direction = "left";

        this.mainSprite.texture = PIXI.Texture.from('wakake-body.png');
        this.mainSprite.position.set(0, 0);
        this.mainSprite.anchor.x = 1;
        this.mainSprite.scale.x = -1;

        this.leftLeg.anchor.x = 1;
        this.leftLeg.scale.x = -1;
        this.leftLeg.basePos = new PIXI.Point(this.mainSprite.width - (this.leftLegPos.x + this.leftLeg.width), this.leftLegPos.y);
        this.leftLeg.position.set(this.mainSprite.width - (this.leftLegPos.x + this.leftLeg.width), this.leftLegPos.y);
        this.leftLeg.visible = true;

        this.rightLeg.anchor.x = 1;
        this.rightLeg.scale.x = -1;
        this.rightLeg.basePos = new PIXI.Point(this.mainSprite.width - (this.rightLegPos.x + this.rightLeg.width), this.rightLegPos.y);
        this.rightLeg.position.set(this.mainSprite.width - (this.rightLegPos.x + this.rightLeg.width), this.rightLegPos.y);
        this.rightLeg.visible = true;

        this.swing.anchor.x = 1;
        this.swing.scale.x = -1;
        this.swing.position.set(this.mainSprite.width - (this.swingPos.x + this.swing.width), this.swingPos.y);

    }

    turnToBack() {
        this.direction = "back";
        this.motionFrame = backMotionFrame;
        this.mainSprite.texture = PIXI.Texture.from('wakake-back.png');
        this.rightLeg.visible = false;
        this.leftLeg.visible = false;
    }

    walkLeft() {
        this.vx = -5;

        if (this.direction === "right") {
            this.turnToBack();
        }
        else if (this.direction === "back" && this.motionFrame === 0) {
            this.turnToLeft();

            this.createNira(this.container.x + 350, this.container.y + 70);
        }
    }

    walkRight() {
        this.vx = 5;
        if (this.direction === "left") {
            this.turnToBack();
        }
        else if (this.direction === "back" && this.motionFrame === 0) {
            this.turnToRight();
            this.createNira(this.container.x, this.container.y + 70);
        }
    }

    key() {
        if (vm.keyState.ArrowLeft || vm.touchState.left) {
            this.walkLeft();
        }
        else if (vm.keyState.ArrowRight || vm.touchState.right) {

            this.walkRight();
        }
        else {
            this.vx = 0;
        }
    }

    legFCnt = 0;
    animate() {
        if (this.motionFrame > 0) {
            this.motionFrame--;
        }
        this.key();
        this.container.x += this.vx;



        if (this.vx > 0) {
            this.legFCnt += 0.25;

            this.leftLeg.x = this.leftLeg.basePos.x + Math.cos(this.legFCnt) * 16;
            this.leftLeg.y = this.leftLeg.basePos.y + Math.sin(this.legFCnt) * 8;

            this.rightLeg.x = this.rightLeg.basePos.x + Math.cos(this.legFCnt + Math.PI) * 16;
            this.rightLeg.y = this.rightLeg.basePos.y + Math.sin(this.legFCnt + Math.PI) * 8;
        } else if (this.vx < 0) {

            this.legFCnt += 0.25;

            this.leftLeg.x = this.leftLeg.basePos.x + Math.sin(this.legFCnt) * 16;
            this.leftLeg.y = this.leftLeg.basePos.y + Math.cos(this.legFCnt) * 8;

            this.rightLeg.x = this.rightLeg.basePos.x + Math.sin(this.legFCnt + Math.PI) * 16;
            this.rightLeg.y = this.rightLeg.basePos.y + Math.cos(this.legFCnt + Math.PI) * 8;
        }
        else {
            this.legFCnt = 0;
            this.leftLeg.x = this.leftLeg.basePos.x;
            this.leftLeg.y = this.leftLeg.basePos.y;

            this.rightLeg.x = this.rightLeg.basePos.x;
            this.rightLeg.y = this.rightLeg.basePos.y;
        }
    }


    showSwing() {
        this.swing.visible = true;
        window.setTimeout(() => { this.swing.visible = false; }, 100);
    }

    createNira(x, y) {
        if (this.niraAtack != null) {
            this.destroyNira();
        }

        this.niraAtack = new NiraAtack(x, y, 170, 100);
        window.setTimeout(() => { this.destroyNira(); }, 100);
        this.showSwing();
    }
    destroyNira() {
        if (this.niraAtack === null) return;
        this.niraAtack.destroy();
        this.niraAtack = null;

    }

}

class Prpr {
    mainSprite = {};
    vx = 0;
    vy = 0;
    ga = 0.5;
    motionFrame = 30;
    textureName = [
        "prpr1.png",
        "prpr2.png",
    ];
    texture = [];
    textureIndex = 0;
    collision = {};
    alive = true;

    state = "";

    constructor(x, y) {

        for (const tn of this.textureName) {
            this.texture.push(PIXI.Texture.from(tn));
        }
        this.container = new PIXI.Container();
        this.container.position.set(x, y);
        this.mainSprite = new PIXI.Sprite.from(this.texture[0]);
        this.mainSprite.position.set(0, 0);
        this.container.addChild(this.mainSprite);
        vm.enemysContainer.addChild(this.container);
        this.animateBind = this.animate.bind(this);
        vm.app.ticker.add(this.animateBind);

        this.collision = new Collision(x, y, 110, 80);

        this.vy = 3;
    }

    fcnt = 0;
    move() {
        this.fcnt++;
        if (Math.sin(this.fcnt / 100) > 0) {
            this.vx = 0.5;
        }
        else {
            this.vx = -0.5;
        }

        if (this.container.y + 80 > vm.floorY) {
            this.vy = 0;
        }
        else {
            this.vy += this.ga;
        }
    }

    die() {
        if (!this.alive) return;
        console.log('prpr die');
        this.mainSprite.texture = PIXI.Texture.from("prpr3.png");
        this.alive = false;
        //this.mainSprite.scale.x = 2;
        //this.mainSprite.scale.y = 2;
        //this.container.y = vm.floorY - this.mainSprite.height + 50;
    }

    destroy() {

        vm.app.ticker.remove(this.animateBind);
        this.mainSprite.destroy();
        this.mainSprite = null;
        vm.enemys.delete(this);
    }
    animate() {
        if (!this.alive) {
            if (this.mainSprite.alpha <= 0) {
                this.destroy();
                return;
            }

            this.mainSprite.alpha -= 0.01;
            return;
        }
        if (this.motionFrame > 0) {
            this.motionFrame--;
        }
        else {
            this.motionFrame = 30;
            this.textureIndex++;
            if (this.textureIndex === this.texture.length) this.textureIndex = 0;
            this.mainSprite.texture = this.texture[this.textureIndex];
        }
        this.move();
        this.container.x += this.vx;
        this.container.y += this.vy;
        if (this.container.y + 80 > vm.floorY) {
            this.container.y = vm.floorY - 80;
        }

        this.collision.setPosition(this.container.x, this.container.y);
    }
}


class Collision {
    x;
    y;
    width;
    height;
    visible;

    sprite = {};

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x, y, width, height, visible = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = visible;

        this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.sprite.tint = '0xFF0000';
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.visible = visible;
        vm.container.addChild(this.sprite);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }

    toPoint() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.width,
            y2: this.y + this.height,
        };
    }

    collision(obj) {
        const my = this.toPoint();
        const you = obj.toPoint();

        return (my.x1 < you.x2 &&
            you.x1 < my.x2 &&
            my.y1 < you.y2 &&
            you.y1 < my.y2);
    }

    destroy() {
        this.sprite.destroy();
        this.sprite = null;
    }
}
class NiraAtack extends Collision {

    _hitJudg;

    constructor(x, y, width, height) {
        super(x, y, width, height);
        this._hitJudg = this.hitJudg.bind(this);
        vm.app.ticker.add(this._hitJudg);
    }

    hitJudg() {
        vm.enemys.forEach((value, enemy) => {
            if (this.collision(enemy.collision)) {
                enemy.die();
            }
        });
    }

    destroy() {
        vm.app.ticker.remove(this._hitJudg);
        this.sprite.destroy();
        this.sprite = null;
    }
}
