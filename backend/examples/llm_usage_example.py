import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.llm import get_llm_service


async def example_basic_usage():
    print("=== 基础使用示例 ===")
    llm_service = get_llm_service()
    
    messages = [
        {"role": "user", "content": "什么是人工智能？请简洁回答。"}
    ]
    
    try:
        result = await llm_service.generate_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        print(f"提供商: {result['provider']}")
        print(f"模型: {result['model']}")
        print(f"是否使用备用: {result['is_fallback']}")
        print(f"响应内容:\n{result['content']}")
        print(f"Token 使用: {result['usage']}")
    except Exception as e:
        print(f"错误: {e}")


async def example_specific_provider():
    print("\n=== 指定提供商示例 ===")
    llm_service = get_llm_service()
    
    messages = [
        {"role": "user", "content": "写一首关于AI的短诗。"}
    ]
    
    try:
        result = await llm_service.generate_completion(
            messages=messages,
            provider="anthropic",
            temperature=0.9,
            max_tokens=200
        )
        print(f"使用 Anthropic: {result['content']}")
    except Exception as e:
        print(f"Anthropic 错误: {e}")


async def example_health_check():
    print("\n=== 健康检查示例 ===")
    llm_service = get_llm_service()
    
    print("检查默认提供商...")
    default_check = await llm_service.check_connection()
    print(f"默认提供商: {default_check}")
    
    print("\n检查 OpenAI...")
    openai_check = await llm_service.check_connection(provider="openai")
    print(f"OpenAI: {openai_check}")


async def example_multi_turn():
    print("\n=== 多轮对话示例 ===")
    llm_service = get_llm_service()
    
    conversation = [
        {"role": "system", "content": "你是一个友好的助手。"},
        {"role": "user", "content": "你好，我叫小明。"}
    ]
    
    try:
        result1 = await llm_service.generate_completion(
            messages=conversation,
            temperature=0.7,
            max_tokens=200
        )
        print(f"助手: {result1['content']}")
        
        conversation.append({"role": "assistant", "content": result1["content"]})
        conversation.append({"role": "user", "content": "我叫什么名字？"})
        
        result2 = await llm_service.generate_completion(
            messages=conversation,
            temperature=0.7,
            max_tokens=200
        )
        print(f"助手: {result2['content']}")
    except Exception as e:
        print(f"错误: {e}")


if __name__ == "__main__":
    print("Dreamix LLM 服务使用示例")
    print("=" * 50)
    
    asyncio.run(example_health_check())
    asyncio.run(example_basic_usage())
