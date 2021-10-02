var 中国电信 = ['460-03','460-05','460-11'];
var 中国联通 = ['460-01','460-06','460-09'];
var 中国移动 = ['460-00','460-02','460-04','460-07','460-08'];
var 中国广电 = ['460-15'];
var 中国铁通 = ['460-20'];
$httpClient.get("http://ip-api.com/json/", function(error, response, data){
    let jsonData = JSON.parse(data)
    let wlanisp = jsonData.isp
    let query = jsonData.query
    let directemoji = getFlagEmoji(jsonData.countryCode)
$httpClient.get("http://ipwhois.app/json/", function(error, response, data){
    let v4 = $network.v4.primaryAddress
    let ssid = $network.wifi.ssid
    let carrier = $network["cellular-data"].carrier
    let router = $network.v4.primaryRouter
    let radio = $network["cellular-data"].radio
    let v6 = $network.v6.primaryAddress
    let jsonData = JSON.parse(data)
    let ip = jsonData.ip
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.country_code)
    let city = jsonData.city
    let isp = jsonData.isp
    var regex=/^192.168/
    if(regex.test(v4)){
        if(ip === query){
            $done({
            title: `${wlanisp}: ${ssid}`,
	    content: `IP: ${ip}\nRouter: ${router}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}`,
            icon: "wifi",
            'icon-color': "#00FF00"
	    });
        }else{
            $done({
            title: `${wlanisp}: ${ssid}`,
	    content: `IP: ${ip}\nRouter: ${router}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}\nDirect IP: ${directemoji}${query}`,
            icon: "wifi",
            'icon-color': "#00FF00"
	    });
        }
    }else if(radio === null){
        if(ip === query){
            $done({
	    title: `Hotspot`,
	    content: `IP: ${ip}\nRouter: ${router}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}`,
            icon: "personalhotspot",
            'icon-color': "#0000FF"
	    });
        }else{
            $done({
	    title: `Hotspot`,
	    content: `IP: ${ip}\nRouter: ${router}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}\nDirect IP: ${directemoji}${query}`,
            icon: "personalhotspot",
            'icon-color': "#0000FF"
	    });
        }
    }else{
        if(中国电信.includes(carrier)){
            运营商 = "China Telecom";
        }else if(中国联通.includes(carrier)){
            运营商 = "China Unicom";
        }else if(中国移动.includes(carrier)){
            运营商 = "China Mobile";
        }else if(中国广电.includes(carrier)){
            运营商 = "China Broadcasting Network";
        }else if(中国铁通.includes(carrier)){
            运营商 = "China Tietong";
        }else{
            运营商 = "𝓜𝓸𝓫𝓲𝓵𝓮 𝓝𝓮𝓽𝔀𝓸𝓻𝓴";
        }
        if(ip === query){
            $done({
            title: 运营商,
            content: `Radio: ${radio}\nIP: ${ip}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}`,
            icon: "antenna.radiowaves.left.and.right",
            'icon-color': "#EA0300"
	    });
        }else{
            $done({
            title: 运营商,
            content: `Radio: ${radio}\nIP: ${ip}\nLocal IP: ${v4}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}\nDirect IP: ${directemoji}${query}`,
            icon: "antenna.radiowaves.left.and.right",
            'icon-color': "#EA0300"
	    });
        }
    }
});
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};
function getFlagEmoji(country_code) {
    const codePoints = country_code
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}});
