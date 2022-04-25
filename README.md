# splatoon-notion

![Demo](https://user-images.githubusercontent.com/91340399/165035050-f2f67d16-780d-47d8-911a-40c476f39442.jpg)

Splatoon2 のバトルやサーモンランのデータを自動で Notion に保存する Google App Script です。

## Usage

このスクリプトでは[イカリング 2](https://www.nintendo.co.jp/switch/aab6a/online/index.html)の API を利用しています。この API の利用は推奨されていないため利用は自己責任でお願いします。

### iksm_session

API へのアクセスを行うため iksm_session と呼ばれるトークンを取得します。

このトークンはプロキシツールで[Nintendo Switch Online](https://www.nintendo.co.jp/hardware/switch/onlineservice/app/)の通信内容を表示したり[iksm-chan](https://iksm.vercel.app/)と呼ばれるウェブアプリを利用することで取得できます。

### ページの複製とデータベース id の取得

以下のページを Notion 上で複製しバトル、サーモンラン、ルール、ステージ、ゲームモード、ブキ、サブウェポン、スペシャル、ギア、ブランド、ギアパワーの各データベースの id を取得します。

https://yutakobayashi.notion.site/Splatoon2-c8ef1d1a5c4840dda1342aac4d9ed03d

### プロパティの設定

- `"iksm_session": your iksm_session token`
- `"notionToken": your Notion integration token`
- `"battle_database": your Notion Battle Database id`
- `"salmon_run_database": your Notion Salmon Run Database id`
- `"rule_database": your Notion Rule Database id`
- `"mode_database": your Notion Game Mode Database id`
- `"stage_database": your Notion Stage Database id`
- `"weapon_database": your Notion Weapon Database id`
- `"subweapon_database": your Notion Sub Weapon Database id`
- `"specialweapon_database": your Notion Special Weapon Database id`
- `"gear_database": your Notion Special Gear Database id`
- `"discordWebHookURL": your Discord Webhook URL`

### 定期実行

main 関数を定期実行することで自動で Notion にデータを保存することができます。イカリング 2 の API の使用上過去 50 件のバトルデータのみしか取得できないためデータが消えてしまう前に実行するといいでしょう。

## TODO

- ffmpeg と numpy と YouTube Data API の連携
- カバー画像を share/results/{}から取得するように変更
