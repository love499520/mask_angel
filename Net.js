/**
* https://raw.githubusercontent.com/love499520/Surge-1/main/Panel/Network-Info/Network-Info_test.sgmodule
* Surge 網路詳情面板
* 本人 @Nebulosa-Cat僅翻譯為繁體中文自用
* Net Info 面板模組原始作者 @author: Peng-YM
* 並與另一位 聰聰大佬(@congcong) 大的節點資訊面板進行整合
* 並且感謝Pysta大佬、野比大佬(@NobyDa)、皮樂大佬(@Hiraku)技術支援
* 以及鴿子大佬(@zZPiglet)精簡化code
*/
const { wifi, v4 } = $network;
const ip = v4.primaryAddress;

// No network connection
if (!ip) {
    $done({
      title: 'Network Info Panel',
      content: '没有网络\n请检查网络',
      icon: 'wifi.exclamationmark',
      'icon-color': '#CB1B45',
    });
  }
else{
  $httpClient.get('http://ip-api.com/json', function (error, response, data) {
    const jsonData = JSON.parse(data);
    $done({
      title: wifi.ssid ? wifi.ssid : '蜂窝数据',
      content:
        `內部 IP：${ip} \n` +
        (wifi.ssid ? `路由器地址：${v4.primaryRouter}\n` : '') +
        `外部 IP：${jsonData.query}\n` +
        `节点 ISP : ${jsonData.isp}\n` +
        `节点位置 : ${getFlagEmoji(jsonData.countryCode)} ${jsonData.country} | ${jsonData.city}`,
      icon: wifi.ssid ? 'wifi' : 'simcard',
      'icon-color': wifi.ssid ? '#005CAF' : '#F9BF45',
    });
  });
};

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
