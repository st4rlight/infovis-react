export const intToTimeSpan = (index) => {
    if(index % 2 === 0)
        return `${index / 2}:00-${index / 2}:30`;
    else
        return `${parseInt(index / 2)}:30-${(parseInt(index / 2) + 1)}:00`;
};

export const colors = {
    "各类诈骗": "#ff404a", //红
    "代开发票": "#5ca0f2", //蓝
    "办证刻章": "#8fd16f", //绿
    "特殊服务": "#F7D94C", //黄
    "其他广告": "#8A6BBE", //橙
    "房产广告": "#ff881d", //紫
    "招聘信息": "#92c9ff", //淡蓝
    "催债贷款": "#108757", //深绿
    "赌博麻将": "#E87A90", //粉
    "造谣诽谤诅咒": "#D0104C", //深红
    "无用或丢失": "#91989F", //灰
    "违规收分和车辆": "#B17844" //棕色
}