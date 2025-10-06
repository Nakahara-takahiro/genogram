let siblingCount = 0;
let paternalUncleAuntCount = 1;
let maternalUncleAuntCount = 1;

let selfSiblingCount = 0;
let spouseSiblingCount = 0;


function collectPersonData() {
  const people = [];

  // 固定の家族メンバー（性別固定）
  const fixedMembers = [
    { id: "ff", gender: "male" },
    { id: "fm", gender: "female" },
    { id: "mf", gender: "male" },
    { id: "mm", gender: "female" },
    { id: "lff", gender: "male" },
    { id: "lfm", gender: "female" },
    { id: "lmf", gender: "male" },
    { id: "lmm", gender: "female" },
    { id: "f", gender: "male" },
    { id: "m", gender: "female" },
    { id: "lf", gender: "male" },
    { id: "lm", gender: "female" },
  ];

  // 性別選択可能なメンバー
  const selectableMembers = ["p", "s", "c1", "c2"];

  // 固定メンバーの処理
  fixedMembers.forEach((member) => {
    const nameEl = document.getElementById(`${member.id}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: member.id,
        name: nameEl.value,
        gender: member.gender,
        birth: document.getElementById(`${member.id}_birth_year`).value,
        status: document.getElementById(`${member.id}_status`).value,
      });
    }
  });

  // 性別選択可能メンバーの処理
  selectableMembers.forEach((id) => {
    const nameEl = document.getElementById(`${id}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: id,
        name: nameEl.value,
        gender: document.getElementById(`${id}_gender`).value,
        birth: document.getElementById(`${id}_birth_year`).value,
        status: document.getElementById(`${id}_status`).value,
      });
    }
  });

  // 動的に追加された本人の兄弟姉妹の処理
  for (let i = 1; i <= 10; i++) {
    const nameEl = document.getElementById(`B${i}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: `B${i}`,
        name: nameEl.value,
        gender: document.getElementById(`B${i}_gender`).value,
        birth: document.getElementById(`B${i}_birth_year`).value,
        status: document.getElementById(`B${i}_status`).value,
      });
    }
  }

  // 動的に追加された配偶者の兄弟姉妹の処理
  for (let i = 1; i <= 10; i++) {
    const nameEl = document.getElementById(`LB${i}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: `LB${i}`,
        name: nameEl.value,
        gender: document.getElementById(`LB${i}_gender`).value,
        birth: document.getElementById(`LB${i}_birth_year`).value,
        status: document.getElementById(`LB${i}_status`).value,
      });
    }
  }

  return people;
}

function generateGenogram() {
  const people = collectPersonData();
  const svg = document.getElementById("genogram-svg");

  // SVGクリア
  svg.innerHTML = "";

  if (people.length === 0) {
    svg.innerHTML =
      '<text x="400" y="300" text-anchor="middle" fill="#ccc" font-size="18">データが入力されていません</text>';
    return;
  }

  drawGenogram(svg, people);
}
function drawGenogram(svg, people) {
  const positions = {
    // 祖父母世代 (y=80)
    ff: { x: 150, y: 80 },
    fm: { x: 250, y: 80 },
    mf: { x: 450, y: 80 },
    mm: { x: 550, y: 80 },

    // 親世代 (y=200)
    f: { x: 200, y: 200 },
    m: { x: 300, y: 200 },

    // 配偶者の親世代 (y=200)
    lf: { x: 400, y: 200 },
    lm: { x: 500, y: 200 },

    // 本人世代 (y=320)
    p: { x: 300, y: 320 },
    s: { x: 400, y: 320 },

    // 子世代 (y=440)
    c1: { x: 330, y: 440 },
    c2: { x: 370, y: 440 },
  };

  // 本人の兄弟姉妹（B1〜B10）
  const selfSiblings = people.filter(p => p.id.startsWith("B"));
  const selfBaseX = 100; // 左から配置
  const spacing = 70;
  selfSiblings.forEach((sib, i) => {
    positions[sib.id] = { x: selfBaseX + i * spacing, y: 320 };
  });

  // 配偶者の兄弟姉妹（LB1〜LB10）
  const spouseSiblings = people.filter(p => p.id.startsWith("LB"));
  const spouseBaseX = 520; // 右側から配置
  spouseSiblings.forEach((sib, i) => {
    positions[sib.id] = { x: spouseBaseX + i * spacing, y: 320 };
  });

  drawRelationships(svg, people, positions);

  people.forEach((person) => {
    if (positions[person.id]) {
      drawPerson(svg, person, positions[person.id]);
    }
  });
}

function drawRelationships(svg, people, positions) {
  const peopleMap = {};
  people.forEach((p) => (peopleMap[p.id] = p));

  // 結婚関係の線
  const marriages = [
    ["ff", "fm"],
    ["mf", "mm"],
    ["f", "m"],
    ["lf", "lm"],
    ["p", "s"],
  ];

  marriages.forEach(([p1, p2]) => {
    if (peopleMap[p1] && peopleMap[p2]) {
      const pos1 = positions[p1];
      const pos2 = positions[p2];
      svg.innerHTML += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="#333" stroke-width="2"/>`;
    }
  });

  // 親子関係
  const parentChildRelations = [
    [["ff", "fm"], "f"],
    [["mf", "mm"], "m"],
    [["lf", "lm"], "s"],
    [["f", "m"], "p"],
    [["p", "s"], "c1"],
    [["p", "s"], "c2"],
  ];

  // 本人の兄弟姉妹（B）を追加
  for (let i = 1; i <= 10; i++) {
    if (peopleMap[`B${i}`]) {
      parentChildRelations.push([["f", "m"], `B${i}`]);
    }
  }

  // 配偶者の兄弟姉妹（LB）を追加
  for (let i = 1; i <= 10; i++) {
    if (peopleMap[`LB${i}`]) {
      parentChildRelations.push([["lf", "lm"], `LB${i}`]);
    }
  }

  // 線描画
  parentChildRelations.forEach(([parents, child]) => {
    const p1 = parents[0], p2 = parents[1];
    const childPerson = peopleMap[child];
    if (!childPerson) return;

    const pos1 = positions[p1], pos2 = positions[p2], childPos = positions[child];
    if (!pos1 || !pos2 || !childPos) return;

    const parentX = (pos1.x + pos2.x) / 2;
    const parentY = pos1.y;

    svg.innerHTML += `
      <line x1="${parentX}" y1="${parentY + 25}" x2="${parentX}" y2="${childPos.y - 30}" stroke="#666" stroke-width="1"/>
      <line x1="${parentX}" y1="${childPos.y - 30}" x2="${childPos.x}" y2="${childPos.y - 30}" stroke="#666" stroke-width="1"/>
      <line x1="${childPos.x}" y1="${childPos.y - 30}" x2="${childPos.x}" y2="${childPos.y - 15}" stroke="#666" stroke-width="1"/>
    `;
  });
}


function drawPerson(svg, person, position, scale = 1) {
  const { x, y } = position;
  const isDeceased = person.status === "deceased";
  const isMale = person.gender === "male";
  const isSelf = person.id === "self";

  let shape;
  let fillColor = isDeceased ? "#D3D3D3" : isMale ? "#87CEEB" : "#FFB6C1";
  let strokeColor = isDeceased ? "#696969" : isMale ? "#4682B4" : "#DC143C";

  const shapeSize = 20 * scale;
  const strokeWidth = Math.max(1, 2 * scale);

  if (isMale) {
    // 男性：四角形
    shape += `<rect x="${x - shapeSize}" y="${y - shapeSize}" width="${
      shapeSize * 2
    }" height="${shapeSize * 2}" 
                    fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;

    if (isSelf) {
      // 本人は二重線
      shape += `<rect x="${x - shapeSize - 3}" y="${
        y - shapeSize - 3
      }" width="${shapeSize * 2 + 6}" height="${shapeSize * 2 + 6}" 
                      fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
  } else {
    // 女性：円形
    shape += `<circle cx="${x}" cy="${y}" r="${shapeSize}" 
                    fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;

    if (isSelf) {
      // 本人は二重線
      shape += `<circle cx="${x}" cy="${y}" r="${shapeSize + 3}" 
                      fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
  }

  // 故人の場合はX印を追加
  let deceased = "";
  if (isDeceased) {
    const xSize = 15 * scale;
    const xStroke = Math.max(1, 2 * scale);
    deceased = `<line x1="${x - xSize}" y1="${y - xSize}" x2="${
      x + xSize
    }" y2="${y + xSize}" stroke="#000" stroke-width="${xStroke}"/>
                <line x1="${x - xSize}" y1="${y + xSize}" x2="${
      x + xSize
    }" y2="${y - xSize}" stroke="#000" stroke-width="${xStroke}"/>`;
  }

  // 名前
  const nameY = y + 40 * scale;
  const fontSize = Math.max(8, 12 * scale);
  const name = `<text x="${x}" y="${nameY}" text-anchor="middle" font-size="${fontSize}" font-weight="bold">${person.name}</text>`;

  // 生年
  const birthY = nameY + 15 * scale;
  const birthFontSize = Math.max(6, 10 * scale);
  const birth = person.birth
    ? `<text x="${x}" y="${birthY}" text-anchor="middle" font-size="${birthFontSize}" fill="#666">${person.birth}年生</text>`
    : "";

  svg.innerHTML += shape + deceased + name + birth;
}

function clearInputs() {
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    if (input.type === "text" || input.type === "number") {
      input.value = "";
    } else if (input.tagName === "SELECT") {
      input.selectedIndex = 0;
    } else if (input.type === "checkbox") {
      input.checked = false;
    }
  });

  // ✅ 動的に追加された人物入力欄を安全に削除
  const dynamicContainers = [
    "siblings-container-self",
    "siblings-container-spouse",
    "children-container",
  ];

  dynamicContainers.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  // ✅ カウンタを初期化
  siblingCount = 0;
  selfSiblingCount = 0;
  spouseSiblingCount = 0;

  // ✅ SVGの初期表示に戻す
  const svg = document.getElementById("genogram-svg");
  svg.innerHTML =
    '<text x="400" y="300" text-anchor="middle" fill="#ccc" font-size="18">' +
    '情報を入力して「ジェノグラム作成」ボタンを押してください' +
    '</text>';
}


// 和暦・西暦変換機能
const eras = {
  明治: 1868,
  大正: 1912,
  昭和: 1926,
  平成: 1989,
  令和: 2019,
};

// 西暦 → 和暦
function toWareki(year) {
  const entries = Object.entries(eras);
  for (let i = entries.length - 1; i >= 0; i--) {
    const [era, start] = entries[i];
    if (year >= start) {
      return { era, jp: year - start + 1 };
    }
  }
  return { era: "", jp: "" };
}

// 和暦 → 西暦
function toSeireki(era, jp) {
  if (!era || !eras[era] || !jp) return "";
  return eras[era] + (parseInt(jp, 10) - 1);
}

// ------------------------------------
// イベント委譲（静的 + 動的要素に対応）
// ------------------------------------

document.addEventListener("input", (e) => {
  // 西暦 → 和暦
  if (e.target.matches("input[id$='_birth_year']")) {
    const prefix = e.target.id.replace("_birth_year", "");
    const year = parseInt(e.target.value, 10);
    if (!year) return;

    const { era, jp } = toWareki(year);
    document.getElementById(`${prefix}_birth_era`).value = era;
    document.getElementById(`${prefix}_birth_year_jp`).value = jp || "";

    console.log(`[${prefix}] 西暦入力: ${year} → ${era}${jp}年`);
  }

  // 和暦年 → 西暦
  if (e.target.matches("input[id$='_birth_year_jp']")) {
    const prefix = e.target.id.replace("_birth_year_jp", "");
    const jp = parseInt(e.target.value, 10);
    const era = document.getElementById(`${prefix}_birth_era`).value;
    const year = toSeireki(era, jp);
    document.getElementById(`${prefix}_birth_year`).value = year || "";

    console.log(`[${prefix}] 和暦年入力: ${era}${jp}年 → 西暦${year}`);
  }
});

document.addEventListener("change", (e) => {
  // 元号変更 → 西暦
  if (e.target.matches("select[id$='_birth_era']")) {
    const prefix = e.target.id.replace("_birth_era", "");
    const jp = parseInt(
      document.getElementById(`${prefix}_birth_year_jp`).value,
      10
    );
    const year = toSeireki(e.target.value, jp);
    document.getElementById(`${prefix}_birth_year`).value = year || "";

    console.log(`[${prefix}] 元号変更: ${e.target.value}${jp}年 → 西暦${year}`);
  }
});


// ------------------------------------
// 🧩 ダミーデータ描画ボタン
// ------------------------------------
document.getElementById("draw-dummy-btn").addEventListener("click", () => {
  // 1️⃣ 入力欄をクリア
  clearInputs();

  // 2️⃣ ダミーデータを設定
  const dummyData = [
    { id: "p", name: "本人 太郎", gender: "male", birth: 1990, status: "alive" },
    { id: "s", name: "本人 花子", gender: "female", birth: 1992, status: "alive" },
    { id: "f", name: "本人 父", gender: "male", birth: 1965, status: "alive" },
    { id: "m", name: "本人 母", gender: "female", birth: 1967, status: "alive" },
  ];

  dummyData.forEach((person) => {
    const nameEl = document.getElementById(`${person.id}_name`);
    const genderEl = document.getElementById(`${person.id}_gender`);
    const birthEl = document.getElementById(`${person.id}_birth_year`);
    const statusEl = document.getElementById(`${person.id}_status`);

    if (nameEl) nameEl.value = person.name;
    if (genderEl) genderEl.value = person.gender;
    if (birthEl) birthEl.value = person.birth;
    if (statusEl) statusEl.value = person.status;
  });

  // 3️⃣ ジェノグラム描画
  generateGenogram();
});