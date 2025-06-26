const mangaData = {
    backgrounds: [
        {
            id: 1,
            image: "images/1644635.png"
        },
        {
            id: 2,
            image: "images/1647266.png"
        },
        {
            id: 3,
            image: "images/26469090.jpg"
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