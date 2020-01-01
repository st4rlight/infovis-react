const Path = require('path');
const fs   = require('fs');
const csv  = require('csvtojson');
const nodejieba = require("nodejieba");

nodejieba.load({
    userDict: './user.utf8',
});

const MONTH = 3;
const   DAY = 31;
const  HALF = 48;

let resultTypes = [];
let typedMessages = [];
let initialPaths = [];
let participle = {};
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

// 创建结果文件夹
function createDirs(){
    for(let i = 0; i < MONTH; i++){
        let path = Path.join(__dirname, 'results', `month${i+2}`);
        if(!fs.existsSync(path))
            fs.mkdirSync(path);
        for(let k = 0; k < DAY; k++){
            let day_dir_path = Path.join(__dirname, 'results', `month${i+2}`, `day${k + 1}`);
            if(!fs.existsSync(day_dir_path))
                fs.mkdirSync(day_dir_path);
        }
    }
}
// 用于生成原始文件路径
function pathGenerate(month, start, end, initialPaths) {
    for (let i = start; i <= end; i++) {
        let tempPath = '';
        if (i < 10)
            tempPath = Path.join(__dirname, 'data', `20170${month}0${i}.csv`);
        else
            tempPath = Path.join(__dirname, 'data', `20170${month}${i}.csv`);

        initialPaths.push(tempPath);
    }
}

// 判断ele是否在所有的类型中
function testType(ele) {
    let mylist = ["代开发票", "特殊服务", "各类诈骗", "房产广告", "催债贷款", "办证刻章", "赌博麻将", "造谣诽谤诅咒", "无用或丢失", "招聘信息", "收驾驶证分和违规车辆", "其他广告"];
    return mylist.includes(ele);
}

// 判断content中是否含有list中的字符
function hasWord(content, list) {
    return list.some((item) => {
        return content.includes(item);
    });
}

// 初始化resultTypes
function initResultTypes(){
    for (let i = 0; i < MONTH; i++) {
        let tempMonth = [];
        for (let j = 0; j < DAY; j++) {
            let tempDay = [];
            for (let k = 0; k < HALF; k++) {
                let result = {};
                result["代开发票"] = 0;
                result["特殊服务"] = 0;
                result["催债贷款"] = 0;
                result["办证刻章"] = 0;
                result["赌博麻将"] = 0;
                result["违规收分和车辆"] = 0;

                // result["苹果诈骗"] = 0
                // result["票务诈骗"] = 0
                // result["银行诈骗"] = 0
                // result["运营商诈骗"] = 0
                result["各类诈骗"] = 0;

                result["房产广告"] = 0;
                result["招聘信息"] = 0;
                // result["驾校信息"] = 0        驾校信息合并进其他广告
                // result["伪基站本身广告"] = 0   伪基站本身广告归入其他广告
                result["其他广告"] = 0;

                result["造谣诽谤诅咒"] = 0;
                // result["信息丢失"] = 0        信息丢失与无用信息合并
                // result["无用信息"] = 0
                result["无用或丢失"] = 0;
                
                tempDay.push(result);
            }
            tempMonth.push(tempDay);
        }
        resultTypes.push(tempMonth);
    }
}

// 初始化typedMessages
function initTypedMessages(){
    // 包含两个字段，一个是type，代表类型
    //             一个是message，代表原数据
    for(let i = 0; i < MONTH; i++){
        let tempMonth = [];
        for(let j = 0; j < DAY; j++){
            let tempDay = [];
            for(let k = 0; k < HALF; k++){
                let result = [];
                tempDay.push(result);
            }
            tempMonth.push(tempDay);
        }
        typedMessages.push(tempMonth);
    }
}

function initInitialPaths(){
    // 生成所有原始文件的路径
    pathGenerate(2, 23, 28, initialPaths);
    pathGenerate(3,  1, 31, initialPaths);
    pathGenerate(4,  1, 26, initialPaths);
}

// 初始化所需要的数组，创建结果文件夹
function init(){
    initResultTypes();
    initTypedMessages();
    initInitialPaths();
    createDirs();
}

function process(jsonArray){
    let curr_month = 0;
    let curr_date  = 0;

    for(let json of jsonArray){
        let content = json.content;
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

        // if(content.includes('清零'))
            // console.log(content);
        const result_part = nodejieba.extract(content, 20);
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
            
            if(participle[word])
                participle[word]++;
            else
                participle[word] = 1;
        })
        continue;

        let timeObj = new Date(parseInt(json.recitime));
        let    year = timeObj.getFullYear();
        let   month = timeObj.getMonth() + 1;
        let    date = timeObj.getDate();
        let    hour = timeObj.getHours();
        let  minute = timeObj.getMinutes();
        let  second = timeObj.getSeconds();

        let half_idx = (minute < 30) ? hour * 2 : hour * 2 + 1;
        if(year !== 2017)
            continue;
        
        curr_month = month;
        curr_date  = date;

        let resultType = resultTypes[month - 2][date - 1][half_idx];
        let typedMessage = typedMessages[month - 2][date - 1][half_idx];
        let tempMessage = {}

        if(hasWord(content, ["票据", "发票", "代开", "增值", "开票", "规嘌", "發票", "税票", "fa", "piao", "税", "点低"])){
            resultType["代开发票"] += 1;
            tempMessage["type"] = "代开发票";
        }
        else if(hasWord(content, ["美女", "上门女", "SPA", "学生妹", "妹妹", "情趣", "上门服务", "上门小姐", "性爱", "男人请加我", "男人加我"])){
            resultType["特殊服务"] += 1;
            tempMessage["type"] = "特殊服务";
        }
        else if(hasWord(content, ["信用卡", "工行", "光大", "银行", "额度", "积分"])){
            resultType["各类诈骗"] += 1;
            tempMessage["type"] = "各类诈骗";
        }
        else if(hasWord(content, ["首付", "三居", "现房", "旺铺", "电梯房", "黄金地段", "海景房", "宜居", "楼房", "公寓", "配套齐全", "房源", "居室", "洋房", "农家院", "学区", "大盘", "小院", "看房", "每平", "面积", "平米", "楼盘", "位置好", "户型"])){
            resultType["房产广告"] += 1;
            tempMessage["type"] = "房产广告";
        }
        else if(hasWord(content, ["贷", "借款", "资金", "pos", "欠款", "债款", "利息", "放款", "追债", "要钱", "债务", "催收", "拿钱", "用钱", "套现", "提现", "融聚"])){
            resultType["催债贷款"] += 1;
            tempMessage["type"] = "催债贷款";
        }
        else if(hasWord(content, ["办证", "证件", "报销", "刻章", "资格证", "印章", "长期办理", "毕业证", "下证", "㊣件", "免考试", "保真"])){
            resultType["办证刻章"] += 1;
            tempMessage["type"] = "办证刻章";
        }
        else if(hasWord(content, ["麻将", "牌", "百家乐", "投注", "线上娱乐", "网上娱乐", "澳門", "澳门", "博彩", "低风险", "赌", "投註", "输完"])){
            resultType["赌博麻将"] += 1;
            tempMessage["type"] = "赌博麻将";
        }
        else if(hasWord(content, ["Apple", "苹果", "iPhone", "丢失"])){
            resultType["各类诈骗"] += 1;
            tempMessage["type"] = "各类诈骗";
        }
        else if(hasWord(content, ["航空", "铁路"])){
            resultType["各类诈骗"] += 1;
            tempMessage["type"] = "各类诈骗";
        }
        else if(hasWord(content, ["急招", "招聘", "招人", "招工"])){
            resultType["招聘信息"] += 1;
            tempMessage["type"] = "招聘信息";
        }
        else if(hasWord(content, ["绿帽子","王八蛋","见阎王", "破坏家庭","中共","江泽民", "回电话", "爱人", "睡了", "逼", "妈", "你家女人", "操过", "打不通", "迫害", "傻逼", "侵犯", "触犯", "谴责", "祖宗", "操你", "不讲","死", "自己瞧瞧", "停电"])){
            resultType["造谣诽谤诅咒"] += 1;
            tempMessage["type"] = "造谣诽谤诅咒";
        }
        else if(hasWord(content, ["驾驶证分", "车辆", "报废"])){
            resultType["违规收分和车辆"] += 1;
            tempMessage["type"] = "违规收分和车辆";
        }
        else if(hasWord(content, ["驾校"])){
            resultType["其他广告"] += 1;
            tempMessage["type"] = "其他广告";
        }
        else if(hasWord(content, ["清零", "语音信箱", "密码", "充值", "咨询", "资费", "套餐"]) && (hasWord(content, ["移动", "联通", "电信"])) || (hasWord(content, ["流量"]))){
            resultType["各类诈骗"] += 1;
            tempMessage["type"] = "各类诈骗";
        }
        else if(hasWord(content, ["积分", "解锁", "换微信", "验证码", "给我汇钱", "转发消息", "信誉", "闲鱼", "奖励", "分享", "获奖", "中奖", "福利", "邀请函", "违章", "淘宝", "敢死队", "现金券", "冻结", "异常", "维护", "激活", "拨打过", "彩铃", "来电提醒", "会议", "高回报", "简历", "股", "操盘", "滴滴"]) || (hasWord(content, ["获得"]) && hasWord(content, ["机会"]))){
            resultType["各类诈骗"] += 1;
            tempMessage["type"] = "各类诈骗";
        }
        else if(hasWord(content, ["群发", "指哪发哪", "推广信息"])){
            resultType["其他广告"] += 1;
            tempMessage["type"] = "其他广告";
        }
        else if(hasWord(content, ["无法显示", "信息丢失", "文本丢失"])){
            resultType["无用或丢失"] += 1;
            tempMessage["type"] = "无用或丢失";
        }
        else if(hasWord(content, ["恭喜发财", "注意防火", "你好", "送去", "WARNING", "挪走车", "小白", "fb", "经理"]) || content.length <= 20){
            resultType["无用或丢失"] += 1;
            tempMessage["type"] = "无用或丢失";
        }
        else{
            resultType["其他广告"] += 1;
            tempMessage["type"] = "其他广告";
        }

        tempMessage["md5"]      = json.md5;
        tempMessage["content"]  = content;
        tempMessage["phone"]    = json.phone;
        tempMessage["conntime"] = json.conntime;
        tempMessage["recitime"] = json.recitime;
        tempMessage["lng"]      = json.lng;
        tempMessage["lat"]      = json.lat;
        typedMessage.push(tempMessage);

        let cnt = 0;
        Object.keys(resultType).forEach((key) => {
            cnt += resultType[key];
        });
    }

    // for(let i = 0; i < HALF; i++){
    //     let type_path = Path.join(__dirname, 'results', `month${curr_month}`, `day${curr_date}`, `${i}.txt`);
    //     let  msg_path = Path.join(__dirname, 'results', `month${curr_month}`, `day${curr_date}`, `msg${i}.txt`);

    //     let resultType = resultTypes[curr_month - 2][curr_date - 1][i];
    //     resultType = Object.keys(resultType).map((key) => {
    //         return {
    //             type: key,
    //             value: resultType[key]
    //         };
    //     })

    //     if(!fs.existsSync(type_path))
    //         fs.writeFileSync(type_path, JSON.stringify(resultType));
    //     if(!fs.existsSync(msg_path))
    //         fs.writeFileSync(msg_path , JSON.stringify(typedMessages[curr_month - 2][curr_date - 1][i]));

    //       resultTypes[curr_month - 2][curr_date - 1][i] = null;
    //     typedMessages[curr_month - 2][curr_date - 1][i] = null;

    //     console.log(`month_${curr_month} day_${curr_date} half_${i} completed!`);
    // }
}

init();
// 同步处理每一个文件，异步处理会导致栈溢出
let cnt = 0;
(async () =>{
    let ii = 0;
    for(let path of initialPaths){
        const jsonArray = await csv().fromFile(path);
        process(jsonArray);
        ii++;
        cnt += jsonArray.length;
        console.log(ii + ': ' + Object.keys(participle).length);
    }
    let temp = [];
    Object.keys(participle).forEach(item => {
        temp.push({
            key: item,
            value: participle[item]
        });
    })
    temp.sort((a, b) => {
        return b.value - a.value;
    })

    for(let i = 0; i < 100; i++)
        console.log(temp[i]);
})();