import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { IActor, InputTypeEnum } from '../../Common';
const { ccclass, property } = _decorator;

// 人物控制脚本
@ccclass('ActorManager')
export class ActorManager extends Component {

    init(actorData: IActor) {

    }

    // 每帧调用
    protected update(dt: number): void {
        // 摇杆有输入更新的时候，才需要更新人物的位置
        if (DataManager.Instance.jm.input.length()) {
            let { x, y } = DataManager.Instance.jm.input
            // 不是直接更新，先发送到数据管理器
            DataManager.Instance.applyInput({
                id: 1,
                type: InputTypeEnum.ActorMove,
                direction: {
                    x, y
                },
                dt
            })
            console.log('yl_test: input is ', DataManager.Instance.state.actors[0].position.x, DataManager.Instance.state.actors[0].position.y);
        }
    }
    
    // 由战斗场景动态更新
    render(actorData: IActor) {
        this.node.setPosition(actorData.position.x, actorData.position.y)
    }
}

