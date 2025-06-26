const mangaData = {
    backgrounds: [
        {
            id: 1,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
                <rect width="400" height="600" fill="#ffb3ba"/>
                <circle cx="200" cy="200" r="80" fill="#ffdfed"/>
                <ellipse cx="180" cy="180" rx="15" ry="20" fill="#333"/>
                <ellipse cx="220" cy="180" rx="15" ry="20" fill="#333"/>
                <path d="M 180 220 Q 200 240 220 220" stroke="#ff69b4" stroke-width="3" fill="none"/>
                <path d="M 170 160 Q 180 150 190 160" stroke="#ff69b4" stroke-width="2" fill="none"/>
                <path d="M 210 160 Q 220 150 230 160" stroke="#ff69b4" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 2,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
                <rect width="400" height="600" fill="#ffd1dc"/>
                <circle cx="200" cy="180" r="70" fill="#ffe4e6"/>
                <ellipse cx="185" cy="165" rx="12" ry="18" fill="#333"/>
                <ellipse cx="215" cy="165" rx="12" ry="18" fill="#333"/>
                <path d="M 185 200 Q 200 210 215 200" stroke="#ff1493" stroke-width="3" fill="none"/>
                <circle cx="170" cy="150" r="8" fill="#ff69b4" opacity="0.7"/>
                <circle cx="230" cy="150" r="8" fill="#ff69b4" opacity="0.7"/>
            </svg>`
        },
        {
            id: 3,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
                <rect width="400" height="600" fill="#ffe4e1"/>
                <circle cx="200" cy="220" r="85" fill="#fff0f5"/>
                <ellipse cx="180" cy="200" rx="18" ry="25" fill="#333"/>
                <ellipse cx="220" cy="200" rx="18" ry="25" fill="#333"/>
                <path d="M 175 250 Q 200 270 225 250" stroke="#dc143c" stroke-width="4" fill="none"/>
                <path d="M 160 180 Q 175 165 190 180" stroke="#ff1493" stroke-width="2" fill="none"/>
                <path d="M 210 180 Q 225 165 240 180" stroke="#ff1493" stroke-width="2" fill="none"/>
            </svg>`
        }
    ],
    
    dialogTemplates: [
        {
            template: "今日も{weather}ね、{name}",
            variables: {
                weather: ["素敵", "美しい", "きれい", "可愛い", "素晴らしい"],
                name: ["お姉さま", "先輩", "あなた", "皆さん", "みんな"]
            }
        },
        {
            template: "{feeling}だわ、{object}って",
            variables: {
                feeling: ["嬉しい", "楽しい", "幸せ", "ドキドキ", "ワクワク"],
                object: ["恋", "友情", "学校", "今日", "この瞬間"]
            }
        },
        {
            template: "{adjective}な{noun}ね",
            variables: {
                adjective: ["キラキラした", "ロマンチックな", "夢のような", "特別な", "大切な"],
                noun: ["思い出", "時間", "瞬間", "日々", "出会い"]
            }
        },
        {
            template: "{action}したいな、{place}で",
            variables: {
                action: ["お話", "お茶", "散歩", "読書", "お買い物"],
                place: ["お庭", "カフェ", "図書館", "公園", "屋上"]
            }
        },
        {
            template: "あなたって{personality}ね",
            variables: {
                personality: ["優しい", "素敵", "かっこいい", "頼もしい", "魅力的"]
            }
        }
    ]
};