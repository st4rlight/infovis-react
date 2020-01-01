const Path = require('path');
const fs   = require('fs');
const csv  = require('csvtojson');
const nodejieba = require("nodejieba");
const axios = require('axios');
const ProgressBar = require('./progress_bar');

// 保存所有原始文件的路径
let initialPaths = [];
let all_participle = {};
let all_locations = {};
let all_weeks = [];
let all_types = {};
let all_md5 = {};
let all_24hour = {};
let calendar = {};
let err_cnt = 0;
let all_new_locations = {};
let all_heatMap = {};
let beijing = JSON.parse(fs.readFileSync(Path.join(__dirname, 'public', 'data', 'beijing.json')).toString());

function init_24hour(){
    let obj = {
        '违法信息': {
            'data': [],
            '代开发票': [],
            '办证刻章': [],
            '特殊服务': [],
            '催债贷款': [],
            '违规收分和车辆': []
        },
        '广告推销': {
            'data': [],
            '其他广告': [],
            '房产广告': [],
            '招聘信息': [],
            '赌博麻将': []
        },
        '诈骗短信': {
            'data': [],
            '各类诈骗': [],
        },
        '骚扰信息': {
            'data': [],
            '造谣诽谤诅咒': [],
            '无用或丢失': []
        },
    };
    Object.keys(obj).forEach(key => {
        Object.keys(obj[key]).forEach(type => {
            obj[key][type] = new Array(24);
            obj[key][type].fill(0);
        })
    });

    return obj;
}
all_24hour = init_24hour();



function isInPolygon(checkPoint, polygonPoints) {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                if (p1[0] != p2[0]) {
                    xinters =
                        (checkPoint[0] - p1[0]) *
                            (p2[1] - p1[1]) /
                            (p2[0] - p1[0]) +
                        p1[1];
                    if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 == 0) {
        return false;
    } else {
        return true;
    }
}


// 判断内容属于哪个类别，返回值包括一个main_type，一个sub_type
function checkType(content){
    // 替换特殊字符为空字符
    content = content.replace(' ', '')
    content = content.replace('\n', '')
    content = content.replace('“', '')
    content = content.replace('”', '')
    content = content.replace('【', '')
    content = content.replace('】', '')
    content = content.replace('(', '')
    content = content.replace(')', '')
    content = content.replace('（', '')
    content = content.replace('）', '')
    content = content.replace('|', '')
    content = content.replace('~', '')
    content = content.replace('-', '')
    content = content.replace('*', '')
    content = content.replace('～', '')

    // 判断content中是否含有list中的字符
    function hasWord(content, list) {
        return list.some((item) => {
            return content.includes(item);
        });
    }

    let result = {};
    if(hasWord(content, ["票据", "发票", "代开", "增值", "开票", "规嘌", "發票", "税票", "fa", "piao", "税", "点低"])){
         result['sub_type'] = '代开发票';
        result['main_type'] = '违法信息';
    }
    else if(hasWord(content, ["美女", "上门女", "SPA", "学生妹", "妹妹", "情趣", "上门服务", "上门小姐", "性爱", "男人请加我", "男人加我"])){
         result['sub_type'] = "特殊服务";
        result['main_type'] = '违法信息';
    }
    else if(hasWord(content, ["信用卡", "工行", "光大", "银行", "额度", "积分"])){
         result['sub_type'] = "各类诈骗";
        result['main_type'] = '诈骗短信';
    }
    else if(hasWord(content, ["首付", "三居", "现房", "旺铺", "电梯房", "黄金地段", "海景房", "宜居", "楼房", "公寓", "配套齐全", "房源", "居室", "洋房", "农家院", "学区", "大盘", "小院", "看房", "每平", "面积", "平米", "楼盘", "位置好", "户型"])){
         result['sub_type'] = "房产广告";
        result['main_type'] = '广告推销';
    }
    else if(hasWord(content, ["贷", "借款", "资金", "pos", "欠款", "债款", "利息", "放款", "追债", "要钱", "债务", "催收", "拿钱", "用钱", "套现", "提现", "融聚"])){
         result['sub_type'] = "催债贷款";
        result['main_type'] = '违法信息';
    }
    else if(hasWord(content, ["办证", "证件", "报销", "刻章", "资格证", "印章", "长期办理", "毕业证", "下证", "㊣件", "免考试", "保真"])){
         result['sub_type'] = "办证刻章";
        result['main_type'] = '违法信息';
    }
    else if(hasWord(content, ["麻将", "牌", "百家乐", "投注", "线上娱乐", "网上娱乐", "澳門", "澳门", "博彩", "低风险", "赌", "投註", "输完"])){
         result['sub_type'] = "赌博麻将";
        result['main_type'] = '广告推销';
    }
    else if(hasWord(content, ["Apple", "苹果", "iPhone", "丢失"])){
         result['sub_type'] = "各类诈骗";
        result['main_type'] = '诈骗短信';
    }
    else if(hasWord(content, ["航空", "铁路"])){
         result['sub_type'] = "各类诈骗";
        result['main_type'] = '诈骗短信';
    }
    else if(hasWord(content, ["急招", "招聘", "招人", "招工"])){
         result['sub_type'] = "招聘信息";
        result['main_type'] = '广告推销';
    }
    else if(hasWord(content, ["绿帽子","王八蛋","见阎王", "破坏家庭","中共","江泽民", "回电话", "爱人", "睡了", "逼", "妈", "你家女人", "操过", "打不通", "迫害", "傻逼", "侵犯", "触犯", "谴责", "祖宗", "操你", "不讲","死", "自己瞧瞧", "停电"])){
         result['sub_type'] = "造谣诽谤诅咒";
        result['main_type'] = '骚扰信息';
    }
    else if(hasWord(content, ["驾驶证分", "车辆", "报废"])){
         result['sub_type'] = "违规收分和车辆";
        result['main_type'] = '违法信息';
    }
    else if(hasWord(content, ["驾校"])){
         result['sub_type'] = "其他广告";
        result['main_type'] = '广告推销';
    }
    else if(hasWord(content, ["清零", "语音信箱", "密码", "充值", "咨询", "资费", "套餐"]) && (hasWord(content, ["移动", "联通", "电信"])) || (hasWord(content, ["流量"]))){
         result['sub_type'] = "各类诈骗";
        result['main_type'] = '诈骗短信';
    }
    else if(hasWord(content, ["积分", "解锁", "换微信", "验证码", "给我汇钱", "转发消息", "信誉", "闲鱼", "奖励", "分享", "获奖", "中奖", "福利", "邀请函", "违章", "淘宝", "敢死队", "现金券", "冻结", "异常", "维护", "激活", "拨打过", "彩铃", "来电提醒", "会议", "高回报", "简历", "股", "操盘", "滴滴"]) || (hasWord(content, ["获得"]) && hasWord(content, ["机会"]))){
         result['sub_type'] = "各类诈骗";
        result['main_type'] = '诈骗短信';
    }
    else if(hasWord(content, ["群发", "指哪发哪", "推广信息"])){
         result['sub_type'] = "其他广告";
        result['main_type'] = '广告推销';
    }
    else if(hasWord(content, ["无法显示", "信息丢失", "文本丢失"])){
         result['sub_type'] = "无用或丢失";
        result['main_type'] = '骚扰信息';
    }
    else if(hasWord(content, ["恭喜发财", "注意防火", "你好", "送去", "WARNING", "挪走车", "小白", "fb", "经理"]) || content.length <= 20){
         result['sub_type'] = "无用或丢失";
        result['main_type'] = '骚扰信息';
    }
    else{
         result['sub_type'] = "其他广告";
        result['main_type'] = '广告推销';
    }

    return result;
}


// 生成所有原始文件的路径
function initInitialPaths(){
    // 用于生成原始文件路径
    pathGenerate = (month, start, end, initialPaths) => {
        for (let i = start; i <= end; i++) {
            let tempPath = '';
            if (i < 10)
                tempPath = Path.join(__dirname, 'data', `20170${month}0${i}.csv`);
            else
                tempPath = Path.join(__dirname, 'data', `20170${month}${i}.csv`);

            initialPaths.push(tempPath);
        }
    }

    pathGenerate(2, 23, 28, initialPaths);
    pathGenerate(3,  1, 31, initialPaths);
    pathGenerate(4,  1, 26, initialPaths);

}

// 创建所有结果文件夹
function createDirs(){
    let paths = [];
    
    // 词云
    paths.push(Path.join(__dirname, 'public', 'data', 'WordCloud'));
    // 各区位置
    paths.push(Path.join(__dirname, 'public', 'data', 'Locations'));
    // 周分布
    paths.push(Path.join(__dirname, 'public', 'data', 'Weeks'));
    // 信息分类
    paths.push(Path.join(__dirname, 'public', 'data', 'Types'));
    // 24小时分布
    paths.push(Path.join(__dirname, 'public', 'data', '24hours'))
    // 威胁日历
    paths.push(Path.join(__dirname, 'public', 'data', 'Calendar'));
    // 代表性类型分时段
    paths.push(Path.join(__dirname, 'public', 'data', 'Periods'));
    // 当日最多短信数量统计，替代路线图
    paths.push(Path.join(__dirname, 'public', 'data', 'MostMD5'));
    // 热力地图
    paths.push(Path.join(__dirname, 'public', 'data', 'HeatMap'));

    paths.forEach(path => {
        if(!fs.existsSync(path))
            fs.mkdirSync(path);
    });
}

// 处理词云
function DealWordCloud(content, participle, all_participle){
    // 跳过一些无关的关键词
    function skip(item){
        const arr = [
            '电话', '你好', '打扰', '您好', '尊敬',
            '用户', '详情', '满意', '完成', '见谅',
            '先生', '女士', '需要', '咨询', '联系',
            '即将', '海涵', '小时', '如有', '谅解',
            '请谅解', '即将'
        ];
        
        return arr.includes(item);
    }

    // 关键字提取
    const result_part = nodejieba.extract(content, 20);
    // 关键字统计
    result_part.forEach(item => {
        let word = item.word;
        for(let i = 0; i < word.length; i++){
            if(skip(word))
                return;
            if(word[i].toLowerCase().charCodeAt(0) >= 'a'.charCodeAt(0) && word[i].toLowerCase().charCodeAt(0) <= 'z'.charCodeAt(0))
                return;
            if(!isNaN(parseInt(word[i])))
                return;
        }
            participle[word] =     participle[word] ?     (participle[word] + 1) : 1;
        all_participle[word] = all_participle[word] ? (all_participle[word] + 1) : 1;        
    });
}

// 短信区域分布
async function DealLocations(loca_str, locations, all_locations){
    let url = `https://restapi.amap.com/v3/geocode/regeo?key=56e19aa038520f4b32e0c729a064918c&output=JSON&location=${loca_str}`;
    let res = await axios.get(url);

    let address = '';
    try{
        if(res.data.regeocode.addressComponent.district)
            address = res.data.regeocode.addressComponent.district;
        else
            address = res.data.regeocode.formatted_address.substr(3, 3);
        
        if(!address)
            throw new Error('');

            locations[address] =     locations[address] ?     (locations[address] + 1) : 1;
        all_locations[address] = all_locations[address] ? (all_locations[address] + 1) : 1;
    }catch(err){
        err_cnt++;
    }
}

// 周分布
function DealWeeks(json, all_weeks){
    let timeObj = new Date(parseInt(json.recitime));
    let     day = timeObj.getDay();

    if(!all_weeks[day]){
        all_weeks[day] = {
            '违法信息': 0,
            '广告推销': 0,
            '骚扰信息': 0,
            '诈骗短信': 0
        };
    }

    let type = checkType(json.content);
    all_weeks[day][type.main_type]++;
}

// 短信内容分类
function DealType(json, types, all_types){
    let type = checkType(json.content);

        types[type.sub_type] =     types[sub_type] ?     types[sub_type] + 1 : 1;
    all_types[type.sub_type] = all_types[sub_type] ? all_types[sub_type] + 1 : 1;
}

function DealMostMD5(json, md5, all_md5){
    if(!md5[json.md5])
        md5[json.md5] = {};
    if(!all_md5[json.md5])
        all_md5[json.md5] = {};

        md5[json.md5].cnt =     md5[json.md5].cnt ?     md5[json.md5].cnt + 1 : 1;
    all_md5[json.md5].cnt = all_md5[json.md5].cnt ? all_md5[json.md5].cnt + 1 : 1;

        md5[json.md5].content =     md5[json.md5].content ?     md5[json.md5].content : json.content;
    all_md5[json.md5].content = all_md5[json.md5].content ? all_md5[json.md5].content : json.content;

    // if(!md5[json.md5].phones)
    //     md5[json.md5].phones = [];
    // if(!all_md5[json.md5].phones)
    //     all_md5[json.md5].phones = [];
    
    //     md5[json.md5].phones[json.phone] =     md5[json.md5].phones[json.phone] ?     md5[json.md5].phones[json.phone] + 1 : 1;
    // all_md5[json.md5].phones[json.phone] = all_md5[json.md5].phones[json.phone] ? all_md5[json.md5].phones[json.phone] + 1 : 1;
}

// 垃圾短信类别的24小时分布
function Deal24Hours(json, _24hour, all_24hour){
    let type = checkType(json.content);

    let timeObj = new Date(parseInt(json.recitime));
    let    hour = timeObj.getHours();

       _24hour[type.main_type]['data'][hour]++;
    all_24hour[type.main_type]['data'][hour]++;

       _24hour[type.main_type][type.sub_type][hour]++;
    all_24hour[type.main_type][type.sub_type][hour]++;
}

// 每日总数统计
function DealCalendar(json, calendar){
    let timeObj = new Date(parseInt(json.recitime));
    let   month = timeObj.getMonth() + 1;
    let    date = timeObj.getDate();

    let key = month + '' + (date < 10 ? '0' + date : date);
    calendar[key] = calendar[key] ? calendar[key] + 1 : 1;
}

// 新版测试点的位置
function DealNewLocations(json, new_locations, all_new_locations){
    let result = '';
    let center = '';
    let point = [parseFloat(json.lng), parseFloat(json.lat)];
    for(let i = 0; i < beijing.features.length; i++){
        let flag = beijing.features[i].geometry.coordinates.some(item => {
            return item.some(list => {
                return isInPolygon(point, list);
            });
        })
        if(flag){
            result = beijing.features[i].properties.name;
            center = beijing.features[i].properties.centroid;
            break;
        }
    }
    
    if(result === '')
        return;
    if(!new_locations)
        new_locations = {};
    if(!all_new_locations)
        all_new_locations = {};

    if(!new_locations[result]){
        new_locations[result] = {
            cnt: 0,
            center: center
        };
    }
    if(!all_new_locations[result]){
        all_new_locations[result] = {
            cnt: 0,
            center: center
        };
    }

    new_locations[result].cnt++;
    all_new_locations[result].cnt++;
}

// 处理热力图数据
function DealHeatMap(json, heatMap, all_heatMap){
    if(!heatMap[json.lng])
        heatMap[json.lng] = {};
    if(!all_heatMap[json.lng])
        all_heatMap[json.lng] = {};
    
    if(!heatMap[json.lng][json.lat])
        heatMap[json.lng][json.lat] = 0;
    if(!all_heatMap[json.lng][json.lat])
        all_heatMap[json.lng][json.lat] = 0;

    heatMap[json.lng][json.lat]++;
    all_heatMap[json.lng][json.lat]++;
}

function sort_data(data){
    let temp = [];
    Object.keys(data).forEach(item => {
        temp.push({
            key: item,
            value: data[item]
        });
    })
    temp.sort((a, b) => {
        return b.value - a.value;
    })

    return temp;
}
function write_word(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'WordCloud', str + '.json');

    let temp = sort_data(data);
    temp = temp.slice(0, (100 < temp.length) ? 100 : temp.length);
    fs.writeFileSync(write_path, JSON.stringify(temp));

    console.log('word_cloud done');
}
function write_location(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'Locations', str + '.json');
    let temp = sort_data(data);
    fs.writeFileSync(write_path, JSON.stringify(temp));

    console.log('write_location done');
}
function write_weeks(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'Weeks', str + '.json');
    fs.writeFileSync(write_path, JSON.stringify(data));

    console.log('write_weeks done');
}
function write_calendar(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'Calendar', str + '.json');
    fs.writeFileSync(write_path, JSON.stringify(data));

    console.log('write_calendar done');
}
function write_24hour(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', '24hours', str + '.json');
    fs.writeFileSync(write_path, JSON.stringify(data));

    console.log('write_24hours done');
}
function write_allweeks(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'Weeks', str + '.json');
    fs.writeFileSync(write_path, JSON.stringify(data));

    console.log('write_all_weeks done');
}
function write_mostmd5(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'MostMD5', str + '.json');
    let result = [];
    Object.keys(data).forEach(key => {
        result.push({
            key: key,
            value: data[key]
        });
    });
    result.sort((a, b) => {
        return b.value.cnt - a.value.cnt;
    });

    result = result.slice(0, 20);

    
    //2.建立通道
    let ws = fs.createWriteStream(write_path);

    //3.打开通道
    ws.once('open', ()=>{
        console.log('通道已经打开');
        let str = JSON.stringify(result);
        console.log(str);
        for(let i = 0; i < str.length; i += 10)
            ws.write(str.substr(i, 10));
        console.log('write_most_md5 done');
        ws.close();
    })

    ws.once('close', ()=>{
        console.log('通道已经关闭');
    })

}
function write_new_locations(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'NewLocations', str + '.json');
    //2.建立通道
    let ws = fs.createWriteStream(write_path);

    //3.打开通道
    ws.once('open', ()=>{
        console.log('通道已经打开');
        let str = JSON.stringify(data);
        for(let i = 0; i < str.length; i += 10)
            ws.write(str.substr(i, 10));
        console.log('write_new_locations done');
        ws.close();
    })

    ws.once('close', ()=>{
        console.log('通道已经关闭');
    })
}
function write_heat_map(str, data){
    let write_path = Path.join(__dirname, 'public', 'data', 'HeatMap', str + '.json');
    //2.建立通道
    let ws = fs.createWriteStream(write_path);

    //3.打开通道
    ws.once('open', () => {
        console.log('通道已经打开');
        let str = JSON.stringify(data);
        for(let i = 0; i < str.length; i += 10)
            ws.write(str.substr(i, 10));
        console.log('write_heap_map done');
        ws.close();
    })

    ws.once('close', ()=>{
        console.log('通道已经关闭');
    })
}

createDirs();
initInitialPaths();

let cnt = 0;
(async () =>{
    for(let path of initialPaths){
        const jsonArray = await csv().fromFile(path);
        const   timeObj = new Date(parseInt(jsonArray[0].recitime));
        const     month = timeObj.getMonth() + 1;
        const      date = timeObj.getDate();
        console.log(`--- ${month} ${date} start ---`);

        // let md5 = {};
        // let new_locations = {};
        let heatMap = {};

        var pb = new ProgressBar('处理进度', 50);
        for(let i = 0; i < jsonArray.length; i++){
            let json = jsonArray[i];

            // DealMostMD5(json, md5, all_md5)
            // DealWeeks(json, all_weeks);
            // Deal24Hours(json, _24hour, all_24hour);
            // DealCalendar(json, calendar);
            // DealNewLocations(json, new_locations, all_new_locations);
            DealHeatMap(json, heatMap, all_heatMap);
            pb.render({ completed: i, total: jsonArray.length });
            // await DealLocations(json.lng + ',' + json.lat, locations, all_locations);
        }
        let str = month + '' + (date < 10 ? '0' + date : date);
        write_heat_map(str, heatMap);
    }
    write_heat_map('total', all_heatMap);
    // write_new_locations('total', all_new_locations);
    // write_allweeks('total', all_weeks);
    // write_24hour('total', all_24hour);
})();
