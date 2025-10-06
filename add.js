/**
 * 共通人物追加関数
 * 兄弟姉妹・配偶者・子供・孫など、任意の人物入力欄を動的に追加する。
 *
 * @param {string} prefix       IDのプレフィックス（例: "B", "LB", "C", "CS", "C1C" など）
 *                              - B   = 本人の兄弟姉妹
 *                              - LB  = 配偶者の兄弟姉妹
 *                              - C   = 本人の子供（C1, C2 ...）
 *                              - CS  = 子供の配偶者（CS1, CS2 ...）
 *                              - C1C = 長子の子（孫）(C1C1, C1C2 ...)
 *
 * @param {string} containerId  人物を追加する親要素のid
 *                              例: "siblings-container-self", "children-container" など
 *
 * @param {string} labelPrefix  ラベル表示に使う文字列
 *                              例: "兄弟姉妹", "配偶者の兄弟姉妹", "子", "孫"
 *
 * @param {boolean} isDetails   true にすると <details> タグで囲んで追加する（子供・孫用）
 *                              false の場合は <div> で追加する（兄弟姉妹・配偶者兄弟姉妹用）
 *
 * 使用例:
 *   // 本人の兄弟姉妹を追加
 *   addPerson("B", "siblings-container-self", "兄弟姉妹");
 *
 *   // 配偶者の兄弟姉妹を追加
 *   addPerson("LB", "siblings-container-spouse", "配偶者の兄弟姉妹");
 *
 *   // 本人の子供を追加（<details>で表示）
 *   addPerson("C", "children-container", "子", true);
 *
 *   // 長子の配偶者を追加
 *   addPerson("CS", "child1-container", "配偶者");
 *
 *   // 長子の孫を追加
 *   addPerson("C1C", "grandchildren-container", "孫", true);
 */

// 各prefixごとの人数カウント
let counters = {};

// 人追加
function addPerson(prefix, containerId, labelPrefix, isDetails = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("追加先が見つかりません:", containerId);
    return;
  }

  // 現在の人数を取得
  const persons = container.querySelectorAll(
    isDetails ? "details.generation" : ".person-input"
  );
  let count = persons.length + 1;

  // 人数上限チェック
  const MAX_COUNT = 5;

  if (prefix === "C") {
    // 長子（C1）が固定で存在するためC2スタート
    count += 1;
    if (count > MAX_COUNT) {
      alert("子供は最大10名まで追加できます。");
      return;
    }
  } else if (prefix === "B" || prefix === "LB") {
    if (count > MAX_COUNT) {
      alert(labelPrefix + "は最大10名まで追加できます。");
      return;
    }
  }

  // カウント更新
  counters[prefix] = count;

  // 子ども世代などは details で囲む
  const wrapper = document.createElement(isDetails ? "details" : "div");
  wrapper.className = "person-input";
  wrapper.id = `${prefix}${count}-container`;

  if (isDetails) {
    wrapper.open = true;
    wrapper.classList.add("generation");
    wrapper.innerHTML = `<summary><h4>${labelPrefix}${count}</h4></summary>`;
  }

  const content = document.createElement("div");
  content.innerHTML = `
    <button type="button" class="remove-btn" onclick="removePerson('${prefix}', ${count}, '${containerId}', ${isDetails}, '${labelPrefix}')">削除</button>
    <div>
      <label>${labelPrefix}${count} 名前</label>
      <input type="text" id="${prefix}${count}_name" placeholder="名前を入力" />
    </div>
    <div>
      <label>性別</label>
      <select id="${prefix}${count}_gender">
        <option value="">選択してください</option>
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>
    </div>
    <div>
      <label>状態</label>
      <select id="${prefix}${count}_status">
        <option value="alive">生存</option>
        <option value="deceased">故人</option>
      </select>
    </div>
    <div>
      <label>生年(西暦)</label>
      <input type="number" id="${prefix}${count}_birth_year" min="1900" placeholder="例：2000" />
    </div>
    <div>
      <label>生年(和暦)</label>
      <div class="birth-inputs">
        <select class="j-calendar" id="${prefix}${count}_birth_era">
          <option value="">選択してください</option>
          <option value="明治">明治</option>
          <option value="大正">大正</option>
          <option value="昭和">昭和</option>
          <option value="平成">平成</option>
          <option value="令和">令和</option>
        </select>
        <input class="j-calendar" type="number" id="${prefix}${count}_birth_year_jp" placeholder="例：30" />
      </div>
    </div>
    <div class="living-together">
      <label>同居</label><input type="checkbox" id="${prefix}${count}_livein" />
    </div>
    <div class="memo">
      <label>備考</label><input type="text" id="${prefix}${count}_memo" />
    </div>
  `;

  wrapper.appendChild(content);
  container.appendChild(wrapper); // 末尾に追加

  // すべての順番を整理
  renumberPersons(prefix, containerId, labelPrefix, isDetails);
}

// 人削除
function removePerson(prefix, index, containerId, isDetails, labelPrefix) {
  const target = document.getElementById(`${prefix}${index}-container`);
  if (target) target.remove();
  renumberPersons(prefix, containerId, labelPrefix, isDetails);
}

// 共通の並び＆IDリセット処理
function renumberPersons(prefix, containerId, labelPrefix, isDetails) {
  const container = document.getElementById(containerId);
  const persons = container.querySelectorAll(
    isDetails ? "details.generation" : ".person-input"
  );

  persons.forEach((el, i) => {
    let newIndex = i + 1;

    // 子(C)の場合：C1(長子)は静的なのでC2から始まる
    if (prefix === "C") newIndex += 1;

    el.id = `${prefix}${newIndex}-container`;

    // summaryタイトル（子世代など）
    const summary = el.querySelector("summary h4");
    if (summary) summary.textContent = `${labelPrefix}${newIndex}`;

    // 名前ラベル
    const nameLabel = el.querySelector("div label");
    if (nameLabel) nameLabel.textContent = `${labelPrefix}${newIndex} 名前`;

    // input/select ID更新
    el.querySelectorAll("input, select").forEach((input) => {
      if (input.id.includes(prefix)) {
        const parts = input.id.split("_");
        input.id = `${prefix}${newIndex}_${parts[1]}`;
      }
    });

    // 削除ボタン更新
    const removeBtn = el.querySelector(".remove-btn");
    if (removeBtn)
      removeBtn.setAttribute(
        "onclick",
        `removePerson('${prefix}', ${newIndex}, '${containerId}', ${isDetails}, '${labelPrefix}')`
      );
  });

  counters[prefix] = persons.length + (prefix === "C" ? 1 : 0);
}
