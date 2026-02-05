---
title: 'Understanding Android BufferQueue: A Complete Guide / 深入理解 Android BufferQueue：完整指南'
description: 'A comprehensive guide to Android graphics pipeline through BufferQueue - from basic concepts to advanced fence semantics. / 通过 BufferQueue 全面介绍 Android 图形流水线——从基础概念到高级栅栏语义。'
pubDate: 'Feb 05 2026'
category: 'Android Graphics'
tags: ['Android', 'Graphics', 'SurfaceFlinger', 'C++', 'Systems Programming']
---

## Introduction / 简介

Every frame you see on your Android phone — from scrolling through apps to watching videos — passes through a critical component called BufferQueue. It's the invisible bridge connecting graphics producers (camera, video decoder, OpenGL) with consumers (display compositor, video encoder, screen recorder).

你在 Android 手机上看到的每一帧画面——从滑动应用到观看视频——都经过一个名为 BufferQueue 的关键组件。它是连接图形生产者（摄像头、视频解码器、OpenGL）与消费者（显示合成器、视频编码器、屏幕录制器）的隐形桥梁。

Understanding BufferQueue is essential for anyone working with Android graphics, whether you're building custom UIs, optimizing performance, or debugging rendering issues. This guide will take you from basic concepts to advanced synchronization mechanisms.

理解 BufferQueue 对于任何从事 Android 图形工作的人来说都是必不可少的，无论你是构建自定义 UI、优化性能还是调试渲染问题。本指南将从基础概念带你深入到高级同步机制。

**What you'll learn / 你将学到：**
- How BufferQueue enables efficient graphics data passing / BufferQueue 如何实现高效的图形数据传递
- The four-state buffer lifecycle / 四态缓冲区生命周期
- Producer and consumer operations in depth / 生产者和消费者操作详解
- Fence-based synchronization for async pipelining / 基于栅栏的异步流水线同步

---

## Part 1: BufferQueue Fundamentals / 第一部分：BufferQueue 基础

### What is BufferQueue? / 什么是 BufferQueue？

BufferQueue is the core communication mechanism in Android's graphics system. It implements a producer-consumer pattern where graphics buffers are passed efficiently between different system components.

BufferQueue 是 Android 图形系统中的核心通信机制。它实现了生产者-消费者模式，在不同的系统组件之间高效地传递图形缓冲区。

**Key insight / 核心洞察：** BufferQueue manages buffer **slots**, not the actual pixel data. The same memory can be reused across multiple frames, making it extremely efficient.

BufferQueue 管理的是缓冲区**槽位（slots）**，而不是实际的像素数据。同一块内存可以在多帧之间重复使用，这使得它极其高效。

### The Three Main Actors / 三个主要角色

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Producer   │ ───> │ BufferQueue  │ ───> │  Consumer   │
│  生产者      │      │   缓冲队列    │      │  消费者      │
└─────────────┘      └──────────────┘      └─────────────┘
```

**Producer / 生产者：** Generates graphics content (Camera, MediaCodec, OpenGL ES, WebView)

生成图形内容（摄像头、媒体编解码器、OpenGL ES、WebView）

**BufferQueue / 缓冲队列：** Manages buffer slots, handles synchronization, coordinates handoffs

管理缓冲区槽位、处理同步、协调移交

**Consumer / 消费者：** Processes graphics data (SurfaceFlinger, display, video encoder, OpenGL texture)

处理图形数据（SurfaceFlinger、显示、视频编码器、OpenGL 纹理）

### Real-World Examples / 实际应用场景

| Use Case / 用例 | Producer / 生产者 | Consumer / 消费者 |
|-----------------|------------------|------------------|
| Camera preview / 摄像头预览 | Camera HAL | SurfaceFlinger |
| Video playback / 视频播放 | MediaCodec (decoder) | SurfaceFlinger |
| Screen recording / 屏幕录制 | SurfaceFlinger | MediaCodec (encoder) |
| Game rendering / 游戏渲染 | OpenGL ES | SurfaceFlinger |

---

## Part 2: Buffer State Machine / 第二部分：缓冲区状态机

Each buffer slot in BufferQueue exists in one of four states. Understanding these states is crucial for grasping how the graphics pipeline works.

BufferQueue 中的每个缓冲区槽位都处于四种状态之一。理解这些状态对于掌握图形流水线的工作原理至关重要。

### The Four States / 四种状态

```cpp
enum class BufferState {
    FREE,       // Available for producer to dequeue / 可供生产者取出
    DEQUEUED,   // Owned by producer, being filled / 生产者拥有，正在填充
    QUEUED,     // Filled by producer, waiting for consumer / 生产者已填充，等待消费者
    ACQUIRED    // Acquired by consumer, being displayed/processed / 消费者获取，正在显示/处理
};
```

### State Transition Diagram / 状态转换图

```
                    Producer Operations / 生产者操作                    Consumer Operations / 消费者操作

    ┌─────────┐   dequeueBuffer()   ┌──────────┐   queueBuffer()   ┌─────────┐   acquireBuffer()   ┌──────────┐
    │         │ ──────────────────> │          │ ─────────────────> │         │ ──────────────────> │          │
    │  FREE   │                     │ DEQUEUED │                     │ QUEUED  │                     │ ACQUIRED │
    │   空闲   │ <────────────────── │ 已取出   │ <───────────────── │ 已排队  │ <───────────────── │ 已获取    │
    │         │   cancelBuffer()    │          │   releaseBuffer()  │         │   (After display)   │          │
    └─────────┘                     └──────────┘                     └─────────┘                     └──────────┘
      ↑                                                                                                │
      │                                                                                                │
      └────────────────────────────────────────────────────────────────────────────────────────────────┘
                                            (After consumer releases)
```

### Who Triggers Each Transition? / 谁触发每个转换？

| Transition / 转换 | Triggered By / 触发者 | Operation / 操作 |
|-------------------|---------------------|------------------|
| FREE → DEQUEUED | Producer / 生产者 | `dequeueBuffer()` |
| DEQUEUED → FREE | Producer / 生产者 | `cancelBuffer()` |
| DEQUEUED → QUEUED | Producer / 生产者 | `queueBuffer()` |
| QUEUED → ACQUIRED | Consumer / 消费者 | `acquireBuffer()` |
| ACQUIRED → FREE | Consumer / 消费者 | `releaseBuffer()` |

**Key point / 关键点：** At any given time, a slot is owned by either the producer or the consumer, never both. This clear ownership prevents race conditions.

在给定时间，一个槽位只能由生产者或消费者拥有，不能同时拥有。这种明确的所有权防止了竞态条件。

---

## Part 3: Producer Operations / 第三部分：生产者操作

### dequeueBuffer - Reserving a Slot / 预留槽位

Before writing graphics data, the producer must reserve a buffer slot.

在写入图形数据之前，生产者必须预留一个缓冲区槽位。

```cpp
int slot, fenceFd;
status_t result = producer->dequeueBuffer(&slot, &fenceFd);
```

**What happens / 发生了什么：**
1. BufferQueue finds a FREE slot / BufferQueue 找到一个空闲槽位
2. Marks it as DEQUEUED / 标记为已取出
3. Returns the slot index and release fence / 返回槽位索引和释放栅栏

**Critical / 关键点：** The producer must wait on the **release fence** before filling the buffer. This fence signals when the previous consumer (e.g., display) is done using this slot.

生产者必须在填充缓冲区之前等待**释放栅栏**。此栅栏表示之前的消费者（如显示器）何时完成使用此槽位。

### requestBuffer - Getting the Buffer Handle / 获取缓冲区句柄

After dequeuing, the producer requests the actual graphic buffer handle.

取出槽位后，生产者请求实际的图形缓冲区句柄。

```cpp
sp<GraphicBuffer> buffer;
result = producer->requestBuffer(slot, &buffer);
```

This returns a handle to the memory that the producer can write to (e.g., for OpenGL rendering or camera frame data).

这返回一个生产者可以写入的内存句柄（例如，用于 OpenGL 渲染或摄像头帧数据）。

### queueBuffer - Submitting Filled Buffer / 提交已填充的缓冲区

Once the producer fills the buffer with graphics data, it queues the buffer for the consumer.

一旦生产者用图形数据填充了缓冲区，它就将缓冲区排队给消费者。

```cpp
IGraphicBufferProducer::QueueBufferInput input {
    .timestamp = systemTime(),
    .isAutoTimestamp = false,
    .crop = Rect::INVALID_RECT,
    .scalingMode = NATIVE_WINDOW_SCALING_MODE_SCALE_TO_WINDOW,
    .transform = 0,
    .stickyTransform = 0,
    .acquireFence = acquireFence,  // IMPORTANT: See fence section / 重要：见栅栏部分
};

IGraphicBufferProducer::QueueBufferOutput output;
result = producer->queueBuffer(slot, input, &output);
```

**What happens / 发生了什么：**
1. Buffer state changes from DEQUEUED → QUEUED / 缓冲区状态从已取出变为已排队
2. Buffer is added to the queue for consumer / 缓冲区被添加到消费者队列
3. Consumer is notified (woken up) / 消费者被通知（唤醒）

### cancelBuffer - Giving Up a Slot / 放弃槽位

If the producer decides not to use a dequeued buffer (e.g., rendering was cancelled):

如果生产者决定不使用已取出的缓冲区（例如，渲染被取消）：

```cpp
result = producer->cancelBuffer(slot, fenceFd);
```

**What happens / 发生了什么：**
1. Buffer state changes from DEQUEUED → FREE / 缓冲区状态从已取出变为空闲
2. Buffer returns to available pool / 缓冲区返回可用池
3. No consumer interaction needed / 无需消费者交互

**Note / 注意：** `cancelBuffer` does not involve acquire fences since the buffer was never queued.

`cancelBuffer` 不涉及获取栅栏，因为缓冲区从未排队。

---

## Part 4: Consumer Operations / 第四部分：消费者操作

### acquireBuffer - Taking Queued Buffer / 获取已排队的缓冲区

The consumer retrieves the next buffer in the queue.

消费者检索队列中的下一个缓冲区。

```cpp
BufferItem buffer;
status_t result = consumer->acquireBuffer(&buffer, 0 /* expectedPresentTime */);
```

**What happens / 发生了什么：**
1. Gets the next buffer from the queue (FIFO order) / 从队列获取下一个缓冲区（FIFO 顺序）
2. Buffer state changes from QUEUED → ACQUIRED / 缓冲区状态从已排队变为已获取
3. Returns buffer metadata (timestamp, crop, transform) / 返回缓冲区元数据（时间戳、裁剪、变换）

**Critical / 关键点：** Before reading the buffer contents, the consumer must wait on the **acquire fence**. This fence signals when the producer (GPU) has finished writing.

在读取缓冲区内容之前，消费者必须等待**获取栅栏**。此栅栏表示生产者（GPU）何时完成写入。

### releaseBuffer - Returning Buffer to Pool / 将缓冲区返回池中

After the consumer is done processing (e.g., after displaying the frame):

在消费者完成处理后（例如，显示帧后）：

```cpp
status_t result = consumer->releaseBuffer(
    buffer.mSlot,
    buffer.mFrameNumber,
    EGL_NO_DISPLAY,
    EGL_NO_SYNC_KHR,
    releaseFence  // IMPORTANT: See fence section / 重要：见栅栏部分
);
```

**What happens / 发生了什么：**
1. Buffer state changes from ACQUIRED → FREE / 缓冲区状态从已获取变为空闲
2. Buffer returns to available pool for producer / 缓冲区返回可用池供生产者使用
3. Producer is notified if waiting / 通知等待中的生产者

---

## Part 5: Fence Synchronization / 第五部分：栅栏同步机制

Fences are the secret sauce that makes BufferQueue efficient. They enable asynchronous pipelining by allowing the producer and consumer to work concurrently without waiting for each other.

栅栏是使 BufferQueue 高效的秘密武器。它们通过允许生产者和消费者并发工作而无需相互等待，实现了异步流水线。

### The Core Principle / 核心原则

**Fences represent promises, not current state.**

**栅栏表示承诺，而非当前状态。**

A fence is a synchronization primitive that signals when some asynchronous operation (like GPU rendering or display scanout) completes. The key insight is that fences don't need to be signaled when you queue or release buffers — they only need to be signaled when the receiver actually needs the data.

栅栏是一种同步原语，表示某些异步操作（如 GPU 渲染或显示扫描）何时完成。关键洞察是，栅栏在排队或释放缓冲区时不需要触发——它们只需要在接收者实际需要数据时触发。

### Acquire Fence / 获取栅栏

Signals when the **producer** has finished writing to the buffer.

表示**生产者**何时完成对缓冲区的写入。

```cpp
// Producer side: queueBuffer / 生产者端：queueBuffer
IGraphicBufferProducer::QueueBufferInput input {
    .acquireFence = unsignaledFence,  // GPU still working - OK! / GPU 仍在工作 - 正常！
    // ... other fields
};
producer->queueBuffer(slot, input, &output);

// Consumer side: Before reading / 消费者端：读取之前
acquireFence->wait();  // Wait HERE before reading / 在此等待，然后读取
// Now safe to read buffer / 现在可以安全读取缓冲区
```

**Key points / 关键点：**
- Does NOT need to be signaled at `queueBuffer` time / 在 `queueBuffer` 时不需要触发
- Consumer waits on this fence before reading / 消费者在读取前等待此栅栏
- Allows producer to queue and continue working / 允许生产者排队并继续工作

### Release Fence / 释放栅栏

Signals when the **consumer** has finished displaying/processing the buffer.

表示**消费者**何时完成显示/处理缓冲区。

```cpp
// Consumer side: releaseBuffer / 消费者端：releaseBuffer
sp<Fence> releaseFence = displayFence;  // Display still working - OK! / 显示仍在工作 - 正常！
consumer->releaseBuffer(slot, releaseFence);

// Producer side: Next dequeueBuffer / 生产者端：下一次 dequeueBuffer
releaseFence->wait();  // Wait HERE before writing / 在此等待，然后写入
// Now safe to write to buffer / 现在可以安全写入缓冲区
```

**Key points / 关键点：**
- Does NOT need to be signaled at `releaseBuffer` time / 在 `releaseBuffer` 时不需要触发
- Producer waits on this fence before refilling / 生产者在重新填充前等待此栅栏
- Allows consumer to release early while display continues / 允许消费者提前释放，同时显示继续进行

### Summary: Who Waits When / 总结：谁在何时等待

| Fence Type / 栅栏类型 | Who Waits / 谁等待 | Wait Location / 等待位置 |
|---------------------|-------------------|------------------------|
| Acquire fence / 获取栅栏 | Consumer / 消费者 | Before acquiring/reading the buffer<br>在获取/读取缓冲区之前 |
| Release fence / 释放栅栏 | Producer / 生产者 | Before filling the buffer again<br>在重新填充缓冲区之前 |

### Why This Design Enables Performance / 为什么这种设计能提高性能

Fences enable **asynchronous pipelining**, maximizing throughput by allowing overlapping operations:

栅栏实现**异步流水线**，通过允许重叠操作来最大化吞吐量：

```
Time Flow / 时间流程 →

Producer:  [Fill Buf1] [Fill Buf2] [Fill Buf3] [Fill Buf4]
                ↓           ↓           ↓           ↓
Fences:       AF1         AF2         AF3         AF4
Consumer:         [Read Buf1] [Read Buf2] [Read Buf3]
                     ↓           ↓           ↓
Fences:          RF1         RF2         RF3
Producer:            [Fill Buf1] [Fill Buf2]
                        (waits on RF1) (waits on RF2)

Legend / 图例:
AF = Acquire Fence (GPU done writing / GPU 写入完成)
RF = Release Fence (Display done reading / 显示读取完成)
```

Without fences, each operation would block on the previous one. With fences, the producer can work ahead while the GPU and display process previous frames.

没有栅栏，每个操作都会阻塞前一个操作。有了栅栏，生产者可以提前工作，而 GPU 和显示器处理之前的帧。

---

## Part 6: Demo Project / 第六部分：演示项目

I've created a C++ simulation of BufferQueue that demonstrates all these concepts in action. The simulation models the complete state machine and fence synchronization.

我创建了一个 BufferQueue 的 C++ 模拟，演示了所有这些概念的实际应用。该模拟模拟了完整的状态机和栅栏同步。

### Demo Structure / 演示结构

```
BufferQueue/
├── bufferqueue.h      # Core BufferQueue implementation / 核心 BufferQueue 实现
├── bufferqueue.cpp    # Implementation details / 实现细节
├── demo1.cpp          # Basic producer-consumer flow / 基本生产者-消费者流程
├── demo2.cpp          # Async mode overflow / 异步模式溢出
├── demo3.cpp          # Synchronous mode blocking / 同步模式阻塞
├── demo4.cpp          # Fence synchronization / 栅栏同步
├── demo5.cpp          # Cancel buffer operation / 取消缓冲区操作
├── demo6.cpp          # Complete fence flow / 完整栅栏流程
└── CMakeLists.txt     # Build configuration / 构建配置
```

### Building and Running / 构建和运行

```bash
# Clone the repository / 克隆仓库
git clone https://gitcode.com/sunqizhen/BufferQueueDemo.git
cd BufferQueueDemo

# Build / 构建
mkdir -p build && cd build
cmake ..
make

# Run the demo / 运行演示
./bufferqueue_demo
```

### What Each Demo Shows / 每个演示展示的内容

| Demo / 演示 | Description / 描述 |
|-------------|-------------------|
| Demo 1 / 演示1 | Basic producer-consumer flow / 基本生产者-消费者流程 |
| Demo 2 / 演示2 | Async mode: dropping frames when queue is full / 异步模式：队列满时丢帧 |
| Demo 3 / 演示3 | Synchronous mode: producer blocks when queue is full / 同步模式：队列满时生产者阻塞 |
| Demo 4 / 演示4 | Fence synchronization between producer and consumer / 生产者和消费者之间的栅栏同步 |
| Demo 5 / 演示5 | Cancel buffer operation / 取消缓冲区操作 |
| Demo 6 / 演示6 | Complete fence flow with real async behavior / 具有真实异步行为的完整栅栏流程 |

### Sample Code: Basic Flow / 示例代码：基本流程

```cpp
// Create BufferQueue in async mode / 创建异步模式的 BufferQueue
BufferQueue bq(BufferQueue::Mode::ASYNC);

// Producer: Dequeue a buffer / 生产者：取出一个缓冲区
int slot, fence;
bq.dequeueBuffer(&slot, &fence);
void* buffer = bq.requestBuffer(slot);

// Fill buffer (e.g., render graphics) / 填充缓冲区（例如，渲染图形）
// ... fill buffer ...

// Create acquire fence (GPU work done) / 创建获取栅栏（GPU 工作完成）
auto acquireFence = std::make_shared<Fence>(Fence::Type::ACQUIRE_FENCE, "gpu_done");
acquireFence->signal();

// Queue buffer for consumer / 将缓冲区排队给消费者
bq.queueBuffer(slot, systemTime(), acquireFence);

// Consumer: Acquire buffer / 消费者：获取缓冲区
int acquiredSlot;
int64_t timestamp;
bq.acquireBuffer(&acquiredSlot, &timestamp);

// Process buffer (e.g., display frame) / 处理缓冲区（例如，显示帧）
// ... process buffer ...

// Create release fence (display work done) / 创建释放栅栏（显示工作完成）
auto releaseFence = std::make_shared<Fence>(Fence::Type::RELEASE_FENCE, "display_done");
releaseFence->signal();

// Release buffer back to pool / 将缓冲区释放回池中
bq.releaseBuffer(acquiredSlot, releaseFence);
```

### Full Source Code / 完整源代码

The complete implementation is available at:

完整实现可在以下位置获取：

**https://gitcode.com/sunqizhen/BufferQueueDemo**

Key files to explore:
- `bufferqueue.h` - Interface and state definitions / 接口和状态定义
- `bufferqueue.cpp` - Full implementation / 完整实现
- `demo6.cpp` - Complete fence synchronization example / 完整的栅栏同步示例

---

## Conclusion / 总结

BufferQueue is a beautifully designed component that enables efficient graphics data flow in Android. Its key innovations are:

BufferQueue 是一个设计精美的组件，实现了 Android 中高效的图形数据流。它的主要创新是：

1. **Slot-based buffer management** - Reuses memory efficiently / **基于槽位的缓冲区管理** - 高效重用内存
2. **Clear state machine** - Prevents ownership confusion / **清晰的状态机** - 防止所有权混乱
3. **Fence-based async** - Enables pipelining without complexity / **基于栅栏的异步** - 实现无复杂性的流水线
4. **Producer-consumer decoupling** - Flexible rate control / **生产者-消费者解耦** - 灵活的速率控制

Understanding BufferQueue helps you debug rendering issues, optimize graphics performance, and appreciate the elegance of Android's graphics architecture.

理解 BufferQueue 有助于你调试渲染问题、优化图形性能，并欣赏 Android 图形架构的优雅。

### Further Reading / 延伸阅读

- [Android Graphics Architecture](https://source.android.com/docs/core/graphics/architecture)
- [SurfaceFlinger Architecture](https://source.android.com/docs/core/graphics/surfaceflinger)
- [AIDL HAL Graphics APIs](https://source.android.com/docs/core/architecture/hidl/graphics)

---

**Demo Repository / 演示仓库：** https://gitcode.com/sunqizhen/BufferQueueDemo

Have questions about BufferQueue or the demo? Feel free to open an issue on the repository!

对 BufferQueue 或演示有疑问？欢迎在仓库上提出 issue！
