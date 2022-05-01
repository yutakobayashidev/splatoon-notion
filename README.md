# splatoon-notion

![Demo](https://user-images.githubusercontent.com/91340399/165035050-f2f67d16-780d-47d8-911a-40c476f39442.jpg)

Splatoon2 のバトルやサーモンランのデータを自動で Notion に保存する Google App Script です。

## DEMO

https://yutakobayashi.notion.site/Splatoon2-d66a5ae5905f4fc8b14636e138c4cc87

## Usage

このスクリプトでは[イカリング 2](https://www.nintendo.co.jp/switch/aab6a/online/index.html)の API を利用しています。この API の利用は推奨されていないため利用は自己責任でお願いします。

### iksm_session

API へのアクセスを行うため iksm_session と呼ばれるトークンを取得します。

このトークンはプロキシツールで[Nintendo Switch Online](https://www.nintendo.co.jp/hardware/switch/onlineservice/app/)の通信内容を表示したり[iksm-chan](https://iksm.vercel.app/)と呼ばれるウェブアプリを利用することで取得できます。

### ページの複製とデータベース id の取得

以下のページを Notion 上で複製しバトル、サーモンラン、ルール、ステージ、ゲームモード、ブキ、サブウェポン、スペシャル、ギア、ブランドの各データベースの id を取得します。

https://yutakobayashi.notion.site/Splatoon2-cc3b04c2ac22476fb5e189275e261247

### プロパティの設定

Google Apps Script のクラシックエディターなどでプロパティを以下のように設定します。

- `"iksm_session": your iksm_session token`
- `"notionToken": your Notion integration token`
- `"battle_database": your Notion Battle Database id`
- `"salmon_run_database": your Notion Salmon Run Database id`
- `"mode_database": your Notion Game Mode Database id`
- `"rule_database": your Notion Rule Database id`
- `"stage_database": your Notion Stage Database id`
- `"weapon_database": your Notion Weapon Database id`
- `"subweapon_database": your Notion Sub Weapon Database id`
- `"specialweapon_database": your Notion Special Weapon Database id`
- `"gear_database": your Notion Gear Database id`
- `"brand_database": your Notion Brand Database id`
- `"discordWebHookURL": your Discord Webhook URL`

### 定期実行

main 関数を定期実行することで自動で Notion にバトル履歴、サーモラン、使用したブキやギア、プレイしたステージなどのデータが自動的に作成されます。イカリング 2 の API の仕様上過去 50 件のバトルデータのみしか取得できないためデータが消えてしまう前に実行するといいでしょう。

## TODO

- ffmpeg と numpy と YouTube Data API の連携
