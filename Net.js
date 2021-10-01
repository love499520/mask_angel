/**
 * https://raw.githubusercontent.com/Nebulosa-Cat/Surge/main/Panel/Network-Info/test-version/networkCheck_test.js
 * Surge 網路詳情面板
 * @Nebulosa-Cat
 * 詳情請見 README
 */
const { wifi, v4, v6 } = $network;

let carrierName = '';
const carrierNames = {
  //台湾电信运营商 MNC Code
  '466-11': '中华电信','466-92': '中华电信',
  '466-01': '远传电信','466-03': '远传电信',
  '466-97': '台湾大哥大',
  '466-89': '台湾之星',
  '466-05': '亚太电信',
  //中国电信运营商 MNC Code
  '460-03': '中国电信','460-05': '中国电信','460-11': '中国电信',
  '460-01': '中国联通','460-06': '中国联通','460-09': '中国联通',
  '460-00': '中国移动','460-02': '中国移动','460-04': '中国移动','460-07': '中国移动','460-08': '中国移动',
  '460-15': '中国广电',
  '460-20': '中国铁通',
};

if (!v4.primaryAddress && !v6.primaryAddress) {
  $done({
    title: '没有网络',
    content: '网络未连接\n请检查网络',
    icon: 'wifi.exclamationmark',
    'icon-color': '#CB1B45',
  });
} else {
  if ($network['cellular-data']) {
    const carrierId = $network['cellular-data'].carrier;
    const radio = $network['cellular-data'].radio;
    if (carrierId && radio) {
      carrierName = carrierNames[carrierId] ? ' - ' + carrierNames[carrierId] + ' ' + radio : ' - ' + radio;
    }
  }
  $httpClient.get('http://ip-api.com/json', function (error, response, data) {
    if (error) {
      $done({
        title: '发生错误',
        content: '无法连接到网络\n请检查网络状态',
        icon: 'wifi.exclamationmark',
        'icon-color': '#CB1B45',
      });
    }
    
    const info = JSON.parse(data);
    $done({
      title: wifi.ssid ? wifi.ssid : '蜂窝数据' + carrierName,
      content:
        (v4.primaryAddress ? `IPv4 : ${v4.primaryAddress} \n` : '') +
        (v6.primaryAddress ? `IPv6 : ${v6.primaryAddress}\n` : '') +
        (v4.primaryRouter && wifi.ssid
          ? `Router IPv4 : ${v4.primaryRouter}\n`
          : '') +
        (v6.primaryRouter && wifi.ssid
          ? `Router IPv6 : ${v6.primaryRouter}\n`
          : '') +
        `节点 IP : ${info.query}\n` +
        `节点 ISP : ${info.isp}\n` +
        `节点位置 : ${getFlagEmoji(info.countryCode)} | ${info.country} - ${
          info.city
        }`,
      icon: wifi.ssid ? 'wifi' : 'simcard',
      'icon-color': wifi.ssid ? '#005CAF' : '#F9BF45',
    });
  });
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
