const props = PropertiesService.getScriptProperties()

const iksm_session = props.getProperty('iksm_session')
const notionToken = props.getProperty('notionToken')
const battle_database = props.getProperty('battle_database')
const salmon_run_database = props.getProperty('salmon_run_database')
const mode_database = props.getProperty('mode_database')
const rule_database = props.getProperty('rule_database')
const stage_database = props.getProperty('stage_database')
const weapon_database = props.getProperty('weapon_database')
const subweapon_database = props.getProperty('subweapon_database')
const specialweapon_database = props.getProperty('specialweapon_database')
const gear_database = props.getProperty('gear_database')
const brand_database = props.getProperty('brand_database')
const discordWebHookURL = props.getProperty('discordWebHookURL')

const USER_LANG = "ja-jp";
const TIMEZONE_OFFSET = "-540";

function main() {

  isValidIksmSession()

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

  let salmon_run = getSalmonRun();

  let page1 = getPages1()

  let latest_battle1 = page1[0] ? page1[0].properties.job_id.number : 0;

  // サーモンランの保存

  for (coop of salmon_run) {

    if (coop.job_id <= latest_battle1) continue;

    let = coopnotion = createCoopNotionPage(coop)

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
  let res = splatnetAPI(endpoint);

  let results = res.results;

  return results.sort(function (a, b) {
    return (a.battle_number < b.battle_number) ? -1 : 1;  //オブジェクトの昇順ソート
  });
}


function getSalmonRun() {
  let endpoint = `/coop_results`;
  let res = splatnetAPI(endpoint);

  let results = res.results;

  return results;
}


function getBattle(result) {

  let endpoint = `/results/${result.battle_number}`

  let res = splatnetAPI(endpoint)

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
      "property": "Name",
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
      "property": "Name",
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

  if (Object.keys(res.results).length === 0) {
    console.log(battle.stage.name + "のページがないため作成します");

    const id = Number(battle.stage.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: stage_database,
      },
      "cover": {
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
                content: battle.stage.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;


}

function getcoopstage(coop) {
  let endpoint = `/databases/${stage_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": coop.schedule.stage.name
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
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.weapon.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
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
        "Name": {
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
              "id": special.id
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
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.weapon.sub.name
      }
    },
    page_size: 50,
  };

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.weapon.sub.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.weapon.sub.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: subweapon_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.weapon.sub.image_a
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.weapon.sub.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getheadbrand(battle) {

  let endpoint = `/databases/${brand_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.head.brand.name
      }
    },
    page_size: 50,
  };

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.head.brand.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.head.brand.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: brand_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.head.brand.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.head.brand.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getClothesbrand(battle) {

  let endpoint = `/databases/${brand_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.clothes.brand.name
      }
    },
    page_size: 50,
  };

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.clothes.brand.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.clothes.brand.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: brand_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.clothes.brand.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.clothes.brand.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getShoesbrand(battle) {

  let endpoint = `/databases/${brand_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.shoes.brand.name
      }
    },
    page_size: 50,
  };

  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.shoes.brand.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.shoes.brand.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: brand_database,
      },
      icon: {
        type: "external",
        external: {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.shoes.brand.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.shoes.brand.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getHead(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.head.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];


  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.head.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.head.id);
    let brand = getheadbrand(battle)

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: gear_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.head.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.head.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
        "kind": {
          "select": {
            "name": "アタマ"
          }
        },
        "brand": {
          "relation": [
            {
              "id": brand.id
            }
          ]
        }
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getClothes(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.clothes.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.clothes.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.clothes.id);

    let brand = getClothesbrand(battle)

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: gear_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.clothes.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.clothes.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
        "brand": {
          "relation": [
            {
              "id": brand.id
            }
          ]
        },
        "kind": {
          "select": {
            "name": "フク"
          }
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getShoes(battle) {
  let endpoint = `/databases/${gear_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.shoes.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.shoes.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.shoes.id);
    let brand = getClothesbrand(battle)

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: gear_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.shoes.image
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.shoes.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
        "kind": {
          "select": {
            "name": "クツ"
          }
        },
        "brand": {
          "relation": [
            {
              "id": brand.id
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

function getspecialweapon(battle) {
  let endpoint = `/databases/${specialweapon_database}/query`;

  let payload = {
    filter: {
      "property": "Name",
      "title": {
        "equals": battle.player_result.player.weapon.special.name
      }
    },
    page_size: 50,
  };
  let res = notionAPI(endpoint, "POST", payload);
  if (isError(res)) return [];

  let pages = res.results[0];

  if (Object.keys(res.results).length === 0) {
    console.log(battle.player_result.player.weapon.special.name + "のページがないため作成します");

    const id = Number(battle.player_result.player.weapon.special.id);

    let endpoint = "/pages"

    let payload = {
      parent: {
        database_id: specialweapon_database,
      },
      "icon": {
        "type": "external",
        "external": {
          "url": "https://app.splatoon2.nintendo.net" + battle.player_result.player.weapon.special.image_a
        }
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: battle.player_result.player.weapon.special.name
              },
            },
          ],
        },
        "id": {
          "number": id
        },
      }
    };

    let pages = notionAPI(endpoint, "POST", payload);

    return pages;

  }

  return pages;
}

function getimage(battle) {

  let endpoint = `/share/results/${battle.battle_number}`

  let res = splatnetAPI(endpoint, "POST");

  return res
}

function getnickname_and_icon(battle) {

  let endpoint = `/nickname_and_icon?id=${battle.player_result.player.principal_id}`;

  let res = splatnetAPI(endpoint);

  return res.nickname_and_icons[0]

}

function createNotionPage(battle) {

  const battle_number = Number(battle.battle_number);

  let endpoint = "/pages"

  let rule = getRule(battle)
  let mode = getMode(battle)
  let stage = getstage(battle)
  let weapon = getweapon(battle)
  let head = getHead(battle)
  let clothes = getClothes(battle)
  let shoes = getShoes(battle)

  let user = getnickname_and_icon(battle)

  let image = getimage(battle)

  const time = new Date(battle.start_time * 1000)
  time.setHours(time.getHours() + 9);

  const isodate = time.toISOString();

  const payload = {
    parent: {
      database_id: battle_database,
    },
    icon: {
      "type": "external",
      "external": {
        "url": user.thumbnail_url
      }
    },
    cover: {
      "type": "external",
      "external": {
        "url": image.url
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
      "tag_id": {
        "select": battle.tag_id === undefined ? null : { name: battle.tag_id },
      },
      "WIN!": {
        "checkbox": battle.my_team_result.name === 'WIN!' ? true : false
      },
      "type": {
        "select": battle.game_mode.key === "league_pair" ? { name: "ペア" } : battle.game_mode.key === "league_team" ? { name: "チーム" } : null
      },
      "udemae": {
        "select": battle.udemae === undefined ? null : battle.udemae.s_plus_number === battle.udemae.s_plus_number ? { name: battle.udemae.name + + battle.udemae.s_plus_number } : { name: battle.udemae.name }
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
            "id": head.id
          }
        ]
      },
      "フク": {
        "relation": [
          {
            "id": clothes.id
          }
        ]
      },
      "クツ": {
        "relation": [
          {
            "id": shoes.id
          }
        ]
      },
      "principal_id": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": battle.player_result.player.principal_id
            }
          },
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
      "max_league_point": {
        "number": battle.max_league_point != null && battle.max_league_point > 0 ? battle.max_league_point : null
      },
      "x_power": {
        "number": battle.x_power === undefined ? null : battle.x_power
      },
      "my_estimate_league_point": {
        "number": battle.my_estimate_league_point === undefined ? null : battle.my_estimate_league_point
      },
      "other_estimate_league_point": {
        "number": battle.other_estimate_league_point === undefined ? null : battle.other_estimate_league_point
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
      "start_time": {
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

function createCoopNotionPage(coop) {

  let endpoint = "/pages"

  let stage = getcoopstage(coop)

  const play_time = new Date(coop.play_time * 1000)
  play_time.setHours(play_time.getHours() + 9);

  const isodate = play_time.toISOString();

  const payload = {
    parent: {
      database_id: salmon_run_database,
    },
    cover: {
      "type": "external",
      "external": {
        "url": "https://app.splatoon2.nintendo.net" + coop.schedule.stage.image
      }
    },
    properties: {
      "Name": {
        title: [
          {
            text: {
              content: coop.job_result.is_clear === false ? "失敗" + ` (Wave ${coop.job_result.failure_wave})` + " @" + coop.schedule.stage.name : "クリア!" + " @" + coop.schedule.stage.name
            },
          },
        ],
      },
      "is_clear": {
        "checkbox": coop.job_result.is_clear
      },
      start_time: {
        date: {
          start: isodate,
          time_zone: "Asia/Tokyo",
        }
      },
      "failure_wave": {
        "number": coop.job_result.failure_wave
      },
      "job_id": {
        "number": coop.job_id
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


function splatnetAPI(endpoint, method) {

  let api = "https://app.splatoon2.nintendo.net/api" + endpoint;
  let headers = {
    'Cookie': 'iksm_session=' + iksm_session,
    'contentType': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept-Language': USER_LANG,
    "x-timezone-offset": TIMEZONE_OFFSET,
  };

  let res = UrlFetchApp.fetch(
    api,
    {
      headers: headers,
      method: method == undefined ? "GET" : method,
    },
  );


  let json = JSON.parse(res.getContentText());

  return json
}

function isValidIksmSession() {

  let endpoint = "/results"

  try {
    splatnetAPI(endpoint)
    Logger.log('✅ iksm_session Succes!');
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