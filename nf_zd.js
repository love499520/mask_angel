/*	脚本经本人测试已经可以正常运行，但仍可能存在bug，使用过程中遇到障碍请联系Telegram：https://t.me/okmytg
脚本说明：
	0:https://raw.githubusercontent.com/fishingworld/something/main/netflixAutoselect.sgmudole
        1:本脚本修改自 @Helge_0x00 
	2:脚本在自动更新时刷新持久化数据（可解锁节点列表），你可以在日志内查看这些数据
	3:为了节省效能，请尽量精简策略组
	4:点击panel时切换至下一个可解锁节点
	5:检测数据有一定概率会出错，且网飞数据会有所变动，因此你可能遇到切换至非全解锁节点，此时切换至下一个即可，毕竟这是概率较小的事件，大部分检测都是正确的，待下一次自动更新时，节点列表将得到更新与修正
	6:可用的自定义参数：
	icon1 color1:全解锁时的图标及颜色
	icon2 color2:仅自制时的图标及颜色
	icon3 color3:无可用节点的图标及颜色
	netflixGroup：网飞策略组名称
*/




const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499
let params = getParams($argument)

;(async () => {
let netflixGroup = params.netflixGroup
let proxy = await httpAPI("/v1/policy_groups");
let groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(netflixGroup)+"")).policy;
let first = groupName;
var proxyName= [];//netflix节点组名称
let arr = proxy[""+netflixGroup+""];
for (let i = 0; i < arr.length; ++i) {
proxyName.push(arr[i].name);
}


/**
   * 遍历测试节点组
   */

//读取持久化数据

var fullUnlock=[];
var onlyOriginal=[];

fullUnlock = $persistentStore.read("fullUnlockNetflix").split(",");
onlyOriginal= $persistentStore.read("onlyOriginalNetflix").split(",");


//仅自动更新时遍历

if($trigger == "auto-interval"){

for (let i = 0; i < proxyName.length; ++i) {
//切换节点
$surge.setSelectGroupPolicy("Netflix", proxyName[i]);
//等待
await timeout(1000).catch(() => {})
//执行测试

let { status, regionCode, policyName } = await testPolicy(proxyName[i]);

//填充与修正数据
if(status===2){
	if(fullUnlock.includes(proxyName[i])==false){
	fullUnlock.push(proxyName[i])
	onlyOriginal.splice(onlyOriginal.indexOf(proxyName[i]), 1)
		}
	}else if(status===1){
		if(onlyOriginal.includes(proxyName[i])==false){
		onlyOriginal.push(proxyName[i])
		fullUnlock.splice(fullUnlock.indexOf(proxyName[i]), 1)
		}
	}else{
		onlyOriginal.splice(onlyOriginal.indexOf(proxyName[i]), 1)
		fullUnlock.splice(fullUnlock.indexOf(proxyName[i]), 1)
		}
  }
}

//打印测试结果

console.log("全解锁："+fullUnlock. sort())
console.log("自制："+onlyOriginal. sort())

// 创建持久化数据
$persistentStore.write(fullUnlock.toString(),"fullUnlockNetflix");
$persistentStore.write(onlyOriginal.toString(),"onlyOriginalNetflix")


/**
   * 切换节点
   */

//删除策略组外节点并更新持久化数据
var select=[];
if(fullUnlock.length>0){
	for (let i = 0; i < fullUnlock.length; ++i) {
	
	if(proxyName.includes(fullUnlock[i])==true){
		select.push(fullUnlock[i])
		}
	}
	$persistentStore.write(select.sort().toString(),"fullUnlockNetflix");
}else if(fullUnlock.length==0&&onlyOriginal.length>0){
	for (let i = 0; i < onlyOriginal.length; ++i) {

	if(proxyName.includes(onlyOriginal[i])==true){
		select.push(fullUnlock[i])
		}
	}
	$persistentStore.write(select.sort().toString(),"onlyOriginalNetflix")
}



//当前节点
groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(netflixGroup)+"")).policy;


//轮循切换
let index = select.indexOf(groupName)+1;

if(index>=select.length){
	index=0
}

$surge.setSelectGroupPolicy("Netflix", select[index]);

//测试当前选择

await timeout(1000).catch(() => {})

let { status, regionCode, policyName } = await testPolicy(select[index]);



/**
   * 面板显示
   */

let title = "Netflix ➟ " + select[index];

let panel = {
  title: `${title}`,
}

  // 完整解锁
  if (status==2) {
    panel['content'] = `完整解锁 🎬 𝑵𝒆𝒕𝒇𝒍𝒊𝒙 𝑷𝒓𝒆𝒎𝒊𝒖𝒎，区域：${regionCode}`
    panel['icon'] = params.icon1
	 panel['icon-color'] = params.color1
  } else if (status==1) {
      panel['content'] = `仅支持解锁 🎬 𝑵𝒆𝒕𝒇𝒍𝒊𝒙 自制剧`
      panel['icon'] = params.icon2
	   panel['icon-color'] = params.color2
    }else {
 		$surge.setSelectGroupPolicy("Netflix", first);
  		panel['content'] = `不支持解锁 🎬 𝑵𝒆𝒕𝒇𝒍𝒊～`
  		panel['icon'] = params.icon3
	 	panel['icon-color'] = params.color3
		return
	}

    $done(panel)


})();





function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

async function testPolicy(policyName) {
  try {
    const regionCode = await Promise.race([testFilm(FILM_ID), timeout(3000)])
    return { status: 2, regionCode, policyName }
  } catch (error) {
    if (error === 'Not Found') {
      return { status: 1, policyName }
    }
    if (error === 'Not Available') {
      return { status: 0, policyName }
    }
    console.log(error)
    return { status: -1, policyName }
  }
}

/**
 * 测试是否解锁
 */
function testFilm(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: `https://www.netflix.com/title/${filmId}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject(error)
        return
      }

      if (response.status === 403) {
        reject('Not Available')
        return
      }

      if (response.status === 404) {
        reject('Not Found')
        return
      }

      if (response.status === 200) {
        let url = response.headers['x-originating-url']
        let region = url.split('/')[3]
        region = region.split('-')[0]
        if (region == 'title') {
          region = 'us'
        }
        resolve(region.toUpperCase())
        return
      }

      reject('Error')
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function getOptions() {
  let options = Object.assign({}, DEFAULT_OPTIONS)
  if (typeof $argument != 'undefined') {
    try {
      let params = Object.fromEntries(
        $argument
          .split('&')
          .map(item => item.split('='))
          .map(([k, v]) => [k, decodeURIComponent(v)])
      )
      Object.assign(options, params)
    } catch (error) {
      console.error(`$argument 解析失败，$argument: + ${argument}`)
    }
  }

  return options
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
