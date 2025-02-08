import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/// 摇杆
@ccclass('JoyStickManager')
export class JoyStickManager extends Component {
    input:Vec2 = Vec2.ZERO

    private body: Node
    private stick: Node
    private bodyRadius: number = 0;

    private defaultPosition: Vec2;
    onLoad() {
        // 摇杆主体
        this.body = this.node.getChildByName('Body')!;
        // 摇杆里的小圈
        this.stick = this.body.getChildByName('Stick')!;
        // 摇杆主体的半径
        this.bodyRadius = this.body.getComponent(UITransform).contentSize.x / 2
        // 摇杆的默认位置
        this.defaultPosition = new Vec2(this.body.position.x, this.body.position.y);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        let touchPos = event.getUILocation();
        this.body.setPosition(touchPos.x, touchPos.y);
        console.log(event.getUILocation());  // Location on UI space
    }

    onTouchEnd(event: EventTouch) {
        this.body.setPosition(this.defaultPosition.x, this.defaultPosition.y);
        this.stick.setPosition(0, 0);
        this.input = Vec2.ZERO;
    }

    onTouchMove(event: EventTouch) {
        let touchPos = event.getUILocation();
        let stickPos = new Vec2(touchPos.x - this.body.position.x, touchPos.y - this.body.position.y);
        // 这里的length是向量的模，也就是这个点距离零点的距离
        // 由于stick的位置是相对于body的，所以这里的length就是stick的位置
        // 因此可以和bodyRadius比较，如果大于bodyRadius，就让stick的位置等于bodyRadius
        if (stickPos.length() > this.bodyRadius) {
            stickPos.multiplyScalar(this.bodyRadius / stickPos.length());
        }
        this.stick.setPosition(stickPos.x, stickPos.y);

        // 这里的normalize是将向量转化为单位向量，也就是长度为1
        // 也叫向量的归一化，因为这里我们只需要处理向量的方向，值都是一致的
        this.input = stickPos.clone().normalize();
    }
}

