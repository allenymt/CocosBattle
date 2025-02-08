import { _decorator, Component, EventTouch, Input, input, instantiate, Node, Prefab, UITransform, Vec2 } from 'cc';
import DataManager from '../Global/DataManager';
import { JoyStickManager } from '../UI/JoyStickManager';
import { ResourceManager } from '../Global/ResourceManager';
import { ActorManager } from '../Entity/Actor/ActorManager';
import { PrefabPathEnum } from '../Enum';
import { EntityTypeEnum } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {

    // 对应于节点里的舞台
    private stage: Node
    // 对应于节点里的UI
    private ui: Node

    // 是否准备好了
    private ready = false

    onLoad() {
        // 获取舞台和UI节点
        this.stage = this.node.getChildByName('Stage')
        this.ui = this.node.getChildByName('UI')

        // 清空舞台上的测试节点，这些节点是静态添加的
        this.stage.destroyAllChildren()

        // 获取摇杆组件
        DataManager.Instance.jm = this.ui.getComponentInChildren(JoyStickManager)
    }

    async start() {
        // 加载资源, 预制体
        await this.loadRes()
        // 初始地图
        this.initMap()
        // 准备好了
        this.ready = true
    }

    initMap() {
        // 创建一个预制体，这时候还不是一个节点
        let prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Map)
        // 实例化这个预制体，这时候才是一个节点 
        let map = instantiate(prefab)
        // 将这个节点添加到舞台上
        map.setParent(this.stage)
    }

    // 加载资源，需要在初始化脚本的时候就完成
    async loadRes() {
        let list = []
        for (let key in PrefabPathEnum) {
            // 加载各个预制体，注意是异步的
            let p = ResourceManager.Instance.loadRes(PrefabPathEnum[key], Prefab).then((prefab) => {
                DataManager.Instance.prefabMap.set(key, prefab)
            })
            list.push(p)
        }
        // 等待所有预制体加载完成
        await Promise.all(list)
    }

    // 生命周期函数，每帧更新
    protected update(dt: number): void {
        if (!this.ready) {
            return
        }
        this.render()
    }

    render() {
        this.renderActor()
    }

    // 渲染各个人物 实际对战的时候，一个房间里有多个人
    // 这里不需要渲染地图，因为地图第一帧的时候已经加载完了，不需要重复更改渲染
    renderActor() {
        // 从数据中心里获取各个要渲染的人物
        for (let data of DataManager.Instance.state.actors) {
            // TODO 解构，需要重点关注下
            const { id, type } = data
            // 从数据中心里获取这个人物
            let actorManager = DataManager.Instance.actorMap.get(id)
            if (!actorManager) {
                // ToDo 这里需要每一帧都创建 加载的吗？？
                // 获取已经创建好的预制体 
                let prefab = DataManager.Instance.prefabMap.get(type)
                // 实例化这个预制体，这时候才是一个节点 
                let actor = instantiate(prefab)
                // 将这个节点添加到舞台上
                actor.setParent(this.stage)
                // 添加ActorManager组件,添加ActorManager组件是一个脚本
                actorManager = actor.addComponent(ActorManager)
                // 存储ActorManager脚本
                DataManager.Instance.actorMap.set(id, actorManager)
                actorManager.init(data)
            } else {
                actorManager.render(data)
            }
        }
    }
}

