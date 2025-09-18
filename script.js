let siblingCount = 0;

function addSibling() {
  if (siblingCount >= 10) {
    alert('兄弟姉妹は最大10人まで追加できます。');
    return;
  }
  
  siblingCount++;
  const container = document.getElementById('siblings-container');
  
  const siblingDiv = document.createElement('div');
  siblingDiv.className = 'person-input';
  siblingDiv.id = `sibling${siblingCount}-container`;
  
  siblingDiv.innerHTML = `
    <button type="button" class="remove-btn" onclick="removeSibling(${siblingCount})">削除</button>
    <div>
      <label>兄弟姉妹${siblingCount} 名前</label>
      <input
        type="text"
        id="sibling${siblingCount}_name"
        placeholder="例：田中和子"
      />
    </div>
    <div>
      <label>性別</label>
      <select id="sibling${siblingCount}_gender">
        <option value="">選択してください</option>
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>
    </div>
    <div>
      <label>生年</label>
      <input type="number" id="sibling${siblingCount}_birth" placeholder="例：1983" />
    </div>
    <div>
      <label>状態</label>
      <select id="sibling${siblingCount}_status">
        <option value="alive">生存</option>
        <option value="deceased">故人</option>
      </select>
    </div>
  `;
  
  container.appendChild(siblingDiv);
}

function removeSibling(siblingId) {
  const siblingContainer = document.getElementById(`sibling${siblingId}-container`);
  if (siblingContainer) {
    siblingContainer.remove();
  }
}

function collectPersonData() {
  const people = [];
  
  // 固定の家族メンバー（性別固定）
  const fixedMembers = [
    { id: 'paternal_grandfather', gender: 'male' },
    { id: 'paternal_grandmother', gender: 'female' },
    { id: 'maternal_grandfather', gender: 'male' },
    { id: 'maternal_grandmother', gender: 'female' },
    { id: 'father', gender: 'male' },
    { id: 'mother', gender: 'female' }
  ];
  
  // 性別選択可能なメンバー
  const selectableMembers = [
    'self',
    'spouse',
    'child1',
    'child2'
  ];

  // 固定メンバーの処理
  fixedMembers.forEach((member) => {
    const nameEl = document.getElementById(`${member.id}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: member.id,
        name: nameEl.value,
        gender: member.gender,
        birth: document.getElementById(`${member.id}_birth`).value,
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
        birth: document.getElementById(`${id}_birth`).value,
        status: document.getElementById(`${id}_status`).value,
      });
    }
  });

  // 動的に追加された兄弟姉妹の処理
  for (let i = 1; i <= 10; i++) {
    const nameEl = document.getElementById(`sibling${i}_name`);
    if (nameEl && nameEl.value.trim()) {
      people.push({
        id: `sibling${i}`,
        name: nameEl.value,
        gender: document.getElementById(`sibling${i}_gender`).value,
        birth: document.getElementById(`sibling${i}_birth`).value,
        status: document.getElementById(`sibling${i}_status`).value,
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
    paternal_grandfather: { x: 150, y: 80 },
    paternal_grandmother: { x: 250, y: 80 },
    maternal_grandfather: { x: 450, y: 80 },
    maternal_grandmother: { x: 550, y: 80 },

    // 親世代 (y=200)
    father: { x: 200, y: 200 },
    mother: { x: 300, y: 200 },

    // 本人世代 (y=320)
    self: { x: 300, y: 320 },
    spouse: { x: 400, y: 320 },

    // 子世代 (y=440)
    child1: { x: 330, y: 440 },
    child2: { x: 370, y: 440 },
  };

  // 兄弟姉妹のポジションを動的に計算
  const siblings = people.filter(p => p.id.startsWith('sibling'));
  const siblingBaseX = 100;
  const siblingSpacing = 80;
  
  siblings.forEach((sibling, index) => {
    positions[sibling.id] = {
      x: siblingBaseX + (index * siblingSpacing),
      y: 320
    };
  });

  // 関係線を先に描画（人物の下に表示されるように）
  drawRelationships(svg, people, positions);

  // 人物を描画
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
    ["paternal_grandfather", "paternal_grandmother"],
    ["maternal_grandfather", "maternal_grandmother"],
    ["father", "mother"],
    ["self", "spouse"],
  ];

  marriages.forEach(([person1, person2]) => {
    if (peopleMap[person1] && peopleMap[person2]) {
      const pos1 = positions[person1];
      const pos2 = positions[person2];

      svg.innerHTML += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" 
                        stroke="#333" stroke-width="2"/>`;
    }
  });

  // 親子関係の線
  const parentChildRelations = [
    // 祖父母から親へ
    [["paternal_grandfather", "paternal_grandmother"], "father"],
    [["maternal_grandfather", "maternal_grandmother"], "mother"],
    // 親から子へ（本人と兄弟姉妹）
    [["father", "mother"], "self"],
  ];

  // 兄弟姉妹の親子関係を追加
  const siblings = people.filter(p => p.id.startsWith('sibling'));
  siblings.forEach(sibling => {
    parentChildRelations.push([["father", "mother"], sibling.id]);
  });

  // 本人から子への関係
  parentChildRelations.push([["self", "spouse"], "child1"]);
  parentChildRelations.push([["self", "spouse"], "child2"]);

  parentChildRelations.forEach(([parents, child]) => {
    if (Array.isArray(parents)) {
      const parent1 = peopleMap[parents[0]];
      const parent2 = peopleMap[parents[1]];
      const childPerson = peopleMap[child];

      if ((parent1 || parent2) && childPerson) {
        let parentX;
        if (parent1 && parent2) {
          parentX = (positions[parents[0]].x + positions[parents[1]].x) / 2;
        } else if (parent1) {
          parentX = positions[parents[0]].x;
        } else {
          parentX = positions[parents[1]].x;
        }

        const parentY = parent1
          ? positions[parents[0]].y
          : positions[parents[1]].y;
        const childPos = positions[child];

        // 垂直線（親の中間から下へ）
        svg.innerHTML += `<line x1="${parentX}" y1="${
          parentY + 30
        }" x2="${parentX}" y2="${childPos.y - 30}" 
                            stroke="#666" stroke-width="1"/>`;
        // 水平線（子へ）
        svg.innerHTML += `<line x1="${parentX}" y1="${childPos.y - 30}" x2="${
          childPos.x
        }" y2="${childPos.y - 30}" 
                            stroke="#666" stroke-width="1"/>`;
        // 子への垂直線
        svg.innerHTML += `<line x1="${childPos.x}" y1="${
          childPos.y - 30
        }" x2="${childPos.x}" y2="${childPos.y - 15}" 
                            stroke="#666" stroke-width="1"/>`;
      }
    }
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
    shape += `<rect x="${x - shapeSize}" y="${y - shapeSize}" width="${shapeSize * 2}" height="${shapeSize * 2}" 
                    fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;

    if (isSelf) {
      // 本人は二重線
      shape += `<rect x="${x - shapeSize - 3}" y="${y - shapeSize - 3}" width="${(shapeSize * 2) + 6}" height="${(shapeSize * 2) + 6}" 
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
    deceased = `<line x1="${x - xSize}" y1="${y - xSize}" x2="${x + xSize}" y2="${y + xSize}" stroke="#000" stroke-width="${xStroke}"/>
                <line x1="${x - xSize}" y1="${y + xSize}" x2="${x + xSize}" y2="${y - xSize}" stroke="#000" stroke-width="${xStroke}"/>`;
  }

  // 名前
  const nameY = y + (40 * scale);
  const fontSize = Math.max(8, 12 * scale);
  const name = `<text x="${x}" y="${nameY}" text-anchor="middle" font-size="${fontSize}" font-weight="bold">${person.name}</text>`;

  // 生年
  const birthY = nameY + (15 * scale);
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
    }
  });

  // 動的に追加された兄弟姉妹の入力フィールドをクリア
  const siblingsContainer = document.getElementById('siblings-container');
  siblingsContainer.innerHTML = '';
  siblingCount = 0;

  const svg = document.getElementById("genogram-svg");
  svg.innerHTML =
    '<text x="400" y="300" text-anchor="middle" fill="#ccc" font-size="18">情報を入力して「ジェノグラム作成」ボタンを押してください</text>';
}