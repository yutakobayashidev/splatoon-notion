const props = PropertiesService.getScriptProperties()

const IKSM_SESSION = props.getProperty('IKSM_SESSION')
const notionToken = props.getProperty('notionToken')
const battle_database = props.getProperty('battle_database')
const rule_database = props.getProperty('rule_database')
const mode_database = props.getProperty('mode_database')
const stage_database = props.getProperty('stage_database')
const weapon_database = props.getProperty('weapon_database')
const specialweapon_database = props.getProperty('specialweapon_database')
const gear_database = props.getProperty('gear_database')
const subweapon_database = props.getProperty('subweapon_database')
const salmon_run_database = props.getProperty('salmon_run_database')
const discordWebHookURL = props.getProperty('discordWebHookURL')

function main() {

  valid = isValidIksmSession()

  let updateCount = 0;

  let results = getResults();

  let page = getPages()

  let latest_battle = page[0] ? page[0].properties.battle_number.number : 0;

  // バトル履歴の保存

  for (result of results) {

    if (result.battle_number <= latest_battle) continue;

    let battle = getBattle(result)

    let notion = createNotionPage(battle)

    if (notion) updateCount++;

    console.log(`create ${updateCount} page.`)

  }

  let coop = getCoop();

  let page1 = getPages1()

  let latest_battle1 = page1[0] ? page1[0].properties.job_id.number : 0;

  // サーモンランの保存

  for (coo of coop) {

    if (coo.job_id <= latest_battle1) continue;

    let = coopnotion = createCoopNotionPage(coo)

    if (coopnotion) updateCount++;

    console.log(`create ${updateCount} page.`)

  }

}

function postDiscord(updateCount) {

  // 投稿するチャット内容と設定
  const message = {
    "content": `${updateCount}件のバトルデータが保存されました。`, // チャット本文
    "tts": false  // ロボットによる読み上げ機能を無効化
  }

  const param = {
    "method": "POST",
    "headers": { 'Content-type': "application/json" },
    "payload": JSON.stringify(message)
  }

  UrlFetchApp.fetch(discordWebHookURL, param);
}

function getResults() {
  let endpoint = `/results`;
  let res = splatoonAPI(endpoint);

  let results = res.results;

  return results;
}


function getCoop() {
  let endpoint = `/coop_results`;
  let res = splatoonAPI(endpoint);

  let results = res.results;

  return results;
}


function getBattle(result) {

  let endpoint = `/results/${result.battle_number}`

  let res = splatoonAPI(endpoint)

  let results = res;

  return results;
}

function getPages() {
  let endpoint = `/databases/${battle_database}/query`;

  let payload = {
    "sorts": [
      {
        "property": "battle_number",
        "direction": "descending"
      },
    ],
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;

  return pages;
}

function getPages1() {
  let endpoint = `/databases/${salmon_run_database}/query`;

  let payload = {
    "sorts": [
      {
        "property": "job_id",
        "direction": "descending"
      },
    ],
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;

  return pages;
}

function getRule(battle) {
  let endpoint = `/databases/${rule_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.rule.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getMode(battle) {
  let endpoint = `/databases/${mode_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.game_mode.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getstage(battle) {
  let endpoint = `/databases/${stage_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.stage.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  return pages;


}

function getcoopstage(coo) {
  let endpoint = `/databases/${stage_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": coo.schedule.stage.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getweapon(battle) {

  let endpoint = `/databases/${weapon_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.weapon.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (res.results === 0) {
    console.log(battle.player_result.player.weapon.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.weapon.id);

    let sub = getsubweapon(battle)

    let special = getspecialweapon(battle)

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: weapon_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.weapon.image
        }
      },
      properties: {
        名前: {
          title: [
            {
              text: {
                content: battle.player_result.player.weapon.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
        "サブウェポン": {
          "relation": [
            {
              "id": sub.id
            }
          ]
        },
        "スペシャル": {
          "relation": [
            {
              "id": special[0].id
            }
          ]
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}


function getsubweapon(battle) {

  let endpoint = `/databases/${subweapon_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.weapon.sub.name
      }
    },
    page_size: 50,
  };

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  return pages;
}

function getHead(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.head.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getClothes(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.clothes.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getShoes(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.shoes.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function getspecialweapon(battle) {
  let endpoint = `/databases/${specialweapon_database}/query`;

  let payload = {
    filter: {
      "property": "名前",
      "title": {
        "equals": battle.player_result.player.weapon.special.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results;
  return pages;
}

function createCoopNotionPage(coo) {

  let endpoint = "/pages"

  let stage = getcoopstage(coo)

  const play_time = new Date(coo.play_time * 1000)
  play_time.setHours(play_time.getHours() + 9);

  const isodate = play_time.toISOString();

  const payload = {
    parent: {
      database_id: salmon_run_database,
    },
    cover: {
      "type": "external",
      "external": {
        "url": "https://app.splatoon2.nintendo.net" + coo.schedule.stage.image
      }
    },
    properties: {
      名前: {
        title: [
          {
            text: {
              content: coo.job_result.is_clear === false ? "失敗" + ` (Wave ${coo.job_result.failure_wave})` + " @" + coo.schedule.stage.name : "クリア!" + " @" + coo.schedule.stage.name
            },
          },
        ],
      },
      "is_clear": {
        "checkbox": coo.job_result.is_clear
      },
      start_time: {
        date: {
          start: isodate,
          time_zone: "Asia/Tokyo",
        }
      },
      "failure_wave": {
        "number": coo.job_result.failure_wave
      },
      "job_id": {
        "number": coo.job_id
      },
      ステージ: {
        "relation": [
          {
            "id": stage[0].id
          }
        ]
      }
    },
  }

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return false;

  return true;

}


function createNotionPage(battle) {

  const battle_number = Number(battle.battle_number);

  let endpoint = "/pages"

  let rule = getRule(battle)
  let mode = getMode(battle)
  let stage = getstage(battle)
  let head = getHead(battle)
  let weapon = getweapon(battle)
  let clothes = getClothes(battle)
  let shoes = getShoes(battle)

  const time = new Date(battle.start_time * 1000)
  time.setHours(time.getHours() + 9);

  const isodate = time.toISOString();

  const payload = {
    parent: {
      database_id: battle_database,
    },
    cover: {
      "type": "external",
      "external": {
        "url": "https://app.splatoon2.nintendo.net" + battle.stage.image
      }
    },
    properties: {
      "Name": {
        title: [
          {
            text: {
              content: battle.my_team_result.name + " @" + battle.stage.name,
            },
          },
        ],
      },
      "WIN!": {
        "checkbox": battle.my_team_result.name === 'WIN!' ? true : false
      },
      "udemae": {
        "select": {
          "name": battle.udemae === undefined ? "null" : battle.udemae.name + battle.udemae.s_plus_number
        }
      },
      "battle_stage": {
        "relation": [
          {
            "id": stage.id
          }
        ]
      },
      "rule": {
        "relation": [
          {
            "id": rule[0].id
          }
        ]
      },
      "game_mode": {
        "relation": [
          {
            "id": mode[0].id
          }
        ]
      },
      "アタマ": {
        "relation": [
          {
            "id": head[0].id
          }
        ]
      },
      "フク": {
        "relation": [
          {
            "id": clothes[0].id
          }
        ]
      },
      "クツ": {
        "relation": [
          {
            "id": shoes[0].id
          }
        ]
      },
      "weapon": {
        "relation": [
          {
            "id": weapon.id
          }
        ]
      },
      "player_rank": {
        "number": battle.player_rank
      },
      "battle_number": {
        "number": battle_number
      },
      "estimate_gachi_power": {
        "number": battle.estimate_gachi_power === undefined ? null : battle.estimate_gachi_power
      },
      "x_power": {
        "number": battle.x_power === undefined ? null : battle.x_power
      },
      "assist_count": {
        "number": battle.player_result.assist_count
      },
      "star_rank": {
        "number": battle.star_rank
      },
      "kill_count": {
        "number": battle.player_result.kill_count
      },
      "death_count": {
        "number": battle.player_result.death_count
      },
      "game_paint_point": {
        "number": battle.player_result.game_paint_point
      },
      "special_count": {
        "number": battle.player_result.special_count
      },
      start_time: {
        date: {
          start: isodate,
          time_zone: "Asia/Tokyo",
        }
      },
    },
  }

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return false;

  return true;
}

function splatoonAPI(endpoint) {

  let api = "https://app.splatoon2.nintendo.net/api" + endpoint;

  var headers = { 'headers': { 'Cookie': 'iksm_session=' + IKSM_SESSION }, 'contentType': 'application/json' };

  let res = UrlFetchApp.fetch(
    api, headers
  );

  let json = JSON.parse(res.getContentText());

  return json
}

function isValidIksmSession() {
  var getOptions = { 'headers': { 'Cookie': 'iksm_session=' + IKSM_SESSION }, 'contentType': 'application/json' };
  try {
    UrlFetchApp.fetch('https://app.splatoon2.nintendo.net/api/results', getOptions);
    Logger.log('✅ IKSM_SESSION Succes!');
  } catch (e) {
    Logger.log(e);
  }
}

function notionAPI(endpoint, method, payload) {
  let api = "https://api.notion.com/v1" + endpoint;
  let headers = {
    "Authorization": "Bearer " + notionToken,
    "Content-Type": method == undefined ? null : "application/json",
    "Notion-Version": "2021-08-16"
  };

  let res = UrlFetchApp.fetch(
    api,
    {
      headers: headers,
      method: method == undefined ? "GET" : method,
      payload: payload == undefined ? null : JSON.stringify(payload),
      "muteHttpExceptions": true,
    },
  );

  let json = JSON.parse(res.getContentText());


  return json;
}

function isError(res) {
  if (res.object != "error") return false;

  console.error(res);
  return true;
}