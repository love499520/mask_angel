$httpClient.get("http://ip-api.com/json", function(error, response, data){
    let pa = $network.v4.primaryAddress
    let ssid = $network.wifi.ssid
    let router = $network.v4.primaryRouter
    let radio = $network["cellular-data"].radio
    let v6 = $network.v6.primaryAddress
    let jsonData = JSON.parse(data)
    let ip = jsonData.query
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    var regex=/^192.168/
    if(regex.test(pa)){
        $done({
  title: "IP Information",
  ‵content‵: SSID: ${ssid}\nIP: ${ip}\nIPv6: ${v6}\nRouter: ${router}\nLocal IP: ${pa}\nISP: ${isp}\n位置: ${emoji}${country} - ${city},
        icon: "wifi",
        'icon-color': "#0EEA3B"
 });
    }else{
        $done({
  title: "IP Information",
  ‵content‵: Radio: ${radio}\nIP: ${ip}\nIPv6: ${v6}\nLocal IP: ${pa}\nISP: ${isp}\n位置: ${emoji}${country} - ${city},
        icon: "simcard.fill",
        'icon-color': "#EA0300"
 });}
});

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
