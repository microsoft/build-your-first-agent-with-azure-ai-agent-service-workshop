# Azure AI Foundry でコードファーストエージェントを構築する

## 75分間のインタラクティブワークショップ

あなたはアウトドア用品を販売する多国籍小売企業 Contoso の営業マネージャーだと想像してください。あなたは販売データを分析し、トレンドを見つけ、顧客の好みを理解し、情報に基づいたビジネス上の意思決定を行う必要があります。あなたを支援するために、Contoso はあなたの販売データに関する質問に答えられる対話型エージェントを開発しました。

![Contoso Sales Analysis Agent](media/persona.png)

## LLM 搭載 AI エージェントとは？

大規模言語モデル（LLM）搭載AIエージェントは、あらかじめ定義された手順やプロセスを必要とせず、与えられた目標を達成するように設計された半自律型ソフトウェアです。明示的にプログラムされた指示に従うのではなく、エージェントは指示とコンテキストを使用してタスクをどのように達成するかを決定します。

例えば、ユーザーが「**地域別の合計売上を円グラフで表示して**」と尋ねた場合、アプリケーションはこの要求に対して事前定義されたロジックに依存しません。代わりに、LLMが要求を解釈し、会話の流れとコンテキストを管理し、地域別売上の円グラフを作成するために必要なアクションを編成します。

開発者がビジネスプロセスをサポートするためのロジックやワークフローを定義する従来のアプリケーションとは異なり、AIエージェントはこの責任をLLMに委ねます。これらのシステムでは、プロンプトエンジニアリング、明確な指示、およびツール開発が、アプリケーションが意図したとおりに機能することを保証するために不可欠です。

## Azure AI Agent Serviceとは？

現在パブリックプレビュー版であるAzure AI Agent Serviceは、[Python](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-python-azure){:target="_blank"} および [C#](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-csharp){:target="_blank"} 用のSDKを備えたフルマネージドクラウドサービスを提供します。AIエージェント開発を簡素化し、関数呼び出しのような複雑なタスクをわずか数行のコードに削減します。

!!! info
    関数呼び出しを使用すると、LLMを外部ツールやシステムに接続できます。これは、AIエージェントに機能を持たせたり、アプリケーションとLLM間の深い統合を構築したりするなど、多くのことに役立ちます。

Azure AI Agent Serviceは、従来のAIエージェントプラットフォームと比較して、いくつかの利点があります。

- **迅速なデプロイ**: 高速デプロイ向けに最適化されたSDKにより、開発者はエージェント構築に集中できます。
- **スケーラビリティ**: パフォーマンスの問題なく、さまざまなユーザー負荷を処理できるように設計されています。
- **カスタム統合**: エージェントの機能を拡張するための関数呼び出しをサポートします。
- **組み込みツール**: Fabric、SharePoint、Azure AI Search、Azure Storage が含まれており、迅速な開発が可能です。
- **RAGスタイル検索**: ファイルおよびセマンティック検索を効率化するための組み込みベクトルストアを備えています。
- **会話状態管理**: 複数のやり取りにわたってコンテキストを維持します。
- **AIモデル互換性**: さまざまなAIモデルに対応しています。

Azure AI Agent Service の詳細については、[Azure AI Agent Service ドキュメント](https://learn.microsoft.com/azure/ai-services/agents/overview){:target="_blank"} を参照してください。

## AI Agent フレームワーク

一般的な AI Agent フレームワークには、LangChain、Semantic Kernel、CrewAI があります。Azure AI Agent Service を特徴づけているのは、そのシームレスな統合機能と迅速なデプロイに最適化されたSDKです。複雑なマルチエージェントシナリオでは、Semantic Kernel や AutoGen のようなSDKとAzure AI Agent Serviceを組み合わせて、堅牢でスケーラブルなシステムを構築するソリューションが登場するでしょう。