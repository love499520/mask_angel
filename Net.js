/**
* Surge 網路詳情面板
* 本人 @Nebulosa-Cat僅翻譯為繁體中文自用
* Net Info 面板模組原始作者 @author: Peng-YM
* 並與另一位 聰聰大佬(@congcong) 大的節點資訊面板進行整合
* 並且感謝Pysta大佬、野比大佬(@NobyDa)、皮樂大佬(@Hiraku)技術支援
* 以及鴿子大佬(@zZPiglet)精簡化code
*/
const { wifi, v4, v6 } = $network;

// No network connection
if (!v4.primaryAddress && !v6.primaryAddress) {
    $done({
      title: 'Network Info Panel',
      content: '尚未連接網際網路\n請檢查網際網路狀態後再度測試',
      icon: 'wifi.exclamationmark',
      'icon-color': '#CB1B45',
    });
  }
else{
  $httpClient.get('http://ip-api.com/json', function (error, response, data) {
    const jsonData = JSON.parse(data);
    $done({
      title: wifi.ssid ? wifi.ssid : '行動數據',
      content:
        `IP 位址：${v4.primaryAddress} \n` +
        `IPv6 位址 : ${v6.primaryAddress}\n` +
        (wifi.ssid ? `Router v4 : ${v4.primaryRouter}\n` : '') +
        (wifi.ssid ? `Router v6 : ${v6.primaryRouter}\n` : '') +
        `節點 IP 位址 : ${jsonData.query}\n` +
        `節點 ISP : ${jsonData.isp}\n` +
        `節點位置 : ${getFlagEmoji(jsonData.countryCode)} ${jsonData.country} | ${jsonData.city}`,
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
