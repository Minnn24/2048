const ROWS = 4;
const NUMBERS = [2, 4];
const MIN_LENGTH = 50;
const MOVE_DURATION = 0.1;
 
cc.Class({
    extends: cc.Component,
 
    properties: {
        scoreLabel: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        gap: 20,
        bg: cc.Node,
    },
 
    // LIFE-CYCLE CALLBACKS:
 
    // onLoad () {},
 
    start() {
        this.drawBgBlocks();//create Blocks
        this.init();
        this.addEventHandler();//touch Click
    },
    drawBgBlocks() {
        this.blockSize = (cc.winSize.width - this.gap * (ROWS + 1)) / ROWS;
        //console.log(this.blockSize,"this.blockSize ----")
        let x = this.gap + this.blockSize / 2;//block.position
        let y = this.blockSize;
        this.positions = [];
        for (let i = 0; i < ROWS; ++i) {
            this.positions[i]=[];
            for (let j = 0; j < ROWS; ++j) {
                let block = cc.instantiate(this.blockPrefab);
                block.width = this.blockSize
                block.height = this.blockSize
                this.bg.addChild(block);
                block.setPosition(cc.v2(x, y));
                this.positions[i][j] = cc.v2(x, y);//存入格子位置数据
                //console.log(this.positions[i][j],"位置===============")
                x += this.gap + this.blockSize;
                block.getComponent('block').setNumber(0);
            }
            y += this.gap + this.blockSize;
            x = this.gap + this.blockSize / 2;
        }
    },
    init(){
        this.updateScore(0);
 
        if (this.blocks) {
            for (let i = 0; i < this.blocks.length; ++i) {
                for (let j = 0; j < this.blocks[i].length; ++j) {
                    if (this.blocks[i][j] != null) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }
 
        this.data = []; //位置上的数字
        this.blocks = []; //格子的数据
 
        for (let i = 0; i < ROWS; ++i) {
            this.blocks[i]=[null,null,null,null];
            this.data[i] = [0,0,0,0]
        }
        this.addBlock();
        this.addBlock();
        this.addBlock();

    },
    updateScore(number){
        this.score = number;
        this.scoreLabel.string = '分数: ' + number;
    },
    getEmptyLocations() {
        let locations = [];
        console.log("每行每列可碰的格子数:",this.blocks.length)
        for (let i = 0; i < this.blocks.length; ++i) {
            for (let j = 0; j < this.blocks[i].length; ++j) {
                if (this.blocks[i][j] == null) {
                    locations.push({ x: i, y: j });
                }
            }
        }
        return locations;
    },
    addBlock() {
        let locations = this.getEmptyLocations();
        if (locations.length == 0) return false;
        //console.log("位置容器的大小:",locations.length)
        let location = locations[Math.floor(Math.random() * locations.length)];
        console.log("位置:",location)
        let x = location.x
        let y = location.y;
        let position = this.positions[x][y];
 
        let block = cc.instantiate(this.blockPrefab);
        block.width = this.blockSize
        block.height = this.blockSize
        this.bg.addChild(block);
        block.setPosition(position);
        let number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
        console.log("初始化生成的数：",number)
        block.getComponent('block').setNumber(number);
        this.blocks[x][y] = block;
        this.data[x][y] = number;
        return true;
    },

    //添加触摸监听
    addEventHandler() {
        this.bg.on('touchstart', (event) => {
            this.startPoint = event.getLocation();
            console.log("触摸开始的点:",this.startPoint)
        });
        this.bg.on('touchend', (event) => {
            this.endPoint = event.getLocation();
            console.log("结束触摸的点:",this.endPoint)
            //结束的坐标点位置减去开始触摸的坐标点位置
            let vec = this.endPoint.sub(this.startPoint);
            console.log("坐标差:",vec)
            console.log("vec.mag()是开更号:",vec.mag())
            if (vec.mag() > MIN_LENGTH) {
                if (Math.abs(vec.x) > Math.abs(vec.y)) {
                    //x
                    if (vec.x > 0) {
                        this.moveRight();
                    } else {
                        this.moveLeft();
                    }
                } else {
                    //y
                    if (vec.y > 0) {
                        this.moveUp();
                    } else {
                        this.moveDown();
                    }
                }
            }
        })
    },

    //移动
    afterMove(hasMove) {
        //动完之后重新生成一个
        if (hasMove == true) {
            this.addBlock();
        }
    },
 
    doMove(block, position, callback) {
        let action = cc.moveTo(MOVE_DURATION, position)
        let finish = cc.callFunc(() => {
            callback && callback()
        });
        cc.tween(block)//tween Action
            .then(action) //插入一个动作
            .then(finish) //同上
            .start()//开始执行这个tween缓动动作序列
    },
    //向上
    moveUp(){
        cc.log("up");
        let hasMove = false;
        //匿名函数
        let move = (x, y, callback) => {
            console.log("x=",x,"y=",y,"这个数是:",this.data[x][y])
            if (x == 3 || this.data[x][y] == 0) {
                console.log("重新生成格子")
                callback && callback();//如果有回调函数则执行回调
                return;
            } else if (this.data[x + 1][y] == 0) {
                //move
                let block = this.blocks[x][y];
                let position = this.positions[x + 1][y];
                this.blocks[x + 1][y] = block;
                this.data[x + 1][y] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    console.log("向上遇到空位之后：",x+1,y)
                    move(x+1, y, callback);
                });
                hasMove = true;
            } else if (this.data[x + 1][y] == this.data[x][y]) {
                console.log("碰到相同的数字合成并生成一个新的格子:",x,y)
                //add
                let block = this.blocks[x][y];
                let position = this.positions[x + 1][y];
                this.data[x + 1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x+1][y].getComponent('block').setNumber(this.data[x+1][y]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback()
                });
                hasMove = true;
            } else {
                callback && callback();
                return;
            }
        }
        let toMove = [];//可移动的格子（位置）
        for (let i = ROWS - 1; i >= 0 ; --i) {
            for (let j = ROWS - 1; j >= 0; --j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j })
                }
            }
        }
        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                console.log("移动了几次:",counter)
                if (counter == toMove.length) {
                    this.afterMove(hasMove);
                }
            });
        }
    },
    moveDown() {
        cc.log("down");
 
        let hasMove = false;
 
        let move = (x, y, callback) => {
            if (x == 0 || this.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (this.data[x - 1][y] == 0) {
                //move
                let block = this.blocks[x][y];
                let position = this.positions[x - 1][y];
                this.blocks[x - 1][y] = block;
                this.data[x - 1][y] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x-1, y, callback);
                });
                hasMove = true;
            } else if (this.data[x - 1][y] == this.data[x][y]) {
                //add
                let block = this.blocks[x][y];
                let position = this.positions[x - 1][y];
                this.data[x - 1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x-1][y].getComponent('block').setNumber(this.data[x-1][y]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback()
                });
                hasMove = true;
            } else {
                callback && callback();
                return;
            }
        }
        let toMove = [];
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j <ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j })
                }
            }
        }
        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter == toMove.length) {
                    this.afterMove(hasMove);
                }
            });
        }
    },
    moveLeft() {
        cc.log("left");
        let hasMove = false;
 
        let move = (x, y, callback) => {
            if (y == 0 || this.data[x][y] == 0) {
 
                callback && callback();
                return;
            } else if (this.data[x][y - 1] == 0) {
                //move
                let block = this.blocks[x][y];
                let position = this.positions[x][y - 1];
                this.blocks[x][y - 1] = block;
                this.data[x][y - 1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x, y - 1, callback);
                });
 
                hasMove = true;
            } else if (this.data[x][y - 1] == this.data[x][y]) {
                //add
                let block = this.blocks[x][y];
                let position = this.positions[x][y - 1];
                this.data[x][y - 1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x][y-1].getComponent('block').setNumber(this.data[x][y- 1]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback()
                });
 
                hasMove = true;
 
            } else {
                callback && callback();
                return;
            }
        }
 
        let toMove = [];
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j })
                }
            }
        }
 
        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
 
                if (counter == toMove.length) {
                    this.afterMove(hasMove);
                }
 
            });
        }
    },
    moveRight() {
        cc.log("right");
        let hasMove = false;
 
        let move = (x, y, callback) => {
            if (y == 3 || this.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (this.data[x][y + 1] == 0) {
                //move
                let block = this.blocks[x][y];
                let position = this.positions[x][y + 1];
                this.blocks[x][y + 1] = block;
                this.data[x][y + 1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x, y+1, callback);
                });
                hasMove = true;
            } else if (this.data[x][y + 1] == this.data[x][y]) {
                //add
                let block = this.blocks[x][y];
                let position = this.positions[x][y + 1];
                this.data[x][y + 1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x][y+1].getComponent('block').setNumber(this.data[x][y+1]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback()
                });
                hasMove = true;
            } else {
                callback && callback();
                return;
            }
        }
        let toMove = [];
        for (let i = ROWS - 1; i >= 0; --i) {
            for (let j = ROWS-1; j >= 0; --j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j })
                }
            }
        }
        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter == toMove.length) {
                    this.afterMove(hasMove);
                }
            });
        }
    },
});