const veid = "key";
const api_key = "privatekey";
let url = "https://api.64clouds.com/v1/getServiceInfo?veid="+veid+"&api_key="+api_key;
$httpClient.get(url, function(error, response, data){
let resp = JSON.parse(data)
    let data_next_reset = resp["data_next_reset"];
    let datares = (resp["data_counter"] / (1024 * 1024 * 1024)).toFixed(2);
    let datatotal = (resp["plan_monthly_data"] / (1024 * 1024 * 1024)).toFixed(0);
    let reset = redate(data_next_reset);
        if(parseFloat(datares)<parseFloat(100)){
            Color = `#00FF00`;
        }else if(parseFloat(datares)<parseFloat(200)){
            Color = `#00FFFF`;
        }else if(parseFloat(datares)<parseFloat(300)){
            Color = `#0000FF`;
        }else if(parseFloat(datares)<parseFloat(400)){
            Color = `#FFFF00`;
        }else if(parseFloat(datares)<parseFloat(500)){
            Color = `#FF0000`;
        }else{
            Color = `#C0C0C0`;
        };
            $done({
            title: "𝔅𝔞𝔫𝔡𝔴𝔞𝔤𝔬𝔫 ℌ𝔬𝔰𝔱",
            icon: "externaldrive.fill.badge.icloud",
            'icon-color': `${Color}`,
            content: "Data：   " + datares + "/"+datatotal+"G\n"+"Reset： " + reset + "\nExpired: Sunday, May 29th, 2022"
            });
});
function redate(datein) {
    let da = new Date(datein * 1000);
    let year = da.getFullYear();
    let month = da.getMonth() + 1;
    let date = da.getDate();
    return [year, month, date].join("-");
}
