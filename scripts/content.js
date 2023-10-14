console.log("Content script loaded.");

class GooMorphologicalAnalysis {
  constructor() {}

  static init = () => {
    chrome.storage.local.get(["goo_api_key"]).then((result) => {
      if (!result.goo_api_key) {
        const goo_api_key = prompt(
          "Please enter your Goo API key. You can get it from https://labs.goo.ne.jp/apiusage/"
        );
        if (goo_api_key) {
          chrome.storage.local.set({ goo_api_key: goo_api_key }, function () {
            console.log("Goo API key saved: ", goo_api_key);
          });
        }
      }
    });
  };

  static _url = "https://labs.goo.ne.jp/api/morph";

  static async analyze(id, text) {
    const res = await chrome.storage.local.get(["goo_api_key"]);
    const app_id = res.goo_api_key;
    const response = await fetch(GooMorphologicalAnalysis._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: app_id,
        sentence: text,
      }),
    });
    const json = await response.json();
    console.log("Response from Goo M.A. API: ", json);
    return json;
  }
}

const PosCodes = {
  名詞: "noun",
  名詞接尾辞: "noun_suffix",
  冠名詞: "pre_noun",
  英語接尾辞: "english_suffix",
  動詞語幹: "verb_stem",
  動詞活用語尾: "verb_conjugation_suffix",
  動詞接尾辞: "verb_suffix",
  冠動詞: "pre_verb",
  補助名詞: "auxiliary_noun",
  形容詞語幹: "adjective_stem",
  形容詞接尾辞: "adjective_suffix",
  冠形容詞: "pre_adjective",
  連体詞: "adnominal",
  連用詞: "adverbial",
  接続詞: "conjunction",
  独立詞: "interjection",
  接続接尾辞: "connective_suffix",
  判定詞: "predicate",
  格助詞: "case_particle",
  引用助詞: "quotation_particle",
  連用助詞: "continuative_particle",
  終助詞: "final_particle",
  間投詞: "parenthesis",
  括弧: "parentheses",
  句点: "period",
  読点: "comma",
  空白: "whitespace",
  Symbol: "symbol",
  Month: "month",
  Day: "day",
  YearMonth: "year_month",
  MonthDay: "month_day",
  Hour: "hour",
  Minute: "minute",
  Second: "second",
  HourMinute: "hour_minute",
  MinuteSecond: "minute_second",
  PreHour: "pre_hour",
  PostHour: "post_hour",
  Number: "number",
  助数詞: "counter",
  助助数詞: "auxiliary_counter",
  冠数詞: "pre_counter",
  Alphabet: "alphabet",
  Kana: "hiragana",
  Katakana: "katakana",
  Kanji: "kanji",
  Roman: "romanized",
  Undef: "undefined",
};

function kata_to_hira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function toPosCode(key) {
  if (key in PosCodes) {
    return PosCodes[key];
  }
  return "undefined";
}

function combineArrInArr(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

GooMorphologicalAnalysis.init();

document.getElementById("novel_honbun").childNodes.forEach((node) => {
  /* add event listener to each node, listen to tap events for each node (consider mobile capatitibility) */
  node.addEventListener("click", (event) => {
    /* get the text of the node */
    const text = event.target.textContent;
    const id = event.target.id;
    console.log(id);
    /* analyze the text */
    GooMorphologicalAnalysis.analyze(id, text).then((json) => {
      const targetElement = document.getElementById(id);
      if (targetElement) {
        targetElement.innerHTML = combineArrInArr(json.word_list)
          .map(([word, pos, katareading]) => {
            const posCode = toPosCode(pos);
            const reading = kata_to_hira(katareading);
            return `<ruby class="ruby ${posCode}"><rb>${word}</rb><rp>(</rp><rt>${reading}</rt><rp>)</rp></ruby>`;
          })
          .join("");
      }
    });
  });
});
