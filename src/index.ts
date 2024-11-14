import { Context, Schema } from 'koishi'
import type { OneBotBot } from 'koishi-plugin-adapter-onebot'
import {} from 'koishi-plugin-cron'
export const name = 'autocheck'
export const inject = ['cron']  // 声明使用 cron 服务

export interface Config {
  groupIds: number[]  // 群ID数组，用于指定多个打卡的目标群
}

export const Config: Schema<Config> = Schema.object({
  groupIds: Schema.array(Schema.number()).description('目标群的群号列表'),
})

// 插件的主要逻辑
export function apply(ctx: Context, config: Config) {
  // 定义cron任务，每天0:00执行
  ctx.cron('0 0 * * *', async () => {
    for (const bot of ctx.bots) {
      const oneBot = bot as OneBotBot<Context>  // 这里指定了上下文类型

      if (oneBot.internal?.sendGroupSign) {
        for (const groupId of config.groupIds) {
          try {
            await oneBot.internal.sendGroupSign(groupId)
            console.log(`已在群 ${groupId} 发送打卡请求`)
          } catch (error) {
            console.error(`自动打卡失败（群 ${groupId}）: ${error}`)
          }
        }
      }
    }
  })
}