const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499
const DEFAULT_OPTIONS = {
  policyGroup: 'Netflix',
}

let panel = {
  title: 'Netflix 策略选择',
}
let options = getOptions()

;(async () => {
  let { policyGroup } = options
  let allPolicyGroups = await httpAPI('/v1/policy_groups')
  let policies = allPolicyGroups?.[policyGroup] ?? []
  if (policies.length === 0) {
    return
  }

  let fullUnlockPolicy = undefined
  let onlyOriginalPolicy = undefined

  /**
   * 测试当前选择节点的解锁状态
   */
  let selectedPolicy = (await httpAPI('/v1/policy_groups/select', { group_name: encodeURIComponent(policyGroup) }))?.policy ?? ''
  let { status, regionCode, policyName } = await testPolicy(selectedPolicy)

  if (status === 2) {
    fullUnlockPolicy = { regionCode, policyName }
  } else if (status === 1) {
    onlyOriginalPolicy = { regionCode, policyName }
  }

  if (status !== 2) {
    for (let policy of policies) {
      // 测过了，跳过测试
      if (policy.name === selectedPolicy) {
        continue
      }

      let success = await switchPolicy(policyGroup, policy.name)
      if (success) {
        // 切换成功后等待 1s
        await timeout(1000).catch(() => {})
        let { status, regionCode, policyName } = await testPolicy(policy.name)
        // 找到第一个仅支持自制剧的节点
        if (status === 1 && onlyOriginalPolicy == null) {
          onlyOriginalPolicy = { regionCode, policyName }
        } else if (status === 2) {
          // 找到第一个完整解锁的节点后不在尝试切换节点
          fullUnlockPolicy = { regionCode, policyName }
          break
        }
      }
    }
  }

  // 找到完整解锁的节点
  if (fullUnlockPolicy) {
    panel['content'] = `${fullUnlockPolicy.policyName} 完整支持 Netflix，解锁区域：${fullUnlockPolicy.regionCode}`
    panel['style'] = 'good'
    return
  }

  // 如果没有找到完整解锁的节点，则选择一个解释自制剧的节点
  if (!fullUnlockPolicy && onlyOriginalPolicy) {
    let success = await switchPolicy(policyGroup, onlyOriginalPolicy.policyName)
    if (!success) {
      panel['content'] = `没有完整解锁的策略，且切换至解锁自制剧的策略失败`
      panel['style'] = 'error'
      return
    }

    panel['content'] = `没有完整解锁的策略，切换至解锁自制剧的策略：${onlyOriginalPolicy.policyName}`
    panel['style'] = 'info'
    return
  }

  // 没有支持解锁的节点，则切换回原来的策略
  await switchPolicy(policyGroup, selectedPolicy)
  panel['content'] = `没有支持整解锁的策略`
  panel['style'] = 'error'
})()
  .catch(error => {
    console.log(error)
  })
  .finally(() => {
    $done(panel)
  })

function httpAPI(path, body, method = 'GET') {
  return new Promise(resolve => {
    $httpAPI(method, path, body, data => {
      resolve(data)
    })
  })
}

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

async function switchPolicy(groupName, policyName) {
  let data = await httpAPI('/v1/policy_groups/select', { group_name: groupName, policy: policyName }, 'POST')
  if (data?.error) {
    console.log(`${groupName} 切换策略：${policyName} 失败，error: ${data.error}`)
    return false
  }
  console.log(`${groupName} 切换策略：${policyName} 成功`)
  return true
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
