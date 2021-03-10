import colors from 'color';
cc.Class({
    extends: cc.Component,
 
    properties: {
        numberLabel:cc.Label,
    },
 
    // LIFE-CYCLE CALLBACKS:
 
    // onLoad () {},
 
    start () {
 
    },
    setNumber(number){
        if(number == 0){
            this.numberLabel.node.active = false;
        }
        this.numberLabel.string = number;
        if(number in colors){
            console.log("颜色有在里面")
            this.node.color = colors[number];
        }
    }
 
    // update (dt) {},
});
