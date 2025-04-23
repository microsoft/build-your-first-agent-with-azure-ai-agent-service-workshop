# ソリューションアーキテクチャー

このワークショップでは、Contoso Sales Agent を作成します。これは、売上データに関する質問に回答し、グラフを生成し、さらに分析するためにデータファイルをダウンロードするように設計された対話型エージェントです。

## Agent App のコンポーネント

1.  **Microsoft Azure のサービス**

    この Agent は Microsoft Azure のサービス上に構築されています。

    * **生成 AI モデル**: このアプリを支える基盤となる LLM は、[Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#gpt-4o-and-gpt-4-turbo){:target="_blank"} LLM です。

    * **Vector Store*: Agent のクエリをサポートするために、製品情報を PDF ファイルとして提供します。エージェントは、[Azure AI Agent Service ファイル検索ツール](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/file-search?tabs=python&pivots=overview){:target="_blank"} の「基本エージェント設定」を使用して、ベクトル検索でドキュメントの関連部分を見つけ、それらをコンテキストとしてエージェントに提供します。

    * **コントロールプレーン**: アプリとそのアーキテクチャーコンポーネントは、ブラウザ経由でアクセス可能な [Azure AI Foundry](https://ai.azure.com){:target="_blank"} ポータルを使用して管理および監視されます。

2.  **Azure AI Foundry (SDK)**

    このワークショップは、Azure AI Foundry SDK を使用して [Python](https://learn.microsoft.com/python/api/overview/azure/ai-projects-readme?view=azure-python-preview&context=%2Fazure%2Fai-services%2Fagents%2Fcontext%2Fcontext){:target="_blank"} と [C#](https://learn.microsoft.com/en-us/dotnet/api/overview/azure/ai.projects-readme?view=azure-dotnet-preview&viewFallbackFrom=azure-python-preview){:target="_blank"} の両方で提供されます。SDK は、[コードインタープリター](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/code-interpreter?view=azure-python-preview&tabs=python&pivots=overview){:target="_blank"} や [関数呼び出し](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/function-calling?view=azure-python-preview&tabs=python&pivots=overview){:target="_blank"} など、Azure AI Agents サービスの主要な機能をサポートします。

3.  **データベース**

    アプリは、40,000 行の合成データを含む [SQLite データベース](https://www.sqlite.org/){:target="_blank"} である Contoso Sales Database から情報を得ます。起動時に、エージェントアプリは売上データベースのスキーマ、製品カテゴリ、製品タイプ、レポート年を読み取り、このメタデータを Azure AI Agent Service の指示コンテキストに組み込みます。

## ワークショップソリューションの拡張

ワークショップソリューションは、データベースを変更し、特定のユースケースに合わせて Azure AI Agent Service の指示を調整することで、カスタマーサポートなどのさまざまなシナリオに高度に適応できます。意図的にインターフェースに依存しないように設計されており、AI Agent Service のコア機能に集中し、基本的な概念を適用して独自の対話型エージェントを構築できます。

## アプリで示されるベストプラクティス

このアプリは、効率性とユーザーエクスペリエンスに関するいくつかのベストプラクティスも示しています。

* **非同期 API**:
    ワークショップのサンプルでは、Azure AI Agent Service と SQLite の両方で非同期 API を使用しており、リソース効率とスケーラビリティを最適化しています。この設計上の選択は、FastAPI、ASP.NET、Chainlit、Streamlit などの非同期 Web フレームワークを使用してアプリケーションをデプロイする場合に特に有利になります。

* **トークンストリーミング**:
    トークンストリーミングは、LLM を搭載したエージェントアプリの体感的な応答時間を短縮することにより、ユーザーエクスペリエンスを向上させるために実装されています。