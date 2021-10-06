export class Xors {
    constructor() {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = 88675123;
    }

    seed(s) {
        this.w = s;
    }

    rand() {
        let t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
        this.w = this.w >>> 0;	// 符号無しに型変換
        return this.w;
    }

    //----------------------------------------
    // 指定範囲で乱数を返す
    // min = 最小値
    // max = 最大値
    // 
    // 例　rnd = xors.rangeRand(0, 100)
    // rnd >= 0 && rnd <= 100
    //----------------------------------------
    rangeRand(min, max) {
        var range = max - min + 1;
        return (this.rand() % range) + min;
    }

    //----------------------------------------
    // ランダムに true か falseを返す
    //----------------------------------------
    rndTrueOrFalse() {
        return this.rangeRand(0, 1) == 0;
    }

    input(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    // 指定回数乱数を捨てる、変える
    change(num) {
        for (var i = 0; i < num; i++) this.rand();
    }
}