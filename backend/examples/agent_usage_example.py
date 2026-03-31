import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agent.agent import get_agent, ConversationStore
from app.tools.tools import get_tool_registry, CalculatorTool


async def example_list_tools():
    print("=== 列出所有可用工具 ===")
    # Tools are initialized automatically when get_tool_registry() is called
    registry = get_tool_registry()
    tools = registry.list_tools()
    for tool in tools:
        print(f"\n工具名称: {tool['name']}")
        print(f"描述: {tool['description']}")
        print(f"参数: {tool['parameters']}")


async def example_direct_tool_execution():
    print("\n=== 直接执行工具 ===")
    calculator = CalculatorTool()
    result = await calculator.execute(operation="add", a=5, b=3)
    print(f"5 + 3 = {result['result']}")
    
    result = await calculator.execute(operation="multiply", a=4, b=6)
    print(f"4 * 6 = {result['result']}")


async def example_basic_agent_chat():
    print("\n=== 基础Agent聊天 ===")
    agent = get_agent()
    
    result = await agent.process_message(
        user_message="你好，请介绍一下你自己",
        use_tools=False
    )
    print(f"Agent: {result['message']}")
    print(f"会话ID: {result['conversation_id']}")


async def example_multi_turn_conversation():
    print("\n=== 多轮对话 ===")
    agent = get_agent()
    
    result1 = await agent.process_message(
        user_message="我叫小明，很高兴认识你",
        use_tools=False
    )
    print(f"Agent: {result1['message']}")
    conversation_id = result1['conversation_id']
    
    result2 = await agent.process_message(
        user_message="我叫什么名字？",
        conversation_id=conversation_id,
        use_tools=False
    )
    print(f"Agent: {result2['message']}")


async def example_conversation_management():
    print("\n=== 对话管理 ===")
    
    conv1 = ConversationStore.create_conversation()
    conv1.add_message("user", "你好")
    conv1.add_message("assistant", "你好！有什么我可以帮助你的吗？")
    
    conv2 = ConversationStore.create_conversation()
    conv2.add_message("user", "今天天气怎么样？")
    
    conversations = ConversationStore.list_conversations()
    print(f"总共有 {len(conversations)} 个对话")
    for conv in conversations:
        print(f"  - 对话ID: {conv['conversation_id']}, 消息数: {conv['message_count']}")
    
    retrieved_conv = ConversationStore.get_conversation(conv1.conversation_id)
    if retrieved_conv:
        print(f"\n检索到的对话: {retrieved_conv.conversation_id}")
        for msg in retrieved_conv.get_messages():
            print(f"  {msg.role}: {msg.content}")
    
    ConversationStore.delete_conversation(conv2.conversation_id)
    conversations = ConversationStore.list_conversations()
    print(f"\n删除后剩下 {len(conversations)} 个对话")


async def main():
    print("Action Agent 系统使用示例")
    print("=" * 50)
    
    await example_list_tools()
    await example_direct_tool_execution()
    await example_basic_agent_chat()
    await example_multi_turn_conversation()
    await example_conversation_management()
    
    print("\n" + "=" * 50)
    print("示例完成！")


if __name__ == "__main__":
    asyncio.run(main())
