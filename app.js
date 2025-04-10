// 全局变量
let userAnswers = {};

// 直接嵌入决策树数据，而不是通过fetch获取
const decisionTreeData = {
  "base_items": [
    "一般检查(身高体重、腰围臀围、血压)",
    "内科检查",
    "外科检查",
    "血常规",
    "肝肾功能(ALT、AST、GGT、肌酐、尿素氮、尿酸)",
    "血脂四项",
    "空腹血糖",
    "尿常规",
    "胸部X线片",
    "心电图",
    "眼科检查视力",
    "耳鼻喉科和口腔科检查"
  ],
  "age_groups": {
    "18-29": {
      "additions": ["视力检查"]
    },
    "30-39": {
      "additions": [
        "腹部超声", 
        "心电图", 
        {
          "condition": "甲状腺疾病家族史或BMI≥24",
          "tests": ["甲状腺功能", "甲状腺抗体"]
        },
        {
          "condition": "乙肝疫苗未接种",
          "tests": ["乙肝两对半"]
        }
      ]
    },
    "40-49": {
      "additions": [
        {
          "condition": "胃癌高风险人群",
          "tests": ["胃镜检查"]
        },
        {
          "condition": "男性",
          "tests": ["PSA检测"]
        },
        {
          "condition": "女性",
          "tests": [
            "乳腺超声", 
            "宫颈TCT", 
            {
              "condition": "HPV未接种",
              "tests": ["HPV检测"]
            },
            {
              "condition": "乳腺致密型",
              "tests": ["乳腺MRI"]
            }
          ]
        },
        {
          "condition": "女性更年期前后",
          "tests": ["骨密度筛查"]
        },
        {
          "condition": "高血压或糖尿病",
          "tests": ["眼底检查"]
        }
      ]
    },
    "50-59": {
      "additions": [
        "结肠镜检查",
        {
          "condition": "男性",
          "tests": ["前列腺超声"]
        },
        {
          "condition": "女性",
          "tests": ["乳腺钼靶"]
        },
        "颈动脉超声",
        {
          "condition": "吸烟≥20包年或职业暴露",
          "tests": ["肺部低剂量CT"]
        },
        {
          "condition": "空腹血糖5.6-6.9 mmol/L或BMI≥25",
          "tests": ["糖化血红蛋白"]
        }
      ]
    },
    "60+": {
      "additions": [
        "心脏超声",
        "听力检查",
        "认知功能评估",
        {
          "condition": "吸烟或有呼吸系统症状",
          "tests": ["肺功能检查"]
        },
        {
          "condition": "认知功能异常/卒中史/高血压III级",
          "tests": ["脑部MRI"]
        },
        "老年人全面评估(跌倒风险等)"
      ]
    }
  },
  "risk_scoring": {
    "cardiovascular": [
      {"factor": "年龄≥50", "score": 1},
      {"factor": "男性或绝经后女性", "score": 1},
      {"factor": "吸烟", "score": 2},
      {"factor": "高血压", "score": 2},
      {"factor": "糖尿病", "score": 2},
      {"factor": "血脂异常", "score": 1},
      {"factor": "BMI≥28", "score": 1},
      {"factor": "腰围超标（男≥90cm/女≥85cm）", "score": 2},
      {"factor": "家族心血管病史", "score": 2},
      {"factor": "缺乏运动", "score": 1},
      {"factor": "高敏C反应蛋白升高史", "score": 1},
      {"factor": "慢性肾病（eGFR<60）", "score": 3}
    ],
    "tumor": [
      {"factor": "年龄≥50岁", "score": 1},
      {"factor": "吸烟≥10年", "score": 3},
      {"factor": "长期饮酒", "score": 2},
      {"factor": "家族癌症史", "score": 3},
      {"factor": "职业暴露", "score": 2},
      {"factor": "慢性感染（如HBV）", "score": 2},
      {"factor": "肥胖(BMI≥28)", "score": 1},
      {"factor": "相关症状(血便、进行性吞咽困难等)", "score": 3}
    ]
  },
  "special_conditions": [
    {
      "condition": "高度近视（600度以上）",
      "tests": ["眼底检查"]
    },
    {
      "condition": "高血压患者",
      "tests": ["尿微量白蛋白", "眼底检查", "动态血压监测"]
    },
    {
      "condition": "糖尿病患者",
      "tests": ["糖化血红蛋白", "尿微量白蛋白", "眼底检查", "足部检查", "心脏自主神经功能检测"]
    },
    {
      "condition": "BMI≥28",
      "tests": ["动态血压监测", "糖化血红蛋白"]
    },
    {
      "condition": "血压波动明显",
      "tests": ["动态血压监测"]
    }
  ],
  "symptom_triggers": [
    {
      "symptom": "持续咳嗽>2周",
      "steps": [
        "胸部X线片",
        "肺功能检查",
        {"condition": "前期检查阴性", "test": "低剂量螺旋CT"}
      ]
    },
    {
      "symptom": "消化道症状",
      "tests": ["胃镜", "结肠镜", "腹部超声", "粪便隐血检测"]
    },
    {
      "symptom": "尿路症状",
      "tests": ["尿常规", "尿培养", "泌尿系统超声"]
    },
    {
      "symptom": "不明原因出血",
      "tests": ["凝血功能", "血小板功能", "血管性血友病因子检测"]
    },
    {
      "symptom": "疲劳+体重下降",
      "steps": [
        "甲状腺功能", 
        "结核菌素试验",
        {"condition": "初筛正常", "tests": ["全面血液检查", "肿瘤标志物筛查", "胸腹盆CT"]}
      ]
    },
    {
      "symptom": "前列腺症状",
      "tests": ["PSA检测", "前列腺超声", "尿流率测定"]
    },
    {
      "symptom": "关节痛",
      "tests": ["类风湿因子", "抗CCP抗体", "关节X线片或MRI"]
    }
  ],
  "special_populations": [
    {
      "group": "计划妊娠女性",
      "tests": ["叶酸", "铁蛋白", "维生素D检测", "甲状腺功能", "TORCH筛查"]
    },
    {
      "group": "口服避孕药",
      "tests": ["肝功能", "血脂", "血压", "血栓风险评估"]
    },
    {
      "group": "男性BMI≥25且有疲劳症状",
      "tests": ["性激素六项", "睡眠呼吸暂停风险评估"]
    },
    {
      "group": "职业粉尘暴露",
      "tests": ["肺功能", "胸部X线片", "职业健康评估"]
    },
    {
      "group": "慢性肝病",
      "tests": ["肝纤维化指标", "肝脏超声", "甲胎蛋白", "乙肝病毒DNA载量(如适用)"]
    },
    {
      "group": "慢性病管理需要",
      "tests": ["个性化随访计划", "健康教育"]
    }
  ],
  "screening_preferences": {
    "colonoscopy_direct": ["结肠镜检查"],
    "colonoscopy_step": ["FIT-DNA检测"],
    "breast_high_density": ["乳腺MRI"]
  },
  "vaccination_status": {
    "hepB_incomplete": ["乙肝两对半", "乙肝疫苗补种建议"],
    "hepB_over10years": ["乙肝表面抗体滴度检查", "加强针建议评估"]
  },
  "mental_health": {
    "depression": {
      "threshold": 6,
      "recommendations": [
        "2周内心理科就诊",
        "拨打心理援助热线12320"
      ]
    },
    "anxiety": {
      "threshold": 5,
      "recommendations": [
        "每日正念呼吸练习10分钟",
        "1个月内精神科评估"
      ]
    }
  }
};

// 问卷初始部分 - 基于最新版问卷
const initialQuestionnaire = [
  // 第一部分：基本信息
  {
    id: 'age',
    question: '您的年龄是？',
    options: ['18-29岁', '30-39岁', '40-49岁', '50-59岁', '60岁及以上'],
    type: 'radio',
    required: true
  },
  {
    id: 'gender',
    question: '您的性别是？',
    options: ['男性', '女性'],
    type: 'radio',
    required: true
  },
  {
    id: 'height',
    question: '请填写您的身高(cm)：',
    type: 'number',
    placeholder: '例如：170',
    required: true
  },
  {
    id: 'weight',
    question: '请填写您的体重(kg)：',
    type: 'number',
    placeholder: '例如：65',
    required: true
  },
  {
    id: 'waist',
    question: '请填写您的腰围(cm)：',
    type: 'number',
    placeholder: '例如：80',
    required: false
  },
  {
    id: 'hipCircumference',
    question: '请填写您的臀围(cm)：',
    type: 'number',
    placeholder: '例如：95',
    required: false
  },
  {
    id: 'highMyopia',
    question: '您的眼睛情况是否属于高度近视(600度以上)？',
    options: ['是', '否', '不确定'],
    type: 'radio',
    required: false
  },
  {
    id: 'familyHistory',
    question: '您的家族成员(直系亲属)是否患有以下疾病？(可多选)',
    options: [
      '心血管疾病(心脏病、中风等)', 
      '胃癌', 
      '结肠癌', 
      '乳腺癌', 
      '前列腺癌', 
      '肺癌', 
      '其他癌症(请在备注中说明)', 
      '甲状腺疾病', 
      '糖尿病', 
      '静脉血栓疾病', 
      '以上都没有', 
      '不清楚'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'familyCancerDetails',
    question: '如您选择"其他癌症"，请在下方说明：',
    type: 'text',
    placeholder: '请详细说明',
    condition: answers => answers.familyHistory && answers.familyHistory.includes('其他癌症(请在备注中说明)')
  },
  
  // 第二部分：生活方式评估
  {
    id: 'smoking',
    question: '您的吸烟情况是？',
    options: ['从不吸烟', '曾经吸烟，现已戒烟', '目前吸烟'],
    type: 'radio',
    required: true
  },
  {
    id: 'smokingYears',
    question: '您吸烟持续了多少年？',
    type: 'number',
    placeholder: '请填写年数',
    condition: answers => answers.smoking && answers.smoking !== '从不吸烟'
  },
  {
    id: 'cigarettesPerDay',
    question: '您平均每天吸多少支烟？',
    type: 'number',
    placeholder: '请填写数量',
    condition: answers => answers.smoking && answers.smoking !== '从不吸烟'
  },
  {
    id: 'quitYears',
    question: '如果您已戒烟，戒烟多少年了？',
    type: 'number',
    placeholder: '请填写年数',
    condition: answers => answers.smoking === '曾经吸烟，现已戒烟'
  },
  {
    id: 'secondHandSmoke',
    question: '您是否长期暴露在二手烟环境中？',
    options: ['是，家庭成员在家中吸烟', '是，工作场所有人吸烟', '否，很少接触二手烟', '不确定'],
    type: 'radio',
    required: false
  },
  {
    id: 'drinking',
    question: '您的饮酒情况是？',
    options: ['不饮酒', '偶尔饮酒(每月少于4次)', '经常饮酒(每周1次或以上)'],
    type: 'radio',
    required: true
  },
  {
    id: 'drinkingYears',
    question: '您饮酒持续了多少年？',
    type: 'number',
    placeholder: '请填写年数',
    condition: answers => answers.drinking && answers.drinking !== '不饮酒'
  },
  {
    id: 'drinkingAmount',
    question: '您每次饮酒的量大约是？',
    options: ['少量(啤酒<500ml或白酒<50ml)', '中等(啤酒500-1000ml或白酒50-100ml)', '大量(啤酒>1000ml或白酒>100ml)'],
    type: 'radio',
    condition: answers => answers.drinking && answers.drinking !== '不饮酒'
  },
  {
    id: 'exercise',
    question: '您的运动习惯是？',
    options: ['规律运动(每周3次以上，每次30分钟以上)', '偶尔运动(每周1-2次)', '缺乏运动(几乎不运动)'],
    type: 'radio',
    required: true
  },
  {
    id: 'occupation',
    question: '您的工作或生活环境中是否长期接触以下物质？(可多选)',
    options: [
      '粉尘(如煤矿、建筑、纺织等行业)', 
      '化学物质(如油漆、溶剂、农药等)', 
      '苯(如印刷、染料、胶黏剂行业)', 
      '放射线(如医疗放射、核工业等)', 
      '噪音(长期高分贝环境)', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  
  // 第三部分：健康状况评估
  {
    id: 'chronicDiseases',
    question: '您是否被医生诊断过以下慢性疾病？(可多选)',
    options: [
      '高血压', 
      '糖尿病', 
      '血脂异常(高胆固醇、高甘油三酯等)', 
      '慢性肾病(eGFR<60ml/min)', 
      '慢性肝病', 
      '乙肝病毒感染', 
      '静脉血栓疾病史', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: true
  },
  {
    id: 'hypertensionYear',
    question: '确诊高血压的时间？',
    type: 'number',
    placeholder: '例如：2015',
    condition: answers => answers.chronicDiseases && answers.chronicDiseases.includes('高血压')
  },
  {
    id: 'hypertensionControl',
    question: '目前高血压控制情况？',
    options: [
      '良好(血压<140/90mmHg)', 
      '一般(血压波动，但多数时间控制在目标范围)', 
      '不佳(血压经常超过目标范围)', 
      '不清楚'
    ],
    type: 'radio',
    condition: answers => answers.chronicDiseases && answers.chronicDiseases.includes('高血压')
  },
  {
    id: 'hypertensionComplications',
    question: '高血压是否伴有以下情况？(可多选)',
    options: [
      '糖尿病', 
      '慢性肾病', 
      '脑卒中史', 
      '高血压III级(180/110mmHg以上)'
    ],
    type: 'checkbox',
    condition: answers => answers.chronicDiseases && answers.chronicDiseases.includes('高血压')
  },
  {
    id: 'diabetesYear',
    question: '确诊糖尿病的时间？',
    type: 'number',
    placeholder: '例如：2015',
    condition: answers => answers.chronicDiseases && answers.chronicDiseases.includes('糖尿病')
  },
  {
    id: 'diabetesControl',
    question: '目前糖尿病控制情况？',
    options: [
      '良好(糖化血红蛋白<7.0%)', 
      '一般(糖化血红蛋白7.0-8.0%)', 
      '不佳(糖化血红蛋白>8.0%)', 
      '不清楚'
    ],
    type: 'radio',
    condition: answers => answers.chronicDiseases && answers.chronicDiseases.includes('糖尿病')
  },
  // 健康状况评估 - 继续
  {
    id: 'medicationHistory',
    question: '您目前是否长期服用以下药物？(可多选)',
    options: [
      '降压药', 
      '降糖药', 
      '他汀类调脂药', 
      '抗血小板药物(如阿司匹林)', 
      '抗凝药(如华法林)', 
      '激素类药物', 
      '免疫抑制剂', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'generalSymptoms',
    question: '您近期(3个月内)是否有以下症状？(可多选)',
    options: [
      '持续疲劳', 
      '近期体重明显下降', 
      '原因不明的低热', 
      '盗汗(尤其是夜间)', 
      '不明原因出血(如鼻血、牙龈出血等)', 
      '黄疸(皮肤或眼睛发黄)', 
      '头晕头痛', 
      '记忆力明显下降', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'respiratorySymptoms',
    question: '您近期是否有以下呼吸系统症状？(可多选)',
    options: [
      '持续咳嗽', 
      '咳痰', 
      '咯血', 
      '气短或呼吸困难', 
      '夜间呼吸困难或打鼾', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'coughDuration',
    question: '如有咳嗽，持续多长时间？',
    options: ['少于2周', '2周至3个月', '超过3个月'],
    type: 'radio',
    condition: answers => answers.respiratorySymptoms && answers.respiratorySymptoms.includes('持续咳嗽')
  },
  {
    id: 'digestiveSymptoms',
    question: '您近期是否有以下消化系统症状？(可多选)',
    options: [
      '消化不良(胃部不适、烧心等)', 
      '腹痛', 
      '腹泻', 
      '便秘', 
      '排便习惯改变', 
      '黑便或血便', 
      '进行性吞咽困难', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'urinarySymptoms',
    question: '您近期是否有以下泌尿系统症状？(可多选)',
    options: [
      '尿频', 
      '尿急', 
      '尿痛', 
      '排尿困难', 
      '尿血', 
      '尿量改变', 
      '以上都没有'
    ],
    type: 'checkbox',
    required: false
  },
  
  // 第五部分：女性特定问题(女性填写)
  {
    id: 'menstruation',
    question: '您的月经情况是？',
    options: ['规律', '不规律', '已绝经', '不适用'],
    type: 'radio',
    condition: answers => answers.gender === '女性'
  },
  {
    id: 'abnormalBleeding',
    question: '您是否有阴道异常出血？',
    options: ['是', '否'],
    type: 'radio',
    condition: answers => answers.gender === '女性'
  },
  {
    id: 'pregnancy',
    question: '您是否计划在一年内妊娠？',
    options: ['是', '否'],
    type: 'radio',
    condition: answers => answers.gender === '女性'
  },
  {
    id: 'contraception',
    question: '您目前的避孕方式是？',
    options: ['口服避孕药', '宫内节育器', '其他方式', '不需要避孕', '不适用'],
    type: 'radio',
    condition: answers => answers.gender === '女性'
  },
  {
    id: 'oralContraceptiveRisk',
    question: '如果您使用口服避孕药，您是否有以下情况？(可多选)',
    options: [
      '35岁以上', 
      '吸烟', 
      '高血压', 
      '血栓病史', 
      '血栓家族史', 
      '肥胖(BMI≥30)', 
      '以上都没有', 
      '不适用'
    ],
    type: 'checkbox',
    condition: answers => answers.gender === '女性' && answers.contraception === '口服避孕药'
  },
  {
    id: 'hpvVaccination',
    question: '您是否接种过HPV疫苗？',
    options: ['是，已完成全程接种', '是，但未完成全程接种', '否', '不清楚', '不适用'],
    type: 'radio',
    condition: answers => answers.gender === '女性'
  },
  
  // 第六部分：男性特定问题(男性填写)
  {
    id: 'prostateSymptoms',
    question: '您是否有以下前列腺相关症状？(可多选)',
    options: ['排尿困难', '尿流变细', '夜间频繁起床排尿', '排尿不尽感', '以上都没有', '不适用'],
    type: 'checkbox',
    condition: answers => answers.gender === '男性'
  },
  {
    id: 'maleObesityFatigue',
    question: '您的BMI≥25且有疲劳症状吗？',
    options: ['是', '否', '不确定'],
    type: 'radio',
    condition: answers => answers.gender === '男性' && answers.bmi && parseFloat(answers.bmi) >= 25
  },
  
  // 第七部分：筛查历史
  {
    id: 'cardiovascularHistory',
    question: '您是否做过以下心血管检查？如做过，请选择并填写最近时间和结果',
    options: [
      '心电图', 
      '心脏超声', 
      '颈动脉超声', 
      '冠状动脉CT', 
      '动态血压监测', 
      '以上都没做过'
    ],
    type: 'checkbox',
    required: false
  },
  {
    id: 'heartECGYear',
    question: '您最近一次心电图检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.cardiovascularHistory && answers.cardiovascularHistory.includes('心电图')
  },
  {
    id: 'heartECGResult',
    question: '您最近一次心电图检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.cardiovascularHistory && answers.cardiovascularHistory.includes('心电图')
  },
  {
    id: 'echoYear',
    question: '您最近一次心脏超声检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.cardiovascularHistory && answers.cardiovascularHistory.includes('心脏超声')
  },
  {
    id: 'echoResult',
    question: '您最近一次心脏超声检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.cardiovascularHistory && answers.cardiovascularHistory.includes('心脏超声')
  },
  {
    id: 'digestiveHistory',
    question: '您是否做过以下消化系统检查？如做过，请选择',
    options: ['胃镜', '结肠镜', 'FIT-DNA检测', '以上都没做过'],
    type: 'checkbox',
    required: false
  },
  {
    id: 'gastroscopyYear',
    question: '您最近一次胃镜检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.digestiveHistory && answers.digestiveHistory.includes('胃镜')
  },
  {
    id: 'gastroscopyResult',
    question: '您最近一次胃镜检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.digestiveHistory && answers.digestiveHistory.includes('胃镜')
  },
  {
    id: 'hPyloriTested',
    question: '是否检测过幽门螺杆菌？',
    options: ['是，阳性', '是，阴性', '否', '不清楚'],
    type: 'radio',
    condition: answers => answers.digestiveHistory && answers.digestiveHistory.includes('胃镜')
  },
  {
    id: 'hPyloriEradicated',
    question: '如阳性，是否已根除？',
    options: ['是', '否', '不清楚'],
    type: 'radio',
    condition: answers => answers.hPyloriTested === '是，阳性'
  },
  {
    id: 'colonoscopyYear',
    question: '您最近一次结肠镜检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.digestiveHistory && answers.digestiveHistory.includes('结肠镜')
  },
  {
    id: 'colonoscopyResult',
    question: '您最近一次结肠镜检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.digestiveHistory && answers.digestiveHistory.includes('结肠镜')
  },
  
  // 更多筛查历史检查
  {
    id: 'lungExamHistory',
    question: '您是否做过以下肺部检查？如做过，请选择',
    options: ['胸部X线', '肺部低剂量CT', '肺功能检查', '以上都没做过'],
    type: 'checkbox',
    required: false
  },
  {
    id: 'xRayYear',
    question: '您最近一次胸部X线检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.lungExamHistory && answers.lungExamHistory.includes('胸部X线')
  },
  {
    id: 'xRayResult',
    question: '您最近一次胸部X线检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.lungExamHistory && answers.lungExamHistory.includes('胸部X线')
  },
  {
    id: 'lungCTYear',
    question: '您最近一次肺部低剂量CT检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.lungExamHistory && answers.lungExamHistory.includes('肺部低剂量CT')
  },
  {
    id: 'lungCTResult',
    question: '您最近一次肺部低剂量CT检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.lungExamHistory && answers.lungExamHistory.includes('肺部低剂量CT')
  },
  
  // 女性特有检查历史
  {
    id: 'femaleExamHistory',
    question: '您过去是否做过以下检查？(可多选)',
    options: ['乳腺超声', '乳腺钼靶', '宫颈TCT', 'HPV检测', '以上都没做过', '不清楚'],
    type: 'checkbox',
    condition: answers => answers.gender === '女性'
  },
  {
    id: 'breastUltrasoundYear',
    question: '您最近一次乳腺超声检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.gender === '女性' && answers.femaleExamHistory && answers.femaleExamHistory.includes('乳腺超声')
  },
  {
    id: 'breastUltrasoundResult',
    question: '您最近一次乳腺超声检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.gender === '女性' && answers.femaleExamHistory && answers.femaleExamHistory.includes('乳腺超声')
  },
  {
    id: 'mammogramYear',
    question: '您最近一次乳腺钼靶检查是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.gender === '女性' && answers.femaleExamHistory && answers.femaleExamHistory.includes('乳腺钼靶')
  },
  {
    id: 'mammogramResult',
    question: '您最近一次乳腺钼靶检查结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.gender === '女性' && answers.femaleExamHistory && answers.femaleExamHistory.includes('乳腺钼靶')
  },
  {
    id: 'breastDensity',
    question: '您的乳腺密度评估结果是？',
    options: ['脂肪型', '散在纤维腺体', '不均匀致密型', '极度致密型', '不清楚'],
    type: 'radio',
    condition: answers => answers.gender === '女性' && answers.femaleExamHistory && 
               (answers.femaleExamHistory.includes('乳腺超声') || answers.femaleExamHistory.includes('乳腺钼靶'))
  },
  
  // 男性特有检查历史
  {
    id: 'maleExamHistory',
    question: '您过去是否做过以下检查？(可多选)',
    options: ['PSA检测', '前列腺超声', '以上都没做过', '不清楚'],
    type: 'checkbox',
    condition: answers => answers.gender === '男性' && ['40-49岁', '50-59岁', '60岁及以上'].includes(answers.age)
  },
  {
    id: 'psaYear',
    question: '您最近一次PSA检测是在哪一年？',
    type: 'number',
    placeholder: '例如：2020',
    condition: answers => answers.gender === '男性' && answers.maleExamHistory && answers.maleExamHistory.includes('PSA检测')
  },
  {
    id: 'psaResult',
    question: '您最近一次PSA检测结果是？',
    options: ['正常', '异常', '不清楚'],
    type: 'radio',
    condition: answers => answers.gender === '男性' && answers.maleExamHistory && answers.maleExamHistory.includes('PSA检测')
  },
  
  // 其他检查历史
  {
    id: 'otherExamHistory',
    question: '您是否做过以下检查？如做过，请选择',
    options: [
      '甲状腺功能', 
      '甲状腺抗体(TPO抗体)', 
      '骨密度检查', 
      '乙肝两对半', 
      '认知功能评估(MoCA量表)', 
      '衰弱评估(FRAIL量表)', 
      '眼底检查', 
      '以上都没做过'
    ],
    type: 'checkbox',
    required: false
  },
  
  // 常见疫苗接种史
  {
    id: 'hepBVaccination',
    question: '您是否接种过乙肝疫苗？',
    options: [
      '是，已完成全程接种，时间在10年内', 
      '是，已完成全程接种，但时间超过10年', 
      '是，但未完成全程接种', 
      '否', 
      '不清楚'
    ],
    type: 'radio',
    required: false
  },
  
  // 慢性病管理
  {
    id: 'chronicDiseaseManagement',
    question: '您过去一年内是否接受过以下慢性病管理措施？(可多选)',
    options: [
      '高血压规律复查及用药调整', 
      '糖尿病规律监测血糖及并发症筛查', 
      '血脂异常规律监测及用药调整', 
      '慢性肝病定期随访及评估', 
      '慢性肾病定期评估肾功能', 
      '以上都没有', 
      '不适用'
    ],
    type: 'checkbox',
    condition: answers => answers.chronicDiseases && !answers.chronicDiseases.includes('以上都没有')
  },
  
  // 筛查偏好
  {
    id: 'colonScreeningPreference',
    question: '您对结直肠癌筛查偏好哪种方式？',
    options: [
      '直接做结肠镜检查(创伤性但一次性检查更彻底)', 
      '先做无创的FIT-DNA检测，阳性再做结肠镜(分步骤筛查)', 
      '没有特别偏好，遵医嘱', 
      '不确定/不适用'
    ],
    type: 'radio',
    condition: answers => answers.age && ['40-49岁', '50-59岁', '60岁及以上'].includes(answers.age)
  },
  {
    id: 'mentalHealthTitle',
    type: 'section-title',
    title: '心理健康快速筛查'
  },
  {
    id: 'depressionNote',
    type: 'note',
    content: '请根据过去两周的感受选择最符合的选项（每题0-3分）：'
  },
  {
    id: 'depressionTitle',
    type: 'section-subtitle',
    title: 'A. 抑郁评估（PHQ-2扩展版）'
  },
  {
    id: 'depression1',
    question: '做事提不起兴趣或没有乐趣',
    options: ['完全不会', '几天', '一半以上天数', '几乎每天'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'depression'
  },
  {
    id: 'depression2',
    question: '感到情绪低落、沮丧或绝望',
    options: ['完全不会', '几天', '一半以上天数', '几乎每天'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'depression'
  },
  {
    id: 'depression3',
    question: '睡眠问题（难以入睡/早醒/嗜睡）',
    options: ['无', '轻度', '中度', '重度'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'depression'
  },
  {
    id: 'depression4',
    question: '疲劳或无精打采',
    options: ['无', '偶尔', '经常', '持续'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'depression'
  },
  {
    id: 'anxietyTitle',
    type: 'section-subtitle',
    title: 'B. 焦虑评估（GAD-2扩展版）'
  },
  {
    id: 'anxiety1',
    question: '感到紧张、焦虑或烦躁',
    options: ['完全不会', '几天', '一半以上天数', '几乎每天'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'anxiety'
  },
  {
    id: 'anxiety2',
    question: '不能停止或控制担忧',
    options: ['完全不会', '几天', '一半以上天数', '几乎每天'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'anxiety'
  },
  {
    id: 'anxiety3',
    question: '躯体症状（心悸/手抖/出汗等）',
    options: ['无', '轻度', '中度', '重度'],
    scores: [0, 1, 2, 3],
    type: 'radio',
    required: true,
    group: 'anxiety'
  }
];

// 修改初始化函数，不再需要fetch
function init() {
  try {
    // 清空之前的答案
    userAnswers = {};
    
    // 重新排序心理健康问题
    arrangeQuestionnaire();
    
    // 获取DOM元素
    const recommendationsDiv = document.getElementById('recommendations');
    const questionnaireDiv = document.getElementById('questionnaire');
    
    if (recommendationsDiv) {
      recommendationsDiv.style.display = 'none';
    }
    
    if (questionnaireDiv) {
      questionnaireDiv.style.display = 'block';
    }
    
    // 渲染问卷
    renderQuestionnaire();
    
    console.log("初始化完成");
  } catch (error) {
    console.error("初始化出错:", error);
  }
}

// 修改 arrangeQuestionnaire 函数，不直接修改 initialQuestionnaire 变量
function arrangeQuestionnaire() {
  // 只需处理抑郁和焦虑问题项，不再处理标题
  let newQuestionnaire = [];
  const mentalHealthItems = [];
  
  // 提取抑郁和焦虑问题
  for (let i = 0; i < initialQuestionnaire.length; i++) {
    const q = initialQuestionnaire[i];
    // 不再引用标题项
    if (q.id && q.id.startsWith('depression') && q.type === 'radio') {
      mentalHealthItems.push(q);
    } else if (q.id && q.id.startsWith('anxiety') && q.type === 'radio') {
      mentalHealthItems.push(q);
    } else if (!(q.id === 'mentalHealthTitle' || 
          q.id === 'depressionNote' ||
          q.id === 'depressionTitle' ||
          q.id === 'anxietyTitle')) {
      // 收集所有非心理健康标题的问题
      newQuestionnaire.push(q);
    }
  }
  
  // 找到合适的位置插入心理健康部分
  const colonScreeningIndex = newQuestionnaire.findIndex(q => q.id === 'colonScreeningPreference');
  if (colonScreeningIndex !== -1 && mentalHealthItems.length > 0) {
    // 在合适的位置插入心理健康问题（不包含标题）
    newQuestionnaire.splice(colonScreeningIndex + 1, 0, ...mentalHealthItems);
  } else {
    // 如果找不到合适位置，就添加到末尾
    newQuestionnaire.push(...mentalHealthItems);
  }
  
  // 使用全局变量存储排序后的项目
  window.initialQuestionnaireItems = newQuestionnaire;
}

// 修改 renderQuestionnaire 函数开始部分
function renderQuestionnaire() {
  const container = document.getElementById('questionnaire');
  container.innerHTML = ''; // 清空容器
  
  // 创建基本信息部分容器
  const basicInfoSection = document.createElement('div');
  basicInfoSection.className = 'section-container';
  container.appendChild(basicInfoSection);
  
  // 使用排序后的问卷项目
  const questionsToRender = window.initialQuestionnaireItems ? 
    window.initialQuestionnaireItems.filter(q => {
      if (!q.condition) return true;
      return q.condition(userAnswers);
    }) : 
    initialQuestionnaire.filter(q => {
      if (!q.condition) return true;
      return q.condition(userAnswers);
    });
  
  // 渲染每个问题
  questionsToRender.forEach(q => {
    const group = document.createElement('div');
    group.className = 'question-group';
    
    // 处理特殊类型的问题
    if (q.type === 'section-title') {
      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = q.title;
      container.appendChild(title);
      return;
    }
    
    if (q.type === 'section-subtitle') {
      const subtitle = document.createElement('h3');
      subtitle.className = 'section-subtitle';
      subtitle.textContent = q.title;
      container.appendChild(subtitle);
      return;
    }
    
    if (q.type === 'note') {
      const note = document.createElement('p');
      note.className = 'note';
      note.textContent = q.content;
      container.appendChild(note);
      return;
    }

    // 处理常规问题
    if (q.question) {
      const title = document.createElement('h3');
      title.innerHTML = q.question;
      if (q.required) {
        title.innerHTML += ' <span class="required">*</span>';
      }
      group.appendChild(title);
    }

    if (q.type === 'radio' || q.type === 'checkbox') {
      q.options.forEach((opt, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-item';
        
        const input = document.createElement('input');
        input.type = q.type;
        input.id = `${q.id}-${index}`;
        input.name = q.id;
        input.value = opt;
        
        // 设置选中状态
        if (q.type === 'checkbox') {
          input.checked = userAnswers[q.id] && userAnswers[q.id].includes(opt);
        } else {
          input.checked = userAnswers[q.id] === opt;
        }
        
        // 添加事件监听器 - 这里是关键问题所在
        input.addEventListener('change', () => {
          if (q.type === 'checkbox') {
            // 对于复选框，需要获取所有选中的值
            if (!userAnswers[q.id]) {
              userAnswers[q.id] = [];
            }
            
            if (input.checked) {
              // 添加选中的值
              if (!userAnswers[q.id].includes(opt)) {
                userAnswers[q.id].push(opt);
              }
            } else {
              // 移除取消选中的值
              userAnswers[q.id] = userAnswers[q.id].filter(item => item !== opt);
            }
          } else {
            // 单选框直接更新值
            userAnswers[q.id] = opt;
          }
          
          console.log(`Updated ${q.id}:`, userAnswers[q.id]);
          
          // 触发问卷重渲染，显示/隐藏条件性问题
          renderQuestionnaire();
        });
        
        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = opt;
        
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        group.appendChild(wrapper);
      });
    } else if (q.type === 'number' || q.type === 'text') {
      const input = document.createElement('input');
      input.type = q.type;
      input.id = q.id;
      input.placeholder = q.placeholder || '';
      input.value = userAnswers[q.id] || '';
      
      input.addEventListener('change', () => {
        userAnswers[q.id] = input.value;
      });
      
      group.appendChild(input);
    }

    // 决定添加到哪个区域
    basicInfoSection.appendChild(group);
  });
  
  // 添加健康风险因素部分
  if (questionsToRender.some(q => q.id === 'familyHistory' || q.id === 'chronicDiseases')) {
    const riskTitle = document.createElement('h2');
    riskTitle.className = 'section-title';
    riskTitle.textContent = '健康风险评估';
    container.appendChild(riskTitle);
    
    const riskSection = document.createElement('div');
    riskSection.className = 'section-container';
    container.appendChild(riskSection);
    
    // 将健康风险相关问题移动到风险部分
    const riskQuestions = ['familyHistory', 'familyCancer', 'chronicDiseases', 'symptoms'];
    questionsToRender.forEach(q => {
      if (riskQuestions.includes(q.id)) {
        // 使用更兼容的选择器方法
        const groups = basicInfoSection.querySelectorAll('.question-group');
        for (const group of groups) {
          if (group.querySelector(`[name="${q.id}"]`)) {
            riskSection.appendChild(group);
            break;
          }
        }
      }
    });
  }

  // 添加提交按钮
  const submitBtn = document.createElement('button');
  submitBtn.className = 'submit-button';
  submitBtn.textContent = '生成我的体检推荐';
  submitBtn.addEventListener('click', validateAndSubmit);
  container.appendChild(submitBtn);
}

// 验证数据并提交
function validateAndSubmit() {
  console.log("开始验证提交流程...");
  console.log("当前用户答案:", userAnswers);
  
  try {
    // 获取所有显示出来的必填问题
    const visibleQuestions = initialQuestionnaire.filter(q => {
      // 跳过标题和说明
      if (q.type === 'section-title' || q.type === 'section-subtitle' || q.type === 'note') {
        return false;
      }
      
      // 检查条件性问题
      if (q.condition) {
        return q.condition(userAnswers);
      }
      
      return true;
    });
    
    console.log("可见问题:", visibleQuestions.map(q => q.id));
    
    // 只检查必填的问题
    const requiredQuestions = visibleQuestions.filter(q => q.required);
    console.log("必填问题:", requiredQuestions.map(q => q.id));
    
    // 验证必填问题
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = userAnswers[q.id];
      console.log(`检查问题 ${q.id}:`, answer);
      
      if (answer === undefined || answer === '') {
        return true;
      }
      if (Array.isArray(answer) && answer.length === 0) {
        return true;
      }
      return false;
    });
    
    console.log("缺失答案:", missingAnswers.map(q => q.id));
    
    if (missingAnswers.length > 0) {
      alert(`请回答以下必填问题:\n${missingAnswers.map(q => q.question).join('\n')}`);
      return;
    }
    
    // 计算BMI
    if (userAnswers.height && userAnswers.weight) {
      const height = parseFloat(userAnswers.height) / 100;
      const weight = parseFloat(userAnswers.weight);
      if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
        const bmi = weight / (height * height);
        userAnswers.bmi = bmi.toFixed(1);
      }
    }
    
    // 生成推荐方案
    generateRecommendation();
  } catch (error) {
    console.error('验证过程出错:', error);
    alert('验证过程出现错误，请检查填写的信息是否正确。');
  }
}

// 生成推荐方案 - 更新处理特殊条件和筛查偏好
function generateRecommendation() {
  // 获取基础项目
  const baseItems = [...decisionTreeData.base_items];
  let additionalItems = [];
  let cardioRiskScore = 0;
  let tumorRiskScore = 0;

  // 获取用户年龄和性别
  const age = parseInt(userAnswers.age);
  const gender = userAnswers.gender;

  // 计算心血管风险评分
  decisionTreeData.risk_scoring.cardiovascular.forEach(factor => {
    if (
      (factor.factor === "年龄≥50" && age >= 50) ||
      (factor.factor === "男性或绝经后女性" && (gender === '男性' || (gender === '女性' && userAnswers.menstruation === '已绝经'))) ||
      (factor.factor === "吸烟" && userAnswers.smoking === '目前吸烟') ||
      (factor.factor === "高血压" && userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('高血压')) ||
      (factor.factor === "糖尿病" && userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('糖尿病')) ||
      (factor.factor === "血脂异常" && userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('血脂异常')) ||
      (factor.factor === "BMI≥28" && parseFloat(userAnswers.bmi) >= 28) ||
      (factor.factor === "腰围超标（男≥90cm/女≥85cm）" && 
        ((gender === '男性' && parseFloat(userAnswers.waist) >= 90) ||
         (gender === '女性' && parseFloat(userAnswers.waist) >= 85))) ||
      (factor.factor === "家族心血管病史" && userAnswers.familyHistory && 
        userAnswers.familyHistory.includes('心血管疾病(心脏病、中风等)')) ||
      (factor.factor === "缺乏运动" && userAnswers.exercise === '缺乏运动(几乎不运动)') ||
      (factor.factor === "慢性肾病（eGFR<60）" && userAnswers.chronicDiseases && 
        userAnswers.chronicDiseases.includes('慢性肾病(eGFR<60ml/min)'))
    ) {
      cardioRiskScore += factor.score;
    }
  });

  // 计算肿瘤风险评分
  decisionTreeData.risk_scoring.tumor.forEach(factor => {
    if (
      (factor.factor === "年龄≥50岁" && age >= 50) ||
      (factor.factor === "吸烟≥10年" && userAnswers.smoking === '目前吸烟' && 
        parseInt(userAnswers.smokingYears) >= 10) ||
      (factor.factor === "长期饮酒" && userAnswers.drinking === '经常饮酒(每周1次或以上)') ||
      (factor.factor === "家族癌症史" && userAnswers.familyHistory && 
        (userAnswers.familyHistory.includes('胃癌') || 
         userAnswers.familyHistory.includes('结肠癌') ||
         userAnswers.familyHistory.includes('乳腺癌') ||
         userAnswers.familyHistory.includes('前列腺癌') ||
         userAnswers.familyHistory.includes('肺癌') ||
         userAnswers.familyHistory.includes('其他癌症(请在备注中说明)'))) ||
      (factor.factor === "职业暴露" && userAnswers.occupation && 
        userAnswers.occupation.some(item => 
          ['粉尘(如煤矿、建筑、纺织等行业)', 
           '化学物质(如油漆、溶剂、农药等)',
           '放射线(如医疗放射、核工业等)'].includes(item))) ||
      (factor.factor === "慢性感染（如HBV）" && userAnswers.chronicDiseases && 
        userAnswers.chronicDiseases.includes('乙肝病毒感染')) ||
      (factor.factor === "肥胖(BMI≥28)" && parseFloat(userAnswers.bmi) >= 28)
    ) {
      tumorRiskScore += factor.score;
    }
  });

  // 关联检查项目
  // 50岁以上男性关联前列腺 PSA 筛查
  if (age >= 50 && gender === '男性') {
    additionalItems.push("前列腺 PSA 筛查");
  }

  // 40岁以上女性关联乳腺钼靶
  if (age >= 40 && gender === '女性') {
    additionalItems.push("乳腺钼靶");
  }

  // 乳腺钼靶的推荐逻辑
  const breastCheckOptions = userAnswers['乳腺相关检查'] || [];
  if (breastCheckOptions.includes('乳腺钼靶')) {
    additionalItems.push("乳腺钼靶");
  }

  // 将结果展示到页面
  displayResults(baseItems, additionalItems, cardioRiskScore, tumorRiskScore);

  console.log(`用户年龄: ${age}, 性别: ${gender}`);
  console.log(`推荐项目: ${additionalItems}`);
}

// 显示结果 - 增强版
function displayResults(baseItems, addedItems, cardioRiskScore, tumorRiskScore) {
  try {
    console.log("显示结果...");
    
    // 获取DOM元素
    const recommendationsDiv = document.getElementById('recommendations');
    const questionnaireDiv = document.getElementById('questionnaire');
    
    if (!recommendationsDiv) {
      console.error('找不到推荐结果显示区域 (recommendations div)');
      return;
    }
    
    if (!questionnaireDiv) {
      console.error('找不到问卷区域 (questionnaire div)');
      return;
    }
    
    // 清空结果区域
    recommendationsDiv.innerHTML = '';
    
    // 先设置样式，确保可见性更改
    recommendationsDiv.className = ''; // 清除原有类
    recommendationsDiv.style.display = 'block';
    questionnaireDiv.style.display = 'none';
    
    // 计算BMI和腰臀比
    const bmi = userAnswers.bmi ? parseFloat(userAnswers.bmi).toFixed(1) : "未计算";
    let whr = "";
    if (userAnswers.waist && userAnswers.hipCircumference) {
      whr = (parseFloat(userAnswers.waist) / parseFloat(userAnswers.hipCircumference)).toFixed(2);
    }
    
    // 创建结果内容
    let htmlContent = `
      <div class="recommendation-summary">
        <h3>体检摘要</h3>
        <p>根据您提供的信息，我们为您生成了个性化体检方案。</p>
        <p><strong>基础信息：</strong>${userAnswers.gender}，${userAnswers.age}</p>
        <p><strong>身体指标：</strong>BMI: ${bmi} ${bmi >= 24 ? "(超重)" : bmi >= 28 ? "(肥胖)" : ""}</p>
        ${whr ? `<p><strong>腰臀比：</strong>${whr} ${(userAnswers.gender === '男性' && whr > 0.9) || (userAnswers.gender === '女性' && whr > 0.85) ? "(腹型肥胖风险)" : ""}</p>` : ""}
      </div>
      
      <div class="risk-scores">
        <h3>健康风险评估</h3>
        <p><strong>心血管疾病风险：</strong> ${getRiskLevel(cardioRiskScore, 9)}</p>
        <p><strong>肿瘤筛查风险：</strong> ${getRiskLevel(tumorRiskScore, 7)}</p>
      </div>
      
      <div class="recommendation-package">
        <p><strong>常规体检项目：</strong></p>
        <ul class="base-items">
          ${baseItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <p><strong>根据您的个人情况推荐的加项：</strong></p>
        <ul class="age-items">
          ${addedItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
    
    // 根据不同情况添加特殊提示
    let specialNotes = [];
    
    // 计划妊娠女性
    if (userAnswers.gender === '女性' && userAnswers.pregnancy === '是') {
      specialNotes.push(`
        <li>计划妊娠女性建议在孕前3-6个月补充叶酸400μg/天</li>
        <li>检查甲状腺功能对于妊娠准备至关重要</li>
        <li>维生素D水平对胎儿骨骼发育有重要影响</li>
      `);
    }
    
    // 吸烟人群
    if (userAnswers.smoking && userAnswers.smoking !== '从不吸烟') {
      specialNotes.push(`
        <li>吸烟会增加多种疾病风险，建议尽早戒烟</li>
        <li>戒烟5年后，心脏病风险可降低约50%</li>
        <li>戒烟10年后，肺癌风险可降低约50%</li>
      `);
    }
    
    // 高血压人群
    if (userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('高血压')) {
      specialNotes.push(`
        <li>建议定期监测血压，保持在130/80mmHg以下</li>
        <li>减少盐摄入量，控制在每天6g以下</li>
        <li>每年至少进行一次心血管并发症筛查</li>
      `);
    }
    
    // 糖尿病人群
    if (userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('糖尿病')) {
      specialNotes.push(`
        <li>建议每3-6个月检测一次糖化血红蛋白(HbA1c)</li>
        <li>每年进行肾脏、眼底和足部检查</li>
        <li>注意控制碳水化合物摄入，定期监测血糖</li>
      `);
    }
    
    // 乙肝病毒感染者
    if (userAnswers.chronicDiseases && userAnswers.chronicDiseases.includes('乙肝病毒感染')) {
      specialNotes.push(`
        <li>建议每半年进行一次肝功能和B超检查</li>
        <li>每年进行一次甲胎蛋白(AFP)检测</li>
        <li>根据病情可能需要定期检测乙肝病毒DNA载量</li>
      `);
    }
    
    // 添加特殊提示
    if (specialNotes.length > 0) {
      htmlContent += `
        <div class="special-notes">
          <h3>健康管理提示</h3>
          <ul>
            ${specialNotes.join('')}
          </ul>
        </div>
      `;
    }
    
    // 添加按钮和免责声明
    htmlContent += `
      <div class="actions">
        <button id="print-results" class="action-button print-button" onclick="window.print()">打印方案</button>
        <button id="restart" class="action-button restart-button" onclick="location.reload()">重新填写</button>
      </div>
      
      <div class="disclaimer">
        <p><strong>免责声明：</strong>本推荐方案基于您提供的信息和医学筛查指南生成，仅供参考，不构成医疗建议。具体检查项目请咨询医生，并根据医生建议进行选择。</p>
      </div>
    `;
    
    // 更新页面内容
    recommendationsDiv.innerHTML = htmlContent;

    // 设置内容后再次确认显示状态
    setTimeout(() => {
      recommendationsDiv.style.display = 'block';
      questionnaireDiv.style.display = 'none';
      console.log("确认结果区域已显示");
    }, 100);
  } catch (error) {
    console.error("显示结果时出错:", error);
    alert("显示推荐结果时出现错误，请刷新页面重试。");
  }
}

// 获取风险等级描述
function getRiskLevel(score, highThreshold) {
  if (score <= 2) {
    return `<span style="color: green;">低风险 (${score}分)</span>`;
  } else if (score <= highThreshold) {
    return `<span style="color: orange;">中度风险 (${score}分)</span>`;
  } else {
    return `<span style="color: red;">高风险 (${score}分)</span>`;
  }
}

// 页面加载完成后初始化
window.onload = init;

// 添加重新开始的函数
function restartForm() {
  try {
    // 重置所有状态
    userAnswers = {};
    
    // 获取DOM元素
    const recommendationsDiv = document.getElementById('recommendations');
    const questionnaireDiv = document.getElementById('questionnaire');
    
    if (recommendationsDiv) {
      recommendationsDiv.style.display = 'none';
      recommendationsDiv.className = 'hidden';
    }
    
    if (questionnaireDiv) {
      questionnaireDiv.style.display = 'block';
    }
    
    // 重新渲染问卷
    renderQuestionnaire();
    
    console.log("重新开始");
  } catch (error) {
    console.error("重置表单出错:", error);
  }
}