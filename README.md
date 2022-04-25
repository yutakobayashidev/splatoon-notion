# splatoon-notion

Splatoon2 のバトルやサーモンランのデータを自動で Notion に保存する Google App Script です。

## Usage

このスクリプトでは[イカリング 2](https://www.nintendo.co.jp/switch/aab6a/online/index.html)の API を利用しています。この API の利用は推奨されていないため利用は自己責任でお願いします。

### iksm_session

API へのアクセスを行うため iksm_session と呼ばれるトークンを取得します。

このトークンはプロキシツールで[Nintendo Switch Online](https://www.nintendo.co.jp/hardware/switch/onlineservice/app/)の通信内容を表示したり[iksm-chan](https://iksm.vercel.app/)と呼ばれるウェブアプリを利用することで取得できます。

### データベースの複製とデータベース id の取得

以下のページを Notion 上で複製しバトル、サーモンラン、ルール、ステージ、ゲームモード、ブキ、サブウェポン、スペシャル、ギア、ブランド、ギアパワーの各データベースの id を取得します。

https://yutakobayashi.notion.site/Splatoon2-c8ef1d1a5c4840dda1342aac4d9ed03d

### 定期実行

main 関数を定期実行することで自動で Notion にデータを保存することができます。イカリング 2 の API の使用上過去 50 件のバトルデータのみしか取得できないためデータが消えてしまう前に実行するといいでしょう。

## TODO

- ffmpeg と numpy と YouTube Data API の連携
- カバー画像を share/results/{}から取得するように変更
